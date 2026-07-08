import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
const AIFeedbackPage = () => {
    const [filter, setFilter] = useState('Semua');

    const feed = [
        {
            id: 'ID-4029',
            time: '2 jam lalu',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7U7Y8_9x-YRJ_ZBSSzfzJLJF-Vay47MI1_XmOpeDfsHOoAU5nMok5UbQ69j3cfukJHTyDe22xKVdYyPsOK80DOGbnEMi_uiRdCy5FoaimwtXH2ez1aHtGm2SoOEStXY7wGfH-qToh2D8Xcsn3WE9qptDnsv79EHfPidol6YEWpi8SJziXjDYgTbnxueWe2J5FMeCUDn2LUH5ArlADYwt9KijkrZjqf-BBxw_cEE_egilpgQJVkbvgq2Wb5ILHDNwABtedelcEbTOx',
            ai: 'Staphylococcus',
            dosen: 'Streptococcus',
            status: 'corrected',
            statusLabel: 'Corrected'
        },
        {
            id: 'ID-4031',
            time: '5 jam lalu',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVLEWNE6jy1BRNrOWblyBApmub_mbf_0SGr8Y3I7l9zujfbVaAZLaFFTa4gvNT85VDuJqfpiC6L-TyMAcuzL56I0LgNGDGVRmMfNv_DlGoBOmVFEnc719Qd81TGD8BJPWUjNaunBwAvOGnKFFc75sQDo9ZIUgl0ovFr3J_4n90IDJzQTiJ5t4lhN8wXdc8fiXsGwSXXaO92klCjRoxDnNtg0ZYYUJjqLdJyhZBue35i8MAWaNfoQi1KT94e_MCeO-hFDWcprqzxRO5',
            ai: 'E. coli (62%)',
            dosen: 'E. coli',
            status: 'review',
            statusLabel: 'Needs Review'
        }
    ];

    return (
        <DesktopLayout title="Menu">
            <div className="h-11 w-full bg-white/80 dark:bg-slate-900/80 fixed top-0 z-50 backdrop-blur-md"></div>

            <nav className="fixed top-11 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/10 px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-icons-round">chevron_left</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Feedback Loop AI</h1>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10">
                    <span className="material-icons-round text-primary">info_outline</span>
                </button>
            </nav>

            <main className="pt-28 pb-32 px-4 max-w-md mx-auto space-y-8 font-display">
                <section>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-primary/5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Progres Dataset Baru</p>
                                <h2 className="text-2xl font-black text-primary">85% <span className="text-xs font-normal text-slate-400">Tercapai</span></h2>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-xl text-primary">
                                <span className="material-icons-round">analytics</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-4 overflow-hidden">
                            <div className="bg-primary h-full w-[85%] rounded-full shadow-lg shadow-primary/20"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span>850 Valid</span>
                            <span>Target: 1,000</span>
                        </div>
                    </div>
                </section>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    {['Semua', 'Staphylococcus', 'E. coli', 'Candida'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === item ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Koreksi Terbaru Dosen</h3>
                    {feed.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex p-3 gap-4">
                                <div className="relative w-24 h-24 shrink-0">
                                    <img
                                        src={item.img}
                                        alt="Microscopic sample"
                                        className="w-full h-full object-cover rounded-xl border border-slate-50 dark:border-slate-800"
                                    />
                                    <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white shadow-sm ${item.status === 'corrected' ? 'bg-green-500' : 'bg-amber-500'
                                        }`}>
                                        {item.statusLabel}
                                    </div>
                                </div>
                                <div className="flex-1 py-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sample #{item.id}</h4>
                                        <span className="text-[9px] text-slate-400 font-bold italic">{item.time}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 w-10">AI:</span>
                                            <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-900/10">{item.ai}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 w-10 uppercase">Dosen:</span>
                                            <span className="px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black border border-green-100 dark:border-green-900/10">{item.dosen}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500">Gunakan untuk Pelatihan?</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-400 active:scale-95 transition-transform hover:text-red-500">ABAIKAN</button>
                                    <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black active:scale-95 transition-transform shadow-md shadow-primary/10">VALIDASI</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            <div className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 pb-10 z-50 shadow-2xl">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-4 px-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-icons-round">psychology</span>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-tight text-slate-400">Kesiapan Pelatihan</h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">850 data divalidasi siap memperbarui model.</p>
                        </div>
                    </div>
                    <button className="w-full bg-slate-900 dark:bg-primary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-slate-900/20 dark:shadow-primary/20">
                        <span className="material-icons-round text-lg">refresh</span>
                        MULAI PELATIHAN ULANG MODEL
                    </button>
                </div>
            </div>
            </DesktopLayout>
    );
};

export default AIFeedbackPage;
