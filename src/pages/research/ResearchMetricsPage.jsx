import React from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const ResearchMetricsPage = () => {
    const variables = [
        { label: 'TAM - Perceived Usefulness Item 1', code: 'TAM_PU1', type: 'Numeric' },
        { label: 'TAM - Perceived Usefulness Item 2', code: 'TAM_PU2', type: 'Numeric' },
        { label: 'UEQ - Daya Tarik Item 1', code: 'UEQ_ATT1', type: 'Numeric' },
        { label: 'UEQ - Kejelasan Item 1', code: 'UEQ_PER1', type: 'Numeric' },
    ];

    return (
        <DesktopLayout title="Menu">
            <div className="h-11 w-full bg-white dark:bg-slate-900 sticky top-0 z-50 pt-4 px-6 flex justify-between items-center border-b border-transparent rounded-b-2xl">
                <span className="text-xs font-bold">9:41</span>
                <div className="flex items-center space-x-1.5">
                    <span className="material-icons-round text-[14px]">signal_cellular_alt</span>
                    <span className="material-icons-round text-[14px]">wifi</span>
                    <span className="material-icons-round text-[14px]">battery_full</span>
                </div>
            </div>

            <header className="sticky top-11 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 pb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800 transition-colors active:scale-95">
                        <span className="material-icons-round text-primary">arrow_back_ios_new</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">Ekspor Data Lanjut</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Penelitian S3 - Statistik</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-extrabold text-green-600 dark:text-green-400">DATA SIAP EKSPOR</span>
                </div>
            </header>

            <main className="pb-48 p-4 space-y-6 overflow-y-auto no-scrollbar font-display">
                <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Status Kelayakan Data</h2>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">128 / 100 Responden</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full w-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic flex items-center gap-1 font-medium">
                        <span className="material-icons-round text-[14px] leading-none">check_circle</span>
                        Jumlah responden minimal untuk validitas statistik telah terpenuhi.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Opsi Format File</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-[#8c1d3c]/10 text-[#8c1d3c] flex items-center justify-center">
                                <span className="material-icons-round text-2xl font-bold">analytics</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">IBM SPSS Statistics (.sav)</h3>
                                <p className="text-[10px] text-slate-500 italic font-medium">Termasuk variable labels & metadata</p>
                            </div>
                            <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">download</span>
                        </button>
                        <button className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all text-left group">
                            <div className="w-12 h-12 rounded-xl bg-[#1d6f42]/10 text-[#1d6f42] flex items-center justify-center">
                                <span className="material-icons-round text-2xl font-bold">table_view</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Microsoft Excel (.xlsx)</h3>
                                <p className="text-[10px] text-slate-500 italic font-medium">Format tabel mentah untuk cleaning</p>
                            </div>
                            <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">download</span>
                        </button>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Penyusunan Kode Variabel Otomatis</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">Aktif</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[9px] uppercase tracking-tighter text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-4 py-3 font-bold">Label Instrumen</th>
                                    <th className="px-4 py-3 font-bold">Kode SPSS</th>
                                    <th className="px-4 py-3 font-bold">Tipe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {variables.map((v, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{v.label}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-[10px] bg-primary/5 dark:bg-primary/20 text-primary px-2 py-1 rounded font-mono font-bold">{v.code}</code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{v.type}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center justify-center gap-2 w-full active:scale-95 transition-transform">
                            <span className="material-icons-round text-[16px]">settings_input_component</span>
                            Konfigurasi Label Kustom
                        </button>
                    </div>
                </section>

                <section className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex gap-3">
                        <span className="material-icons-round text-primary">info</span>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Catatan Metodologi</p>
                            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 italic font-medium">
                                Ekspor SPSS secara otomatis menyertakan Value Labels (1="Sangat Tidak Setuju", dst.) dan Skala Likert 1-5 atau 1-7 sesuai instrumen penelitian yang digunakan untuk memudahkan proses "Data Analysis" langsung di perangkat lunak statistik.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-10 z-50 max-w-md mx-auto">
                <div className="flex gap-3">
                    <button className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                        <span className="material-icons-round text-xl">file_download</span>
                        <span className="text-sm">Unduh Paket Data (.zip)</span>
                    </button>
                    <button className="w-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl flex items-center justify-center active:scale-[0.98] transition-transform shadow-sm">
                        <span className="material-icons-round">share</span>
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 opacity-60">
                    {[
                        { color: '#8c1d3c', label: 'SPSS' },
                        { color: '#1d6f42', label: 'EXCEL' },
                        { color: '#94a3b8', label: 'CSV' }
                    ].map((fmt) => (
                        <div key={fmt.label} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fmt.color }}></div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{fmt.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            </DesktopLayout>
    );
};

export default ResearchMetricsPage;
