import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    Users, GraduationCap, BookOpen, Package, 
    ArrowRightLeft, FileText, Bell, AlertTriangle, 
    CalendarClock, TrendingUp, TrendingDown, 
    RefreshCcw, LogIn, PlusCircle, Edit3, Trash2, 
    ChevronRight, Activity
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [reports, setReports] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data, alertsData, reportsData, activeUsersData] = await Promise.all([
                    api.getAnalyticsSummary(),
                    api.getAlerts(),
                    api.getReports(),
                    api.getActiveUsers()
                ]);
                setAnalytics(data);
                setAlerts(alertsData);
                setReports(reportsData);
                setActiveUsers(activeUsersData);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    // Calculate maximum report value for progress bars
    const maxReportValue = reports ? Math.max(
        reports.total_usage || 0,
        reports.total_waste || 0,
        reports.total_restock || 0,
        reports.total_loans || 0
    ) : 0;

    const getProgressWidth = (value) => {
        if (!maxReportValue || !value) return '0%';
        return `${(value / maxReportValue) * 100}%`;
    };

    const chartData = [
        { name: 'Pemakaian', nilai: reports?.total_usage || 0 },
        { name: 'Masuk', nilai: reports?.total_restock || 0 },
        { name: 'Dipinjam', nilai: reports?.total_loans || 0 },
        { name: 'Waste', nilai: reports?.total_waste || 0 }
    ];

    return (
        <DesktopLayout title="Dashboard">
            <motion.div 
                className="space-y-8 pb-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-primary-800 to-teal-800 p-8 text-white shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    
                    {/* Decorative blobs */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium tracking-wide mb-4"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Sistem Berjalan Lancar
                            </motion.span>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                                Selamat Datang kembali, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">{user?.name}</span>!
                            </h1>
                            <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                                Pantau aktivitas laboratorium, inventaris, dan kinerja sistem secara real-time dari satu pusat kendali.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/inventory')}
                                className="px-5 py-2.5 bg-white text-primary-900 rounded-xl font-bold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow flex items-center gap-2"
                            >
                                <Package className="w-4 h-4" /> Kelola Inventaris
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary-500" /> Ringkasan Sistem
                        </h2>
                    </div>
                    {loading ? (
                        <Skeleton variant="card" count={4} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {analytics && [
                                { icon: Users, label: 'Pengguna', value: analytics.total_users, bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', path: '/admin/users' },
                                { icon: GraduationCap, label: 'Dosen', value: analytics.total_lecturers, bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600', path: '/admin/users?role=lecturer' },
                                { icon: BookOpen, label: 'Praktikum', value: analytics.total_courses, bg: 'bg-gradient-to-br from-teal-400 to-emerald-600', path: '/admin/courses' },
                                { icon: Package, label: 'Inventaris', value: analytics.total_inventory, bg: 'bg-gradient-to-br from-amber-400 to-orange-600', path: '/inventory' },
                                { icon: ArrowRightLeft, label: 'Pinjaman', value: analytics.active_loans, bg: 'bg-gradient-to-br from-cyan-400 to-blue-600', path: '/admin/loans' },
                                { icon: FileText, label: 'Materi', value: analytics.total_materials, bg: 'bg-gradient-to-br from-slate-600 to-slate-800', path: '/materials' },
                            ].map((card, i) => (
                                <motion.div
                                    key={card.label}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    onClick={() => navigate(card.path)}
                                    className={`relative overflow-hidden ${card.bg} rounded-2xl p-5 text-white shadow-lg cursor-pointer group`}
                                >
                                    {/* Abstract shape overlay */}
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-start gap-4">
                                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                            <card.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black tracking-tight mb-1">{card.value}</p>
                                            <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">{card.label}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="xl:col-span-2 space-y-8">
                        
                        {/* Reports Section - Visual Bars */}
                        <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statistik Operasional</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pergerakan inventaris dan pemakaian bulan ini</p>
                                </div>
                            </div>
                            
                            {/* Graphic Chart */}
                            <div className="h-64 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip 
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="nilai" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-5">
                                {[
                                    { label: 'Pemakaian BHP', value: reports?.total_usage || 0, color: 'bg-blue-500', icon: TrendingUp },
                                    { label: 'Barang Masuk', value: reports?.total_restock || 0, color: 'bg-emerald-500', icon: RefreshCcw },
                                    { label: 'Alat Dipinjam', value: reports?.total_loans || 0, color: 'bg-indigo-500', icon: ArrowRightLeft },
                                    { label: 'Waste (Dibuang)', value: reports?.total_waste || 0, color: 'bg-rose-500', icon: TrendingDown },
                                ].map((stat, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <stat.icon className={`w-4 h-4 text-slate-400 group-hover:${stat.color.replace('bg-', 'text-')} transition-colors`} />
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stat.label}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stat.value}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: getProgressWidth(stat.value) }}
                                                transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                                className={`h-full ${stat.color} rounded-full relative`}
                                            >
                                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Smart Alerts */}
                        <motion.section variants={itemVariants}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-rose-500" /> Smart Alerts
                                </h2>
                                {alerts.length > 0 && (
                                    <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1 rounded-full font-bold">
                                        {alerts.length} Perhatian
                                    </span>
                                )}
                            </div>
                            
                            {loading ? (
                                <Skeleton variant="card" count={2} />
                            ) : alerts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {alerts.map((alert, i) => {
                                        const typeConfig = {
                                            low_stock: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', icon: AlertTriangle, iconColor: 'text-amber-500' },
                                            expiry: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-800 dark:text-rose-300', icon: CalendarClock, iconColor: 'text-rose-500' },
                                            overdue: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-800 dark:text-purple-300', icon: CalendarClock, iconColor: 'text-purple-500' },
                                        };
                                        const config = typeConfig[alert.type] || typeConfig.low_stock;
                                        
                                        return (
                                            <motion.div 
                                                whileHover={{ y: -2 }}
                                                key={i} 
                                                className={`${config.bg} border ${config.border} p-5 rounded-2xl flex gap-4`}
                                            >
                                                <div className={`w-12 h-12 shrink-0 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
                                                    <config.icon className={`w-6 h-6 ${config.iconColor}`} />
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-bold ${config.text} mb-1`}>{alert.title}</h4>
                                                    <p className={`text-xs ${config.text} opacity-80 leading-relaxed`}>{alert.message}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Sistem Optimal</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Semua inventaris dan peminjaman dalam kondisi terkendali. Tidak ada peringatan mendesak.</p>
                                </div>
                            )}
                        </motion.section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Active Users */}
                        <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pengguna Online</h2>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {activeUsers.length}
                                </span>
                            </div>
                            
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <Skeleton variant="list" count={3} />
                                ) : activeUsers.length > 0 ? (
                                    <AnimatePresence>
                                        {activeUsers.map((u, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={u.id} 
                                                className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                                            >
                                                <div className="relative">
                                                    <img src={u.avatar_url || 'https://via.placeholder.com/40'} alt={u.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm" />
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</h4>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{u.role}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                ) : (
                                    <div className="py-8 text-center text-slate-500 text-sm">Tidak ada pengguna lain yang online</div>
                                )}
                            </div>
                        </motion.section>

                        {/* Recent Activity Timeline */}
                        <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Aktivitas Terakhir</h2>
                            </div>
                            
                            {loading ? (
                                <Skeleton variant="list" count={4} />
                            ) : (
                                <div className="relative pl-2">
                                    {/* Timeline vertical line */}
                                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                    
                                    <div className="space-y-6">
                                        {(analytics?.recent_activity || []).map((activity, i) => {
                                            const actionConfig = { 
                                                LOGIN: { icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                                                CREATE: { icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                                                UPDATE: { icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                                                DELETE: { icon: Trash2, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' }
                                            };
                                            const config = actionConfig[activity.action] || { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' };
                                            const Icon = config.icon;

                                            return (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                                    key={i} 
                                                    className="relative flex gap-4"
                                                >
                                                    <div className={`relative z-10 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-900`}>
                                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                                    </div>
                                                    <div className="flex-1 pt-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                                            {activity.user_name || 'System'}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                                            {activity.details}
                                                        </p>
                                                        <span className={`inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider ${config.color} px-2 py-0.5 ${config.bg} rounded-md`}>
                                                            {activity.action}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </div>
            </motion.div>
        </DesktopLayout>
    );
};

export default AdminDashboard;
