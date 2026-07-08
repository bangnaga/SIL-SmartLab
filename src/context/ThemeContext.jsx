import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default mode from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme_mode');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Default color theme from localStorage or default 'blue'
    const [colorTheme, setColorTheme] = useState(() => {
        return localStorage.getItem('color_theme') || 'default';
    });

    // Apply dark mode class to HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        // The body class is also handled for background in index.css
        if (isDarkMode) {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
        }
        localStorage.setItem('theme_mode', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Apply color theme class to body element
    useEffect(() => {
        const root = window.document.documentElement;
        // Remove previous theme classes
        root.classList.remove('theme-orange', 'theme-purple', 'theme-emerald', 'theme-blue');
        
        if (colorTheme !== 'default' && colorTheme !== 'blue') {
            root.classList.add(`theme-${colorTheme}`);
        }
        localStorage.setItem('color_theme', colorTheme);
    }, [colorTheme]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const changeColorTheme = (themeName) => {
        setColorTheme(themeName);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colorTheme, changeColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
