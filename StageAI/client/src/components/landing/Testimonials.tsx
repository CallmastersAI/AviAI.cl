import { Star } from 'lucide-react';

export function Testimonials() {
    return (
        <section className="py-24 bg-surface/30 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Lo que dicen nuestros clientes</h2>
                    <p className="text-text-muted">Corredores y agentes inmobiliarios que ya usan StageAI.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: 'Carolina Mendez',
                            role: 'Corredora de Propiedades, Las Condes',
                            text: 'StageAI me permite mostrar departamentos vacios como si estuvieran amoblados. Mis clientes ven el potencial del espacio inmediatamente. He reducido los tiempos de venta en un 30%.',
                        },
                        {
                            name: 'Roberto Fuentes',
                            role: 'Agente Inmobiliario, Providencia',
                            text: 'La calidad de las imagenes es impresionante. Puedo cambiar estilos en segundos y mostrar diferentes opciones de decoracion a mis clientes. Es como tener un equipo de diseno a un clic.',
                        },
                        {
                            name: 'Patricia Soto',
                            role: 'Inmobiliaria Sur, Temuco',
                            text: 'La funcion de mejora de fotos transformo completamente mis publicaciones en Portal Inmobiliario. Las visitas a mis avisos aumentaron un 45% desde que empece a usar StageAI.',
                        },
                    ].map((t, i) => (
                        <div key={i} className="bg-background border border-white/10 p-8 rounded-2xl relative">
                            <div className="flex gap-1 text-yellow-500 mb-6">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} size={16} fill="currentColor" />
                                ))}
                            </div>

                            <p className="text-white/80 mb-6 leading-relaxed">"{t.text}"</p>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h5 className="font-bold text-white">{t.name}</h5>
                                    <span className="text-xs text-text-muted">{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
