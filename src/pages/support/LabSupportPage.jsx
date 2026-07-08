import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const LabSupportPage = () => {
    const [activeTab, setActiveTab] = useState('tiket');

    const tickets = [
        { id: '#TKT-2023-01', title: 'Kalibrasi Mikroskop B-02', status: 'Diproses', priority: 'Tinggi', date: '21 Okt 2023' },
        { id: '#TKT-2023-02', title: 'Stok Reagen Kadaluarsa', status: 'Selesai', priority: 'Medium', date: '15 Okt 2023' },
    ];

    const faqs = [
        { q: 'Bagaimana cara meminjam alat?', a: 'Gunakan menu Inventaris dan pilih alat yang ingin dipinjam, lalu scan QR Code.' },
        { q: 'Lupa password akun SIL?', a: 'Hubungi laboran di meja informasi atau gunakan fitur Lupa Password di halaman login.' },
        { q: 'Hasil LKP tidak muncul?', a: 'Pastikan Anda sudah menekan tombol Simpan dan koneksi internet stabil.' },
    ];

    return (
        <DesktopLayout title="Menu">
            {/* iOS Status Bar Spacer */}
            <div className="h-12 bg-white/80 dark:bg-background-dark/80 sticky top-0 w-full z-50 backdrop-blur-md"></div>

            {/* Sticky Header */}
            <header className="sticky top-12 w-full z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="px-5 pt-4 pb-3">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">Pusat Bantuan</h1>
                        <button className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <span className="material-icons-round">contact_support</span>
                        </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('tiket')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'tiket' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                        >
                            Tiket Saya
                        </button>
                        <button
                            onClick={() => setActiveTab('faq')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'faq' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                        >
                            FAQ
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-5 pb-32 pt-6">
                {activeTab === 'tiket' ? (
                    <div className="space-y-6">
                        <button className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                            <span className="material-icons-round">add_circle</span>
                            BUAT TIKET LAPORAN
                        </button>

                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tiket Aktif & Riwayat</h2>
                            {tickets.map(t => (
                                <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-start active:scale-[0.98] transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-primary">{t.id}</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                            <span className="material-icons-round text-xs">calendar_today</span>
                                            <span>{t.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${t.status === 'Selesai' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                                            }`}>
                                            {t.status}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400">Prio: {t.priority}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative mb-6">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                                placeholder="Cari solusi..."
                            />
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                                        {faq.q}
                                        <span className="material-icons-round text-slate-300">keyboard_arrow_down</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 p-5 bg-gradient-to-br from-primary to-blue-600 rounded-2xl text-white shadow-xl shadow-primary/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <span className="material-icons-round text-2xl">support_agent</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Hubungi Asisten Lab</h3>
                            <p className="text-xs text-white/80">Tersedia selama jam operasional</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                            <span className="material-icons-round text-sm">chat_bubble</span>
                            WhatsApp
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                            <span className="material-icons-round text-sm">call</span>
                            Telepon
                        </button>
                    </div>
                </div>
            </main>
            </DesktopLayout>
    );
};

export default LabSupportPage;
