import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

const CourseCatalogPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [classes, setClasses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get all active classes
            const allClasses = await api.getClasses();
            
            // Getting student's current enrollments is a bit tricky
            // We'll iterate classes and check if student is in the list
            // For a production app, a dedicated GET /api/students/:id/classes would be better
            const myEnrolledClasses = [];
            
            for (let cls of allClasses) {
                try {
                    const classDetail = await api.getClass(cls.id);
                    const isEnrolled = classDetail.students?.find(s => s.student_id === user.id);
                    if (isEnrolled) {
                        myEnrolledClasses.push({ ...cls, enrollment_status: isEnrolled.status });
                    }
                } catch (e) {
                    // ignore fetch detail error for now
                }
            }

            // Map all classes to their enrollment status for this student
            const classesWithStatus = allClasses.map(cls => {
                const enrolled = myEnrolledClasses.find(c => c.id === cls.id);
                return {
                    ...cls,
                    enrollment_status: enrolled ? enrolled.enrollment_status : null
                };
            });
            
            setClasses(classesWithStatus);
        } catch (err) {
            toast.error('Gagal memuat katalog praktikum');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const handleEnroll = async (classId) => {
        try {
            await api.enrollStudent(classId, user.id);
            toast.success('Berhasil mendaftar. Menunggu verifikasi Dosen.');
            fetchData(); // Refresh list
        } catch (err) {
            toast.error(err.message || 'Gagal mendaftar praktikum');
        }
    };

    return (
        <DesktopLayout title="Katalog Praktikum">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 rounded-b-2xl">
                <div className="px-4 py-3 flex items-center justify-between pt-8">
                    <div className="flex-1 overflow-hidden">
                        <h1 className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white truncate">
                            Katalog Praktikum
                        </h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">
                            Pendaftaran Kelas Laboratorium
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-4 pt-6 pb-32 overflow-y-auto no-scrollbar">
                <div className="space-y-4">
                    {loading ? (
                        <Skeleton variant="card" count={3} />
                    ) : classes.length > 0 ? (
                        classes.map(cls => (
                            <div key={cls.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                                        <span className="material-icons-round text-2xl">science</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cls.course_name} ({cls.code})</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Dosen: {cls.lecturer_name}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5">
                                            <span className="flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">event</span>
                                                {cls.schedule_day}, {cls.schedule_start}-{cls.schedule_end}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">room</span>
                                                {cls.lab_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">group</span>
                                                {cls.enrolled_count}/{cls.max_students}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center sm:justify-end">
                                    {!cls.enrollment_status ? (
                                        <button 
                                            onClick={() => handleEnroll(cls.id)}
                                            disabled={cls.enrolled_count >= cls.max_students}
                                            className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 press-effect w-full sm:w-auto disabled:opacity-50"
                                        >
                                            <span className="material-icons-round text-sm">person_add</span>
                                            {cls.enrolled_count >= cls.max_students ? 'Penuh' : 'Daftar Praktikum'}
                                        </button>
                                    ) : cls.enrollment_status === 'pending' ? (
                                        <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100 flex items-center gap-1">
                                            <span className="material-icons-round text-sm">schedule</span>
                                            Menunggu Verifikasi
                                        </span>
                                    ) : cls.enrollment_status === 'active' ? (
                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                                            <span className="px-3 py-2 sm:py-1.5 bg-green-50 text-green-600 rounded-xl sm:rounded-lg text-xs font-bold border border-green-100 flex items-center justify-center gap-1 w-full sm:w-auto">
                                                <span className="material-icons-round text-sm">check_circle</span>
                                                Terdaftar
                                            </span>
                                            <button 
                                                onClick={() => window.location.href = `/materials?course_id=${cls.course_id}`}
                                                className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 press-effect w-full sm:w-auto"
                                            >
                                                <span className="material-icons-round text-sm">menu_book</span>
                                                Buka Materi
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-1">
                                            <span className="material-icons-round text-sm">cancel</span>
                                            Ditolak
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200">
                            <span className="material-icons-round text-4xl text-slate-300 mb-2">event_busy</span>
                            <p className="text-sm text-slate-400">Belum ada kelas praktikum yang dibuka.</p>
                        </div>
                    )}
                </div>
            </main>
        </DesktopLayout>
    );
};

export default CourseCatalogPage;
