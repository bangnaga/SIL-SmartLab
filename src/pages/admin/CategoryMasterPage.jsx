import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Search, Tags } from 'lucide-react';

const CategoryMasterPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Gagal memuat data kategori');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, formData);
                toast.success('Kategori berhasil diperbarui');
            } else {
                await api.createCategory(formData);
                toast.success('Kategori berhasil ditambahkan');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Kategori?',
            text: 'Yakin ingin menghapus kategori ini? Data yang terhubung mungkin tidak lagi memiliki referensi kategori yang valid.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            try {
                await api.deleteCategory(id);
                toast.success('Kategori dihapus');
                fetchCategories();
            } catch (error) {
                toast.error('Gagal menghapus kategori');
            }
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DesktopLayout title="Master Data Kategori Inventaris">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                            <Tags className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Kategori</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{categories.length}</h3>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
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
                        Tambah Kategori
                    </button>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                    <th className="p-4 font-semibold text-sm w-1/4">Nama Kategori</th>
                                    <th className="p-4 font-semibold text-sm">Deskripsi</th>
                                    <th className="p-4 font-semibold text-sm w-48 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500">Memuat data...</td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500">Tidak ada data kategori.</td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800 dark:text-white">{category.name}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600 dark:text-slate-400">{category.description || '-'}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleOpenModal(category)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Kategori *</label>
                                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="Contoh: Reagen" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                                    <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" placeholder="Keterangan singkat mengenai kategori ini..."></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                Batal
                            </button>
                            <button type="submit" form="categoryForm" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                                {editingCategory ? 'Simpan Perubahan' : 'Tambahkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default CategoryMasterPage;
