import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        app_name: 'SmartLab',
        admin_wa: '',
        glass_blur: '8',
        glass_opacity: '0',
        logo_url: '',
        use_glassmorphism: true,
        sidebar_bg: '#ffffff',
        sidebar_blur: '16',
        sidebar_opacity: '0.4',
        sidebar_bg_url: ''
    });
    const [loading, setLoading] = useState(true);

    const extractYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const applyCSSVariables = (currentSettings) => {
        const root = document.documentElement;
        if (currentSettings.glass_blur !== undefined) {
            root.style.setProperty('--glass-blur', `${currentSettings.glass_blur}px`);
        }
        if (currentSettings.glass_opacity !== undefined) {
            root.style.setProperty('--glass-overlay', `rgba(236, 253, 245, ${currentSettings.glass_opacity})`);
        }
        
        if (currentSettings.use_glassmorphism === false || currentSettings.use_glassmorphism === 'false' || currentSettings.use_glassmorphism === 0) {
            document.body.classList.add('no-glassmorphism');
        } else {
            document.body.classList.remove('no-glassmorphism');
        }

        // Apply sidebar settings
        if (currentSettings.sidebar_blur !== undefined) {
            root.style.setProperty('--sidebar-blur', `${currentSettings.sidebar_blur}px`);
        }
        if (currentSettings.sidebar_opacity !== undefined) {
            root.style.setProperty('--sidebar-opacity', `${currentSettings.sidebar_opacity}`);
        }
        if (currentSettings.sidebar_bg !== undefined) {
            root.style.setProperty('--sidebar-color', currentSettings.sidebar_bg);
        }
        
        if (currentSettings.sidebar_bg_url) {
            root.style.setProperty('--sidebar-bg-url', `url('${currentSettings.sidebar_bg_url}')`);
        } else {
            root.style.removeProperty('--sidebar-bg-url');
        }
        
        const ytId = extractYoutubeId(currentSettings.bg_url);
        
        if (ytId) {
            document.body.style.background = 'black'; // black behind video
            document.body.style.backgroundImage = 'none';
        } else if (currentSettings.bg_url) {
            document.body.style.background = 'none'; // Clear the gradient if using image
            document.body.style.backgroundImage = `url('${currentSettings.bg_url}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else if (currentSettings.bg_url === '') {
            // Restore default gradient
            document.body.style.backgroundImage = '';
            document.body.style.background = '';
        }
    };

    const loadSettings = async () => {
        try {
            const data = await api.getSettings();
            const mergedSettings = { ...settings, ...data };
            setSettings(mergedSettings);
            applyCSSVariables(mergedSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Allows updating state directly (for live preview in SettingsPage)
    const updatePreview = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        applyCSSVariables(newSettings);
    };

    const saveSettings = async (newSettings) => {
        try {
            await api.updateSettings(newSettings);
            setSettings({ ...settings, ...newSettings });
            applyCSSVariables({ ...settings, ...newSettings });
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    };

    const ytId = extractYoutubeId(settings.bg_url);

    return (
        <SettingsContext.Provider value={{ settings, updatePreview, saveSettings, loading }}>
            {ytId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -3, overflow: 'hidden', pointerEvents: 'none', backgroundColor: '#000' }}>
                    <iframe 
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&autohide=1`}
                        frameBorder="0" 
                        style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%, -50%)' }}
                        allow="autoplay; encrypted-media" 
                    />
                </div>
            )}
            {children}
        </SettingsContext.Provider>
    );
};
