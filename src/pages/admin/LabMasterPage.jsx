import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Search, Building2, Users } from 'lucide-react';

const LabMasterPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    
    const [labs, setLabs] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingLab, setEditingLab] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        building: '',
        floor: '',
        room_number: '',
        capacity: '20',
        lab_type: 'general',
        head_lecturer_id: '',
        head_lecturer_name: '',
        ip_camera_url: '',
        is_active: '1',
        equipment_notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [labsData, usersData] = await Promise.all([
                api.getLaboratories(),
                fetch('http://localhost:3001/api/users').then(res => res.json())
            ]);
            setLabs(labsData);
            setLecturers(usersData.filter(u => u.role === 'lecturer' || u.role === 'admin'));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data laboratorium');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (lab = null) => {
        if (lab) {
            setEditingLab(lab);
            setFormData({
                code: lab.code,
                name: lab.name,
                building: lab.building || '',
                floor: lab.floor || '',
                room_number: lab.room_number || '',
                capacity: lab.capacity?.toString() || '20',
                lab_type: lab.lab_type || 'general',
                head_lecturer_id: lab.head_lecturer_id || '',
                head_lecturer_name: lab.head_lecturer_name || '',
                ip_camera_url: lab.ip_camera_url || '',
                is_active: lab.is_active?.toString() || '1',
                equipment_notes: lab.equipment_notes || ''
            });
        } else {
            setEditingLab(null);
            setFormData({
                code: '',
                name: '',
                building: '',
                floor: '',
                room_number: '',
                capacity: '20',
                lab_type: 'general',
                head_lecturer_id: '',
                head_lecturer_name: '',
                ip_camera_url: '',
                ip_camera_port: '',
                is_active: '1',
                equipment_notes: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity),
                head_lecturer_id: formData.head_lecturer_id ? parseInt(formData.head_lecturer_id) : null,
                is_active: parseInt(formData.is_active)
            };

            if (editingLab) {
                await api.updateLaboratory(editingLab.id, payload);
                toast.success('Laboratorium berhasil diperbarui');
            } else {
                await api.createLaboratory(payload);
                toast.success('Laboratorium berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Laboratorium?',
            text: 'Yakin ingin menghapus laboratorium ini? Data inventaris yang terhubung mungkin akan bermasalah.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            try {
                await api.deleteLaboratory(id);
                toast.success('Laboratorium dihapus');
                fetchData();
            } catch (error) {
                toast.error('Gagal menghapus laboratorium');
            }
        }
    };

    const filteredLabs = labs.filter(l => 
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.building && l.building.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: labs.length,
        active: labs.filter(l => l.is_active === 1).length,
        capacity: labs.reduce((acc, l) => acc + (l.is_active === 1 ? l.capacity : 0), 0)
    };

    return (
        <DesktopLayout title="Master Data Laboratorium">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Laboratorium</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Laboratorium Aktif</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.active}</h3>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Kapasitas (Mhs)</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.capacity}</h3>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari lab atau gedung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Laboratorium
                    </button>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    <th className="p-4 font-semibold text-sm">Kode & Nama</th>
                                    <th className="p-4 font-semibold text-sm">Lokasi</th>
                                    <th className="p-4 font-semibold text-sm">Kapasitas</th>
                                    <th className="p-4 font-semibold text-sm">Kepala Lab</th>
                                    <th className="p-4 font-semibold text-sm">IP Camera</th>
                                    <th className="p-4 font-semibold text-sm">Status</th>
                                    <th className="p-4 font-semibold text-sm text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">Memuat data...</td>
                                    </tr>
                                ) : filteredLabs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">Tidak ada data laboratorium.</td>
                                    </tr>
                                ) : (
                                    filteredLabs.map((lab) => (
                                        <tr key={lab.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800 dark:text-white">{lab.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{lab.code} &bull; {lab.lab_type}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-800 dark:text-slate-200">{lab.building}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{lab.floor}, {lab.room_number}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{lab.capacity}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-800 dark:text-slate-200">{lab.head_lecturer_name || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-800 dark:text-slate-200">{lab.ip_camera_url || '-'} {lab.ip_camera_port ? `:${lab.ip_camera_port}` : ''}</div>
                                            </td>
                                            <td className="p-4">
                                                {lab.is_active === 1 ? (
                                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium rounded-full">Aktif</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-medium rounded-full">Tidak Aktif</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleOpenModal(lab)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(lab.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {editingLab ? 'Edit Laboratorium' : 'Tambah Laboratorium Baru'}
                            </h3>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="labForm" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kode Lab *</label>
                                        <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="Contoh: LAB-HEM" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Laboratorium *</label>
                                        <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="Contoh: Laboratorium Hematologi" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gedung</label>
                                        <input type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lantai</label>
                                        <input type="text" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor Ruangan</label>
                                        <input type="text" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kapasitas Mahasiswa *</label>
                                        <input required type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kepala Laboratorium</label>
                                        <input type="text" value={formData.head_lecturer_name} onChange={(e) => setFormData({...formData, head_lecturer_name: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="Nama Kepala Lab" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL IP Camera</label>
                                        <input type="text" value={formData.ip_camera_url} onChange={(e) => setFormData({...formData, ip_camera_url: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="http://... atau rtsp://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Port IP Camera</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={formData.ip_camera_port} onChange={(e) => setFormData({...formData, ip_camera_port: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="554, 8080, dll" />
                                            {(formData.ip_camera_url || formData.ip_camera_port) && (
                                                <button type="button" onClick={() => setShowPreviewModal(true)} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg whitespace-nowrap transition-colors font-medium text-sm">
                                                    Test Preview
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                        <select value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200">
                                            <option value="1">Aktif</option>
                                            <option value="0">Tidak Aktif</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan Fasilitas / Alat Utama</label>
                                    <textarea rows="3" value={formData.equipment_notes} onChange={(e) => setFormData({...formData, equipment_notes: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="labForm" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                                {editingLab ? 'Simpan Perubahan' : 'Tambahkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Preview IP Camera</h3>
                            <button onClick={() => setShowPreviewModal(false)} className="text-slate-500 hover:text-rose-500 transition-colors">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-4 flex justify-center items-center bg-black/90 min-h-[400px]">
                            {formData.ip_camera_url ? (
                                formData.ip_camera_url.toLowerCase().startsWith('rtsp://') ? (
                                    <div className="text-center p-8 max-w-md">
                                        <span className="material-icons-round text-5xl text-yellow-500 mb-4">videocam_off</span>
                                        <p className="text-white font-bold">Format RTSP Tidak Didukung Browser</p>
                                        <p className="text-sm text-slate-400 mt-2">
                                            Alamat RTSP dapat disimpan, namun browser web tidak dapat menampilkannya secara langsung tanpa server proxy (WebRTC/HLS).
                                        </p>
                                    </div>
                                ) : (
                                    <img 
                                        src={formData.ip_camera_url} 
                                        alt="IP Camera Stream" 
                                        className="max-w-full max-h-[60vh] object-contain rounded"
                                        onError={(e) => { e.target.onerror = null; e.target.src = ''; toast.error('Gagal memuat URL IP Camera'); }}
                                    />
                                )
                            ) : (
                                <p className="text-white/50">URL IP Camera kosong</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default LabMasterPage;
