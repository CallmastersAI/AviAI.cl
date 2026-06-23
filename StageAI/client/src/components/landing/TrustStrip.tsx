import { Star, Users, Image as ImageIcon, Zap } from 'lucide-react';

export function TrustStrip() {
    return (
        <section className="py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center md:text-left">

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-white">500+</h4>
                            <p className="text-sm text-text-muted">Agentes en Chile</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-white">4.9/5</h4>
                            <p className="text-sm text-text-muted">Satisfaccion</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-white">50K+</h4>
                            <p className="text-sm text-text-muted">Imagenes generadas</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold text-white">30s</h4>
                            <p className="text-sm text-text-muted">Tiempo promedio</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
