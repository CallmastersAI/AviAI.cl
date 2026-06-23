import React, { useState } from 'react';
import { Download, Trash2, Eye, Store, Clock, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem, AppMode } from '../../lib/types';
import { removeFromGallery, clearGallery } from '../../lib/gallery';

interface GallerySectionProps {
    items: GalleryItem[];
    onRefresh: () => void;
    onViewComparison: (item: GalleryItem) => void;
    onPublish: (imageUrl: string) => void;
}

const MODE_LABELS: Record<AppMode, string> = {
    stage: 'Amoblado',
    restyle: 'Rediseñado',
    remove: 'Vaciado',
    enhance: 'Mejorado',
};

const MODE_COLORS: Record<AppMode, string> = {
    stage: 'bg-primary/20 text-primary',
    restyle: 'bg-accent/20 text-accent',
    remove: 'bg-orange-500/20 text-orange-400',
    enhance: 'bg-green-500/20 text-green-400',
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const GallerySection: React.FC<GallerySectionProps> = ({ items, onRefresh, onViewComparison, onPublish }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        removeFromGallery(id);
        onRefresh();
    };

    const handleClearAll = () => {
        if (confirm('Deseas eliminar todo el historial?')) {
            clearGallery();
            onRefresh();
        }
    };

    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch {
            window.open(url, '_blank');
        }
    };

    if (items.length === 0) {
        return (
            <div className="border-t border-white/5 bg-background/30 p-8 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={28} className="text-text-muted/50" />
                </div>
                <h4 className="text-white font-semibold mb-1">Sin historial</h4>
                <p className="text-sm text-text-muted">Tus generaciones apareceran aqui</p>
            </div>
        );
    }

    return (
        <div className="border-t border-white/5 bg-background/30">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-white">Historial ({items.length})</h3>
                </div>
                <button onClick={handleClearAll} className="text-xs text-text-muted hover:text-red-400 transition-colors">
                    Limpiar todo
                </button>
            </div>

            {/* Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative group rounded-xl overflow-hidden border border-white/10 bg-surface cursor-pointer"
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-square">
                                <img
                                    src={item.resultUrl}
                                    alt="Resultado"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2324243e" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%2394a3b8" font-size="12">Error</text></svg>';
                                    }}
                                />
                            </div>

                            {/* Mode badge */}
                            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${MODE_COLORS[item.mode]}`}>
                                {MODE_LABELS[item.mode]}
                            </div>

                            {/* Hover overlay */}
                            {hoveredId === item.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2"
                                >
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => onViewComparison(item)}
                                            className="p-2 bg-white/10 hover:bg-primary/50 rounded-lg transition-colors"
                                            title="Ver comparacion"
                                        >
                                            <Eye size={14} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => downloadImage(item.resultUrl, `stageai-${item.id}.jpg`)}
                                            className="p-2 bg-white/10 hover:bg-primary/50 rounded-lg transition-colors"
                                            title="Descargar"
                                        >
                                            <Download size={14} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => onPublish(item.resultUrl)}
                                            className="p-2 bg-white/10 hover:bg-accent/50 rounded-lg transition-colors"
                                            title="Publicar en MercadoLibre"
                                        >
                                            <Store size={14} className="text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 bg-white/10 hover:bg-red-500/50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} className="text-white" />
                                        </button>
                                    </div>
                                    <span className="text-[9px] text-text-muted">{formatDate(item.createdAt)}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
