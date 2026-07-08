import React, { useState, useEffect } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';

const TransactionHistoryPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const isLabHead = user?.role === 'admin' || user?.role === 'lecturer' || user?.role === 'laboran';

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await api.getTransactions();
            setTransactions(data);
        } catch (error) {
            toast.error('Gagal memuat histori transaksi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const printBuktiPemberian = (tx) => {
        const printWindow = window.open('', '_blank');
        const now = new Date();
        const date = new Date(tx.transaction_date || now).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        const receiptNo = `BPBR-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
        
        const html = `
            <html>
                <head>
                    <title>Bukti Pemberian Bahan/Reagen</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h2 { text-align: center; text-decoration: underline; margin-bottom: 30px; }
                        .content { max-width: 600px; margin: 0 auto; }
                        .row { display: flex; margin-bottom: 10px; }
                        .label { width: 150px; font-weight: bold; }
                        .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
                        .sig-box { width: 200px; }
                        .sig-line { border-bottom: 1px solid #000; margin-top: 60px; margin-bottom: 5px; }
                        @media print { @page { margin: 1.5cm; } }
                    </style>
                </head>
                <body>
                    <div class="content">
                        <h2>BUKTI PEMBERIAN BARANG / REAGEN</h2>
                        <div class="row"><div class="label">No. Bukti</div><div>: <b>${receiptNo}</b></div></div>
                        <div class="row"><div class="label">Tanggal</div><div>: ${date}</div></div>
                        <div class="row"><div class="label">Penerima</div><div>: ${tx.user_name || '-'}</div></div>
                        <div class="row"><div class="label">Nama Barang</div><div>: ${tx.item_name}</div></div>
                        <div class="row"><div class="label">Jumlah Diberikan</div><div>: ${Math.abs(tx.quantity_changed)} ${tx.item_unit}</div></div>
                        <div class="row"><div class="label">Keperluan</div><div>: ${tx.notes || '-'}</div></div>
                        <div class="row"><div class="label">Status</div><div>: DISETUJUI / APPROVED</div></div>
                        
                        <div class="signatures">
                            <div class="sig-box">
                                <p>Penerima,</p>
                                <div class="sig-line"></div>
                                <p>${tx.user_name || '........................'}</p>
                            </div>
                            <div class="sig-box">
                                <p>Kepala Lab / Teknisi</p>
                                <div class="sig-line"></div>
                                <p>${user?.name || '........................'}</p>
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

    const handleApprove = async (tx) => {
        const result = await Swal.fire({
            title: 'Setujui Permintaan?',
            text: 'Stok akan otomatis terpotong.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981'
        });
        if (!result.isConfirmed) return;
        try {
            await api.approveTransaction(tx.id);
            toast.success('Permintaan berhasil disetujui');
            printBuktiPemberian(tx);
            fetchTransactions();
        } catch (error) {
            toast.error(error.message || 'Gagal menyetujui permintaan');
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            title: 'Tolak Permintaan?',
            text: 'Permintaan pemakaian ini akan ditolak.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444'
        });
        if (!result.isConfirmed) return;
        try {
            await api.rejectTransaction(id);
            toast.success('Permintaan ditolak');
            fetchTransactions();
        } catch (error) {
            toast.error(error.message || 'Gagal menolak permintaan');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'usage': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            case 'waste': return 'text-rose-600 bg-rose-50 border-rose-200';
            case 'restock': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'opname': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getTypeName = (type) => {
        switch (type) {
            case 'usage': return 'Penggunaan';
            case 'waste': return 'Waste';
            case 'restock': return 'Restock';
            case 'opname': return 'Opname';
            default: return type;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Menunggu</span>;
            case 'approved': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Disetujui</span>;
            case 'rejected': return <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">Ditolak</span>;
            default: return null;
        }
    };

    return (
        <DesktopLayout title="Histori Transaksi">
            <header className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 rounded-b-2xl">
                <div className="px-6 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Histori Transaksi BHP</h1>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                            Catatan Penggunaan, Waste, dan Restock
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Pengguna</th>
                                        <th className="px-6 py-4">Item (Bahan)</th>
                                        <th className="px-6 py-4">Jenis Transaksi</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Perubahan Qty</th>
                                        <th className="px-6 py-4">Catatan</th>
                                        {isLabHead && <th className="px-6 py-4 text-right">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                {new Date(tx.transaction_date).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                {tx.user_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                                {tx.item_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getTypeColor(tx.transaction_type)}`}>
                                                    {getTypeName(tx.transaction_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(tx.status || 'approved')}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right font-black ${tx.quantity_changed < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {tx.quantity_changed > 0 ? '+' : ''}{tx.quantity_changed} {tx.item_unit}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {tx.notes || '-'}
                                            </td>
                                            {isLabHead && (
                                                <td className="px-6 py-4 text-right">
                                                    {tx.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleApprove(tx)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-xs">Setuju</button>
                                                            <button onClick={() => handleReject(tx.id)} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold text-xs">Tolak</button>
                                                        </div>
                                                    ) : tx.status === 'approved' && tx.transaction_type === 'usage' ? (
                                                        <button onClick={() => printBuktiPemberian(tx)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold underline">
                                                            Cetak Bukti
                                                        </button>
                                                    ) : '-'}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="material-icons-round text-slate-300 text-4xl">history</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Belum Ada Transaksi</h3>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Histori penggunaan, pembuangan, dan restock akan muncul di sini.</p>
                    </div>
                )}
            </main>
        </DesktopLayout>
    );
};

export default TransactionHistoryPage;
