import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../../lib/types';

interface ProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: AppMode;
    pollAttempt?: number;
    maxAttempts?: number;
}

const MODE_LABELS: Record<AppMode, string> = {
    stage: 'Amoblando habitacion',
    restyle: 'Cambiando estilo',
    remove: 'Vaciando habitacion',
    enhance: 'Mejorando imagen',
};

const STAGING_FACTS = [
    'Las propiedades con home staging se venden hasta un 73% mas rapido.',
    'El staging virtual cuesta 97% menos que el staging fisico tradicional.',
    'El 83% de los compradores dice que las fotos son clave en su decision.',
    'Una propiedad bien presentada puede venderse hasta un 20% mas cara.',
    'El primer impacto visual se forma en los primeros 7 segundos.',
    'Los portales inmobiliarios priorizan fotos de alta calidad en sus resultados.',
    'El 95% de los compradores buscan propiedades online antes de visitarlas.',
    'El staging virtual puede transformar un espacio vacio en menos de 30 segundos.',
    'Invertir en buenas fotos genera un retorno de hasta 10x en ventas.',
    'Las propiedades con fotos profesionales reciben 118% mas visitas online.',
];

const STEPS_BY_MODE: Record<AppMode, string[]> = {
    stage: [
        'Analizando geometria del espacio...',
        'Detectando puntos de fuga y perspectiva...',
        'Seleccionando muebles del estilo elegido...',
        'Generando propuesta de diseno...',
        'Aplicando iluminacion realista...',
        'Refinando detalles finales...',
    ],
    restyle: [
        'Analizando distribucion actual...',
        'Identificando elementos del mobiliario...',
        'Seleccionando piezas del nuevo estilo...',
        'Reemplazando decoracion...',
        'Ajustando paleta de colores...',
        'Aplicando acabados finales...',
    ],
    remove: [
        'Escaneando la habitacion...',
        'Identificando todos los muebles...',
        'Removiendo objetos del espacio...',
        'Reconstruyendo paredes y pisos...',
        'Limpiando sombras residuales...',
        'Puliendo resultado final...',
    ],
    enhance: [
        'Analizando exposicion actual...',
        'Mapeando fuentes de luz...',
        'Aplicando correccion HDR...',
        'Optimizando balance de blancos...',
        'Mejorando nitidez y detalles...',
        'Ajustes finales de calidad...',
    ],
};

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
    isOpen,
    onClose: _onClose,
    mode = 'stage',
    pollAttempt = 0,
    maxAttempts = 30,
}) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [factIndex, setFactIndex] = useState(0);

    const steps = STEPS_BY_MODE[mode];
    const progressFromPoll = maxAttempts > 0 ? Math.min((pollAttempt / maxAttempts) * 100, 95) : 0;
    const progressFromSteps = ((stepIndex + 1) / steps.length) * 100;
    const progress = Math.max(progressFromPoll, progressFromSteps);

    const estimatedSecondsLeft = Math.max(0, Math.round(((maxAttempts - pollAttempt) * 2)));

    useEffect(() => {
        if (isOpen) {
            setStepIndex(0);
            setFactIndex(Math.floor(Math.random() * STAGING_FACTS.length));

            const stepInterval = setInterval(() => {
                setStepIndex((prev) => {
                    if (prev < steps.length - 1) return prev + 1;
                    return prev;
                });
            }, 3000);

            const factInterval = setInterval(() => {
                setFactIndex((prev) => (prev + 1) % STAGING_FACTS.length);
            }, 6000);

            return () => {
                clearInterval(stepInterval);
                clearInterval(factInterval);
            };
        }
    }, [isOpen, steps.length]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden border border-white/10"
                >
                    {/* Top gradient bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

                    {/* Spinner */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="bg-surface p-4 rounded-full shadow-lg relative z-10 border border-white/10">
                                <Loader2 size={48} className="text-primary animate-spin" />
                            </div>
                            <div className="absolute -right-2 -top-2 bg-accent p-1.5 rounded-full z-20 animate-bounce">
                                <Sparkles size={16} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Mode label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
                        {MODE_LABELS[mode]}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">Creando Magia</h3>

                    {/* Current step */}
                    <motion.p
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-text-muted font-medium h-6 mb-6 text-sm"
                    >
                        {steps[stepIndex]}
                    </motion.p>

                    {/* Progress bar */}
                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden mb-3">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* Time estimate */}
                    <div className="flex justify-between text-xs text-text-muted mb-6">
                        <span>{Math.round(progress)}%</span>
                        <span>
                            {estimatedSecondsLeft > 0
                                ? `~${estimatedSecondsLeft}s restantes`
                                : 'Casi listo...'
                            }
                        </span>
                    </div>

                    {/* Fun fact */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] text-primary/80 uppercase tracking-wider font-semibold mb-1">Sabias que...</p>
                        <motion.p
                            key={factIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-text-muted leading-relaxed"
                        >
                            {STAGING_FACTS[factIndex]}
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
