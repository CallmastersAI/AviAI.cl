import { Check, X } from 'lucide-react';

export function ComparisonTable() {
    return (
        <section className="py-24 bg-background relative">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        <span className="text-primary">StageAI</span> vs. La Competencia
                    </h2>
                    <p className="text-text-muted max-w-xl mx-auto">
                        Compara nuestra solucion con staging tradicional y el metodo DIY.
                    </p>
                </div>

                <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 md:p-6 text-sm md:text-base font-semibold text-white w-[35%]">Caracteristica</th>
                                    <th className="p-4 md:p-6 text-sm md:text-base font-bold text-primary text-center bg-primary/5 w-[22%]">StageAI</th>
                                    <th className="p-4 md:p-6 text-sm md:text-base font-semibold text-text-muted text-center w-[22%]">Staging Tradicional</th>
                                    <th className="p-4 md:p-6 text-sm md:text-base font-semibold text-text-muted text-center w-[21%]">DIY / Manual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { feature: 'Generacion instantanea (<30s)', us: true, trad: false, diy: false },
                                    { feature: 'Sin conocimientos tecnicos', us: true, trad: true, diy: false },
                                    { feature: 'Calidad fotorrealista 2K', us: true, trad: true, diy: false },
                                    { feature: 'Multiples estilos de diseno', us: true, trad: false, diy: false },
                                    { feature: 'Vaciado virtual de muebles', us: true, trad: false, diy: false },
                                    { feature: 'Mejora de iluminacion IA', us: true, trad: false, diy: false },
                                    { feature: 'Costo por imagen < $1 USD', us: true, trad: false, diy: true },
                                    { feature: 'Proceso 100% online', us: true, trad: false, diy: true },
                                    { feature: 'Publicacion a portales', us: true, trad: false, diy: false },
                                    { feature: 'Procesamiento en lote', us: true, trad: false, diy: false },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 md:p-6 font-medium text-white/90 text-sm">{row.feature}</td>
                                        <td className="p-4 md:p-6 text-center bg-primary/5">
                                            <div className="inline-flex w-7 h-7 rounded-full bg-primary/20 items-center justify-center text-primary">
                                                {row.us ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-center">
                                            <div className="inline-flex w-7 h-7 rounded-full bg-white/5 items-center justify-center text-text-muted">
                                                {row.trad ? <Check size={16} /> : <X size={16} />}
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-center">
                                            <div className="inline-flex w-7 h-7 rounded-full bg-white/5 items-center justify-center text-text-muted">
                                                {row.diy ? <Check size={16} /> : <X size={16} />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
