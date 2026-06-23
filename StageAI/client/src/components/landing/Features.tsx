import { Upload, Sliders, Wand2, Sofa, Paintbrush, Trash2, Sparkles } from 'lucide-react';

export function Features() {
    return (
        <section className="py-24 bg-surface/30 relative overflow-hidden" id="features">
            <div className="max-w-7xl mx-auto px-6">

                {/* How It Works */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Como Funciona</h2>
                    <p className="text-text-muted max-w-2xl mx-auto text-lg">
                        Tres pasos simples para transformar cualquier propiedad. Sin conocimientos tecnicos.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-12 mb-32 relative">
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 border-t border-dashed border-white/20" />

                    <div className="relative text-center group">
                        <div className="w-24 h-24 bg-surface border border-white/10 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 z-10 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
                            <Upload size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">1. Sube tu Foto</h3>
                        <p className="text-text-muted">Toma una foto de la propiedad o sube una imagen existente.</p>
                    </div>

                    <div className="relative text-center group">
                        <div className="w-24 h-24 bg-surface border border-white/10 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 z-10 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
                            <Sliders size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">2. Elige Modo y Estilo</h3>
                        <p className="text-text-muted">Selecciona que quieres hacer y el estilo de diseno preferido.</p>
                    </div>

                    <div className="relative text-center group">
                        <div className="w-24 h-24 bg-surface border border-white/10 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 z-10 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity" />
                            <Wand2 size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">3. Genera al Instante</h3>
                        <p className="text-text-muted">Nuestra IA transforma tu espacio en segundos. Descarga o publica.</p>
                    </div>
                </div>

                {/* 4 Feature Cards matching the 4 modes */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">4 Herramientas Poderosas</h2>
                    <p className="text-text-muted max-w-2xl mx-auto text-lg">
                        Todo lo que necesitas para presentar propiedades como un profesional.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: Sofa,
                            title: 'Amoblar',
                            desc: 'Transforma habitaciones vacias en espacios bellamente amoblados con muebles de alta gama.',
                            color: 'from-primary to-primary/50',
                        },
                        {
                            icon: Paintbrush,
                            title: 'Cambiar Estilo',
                            desc: 'Redecora cualquier habitacion con un nuevo estilo: moderno, escandinavo, clasico y mas.',
                            color: 'from-accent to-accent/50',
                        },
                        {
                            icon: Trash2,
                            title: 'Vaciar',
                            desc: 'Remueve todos los muebles de una foto para mostrar el espacio real de la propiedad.',
                            color: 'from-orange-500 to-orange-500/50',
                        },
                        {
                            icon: Sparkles,
                            title: 'Mejorar',
                            desc: 'Mejora la iluminacion, aplica HDR y optimiza tus fotos inmobiliarias automaticamente.',
                            color: 'from-green-500 to-green-500/50',
                        },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-white/10 hover:-translate-y-1 group"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                <feature.icon size={24} className="text-white" />
                            </div>
                            <h4 className="font-bold text-lg text-white mb-2">{feature.title}</h4>
                            <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
