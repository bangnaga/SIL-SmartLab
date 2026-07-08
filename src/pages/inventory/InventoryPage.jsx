import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';

const MOCK_MEDIA = [
    { id: 1, name: 'hero_background.png', type: 'image', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500' },
    { id: 4, name: 'lab_hematologi.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500' },
    { id: 5, name: 'pipet_mikro.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1629904853716-f0bc54eaa98b?w=500' }
];

const InventoryPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const [items, setItems] = useState([]);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [viewMode, setViewMode] = useState('list'); // 'grid' | 'list'
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9; // 3 columns * 3 rows
    const [showModal, setShowModal] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // History Modal State
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [historyTransactions, setHistoryTransactions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyStartDate, setHistoryStartDate] = useState(firstDay);
    const [historyEndDate, setHistoryEndDate] = useState(lastDay);

    // Transaction Modal
    const [showTxModal, setShowTxModal] = useState(false);
    const [txItem, setTxItem] = useState(null);
    const [txForm, setTxForm] = useState({
        transaction_type: 'usage',
        quantity_changed: 1,
        notes: ''
    });
    const [formData, setFormData] = useState({
        type: 'alat', // 'alat' | 'bahan'
        name: '',
        category: 'Alat',
        stock: '',
        unit: '',
        min_stock: '10',
        location: '',
        lab_id: '',
        description: '',
        barcode: '',
        image_url: '',
        formula: '',
        msds_level: '',
        physical_state: '',
        batch_number: '',
        expired_date: ''
    });

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await api.getInventory();
            setItems(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Gagal memuat data inventaris');
        } finally {
            setLoading(false);
        }
    };

    const fetchLabs = async () => {
        try {
            const data = await api.getLaboratories();
            setLabs(data);
        } catch (error) {
            console.error('Error fetching labs:', error);
        }
    };

    useEffect(() => {
        fetchInventory();
        if (isAdmin) fetchLabs();
    }, [isAdmin]);

    const handleOpenModal = (item = null) => {
        if (!isAdmin) return;
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type || 'alat',
                name: item.name,
                category: item.category,
                stock: item.stock.toString(),
                unit: item.unit,
                min_stock: item.min_stock.toString(),
                location: item.location || '',
                lab_id: item.lab_id || '',
                description: item.description || '',
                barcode: item.barcode || '',
                image_url: item.image_url || '',
                formula: item.formula || '',
                msds_level: item.msds_level || '',
                physical_state: item.physical_state || '',
                batch_number: item.batch_number || '',
                expired_date: item.expired_date || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: 'alat',
                name: '',
                category: 'Alat',
                stock: '',
                unit: '',
                min_stock: '10',
                location: '',
                lab_id: '',
                description: '',
                barcode: '',
                image_url: '',
                formula: '',
                msds_level: '',
                physical_state: '',
                batch_number: '',
                expired_date: ''
            });
        }
        setShowModal(true);
    };

    const handleOpenHistory = async (item) => {
        setSelectedHistoryItem(item);
        setShowHistoryModal(true);
        setLoadingHistory(true);
        try {
            const data = await api.getTransactions({ item_id: item.id });
            const approvedData = data.filter(tx => tx.status === 'approved');
            
            // API returns DESC order (newest first).
            // Calculate running balance: current stock is item.stock.
            // We iterate from newest to oldest to find balance before the transaction.
            let currentBalance = item.stock;
            const processed = approvedData.map(tx => {
                let masuk = 0;
                let keluar = 0;
                if (tx.quantity_changed > 0) masuk = tx.quantity_changed;
                else keluar = Math.abs(tx.quantity_changed);
                
                const record = {
                    ...tx,
                    masuk,
                    keluar,
                    sisa: currentBalance
                };
                currentBalance = currentBalance - tx.quantity_changed;
                return record;
            });
            setHistoryTransactions(processed);
        } catch (error) {
            console.error('Failed to load history:', error);
            // toast error here if we had toast
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleExportCSV = () => {
        const filtered = historyTransactions.filter(tx => {
            const txDate = tx.transaction_date.slice(0, 10);
            return txDate >= historyStartDate && txDate <= historyEndDate;
        });
        
        let csvContent = "Tanggal,Transaksi,Masuk,Keluar,Sisa,Keterangan\n";
        filtered.forEach(tx => {
            const date = new Date(tx.transaction_date).toLocaleDateString('id-ID');
            const type = tx.transaction_type === 'restock' ? 'Restock' :
                         tx.transaction_type === 'usage' ? 'Penggunaan' :
                         tx.transaction_type === 'waste' ? 'Waste' :
                         tx.transaction_type === 'opname' ? 'Opname' : 'Lainnya';
            csvContent += `"${date}","${type}","${tx.masuk}","${tx.keluar}","${tx.sisa}","${tx.notes || '-'}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Kartu_Stok_${selectedHistoryItem?.name}_${historyStartDate}_to_${historyEndDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const filtered = historyTransactions.filter(tx => {
            const txDate = tx.transaction_date.slice(0, 10);
            return txDate >= historyStartDate && txDate <= historyEndDate;
        });

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Kartu Stok - ${selectedHistoryItem?.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    h4 { text-align: center; color: #666; margin-top: 0; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
                    th { background-color: #f4f4f4; }
                    .text-right { text-align: right; }
                    @media print {
                        @page { margin: 1cm; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h2>KARTU STOK</h2>
                <h4>Barang: ${selectedHistoryItem?.name} | Periode: ${historyStartDate} s/d ${historyEndDate}</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Transaksi</th>
                            <th class="text-right">Masuk</th>
                            <th class="text-right">Keluar</th>
                            <th class="text-right">Sisa</th>
                            <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(tx => `
                            <tr>
                                <td>${new Date(tx.transaction_date).toLocaleDateString('id-ID')}</td>
                                <td>${tx.transaction_type === 'restock' ? 'Restock' : tx.transaction_type === 'usage' ? 'Penggunaan' : tx.transaction_type === 'waste' ? 'Waste' : tx.transaction_type === 'opname' ? 'Opname' : tx.transaction_type}</td>
                                <td class="text-right">${tx.masuk > 0 ? tx.masuk : '-'}</td>
                                <td class="text-right">${tx.keluar > 0 ? tx.keluar : '-'}</td>
                                <td class="text-right"><b>${tx.sisa}</b></td>
                                <td>${tx.notes || '-'}</td>
                            </tr>
                        `).join('')}
                        ${filtered.length === 0 ? '<tr><td colspan="6" style="text-align:center">Tidak ada transaksi pada periode ini</td></tr>' : ''}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                stock: parseInt(formData.stock),
                min_stock: parseInt(formData.min_stock),
                lab_id: formData.lab_id ? parseInt(formData.lab_id) : null
            };

            if (editingItem) {
                await api.updateInventoryItem(editingItem.id, payload);
                toast.success('Barang berhasil diperbarui');
            } else {
                await api.createInventoryItem(payload);
                toast.success('Barang berhasil ditambahkan');
            }
            setShowModal(false);
            fetchInventory();
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error(error.message || 'Gagal menyimpan barang');
        }
    };

    const printBuktiPermintaan = (item, form, user) => {
        const printWindow = window.open('', '_blank');
        const now = new Date();
        const date = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const receiptNo = `BPMT-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
        
        const html = `
            <html>
                <head>
                    <title>Bukti Permintaan Bahan/Reagen</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h2 { text-align: center; text-decoration: underline; margin-bottom: 30px; }
                        .content { max-width: 600px; margin: 0 auto; }
                        .row { display: flex; margin-bottom: 10px; }
                        .label { width: 150px; font-weight: bold; }
                        .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
                        .sig-box { width: 200px; }
                        .sig-line { border-bottom: 1px solid #000; margin-top: 60px; margin-bottom: 5px; }
                        @media print {
                            @page { margin: 1.5cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="content">
                        <h2>BUKTI PERMINTAAN BARANG / REAGEN</h2>
                        <div class="row"><div class="label">No. Bukti</div><div>: <b>${receiptNo}</b></div></div>
                        <div class="row"><div class="label">Tanggal</div><div>: ${date}</div></div>
                        <div class="row"><div class="label">Pemohon</div><div>: ${user?.name || 'Mahasiswa'}</div></div>
                        <div class="row"><div class="label">NIM/NIP</div><div>: ${user?.nim || user?.nip || '-'}</div></div>
                        <div class="row"><div class="label">Nama Barang</div><div>: ${item.name}</div></div>
                        <div class="row"><div class="label">Jumlah Diminta</div><div>: ${form.quantity_changed} ${item.unit}</div></div>
                        <div class="row"><div class="label">Keperluan</div><div>: ${form.notes}</div></div>
                        
                        <div class="signatures">
                            <div class="sig-box">
                                <p>Pemohon,</p>
                                <div class="sig-line"></div>
                                <p>${user?.name || '........................'}</p>
                            </div>
                            <div class="sig-box">
                                <p>Menyetujui,<br>Kepala Lab / Teknisi</p>
                                <div class="sig-line"></div>
                                <p>........................</p>
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = () => { window.print(); }
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createTransaction({
                item_id: txItem.id,
                user_id: user?.id,
                transaction_type: txForm.transaction_type,
                quantity_changed: txForm.quantity_changed,
                notes: txForm.notes
            });
            
            if (txForm.transaction_type === 'usage') {
                toast.success('Permintaan berhasil diajukan dan menunggu persetujuan Kepala Lab');
                printBuktiPermintaan(txItem, txForm, user);
            } else {
                toast.success('Transaksi berhasil dicatat');
            }
            
            setShowTxModal(false);
            fetchInventory();
        } catch (error) {
            toast.error(error.message || 'Gagal memproses transaksi');
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) return;
        const result = await Swal.fire({
            title: 'Hapus Barang?',
            text: 'Apakah Anda yakin ingin menghapus barang ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteInventoryItem(id);
                toast.success('Barang berhasil dihapus');
                fetchInventory();
            } catch (error) {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeCategory]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const categories = ['Semua', 'Alat', 'Reagen', 'Habis Pakai'];

    return (
        <DesktopLayout title="Menu">
            <header className="glass-sidebar shadow-sm rounded-b-2xl">
                <div className="px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Master Inventaris</h1>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                            {isAdmin ? 'Portal Pengelolaan Admin' : 'Daftar Ketersediaan'}
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary/90 text-white flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <span className="material-icons-round">add</span>
                        </button>
                    )}
                </div>

                <div className="px-6 pb-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="relative group w-full md:w-96">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="glass-input w-full py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100"
                            placeholder="Cari alat atau reagen..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 border ${activeCategory === cat
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm text-slate-600 dark:text-slate-300 border-white/50 dark:border-slate-700/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Mensinkronkan Data...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Aktif ({filteredItems.length})</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    <span className="material-icons-round text-sm">grid_view</span>
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    <span className="material-icons-round text-sm">view_list</span>
                                </button>
                            </div>
                        </div>

                        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
                        {paginatedItems.map((item) => (
                            <div key={item.id} className={`glass-card overflow-hidden group ${viewMode === 'grid' ? 'flex flex-col' : ''}`}>
                                <div className={`${viewMode === 'list' ? 'p-4 flex flex-col sm:flex-row sm:items-center gap-4' : 'flex flex-col h-full'}`}>
                                    
                                    {/* Image Section */}
                                    <div className={`${viewMode === 'list' ? 'w-12 h-12 shrink-0' : 'w-full h-40 shrink-0 relative bg-slate-100 dark:bg-slate-800'}`}>
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className={`object-cover w-full h-full ${viewMode === 'list' ? 'rounded-xl border border-slate-200 dark:border-slate-700' : ''}`} />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${viewMode === 'list' ? 'rounded-xl' : ''} ${item.category === 'Reagen' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'}`}>
                                                <span className={`material-icons-round ${viewMode === 'list' ? '' : 'text-4xl opacity-50'}`}>{item.category === 'Reagen' ? 'science' : 'biotech'}</span>
                                            </div>
                                        )}
                                        {viewMode === 'grid' && isAdmin && (
                                            <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenHistory(item)} title="Kartu Stok" className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-600 hover:text-indigo-500 transition-colors flex items-center justify-center shadow-sm">
                                                    <span className="material-icons-round text-[18px]">history</span>
                                                </button>
                                                <button onClick={() => { setTxItem(item); setTxForm({ transaction_type: 'opname', quantity_changed: '', notes: '', is_converted: false }); setShowTxModal(true); }} title="Stok Opname" className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-600 hover:text-amber-500 transition-colors flex items-center justify-center shadow-sm">
                                                    <span className="material-icons-round text-[18px]">inventory</span>
                                                </button>
                                                <button onClick={() => handleOpenModal(item)} title="Edit Barang" className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-600 hover:text-primary transition-colors flex items-center justify-center shadow-sm">
                                                    <span className="material-icons-round text-[18px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} title="Hapus Barang" className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-600 hover:text-red-500 transition-colors flex items-center justify-center shadow-sm">
                                                    <span className="material-icons-round text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className={`${viewMode === 'list' ? 'flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center' : 'p-3 flex-1 flex flex-col'}`}>
                                        <div className={`${viewMode === 'list' ? 'flex-1 mb-3 sm:mb-0' : 'mb-3'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0">
                                                    <h3 className={`font-extrabold truncate ${viewMode === 'grid' ? 'text-[15px] mb-1' : 'text-[15px]'}`} title={item.name}>{item.name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight truncate">
                                                        {item.lab_name || 'Gudang Utama'} • {item.location || 'Rak A'}
                                                    </p>
                                                    {item.barcode && (
                                                        <div className="mt-1">
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">
                                                                {item.barcode}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {viewMode === 'list' && isAdmin && (
                                                    <div className="flex gap-1 ml-4 shrink-0">
                                                        <button onClick={() => handleOpenHistory(item)} title="Kartu Stok" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-white text-slate-500 hover:text-indigo-500 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                                                            <span className="material-icons-round text-lg">history</span>
                                                        </button>
                                                        <button onClick={() => { setTxItem(item); setTxForm({ transaction_type: 'opname', quantity_changed: '', notes: '', is_converted: false }); setShowTxModal(true); }} title="Stok Opname" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-white text-slate-500 hover:text-amber-500 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                                                            <span className="material-icons-round text-lg">inventory</span>
                                                        </button>
                                                        <button onClick={() => handleOpenModal(item)} title="Edit Barang" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-white text-slate-500 hover:text-primary transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                                                            <span className="material-icons-round text-lg">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id)} title="Hapus Barang" className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-white text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
                                                            <span className="material-icons-round text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`space-y-2 ${viewMode === 'list' ? 'w-full sm:w-48 shrink-0' : 'mt-auto'}`}>
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stok</span>
                                                <span className={item.stock <= item.min_stock ? 'text-red-500 text-xs' : 'text-slate-900 dark:text-white text-xs'}>
                                                    {item.stock} / 100 {item.unit}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${item.stock <= item.min_stock ? 'bg-gradient-to-r from-red-500 to-rose-400' : 'bg-gradient-to-r from-primary to-primary-400'
                                                        }`}
                                                    style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            {item.stock <= item.min_stock && (
                                                <p className="text-[10px] text-red-500 font-black uppercase flex items-center gap-1 animate-pulse pt-1">
                                                    <span className="material-icons-round text-xs">warning</span>
                                                    Mepet (Min: {item.min_stock})
                                                </p>
                                            )}
                                            
                                            <div className="pt-1">
                                                {item.type === 'bhp' && (
                                                    <button 
                                                        onClick={() => {
                                                            setTxItem(item);
                                                            setTxForm({...txForm, transaction_type: 'usage'});
                                                            setShowTxModal(true);
                                                        }}
                                                        className={`w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 ${viewMode === 'grid' ? 'text-xs' : 'text-xs'}`}
                                                    >
                                                        <span className="material-icons-round text-[16px]">science</span>
                                                        Catat Pakai
                                                    </button>
                                                )}
                                                {item.type === 'alat' && (
                                                    <button 
                                                        onClick={() => navigate('/loans')}
                                                        className={`w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 ${viewMode === 'grid' ? 'text-xs' : 'text-xs'}`}
                                                    >
                                                        <span className="material-icons-round text-[16px]">handshake</span>
                                                        Pinjam
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Halaman {currentPage} dari {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="material-icons-round text-sm">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="material-icons-round text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">inventory_2</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Barang Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Coba cari dengan kata kunci lain atau tambahkan barang baru.</p>
                    </div>
                )}
            </main>

            {/* Premium Form Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-5">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    ></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-l-8 border-l-primary animate-slide-up sm:animate-zoom-in">
                        <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-4 sm:hidden"></div>
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingItem ? 'Edit Barang' : 'Tambah Barang'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                            
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'alat' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.type === 'alat' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                                >
                                    Alat Laboratorium
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'bahan' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.type === 'bahan' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Bahan/Reagen (BHP)
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Barang *</label>
                                        <input
                                            required
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                            placeholder="Contoh: Mikroskop Binokuler"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                        <select
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Alat">Alat Lab</option>
                                            <option value="Reagen">Reagen/Bahan</option>
                                            <option value="Habis Pakai">Habis Pakai</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Lab *</label>
                                        <select
                                            required
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                            value={formData.lab_id}
                                            onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                                        >
                                            <option value="">Pilih Lab...</option>
                                            {labs.map(lab => (
                                                <option key={lab.id} value={lab.id}>{lab.code} - {lab.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode / PLU</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none font-mono transition-shadow"
                                            placeholder="Opsional (Scan Barcode)"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gambar Barang</label>
                                        <div className="flex gap-4 items-center">
                                            {formData.image_url ? (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <span className="material-icons-round text-slate-300">image</span>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex gap-2">
                                                    <input
                                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                        placeholder="URL Gambar (https://...)"
                                                        value={formData.image_url}
                                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowMediaPicker(true)}
                                                        className="px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs transition-colors whitespace-nowrap"
                                                    >
                                                        Galeri
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 md:col-span-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok *</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                value={formData.stock}
                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan *</label>
                                            <input
                                                required
                                                placeholder="Unit/ml"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Stok *</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                value={formData.min_stock}
                                                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detail Lokasi Penyimpanan</label>
                                        <input
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                            placeholder="Contoh: Rak C, Laci 2, Lemari Kaca..."
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>

                                    {formData.type === 'bahan' && (
                                        <div className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-round text-indigo-500 text-sm">science</span>
                                                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Spesifikasi Bahan Khusus</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Rumus Kimia</label>
                                                    <input
                                                        placeholder="Contoh: H2O"
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                                        value={formData.formula}
                                                        onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tingkat Bahaya (MSDS)</label>
                                                    <select
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                                        value={formData.msds_level}
                                                        onChange={(e) => setFormData({ ...formData, msds_level: e.target.value })}
                                                    >
                                                        <option value="">Aman</option>
                                                        <option value="Iritasi">Iritasi</option>
                                                        <option value="Beracun">Beracun</option>
                                                        <option value="Mudah Terbakar">Mudah Terbakar</option>
                                                        <option value="Korosif">Korosif</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Bentuk Fisik</label>
                                                    <select
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                                        value={formData.physical_state}
                                                        onChange={(e) => setFormData({ ...formData, physical_state: e.target.value })}
                                                    >
                                                        <option value="">Pilih Bentuk...</option>
                                                        <option value="Cair">Cair</option>
                                                        <option value="Padat">Padat / Bubuk</option>
                                                        <option value="Gas">Gas</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">No. Batch</label>
                                                    <input
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                                        value={formData.batch_number}
                                                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Kadaluarsa</label>
                                                    <input
                                                        type="date"
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow"
                                                        value={formData.expired_date}
                                                        onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Tambahan</label>
                                        <textarea
                                            rows="2"
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-shadow"
                                            placeholder="Kondisi barang, catatan kalibrasi, spesifikasi umum..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
                                >
                                    {editingItem ? 'Simpan Perubahan' : 'Tambahkan Sekarang'}
                                </button>
                            </form>
                        </div>
                    </div>
            )}

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMediaPicker(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black tracking-tight">Pilih Media</h2>
                            <button onClick={() => setShowMediaPicker(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <span className="material-icons-round text-xl">close</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {MOCK_MEDIA.filter(m => m.type === 'image').map(media => (
                                <button
                                    key={media.id}
                                    onClick={() => {
                                        setFormData({ ...formData, image_url: media.url });
                                        setShowMediaPicker(false);
                                    }}
                                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all text-left"
                                >
                                    <img src={media.url} alt={media.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-[10px] text-white font-bold truncate">{media.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

                {/* Transaction Modal */}
            {showTxModal && txItem && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTxModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-t border-x sm:border border-white/20 animate-slide-up sm:animate-zoom-in">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
                            <div>
                                <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-400">Catat Transaksi Bahan</h3>
                                <p className="text-xs text-indigo-500">{txItem.name}</p>
                            </div>
                            <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Transaksi</label>
                                <select
                                    required
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={txForm.transaction_type}
                                    onChange={(e) => setTxForm({ ...txForm, transaction_type: e.target.value })}
                                >
                                    <option value="usage">Penggunaan (Kurangi Stok)</option>
                                    <option value="waste">Waste / Dibuang (Kurangi Stok)</option>
                                    <option value="restock">Restock (Tambah Stok)</option>
                                    <option value="opname">Stock Opname (Set Stok Aktual)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    {txForm.transaction_type === 'opname' ? 'Stok Aktual (Saat Ini)' : `Jumlah (${txItem.unit})`}
                                </label>
                                
                                {txForm.is_converted ? (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder={`Misal: 50`}
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                                value={txForm.converted_quantity || ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    const factor = parseFloat(txForm.conversion_factor) || 1;
                                                    setTxForm({ 
                                                        ...txForm, 
                                                        converted_quantity: val,
                                                        quantity_changed: val / factor
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Satuan kecil (ml, gr)"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                                value={txForm.conversion_unit || ''}
                                                onChange={(e) => setTxForm({ ...txForm, conversion_unit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={txForm.quantity_changed}
                                        onChange={(e) => setTxForm({ ...txForm, quantity_changed: e.target.value })}
                                    />
                                )}

                                <div className="flex items-center gap-2 mt-2 px-1">
                                    <input 
                                        type="checkbox" 
                                        id="use_conversion" 
                                        className="rounded text-indigo-500 focus:ring-indigo-500 bg-slate-100 border-slate-300"
                                        checked={txForm.is_converted || false}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setTxForm({
                                                ...txForm,
                                                is_converted: checked,
                                                conversion_factor: checked ? 1000 : 1, // Default 1000
                                                conversion_unit: checked ? 'ml/gr' : '',
                                                converted_quantity: 0,
                                                quantity_changed: 0
                                            });
                                        }}
                                    />
                                    <label htmlFor="use_conversion" className="text-xs text-slate-600 dark:text-slate-400 font-bold cursor-pointer">Gunakan Konversi Satuan Kecil</label>
                                </div>

                                {txForm.is_converted && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl mt-2 border border-indigo-100 dark:border-indigo-800/50">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Nilai Konversi (1 {txItem.unit} = ... {txForm.conversion_unit || 'satuan'})</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">1 {txItem.unit} =</span>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                className="w-24 bg-white dark:bg-slate-800 border-none rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                                value={txForm.conversion_factor || 1000}
                                                onChange={(e) => {
                                                    const factor = parseFloat(e.target.value) || 1;
                                                    const qty = parseFloat(txForm.converted_quantity) || 0;
                                                    setTxForm({ 
                                                        ...txForm, 
                                                        conversion_factor: factor,
                                                        quantity_changed: qty / factor
                                                    });
                                                }}
                                            />
                                            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{txForm.conversion_unit || 'satuan'}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-indigo-600/70 mt-2">
                                            Sistem akan mengurangi: <span className="text-indigo-700 bg-indigo-100 px-1 rounded">{txForm.quantity_changed || 0} {txItem.unit}</span> dari stok utama.
                                        </p>
                                    </div>
                                )}

                                {txForm.transaction_type === 'usage' && !txForm.is_converted && (
                                    <p className="text-xs text-slate-500 px-1 mt-1 font-medium">Stok saat ini: <span className="font-bold text-slate-700 dark:text-slate-300">{txItem.stock} {txItem.unit}</span></p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan / Catatan</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                                    placeholder={txForm.transaction_type === 'usage' ? 'Digunakan untuk praktikum / riset apa?' : 'Alasan penyesuaian stok...'}
                                    value={txForm.notes}
                                    onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-colors active:scale-[0.98]"
                            >
                                {txForm.transaction_type === 'usage' ? 'Ajukan Permintaan & Cetak Bukti' : 'Simpan Transaksi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Kartu Stok */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-extrabold text-lg">Kartu Stok</h3>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                                    {selectedHistoryItem?.name} ({selectedHistoryItem?.unit})
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleExportCSV} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-bold">
                                    <span className="material-icons-round text-sm">download</span> CSV
                                </button>
                                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-bold">
                                    <span className="material-icons-round text-sm">print</span> Cetak
                                </button>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ml-2"
                                >
                                    <span className="material-icons-round text-sm">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="flex flex-wrap items-center gap-4 mb-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dari</label>
                                    <input 
                                        type="date" 
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={historyStartDate}
                                        onChange={e => setHistoryStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sampai</label>
                                    <input 
                                        type="date" 
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={historyEndDate}
                                        onChange={e => setHistoryEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loadingHistory ? (
                                <div className="py-10 text-center">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Riwayat...</p>
                                </div>
                            ) : historyTransactions.filter(tx => {
                                const txDate = tx.transaction_date.slice(0, 10);
                                return txDate >= historyStartDate && txDate <= historyEndDate;
                            }).length === 0 ? (
                                <div className="py-10 text-center">
                                    <span className="material-icons-round text-4xl text-slate-300 mb-2">history_toggle_off</span>
                                    <p className="text-sm font-bold text-slate-500">Belum ada riwayat transaksi pada periode ini</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                            <tr>
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-4 py-3">Transaksi</th>
                                                <th className="px-4 py-3 text-right text-emerald-500">Masuk</th>
                                                <th className="px-4 py-3 text-right text-rose-500">Keluar</th>
                                                <th className="px-4 py-3 text-right text-indigo-500">Sisa</th>
                                                <th className="px-4 py-3">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {historyTransactions.filter(tx => {
                                                const txDate = tx.transaction_date.slice(0, 10);
                                                return txDate >= historyStartDate && txDate <= historyEndDate;
                                            }).map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium">
                                                        {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                                            tx.transaction_type === 'restock' ? 'bg-emerald-100 text-emerald-600' :
                                                            tx.transaction_type === 'usage' ? 'bg-amber-100 text-amber-600' :
                                                            tx.transaction_type === 'waste' ? 'bg-rose-100 text-rose-600' :
                                                            'bg-indigo-100 text-indigo-600'
                                                        }`}>
                                                            {tx.transaction_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-emerald-500">
                                                        {tx.masuk > 0 ? `+${tx.masuk}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-rose-500">
                                                        {tx.keluar > 0 ? `-${tx.keluar}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                                                        {tx.sisa}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[200px]">
                                                        {tx.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default InventoryPage;
