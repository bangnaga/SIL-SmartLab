import React from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const LKPPage = () => {
    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-8 rounded-b-2xl">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="p-1 -ml-1 text-primary">
                            <span className="material-icons-round text-2xl">chevron_left</span>
                        </button>
                        <h1 className="font-bold text-lg">Lembar Kerja Digital</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-600 rounded-full dark:bg-green-900/30 dark:text-green-400">DRAF TERSIMPAN</span>
                        <span className="material-icons-round text-slate-400">more_horiz</span>
                    </div>
                </div>
                <div className="flex items-center px-6 py-4 bg-white dark:bg-background-dark">
                    <div className="flex flex-1 items-center gap-2 opacity-40">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-sm font-bold">1</div>
                        <span className="text-xs font-bold">Pra-analitik</span>
                    </div>
                    <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div className="flex flex-1 items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-primary">Tahap Analitik</span>
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6 pb-32 overflow-y-auto hide-scrollbar">
                <section className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Pasien</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">John Doe (PX-2024-8812)</p>
                    </div>
                    <span className="material-icons-round text-slate-400">expand_more</span>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Hasil Identifikasi AI</h2>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <span className="material-icons-round text-primary text-[14px] font-bold">temp_preferences_custom</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Terverifikasi AI</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="relative">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfSnSaMJGb0DIXHJSY5X2zTlJdEm1_lDGB7Cv9yH8hbxw9aHnxzwUROF9eV3fSDPET0Sj8giujrbW4cMnWxzrU9r3R_ZCQxanx0a8-0Um-PrE7PKIhQPwaDMJEFP0Tv2ZprZZstpcc4cIfbsNLX-C02gwZchErpGgUtNu2Q1xghHovdUz7HoRn6CKgL5bmp1hqW-BK5TNMKccavn7MWEh3_lC84dL1zSDblibQhQfRuAHaUnM57nuSIFuEfEHH1oeX5VJWhKGzW52f"
                                alt="Bakteri"
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-round text-white text-xs">camera_alt</span>
                                    <span className="text-white text-[10px] font-medium tracking-wide">Mikroskop Olympus BX53 - 1000x</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-500">Prediksi Bakteri</p>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white italic">Staphylococcus aureus</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-500">Skor Kepercayaan</p>
                                    <p className="text-lg font-extrabold text-green-500">98.4%</p>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="material-icons-round text-primary">psychology</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] text-slate-500 leading-tight">Saran AI: Amati klaster mirip anggur, pewarnaan Gram positif (ungu).</p>
                                </div>
                            </div>
                            <button className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all group flex items-center justify-center gap-2 active:scale-95">
                                <span className="material-icons-round text-lg group-hover:text-white">content_copy</span>
                                <span className="text-sm font-bold">Gunakan Hasil AI</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Pengamatan Mikroskopis</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pewarnaan Gram</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                <option selected>Gram Positif (+)</option>
                                <option>Gram Negatif (-)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Morfologi & Susunan</label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Masukkan deskripsi pengamatan..."
                                rows="3"
                                defaultValue="Bentuk kokus, susunan berkluster seperti buah anggur, warna ungu tua."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Bakteri (Identifikasi)</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-bold italic focus:ring-2 focus:ring-primary/20 outline-none"
                                type="text"
                                defaultValue="Staphylococcus aureus"
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Uji Biokimia Lanjutan</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent cursor-pointer">
                                <input defaultChecked className="rounded text-primary focus:ring-primary" type="checkbox" />
                                <span className="text-xs font-medium">Uji Katalase (+)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent cursor-pointer">
                                <input defaultChecked className="rounded text-primary focus:ring-primary" type="checkbox" />
                                <span className="text-xs font-medium">Uji Koagulase (+)</span>
                            </label>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex gap-3 z-50">
                <button className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm bg-white dark:bg-slate-800 active:scale-95 transition-transform">
                    Simpan Draf
                </button>
                <button className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    Selanjutnya: Hasil
                    <span className="material-icons-round text-lg">arrow_forward</span>
                </button>
            </footer>

            <div className="fixed bottom-24 right-4 z-40 max-w-md mx-auto">
                <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-xl backdrop-blur-md">
                    <span className="material-icons-round text-sm">history</span>
                    <span className="text-[10px] font-bold">Menyimpan otomatis...</span>
                </div>
            </div>
            </DesktopLayout>
    );
};

export default LKPPage;
