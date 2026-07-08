import React from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const QuizDiscussionPage = () => {
    return (
        <DesktopLayout title="Menu">
            <div className="h-11 w-full bg-white dark:bg-background-dark sticky top-0 z-50 flex items-center justify-between px-6 border-b border-slate-50 dark:border-slate-800 rounded-b-2xl">
                <span className="text-xs font-black text-slate-400">09:41</span>
                <div className="flex items-center space-x-2 text-slate-400">
                    <span className="material-icons-round text-[14px]">signal_cellular_alt</span>
                    <span className="material-icons-round text-[14px]">wifi</span>
                    <span className="material-icons-round text-[14px] rotate-90">battery_full</span>
                </div>
            </div>

            <nav className="bg-white dark:bg-background-dark px-4 py-4 flex items-center justify-between sticky top-11 z-40 border-b border-slate-50 dark:border-slate-800 font-display">
                <button className="w-10 h-10 flex items-center justify-center text-primary active:scale-95 transition-transform">
                    <span className="material-icons-round">arrow_back_ios_new</span>
                </button>
                <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Hasil Kuis</h1>
                <div className="w-10"></div>
            </nav>

            <main className="p-5 pb-40 font-display">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    <div className="relative inline-flex items-center justify-center mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle className="text-slate-50 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                            <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" stroke-dashoffset="54.6" stroke-linecap="round" stroke-width="8" style={{ filter: 'drop-shadow(0 0 8px rgba(19, 127, 236, 0.3))' }}></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">85</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Skor</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-green-500/20 shadow-sm">Lulus</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Selamat, Anda Lulus!</h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Anda siap untuk memulai sesi praktikum laboratorium hari ini.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { icon: 'check_circle', val: '17', label: 'Benar', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
                        { icon: 'cancel', val: '3', label: 'Salah', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                        { icon: 'schedule', val: '12:45', label: 'Menit', color: 'text-primary', bg: 'bg-primary/5' }
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.bg} p-4 rounded-3xl border border-slate-50 dark:border-slate-800/50 text-center active:scale-95 transition-transform`}>
                            <span className={`material-icons-round ${stat.color} mb-1.5 text-lg`}>{stat.icon}</span>
                            <span className="block text-lg font-black text-slate-800 dark:text-white">{stat.val}</span>
                            <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest uppercase">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Pembahasan Soal</h3>
                        <button className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline transition-all">Lihat Semua</button>
                    </div>

                    {[
                        {
                            id: 3,
                            q: 'Berapakah suhu ideal untuk sterilisasi menggunakan autoclave?',
                            yours: '100°C',
                            correct: '121°C',
                            disc: 'Sterilisasi efektif dengan autoclave memerlukan suhu 121°C selama 15-20 menit pada tekanan 15 psi (1 atm) untuk membunuh spora bakteri yang tahan panas.'
                        },
                        {
                            id: 7,
                            q: 'Urutan yang benar dalam penggunaan APD adalah?',
                            yours: 'Masker, Gown',
                            correct: 'Gown, Masker',
                            disc: 'Sesuai standar WHO, urutan donning (pemakaian) adalah: Gown → Masker/Respirator → Pelindung Mata → Sarung Tangan.'
                        }
                    ].map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-red-50 dark:border-red-900/10 overflow-hidden shadow-sm active:scale-[0.99] transition-all">
                            <div className="p-5 bg-red-50/30 dark:bg-red-900/10 border-b border-slate-50 dark:border-slate-800/50 flex items-start gap-4">
                                <span className="bg-red-500 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-red-500/20">{item.id}</span>
                                <p className="text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-100">{item.q}</p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Jawaban Anda</span>
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-black bg-red-50/50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                                            <span className="material-icons-round text-sm">close</span>
                                            {item.yours}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Jawaban Benar</span>
                                        <div className="flex items-center gap-2 text-green-500 text-sm font-black bg-green-50/50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/20">
                                            <span className="material-icons-round text-sm">check_circle</span>
                                            {item.correct}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                                    <div className="flex items-center gap-2 mb-2 relative">
                                        <span className="material-icons-round text-primary text-sm">info_outline</span>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Pembahasan</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed relative italic">
                                        {item.disc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-50 dark:border-slate-800 p-5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all">
                            <div className="flex items-center gap-4">
                                <span className="bg-green-500 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-green-500/20">{i}</span>
                                <p className="text-xs font-bold text-slate-400 truncate w-48">Praktikum kuis nomor {i} telah dijawab...</p>
                            </div>
                            <span className="material-icons-round text-green-500">check_circle</span>
                        </div>
                    ))}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-50 dark:border-slate-800 p-6 pb-10 z-50 max-w-md mx-auto">
                <button className="w-full bg-slate-900 dark:bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-2xl shadow-slate-900/20">
                    <span className="text-xs uppercase tracking-[0.2em]">Kembali ke Dashboard</span>
                    <span className="material-icons-round text-lg">arrow_forward</span>
                </button>
            </div>

            <div className="fixed bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full z-[60] opacity-50 max-w-[128px]"></div>
            </DesktopLayout>
    );
};

export default QuizDiscussionPage;
