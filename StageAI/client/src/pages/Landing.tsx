import { signInWithGoogle } from '../lib/supabase';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Features } from '../components/landing/Features';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { Testimonials } from '../components/landing/Testimonials';
import { Footer } from '../components/landing/Footer';
import { ArrowRight } from 'lucide-react';

export function Landing() {
    return (
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30 overflow-x-hidden">

            {/* Nav */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/5 bg-background/80 backdrop-blur-md transition-all duration-300">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="font-bold">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Stage<span className="text-primary">AI</span></span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-muted">
                        <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#" className="hover:text-white transition-colors">Precios</a>
                        <a href="#" className="hover:text-white transition-colors">Casos de Uso</a>
                    </div>
                    <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        <button
                            onClick={signInWithGoogle}
                            className="text-white bg-white/10 hover:bg-white/20 font-medium rounded-lg text-sm px-6 py-2.5 text-center border border-white/5 transition-all backdrop-blur-sm"
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={signInWithGoogle}
                            className="hidden sm:block text-black bg-white hover:bg-gray-100 font-bold rounded-lg text-sm px-6 py-2.5 text-center ml-2 transition-all shadow-lg shadow-white/5"
                        >
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            </nav>

            <Hero />
            <TrustStrip />
            <Features />
            <ComparisonTable />
            <Testimonials />

            {/* Bottom CTA */}
            <section className="py-20 bg-gradient-to-b from-primary/10 to-background border-t border-white/5 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Transforma tus propiedades hoy
                    </h2>
                    <p className="text-text-muted mb-8 max-w-xl mx-auto">
                        Unete a cientos de agentes inmobiliarios en Chile que ya usan StageAI para vender mas rapido.
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="px-10 py-5 bg-gradient-to-r from-primary to-accent text-white font-bold text-lg rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-2xl shadow-primary/25 mx-auto"
                    >
                        Prueba StageAI Gratis <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
