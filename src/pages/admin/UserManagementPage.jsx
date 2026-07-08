import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('role') || 'all');
    const [viewMode, setViewMode] = useState('list');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [convertProgress, setConvertProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', role: 'student', nip: '', nim: '', phone: '', password: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Gagal memuat daftar pengguna');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                nip: user.nip || '',
                nim: user.nim || '',
                phone: user.phone || '',
                password: ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '', email: '', role: 'lecturer', nip: '', nim: '', phone: '', password: ''
            });
        }
        setShowModal(true);
    };

    const convertToWebP = (file, onProgress) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        if(progress <= 90 && onProgress) onProgress(progress);
                    }, 50);

                    canvas.toBlob((blob) => {
                        clearInterval(interval);
                        if (onProgress) onProgress(100);
                        
                        if (!blob) return reject(new Error('Canvas is empty'));
                        const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                            type: 'image/webp',
                            lastModified: Date.now()
                        });
                        resolve(webpFile);
                    }, 'image/webp', 0.8);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let userId = editingUser?.id;

            const payload = { ...formData };
            delete payload.avatar_file;
            delete payload.avatar_url;

            if (editingUser) {
                await api.updateUser(userId, payload);
                toast.success('Pengguna berhasil diperbarui');
            } else {
                const response = await api.createUser(payload);
                userId = response.id;
                toast.success('Pengguna baru berhasil ditambahkan');
            }

            if (formData.avatar_file) {
                await api.uploadAvatar(userId, formData.avatar_file);
            }

            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Gagal menyimpan data pengguna');
        }
    };

    const handleDeleteUser = async (id) => {
        const result = await Swal.fire({
            title: 'Nonaktifkan Pengguna?',
            text: 'Apakah Anda yakin ingin menonaktifkan pengguna ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, nonaktifkan!',
            cancelButtonText: 'Batal'
        });
        
        if (result.isConfirmed) {
            try {
                await api.deleteUser(id);
                toast.success('Pengguna berhasil dinonaktifkan');
                fetchUsers();
            } catch (error) {
                toast.error('Gagal menonaktifkan pengguna');
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.nim || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.nip || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || user.role.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesFilter;
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
                            <h1 className="text-xl font-bold tracking-tight">Manajemen User</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Data Pengguna Aktif</p>
                        </div>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <span className="material-icons-round">person_add</span>
                    </button>
                </div>

                <div className="px-5 pb-4 flex gap-3 overflow-x-auto hide-scrollbar items-center">
                    <div className="relative group flex-1 min-w-[200px]">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                            placeholder="Cari nama, NIM, atau NIP..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1.5 shrink-0 items-center">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'student', label: 'Mahasiswa' },
                            { id: 'lecturer', label: 'Dosen' },
                            { id: 'admin', label: 'Admin' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center ${activeFilter === filter.id
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                                    : 'text-slate-500 hover:text-primary'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1.5 shrink-0 items-center ml-1">
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

            <main className={`flex-1 px-5 py-4 pb-32 overflow-y-auto hide-scrollbar ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start' : 'grid grid-cols-1 md:grid-cols-2 gap-3 content-start'}`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Pengguna...</p>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex ${viewMode === 'list' ? 'items-center justify-between' : 'flex-col gap-4'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 bg-primary/10 text-primary overflow-hidden border border-primary/20">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm truncate">{user.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                        {user.nim || user.nip || 'No ID'} • {user.role}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className={`flex gap-1 ${viewMode === 'list' ? 'shrink-0' : 'w-full pt-3 border-t border-slate-100 dark:border-slate-800'}`}>
                                <button onClick={() => handleOpenModal(user)} className={`rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors flex items-center justify-center ${viewMode === 'list' ? 'w-8 h-8' : 'flex-1 py-2'}`}>
                                    <span className={`material-icons-round ${viewMode === 'list' ? 'text-lg' : 'text-sm mr-1'}`}>edit</span>
                                    {viewMode === 'grid' && <span className="text-xs font-bold">Edit</span>}
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)} className={`rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors flex items-center justify-center ${viewMode === 'list' ? 'w-8 h-8' : 'flex-1 py-2'}`}>
                                    <span className={`material-icons-round ${viewMode === 'list' ? 'text-lg' : 'text-sm mr-1'}`}>no_accounts</span>
                                    {viewMode === 'grid' && <span className="text-xs font-bold">Hapus</span>}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">person_off</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">User Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Tidak ada pengguna yang sesuai dengan kriteria pencarian.</p>
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
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
                                    <p className="text-xs text-slate-500 font-medium tracking-tight">Kelola informasi detail pengguna di bawah ini</p>
                                </div>
                                <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar px-1">
                                <div className="flex flex-col items-center justify-center mb-4">
                                    <div className="relative w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
                                        {formData.avatar_url ? (
                                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-icons-round text-3xl text-slate-300">person</span>
                                        )}
                                        <label className="absolute bottom-0 inset-x-0 h-6 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                                            <span className="material-icons-round text-white text-[10px]">camera_alt</span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            setIsConverting(true);
                                                            setConvertProgress(0);
                                                            const webpFile = await convertToWebP(file, setConvertProgress);
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData({ ...formData, avatar_url: reader.result, avatar_file: webpFile });
                                                                setIsConverting(false);
                                                            };
                                                            reader.readAsDataURL(webpFile);
                                                        } catch (err) {
                                                            toast.error('Gagal mengonversi gambar');
                                                            setIsConverting(false);
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {isConverting ? (
                                        <div className="w-32 mt-2">
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${convertProgress}%` }}></div>
                                            </div>
                                            <p className="text-[9px] text-center text-slate-400 mt-1 uppercase tracking-widest font-bold">Mengonversi...</p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 mt-2">Format: JPG, PNG (Max 2MB)</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Nama Lengkap</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder="Contoh: Dr. John Doe, M.Sc"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Role</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="student">Mahasiswa</option>
                                            <option value="lecturer">Dosen</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">No. WhatsApp</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            placeholder="0812..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Institusi</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                        placeholder="email@univ.ac.id"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                {formData.role === 'lecturer' ? (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">NIDN/NUPTK</label>
                                        <input
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            placeholder="Masukkan NIDN/NUPTK"
                                            value={formData.nip}
                                            onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">NIM (Nomor Induk Mahasiswa)</label>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                            placeholder="Masukkan NIM"
                                            value={formData.nim}
                                            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password {editingUser && '(Opsional)'}</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : "Default: password123"}
                                        value={formData.password || ''}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 active:scale-95 transition-transform uppercase tracking-wider text-[11px]">
                                    Batal
                                </button>
                                <button type="submit" className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/25 active:scale-95 transition-transform uppercase tracking-wider text-[11px]">
                                    {editingUser ? 'Simpan Perubahan' : 'Daftarkan User'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </DesktopLayout>
    );
};

export default UserManagementPage;
