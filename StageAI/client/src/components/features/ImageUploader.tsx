import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
    compact?: boolean;
}

export function ImageUploader({ onImageSelected, compact = false }: ImageUploaderProps) {

    // We don't manage preview state here anymore for the main flow, 
    // but we can keep it for UX feedback if needed. 
    // However, App.tsx handles the main preview. 
    // For simplicity in this new "Control Panel" flow, we just notify parent.

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImageSelected(acceptedFiles[0]);
        }
    }, [onImageSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

    if (compact) {
        return (
            <div {...getRootProps()} className="cursor-pointer group relative overflow-hidden rounded-xl border border-dashed border-white/20 hover:border-primary/50 bg-background/30 transition-all p-4 text-center">
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-text-muted group-hover:text-white">Cambiar imagen</p>
                </div>
            </div>
        );
    }

    // Full version (Initial state)
    return (
        <div
            {...getRootProps()}
            className={`
                relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
                h-[200px] flex flex-col items-center justify-center text-center p-6
                ${isDragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-surface/50 hover:border-primary/50 hover:bg-surface/80'
                }
            `}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${isDragActive ? 'bg-primary text-white' : 'bg-white/5 text-text-muted group-hover:text-primary'}
                `}>
                    <Upload size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Sube tu imagen</h3>
                    <p className="text-xs text-text-muted">JPG, PNG (Max 10MB)</p>
                </div>
            </div>
        </div>
    );
}
