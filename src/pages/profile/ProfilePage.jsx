import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import apiService from '../../services/api';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { darkMode, setDarkMode } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [aiSettings, setAiSettings] = useState([]);
    const [quota, setQuota] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        confirmText: 'OK'
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [settings, userQuota] = await Promise.all([
                apiService.getAISettings(),
                apiService.getUserQuota(user.id)
            ]);
            setAiSettings(settings);
            setQuota(userQuota);
        } catch (err) {
            console.error('Error fetching profile data:', err);
        }
    };

    const handleUpdateApiKey = async (newKey) => {
        if (!newKey) return;
        try {
            setLoading(true);
            await apiService.updateAISetting('GEMINI_API_KEY', newKey);
            await fetchData();
            setModal({
                isOpen: true,
                title: 'Berhasil',
                message: 'API Key Gemini telah diperbarui.',
                type: 'success',
                confirmText: 'Selesai'
            });
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Gagal',
                message: 'Gagal memperbarui API Key.',
                type: 'error',
                confirmText: 'Tutup'
            });
        } finally {
            setLoading(false);
        }
    };

    const convertToWebP = (file, onProgress) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        if(progress <= 90 && onProgress) onProgress(progress);
                    }, 50);

                    canvas.toBlob((blob) => {
                        clearInterval(interval);
                        if (onProgress) onProgress(100);
                        
                        if (!blob) return reject(new Error('Canvas is empty'));
                        const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(webpFile);
                    }, 'image/webp', 0.8);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsConverting(true);
            setConvertProgress(0);
            const webpFile = await convertToWebP(file, setConvertProgress);
            setIsConverting(false);

            setLoading(true);
            await apiService.uploadAvatar(user.id, webpFile);
            
            // Assuming AuthContext updates when we fetch or we can force reload
            setModal({
                isOpen: true,
                title: 'Berhasil',
                message: 'Foto profil telah diperbarui. Silahkan muat ulang halaman jika belum berubah.',
                type: 'success',
                confirmText: 'Selesai',
                onConfirm: () => window.location.reload()
            });
        } catch (err) {
            setIsConverting(false);
            setModal({
                isOpen: true,
                title: 'Gagal',
                message: 'Gagal memperbarui foto profil.',
                type: 'error',
                confirmText: 'Tutup'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setModal({
            isOpen: true,
            title: 'Keluar Sistem',
            message: 'Apakah Anda yakin ingin keluar dari sistem SIL?',
            type: 'warning',
            confirmText: 'KELUAR',
            onConfirm: () => {
                logout();
                navigate('/login');
            }
        });
    };

    const menuItems = [
        {
            group: 'Akun',
            items: [
                { icon: 'person', label: 'Edit Profil', color: 'bg-blue-500' },
                { icon: 'lock', label: 'Ubah Kata Sandi', color: 'bg-orange-500' },
                { icon: 'mail', label: 'Pengaturan Email', color: 'bg-primary-500' },
            ]
        },
        {
            group: 'Kecerdasan Buatan (AI)',
            items: [
                {
                    icon: 'auto_awesome',
                    label: 'Konfigurasi Gemini API',
                    value: aiSettings.find(s => s.key === 'GEMINI_API_KEY')?.value ? 'Aktif' : 'Belum Set',
                    color: 'bg-indigo-600',
                    onClick: () => {
                        const currentKey = aiSettings.find(s => s.key === 'GEMINI_API_KEY')?.value || '';
                        const result = window.prompt('Masukkan Gemini API Key baru:', currentKey);
                        if (result !== null) handleUpdateApiKey(result);
                    }
                }
            ]
        },
        {
            group: 'Preferensi',
            items: [
                { icon: 'dark_mode', label: 'Mode Gelap', type: 'toggle', value: darkMode, setter: setDarkMode, color: 'bg-slate-800' }
            ]
        }
    ];

    if (!user) return null;

    return (
        <DesktopLayout title="Menu">
            {/* Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText}
                onConfirm={modal.onConfirm}
            />

            {/* Header Blur */}
            <div className="h-12 bg-white/80 dark:bg-background-dark/80 sticky top-0 w-full z-50 backdrop-blur-md"></div>

            <header className="px-5 pt-2 pb-6">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-display mb-8">Profil</h1>

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                            <img
                                src={user.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-600 transition-colors">
                            <span className="material-icons-round text-sm">camera_alt</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isConverting || loading} />
                        </label>
                    </div>

                    {isConverting && (
                        <div className="w-32 mb-4">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${convertProgress}%` }}></div>
                            </div>
                            <p className="text-[9px] text-center text-slate-400 mt-1 uppercase tracking-widest font-bold">Mengonversi...</p>
                        </div>
                    )}

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                    <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">{user.role === 'admin' ? 'Administrator Lab' : user.role === 'lecturer' ? 'Dosen' : 'Mahasiswa'}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1 text-lowercase">{user.email}</p>

                </div>
            </header>

            <main className="px-5 pb-32 space-y-8">
                {menuItems.map((group, idx) => (
                    <div key={idx} className="space-y-3">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{group.group}</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            {group.items.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={item.onClick}
                                    className={`flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors ${i !== group.items.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''} ${item.onClick ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center text-white shadow-sm shrink-0`}>
                                            <span className="material-icons-round text-sm">{item.icon}</span>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                            {item.type === 'quota' && (
                                                <div className="w-full mt-1">
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${quota && (quota.llm_usage / quota.llm_quota) > 0.8 ? 'bg-red-500' : 'bg-primary'}`}
                                                            style={{ width: quota ? `${Math.min(100, (quota.llm_usage / quota.llm_quota) * 100)}%` : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {item.type === 'toggle' ? (
                                        <button
                                            onClick={() => item.setter(!item.value)}
                                            className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${item.value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${item.value ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                        </button>
                                    ) : item.type === 'quota' ? (
                                        <span className="text-[10px] font-black text-slate-400 whitespace-nowrap ml-2">{item.value}</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {item.value && <span className="text-[10px] font-black text-slate-400">{item.value}</span>}
                                            <span className="material-icons-round text-slate-300">keyboard_arrow_right</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-100 dark:border-red-900/20"
                >
                    <span className="material-icons-round text-sm">logout</span>
                    KELUAR DARI SISTEM
                </button>

                <p className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
                    SIL POLTEKKES MAKASSAR • V2.4.0
                </p>
            </main>
            </DesktopLayout>
    );
};

export default ProfilePage;
