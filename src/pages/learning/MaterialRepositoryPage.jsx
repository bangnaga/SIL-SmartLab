import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import StudentMaterialViewerInline from '../../components/learning/StudentMaterialViewerInline';
import CurriculumBuilder from '../../components/curriculum/CurriculumBuilder';
import Swal from 'sweetalert2';

const MaterialRepositoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const isLecturer = user?.role?.toLowerCase() === 'lecturer';
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const canManage = isLecturer || isAdmin;

    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const courseIdParam = searchParams.get('course_id');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '', type: 'PDF Module', course_id: '', url: '', description: ''
    });

    // Student Curriculum Builder States
    const [studentCurriculum, setStudentCurriculum] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeMaterial, setActiveMaterial] = useState(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Lecturer / Admin States
    const [activeTab, setActiveTab] = useState('curriculum');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (isLecturer) params.lecturer_id = user.id;
            else if (user?.role?.toLowerCase() === 'student') params.student_id = user.id;
            
            const crs = await api.getCourses(params);
            setCourses(crs);

            if (courseIdParam && !selectedCourse) {
                const found = crs.find(c => c.id.toString() === courseIdParam);
                if (found) {
                    handleSelectCourse(found);
                }
            }
        } catch (err) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleSelectCourse = async (course) => {
        setSelectedCourse(course);
        setLoading(true);
        setErrorMsg('');
        setStudentCurriculum(null);
        setActiveMaterial(null);
        try {
            if (user?.role?.toLowerCase() === 'student') {
                const data = await api.getStudentCurriculum(course.id, user.id);
                setStudentCurriculum(data);
                
                const flat = [];
                data.topics.forEach(t => flat.push(...t.materials));
                flat.push(...data.uncategorized);
                
                if (flat.length > 0) {
                    const firstUncompleted = flat.find(m => !data.completedIds.includes(m.id));
                    setActiveMaterial(firstUncompleted || flat[0]);
                }
            } else {
                const mats = await api.getMaterials({
                    course_id: course.id
                });
                setMaterials(mats);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Gagal memuat materi praktikum');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (material = null) => {
        if (material) {
            setEditingMaterial(material);
            setFormData({
                title: material.title,
                type: material.type,
                course_id: material.course_id || '',
                url: material.url,
                description: material.description
            });
        } else {
            setEditingMaterial(null);
            setFormData({
                title: '',
                type: 'PDF Module',
                course_id: selectedCourse ? selectedCourse.id : '',
                url: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMaterial) {
                await api.updateMaterial(editingMaterial.id, formData);
                toast.success('Praktikum berhasil diperbarui');
            } else {
                await api.createMaterial({ ...formData, lecturer_id: user.id });
                toast.success('Praktikum baru berhasil ditambahkan');
            }
            setShowModal(false);
            if (selectedCourse) handleSelectCourse(selectedCourse);
        } catch (err) {
            toast.error('Gagal menyimpan materi');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Praktikum?',
            text: 'Hapus praktikum ini secara permanen?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        
        if (result.isConfirmed) {
            try {
                await api.deleteMaterial(id);
                toast.success('Praktikum berhasil dihapus');
                if (selectedCourse) handleSelectCourse(selectedCourse);
            } catch (err) {
                toast.error('Gagal menghapus praktikum');
            }
        }
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.lecturer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getIconForType = (type) => {
        const lower = (type || '').toLowerCase();
        if (lower.includes('pdf')) return { icon: 'picture_as_pdf', color: 'red' };
        if (lower.includes('video')) return { icon: 'play_circle', color: 'blue' };
        if (lower.includes('audio') || lower.includes('podcast')) return { icon: 'headset', color: 'purple' };
        if (lower.includes('image')) return { icon: 'image', color: 'primary' };
        if (lower.includes('quiz')) return { icon: 'quiz', color: 'violet' };
        if (lower.includes('flashcard')) return { icon: 'style', color: 'teal' };
        if (lower.includes('assignment')) return { icon: 'assignment', color: 'indigo' };
        if (lower.includes('link')) return { icon: 'link', color: 'emerald' };
        return { icon: 'description', color: 'slate' };
    };

    // Prerequisite verification helper
    const getMaterialStatus = (mat) => {
        if (!studentCurriculum) return { isLocked: false, isCompleted: false };

        const allMats = [];
        studentCurriculum.topics.forEach(t => allMats.push(...t.materials));
        allMats.push(...studentCurriculum.uncategorized);

        const isCompleted = studentCurriculum.completedIds.includes(mat.id);

        let isLocked = false;
        for (let i = 0; i < allMats.length; i++) {
            const m = allMats[i];
            if (m.id === mat.id) break;
            if (m.is_prerequisite && !studentCurriculum.completedIds.includes(m.id)) {
                isLocked = true;
                break;
            }
        }

        return { isLocked, isCompleted };
    };

    const handleMaterialClick = (mat) => {
        const { isLocked } = getMaterialStatus(mat);
        if (isLocked) {
            toast.error('Materi terkunci! Harap selesaikan materi prasyarat sebelumnya.');
            return;
        }
        setActiveMaterial(mat);
        setIsMobileSidebarOpen(false); // Close sidebar on mobile
    };

    const getFlatModules = () => {
        if (!studentCurriculum) return [];
        const flat = [];
        studentCurriculum.topics.forEach(t => flat.push(...t.materials));
        flat.push(...studentCurriculum.uncategorized);
        return flat;
    };

    const flatModules = getFlatModules();
    const activeIdx = activeMaterial ? flatModules.findIndex(m => m.id === activeMaterial.id) : -1;
    const hasPrevModule = activeIdx > 0;
    const hasNextModule = activeIdx !== -1 && activeIdx < flatModules.length - 1;

    const handlePrevModule = () => {
        if (hasPrevModule) {
            handleMaterialClick(flatModules[activeIdx - 1]);
        }
    };

    const handleNextModule = () => {
        if (hasNextModule) {
            handleMaterialClick(flatModules[activeIdx + 1]);
        }
    };

    return (
        <DesktopLayout title="Materi Praktikum">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 rounded-b-2xl">
                <div className="px-4 py-3 flex items-center justify-between pt-8">
                    <button
                        onClick={() => selectedCourse ? setSelectedCourse(null) : navigate(-1)}
                        className="p-1 -ml-1 text-primary active:scale-95 transition-transform"
                    >
                        <span className="material-icons-round text-2xl">{selectedCourse ? 'arrow_back' : 'arrow_back_ios'}</span>
                    </button>
                    <div className="flex-1 px-2 overflow-hidden">
                        <h1 className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white truncate">
                            {selectedCourse ? selectedCourse.name : 'Materi Pembelajaran'}
                        </h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mt-1">
                            {selectedCourse ? `Folder: ${selectedCourse.code}` : 'Media & Repository'}
                        </p>
                    </div>
                    {canManage && selectedCourse && (
                        <button onClick={() => handleOpenModal()} className="p-1 -mr-1 text-primary active:scale-95 transition-transform">
                            <span className="material-icons-round text-2xl">cloud_upload</span>
                        </button>
                    )}
                </div>

                <div className="px-4 pb-3">
                    <div className="relative flex items-center group">
                        <span className="material-icons-round absolute left-3 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-200/50 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                            placeholder={selectedCourse ? `Cari file di ${selectedCourse.code}...` : "Cari praktikum atau dosen..."}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="px-4 pt-6 pb-32 overflow-y-auto no-scrollbar">
                {!selectedCourse ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {isLecturer ? 'Folder Praktikum Saya' : 'Daftar Praktikum'}
                            </h2>
                            <span className="text-slate-400 text-[10px] font-bold">{courses.length} Folder</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {courses.filter(c =>
                                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                c.code.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((course, index) => (
                                <button
                                    key={course.id}
                                    onClick={() => handleSelectCourse(course)}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${index % 4 === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' :
                                        index % 4 === 1 ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' :
                                            index % 4 === 2 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                                                'bg-purple-50 dark:bg-purple-900/20 text-purple-500'
                                        }`}>
                                        <span className="material-icons-round text-4xl">folder</span>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{course.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{course.code}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {loading ? (
                            <Skeleton variant="card" count={3} />
                        ) : errorMsg ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                                <span className="material-icons-round text-red-500 text-4xl">error_outline</span>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Akses Terbatas</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{errorMsg}</p>
                            </div>
                        ) : user?.role?.toLowerCase() === 'student' && studentCurriculum ? (
                            // ========================
                            // STUDENT WORKSPACE VIEW (TutorLMS style)
                            // ========================
                            <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                                {/* Left Sidebar: Topics list */}
                                <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-250/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col shrink-0 ${isMobileSidebarOpen ? 'block' : 'hidden md:flex'}`}>
                                    {/* Progress Header */}
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress Praktikum</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                {flatModules.filter(m => studentCurriculum.completedIds.includes(m.id)).length} / {flatModules.length} Selesai
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full transition-all duration-300"
                                                style={{ 
                                                    width: `${flatModules.length > 0 
                                                        ? (flatModules.filter(m => studentCurriculum.completedIds.includes(m.id)).length / flatModules.length) * 100 
                                                        : 0}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {/* Scrollable Topics list */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                        {studentCurriculum.topics.map(topic => (
                                            <div key={topic.id} className="space-y-1.5">
                                                <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">{topic.title}</h4>
                                                <div className="space-y-1">
                                                    {topic.materials.map(mat => {
                                                        const { icon, color } = getIconForType(mat.type);
                                                        const { isLocked, isCompleted } = getMaterialStatus(mat);
                                                        const isActive = activeMaterial && activeMaterial.id === mat.id;
                                                        return (
                                                            <button
                                                                key={mat.id}
                                                                disabled={isLocked}
                                                                onClick={() => handleMaterialClick(mat)}
                                                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                                                                    isLocked 
                                                                        ? 'opacity-40 cursor-not-allowed bg-transparent' 
                                                                        : isActive 
                                                                            ? 'bg-primary/5 text-primary border border-primary/20' 
                                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-7 h-7 bg-${color}-50 dark:bg-${color}-950/20 rounded-lg flex items-center justify-center shrink-0`}>
                                                                        <span className={`material-icons-round text-${color}-500 text-base`}>{icon}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-355'}`}>{mat.title}</p>
                                                                        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 uppercase block leading-none mt-0.5">{mat.type}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 flex items-center">
                                                                    {isLocked ? (
                                                                        <span className="material-icons-round text-slate-300 dark:text-slate-700 text-sm">lock</span>
                                                                    ) : isCompleted ? (
                                                                        <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                                                                    ) : (
                                                                        <span className="material-icons-round text-slate-300 dark:text-slate-700 text-sm">play_arrow</span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Uncategorized */}
                                        {studentCurriculum.uncategorized.length > 0 && (
                                            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                                                <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Materi Tambahan</h4>
                                                <div className="space-y-1">
                                                    {studentCurriculum.uncategorized.map(mat => {
                                                        const { icon, color } = getIconForType(mat.type);
                                                        const { isLocked, isCompleted } = getMaterialStatus(mat);
                                                        const isActive = activeMaterial && activeMaterial.id === mat.id;
                                                        return (
                                                            <button
                                                                key={mat.id}
                                                                disabled={isLocked}
                                                                onClick={() => handleMaterialClick(mat)}
                                                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                                                                    isLocked 
                                                                        ? 'opacity-40 cursor-not-allowed bg-transparent' 
                                                                        : isActive 
                                                                            ? 'bg-primary/5 text-primary border border-primary/20' 
                                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-7 h-7 bg-${color}-50 dark:bg-${color}-950/20 rounded-lg flex items-center justify-center shrink-0`}>
                                                                        <span className={`material-icons-round text-${color}-500 text-base`}>{icon}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-355'}`}>{mat.title}</p>
                                                                        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 uppercase block leading-none mt-0.5">{mat.type}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0 flex items-center">
                                                                    {isLocked ? (
                                                                        <span className="material-icons-round text-slate-300 dark:text-slate-700 text-sm">lock</span>
                                                                    ) : isCompleted ? (
                                                                        <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                                                                    ) : (
                                                                        <span className="material-icons-round text-slate-300 dark:text-slate-700 text-sm">play_arrow</span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Area: Workspace content */}
                                <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 min-w-0">
                                    {/* Mobile Header Toggle */}
                                    <div className="md:hidden px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 flex justify-between items-center">
                                        <button 
                                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
                                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700"
                                        >
                                            <span className="material-icons-round text-base">menu</span> 
                                            {isMobileSidebarOpen ? 'Tutup Daftar' : 'Daftar Materi'}
                                        </button>
                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{activeMaterial?.title}</span>
                                    </div>

                                    {/* Scrollable Viewer container */}
                                    <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
                                        {activeMaterial ? (
                                            <StudentMaterialViewerInline
                                                material={activeMaterial}
                                                classId={studentCurriculum.class_id}
                                                studentId={user.id}
                                                isCompleted={studentCurriculum.completedIds.includes(activeMaterial.id)}
                                                onCompleted={(matId) => {
                                                    setStudentCurriculum({
                                                        ...studentCurriculum,
                                                        completedIds: [...studentCurriculum.completedIds, matId]
                                                    });
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
                                                <span className="material-icons-round text-5xl text-slate-300 mb-3">auto_stories</span>
                                                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Mulai Praktikum</h3>
                                                <p className="text-xs text-slate-400 max-w-xs mt-1">Pilih salah satu materi di menu samping untuk memulai pembelajaran.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Navigation panel */}
                                    {activeMaterial && (
                                        <div className="px-5 py-4 border-t border-slate-250/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex justify-between items-center gap-4 shrink-0">
                                            <button
                                                onClick={handlePrevModule}
                                                disabled={!hasPrevModule}
                                                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 disabled:pointer-events-none press-effect flex items-center gap-1.5"
                                            >
                                                <span className="material-icons-round text-sm">navigate_before</span> Sebelumnya
                                            </button>
                                            
                                            <button
                                                onClick={handleNextModule}
                                                disabled={!hasNextModule}
                                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:pointer-events-none press-effect flex items-center gap-1.5 shadow-lg shadow-primary/20"
                                            >
                                                Lanjutkan <span className="material-icons-round text-sm">navigate_next</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // ========================
                            // LECTURER / ADMIN TABBED VIEW
                            // ========================
                            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                {/* Tabs Header */}
                                <div className="flex items-center gap-6 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <button 
                                        onClick={() => setActiveTab('curriculum')}
                                        className={`pb-4 mb--4 border-b-2 text-sm font-bold transition-colors ${activeTab === 'curriculum' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Kurikulum Builder
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('students')}
                                        className={`pb-4 mb--4 border-b-2 text-sm font-bold transition-colors ${activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Siswa
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('assignments')}
                                        className={`pb-4 mb--4 border-b-2 text-sm font-bold transition-colors ${activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Tugas Siswa
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('settings')}
                                        className={`pb-4 mb--4 border-b-2 text-sm font-bold transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Pengaturan
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    {activeTab === 'curriculum' && (
                                        <CurriculumBuilder courseId={selectedCourse.id} />
                                    )}
                                    
                                    {activeTab === 'students' && (
                                        <div className="text-center py-12">
                                            <span className="material-icons-round text-slate-300 text-5xl mb-4">people</span>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Daftar Siswa</h3>
                                            <p className="text-slate-500 text-sm">Fitur manajemen siswa sedang dalam pengembangan.</p>
                                        </div>
                                    )}

                                    {activeTab === 'assignments' && (
                                        <div className="text-center py-12">
                                            <span className="material-icons-round text-slate-300 text-5xl mb-4">assignment_turned_in</span>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tugas Siswa</h3>
                                            <p className="text-slate-500 text-sm">Fitur penilaian tugas sedang dalam pengembangan.</p>
                                        </div>
                                    )}

                                    {activeTab === 'settings' && (
                                        <div className="text-center py-12">
                                            <span className="material-icons-round text-slate-300 text-5xl mb-4">settings</span>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Pengaturan Praktikum</h3>
                                            <p className="text-slate-500 text-sm">Edit nama, kode, dan deksripsi praktikum akan tersedia di sini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </DesktopLayout>
    );
};

export default MaterialRepositoryPage;
