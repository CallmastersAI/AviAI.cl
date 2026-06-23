import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

const MOCK_PROPERTIES = [
    { id: '1', title: 'Depto 2D/2B Providencia - $180.000.000', address: 'Av. Providencia 1234' },
    { id: '2', title: 'Casa 3D/2B La Reina - $320.000.000', address: 'Los Aromos 567' },
    { id: '3', title: 'Depto 1D/1B Santiago Centro - $95.000.000', address: 'Merced 890' },
    { id: '4', title: 'Casa 4D/3B Las Condes - $450.000.000', address: 'Isidora Goyenechea 2100' },
];

const IMAGE_POSITIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, imageUrl }) => {
    const [selectedProperty, setSelectedProperty] = useState('');
    const [selectedPosition, setSelectedPosition] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    const handlePublish = () => {
        if (!selectedProperty) return;
        setIsPublishing(true);

        // Simulate publish
        setTimeout(() => {
            setIsPublishing(false);
            setIsPublished(true);
        }, 1500);
    };

    const handleClose = () => {
        setIsPublished(false);
        setIsPublishing(false);
        setSelectedProperty('');
        setSelectedPosition(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close */}
                    <button onClick={handleClose} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>

                    {isPublished ? (
                        // Success state
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Publicado con exito</h3>
                            <p className="text-text-muted mb-6">La imagen se ha vinculado a tu propiedad en posicion {selectedPosition}.</p>
                            <button onClick={handleClose} className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/80 transition-colors">
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        // Form state
                        <>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-1">Publicar en MercadoLibre</h3>
                                <p className="text-sm text-text-muted">Vincula esta imagen a una propiedad existente</p>
                            </div>

                            {/* Preview */}
                            <div className="mb-6 rounded-xl overflow-hidden border border-white/10 h-40">
                                <img src={imageUrl} alt="Imagen a publicar" className="w-full h-full object-cover" />
                            </div>

                            {/* Property Selector */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                                    Selecciona Propiedad
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={(e) => setSelectedProperty(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {MOCK_PROPERTIES.map((prop) => (
                                        <option key={prop.id} value={prop.id}>{prop.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Position */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                                    Posicion de Foto (1-20)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {IMAGE_POSITIONS.slice(0, 10).map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setSelectedPosition(pos)}
                                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                                                selectedPosition === pos
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/10'
                                            }`}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info note */}
                            <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-6 flex items-start gap-3">
                                <Info size={16} className="text-accent shrink-0 mt-0.5" />
                                <p className="text-xs text-accent/80">
                                    Proximamente: publicacion automatica a Portal Inmobiliario y otros portales chilenos.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={!selectedProperty || isPublishing}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                        !selectedProperty || isPublishing
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/25'
                                    }`}
                                >
                                    {isPublishing ? (
                                        <span className="animate-spin">...</span>
                                    ) : (
                                        <>
                                            <Upload size={16} /> Publicar
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
