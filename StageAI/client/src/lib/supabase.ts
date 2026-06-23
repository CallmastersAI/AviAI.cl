import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogle = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard' // Redirect directly to dashboard after login
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        alert("Error al iniciar sesión con Google");
    }
};

export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/'; // Force reload/redirect to home
    } catch (error) {
        console.error("Error signing out:", error);
    }
};
