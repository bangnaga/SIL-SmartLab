import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../components/ui/Toast';
import { Save, Settings, Palette, Eye, Image as ImageIcon, X } from 'lucide-react';
import DesktopLayout from '../../components/layout/DesktopLayout';

const BG_PRESETS = [
    { id: 1, name: 'Default Gradient', type: 'image', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=500' },
    { id: 2, name: 'Laboratorium Modern', type: 'image', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2574', thumb: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=500' },
    { id: 3, name: 'Sci-Fi Particles (Video)', type: 'video', url: 'https://www.youtube.com/watch?v=1xN55Yf8dKw', thumb: 'https://img.youtube.com/vi/1xN55Yf8dKw/hqdefault.jpg' },
    { id: 4, name: 'Relaxing Aquarium (Video)', type: 'video', url: 'https://www.youtube.com/watch?v=3rbxoh31kGg', thumb: 'https://img.youtube.com/vi/3rbxoh31kGg/hqdefault.jpg' }
];

const SettingsPage = () => {
    const { settings, updatePreview, saveSettings, loading } = useSettings();
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for the form inputs before they are previewed/saved
    const [formData, setFormData] = useState({
        app_name: '',
        institution_name: '',
        admin_wa: '',
        logo_url: '',
        bg_url: '',
        glass_blur: 8,
        glass_opacity: 0.2,
        use_glassmorphism: true,
        sidebar_bg: '#ffffff',
        sidebar_blur: 16,
        sidebar_opacity: 0.4
    });
    
    // Media Picker State
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [activeTarget, setActiveTarget] = useState(null); // 'logo_url' or 'bg_url'

    useEffect(() => {
        if (settings && !loading) {
            setFormData({
                app_name: settings.app_name || '',
                institution_name: settings.institution_name || 'Smart Laboratorium Poltekkes Makassar',
                admin_wa: settings.admin_wa || '',
                logo_url: settings.logo_url || '',
                bg_url: settings.bg_url || '',
                glass_blur: parseInt(settings.glass_blur) || 8,
                glass_opacity: parseFloat(settings.glass_opacity) || 0.2,
                use_glassmorphism: settings.use_glassmorphism !== false,
                sidebar_bg: settings.sidebar_bg || '#ffffff',
                sidebar_blur: parseInt(settings.sidebar_blur) || 16,
                sidebar_opacity: parseFloat(settings.sidebar_opacity) || 0.4
            });
        }
    }, [settings, loading]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Live preview for glassmorphism and sidebar settings
        if (['glass_blur', 'glass_opacity', 'bg_url', 'sidebar_bg', 'sidebar_blur', 'sidebar_opacity'].includes(name)) {
            updatePreview(name, value);
        }
    };
    
    const openMediaPicker = (targetField) => {
        setActiveTarget(targetField);
        setMediaPickerOpen(true);
    };

    const handleSelectMedia = (url) => {
        setFormData(prev => ({ ...prev, [activeTarget]: url }));
        if (activeTarget === 'bg_url') {
            updatePreview('bg_url', url);
        }
        setMediaPickerOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await saveSettings(formData);
        setIsSaving(false);
        if (success) {
            toast.success('Pengaturan berhasil disimpan!');
        } else {
            toast.error('Gagal menyimpan pengaturan.');
        }
    };

    if (loading) return <DesktopLayout title="Pengaturan"><div className="p-8 text-center">Loading settings...</div></DesktopLayout>;

    return (
        <DesktopLayout title="Pengaturan">
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-emerald-500" />
                        Pengaturan Aplikasi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Kelola identitas dan tema tampilan secara real-time.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className="glass-card p-6 rounded-2xl border border-white/20">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Settings className="w-5 h-5" />
                            Identitas Aplikasi
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Aplikasi Pendek</label>
                                <input
                                    type="text"
                                    name="app_name"
                                    value={formData.app_name}
                                    onChange={handleChange}
                                    className="glass-input w-full p-2.5"
                                    placeholder="e.g. SmartLab SIL"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Institusi / Deskripsi Panjang</label>
                                <input
                                    type="text"
                                    name="institution_name"
                                    value={formData.institution_name}
                                    onChange={handleChange}
                                    className="glass-input w-full p-2.5"
                                    placeholder="e.g. Smart Laboratorium Poltekkes Makassar"
                                />
                                <p className="text-xs text-slate-500 mt-1">Ditampilkan di header halaman (*Top Bar*).</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">URL Logo</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="logo_url"
                                        value={formData.logo_url}
                                        onChange={handleChange}
                                        className="glass-input flex-1 p-2.5"
                                        placeholder="https://example.com/logo.png"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => openMediaPicker('logo_url')}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors"
                                        title="Pilih dari Media Manager"
                                    >
                                        <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">URL Gambar / YouTube Video Latar Belakang</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="bg_url"
                                        value={formData.bg_url}
                                        onChange={handleChange}
                                        className="glass-input flex-1 p-2.5"
                                        placeholder="https://example.com/bg.jpg atau Link YouTube"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => openMediaPicker('bg_url')}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors"
                                        title="Pilih dari Media Manager"
                                    >
                                        <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Masukkan URL gambar (JPG/PNG) atau link video YouTube untuk dijadikan background bergerak (*live wallpaper*).</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Preset Latar Belakang</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {BG_PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, bg_url: preset.url }));
                                                updatePreview('bg_url', preset.url);
                                            }}
                                            className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${formData.bg_url === preset.url ? 'border-primary shadow-lg shadow-primary/30' : 'border-transparent hover:border-white/50'}`}
                                        >
                                            <img src={preset.thumb} alt={preset.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                                                <span className="text-[10px] text-white font-bold leading-tight">{preset.name}</span>
                                            </div>
                                            {preset.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-icons-round text-white/80 text-2xl drop-shadow-md">play_circle</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Kontak WA Admin (No. HP)</label>
                                <input
                                    type="text"
                                    name="admin_wa"
                                    value={formData.admin_wa}
                                    onChange={handleChange}
                                    className="glass-input w-full p-2.5"
                                    placeholder="628123456789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Theme Settings (Glassmorphism) */}
                    <div className="glass-card p-6 rounded-2xl border border-white/20">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Palette className="w-5 h-5" />
                            Tema Glassmorphism (Real-Time)
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Aktifkan Glassmorphism</h3>
                                    <p className="text-xs text-slate-500">Efek kaca tembus pandang pada komponen UI.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.use_glassmorphism}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, use_glassmorphism: e.target.checked }));
                                            updatePreview('use_glassmorphism', e.target.checked);
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            {formData.use_glassmorphism && (
                                <>
                                    <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Tingkat Keburaman (Blur)</label>
                                    <span className="text-xs text-slate-500 font-mono">{formData.glass_blur}px</span>
                                </div>
                                <input
                                    type="range"
                                    name="glass_blur"
                                    min="0"
                                    max="40"
                                    step="1"
                                    value={formData.glass_blur}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Mengontrol seberapa buram efek kaca pada latar belakang.</p>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Intensitas Transparansi (Opacity)</label>
                                    <span className="text-xs text-slate-500 font-mono">{(formData.glass_opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range"
                                    name="glass_opacity"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={formData.glass_opacity}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Mengontrol tingkat kegelapan/keterangan lapisan di atas latar belakang utama.</p>
                            </div>
                            
                            <hr className="border-slate-200 dark:border-slate-700 my-4" />
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Pengaturan Sidemenu (Sidebar)</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Gambar Latar Sidebar</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="sidebar_bg_url"
                                        value={formData.sidebar_bg_url || ''}
                                        onChange={handleChange}
                                        className="flex-1 glass-input px-3 py-2 text-sm"
                                        placeholder="Pilih dari media manager atau masukkan URL..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTarget('sidebar_bg_url');
                                            setMediaPickerOpen(true);
                                        }}
                                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Warna Latar Sidebar</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        name="sidebar_bg"
                                        value={formData.sidebar_bg}
                                        onChange={handleChange}
                                        className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                                    />
                                    <span className="text-sm font-mono text-slate-500">{formData.sidebar_bg}</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Tingkat Keburaman (Blur) Sidebar</label>
                                    <span className="text-xs text-slate-500 font-mono">{formData.sidebar_blur}px</span>
                                </div>
                                <input
                                    type="range"
                                    name="sidebar_blur"
                                    min="0"
                                    max="40"
                                    step="1"
                                    value={formData.sidebar_blur}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Intensitas Latar (Opacity) Sidebar</label>
                                    <span className="text-xs text-slate-500 font-mono">{(formData.sidebar_opacity * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range"
                                    name="sidebar_opacity"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={formData.sidebar_opacity}
                                    onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                            </>
                            )}
                            
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                                <Eye className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Geser slider di atas untuk melihat perubahan tema secara instan! Jangan lupa klik <b>Simpan</b> untuk menerapkan perubahan secara permanen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            updatePreview('glass_blur', settings.glass_blur);
                            updatePreview('glass_opacity', settings.glass_opacity);
                            updatePreview('bg_url', settings.bg_url);
                            updatePreview('sidebar_bg', settings.sidebar_bg);
                            updatePreview('sidebar_blur', settings.sidebar_blur);
                            updatePreview('sidebar_opacity', settings.sidebar_opacity);
                            updatePreview('sidebar_bg_url', settings.sidebar_bg_url);
                            setFormData({
                                ...settings,
                                bg_url: settings.bg_url || '',
                                glass_blur: settings.glass_blur || 8,
                                glass_opacity: settings.glass_opacity || 0.2,
                                use_glassmorphism: settings.use_glassmorphism !== false,
                                sidebar_bg: settings.sidebar_bg || '#ffffff',
                                sidebar_blur: settings.sidebar_blur || 16,
                                sidebar_opacity: settings.sidebar_opacity || 0.4,
                                sidebar_bg_url: settings.sidebar_bg_url || ''
                            });
                        }}
                        className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="glass-button px-6 py-2.5 rounded-xl text-white font-medium flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>

            {/* Media Picker Modal */}
            {mediaPickerOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-3xl rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <ImageIcon className="text-primary w-6 h-6" />
                                Pilih Media (Media Manager)
                            </h3>
                            <button onClick={() => setMediaPickerOpen(false)} className="p-2 hover:bg-black/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto hide-scrollbar p-2">
                            {BG_PRESETS.map(media => (
                                <div 
                                    key={media.id} 
                                    onClick={() => handleSelectMedia(media.url)}
                                    className="cursor-pointer group relative rounded-xl overflow-hidden aspect-video border-2 border-transparent hover:border-primary transition-all"
                                >
                                    <img src={media.thumb} alt={media.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">{media.name}</p>
                                    </div>
                                    {media.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-100">
                                            <span className="material-icons-round text-white text-3xl drop-shadow-lg">play_circle</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DesktopLayout>
    );
};

export default SettingsPage;
