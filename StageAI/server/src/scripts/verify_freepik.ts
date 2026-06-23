import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkFreepik() {
    console.log("Checking Freepik API configuration...");

    const key = process.env.FREEPIK_API_KEY;
    if (!key || key.includes('PLACE_YOUR')) {
        console.error("❌ FREEPIK_API_KEY is missing or invalid in .env file");
        process.exit(1);
    }

    console.log(`✅ Key found: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);

    try {
        console.log("Attempting to connect to Freepik Mystic API...");
        const API_URL = 'https://api.freepik.com/v1/ai/mystic';

        console.log("Testing with a Text-Only request first (simplest case)...");

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-freepik-api-key': key
            },
            body: JSON.stringify({
                prompt: "a beautiful modern living room, 8k, realistic",
                resolution: "k_2", // Common param for Mystic, trying valid value 'k_2' or '2k' ? Docs said '2k' in snippet?
                // Docs snippet: "resolution": "2k"
                // Let's use what the snippet showed.
                resolution: "2k",
                aspect_ratio: "square_1_1"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("\n❌ API Request Failed:", response.status);
            console.error("Response:", errorText);
            return;
        }

        const data: any = await response.json();
        console.log("✅ POST Success! Response:", JSON.stringify(data, null, 2));

        const taskId = data.data?.task_id;

        if (taskId) {
            console.log(`Task ID: ${taskId}. Polling...`);

            let status = 'IN_PROGRESS';
            let attempts = 0;

            while (status === 'IN_PROGRESS' || status === 'PENDING') {
                await new Promise(r => setTimeout(r, 2000));
                attempts++;
                if (attempts > 10) break;

                const pollRes = await fetch(`${API_URL}/${taskId}`, {
                    headers: { 'x-freepik-api-key': key }
                });

                const pollData: any = await pollRes.json();
                status = pollData.data?.status;
                console.log(`Poll ${attempts}: ${status}`);

                if (status === 'COMPLETED') {
                    console.log("✅ Generation COMPLETE!");
                    console.log("Full Response:", JSON.stringify(pollData, null, 2)); // DEBUG: Dump full response
                    // Fix extraction for logs
                    const gen = pollData.data?.generated;
                    const url = (Array.isArray(gen) && typeof gen[0] === 'string') ? gen[0] : gen?.[0]?.url;
                    console.log("Image URL:", url);
                }
            }
        }

    } catch (error: any) {
        console.error("\n❌ Script Error:", error.message);
    }
}

checkFreepik();
