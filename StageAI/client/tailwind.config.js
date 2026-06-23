/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Dark Theme Palette
                background: '#0f0c29', // Deep dark blue/purple bg
                surface: '#24243e',   // Card bg
                primary: '#7c3aed',   // Violet/Purple accent
                secondary: '#302b63', // Secondary deep purple
                accent: '#00ddeb',    // Cyan/Teal for highlights
                text: {
                    main: '#ffffff',
                    muted: '#94a3b8'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
