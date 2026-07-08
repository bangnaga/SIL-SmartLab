/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": {
                    DEFAULT: "var(--primary)",
                    light: "var(--primary-light)",
                    dark: "var(--primary-dark)",
                    50: "var(--primary-50)",
                    100: "var(--primary-100)",
                    200: "var(--primary-200)",
                    300: "var(--primary-300)",
                    400: "var(--primary-400)",
                    500: "var(--primary-500)",
                    600: "var(--primary-600)",
                    700: "var(--primary-700)",
                    800: "var(--primary-800)",
                    900: "var(--primary-900)",
                },
                "tailadmin": {
                    sidebar: "var(--sidebar-bg)",
                    active: "var(--sidebar-active)",
                    body: "var(--body-bg)",
                    stroke: "var(--stroke)",
                },
                "secondary": {
                    DEFAULT: "#8A99AF",
                    light: "#9ca3af",
                    dark: "#4b5563",
                },
                "background": {
                    dark: "#0f172a",
                },
                "surface": {
                    light: "#ffffff",
                    dark: "#1e293b",
                }
            },
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'toast-in': {
                    '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'toast-out': {
                    '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                    '100%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out',
                'slide-up': 'slide-up 0.5s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'shimmer': 'shimmer 1.5s infinite linear',
                'toast-in': 'toast-in 0.3s ease-out',
                'toast-out': 'toast-out 0.2s ease-in forwards',
                'blob': 'blob 7s infinite ease-in-out',
            },
        },
    },
    plugins: [],
}
