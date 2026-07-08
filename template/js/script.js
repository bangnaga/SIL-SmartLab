document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Navbar scroll effect
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('bg-white/95', 'dark:bg-n8n-base/95', 'backdrop-blur-md', 'shadow-sm', 'py-4');
                nav.classList.remove('bg-transparent', 'py-5');
            } else {
                nav.classList.remove('bg-white/95', 'dark:bg-n8n-base/95', 'backdrop-blur-md', 'shadow-sm', 'py-4');
                nav.classList.add('bg-transparent', 'py-5');
            }
        });
    }

    // Dark Mode Toggle
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
        // Check for saved theme preference
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Re-render icons if needed (for sun/moon swap)
            // Note: The template currently has bothicons and relies on CSS or JS to swap.
            // Simplified: Just toggle the class on the button or body.
        });
    }
});
