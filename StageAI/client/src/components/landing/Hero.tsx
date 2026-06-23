import { useState, useEffect } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { signInWithGoogle } from '../../lib/supabase';

const WORDS = ['Living', 'Dormitorios', 'Cocinas', 'Terrazas', 'Oficinas'];

export function Hero() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    Home Staging Virtual con IA para Chile
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                    Transforma tus{' '}
                    <br className="md:hidden" />
                    <span className="inline-block w-[220px] sm:w-[280px] md:w-[350px] text-left text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent transition-all duration-500">
                        {WORDS[index]}
                    </span>
                    <br />
                    en segundos con IA
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                    Aumenta tus ventas hasta un <strong className="text-white">40%</strong> con home staging virtual.
                    Amobla, cambia estilos, vacia habitaciones y mejora tus fotos inmobiliarias al instante.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-6 md:gap-10 mb-10 text-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-250">
                    <div className="text-center">
                        <span className="text-2xl font-bold text-white">30s</span>
                        <span className="block text-text-muted text-xs">por imagen</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <span className="text-2xl font-bold text-white">2K</span>
                        <span className="block text-text-muted text-xs">resolucion</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <span className="text-2xl font-bold text-white">10+</span>
                        <span className="block text-text-muted text-xs">estilos</span>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <button
                        onClick={signInWithGoogle}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 text-white font-bold rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        Prueba Gratis <ArrowRight size={20} />
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                        <Play size={18} fill="currentColor" /> Ver Demo
                    </button>
                </div>

                <p className="text-sm text-text-muted mt-4 animate-in fade-in duration-1000 delay-500">
                    Sin tarjeta de credito - Comienza en 30 segundos
                </p>

                {/* Visual */}
                <div className="mt-16 md:mt-20 relative mx-auto max-w-6xl rounded-2xl border border-white/10 bg-surface/50 p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 overflow-hidden">
                    <div className="aspect-video bg-black/40 rounded-xl relative overflow-hidden group cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop"
                            alt="StageAI - Home Staging Virtual con IA"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                <Play size={32} className="text-white fill-white ml-2" />
                            </div>
                        </div>
                        {/* Before/After overlay labels */}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            ANTES
                        </div>
                        <div className="absolute bottom-4 right-4 bg-primary/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            DESPUES
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
