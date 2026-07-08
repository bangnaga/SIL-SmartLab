import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const LKPManagementPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.getWorksheets();
                setReports(data);
            } catch (error) {
                toast.error('Gagal memuat laporan LKP');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [toast]);

    const filteredReports = reports.filter(report =>
        report.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.prediction.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'graded': return 'bg-primary-100 text-primary-600 border-primary-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-12 rounded-b-2xl">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Laporan LKP</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Arsip Laporan Digital</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative group">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                            placeholder="Cari mahasiswa, sampel, atau spesies..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 py-4 space-y-3 pb-32 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Laporan...</p>
                    </div>
                ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        {report.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{report.student_name}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ID: {report.sample_id}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-50 dark:border-slate-800">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hasil Identifikasi</p>
                                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">{report.prediction || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Nilai Akhir</p>
                                    <p className="text-sm font-black text-primary">{report.grade ? `${report.grade}%` : 'BELUM DINILAI'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/lab/lkp/validate/${report.id}`)} // For now redirect to validation view
                                className="w-full mt-2 py-2 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                                Lihat Detail & Validasi
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">inventory</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Laporan Kosong</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Tidak ada laporan LKP yang ditemukan.</p>
                    </div>
                )}
            </main>
            </DesktopLayout>
    );
};

export default LKPManagementPage;
