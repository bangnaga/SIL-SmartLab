import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const PendingValidationPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter States
    const [filterTA, setFilterTA] = useState('Semua TA');
    const [filterSemester, setFilterSemester] = useState('Semua Semester');
    const [filterPraktikum, setFilterPraktikum] = useState('Semua Praktikum');
    const [filterKelas, setFilterKelas] = useState('Semua Kelas');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.getWorksheets();
                setReports(data.filter(w => w.status === 'submitted'));
            } catch (error) {
                toast.error('Gagal memuat laporan LKP');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [toast]);

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (report.prediction || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTA = filterTA === 'Semua TA' || report.academic_year === filterTA;
        const matchesSemester = filterSemester === 'Semua Semester' || report.class_semester === filterSemester;
        const matchesPraktikum = filterPraktikum === 'Semua Praktikum' || report.course_name === filterPraktikum;
        const matchesKelas = filterKelas === 'Semua Kelas' || report.class_name === filterKelas;

        return matchesSearch && matchesTA && matchesSemester && matchesPraktikum && matchesKelas;
    });

    const uniqueTA = ['Semua TA', ...new Set(reports.map(r => r.academic_year).filter(Boolean))];
    const uniqueSemester = ['Semua Semester', ...new Set(reports.map(r => r.class_semester).filter(Boolean))];
    const uniquePraktikum = ['Semua Praktikum', ...new Set(reports.map(r => r.course_name).filter(Boolean))];
    const uniqueKelas = ['Semua Kelas', ...new Set(reports.map(r => r.class_name).filter(Boolean))];

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-12 rounded-b-2xl">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Antrian Koreksi</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">LKP Menunggu Validasi</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative group flex-1">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                                placeholder="Cari mahasiswa atau sampel..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showFilters ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                        >
                            <span className="material-icons-round text-xl">{showFilters ? 'filter_list_off' : 'filter_list'}</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-2 gap-2 animate-fade-in">
                            <select
                                value={filterTA}
                                onChange={(e) => setFilterTA(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-[11px] font-bold outline-none appearance-none"
                            >
                                {uniqueTA.map(ta => <option key={ta} value={ta}>{ta}</option>)}
                            </select>
                            <select
                                value={filterSemester}
                                onChange={(e) => setFilterSemester(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-[11px] font-bold outline-none appearance-none"
                            >
                                {uniqueSemester.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={filterPraktikum}
                                onChange={(e) => setFilterPraktikum(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-[11px] font-bold outline-none appearance-none"
                            >
                                {uniquePraktikum.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select
                                value={filterKelas}
                                onChange={(e) => setFilterKelas(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-[11px] font-bold outline-none appearance-none"
                            >
                                {uniqueKelas.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 px-5 py-4 space-y-3 pb-32 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Antrian...</p>
                    </div>
                ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 bg-amber-500 h-full"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 flex items-center justify-center font-bold">
                                        {report.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{report.student_name}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                            {report.course_name} • {report.class_name} ({report.academic_year})
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                                    PENDING
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-50 dark:border-slate-800">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Ekspektasi AI</p>
                                    <p className="text-xs font-extrabold text-slate-800 dark:text-white uppercase">{report.prediction || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Confidence Score</p>
                                    <p className="text-sm font-black text-primary">{Math.round((report.confidence || 0) * 100)}%</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/lab/lkp/validate/${report.id}`)}
                                className="w-full mt-2 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-round text-sm">fact_check</span>
                                Mulai Koreksi
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">done_all</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Semua Selesai!</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Tidak ada laporan LKP yang perlu divalidasi saat ini.</p>
                    </div>
                )}
            </main>
            </DesktopLayout>
    );
};

export default PendingValidationPage;
