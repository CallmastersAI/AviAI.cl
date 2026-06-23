import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ImageUploader } from '../components/features/ImageUploader';
import { RoomSelector, DESIGN_STYLES } from '../components/features/RoomSelector';
import { ComparisonSlider } from '../components/features/ComparisonSlider';
import { ProcessingModal } from '../components/ui/ProcessingModal';
import { GallerySection } from '../components/features/GallerySection';
import { PublishModal } from '../components/features/PublishModal';
import {
    Wand2, LogOut, Sofa, Paintbrush, Trash2, Sparkles, Plus, X, Image as ImageIcon, AlertCircle,
} from 'lucide-react';
import { signOut } from '../lib/supabase';
import { AppMode, EnhanceType, GalleryItem } from '../lib/types';
import { getGallery, addToGallery, generateId } from '../lib/gallery';

type FlowStep = 'upload' | 'config' | 'processing' | 'result';

const MODE_CONFIG: Array<{ id: AppMode; label: string; icon: typeof Wand2; description: string }> = [
    { id: 'stage', label: 'Amoblar', icon: Sofa, description: 'Amuebla una habitacion vacia' },
    { id: 'restyle', label: 'Cambiar Estilo', icon: Paintbrush, description: 'Cambia el estilo de decoracion' },
    { id: 'remove', label: 'Vaciar', icon: Trash2, description: 'Remueve todos los muebles' },
    { id: 'enhance', label: 'Mejorar', icon: Sparkles, description: 'Mejora iluminacion y calidad' },
];

const ENHANCE_OPTIONS: Array<{ id: EnhanceType; label: string; description: string }> = [
    { id: 'hdr', label: 'HDR', description: 'Rango dinamico mejorado' },
    { id: 'lighting', label: 'Iluminacion', description: 'Luz natural optimizada' },
    { id: 'twilight', label: 'Twilight', description: 'Foto exterior atardecer' },
];

const API_ENDPOINTS: Record<AppMode, string> = {
    stage: '/api/generate',
    restyle: '/api/restyle',
    remove: '/api/remove-furniture',
    enhance: '/api/enhance',
};

// ─── Batch Queue Types ──────────────────────────────────────────────────────

interface BatchItem {
    id: string;
    file: File;
    previewUrl: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultUrl?: string;
    error?: string;
}

export function Dashboard() {
    // Mode & flow
    const [mode, setMode] = useState<AppMode>('stage');
    const [step, setStep] = useState<FlowStep>('upload');

    // Single image
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [resultImage, setResultImage] = useState('');

    // Config
    const [room, setRoom] = useState('living_room');
    const [style, setStyle] = useState('modern');
    const [newStyle, setNewStyle] = useState('scandinavian');
    const [enhanceType, setEnhanceType] = useState<EnhanceType>('hdr');

    // Processing
    const [pollAttempt, setPollAttempt] = useState(0);

    // Gallery
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [publishImageUrl, setPublishImageUrl] = useState('');

    // Batch
    const [batchMode, setBatchMode] = useState(false);
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [batchProcessing, setBatchProcessing] = useState(false);

    // Load gallery on mount
    useEffect(() => {
        setGallery(getGallery());
    }, []);

    const refreshGallery = useCallback(() => {
        setGallery(getGallery());
    }, []);

    const handleImageSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    const handleConfigSelect = useCallback((selectedRoom: string, selectedStyle: string) => {
        setRoom(selectedRoom);
        setStyle(selectedStyle);
    }, []);

    // ─── Single Generation ──────────────────────────────────────────────────

    const startGeneration = async () => {
        if (!selectedFile) return;

        setStep('processing');
        setPollAttempt(0);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('room', room);
            formData.append('style', style);

            if (mode === 'restyle') {
                formData.append('newStyle', newStyle);
            }
            if (mode === 'enhance') {
                formData.append('enhanceType', enhanceType);
            }

            const endpoint = API_ENDPOINTS[mode];

            // Start polling indicator
            const pollInterval = setInterval(() => {
                setPollAttempt((prev) => Math.min(prev + 1, 30));
            }, 2000);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            clearInterval(pollInterval);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const msg = errorData.details
                    ? `${errorData.error}: ${errorData.details}`
                    : (errorData.error || 'Error en generacion');
                throw new Error(msg);
            }

            const data = await response.json();

            if (data.success && data.resultImage) {
                setResultImage(data.resultImage);
                setStep('result');

                // Save to gallery
                const galleryItem: GalleryItem = {
                    id: generateId(),
                    originalUrl: previewUrl,
                    resultUrl: data.resultImage,
                    mode,
                    room,
                    style: mode === 'restyle' ? newStyle : style,
                    enhanceType: mode === 'enhance' ? enhanceType : undefined,
                    createdAt: new Date().toISOString(),
                };
                addToGallery(galleryItem);
                refreshGallery();
            } else {
                throw new Error('No se recibio imagen del servidor');
            }
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Error de conexion con el servidor';
            alert(errorMessage);
            setStep('upload');
        }
    };

    // ─── Batch Upload ───────────────────────────────────────────────────────

    const handleBatchFiles = useCallback((files: File[]) => {
        const newItems: BatchItem[] = files.slice(0, 10).map((file) => ({
            id: generateId(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'pending' as const,
        }));
        setBatchItems((prev) => [...prev, ...newItems].slice(0, 10));
    }, []);

    const removeBatchItem = useCallback((id: string) => {
        setBatchItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const processBatch = async () => {
        if (batchItems.length === 0) return;
        setBatchProcessing(true);

        for (let i = 0; i < batchItems.length; i++) {
            const item = batchItems[i];
            if (item.status === 'done') continue;

            setBatchItems((prev) =>
                prev.map((bi) => bi.id === item.id ? { ...bi, status: 'processing' as const } : bi)
            );

            try {
                const formData = new FormData();
                formData.append('image', item.file);
                formData.append('room', room);
                formData.append('style', style);
                if (mode === 'restyle') formData.append('newStyle', newStyle);
                if (mode === 'enhance') formData.append('enhanceType', enhanceType);

                const response = await fetch(API_ENDPOINTS[mode], {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Error del servidor');

                const data = await response.json();
                if (data.success && data.resultImage) {
                    setBatchItems((prev) =>
                        prev.map((bi) => bi.id === item.id ? { ...bi, status: 'done' as const, resultUrl: data.resultImage } : bi)
                    );

                    const galleryItem: GalleryItem = {
                        id: generateId(),
                        originalUrl: item.previewUrl,
                        resultUrl: data.resultImage,
                        mode,
                        room,
                        style: mode === 'restyle' ? newStyle : style,
                        enhanceType: mode === 'enhance' ? enhanceType : undefined,
                        createdAt: new Date().toISOString(),
                    };
                    addToGallery(galleryItem);
                } else {
                    throw new Error('Sin imagen');
                }
            } catch (err) {
                setBatchItems((prev) =>
                    prev.map((bi) => bi.id === item.id ? { ...bi, status: 'error' as const, error: 'Error al procesar' } : bi)
                );
            }
        }

        setBatchProcessing(false);
        refreshGallery();
    };

    // ─── Reset ──────────────────────────────────────────────────────────────

    const handleReset = () => {
        setStep('upload');
        setSelectedFile(null);
        setPreviewUrl('');
        setResultImage('');
        setPollAttempt(0);
    };

    // ─── View gallery item comparison ───────────────────────────────────────

    const handleViewComparison = (item: GalleryItem) => {
        setPreviewUrl(item.originalUrl);
        setResultImage(item.resultUrl);
        setStep('result');
    };

    const handlePublish = (imageUrl: string) => {
        setPublishImageUrl(imageUrl);
        setPublishModalOpen(true);
    };

    // ─── Can generate? ─────────────────────────────────────────────────────

    const canGenerate = selectedFile && (
        mode === 'remove' ||
        mode === 'enhance' ||
        mode === 'stage' ||
        mode === 'restyle'
    );

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background text-text-main font-sans selection:bg-primary/30">
            <Helmet>
                <title>Dashboard - StageAI</title>
            </Helmet>

            {/* HEADER */}
            <header className="h-16 border-b border-white/10 bg-background/50 backdrop-blur-md fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Wand2 size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Stage<span className="text-primary">AI</span>
                        <span className="text-xs text-text-muted font-normal ml-2 hidden sm:inline">Dashboard</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setBatchMode(!batchMode)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                            batchMode
                                ? 'bg-accent/20 text-accent border-accent/30'
                                : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {batchMode ? 'Modo Lote ON' : 'Modo Lote'}
                    </button>
                    <button onClick={signOut} className="text-sm font-medium text-text-muted hover:text-red-400 transition-colors flex items-center gap-2">
                        <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
                    </button>
                </div>
            </header>

            <main className="pt-16 min-h-screen flex flex-col md:flex-row overflow-hidden">

                {/* LEFT PANEL: GALLERY / RESULT */}
                <section className="w-full md:w-[65%] h-[50vh] md:h-screen bg-black/20 p-4 md:p-6 flex flex-col relative border-r border-white/5">
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-surface/50 relative shadow-2xl flex flex-col">

                        {step === 'result' && resultImage ? (
                            <ComparisonSlider
                                beforeImage={previewUrl}
                                afterImage={resultImage}
                                onReset={handleReset}
                                onModifyStyle={() => setStep('upload')}
                            />
                        ) : batchMode ? (
                            // Batch mode UI
                            <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Carga Multiple (max 10)</h3>
                                    {batchItems.length > 0 && (
                                        <button onClick={() => setBatchItems([])} className="text-xs text-text-muted hover:text-red-400">
                                            Limpiar todo
                                        </button>
                                    )}
                                </div>

                                {/* Drop zone for batch */}
                                <div
                                    className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.multiple = true;
                                        input.onchange = (e) => {
                                            const files = Array.from((e.target as HTMLInputElement).files || []);
                                            handleBatchFiles(files);
                                        };
                                        input.click();
                                    }}
                                >
                                    <Plus size={24} className="mx-auto text-text-muted mb-2" />
                                    <p className="text-sm text-text-muted">Haz clic para agregar imagenes</p>
                                    <p className="text-xs text-text-muted/60 mt-1">{batchItems.length}/10 imagenes</p>
                                </div>

                                {/* Batch items grid */}
                                {batchItems.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 flex-1">
                                        {batchItems.map((item) => (
                                            <div key={item.id} className="relative rounded-xl overflow-hidden border border-white/10 aspect-square group">
                                                <img src={item.previewUrl} className="w-full h-full object-cover" alt="" />
                                                {/* Status overlay */}
                                                <div className={`absolute inset-0 flex items-center justify-center ${
                                                    item.status === 'processing' ? 'bg-black/60' :
                                                    item.status === 'done' ? 'bg-green-500/20' :
                                                    item.status === 'error' ? 'bg-red-500/20' : ''
                                                }`}>
                                                    {item.status === 'processing' && (
                                                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                                                    )}
                                                    {item.status === 'done' && (
                                                        <div className="bg-green-500/80 text-white px-2 py-1 rounded-full text-[10px] font-bold">Listo</div>
                                                    )}
                                                    {item.status === 'error' && (
                                                        <AlertCircle size={24} className="text-red-400" />
                                                    )}
                                                </div>
                                                {/* Remove button */}
                                                {item.status === 'pending' && (
                                                    <button
                                                        onClick={() => removeBatchItem(item.id)}
                                                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Normal single mode preview
                            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted p-8 text-center">
                                {previewUrl ? (
                                    <div className="relative w-full h-full max-h-[600px] flex items-center justify-center">
                                        <img src={previewUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-lg opacity-50" alt="Preview" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
                                                <p className="text-white font-medium">Vista Previa (Original)</p>
                                                <p className="text-xs text-text-muted mt-1">Configura las opciones a la derecha y genera</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                            <Wand2 size={32} className="opacity-50" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white mb-2">Empieza tu Diseno</h3>
                                        <p className="max-w-md mx-auto">Sube una imagen y configura los parametros en el panel de control.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Gallery below main area on desktop */}
                    <div className="hidden md:block mt-4 rounded-2xl overflow-hidden border border-white/10 bg-surface/50">
                        <GallerySection
                            items={gallery}
                            onRefresh={refreshGallery}
                            onViewComparison={handleViewComparison}
                            onPublish={handlePublish}
                        />
                    </div>
                </section>

                {/* RIGHT PANEL: CONTROLS */}
                <section className="w-full md:w-[35%] h-auto md:h-screen overflow-y-auto bg-surface border-l border-white/5 p-4 md:p-6 flex flex-col gap-6 shadow-2xl z-10">

                    {/* MODE SELECTOR - 4 Tabs */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Modo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {MODE_CONFIG.map((m) => {
                                const Icon = m.icon;
                                const isActive = mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => { setMode(m.id); handleReset(); }}
                                        className={`
                                            relative p-3 rounded-xl border transition-all text-left flex items-start gap-3
                                            ${isActive
                                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                : 'border-white/10 bg-background/50 hover:bg-background/80 hover:border-white/20'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <span className={`text-xs font-bold block ${isActive ? 'text-white' : 'text-text-muted'}`}>
                                                {m.label}
                                            </span>
                                            <span className="text-[10px] text-text-muted/70 leading-tight block mt-0.5">
                                                {m.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* UPLOAD SECTION */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">1</span>
                            Sube tu Imagen
                        </div>
                        <div className="bg-background/50 rounded-xl border border-white/10 p-1 hover:border-primary/50 transition-colors">
                            <ImageUploader onImageSelected={handleImageSelect} compact={!!selectedFile} />
                        </div>
                    </div>

                    {/* CONFIGURATION - varies by mode */}
                    <div className={`space-y-3 transition-all duration-500 ${selectedFile ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4 pointer-events-none'}`}>
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                            <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">2</span>
                            Configura
                        </div>

                        {/* STAGE mode: Room + Style */}
                        {mode === 'stage' && (
                            <RoomSelector onSelect={handleConfigSelect} verticalMode />
                        )}

                        {/* RESTYLE mode: Room + Current implied + New Style */}
                        {mode === 'restyle' && (
                            <div className="space-y-4">
                                <RoomSelector onSelect={handleConfigSelect} verticalMode hideStyles />
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-accent uppercase tracking-wider">Nuevo Estilo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DESIGN_STYLES.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setNewStyle(s.id)}
                                                className={`
                                                    p-3 rounded-xl border transition-all text-left flex items-center gap-2.5
                                                    ${newStyle === s.id
                                                        ? 'border-accent ring-1 ring-accent bg-accent/10'
                                                        : 'border-white/10 bg-surface hover:bg-surface/80 hover:border-white/20'
                                                    }
                                                `}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                                                    style={{ backgroundColor: s.color }}
                                                />
                                                <div className="min-w-0">
                                                    <span className="text-xs font-medium text-white block truncate">{s.label}</span>
                                                    <span className="text-[10px] text-text-muted block truncate">{s.description}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* REMOVE mode: just room selector */}
                        {mode === 'remove' && (
                            <div className="space-y-2">
                                <p className="text-sm text-text-muted">Sube una foto amoblada y generaremos la version vacia.</p>
                                <RoomSelector onSelect={handleConfigSelect} verticalMode hideStyles />
                            </div>
                        )}

                        {/* ENHANCE mode: enhancement options */}
                        {mode === 'enhance' && (
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-primary uppercase tracking-wider">Tipo de Mejora</label>
                                <div className="space-y-2">
                                    {ENHANCE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setEnhanceType(opt.id)}
                                            className={`
                                                w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4
                                                ${enhanceType === opt.id
                                                    ? 'border-primary ring-1 ring-primary bg-primary/10'
                                                    : 'border-white/10 bg-background/50 hover:bg-background/80'
                                                }
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enhanceType === opt.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}>
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold ${enhanceType === opt.id ? 'text-white' : 'text-text-muted'}`}>{opt.label}</span>
                                                <span className="text-xs text-text-muted block">{opt.description}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTON */}
                    <div className="mt-auto pt-6 border-t border-white/10">
                        {batchMode && batchItems.length > 0 ? (
                            <button
                                disabled={batchProcessing || batchItems.length === 0}
                                onClick={processBatch}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                                    ${batchProcessing
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-accent to-primary hover:shadow-accent/40 hover:scale-[1.02] text-white'
                                    }`}
                            >
                                <ImageIcon size={24} />
                                {batchProcessing ? 'Procesando lote...' : `Procesar ${batchItems.length} imagenes`}
                            </button>
                        ) : (
                            <button
                                disabled={!canGenerate || step === 'processing'}
                                onClick={startGeneration}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                                    ${(!canGenerate || step === 'processing')
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-accent hover:shadow-primary/40 hover:scale-[1.02] text-white'
                                    }`}
                            >
                                <Wand2 size={24} />
                                {step === 'processing' ? 'Generando...' : 'Generar Diseno'}
                            </button>
                        )}
                        <p className="text-center text-xs text-text-muted mt-3 p-2 bg-white/5 rounded-lg border border-white/5">
                            Generacion con IA - Calidad 2K
                        </p>
                    </div>
                </section>
            </main>

            {/* Gallery on mobile */}
            <div className="md:hidden">
                <GallerySection
                    items={gallery}
                    onRefresh={refreshGallery}
                    onViewComparison={handleViewComparison}
                    onPublish={handlePublish}
                />
            </div>

            {/* Modals */}
            <ProcessingModal
                isOpen={step === 'processing'}
                onClose={() => {}}
                mode={mode}
                pollAttempt={pollAttempt}
                maxAttempts={30}
            />

            <PublishModal
                isOpen={publishModalOpen}
                onClose={() => setPublishModalOpen(false)}
                imageUrl={publishImageUrl}
            />
        </div>
    );
}
