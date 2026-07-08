import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const ClassMasterPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAcademicYear, setFilterAcademicYear] = useState('Semua');
    const [filterSemester, setFilterSemester] = useState('Semua');
    const [viewMode, setViewMode] = useState('grid');

    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        academic_year: '2026/2027',
        semester: 'Ganjil',
        course_id: '',
        lecturer_id: '',
        lab_id: '',
        schedule_day: 'Senin',
        schedule_start: '08:00',
        schedule_end: '10:00',
        max_students: 25,
        is_active: 1
    });

    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const fetchData = async () => {
        try {
            const [classesData, coursesData, usersData, labsData] = await Promise.all([
                api.getClasses(),
                api.getCourses(),
                api.getUsers(),
                api.getLaboratories()
            ]);
            setClasses(classesData);
            setCourses(coursesData);
            setLecturers(usersData.filter(u => u.role?.toLowerCase() === 'lecturer'));
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

    const handleOpenModal = (cls = null) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({
                code: cls.code || '',
                name: cls.name || '',
                academic_year: cls.academic_year || '2026/2027',
                semester: cls.semester || 'Ganjil',
                course_id: cls.course_id || '',
                lecturer_id: cls.lecturer_id || '',
                lab_id: cls.lab_id || '',
                schedule_day: cls.schedule_day || 'Senin',
                schedule_start: cls.schedule_start || '08:00',
                schedule_end: cls.schedule_end || '10:00',
                max_students: cls.max_students || 25,
                is_active: cls.is_active ?? 1
            });
        } else {
            setEditingClass(null);
            setFormData({
                code: '',
                name: '',
                academic_year: '2026/2027',
                semester: 'Ganjil',
                course_id: courses.length > 0 ? courses[0].id : '',
                lecturer_id: lecturers.length > 0 ? lecturers[0].id : '',
                lab_id: laboratories.length > 0 ? laboratories[0].id : '',
                schedule_day: 'Senin',
                schedule_start: '08:00',
                schedule_end: '10:00',
                max_students: 25,
                is_active: 1
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await api.updateClass(editingClass.id, formData);
                toast.success('Kelas berhasil diperbarui');
            } else {
                await api.createClass(formData);
                toast.success('Kelas baru berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal menyimpan kelas');
        }
    };

    const handleDeleteClass = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Kelas?',
            text: 'Yakin ingin menghapus kelas ini? Tindakan ini tidak bisa dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.deleteClass(id);
            toast.success('Kelas berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal menghapus kelas');
        }
    };

    const uniqueAcademicYears = ['Semua', ...new Set(classes.map(c => c.academic_year).filter(Boolean))];
    const uniqueSemesters = ['Semua', ...new Set(classes.map(c => c.semester).filter(Boolean))];

    const filteredClasses = classes.filter(cls => {
        const matchSearch = (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (cls.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (cls.course_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchYear = filterAcademicYear === 'Semua' || cls.academic_year === filterAcademicYear;
        const matchSemester = filterSemester === 'Semua' || cls.semester === filterSemester;
        
        return matchSearch && matchYear && matchSemester;
    });

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-12 rounded-b-2xl">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Master Kelas</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Kelola Kelas Praktikum</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
                            <span className="material-icons-round">add</span>
                        </button>
                    )}
                </div>

                <div className="px-5 pb-4 flex gap-3 overflow-x-auto hide-scrollbar items-center">
                    <div className="relative group flex-1 min-w-[200px]">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                            placeholder="Cari kelas..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary min-w-max appearance-none transition-all cursor-pointer"
                        value={filterAcademicYear}
                        onChange={(e) => setFilterAcademicYear(e.target.value)}
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px' }}
                    >
                        {uniqueAcademicYears.map(year => (
                            <option key={year} value={year}>{year === 'Semua' ? 'Tahun Ajaran (Semua)' : year}</option>
                        ))}
                    </select>
                    <select 
                        className="bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary min-w-max appearance-none transition-all cursor-pointer"
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px' }}
                    >
                        {uniqueSemesters.map(sem => (
                            <option key={sem} value={sem}>{sem === 'Semua' ? 'Semester (Semua)' : sem}</option>
                        ))}
                    </select>

                    <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1.5 shrink-0 items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-primary'}`}
                        >
                            <span className="material-icons-round text-[20px]">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400 hover:text-primary'}`}
                        >
                            <span className="material-icons-round text-[20px]">view_list</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className={`flex-1 px-5 py-4 pb-32 overflow-y-auto hide-scrollbar ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start' : 'space-y-3'}`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Kelas...</p>
                    </div>
                ) : filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => {
                        const course = courses.find(c => c.id === cls.course_id);
                        const lecturer = lecturers.find(l => l.id === cls.lecturer_id);
                        return (
                            <div key={cls.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex ${viewMode === 'list' ? 'flex-row items-center gap-4' : 'flex-col'}`}>
                                <div className={`flex gap-3 ${viewMode === 'grid' ? 'w-full mb-3' : 'flex-1 min-w-0'}`}>
                                    <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-icons-round">class</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-extrabold text-[15px] mb-1 truncate">{cls.name}</h3>
                                            {isAdmin && viewMode === 'grid' && (
                                                <button onClick={() => handleOpenModal(cls)} className="text-slate-400 hover:text-primary transition-colors ml-2 shrink-0">
                                                    <span className="material-icons-round text-sm">edit</span>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tight truncate">
                                            {cls.code} • {cls.academic_year} ({cls.semester})
                                        </p>
                                    </div>
                                </div>

                                <div className={`${viewMode === 'list' ? 'hidden sm:block sm:w-48 xl:w-64 shrink-0 space-y-1.5' : 'space-y-1.5 mt-2 bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 w-full'}`}>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <span className="material-icons-round text-xs text-primary">auto_stories</span>
                                        <span className="truncate">{course?.name || cls.course_name || 'Tidak ada Praktikum'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <span className="material-icons-round text-xs text-primary">person</span>
                                        <span className="truncate">{lecturer?.name || 'Tidak ada Dosen'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <span className="material-icons-round text-xs text-primary">schedule</span>
                                        <span>{cls.schedule_day}, {cls.schedule_start} - {cls.schedule_end}</span>
                                    </div>
                                </div>
                                
                                {isAdmin && viewMode === 'list' && (
                                    <div className="flex flex-col sm:flex-row gap-2 shrink-0 ml-2">
                                        <button onClick={() => handleOpenModal(cls)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors shadow-sm border border-slate-100 dark:border-slate-700">
                                            <span className="material-icons-round text-[18px]">edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteClass(cls.id)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors shadow-sm border border-red-100 dark:border-red-900/30">
                                            <span className="material-icons-round text-[18px]">delete</span>
                                        </button>
                                    </div>
                                )}

                                {isAdmin && viewMode === 'grid' && (
                                    <div className="mt-3 pt-3 w-full border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteClass(cls.id)}
                                            className="flex-1 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 text-red-500 text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            Hapus Kelas
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-3xl text-slate-400">class</span>
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Kelas</h3>
                        <p className="text-xs text-slate-500">Mulai tambahkan kelas praktikum baru</p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-extrabold text-slate-800 dark:text-white">
                                    {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold">Data Master Kelas Praktikum</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="space-y-4">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kode Kelas</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                            placeholder="Ex: TIK101-A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Kelas</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                            placeholder="Ex: Pemrograman Web Kelas A"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tahun Ajaran</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.academic_year}
                                            onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Semester</label>
                                        <select
                                            value={formData.semester}
                                            onChange={(e) => setFormData({...formData, semester: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        >
                                            <option value="Ganjil">Ganjil</option>
                                            <option value="Genap">Genap</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Praktikum / Mata Kuliah</label>
                                    <select
                                        required
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                    >
                                        <option value="">Pilih Praktikum</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.name} ({course.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dosen Pengampu</label>
                                    <select
                                        required
                                        value={formData.lecturer_id}
                                        onChange={(e) => setFormData({...formData, lecturer_id: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                    >
                                        <option value="">Pilih Dosen</option>
                                        {lecturers.map(lecturer => (
                                            <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Laboratorium</label>
                                    <select
                                        required
                                        value={formData.lab_id}
                                        onChange={(e) => setFormData({...formData, lab_id: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                    >
                                        <option value="">Pilih Lab</option>
                                        {laboratories.map(lab => (
                                            <option key={lab.id} value={lab.id}>{lab.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Hari</label>
                                        <select
                                            value={formData.schedule_day}
                                            onChange={(e) => setFormData({...formData, schedule_day: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        >
                                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jam Mulai</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.schedule_start}
                                            onChange={(e) => setFormData({...formData, schedule_start: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Jam Selesai</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.schedule_end}
                                            onChange={(e) => setFormData({...formData, schedule_end: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Maks Siswa</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.max_students}
                                        onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                    />
                                </div>
                                
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    Simpan Kelas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default ClassMasterPage;
