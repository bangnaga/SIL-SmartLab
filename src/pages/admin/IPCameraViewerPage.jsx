import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Camera, LayoutGrid, Maximize2, AlertCircle } from 'lucide-react';

const IPCameraViewerPage = () => {
    const toast = useToast();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fullScreenUrl, setFullScreenUrl] = useState(null);

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const data = await api.getLaboratories();
                // Filter only labs that have an IP camera URL set
                const cameraLabs = data.filter(l => l.ip_camera_url && l.ip_camera_url.trim() !== '');
                setLabs(cameraLabs);
            } catch (error) {
                toast.error('Gagal memuat data kamera laboratorium');
            } finally {
                setLoading(false);
            }
        };

        fetchCameras();
    }, []);

    // Helper to handle image load error
    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '';
        e.target.classList.add('hidden');
        e.target.nextSibling.classList.remove('hidden');
    };

    return (
        <DesktopLayout title="IP Camera Multiview">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 text-primary rounded-lg">
                            <Camera className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">IP Camera Multiview</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Memantau seluruh aktivitas laboratorium secara langsung
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                        <LayoutGrid className="w-5 h-5" />
                        <span className="font-medium text-sm">{labs.length} Kamera Aktif</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : labs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Belum Ada IP Camera</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Silakan tambahkan URL IP Camera pada pengaturan Master Laboratorium.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {labs.map((lab) => (
                            <div key={lab.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 group relative">
                                {/* Camera Stream */}
                                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                                    {lab.ip_camera_url.toLowerCase().startsWith('rtsp://') ? (
                                        <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                                            <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
                                            <span className="text-xs font-medium text-slate-400">Stream RTSP (Gunakan App Eksternal)</span>
                                            <a href={lab.ip_camera_url} className="mt-2 text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">Buka Stream</a>
                                        </div>
                                    ) : (
                                        <>
                                            <img 
                                                src={lab.ip_camera_url} 
                                                alt={`Camera ${lab.name}`} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={handleImageError}
                                            />
                                            {/* Fallback if image fails */}
                                            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                                                <AlertCircle className="w-8 h-8 text-rose-500" />
                                                <span className="text-xs font-medium bg-black/50 px-2 py-1 rounded">Stream Offline</span>
                                            </div>
                                        </>
                                    )}

                                    {/* Overlay Action */}
                                    <button 
                                        onClick={() => setFullScreenUrl(lab.ip_camera_url)}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-primary text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Info Bar */}
                                <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
                                    <div>
                                        <h4 className="font-bold text-sm truncate max-w-[200px]">{lab.name}</h4>
                                        <p className="text-xs text-slate-400">{lab.building} {lab.room_number ? `- R.${lab.room_number}` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">LIVE</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {fullScreenUrl && (
                <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4">
                    <button 
                        onClick={() => setFullScreenUrl(null)}
                        className="absolute top-6 right-6 text-white hover:text-rose-500 transition-colors bg-black/50 p-2 rounded-full"
                    >
                        <span className="material-icons-round text-3xl">close</span>
                    </button>
                    <div className="w-full max-w-6xl flex items-center justify-center min-h-[50vh]">
                        {fullScreenUrl.toLowerCase().startsWith('rtsp://') ? (
                            <div className="text-center bg-slate-900 p-12 rounded-2xl border border-slate-700">
                                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Stream RTSP</h3>
                                <p className="text-slate-400 mb-6 max-w-md">
                                    Browser tidak dapat memutar RTSP secara langsung. Silakan salin URL di bawah ini dan buka menggunakan aplikasi seperti VLC Player.
                                </p>
                                <div className="bg-black p-3 rounded-lg flex items-center gap-3">
                                    <code className="text-sm text-emerald-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{fullScreenUrl}</code>
                                    <a href={fullScreenUrl} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors text-sm font-medium">
                                        Buka
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <img 
                                src={fullScreenUrl} 
                                alt="Fullscreen Camera Stream" 
                                className="w-full max-h-[85vh] object-contain mx-auto"
                            />
                        )}
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default IPCameraViewerPage;
