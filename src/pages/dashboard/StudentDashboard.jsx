import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { 
    BookOpen, QrCode, Search, History, 
    CalendarDays, Bell, AlertTriangle, ArrowRight,
    FlaskConical
} from 'lucide-react';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, eventsData] = await Promise.all([
                    api.getStudentDashboardStats(user?.id || 3),
                    api.getCalendarEvents(),
                ]);
                setStats(statsData);
                setEvents(eventsData.slice(0, 3));
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat pagi';
        if (hour < 17) return 'Selamat siang';
        return 'Selamat malam';
    };

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
        <DesktopLayout title="Dashboard Mahasiswa">
            <motion.div 
                className="space-y-8 pb-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-800 to-cyan-800 p-8 text-white shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    
                    {/* Decorative blobs */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium tracking-wide mb-4"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Siap Belajar
                            </motion.span>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                                {greeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">{user?.name}</span>!
                            </h1>
                            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
                                Akses materi praktikum, pinjam alat laboratorium, dan lihat jadwal kegiatan Anda di sini.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/student/catalog')}
                                className="px-5 py-2.5 bg-white text-indigo-900 rounded-xl font-bold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Cari Alat Lab
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Notifications / Inbox */}
                {!loading && stats?.rejected_enrollments?.length > 0 && (
                    <motion.section variants={itemVariants}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" /> Perhatian
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {stats.rejected_enrollments.map((rej) => (
                                <div key={rej.id} className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-800/50 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-800 flex items-center justify-center shrink-0 shadow-sm">
                                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pendaftaran Ditolak: {rej.class_name}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-3">Mohon maaf, permintaan pendaftaran Anda untuk kelas <strong>{rej.course_name}</strong> telah ditolak.</p>
                                        
                                        {rej.rejection_reason && (
                                            <div className="bg-white/60 dark:bg-slate-900/50 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50 text-xs text-slate-700 dark:text-slate-300 relative">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                                    <span className="font-bold text-rose-600 dark:text-rose-400 text-[10px] uppercase tracking-wider">Pesan Dosen</span>
                                                </div>
                                                <p className="italic">"{rej.rejection_reason}"</p>
                                            </div>
                                        )}
                                        
                                        <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(rej.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Stat Cards / Menu */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-cyan-500" /> Menu Cepat
                        </h2>
                    </div>
                    {loading ? (
                        <Skeleton variant="card" count={4} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: BookOpen, label: 'Materi Belajar', value: 'Lihat', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', path: '/materials' },
                                { icon: Search, label: 'Katalog Alat', value: 'Cari', bg: 'bg-gradient-to-br from-emerald-400 to-teal-600', path: '/student/catalog' },
                                { icon: QrCode, label: 'Scan Barcode', value: 'Scan', bg: 'bg-gradient-to-br from-amber-400 to-orange-600', path: '/student/scan' },
                                { icon: History, label: 'Dipinjam', value: stats?.active_loans || 0, bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600', path: '/student/history' },
                            ].map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => navigate(card.path)}
                                    className={`relative overflow-hidden ${card.bg} rounded-2xl p-5 text-white shadow-lg cursor-pointer group`}
                                >
                                    {/* Abstract shape overlay */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                                    
                                    <div className="relative z-10 flex flex-col gap-3">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl w-fit">
                                            <card.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black tracking-tight mb-1">{card.value}</p>
                                            <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">{card.label}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Aktivitas Lab</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { title: 'Peminjaman Alat', desc: 'Ajukan peminjaman alat untuk praktikum', icon: FlaskConical, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/student/catalog' },
                                    { title: 'Riwayat Transaksi', desc: 'Cek status peminjaman dan pengembalian', icon: History, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', path: '/student/history' },
                                ].map((tool, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => navigate(tool.path)}
                                        className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-800/50"
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
                                    <CalendarDays className="w-4 h-4 text-cyan-500" /> Jadwal Mendatang
                                </h2>
                                <button onClick={() => navigate('/calendar')} className="text-xs text-cyan-600 hover:text-cyan-700 font-bold">Lihat Semua</button>
                            </div>
                            
                            {loading ? (
                                <Skeleton variant="card" count={2} />
                            ) : events.length > 0 ? (
                                <div className="space-y-3">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex flex-col items-center justify-center shrink-0 border border-cyan-100 dark:border-cyan-800">
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
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tidak ada jadwal terdekat</p>
                                    <p className="text-xs text-slate-500 mt-1">Pastikan selalu cek kalender Anda.</p>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </div>
            </motion.div>
        </DesktopLayout>
    );
};

export default StudentDashboard;
