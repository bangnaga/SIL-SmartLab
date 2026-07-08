import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { 
    Microscope, BookOpen, Presentation, CalendarDays, 
    FileSignature, ClipboardCheck, ArrowRight, Bell
} from 'lucide-react';

const LecturerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        classes: 0,
        materials: 0,
        worksheets_pending: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch events and some basic stats
                const [evData] = await Promise.all([
                    api.getCalendarEvents({ lecturer_id: user.id }),
                    // Assuming we might have a stats endpoint for lecturer later, 
                    // for now we'll just mock some stats or derive from other endpoints if they existed.
                ]);
                
                // For demonstration of the new design, we'll use some mock stats if API doesn't provide them yet
                setStats({
                    classes: 4, // placeholder
                    materials: 12, // placeholder
                    worksheets_pending: 8 // placeholder
                });
                
                setEvents(evData.slice(0, 3));
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <DesktopLayout title="Dashboard Dosen">
            <motion.div 
                className="space-y-8 pb-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-fuchsia-800 to-rose-800 p-8 text-white shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    
                    {/* Decorative blobs */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium tracking-wide mb-4"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Sesi Aktif
                            </motion.span>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                                Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-orange-300">{user?.name}</span>!
                            </h1>
                            <p className="text-violet-100 max-w-xl text-sm leading-relaxed">
                                Kelola kelas praktikum, bagikan materi, dan tinjau laporan praktikum mahasiswa Anda dengan mudah.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/lecturer/classes')}
                                className="px-5 py-2.5 bg-white text-fuchsia-900 rounded-xl font-bold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow flex items-center gap-2"
                            >
                                <Presentation className="w-4 h-4" /> Buka Kelas
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stat Cards / Quick Links */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <ClipboardCheck className="w-4 h-4 text-fuchsia-500" /> Akses Cepat & Ringkasan
                        </h2>
                    </div>
                    {loading ? (
                        <Skeleton variant="card" count={3} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: Presentation, label: 'Kelas Diampu', value: stats.classes, bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', path: '/lecturer/classes' },
                                { icon: BookOpen, label: 'Materi Kuliah', value: stats.materials, bg: 'bg-gradient-to-br from-emerald-400 to-teal-600', path: '/materials' },
                                { icon: FileSignature, label: 'Menunggu Review', value: stats.worksheets_pending, bg: 'bg-gradient-to-br from-amber-400 to-orange-600', path: '/lecturer/classes' }, // TODO: route to grading
                            ].map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => navigate(card.path)}
                                    className={`relative overflow-hidden ${card.bg} rounded-2xl p-6 text-white shadow-lg cursor-pointer group`}
                                >
                                    {/* Abstract shape overlay */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                                    
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-2">
                                                <card.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-3xl font-black tracking-tight">{card.value}</p>
                                            <p className="text-xs font-medium text-white/90 uppercase tracking-wider">{card.label}</p>
                                        </div>
                                        <div className="h-full flex items-end">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Lab Tools */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Alat Bantu Pengajaran</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'AI Analisis Bakteri', desc: 'Deteksi morfologi bakteri secara otomatis', icon: Microscope, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/lab/bacteria-detection' },
                                    { title: 'Katalog Modul', desc: 'Akses seluruh dokumen PDF praktikum', icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', path: '/materials' },
                                ].map((tool, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => navigate(tool.path)}
                                        className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/50"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <tool.icon className={`w-6 h-6 ${tool.color}`} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{tool.title}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    </div>

                    {/* Right Column - Schedule */}
                    <div className="space-y-6">
                        <motion.section variants={itemVariants}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-blue-500" /> Jadwal Mendatang
                                </h2>
                                <button onClick={() => navigate('/calendar')} className="text-xs text-blue-600 hover:text-blue-700 font-bold">Lihat Semua</button>
                            </div>
                            
                            {loading ? (
                                <Skeleton variant="card" count={2} />
                            ) : events.length > 0 ? (
                                <div className="space-y-3">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
                                                <span className="text-xs font-bold uppercase">{new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none">{new Date(event.event_date).getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{event.title}</h4>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {event.start_time}-{event.end_time}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                                                    📍 {event.location || 'Laboratorium Utama'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <CalendarDays className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tidak ada jadwal hari ini</p>
                                    <p className="text-xs text-slate-500 mt-1">Waktu luang Anda!</p>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </div>
            </motion.div>
        </DesktopLayout>
    );
};

export default LecturerDashboard;
