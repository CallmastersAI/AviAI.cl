import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-white">
                Cargando...
            </div>
        );
    }

    return (
        <HelmetProvider>
            <Router>
                <Routes>
                    {/* Public Route */}
                    <Route
                        path="/"
                        element={!session ? <Landing /> : <Navigate to="/dashboard" replace />}
                    />

                    {/* Protected Route */}
                    <Route
                        path="/dashboard"
                        element={session ? <Dashboard /> : <Navigate to="/" replace />}
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </HelmetProvider>
    );
}

export default App;
