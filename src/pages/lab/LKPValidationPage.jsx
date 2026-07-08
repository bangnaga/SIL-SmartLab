import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import Modal from '../../components/ui/Modal';

const LKPValidationPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [worksheet, setWorksheet] = useState(null);

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    useEffect(() => {
        const fetchWorksheet = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await api.getWorksheet(id);
                setWorksheet(data);
                if (data.grade) setGrade(data.grade.toString());
                if (data.feedback) setFeedback(data.feedback);
            } catch (err) {
                console.error('Error fetching worksheet:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorksheet();
    }, [id]);

    const handleValidate = async () => {
        if (!worksheet) return;
        setLoading(true);
        try {
            await api.validateWorksheet(worksheet.id, {
                grade: parseFloat(grade),
                feedback,
                status: 'graded'
            });
            setModal({
                isOpen: true,
                title: 'Berhasil',
                message: 'LKP Berhasil divalidasi!',
                type: 'success',
                onConfirm: () => navigate('/dashboard/lecturer')
            });
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Gagal',
                message: 'Gagal memvalidasi LKP.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !worksheet) return (
        <DesktopLayout title="Menu">
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat LKP...</p>
            </div>
            </DesktopLayout>
    );

    if (!worksheet) return (
        <DesktopLayout title="Menu">
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="material-icons-round text-3xl">error_outline</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Terjadi Kesalahan</h3>
                <p className="text-xs text-slate-400 mb-6">Gagal mengambil data LKP dengan ID: {id}. Pastikan data tersedia.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-wider"
                >
                    Kembali
                </button>
            </div>
            </DesktopLayout>
    );

    return (
        <DesktopLayout title="Menu">
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
            />

            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-8 rounded-b-2xl">
                <div className="px-4 py-3 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-icons-round text-primary">chevron_left</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-bold uppercase tracking-wider text-slate-500">Koreksi LKP</h1>
                        <p className="text-[11px] font-medium text-primary">{worksheet.course_name || 'Praktikum'} - {worksheet.sample_id}</p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-icons-round text-primary">more_vert</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-40 overflow-y-auto no-scrollbar">
                <section className="px-4 mt-4">
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-primary/5 shadow-sm flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-primary/20">
                                {worksheet.student_name ? worksheet.student_name.charAt(0) : 'S'}
                            </div>
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-slate-800 dark:text-white">{worksheet.student_name}</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">ID Sampel: {worksheet.sample_id}</p>
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                {worksheet.status}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="px-4 mt-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Temuan Praktikum</h3>
                        </div>
                        <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/20">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Prediksi AI vs Mahasiswa</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-slate-500 mb-1">AI Recommendation:</p>
                                        <p className="text-sm font-bold text-primary">{worksheet.prediction} ({Math.round(worksheet.confidence * 100)}%)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 mb-1">Hasil Masukan:</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white">{worksheet.actual_result || 'Belum Ada'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Koreksi & Umpan Balik</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Catatan Dosen</label>
                                <textarea
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="Berikan umpan balik terperinci..."
                                    rows="3"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Nilai (0-100)</label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 pl-10 text-lg font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="00"
                                            type="number"
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-400">grade</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pb-8 max-w-md mx-auto">
                <div className="px-4 py-4 flex gap-3">
                    <button className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 active:scale-95 transition-transform uppercase tracking-wider flex items-center justify-center gap-2" onClick={handleValidate} disabled={loading}>
                        <span className="material-icons-round text-lg">{loading ? 'sync' : 'verified'}</span>
                        {loading ? 'Memproses...' : 'Validasi LKP Sekarang'}
                    </button>
                </div>
            </footer>
        </DesktopLayout>
    );
};

export default LKPValidationPage;
