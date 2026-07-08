import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, FlaskConical, ShieldCheck, GraduationCap, Microscope } from 'lucide-react';

const DEMO_ACCOUNTS = [
    { role: 'ADMIN', label: 'Admin', email: 'admin@sil.ac.id', password: 'password123', icon: ShieldCheck, color: 'from-violet-500 to-fuchsia-600' },
    { role: 'DOSEN', label: 'Dosen', email: 'dosen@sil.ac.id', password: 'password123', icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { role: 'MAHASISWA', label: 'Mahasiswa', email: 'mahasiswa@sil.ac.id', password: 'password123', icon: Microscope, color: 'from-teal-400 to-emerald-600' },
];

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeDemo, setActiveDemo] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await api.login(email || 'admin@sil.ac.id', password || 'password123');
            login(data.user);
            toast.success(`Selamat datang, ${data.user.name}!`);

            const userRole = data.user.role.toLowerCase();
            if (userRole === 'admin') navigate('/dashboard/admin');
            else if (userRole === 'lecturer') navigate('/dashboard/lecturer');
            else navigate('/dashboard/student');
        } catch (err) {
            setError('Login gagal. Periksa kembali email dan kata sandi Anda.');
            toast.error('Login gagal. Kredensial tidak valid.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (account) => {
        setEmail(account.email);
        setPassword(account.password);
        setActiveDemo(account.role);
        setError(null);
    };

    return (
        <div className="min-h-screen flex overflow-hidden bg-white">
            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-500 to-indigo-700" />

                {/* Geometric layered shapes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    {/* Large diagonal planes */}
                    <polygon points="0,0 400,0 200,600 0,600" fill="rgba(255,255,255,0.06)" />
                    <polygon points="200,0 600,0 400,600 100,600" fill="rgba(255,255,255,0.04)" />
                    <polygon points="450,0 800,0 800,300 300,600" fill="rgba(0,0,0,0.08)" />
                    
                    {/* Mid-layer facets */}
                    <polygon points="0,100 300,0 400,200 50,350" fill="rgba(255,255,255,0.08)" />
                    <polygon points="150,200 500,100 600,350 200,450" fill="rgba(255,255,255,0.05)" />
                    <polygon points="300,300 700,150 800,450 400,550" fill="rgba(0,0,0,0.06)" />
                    <polygon points="0,400 350,250 500,500 100,600" fill="rgba(255,255,255,0.07)" />
                    
                    {/* Accent highlights */}
                    <polygon points="50,0 250,0 150,200 0,150" fill="rgba(255,255,255,0.12)" />
                    <polygon points="500,0 750,0 800,100 600,200" fill="rgba(255,255,255,0.1)" />
                    <polygon points="0,500 200,400 250,600 0,600" fill="rgba(255,255,255,0.09)" />
                    <polygon points="600,400 800,350 800,600 500,600" fill="rgba(255,255,255,0.08)" />
                </svg>

                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-cyan-400 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Top Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                            <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm tracking-wide leading-tight">SmartLab SIL</p>
                            <p className="text-white/70 text-[10px] tracking-widest uppercase">Poltekkes Makassar</p>
                        </div>
                    </div>

                    {/* Center Text */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
                                Sistem Informasi<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                                    Laboratorium
                                </span>
                            </h1>
                            <p className="text-white/75 text-base leading-relaxed max-w-sm">
                                Platform manajemen laboratorium terpadu untuk mendukung kegiatan akademik dan riset kesehatan.
                            </p>
                        </motion.div>

                        {/* Feature chips */}
                        <div className="flex flex-wrap gap-2 mt-8">
                            {['Inventaris Real-time', 'AI Analisis Bakteri', 'Manajemen Kelas', 'Laporan Terpadu'].map((f, i) => (
                                <motion.span
                                    key={f}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-medium"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300"></span>
                                    {f}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    {/* Bottom badge */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {['bg-teal-300', 'bg-indigo-300', 'bg-cyan-400'].map((c, i) => (
                                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white/40`} />
                            ))}
                        </div>
                        <p className="text-white/70 text-xs">Digunakan oleh ratusan mahasiswa & dosen</p>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 md:p-12 bg-white">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <FlaskConical className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-slate-800 tracking-tight">SmartLab SIL</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Masuk</h2>
                    <p className="text-slate-500 text-sm mb-8">Akses sistem laboratorium dengan akun Anda</p>

                    {/* Error alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border border-red-200"
                            >
                                <span className="text-red-500">⚠</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat Email</label>
                            <input
                                type="email"
                                placeholder="contoh@sil.ac.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-slate-800 text-sm placeholder-slate-400 transition-all bg-slate-50 hover:bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Kata Sandi</label>
                                <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-medium">Lupa sandi?</button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-slate-800 text-sm placeholder-slate-400 transition-all bg-slate-50 hover:bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.01 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Masuk
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Demo Akun</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Demo account cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {DEMO_ACCOUNTS.map((account) => {
                            const Icon = account.icon;
                            const isActive = activeDemo === account.role;
                            return (
                                <motion.button
                                    key={account.role}
                                    type="button"
                                    onClick={() => fillDemo(account)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                                        isActive
                                            ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-500/10'
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${isActive ? 'text-teal-700' : 'text-slate-700'}`}>{account.label}</p>
                                        <p className="text-[9px] text-slate-400 leading-tight hidden sm:block">Klik untuk isi</p>
                                    </div>
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    <p className="text-center text-[11px] text-slate-400 mt-6">
                        Pilih akun demo di atas lalu klik <span className="font-bold text-teal-600">Masuk</span> — sandi diisi otomatis.
                    </p>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-slate-400 font-medium">Sistem Online</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            © 2026 SmartLab SIL
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
