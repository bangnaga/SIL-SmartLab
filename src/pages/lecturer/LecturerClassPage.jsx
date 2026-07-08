import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import CurriculumBuilder from '../../components/curriculum/CurriculumBuilder';

const LecturerClassPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeTab, setActiveTab] = useState('curriculum');
    const [enrollments, setEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [submissions, setSubmissions] = useState({ submissions: [], quizzes: [] });
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [savingGrade, setSavingGrade] = useState(false);

    // Class Edit Settings State
    const [classForm, setClassForm] = useState({ name: '', max_students: 25, schedule_day: '', schedule_start: '', schedule_end: '' });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const res = await api.getClasses({ lecturer_id: user.id });
                setClasses(res);
            } catch (err) {
                toast.error('Gagal memuat jadwal praktikum');
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchClasses();
    }, [user]);

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        setActiveTab('curriculum');
        setClassForm({
            name: cls.name,
            max_students: cls.max_students,
            schedule_day: cls.schedule_day,
            schedule_start: cls.schedule_start,
            schedule_end: cls.schedule_end
        });
        setLoadingEnrollments(true);
        try {
            const data = await api.getClassEnrollments(cls.id);
            setEnrollments(data);
        } catch (err) {
            toast.error('Gagal memuat daftar mahasiswa');
        } finally {
            setLoadingEnrollments(false);
        }

        // Fetch submissions
        fetchSubmissions(cls.id);
    };

    const fetchSubmissions = async (classId) => {
        setLoadingSubmissions(true);
        try {
            const data = await api.getClassSubmissions(classId);
            setSubmissions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleVerify = async (enrollmentId, status) => {
        try {
            await api.updateEnrollmentStatus(enrollmentId, status);
            toast.success(`Status berhasil diubah menjadi ${status}`);
            handleSelectClass(selectedClass);
        } catch (err) {
            toast.error('Gagal memperbarui status');
        }
    };

    const handleGradeSubmission = async () => {
        if (!selectedSubmission) return;
        setSavingGrade(true);
        try {
            await api.gradeSubmission(selectedSubmission.id, {
                grade: parseFloat(gradeInput),
                feedback: feedbackInput
            });
            toast.success('Nilai berhasil disimpan');
            setSelectedSubmission(null);
            fetchSubmissions(selectedClass.id);
        } catch (err) {
            toast.error('Gagal menyimpan nilai');
        } finally {
            setSavingGrade(false);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await api.updateClass(selectedClass.id, {
                ...selectedClass,
                ...classForm
            });
            toast.success('Pengaturan kelas berhasil disimpan');
            // Refresh classes list
            const res = await api.getClasses({ lecturer_id: user.id });
            setClasses(res);
            // Update selected class title
            setSelectedClass({ ...selectedClass, ...classForm });
        } catch (err) {
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <DesktopLayout title="Jadwal Praktikum">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 rounded-b-2xl">
                <div className="px-4 py-3 flex items-center pt-8">
                    {selectedClass ? (
                        <button onClick={() => setSelectedClass(null)} className="p-1 -ml-1 text-primary active:scale-95 transition-transform mr-2">
                            <span className="material-icons-round text-2xl">arrow_back</span>
                        </button>
                    ) : null}
                    <div className="flex-1 overflow-hidden">
                        <h1 className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white truncate">
                            {selectedClass ? selectedClass.course_name : 'Jadwal & Verifikasi Praktikum'}
                        </h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">
                            {selectedClass ? `Kelas: ${selectedClass.name} (${selectedClass.code})` : 'Kelola Slot Laboratorium'}
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-4 pt-6 pb-32 overflow-y-auto no-scrollbar">
                {!selectedClass ? (
                    <div className="space-y-4">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Jadwal Kelas Saya</h2>
                        {loading ? (
                            <Skeleton variant="card" count={3} />
                        ) : classes.length > 0 ? (
                            classes.map(cls => (
                                <div key={cls.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center shrink-0">
                                            <span className="material-icons-round text-2xl">class</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cls.course_name} (Kelas: {cls.name})</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-icons-round text-[14px]">event</span>
                                                    {cls.schedule_day}, {cls.schedule_start}-{cls.schedule_end}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-icons-round text-[14px]">room</span>
                                                    {cls.lab_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleSelectClass(cls)}
                                        className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 press-effect w-full sm:w-auto"
                                    >
                                        <span className="material-icons-round text-sm">open_in_new</span>
                                        Buka Kelas
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
                                <span className="material-icons-round text-4xl text-slate-300 mb-2">event_busy</span>
                                <p className="text-sm text-slate-400">Belum ada jadwal praktikum yang diampu.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tab Headers */}
                        <div className="border-b border-slate-200 dark:border-slate-800">
                            <nav className="flex space-x-6" aria-label="Tabs">
                                {[
                                    { id: 'curriculum', name: 'Kurikulum Builder' },
                                    { id: 'students', name: `Siswa (${enrollments.filter(e => e.status === 'active').length})` },
                                    { id: 'tasks', name: 'Tugas Siswa' },
                                    { id: 'settings', name: 'Pengaturan' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            border-b-2 py-3 px-1 text-xs font-bold uppercase tracking-wider transition-all press-effect pb-4 -mb-[2px]
                                            ${activeTab === tab.id
                                                ? 'border-primary text-primary font-black'
                                                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300 dark:text-slate-500 dark:hover:text-slate-300'}
                                        `}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'curriculum' && (
                            <CurriculumBuilder classId={selectedClass.id} />
                        )}

                        {activeTab === 'students' && (
                            <div className="space-y-4">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verifikasi & Daftar Mahasiswa</h2>
                                {loadingEnrollments ? (
                                    <Skeleton variant="list" count={4} />
                                ) : enrollments.length > 0 ? (
                                    enrollments.map(student => (
                                        <div key={student.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <span className="material-icons-round text-xl">person</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{student.student_name}</h3>
                                                    <p className="text-[10px] text-slate-500">{student.nim} • {student.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {student.status === 'pending' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleVerify(student.id, 'rejected')}
                                                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                        >
                                                            <span className="material-icons-round text-sm">close</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleVerify(student.id, 'active')}
                                                            className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-100 transition-colors"
                                                        >
                                                            <span className="material-icons-round text-sm">check</span>
                                                        </button>
                                                    </>
                                                ) : student.status === 'active' ? (
                                                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold">Terverifikasi</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold">Ditolak</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">Belum ada mahasiswa yang mendaftar di kelas ini.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daftar Pengumpulan Tugas Siswa</h2>
                                {loadingSubmissions ? (
                                    <Skeleton variant="list" count={3} />
                                ) : (submissions.submissions.length > 0 || submissions.quizzes.length > 0) ? (
                                    <div className="space-y-4">
                                        {/* Assignments */}
                                        {submissions.submissions.map(sub => (
                                            <div key={sub.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider">Tugas Mandiri</span>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{sub.material_title}</h3>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{sub.student_name} ({sub.nim})</p>
                                                </div>
                                                <div className="flex items-center gap-3 justify-between md:justify-end">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${sub.status === 'graded' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {sub.status === 'graded' ? `Nilai: ${sub.grade}` : 'Perlu Dinilai'}
                                                    </span>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedSubmission(sub);
                                                            setGradeInput(sub.grade || '');
                                                            setFeedbackInput(sub.feedback || '');
                                                        }}
                                                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl press-effect"
                                                    >
                                                        Detail & Nilai
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Quizzes */}
                                        {submissions.quizzes.map(quiz => (
                                            <div key={quiz.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded text-[9px] font-bold uppercase tracking-wider">Kuis Interaktif</span>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{quiz.material_title}</h3>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{quiz.student_name} ({quiz.nim})</p>
                                                </div>
                                                <div>
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-xl text-xs font-black">
                                                        Skor: {quiz.score}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">Belum ada pengumpulan tugas atau kuis.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 space-y-4 max-w-xl">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Pengaturan Kelas</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nama Kelas</label>
                                        <input 
                                            type="text" 
                                            value={classForm.name} 
                                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hari</label>
                                            <input 
                                                type="text" 
                                                value={classForm.schedule_day} 
                                                onChange={(e) => setClassForm({ ...classForm, schedule_day: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kapasitas Mahasiswa</label>
                                            <input 
                                                type="number" 
                                                value={classForm.max_students} 
                                                onChange={(e) => setClassForm({ ...classForm, max_students: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jam Mulai</label>
                                            <input 
                                                type="text" 
                                                value={classForm.schedule_start} 
                                                onChange={(e) => setClassForm({ ...classForm, schedule_start: e.target.value })}
                                                placeholder="HH:MM"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jam Selesai</label>
                                            <input 
                                                type="text" 
                                                value={classForm.schedule_end} 
                                                onChange={(e) => setClassForm({ ...classForm, schedule_end: e.target.value })}
                                                placeholder="HH:MM"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSaveSettings}
                                    disabled={savingSettings}
                                    className="bg-primary text-white font-bold text-xs py-2 px-4 rounded-xl press-effect flex items-center justify-center gap-2"
                                >
                                    {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border-l-8 border-l-primary p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">Detail Pengumpulan Tugas</h3>
                                <p className="text-xs text-slate-500">{selectedSubmission.material_title}</p>
                            </div>
                            <button onClick={() => setSelectedSubmission(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Mahasiswa</label>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedSubmission.student_name} ({selectedSubmission.nim})</p>
                            </div>

                            {selectedSubmission.submission_text && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Jawaban Teks</label>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm mt-1 whitespace-pre-wrap max-h-48 overflow-y-auto text-slate-800 dark:text-slate-100">
                                        {selectedSubmission.submission_text}
                                    </div>
                                </div>
                            )}

                            {selectedSubmission.file_url && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Lampiran File</label>
                                    <div className="mt-1">
                                        <a 
                                            href={selectedSubmission.file_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg press-effect"
                                        >
                                            <span className="material-icons-round text-sm">download</span>
                                            Unduh Lampiran
                                        </a>
                                    </div>
                                </div>
                            )}

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nilai (0-100)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={gradeInput}
                                        onChange={(e) => setGradeInput(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 font-bold text-center text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Catatan / Umpan Balik</label>
                                    <textarea 
                                        value={feedbackInput}
                                        onChange={(e) => setFeedbackInput(e.target.value)}
                                        rows="2"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-2">
                                <button 
                                    onClick={() => setSelectedSubmission(null)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold press-effect"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleGradeSubmission}
                                    disabled={savingGrade}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold press-effect"
                                >
                                    {savingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default LecturerClassPage;
