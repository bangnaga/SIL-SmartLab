import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const ToolLoanPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [cart, setCart] = useState([]);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ purpose: 'Praktikum', initial_condition: 'Bagus', borrower_id: '' });
    const [returnForm, setReturnForm] = useState({ final_condition: 'Bagus', fine_amount: '' });
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [loanSearchTerm, setLoanSearchTerm] = useState('');
    const [activeMainTab, setActiveMainTab] = useState('pinjam'); // 'pinjam' or 'aktif'
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loans, setLoans] = useState([]);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const categories = ['Semua', 'Alat', 'Reagen', 'Habis Pakai'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const invData = await api.getInventory();
            setInventoryItems(invData);

            if (user?.role === 'admin' || user?.role === 'lecturer') {
                const usersData = await api.getUsers();
                setUsers(usersData);
            }

            const loanData = await api.getLoans();
            const relevantLoans = (user?.role === 'admin' || user?.role === 'lecturer') 
                ? loanData 
                : loanData.filter(l => l.user_id === user.id);
            setLoans(relevantLoans);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && !checkoutForm.borrower_id) {
            setCheckoutForm(prev => ({ ...prev, borrower_id: user.id }));
        }
        fetchData();
    }, [user]);

    const filteredItems = inventoryItems.filter(item => {
        const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
        const matchType = item.type === 'alat';
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchCategory && matchType && matchSearch;
    });

    const activeLoans = loans.filter(l => l.status === 'borrowed' && 
        ((l.item_name || '').toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
         (l.user_name || '').toLowerCase().includes(loanSearchTerm.toLowerCase())));
         
    const returnedLoans = loans.filter(l => l.status === 'returned' &&
        ((l.item_name || '').toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
         (l.user_name || '').toLowerCase().includes(loanSearchTerm.toLowerCase())));

    const handleReturn = async () => {
        if (!selectedLoan) return;
        try {
            await api.updateLoan(selectedLoan.id, {
                status: 'returned',
                final_condition: returnForm.final_condition,
                fine_amount: returnForm.fine_amount || 0
            });
            toast.success('Berhasil mengembalikan alat');
            setIsReturnModalOpen(false);
            setSelectedLoan(null);
            fetchData();
        } catch(e) {
            toast.error(e.message || 'Gagal mengembalikan alat');
        }
    };

    const printBuktiPeminjaman = (loanList, borrowerName = null) => {
        if (!loanList || loanList.length === 0) return;
        const printWindow = window.open('', '_blank');
        const now = new Date();
        const date = new Date(loanList[0].loan_date || now).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const receiptNo = `BPJM-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
        borrowerName = borrowerName || loanList[0].user_name || user?.name || '-';
        
        const html = `
            <html>
                <head>
                    <title>Bukti Peminjaman Alat</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h2 { text-align: center; text-decoration: underline; margin-bottom: 30px; }
                        .content { max-width: 800px; margin: 0 auto; }
                        .row { display: flex; margin-bottom: 10px; }
                        .label { width: 150px; font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
                        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
                        .sig-box { width: 200px; }
                        .sig-line { border-bottom: 1px solid #000; margin-top: 60px; margin-bottom: 5px; }
                        @media print { @page { margin: 1.5cm; } }
                    </style>
                </head>
                <body>
                    <div class="content">
                        <h2>BUKTI PEMINJAMAN ALAT</h2>
                        <div class="row"><div class="label">No. Bukti</div><div>: <b>${receiptNo}</b></div></div>
                        <div class="row"><div class="label">Tanggal Pinjam</div><div>: ${date}</div></div>
                        <div class="row"><div class="label">Peminjam</div><div>: ${borrowerName}</div></div>
                        <div class="row"><div class="label">Kondisi Awal</div><div>: ${loanList[0]?.initial_condition || 'Bagus'}</div></div>
                        <div class="row"><div class="label">Tujuan Peminjaman</div><div>: ${loanList[0]?.purpose || '-'}</div></div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Nama Alat</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${loanList.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${item.item_name || item.name}</td>
                                        <td>${item.quantity || item.cartQuantity || 1} ${item.unit || item.item_unit || 'Unit'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="signatures">
                            <div class="sig-box">
                                <p>Peminjam,</p>
                                <div class="sig-line"></div>
                                <p>${borrowerName}</p>
                            </div>
                            <div class="sig-box">
                                <p>Mengetahui,<br>Kepala Lab / Teknisi</p>
                                <div class="sig-line"></div>
                                <p>........................</p>
                            </div>
                        </div>
                    </div>
                    <script> window.onload = () => { window.print(); } </script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };
    const exportToCSV = () => {
        const dataToExport = activeMainTab === 'pinjam' ? filteredItems : activeLoans;
        if (!dataToExport.length) return toast.error('Tidak ada data untuk diekspor');
        
        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Data_${activeMainTab}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DesktopLayout title="Layanan Peminjaman">
            <header className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-primary">LabLoan</h1>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Peminjaman & Pengembalian Alat</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveMainTab('pinjam')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-colors ${activeMainTab === 'pinjam' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Pinjam Alat
                        </button>
                        <button 
                            onClick={() => setActiveMainTab('aktif')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-colors ${activeMainTab === 'aktif' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Peminjaman Aktif ({activeLoans.length})
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <button onClick={exportToCSV} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                            <span className="material-icons-round text-sm">download</span> CSV
                        </button>
                        <button onClick={handlePrint} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-bold transition flex items-center gap-2">
                            <span className="material-icons-round text-sm">print</span> Cetak/PDF
                        </button>
                    </div>
                </div>
                
                {activeMainTab === 'pinjam' && (
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-2">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto pb-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 border ${activeCategory === cat
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full lg:w-72 shrink-0">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">qr_code_scanner</span>
                            <input
                                type="text"
                                placeholder="Cari alat atau scan barcode..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                
                {activeMainTab === 'aktif' && (
                    <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-4 mt-2">
                        <div className="relative w-full lg:w-72 shrink-0">
                            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">qr_code_scanner</span>
                            <input
                                type="text"
                                placeholder="Cari nama peminjam, alat, atau barcode..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={loanSearchTerm}
                                onChange={e => setLoanSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1 p-6 flex flex-col xl:flex-row gap-6">
                {activeMainTab === 'pinjam' ? (
                    <>
                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center justify-between text-slate-900 dark:text-white px-1">
                                    Barang Tersedia
                                    <span className="text-xs font-medium text-slate-500">{filteredItems.length} Alat ditemukan</span>
                                </h3>

                                {loading ? (
                                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Memuat Inventaris...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredItems.map((item) => {
                                            const isLowStock = item.stock <= item.min_stock;
                                            return (
                                                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col active:scale-[0.99] transition-transform">
                                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.category === 'Reagen' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'}`}>
                                                                    <span className="material-icons-round">{item.category === 'Reagen' ? 'science' : 'biotech'}</span>
                                                                </div>
                                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${item.stock > 0 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'} text-[10px] font-bold`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? 'bg-primary-500' : 'bg-slate-400'}`}></span>
                                                                    {item.stock > 0 ? `${item.stock} ${item.unit} Tersedia` : 'Kosong'}
                                                                </div>
                                                            </div>
                                                            <h4 className="font-bold text-sm leading-tight text-slate-800 dark:text-white mt-1">{item.name}</h4>
                                                            <p className="text-[11px] text-slate-500 mt-1">{item.location || 'Laboratorium'}</p>
                                                        </div>
                                                        <div className="flex justify-end mt-4">
                                                            {item.stock > 0 ? (
                                                                <button
                                                                    onClick={() => setCart([...cart, { ...item, cartQuantity: 1 }])}
                                                                    disabled={cart.some(c => c.id === item.id)}
                                                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-md ${cart.some(c => c.id === item.id) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}`}
                                                                >
                                                                    <span className="material-icons-round text-sm">{cart.some(c => c.id === item.id) ? 'check' : 'add'}</span> 
                                                                    {cart.some(c => c.id === item.id) ? 'Ditambahkan' : 'Tambah'}
                                                                </button>
                                                            ) : (
                                                                <button className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-4 py-1.5 rounded-lg text-xs font-bold cursor-not-allowed" disabled>
                                                                    Tidak Tersedia
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full xl:w-80 flex-shrink-0">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-icons-round text-primary">shopping_cart</span>
                                        Keranjang
                                    </h3>
                                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0)}</span>
                                </div>
                                <div className="p-4 min-h-[200px] flex flex-col">
                                    {cart.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-center text-slate-400 my-auto">
                                            <span className="material-icons-round text-4xl mb-2 opacity-50">shopping_basket</span>
                                            <p className="text-sm font-medium">Belum ada alat yang dipilih</p>
                                            <p className="text-xs mt-1">Pilih barang dari daftar untuk mulai meminjam.</p>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col max-h-[400px]">
                                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4 hide-scrollbar">
                                                {cart.map(item => (
                                                    <div key={item.id} className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                        <div className="flex justify-between items-start">
                                                            <div className="min-w-0 flex-1 mr-2">
                                                                <p className="text-xs font-bold truncate">{item.name}</p>
                                                                <p className="text-[10px] text-slate-500">{item.location}</p>
                                                            </div>
                                                            <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-400 hover:text-red-500 shrink-0">
                                                                <span className="material-icons-round text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                                            <span className="text-[10px] font-medium text-slate-500">Jumlah</span>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, cartQuantity: Math.max(1, (c.cartQuantity || 1) - 1) } : c))}
                                                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                                                                >
                                                                    <span className="material-icons-round text-[12px]">remove</span>
                                                                </button>
                                                                <span className="text-xs font-bold w-4 text-center">{item.cartQuantity || 1}</span>
                                                                <button 
                                                                    onClick={() => setCart(cart.map(c => c.id === item.id ? { ...c, cartQuantity: Math.min(item.stock, (c.cartQuantity || 1) + 1) } : c))}
                                                                    disabled={(item.cartQuantity || 1) >= item.stock}
                                                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                                                                >
                                                                    <span className="material-icons-round text-[12px]">add</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <button 
                                                    onClick={() => setIsCheckoutModalOpen(true)}
                                                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all"
                                                >
                                                    Tinjau Permintaan
                                                    <span className="material-icons-round text-sm">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 space-y-6 w-full">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                                <h3 className="font-bold">Peminjaman Berjalan</h3>
                                {activeLoans.length > 0 && (
                                    <button 
                                        onClick={() => printBuktiPeminjaman(activeLoans)}
                                        className="text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded shadow-md shadow-indigo-500/20"
                                    >
                                        Cetak Bukti Seluruh Peminjaman
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Tgl Pinjam</th>
                                            <th className="px-6 py-4">Alat</th>
                                            <th className="px-6 py-4">Peminjam</th>
                                            <th className="px-6 py-4">Tujuan</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {activeLoans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                    {new Date(loan.loan_date).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                                    {loan.item_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {loan.user_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">
                                                    {loan.purpose}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border text-amber-600 bg-amber-50 border-amber-200">
                                                        Dipinjam
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedLoan(loan);
                                                                setIsReturnModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Kembalikan
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeLoans.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                                    Tidak ada peminjaman aktif.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm mt-8">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <h3 className="font-bold">Riwayat Pengembalian</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Tgl Kembali</th>
                                            <th className="px-6 py-4">Alat</th>
                                            <th className="px-6 py-4">Peminjam</th>
                                            <th className="px-6 py-4">Kondisi Akhir</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {returnedLoans.slice(0, 10).map((loan) => (
                                            <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                    {new Date(loan.return_date).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                                    {loan.item_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {loan.user_name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">
                                                    {loan.final_condition}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border text-emerald-600 bg-emerald-50 border-emerald-200">
                                                        Dikembalikan
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Konfirmasi Peminjaman</h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {(user?.role === 'admin' || user?.role === 'lecturer') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peminjam (Mahasiswa/Dosen)</label>
                                    <select 
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                        value={checkoutForm.borrower_id || ''}
                                        onChange={e => setCheckoutForm({...checkoutForm, borrower_id: e.target.value})}
                                    >
                                        <option value="">-- Pilih Peminjam --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role === 'student' ? 'Mahasiswa' : u.role === 'lecturer' ? 'Dosen' : u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tujuan Peminjaman</label>
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                    value={checkoutForm.purpose}
                                    onChange={e => setCheckoutForm({...checkoutForm, purpose: e.target.value})}
                                >
                                    <option value="Praktikum">Praktikum</option>
                                    <option value="Penelitian Dosen">Penelitian Dosen</option>
                                    <option value="Tugas Akhir">Tugas Akhir Mahasiswa</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi Awal Alat</label>
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                    value={checkoutForm.initial_condition}
                                    onChange={e => setCheckoutForm({...checkoutForm, initial_condition: e.target.value})}
                                >
                                    <option value="Bagus">Bagus / Berfungsi Normal</option>
                                    <option value="Ada Lecet">Ada Lecet / Cacat Ringan tapi Berfungsi</option>
                                </select>
                            </div>
                            
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary-700 dark:text-primary-300">
                                Anda akan meminjam {cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0)} barang. Pastikan alat dalam kondisi baik sebelum meninggalkan laboratorium.
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setIsCheckoutModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={async () => {
                                        try {
                                            if (!checkoutForm.borrower_id) {
                                                return toast.error("Silakan pilih peminjam terlebih dahulu.");
                                            }
                                            for (let item of cart) {
                                                await api.createLoan({
                                                    user_id: checkoutForm.borrower_id,
                                                    item_id: item.id,
                                                    quantity: item.cartQuantity || 1,
                                                    purpose: checkoutForm.purpose,
                                                    initial_condition: checkoutForm.initial_condition
                                                });
                                            }
                                            toast.success('Peminjaman berhasil diajukan');
                                            
                                            // Get borrower name
                                            let bName = user.name;
                                            if (user.role === 'admin' || user.role === 'lecturer') {
                                                const u = users.find(x => x.id === parseInt(checkoutForm.borrower_id));
                                                if (u) bName = u.name;
                                            }
                                            printBuktiPeminjaman(cart.map(c => ({...c, purpose: checkoutForm.purpose, initial_condition: checkoutForm.initial_condition})), bName);
                                            
                                            setCart([]);
                                            setIsCheckoutModalOpen(false);
                                            fetchData();
                                            setActiveMainTab('aktif');
                                        } catch (error) {
                                            toast.error(error.message || 'Gagal mengajukan pinjaman');
                                        }
                                    }}
                                    className="flex-1 py-2 rounded-xl text-white font-bold bg-primary hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 text-sm"
                                >
                                    Ajukan Peminjaman
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isReturnModalOpen && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Kembalikan Alat</h3>
                            <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
                                <p className="text-xs text-slate-500 mb-1">Alat yang dikembalikan:</p>
                                <p className="font-bold">{selectedLoan.item_name}</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi Akhir Alat</label>
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                    value={returnForm.final_condition}
                                    onChange={e => setReturnForm({...returnForm, final_condition: e.target.value})}
                                >
                                    <option value="Bagus">Bagus / Berfungsi Normal</option>
                                    <option value="Rusak Ringan">Rusak Ringan / Lecet</option>
                                    <option value="Rusak Berat">Rusak Berat / Tidak Berfungsi</option>
                                    <option value="Hilang">Hilang</option>
                                </select>
                            </div>

                            {['Rusak Ringan', 'Rusak Berat', 'Hilang'].includes(returnForm.final_condition) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Denda Kerusakan/Kehilangan (Rp)</label>
                                    <input 
                                        type="number"
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                        value={returnForm.fine_amount}
                                        onChange={e => setReturnForm({...returnForm, fine_amount: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Kosongkan atau isi 0 jika tidak ada denda.</p>
                                </div>
                            )}
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleReturn}
                                    className="flex-1 py-2 rounded-xl text-white font-bold bg-primary hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 text-sm"
                                >
                                    Selesaikan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default ToolLoanPage;
