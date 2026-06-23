// ─── App Modes ──────────────────────────────────────────────────────────────

export type AppMode = 'stage' | 'restyle' | 'remove' | 'enhance';

export type EnhanceType = 'hdr' | 'lighting' | 'twilight';

// ─── Gallery ────────────────────────────────────────────────────────────────

export interface GalleryItem {
    id: string;
    originalUrl: string;
    resultUrl: string;
    mode: AppMode;
    room: string;
    style: string;
    enhanceType?: EnhanceType;
    createdAt: string;
}

// ─── Room Types ─────────────────────────────────────────────────────────────

export interface RoomType {
    id: string;
    label: string;
    icon: string;
}

export interface DesignStyle {
    id: string;
    label: string;
    description: string;
    color: string;
}

// ─── API Config ─────────────────────────────────────────────────────────────

export interface GenerationConfig {
    mode: AppMode;
    room: string;
    style: string;
    newStyle?: string;
    enhanceType?: EnhanceType;
}

// ─── API Response ───────────────────────────────────────────────────────────

export interface GenerationResponse {
    success: boolean;
    message: string;
    resultImage: string;
    mode: AppMode;
}
