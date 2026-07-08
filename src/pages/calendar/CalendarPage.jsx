import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const CalendarPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const isStudent = user?.role?.toLowerCase() === 'student';
    
    // Core data states
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Metadata
    const [labs, setLabs] = useState([]);
    const [classes, setClasses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    
    const [filterLab, setFilterLab] = useState('all');
    const [filterYear, setFilterYear] = useState('2026/2027');
    const [filterSemester, setFilterSemester] = useState('Ganjil');
    const [filterLecturer, setFilterLecturer] = useState('all');
    const [filterClass, setFilterClass] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedEventForEnroll, setSelectedEventForEnroll] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        day_of_week: 'Senin',
        start_time: '08:00',
        end_time: '10:00',
        location: '',
        event_type: 'practicum',
        lab_id: '',
        class_id: '',
        lecturer_id: '',
        academic_year: '2025/2026',
        semester: 'Ganjil'
    });

    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Load master data on mount
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [labsData, classesData, usersData] = await Promise.all([
                    api.getLaboratories(),
                    api.getClasses(),
                    api.getUsers()
                ]);
                
                setLabs(labsData);
                setClasses(classesData);
                
                // Filter users to get only lecturers
                const filteredLecturers = usersData.filter(u => u.role?.toLowerCase() === 'lecturer');
                setLecturers(filteredLecturers);

                if (labsData.length > 0) {
                    setFilterLab(labsData[0].id);
                }
            } catch (err) {
                console.error('Error loading master data:', err);
                toast.error('Gagal memuat master data pendukung.');
            }
        };
        loadMasterData();
    }, []);

    // Load schedules when filters change
    useEffect(() => {
        fetchSchedules();
    }, [filterLab, filterYear, filterSemester, filterLecturer, filterClass]);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const data = await api.getCalendarEvents({
                lab_id: filterLab === 'all' ? undefined : filterLab,
                academic_year: filterYear,
                semester: filterSemester,
                lecturer_id: filterLecturer === 'all' ? undefined : filterLecturer,
                class_id: filterClass === 'all' ? undefined : filterClass
            });
            setEvents(data);
        } catch (err) {
            console.error('Error fetching schedules:', err);
            toast.error('Gagal mengambil jadwal mingguan');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = (day) => {
        const activeLab = labs.find(l => l.id.toString() === filterLab?.toString());
        
        setFormData({
            title: '',
            description: '',
            day_of_week: day || 'Senin',
            start_time: '08:00',
            end_time: '10:00',
            location: activeLab ? activeLab.name : '',
            event_type: 'practicum',
            lab_id: filterLab,
            class_name: '',
            lecturer_id: lecturers[0]?.id || '',
            academic_year: filterYear,
            semester: filterSemester
        });
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (event) => {
        if (isStudent) {
            setSelectedEventForEnroll(event);
            return;
        }
        setFormData({
            title: event.title,
            description: event.description || '',
            day_of_week: event.day_of_week || 'Senin',
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location || '',
            event_type: event.event_type || 'practicum',
            lab_id: event.lab_id,
            class_id: event.class_id || '',
            lecturer_id: event.lecturer_id || '',
            academic_year: event.academic_year,
            semester: event.semester
        });
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleEnroll = async () => {
        if (!selectedEventForEnroll || !selectedEventForEnroll.class_id) {
            toast.error('Gagal: Event ini tidak terhubung ke kelas yang valid.');
            return;
        }
        try {
            await api.enrollStudent(selectedEventForEnroll.class_id, user.id);
            toast.success('Berhasil mendaftar! Menunggu verifikasi dari Dosen.');
            setSelectedEventForEnroll(null);
        } catch (err) {
            toast.error(err.message || 'Gagal mendaftar ke kelas ini.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Validation: End time must be greater than start time
        if (formData.start_time >= formData.end_time) {
            toast.error('Jam selesai harus lebih besar dari jam mulai');
            return;
        }
        
        try {
            if (editingEvent) {
                await api.updateCalendarEvent(editingEvent.id, formData);
                toast.success('Jadwal berhasil diperbarui');
            } else {
                await api.createCalendarEvent(formData);
                toast.success('Jadwal baru berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchSchedules();
        } catch (err) {
            toast.error(err.message || 'Gagal menyimpan jadwal');
        }
    };

    const handleDelete = async () => {
        if (!editingEvent) return;
        const result = await Swal.fire({
            title: 'Hapus Jadwal?',
            text: 'Hapus jadwal ini secara permanen?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.deleteCalendarEvent(editingEvent.id);
            toast.success('Jadwal telah dihapus');
            setIsModalOpen(false);
            fetchSchedules();
        } catch (err) {
            toast.error('Gagal menghapus jadwal');
        }
    };

    return (
        <DesktopLayout title="Jadwal Praktikum Mingguan">
            <div className="h-11 w-full"></div>

            {/* Header Area */}
            <header className="bg-white dark:bg-slate-900 px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                            <span className="material-icons-round text-white text-xl">view_week</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Jadwal Praktikum Mingguan</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengaturan Jadwal Semester</p>
                        </div>
                    </div>

                    {/* Simple Selectors */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">LABORATORIUM</label>
                            <select 
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary" 
                                value={filterLab} 
                                onChange={e => setFilterLab(e.target.value)}
                            >
                                <option value="all">Semua Lab</option>
                                {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">TAHUN AJARAN</label>
                            <input 
                                type="text" 
                                className="px-3 py-1.5 w-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary text-center" 
                                placeholder="Tahun" 
                                value={filterYear} 
                                onChange={e => setFilterYear(e.target.value)} 
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">SEMESTER</label>
                            <select 
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary" 
                                value={filterSemester} 
                                onChange={e => setFilterSemester(e.target.value)}
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">DOSEN</label>
                            <select 
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary" 
                                value={filterLecturer} 
                                onChange={e => setFilterLecturer(e.target.value)}
                            >
                                <option value="all">Semua Dosen</option>
                                {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">KELAS</label>
                            <select 
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary" 
                                value={filterClass} 
                                onChange={e => setFilterClass(e.target.value)}
                            >
                                <option value="all">Semua Kelas</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Weekly Schedule Board */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-6 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <span className="material-icons-round animate-spin text-4xl text-primary mb-2">autorenew</span>
                        <p className="text-sm font-bold text-slate-450">Memuat Jadwal...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {daysOfWeek.map(day => {
                            const dayEvents = events.filter(e => e.day_of_week === day);
                            return (
                                <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/60 dark:border-slate-800 shadow-sm flex flex-col min-h-[350px]">
                                    {/* Day Header */}
                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
                                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">{day}</h3>
                                        {!isStudent && (
                                            <button 
                                                onClick={() => handleOpenCreateModal(day)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary dark:hover:text-primary hover:border-primary transition-all press-effect shadow-sm"
                                                title={`Tambah praktikum untuk hari ${day}`}
                                            >
                                                <span className="material-icons-round text-sm font-extrabold">add</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* List of events inside that day */}
                                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                                        {dayEvents.length > 0 ? (
                                            dayEvents.map(event => (
                                                <div 
                                                    key={event.id}
                                                    onClick={() => handleOpenEditModal(event)}
                                                    className={`group bg-white dark:bg-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl transition-all shadow-sm flex flex-col relative overflow-hidden cursor-pointer`}
                                                >
                                                    {/* Color Accent left bar */}
                                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-600"></div>
                                                    
                                                    <div className="flex justify-between items-start mb-1.5 pl-1.5">
                                                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-2">
                                                            {event.start_time} - {event.end_time}
                                                        </span>
                                                    </div>

                                                    {event.description && (
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 line-clamp-2 pl-1.5 leading-relaxed">{event.description}</p>
                                                    )}

                                                    <div className="space-y-1 pl-1.5 mt-auto pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                                                        {event.class_name && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                                <span className="material-icons-round text-xs text-primary-400">groups</span>
                                                                {event.class_name}
                                                            </div>
                                                        )}
                                                        {event.lecturer_name && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                                                <span className="material-icons-round text-xs text-amber-400">person</span>
                                                                {event.lecturer_name}
                                                            </div>
                                                        )}
                                                        {event.location && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                                                <span className="material-icons-round text-xs text-blue-400">room</span>
                                                                {event.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                                <span className="material-icons-round text-3xl text-slate-350 dark:text-slate-700 mb-1">event_busy</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tidak ada praktikum</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal Tambah/Edit Jadwal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">
                                {editingEvent ? 'Ubah Jadwal Mingguan' : 'Tambah Jadwal Mingguan'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>
                        
                        {/* Form */}
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nama Praktikum / Sesi</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none" 
                                    placeholder="Contoh: Pewarnaan Bakteri, Hematologi Klinik" 
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Keterangan / Deskripsi Sesi</label>
                                <textarea 
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none h-16 resize-none" 
                                    placeholder="Catatan pengerjaan praktikum" 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Hari</label>
                                    <select 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={formData.day_of_week} 
                                        onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                                    >
                                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Ruangan / Tempat</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none" 
                                        placeholder="Lab Utama / Lab A" 
                                        value={formData.location} 
                                        onChange={e => setFormData({...formData, location: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Jam Mulai</label>
                                    <input 
                                        required 
                                        type="time" 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none" 
                                        value={formData.start_time} 
                                        onChange={e => setFormData({...formData, start_time: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Jam Selesai</label>
                                    <input 
                                        required 
                                        type="time" 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none" 
                                        value={formData.end_time} 
                                        onChange={e => setFormData({...formData, end_time: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Kelas</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={formData.class_id} 
                                        onChange={e => setFormData({...formData, class_id: e.target.value})}
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Dosen Pengampu</label>
                                    <select 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={formData.lecturer_id} 
                                        onChange={e => setFormData({...formData, lecturer_id: e.target.value})}
                                    >
                                        <option value="">Pilih Dosen</option>
                                        {lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {editingEvent ? (
                                    <button 
                                        type="button" 
                                        onClick={handleDelete} 
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-xs font-bold px-4 py-2 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                ) : <div />}
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all"
                                    >
                                        Simpan Sesi
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Enrollment Modal for Students */}
            {selectedEventForEnroll && isStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedEventForEnroll(null)} />
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-3xl">how_to_reg</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Daftar Praktikum</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Apakah Anda ingin mendaftar ke kelas <strong>{selectedEventForEnroll.class_name || selectedEventForEnroll.title}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedEventForEnroll(null)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleEnroll}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                Ya, Daftar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default CalendarPage;
