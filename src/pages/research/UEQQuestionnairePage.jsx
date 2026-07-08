import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';

const UEQQuestionnairePage = () => {
    const [selections, setSelections] = useState({});

    const questions = [
        { id: 'q1', dimension: 'Daya Tarik', left: 'Membingungkan', right: 'Jelas' },
        { id: 'q2', dimension: 'Efisiensi', left: 'Tidak Efisien', right: 'Efisien' },
        { id: 'q3', dimension: 'Ketepatan', left: 'Tidak Dapat Diandalkan', right: 'Dapat Diandalkan' },
        { id: 'q4', dimension: 'Stimulasi', left: 'Membosankan', right: 'Menarik' },
    ];

    const handleSelect = (qid, val) => {
        setSelections({ ...selections, [qid]: val });
    };

    return (
        <DesktopLayout title="Menu">
            <style>{`
                .ueq-radio:checked {
                    background-color: #137fec;
                    border-color: #137fec;
                    box-shadow: 0 0 0 2px white inset;
                }
            `}</style>

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 font-display rounded-b-2xl">
                <div className="px-4 h-14 flex items-center justify-between max-w-md mx-auto">
                    <button className="text-primary p-2 -ml-2">
                        <span className="material-icons-round">chevron_left</span>
                    </button>
                    <h1 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-500">Kuesioner UEQ</h1>
                    <div className="w-10"></div>
                </div>
                <div className="w-full h-1 bg-primary/10">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: '35%' }}></div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-md mx-auto px-4 py-6 pb-32 font-display">
                <section className="mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-primary/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-icons-round">info</span>
                            </div>
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Instruksi Penelitian</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                            Silakan isi kuesioner ini untuk mengevaluasi <span className="text-primary font-bold">Sistem Manajemen Laboratorium Medis</span>.
                            Pilihlah satu dari tujuh skala yang paling menggambarkan perasaan Anda.
                        </p>
                    </div>
                </section>

                <section className="space-y-6">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-primary/5 active:scale-[0.99] transition-all">
                            <div className="flex justify-between items-center mb-6 px-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Dimensi: {q.dimension}</span>
                                <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">{idx + 1} dari 26</span>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    <span className="w-1/3 text-left">{q.left}</span>
                                    <span className="w-1/3 text-right">{q.right}</span>
                                </div>
                                <div className="flex justify-between items-center relative px-2">
                                    <div className="absolute h-px bg-slate-100 dark:bg-slate-800 w-[90%] left-[5%] top-1/2 -translate-y-1/2 z-0"></div>
                                    {[1, 2, 3, 4, 5, 6, 7].map((val) => (
                                        <label key={val} className="relative z-10">
                                            <input
                                                type="radio"
                                                name={q.id}
                                                checked={selections[q.id] === val}
                                                onChange={() => handleSelect(q.id, val)}
                                                className="ueq-radio w-6 h-6 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-full appearance-none cursor-pointer transition-all hover:border-primary/50"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="relative h-44 w-full rounded-3xl overflow-hidden mt-8 opacity-40 grayscale group hover:opacity-60 transition-all">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS_Fn9UuJ_otBd76nkjYKttR5bm6MTiz3UtnivKEx8WJdAsxJb_yhQ_Nsf3VlOYnfnUxCA3fr6aTr1UOc0Pcta45i6Ua0nAtXflF2w4bd60pH7CfGSTt99j3WB_MbfQY2_VM_2JE0kVMutwenAvpWQytPxehKx_aUd0-XTFhrFFntFR5WL0KPcIjYXFyQdAoFrLXv5piZT6TkrB8T6-edikHHBlEYdjAskMjVSWqseiT3YPprgsaf9xSczZyDIYqMPJ7YxR6G5GtmQ"
                            alt="Lab"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent"></div>
                    </div>

                    <div className="text-center py-6">
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">
                            Gulir ke bawah untuk instrumen lainnya (Total 26 butir)
                        </p>
                    </div>
                </section>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-primary/10 pb-10 pt-4 px-6 z-50 max-w-md mx-auto">
                <div className="flex gap-4">
                    <button className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                        Simpan Draft
                    </button>
                    <button className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Selanjutnya
                        <span className="material-icons-round text-sm">arrow_forward</span>
                    </button>
                </div>
            </footer>
        </DesktopLayout>
    );
};

export default UEQQuestionnairePage;
