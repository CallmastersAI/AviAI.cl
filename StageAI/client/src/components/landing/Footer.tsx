export function Footer() {
    return (
        <footer className="bg-black py-12 border-t border-white/10 text-sm">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">

                <div className="col-span-2 md:col-span-1">
                    <span className="text-xl font-bold tracking-tight text-white block mb-4">
                        Stage<span className="text-primary">AI</span>
                    </span>
                    <p className="text-text-muted">
                        Plataforma #1 de Home Staging Virtual con IA para el mercado inmobiliario chileno.
                    </p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-4">Plataforma</h5>
                    <ul className="space-y-2 text-text-muted">
                        <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Precios</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Iniciar Sesion</a></li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-4">Empresa</h5>
                    <ul className="space-y-2 text-text-muted">
                        <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Terminos de Servicio</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Politica de Privacidad</a></li>
                    </ul>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-4">Contacto</h5>
                    <ul className="space-y-2 text-text-muted">
                        <li>Santiago, Chile</li>
                        <li><a href="mailto:contacto@stageai.cl" className="hover:text-primary transition-colors">contacto@stageai.cl</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-text-muted text-xs">
                &copy; {new Date().getFullYear()} StageAI. Todos los derechos reservados.
            </div>
        </footer>
    );
}
