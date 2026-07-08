import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { Sun, Moon, Palette, Check } from 'lucide-react';

const colors = [
    { name: 'default', label: 'Blue (Default)', class: 'bg-[#3c50e0]' },
    { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { name: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { name: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
];

const bgImages = [
    { id: 'img1', label: 'Lab Modern', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=200' },
    { id: 'img2', label: 'Mikroskop', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=200' },
    { id: 'img3', label: 'Kimia', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=200' },
    { id: 'img4', label: 'Abstrak', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200' },
];

const bgVideos = [
    { id: 'vid1', label: 'Sci-Fi Loop', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', thumb: 'https://img.youtube.com/vi/aqz-KE-bpKQ/mqdefault.jpg' },
    { id: 'vid2', label: 'Fluid', url: 'https://www.youtube.com/watch?v=W0LHTWG-UmQ', thumb: 'https://img.youtube.com/vi/W0LHTWG-UmQ/mqdefault.jpg' },
    { id: 'vid3', label: 'Tech Grid', url: 'https://www.youtube.com/watch?v=X4-9k_L610c', thumb: 'https://img.youtube.com/vi/X4-9k_L610c/mqdefault.jpg' },
    { id: 'vid4', label: 'Particles', url: 'https://www.youtube.com/watch?v=Yl80yMvCj8g', thumb: 'https://img.youtube.com/vi/Yl80yMvCj8g/mqdefault.jpg' },
];

const ThemeCustomizer = () => {
    const { isDarkMode, toggleDarkMode, colorTheme, changeColorTheme } = useTheme();
    const { settings, updatePreview } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <button 
                    onClick={toggleDarkMode}
                    className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full bg-tailadmin-body dark:bg-slate-900"
                    title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Color Palette Toggle */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative p-2 transition-colors rounded-full ${isOpen ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary bg-tailadmin-body dark:bg-slate-900'}`}
                    title="Pilih Warna Tema"
                >
                    <Palette className="w-5 h-5" />
                </button>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-stroke dark:border-slate-700 p-4 z-[999] animate-fade-in">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-tailadmin-sidebar dark:text-white mb-3">Warna Aksen</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => changeColorTheme(c.name)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.class} ${colorTheme === c.name ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800' : ''}`}
                                    title={c.label}
                                >
                                    {colorTheme === c.name && <Check className="w-5 h-5 text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                        <h3 className="text-sm font-bold text-tailadmin-sidebar dark:text-white mb-2">Preset Latar Gambar</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {bgImages.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => updatePreview('bg_url', bg.url)}
                                    className={`relative w-full aspect-video rounded-md overflow-hidden transition-transform hover:scale-105 border-2 ${settings?.bg_url === bg.url ? 'border-primary' : 'border-transparent'}`}
                                    title={bg.label}
                                >
                                    <img src={bg.thumb} alt={bg.label} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                        <h3 className="text-sm font-bold text-tailadmin-sidebar dark:text-white mb-2">Preset Latar Video</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {bgVideos.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => updatePreview('bg_url', bg.url)}
                                    className={`relative w-full aspect-video rounded-md overflow-hidden transition-transform hover:scale-105 border-2 ${settings?.bg_url === bg.url ? 'border-primary' : 'border-transparent'}`}
                                    title={bg.label}
                                >
                                    <img src={bg.thumb} alt={bg.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <span className="material-icons-round text-white text-xs opacity-80">play_circle</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 text-right">
                            <button 
                                onClick={() => updatePreview('bg_url', '')}
                                className="text-[10px] text-red-500 hover:text-red-600 font-semibold uppercase tracking-wider"
                            >
                                Hapus Latar
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                        <h3 className="text-sm font-bold text-tailadmin-sidebar dark:text-white mb-2">Tema Glassmorphism</h3>
                        
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Blur</label>
                                <span className="text-[10px] text-slate-500 font-mono">{settings?.glass_blur || 8}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                step="1"
                                value={settings?.glass_blur || 8}
                                onChange={(e) => updatePreview('glass_blur', e.target.value)}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Opacity</label>
                                <span className="text-[10px] text-slate-500 font-mono">{((settings?.glass_opacity || 0.2) * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings?.glass_opacity || 0.2}
                                onChange={(e) => updatePreview('glass_opacity', e.target.value)}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeCustomizer;
