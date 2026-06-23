import { GalleryItem } from './types';

const STORAGE_KEY = 'stageai_gallery';

export function getGallery(): GalleryItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as GalleryItem[];
    } catch {
        return [];
    }
}

export function addToGallery(item: GalleryItem): void {
    const gallery = getGallery();
    gallery.unshift(item);
    // Keep max 50 items
    const trimmed = gallery.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function removeFromGallery(id: string): void {
    const gallery = getGallery().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
}

export function clearGallery(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
