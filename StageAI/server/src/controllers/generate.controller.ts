import { Request, Response } from 'express';
import fs from 'fs';

// ─── Shared Helpers ─────────────────────────────────────────────────────────

function validateApiKey(): string | null {
    const key = process.env.FREEPIK_API_KEY;
    if (!key || key.includes('PLACE_YOUR')) return null;
    return key;
}

function readFileAsBase64(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return content.toString('base64');
}

function cleanupFile(filePath: string | undefined): void {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

interface FreepikTaskResult {
    task_id: string;
}

interface FreepikPollResult {
    status: string;
    generated?: Array<string | { url: string }>;
}

async function startFreepikTask(payload: Record<string, unknown>, apiKey: string): Promise<string> {
    const API_URL = 'https://api.freepik.com/v1/ai/mystic';

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': apiKey,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Freepik API failed to start: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as { data: FreepikTaskResult };
    const taskId = result.data?.task_id;

    if (!taskId) {
        throw new Error('Freepik API did not return a task_id');
    }

    return taskId;
}

async function pollFreepikTask(taskId: string, apiKey: string): Promise<string> {
    const API_URL = 'https://api.freepik.com/v1/ai/mystic';
    let status = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 30;

    while (status === 'IN_PROGRESS' || status === 'PENDING') {
        await new Promise((r) => setTimeout(r, 2000));
        attempts++;

        if (attempts > maxAttempts) {
            throw new Error('Freepik API timed out (60s)');
        }

        const pollResponse = await fetch(`${API_URL}/${taskId}`, {
            method: 'GET',
            headers: { 'x-freepik-api-key': apiKey },
        });

        if (!pollResponse.ok) {
            throw new Error(`Freepik Polling failed: ${pollResponse.status}`);
        }

        const pollData = (await pollResponse.json()) as { data: FreepikPollResult };
        status = pollData.data?.status ?? 'UNKNOWN';
        console.log(`Poll ${attempts}: ${status}`);

        if (status === 'COMPLETED') {
            const generated = pollData.data?.generated;
            if (Array.isArray(generated) && generated.length > 0) {
                const first = generated[0];
                if (typeof first === 'string') return first;
                if (typeof first === 'object' && first.url) return first.url;
            }
        } else if (status === 'FAILED') {
            throw new Error('Freepik API Task FAILED');
        }
    }

    throw new Error('Freepik API completed but returned no image URL');
}

// ─── Room / Style Label Maps ────────────────────────────────────────────────

const ROOM_LABELS: Record<string, string> = {
    living_room: 'living room',
    bedroom: 'bedroom',
    kitchen: 'kitchen',
    bathroom: 'bathroom',
    dining_room: 'dining room',
    home_office: 'home office',
    terrace: 'terrace',
    entrance: 'entrance hall',
    kids_room: 'kids room',
    walk_in_closet: 'walk-in closet',
    gaming_room: 'game room',
    patio: 'patio',
};

const STYLE_LABELS: Record<string, string> = {
    modern: 'modern',
    scandinavian: 'scandinavian',
    classic: 'classic traditional',
    minimalist: 'minimalist',
    industrial: 'industrial loft',
    contemporary: 'contemporary',
    rustic: 'rustic farmhouse',
    coastal: 'coastal beach house',
    mediterranean: 'mediterranean',
    chilean_modern: 'chilean modern with natural materials',
    luxury: 'luxury',
    bohemian: 'bohemian',
    japandi: 'japandi',
    art_deco: 'art deco',
    mid_century_modern: 'mid-century modern',
    cyberpunk: 'cyberpunk futuristic',
    neoclassic: 'neoclassical',
};

function getRoomLabel(room: string): string {
    return ROOM_LABELS[room] ?? room.replace(/_/g, ' ');
}

function getStyleLabel(style: string): string {
    return STYLE_LABELS[style] ?? style.replace(/_/g, ' ');
}

// ─── Endpoint: Virtual Staging (empty room -> furnished) ────────────────────

export const generateImage = async (req: Request, res: Response) => {
    try {
        const apiKey = validateApiKey();
        if (!apiKey) {
            return res.status(500).json({
                error: 'Server Configuration Error',
                details: 'Missing or invalid FREEPIK_API_KEY in .env.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { room = 'living_room', style = 'modern' } = req.body;
        const roomLabel = getRoomLabel(room);
        const styleLabel = getStyleLabel(style);

        console.log(`[STAGE] Processing: ${roomLabel} - ${styleLabel}`);

        const base64Image = readFileAsBase64(req.file.path);

        const payload = {
            prompt: `Professional real estate photo of a beautifully furnished ${roomLabel} in ${styleLabel} style. Photorealistic interior design, professional lighting, high-end furniture perfectly scaled to room dimensions. Preserve room architecture, windows, walls and floor layout exactly. Brand new stylish furniture, decluttered, spacious, warm ambiance, architectural digest quality, 8k resolution`,
            structure_reference: base64Image,
            structure_strength: 40,
            resolution: '2k',
            aspect_ratio: 'square_1_1',
            negative_prompt: 'blocking windows, changing windows, bricked up windows, new walls, clutter, messy, trash, debris, longbody, lowres, watermark, text, blurry, distorted',
        };

        const taskId = await startFreepikTask(payload, apiKey);
        console.log(`[STAGE] Task started: ${taskId}`);

        const resultUrl = await pollFreepikTask(taskId, apiKey);
        cleanupFile(req.file.path);

        res.json({
            success: true,
            message: 'Image generated successfully with Freepik Mystic',
            resultImage: resultUrl,
            mode: 'stage',
        });
    } catch (error: unknown) {
        console.error('[STAGE] Error:', error);
        cleanupFile(req.file?.path);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to generate image', details: errorMessage });
    }
};

// ─── Endpoint: Furniture Removal (furnished -> empty) ───────────────────────

export const removeFurniture = async (req: Request, res: Response) => {
    try {
        const apiKey = validateApiKey();
        if (!apiKey) {
            return res.status(500).json({
                error: 'Server Configuration Error',
                details: 'Missing or invalid FREEPIK_API_KEY in .env.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { room = 'living_room' } = req.body;
        const roomLabel = getRoomLabel(room);

        console.log(`[REMOVE] Processing: ${roomLabel}`);

        const base64Image = readFileAsBase64(req.file.path);

        const payload = {
            prompt: `Empty ${roomLabel} with clean walls and pristine floors, absolutely no furniture, no decorations, no objects on the floor. Professional real estate photography of a completely vacant room. Clean, bright, well-lit empty space ready for staging. Photorealistic, 8k, architectural photography`,
            structure_reference: base64Image,
            structure_strength: 55,
            resolution: '2k',
            aspect_ratio: 'square_1_1',
            negative_prompt: 'furniture, sofa, table, chair, bed, desk, shelf, cabinet, rug, decoration, plants, objects, clutter, watermark, text, blurry',
        };

        const taskId = await startFreepikTask(payload, apiKey);
        console.log(`[REMOVE] Task started: ${taskId}`);

        const resultUrl = await pollFreepikTask(taskId, apiKey);
        cleanupFile(req.file.path);

        res.json({
            success: true,
            message: 'Furniture removed successfully',
            resultImage: resultUrl,
            mode: 'remove',
        });
    } catch (error: unknown) {
        console.error('[REMOVE] Error:', error);
        cleanupFile(req.file?.path);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to remove furniture', details: errorMessage });
    }
};

// ─── Endpoint: Restyle (furnished -> different style) ───────────────────────

export const restyleRoom = async (req: Request, res: Response) => {
    try {
        const apiKey = validateApiKey();
        if (!apiKey) {
            return res.status(500).json({
                error: 'Server Configuration Error',
                details: 'Missing or invalid FREEPIK_API_KEY in .env.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { room = 'living_room', style = 'modern', newStyle = 'scandinavian' } = req.body;
        const roomLabel = getRoomLabel(room);
        const newStyleLabel = getStyleLabel(newStyle);

        console.log(`[RESTYLE] Processing: ${roomLabel} from ${style} to ${newStyleLabel}`);

        const base64Image = readFileAsBase64(req.file.path);

        const payload = {
            prompt: `Same room layout completely redecorated in ${newStyleLabel} style. Professional interior design staging of a ${roomLabel}. Replace all furniture and decor with ${newStyleLabel} pieces. Keep exact room architecture, windows, doors, and walls. High-end ${newStyleLabel} furniture, coordinated color palette, professional real estate photography, 8k, photorealistic`,
            structure_reference: base64Image,
            structure_strength: 35,
            resolution: '2k',
            aspect_ratio: 'square_1_1',
            negative_prompt: 'changing room shape, new windows, new doors, different architecture, clutter, messy, watermark, text, blurry, distorted',
        };

        const taskId = await startFreepikTask(payload, apiKey);
        console.log(`[RESTYLE] Task started: ${taskId}`);

        const resultUrl = await pollFreepikTask(taskId, apiKey);
        cleanupFile(req.file.path);

        res.json({
            success: true,
            message: 'Room restyled successfully',
            resultImage: resultUrl,
            mode: 'restyle',
        });
    } catch (error: unknown) {
        console.error('[RESTYLE] Error:', error);
        cleanupFile(req.file?.path);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to restyle room', details: errorMessage });
    }
};

// ─── Endpoint: Image Enhancement (HDR, lighting) ───────────────────────────

export const enhanceImage = async (req: Request, res: Response) => {
    try {
        const apiKey = validateApiKey();
        if (!apiKey) {
            return res.status(500).json({
                error: 'Server Configuration Error',
                details: 'Missing or invalid FREEPIK_API_KEY in .env.',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const { enhanceType = 'hdr' } = req.body;
        console.log(`[ENHANCE] Processing: ${enhanceType}`);

        const base64Image = readFileAsBase64(req.file.path);

        const enhancePrompts: Record<string, string> = {
            hdr: 'Professional HDR real estate photography. Enhanced dynamic range, vivid natural colors, balanced exposure in shadows and highlights. Crystal clear details, professional white balance, magazine quality interior photography, 8k resolution',
            lighting: 'Beautifully lit interior with warm professional lighting. Enhanced natural light from windows, soft ambient glow, no harsh shadows. Professional real estate photography with perfect exposure, golden hour quality, 8k resolution',
            twilight: 'Stunning twilight exterior photography. Beautiful blue hour sky, warm interior lights glowing through windows, professional real estate twilight shot. Dramatic sky, perfectly balanced exposure between interior warmth and exterior blue hour, 8k',
        };

        const prompt = enhancePrompts[enhanceType] ?? enhancePrompts.hdr;

        const payload = {
            prompt,
            structure_reference: base64Image,
            structure_strength: 65,
            resolution: '2k',
            aspect_ratio: 'square_1_1',
            negative_prompt: 'dark, underexposed, overexposed, blurry, noise, grain, watermark, text, distorted, artificial looking',
        };

        const taskId = await startFreepikTask(payload, apiKey);
        console.log(`[ENHANCE] Task started: ${taskId}`);

        const resultUrl = await pollFreepikTask(taskId, apiKey);
        cleanupFile(req.file.path);

        res.json({
            success: true,
            message: 'Image enhanced successfully',
            resultImage: resultUrl,
            mode: 'enhance',
        });
    } catch (error: unknown) {
        console.error('[ENHANCE] Error:', error);
        cleanupFile(req.file?.path);
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ error: 'Failed to enhance image', details: errorMessage });
    }
};
