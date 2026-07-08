import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const LoanManagementPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [returnForm, setReturnForm] = useState({
        final_condition: 'Bagus',
        fine_amount: '',
        notes: ''
    });

    const fetchLoans = async () => {
        try {
            const data = await api.getLoans();
            setLoans(data);
        } catch (error) {
            toast.error('Gagal memuat daftar peminjaman');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleReturn = async (e) => {
        e.preventDefault();
        try {
            await api.updateLoan(selectedLoan.id, { 
                status: 'returned',
                final_condition: returnForm.final_condition,
                fine_amount: returnForm.fine_amount || 0
            });
            toast.success('Peminjaman telah diselesaikan');
            setIsReturnModalOpen(false);
            fetchLoans();
        } catch (error) {
            toast.error('Gagal memperbarui status');
        }
    };

    const openReturnModal = (loan) => {
        setSelectedLoan(loan);
        setReturnForm({
            final_condition: loan.initial_condition || 'Bagus',
            fine_amount: '',
            notes: ''
        });
        setIsReturnModalOpen(true);
    };

    const filteredLoans = loans.filter(loan =>
        loan.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status.toLowerCase()) {
            case 'borrowed': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'returned': return 'bg-primary-100 text-primary-600 border-primary-200';
            case 'overdue': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 pt-12 rounded-b-2xl">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Peminjaman Alat</h1>
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Logistik Laboratorium</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-4">
                    <div className="relative group">
                        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                            placeholder="Cari peminjam atau alat..."
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
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Peminjaman...</p>
                    </div>
                ) : filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                        <div key={loan.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex gap-4">
                            {/* Large Image on left */}
                            <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-slate-700">
                                {loan.item_image_url ? (
                                    <img src={loan.item_image_url} alt={loan.item_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                        <span className="material-icons-round text-3xl">inventory_2</span>
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-bl-lg">
                                    <span className={`text-[8px] font-black uppercase ${getStatusStyles(loan.status)}`}>
                                        {loan.status}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Details on right */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-tight line-clamp-2 mb-1">{loan.item_name}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">{loan.quantity} {loan.item_unit || 'Unit'}</p>
                                    
                                    <div className="flex items-center gap-2 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5 border border-slate-100 dark:border-slate-800">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                                            {loan.user_name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{loan.user_name}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-[10px] font-bold mt-2">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <span className="material-icons-round text-[12px]">calendar_today</span>
                                        <span>{new Date(loan.loan_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    {loan.status === 'borrowed' && (
                                        <button
                                            onClick={() => openReturnModal(loan)}
                                            className="text-primary bg-primary/10 px-2 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 active:scale-95"
                                        >
                                            <span className="material-icons-round text-[12px]">check_circle</span>
                                            Kembali
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">swap_horiz</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Tidak Ada Pinjaman</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Riwayat peminjaman masih kosong.</p>
                    </div>
                )}
            </main>

            {isReturnModalOpen && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Pengembalian Alat</h3>
                            <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleReturn} className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 mb-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Info Peminjaman</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedLoan.item_name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Oleh: {selectedLoan.user_name}</p>
                                <p className="text-xs text-slate-500">Kondisi Awal: <span className="font-bold">{selectedLoan.initial_condition || 'Bagus'}</span></p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi Saat Dikembalikan</label>
                                <select 
                                    className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                    value={returnForm.final_condition}
                                    onChange={e => setReturnForm({...returnForm, final_condition: e.target.value})}
                                >
                                    <option value="Bagus">Bagus (Sesuai Awal)</option>
                                    <option value="Rusak Ringan">Rusak Ringan</option>
                                    <option value="Rusak Berat">Rusak Berat</option>
                                    <option value="Hilang">Hilang</option>
                                </select>
                            </div>

                            {returnForm.final_condition !== 'Bagus' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Denda / Ganti Rugi (Rp)</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        className="w-full border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary/20"
                                        value={returnForm.fine_amount}
                                        onChange={e => setReturnForm({...returnForm, fine_amount: e.target.value === '' ? '' : parseInt(e.target.value)})}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Masukkan nominal denda karena barang rusak/hilang.</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 rounded-xl text-white font-bold bg-primary hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20 text-sm"
                                >
                                    Konfirmasi Pengembalian
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default LoanManagementPage;
