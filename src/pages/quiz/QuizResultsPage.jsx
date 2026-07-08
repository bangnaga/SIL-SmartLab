import React from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const QuizResultsPage = () => {
    return (
        <DesktopLayout title="Menu">
            <div className="h-11 w-full bg-white dark:bg-background-dark sticky top-0 z-50 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 rounded-b-2xl">
                <span className="text-sm font-bold">9:41</span>
                <div className="flex items-center space-x-1.5">
                    <span className="material-icons-round text-[16px]">signal_cellular_alt</span>
                    <span className="material-icons-round text-[16px]">wifi</span>
                    <span className="material-icons-round text-[18px] rotate-90">battery_full</span>
                </div>
            </div>

            <nav className="bg-white dark:bg-background-dark px-4 py-3 flex items-center justify-between sticky top-11 z-40">
                <button className="w-10 h-10 flex items-center justify-center text-primary">
                    <span className="material-icons-round">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Hasil Kuis</h1>
                <div className="w-10"></div>
            </nav>

            <main className="flex-1 p-5 pb-32 overflow-y-auto no-scrollbar">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center mb-6">
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-width="8"></circle>
                            <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-dasharray="364.4" stroke-dashoffset="54.6" stroke-linecap="round" stroke-width="8"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">85</span>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Skor</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Lulus</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Selamat, Anda Lulus!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Anda siap untuk memulai sesi praktikum laboratorium hari ini.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Benar', val: '17', color: 'green', icon: 'check_circle' },
                        { label: 'Salah', val: '3', color: 'red', icon: 'cancel' },
                        { label: 'Menit', val: '12:45', color: 'primary', icon: 'schedule' }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className={`material-icons-round text-${stat.color === 'primary' ? 'primary' : stat.color + '-500'} mb-1`}>{stat.icon}</span>
                            <span className="block text-xl font-bold text-slate-900 dark:text-white">{stat.val}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">{stat.label}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pembahasan Soal</h3>
                        <span className="text-xs text-primary font-bold">Lihat Semua</span>
                    </div>

                    {[
                        {
                            id: 3,
                            q: 'Berapakah suhu ideal untuk sterilisasi menggunakan autoclave?',
                            your: '100°C',
                            correct: '121°C',
                            exp: 'Sterilisasi efektif dengan autoclave memerlukan suhu 121°C selama 15-20 menit pada tekanan 15 psi (1 atm) untuk membunuh spora bakteri yang tahan panas.'
                        },
                        {
                            id: 7,
                            q: 'Urutan yang benar dalam penggunaan APD adalah?',
                            your: 'Masker, Gown',
                            correct: 'Gown, Masker',
                            exp: 'Sesuai standar WHO, urutan donning (pemakaian) adalah: Gown → Masker/Respirator → Pelindung Mata → Sarung Tangan.'
                        }
                    ].map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 overflow-hidden shadow-sm">
                            <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex items-start gap-3">
                                <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{item.id}</span>
                                <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{item.q}</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Jawaban Anda</span>
                                        <div className="flex items-center gap-1.5 text-red-500 text-sm font-bold">
                                            <span className="material-icons-round text-[16px]">close</span>
                                            {item.your}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Jawaban Benar</span>
                                        <div className="flex items-center gap-1.5 text-green-500 text-sm font-bold">
                                            <span className="material-icons-round text-[16px]">check_circle</span>
                                            {item.correct}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-primary/10 p-3 rounded-lg border border-primary/10">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="material-icons-round text-primary text-[14px]">info</span>
                                        <span className="text-[10px] uppercase font-bold text-primary">Pembahasan</span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.exp}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-5 z-50 pb-8 max-w-md mx-auto">
                <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                    <span>Kembali ke Praktikum</span>
                    <span className="material-icons-round text-sm">arrow_forward</span>
                </button>
            </div>
            </DesktopLayout>
    );
};

export default QuizResultsPage;
