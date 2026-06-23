import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Divide, Download, RefreshCw, Pencil, Maximize2, Minimize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    onReset: () => void;
    onModifyStyle: () => void;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage, onReset, onModifyStyle }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(x, 2), 98));
    }, []);

    // Mouse events
    const handleMouseDown = useCallback(() => setIsResizing(true), []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        e.preventDefault();
        updatePosition(e.clientX);
    }, [isResizing, updatePosition]);

    const handleMouseUp = useCallback(() => setIsResizing(false), []);

    // Touch events
    const handleTouchStart = useCallback(() => setIsResizing(true), []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isResizing || !e.touches[0]) return;
        e.preventDefault();
        updatePosition(e.touches[0].clientX);
    }, [isResizing, updatePosition]);

    const handleTouchEnd = useCallback(() => setIsResizing(false), []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    const sliderContent = (
        <div className={`w-full ${isFullscreen ? 'max-w-full' : 'max-w-5xl'} mx-auto animate-in fade-in duration-700`}>
            <div className={`bg-surface rounded-3xl shadow-2xl overflow-hidden border border-white/10 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/80 backdrop-blur-md">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Resultado</h2>
                        <p className="text-text-muted text-sm">Desliza para ver la transformacion</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={onModifyStyle}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:bg-white/10 font-medium transition-colors border border-white/10 text-sm"
                        >
                            <Pencil size={16} /> Cambiar Estilo
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:bg-white/10 font-medium transition-colors border border-white/10 text-sm"
                        >
                            <RefreshCw size={16} /> Nueva Foto
                        </button>
                        <button
                            onClick={() => downloadImage(afterImage, 'stageai-resultado.jpg')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20 text-sm"
                        >
                            <Download size={16} /> Descargar
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:bg-white/10 transition-colors border border-white/10"
                            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Slider Area */}
                <div
                    ref={containerRef}
                    className={`relative w-full cursor-col-resize select-none group ${isFullscreen ? 'flex-1' : 'h-[400px] md:h-[500px]'}`}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {/* After Image (Background) */}
                    <div className="absolute inset-0 w-full h-full">
                        <img src={afterImage} alt="Despues" className="w-full h-full object-cover" draggable={false} />
                    </div>

                    {/* Before Image (Foreground, clipped) */}
                    <div
                        className="absolute inset-0 w-full h-full overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                    >
                        <img
                            src={beforeImage}
                            alt="Antes"
                            className="absolute inset-0 w-full h-full object-cover max-w-none"
                            style={{ width: containerRef.current?.offsetWidth }}
                            draggable={false}
                        />
                    </div>

                    {/* ANTES Label */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className="bg-black/70 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            ANTES
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); downloadImage(beforeImage, 'stageai-original.jpg'); }}
                            className="mt-2 bg-black/50 backdrop-blur-sm text-white/80 hover:text-white px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1"
                        >
                            <Download size={10} /> Original
                        </button>
                    </div>

                    {/* DESPUES Label */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-primary/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            DESPUES
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); downloadImage(afterImage, 'stageai-resultado.jpg'); }}
                            className="mt-2 ml-auto bg-primary/50 backdrop-blur-sm text-white/80 hover:text-white px-3 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1"
                        >
                            <Download size={10} /> Resultado
                        </button>
                    </div>

                    {/* Handle Line */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        style={{ left: `${sliderPosition}%` }}
                        animate={{ left: `${sliderPosition}%` }}
                        transition={{ type: 'tween', duration: isResizing ? 0 : 0.15 }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Divide className="rotate-90" size={20} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );

    // Fullscreen overlay
    if (isFullscreen) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black z-[200] flex flex-col"
                >
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 z-[210] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex-1 p-4">
                        {sliderContent}
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return sliderContent;
};
