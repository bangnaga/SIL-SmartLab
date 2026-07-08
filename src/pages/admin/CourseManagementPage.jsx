import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const CourseManagementPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const isLecturer = user?.role?.toLowerCase() === 'lecturer';

    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        code: '', name: '', credits: 2, semester: 1, category: 'Wajib', lecturer_id: '', lab_id: '', description: ''
    });

    // Students Modal State
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
    const [studentsList, setStudentsList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [rejectingStudentId, setRejectingStudentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // active, pending

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesData, usersData, labsData] = await Promise.all([
                api.getCourses(isLecturer ? { lecturer_id: user.id } : {}),
                api.getUsers(),
                api.getLaboratories()
            ]);
            setCourses(coursesData);
            setLecturers(usersData.filter(u => u.role.toLowerCase() === 'lecturer'));
            setLaboratories(labsData);
        } catch (error) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                code: course.code,
                name: course.name,
                credits: course.credits || 2,
                semester: course.semester || 1,
                category: course.category || 'Wajib',
                lecturer_id: course.lecturer_id || '',
                lab_id: course.lab_id || '',
                description: course.description || ''
            });
        } else {
            setEditingCourse(null);
            setFormData({
                code: '', name: '', credits: 2, semester: 1, category: 'Wajib', lecturer_id: isLecturer ? user.id : '', lab_id: '', description: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await api.updateCourse(editingCourse.id, formData);
                toast.success('Praktikum berhasil diperbarui');
            } else {
                await api.createCourse(formData);
                toast.success('Praktikum baru berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('Gagal menyimpan praktikum');
        }
    };

    const handleDeleteCourse = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Praktikum?',
            text: 'Yakin ingin menghapus praktikum ini? Semua data materi dan kuis di dalamnya akan ikut terhapus!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.deleteCourse(id);
            toast.success('Praktikum berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus praktikum');
        }
    };

    const handleViewStudents = async (course) => {
        setSelectedCourseForStudents(course);
        setShowStudentsModal(true);
        setLoadingStudents(true);
        try {
            const data = await api.getCourseStudents(course.id);
            setStudentsList(data);
        } catch (error) {
            toast.error('Gagal memuat daftar mahasiswa');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleUpdateEnrollment = async (enrollmentId, status, reason = null) => {
        try {
            await api.updateEnrollmentStatus(enrollmentId, status, reason);
            toast.success(`Pendaftaran berhasil di${status === 'active' ? 'terima' : 'tolak'}`);
            if (status === 'rejected') {
                setRejectingStudentId(null);
                setRejectionReason('');
            }
            // Refresh students
            const data = await api.getCourseStudents(selectedCourseForStudents.id);
            setStudentsList(data);
        } catch (error) {
            toast.error('Gagal memperbarui status pendaftaran');
        }
    };

    const handleRemoveStudent = async (enrollmentId) => {
        const result = await Swal.fire({
            title: 'Keluarkan Mahasiswa?',
            text: 'Anda yakin ingin mengeluarkan mahasiswa ini dari kelas? Mahasiswa harus mendaftar ulang untuk bergabung kembali.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, keluarkan!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.removeEnrollment(enrollmentId);
            toast.success('Mahasiswa berhasil dikeluarkan dari kelas');
            // Refresh students
            const data = await api.getCourseStudents(selectedCourseForStudents.id);
            setStudentsList(data);
        } catch (error) {
            toast.error('Gagal mengeluarkan mahasiswa');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-12 rounded-b-2xl">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Praktikum</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Kurikulum Laboratorium</p>
                        </div>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <span className="material-icons-round">add</span>
                    </button>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative group">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                            placeholder="Cari nama atau kode praktikum..."
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
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Praktikum...</p>
                    </div>
                ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
                                        <span className="material-icons-round">auto_stories</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-extrabold text-sm truncate">{course.name}</h3>
                                            <button onClick={() => handleOpenModal(course)} className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-icons-round text-sm">edit</span>
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                            {course.code} • Semester {course.semester}
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                    {course.credits} SKS
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                        {course.lecturer_name?.charAt(0) || 'D'}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{course.lecturer_name || 'Belum Ditentukan'}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => handleViewStudents(course)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors">
                                        <span className="material-icons-round text-[12px]">groups</span>
                                        Mahasiswa
                                    </button>
                                    <button onClick={() => navigate(`/materials?course_id=${course.id}`)} className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold hover:bg-amber-100 flex items-center gap-1 transition-colors">
                                        <span className="material-icons-round text-[12px]">library_books</span>
                                        Materi
                                    </button>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 flex items-center transition-colors">
                                        <span className="material-icons-round text-[14px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">menu_book</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Praktikum Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Tidak ada praktikum yang sesuai dengan pencarian Anda.</p>
                    </div>
                )}
            </main>
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary shadow-2xl overflow-hidden animate-slide-up sm:animate-zoom-in"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingCourse ? 'Edit Praktikum' : 'Tambah Praktikum'}</h2>
                                    <p className="text-xs text-slate-500 font-medium font-display tracking-tight">Kelola kurikulum laboratorium di sini</p>
                                </div>
                                <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar px-1">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Kode Praktikum</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            placeholder="MK001"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nama Praktikum</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            placeholder="Contoh: Hematologi Dasar"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">SKS</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            value={formData.credits}
                                            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Semester</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {!isLecturer && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Dosen Pengampu</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            value={formData.lecturer_id}
                                            onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                                        >
                                            <option value="">Pilih Dosen</option>
                                            {lecturers.map(l => (
                                                <option key={l.id} value={l.id}>{l.name} ({l.nip || 'No NIP'})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Laboratorium Utama</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                        value={formData.lab_id}
                                        onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                                    >
                                        <option value="">Pilih Laboratorium</option>
                                        {laboratories.map(lab => (
                                            <option key={lab.id} value={lab.id}>{lab.name} ({lab.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Deskripsi Singkat</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none resize-none"
                                        placeholder="Gambaran umum praktikum..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 active:scale-95 transition-transform uppercase tracking-wider text-[11px]">
                                    Batal
                                </button>
                                <button type="submit" className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/25 active:scale-95 transition-transform uppercase tracking-wider text-[11px]">
                                    {editingCourse ? 'Simpan Perubahan' : 'Tambah Praktikum'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {/* Students Modal */}
            {showStudentsModal && selectedCourseForStudents && (
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => {setShowStudentsModal(false); setRejectingStudentId(null);}}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border-l-8 border-l-primary shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up sm:animate-zoom-in">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Mahasiswa</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedCourseForStudents.name}</p>
                            </div>
                            <button onClick={() => {setShowStudentsModal(false); setRejectingStudentId(null);}} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-colors">
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>
                        
                        <div className="flex border-b border-slate-100 dark:border-slate-800">
                            <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                                Terverifikasi
                            </button>
                            <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'pending' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}>
                                Permintaan
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-4">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {studentsList.filter(s => s.status === activeTab).length === 0 ? (
                                        <div className="text-center py-10 text-slate-400">
                                            <span className="material-icons-round text-4xl mb-2 opacity-50">person_off</span>
                                            <p className="text-xs font-bold uppercase tracking-widest">Tidak ada mahasiswa</p>
                                        </div>
                                    ) : (
                                        studentsList.filter(s => s.status === activeTab).map(student => (
                                            <div key={student.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-sm">{student.name}</h4>
                                                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-[9px] font-bold rounded-full uppercase tracking-widest">{student.class_name}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-2">
                                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                                <span className="material-icons-round text-[14px]">badge</span>
                                                                <span className="font-mono">{student.nim || 'Tidak ada NIM'}</span>
                                                                <span className="text-[10px] ml-2 text-primary font-semibold">(Angkatan: {student.nim ? '20' + student.nim.substring(4, 6) : '-'})</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                                <span className="material-icons-round text-[14px]">email</span>
                                                                <span>{student.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                                <span className="material-icons-round text-[14px]">phone</span>
                                                                <span>{student.phone || 'Tidak ada no telepon'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {activeTab === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdateEnrollment(student.enrollment_id, 'active')} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                                                                Terima
                                                            </button>
                                                            <button onClick={() => setRejectingStudentId(student.enrollment_id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    )}
                                                    {activeTab === 'active' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">Aktif</span>
                                                            <button onClick={() => handleRemoveStudent(student.enrollment_id)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                                                                Keluarkan
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {rejectingStudentId === student.enrollment_id && (
                                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-red-400 mb-1.5">Alasan Penolakan</label>
                                                        <textarea 
                                                            className="w-full bg-white dark:bg-slate-800 border-none rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-red-200 resize-none mb-2"
                                                            rows="2"
                                                            placeholder="Berikan alasan mengapa permintaan ditolak..."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                        ></textarea>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => {setRejectingStudentId(null); setRejectionReason('');}} className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700">Batal</button>
                                                            <button onClick={() => handleUpdateEnrollment(student.enrollment_id, 'rejected', rejectionReason)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors">Kirim & Tolak</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default CourseManagementPage;
