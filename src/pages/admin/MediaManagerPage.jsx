import React, { useState } from 'react';
import DesktopLayout from '../../components/layout/DesktopLayout';
import { useToast } from '../../components/ui/Toast';
import Swal from 'sweetalert2';
import { Search, Upload, Image as ImageIcon, FileText, Video, Trash2, Link, Filter, Eye, X, Folder, Plus, ChevronRight, FolderPlus, Edit2 } from 'lucide-react';

const MOCK_FOLDERS = [
    { id: 'f1', name: 'Dokumen Penting', parentId: null },
    { id: 'f2', name: 'Materi Biologi', parentId: null },
    { id: 'f3', name: 'Materi Lanjut', parentId: 'f2' }
];

const MOCK_MEDIA = [
    { id: 1, name: 'hero_background.png', type: 'image', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500', size: '2.4 MB', date: '2026-07-01', folderId: null },
    { id: 2, name: 'modul_biokimia.pdf', type: 'document', url: '#', size: '4.1 MB', date: '2026-07-02', folderId: 'f2' },
    { id: 3, name: 'tutorial_widal.mp4', type: 'video', url: '#', size: '15.2 MB', date: '2026-07-03', folderId: 'f2' },
    { id: 4, name: 'lab_hematologi_204.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500', size: '3.1 MB', date: '2026-07-04', folderId: null },
    { id: 5, name: 'sop_keamanan.pdf', type: 'document', url: '#', size: '1.2 MB', date: '2026-07-05', folderId: 'f1' }
];

const MediaManagerPage = () => {
    const toast = useToast();
    const [folders, setFolders] = useState(MOCK_FOLDERS);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [mediaFiles, setMediaFiles] = useState(MOCK_MEDIA);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dragActive, setDragActive] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [renameFolderModal, setRenameFolderModal] = useState({ isOpen: false, folder: null, newName: '' });
    const [draggingFileId, setDraggingFileId] = useState(null);
    const [dragOverFolderId, setDragOverFolderId] = useState(null);
    const [isUploadAreaVisible, setIsUploadAreaVisible] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files);
        }
    };

    const convertToWebp = (file) => {
        return new Promise((resolve) => {
            const isImage = file.type.startsWith('image/');
            // Skip non-images or SVGs/GIFs (which might lose animation or vector properties)
            if (!isImage || file.type === 'image/webp' || file.type === 'image/svg+xml' || file.type === 'image/gif') {
                resolve(file);
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Convert to WebP with 85% quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const webpFile = new File([blob], newName, { type: 'image/webp' });
                        resolve(webpFile);
                    } else {
                        resolve(file); // fallback on failure
                    }
                }, 'image/webp', 0.85);
            };
            img.onerror = () => resolve(file); // fallback on error
        });
    };

    const handleFileUpload = async (files) => {
        toast.success(`Memproses ${files.length} file... (Auto-convert WebP)`);
        
        const filePromises = Array.from(files).map(async (originalFile, i) => {
            const file = await convertToWebp(originalFile);
            
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            let type = 'document';
            if (isImage) type = 'image';
            else if (isVideo) type = 'video';
            
            return {
                id: Date.now() + i,
                name: file.name,
                type: type,
                url: isImage ? URL.createObjectURL(file) : '#',
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: new Date().toISOString().split('T')[0],
                folderId: currentFolder
            };
        });
        
        const processedFiles = await Promise.all(filePromises);
        
        setMediaFiles(prev => [...processedFiles, ...prev]);
        toast.success(`Berhasil mengunggah ${files.length} file`);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus File?',
            text: 'Hapus file ini permanen?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            setMediaFiles(mediaFiles.filter(m => m.id !== id));
            toast.success('File berhasil dihapus');
        }
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newFolder = {
            id: 'f' + Date.now(),
            name: newFolderName,
            parentId: currentFolder
        };
        setFolders(prev => [...prev, newFolder]);
        setNewFolderName('');
        setIsCreateFolderModalOpen(false);
        toast.success('Folder berhasil dibuat');
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'Hapus Folder?',
            text: 'Hapus folder ini beserta seluruh isinya?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            setFolders(prev => prev.filter(f => f.id !== id));
            setMediaFiles(prev => prev.filter(m => m.folderId !== id));
            toast.success('Folder berhasil dihapus');
        }
    };

    const handleRenameFolder = () => {
        if (!renameFolderModal.newName.trim() || !renameFolderModal.folder) return;
        setFolders(prev => prev.map(f => 
            f.id === renameFolderModal.folder.id ? { ...f, name: renameFolderModal.newName } : f
        ));
        setRenameFolderModal({ isOpen: false, folder: null, newName: '' });
        toast.success('Folder berhasil diubah namanya');
    };

    const handleFileDragStart = (e, fileId) => {
        setDraggingFileId(fileId);
        e.dataTransfer.setData('text/plain', fileId);
    };

    const handleFolderDragOver = (e, folderId) => {
        e.preventDefault();
        setDragOverFolderId(folderId);
    };

    const handleFolderDrop = (e, folderId) => {
        e.preventDefault();
        setDragOverFolderId(null);
        if (draggingFileId) {
            setMediaFiles(prev => prev.map(m => 
                m.id === draggingFileId ? { ...m, folderId } : m
            ));
            toast.success('File dipindahkan');
            setDraggingFileId(null);
        }
    };

    const getBreadcrumbs = () => {
        const crumbs = [];
        let curr = currentFolder;
        while (curr) {
            const folder = folders.find(f => f.id === curr);
            if (folder) {
                crumbs.unshift(folder);
                curr = folder.parentId;
            } else {
                break;
            }
        }
        return crumbs;
    };

    const copyLink = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('Link disalin ke clipboard');
    };

    const getIcon = (type) => {
        switch(type) {
            case 'image': return <ImageIcon className="w-10 h-10 text-blue-500" />;
            case 'video': return <Video className="w-10 h-10 text-purple-500" />;
            default: return <FileText className="w-10 h-10 text-orange-500" />;
        }
    };

    const isSearching = searchTerm.trim() !== '';

    const filteredFolders = folders.filter(folder => {
        if (isSearching) {
            return folder.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return folder.parentId === currentFolder;
    });

    const filteredMedia = mediaFiles.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === 'all' || item.type === filterType;
        const matchFolder = isSearching ? true : item.folderId === currentFolder;
        return matchSearch && matchType && matchFolder;
    });

    return (
        <DesktopLayout title="Media Manager">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Breadcrumbs and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
                        <button 
                            onClick={() => setCurrentFolder(null)}
                            onDragOver={(e) => handleFolderDragOver(e, 'root')}
                            onDragLeave={() => setDragOverFolderId(null)}
                            onDrop={(e) => handleFolderDrop(e, null)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${!currentFolder ? 'text-primary font-bold bg-primary/10' : 'text-slate-500 hover:text-primary'} ${dragOverFolderId === 'root' ? 'bg-primary/20 ring-2 ring-primary/50' : ''}`}
                        >
                            <Folder className="w-4 h-4" /> Root
                        </button>
                        {getBreadcrumbs().map((crumb) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                <button 
                                    onClick={() => setCurrentFolder(crumb.id)}
                                    onDragOver={(e) => handleFolderDragOver(e, crumb.id)}
                                    onDragLeave={() => setDragOverFolderId(null)}
                                    onDrop={(e) => handleFolderDrop(e, crumb.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${currentFolder === crumb.id ? 'text-primary font-bold bg-primary/10' : 'text-slate-500 hover:text-primary'} ${dragOverFolderId === crumb.id ? 'bg-primary/20 ring-2 ring-primary/50' : ''}`}
                                >
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsUploadAreaVisible(!isUploadAreaVisible)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex-1 sm:flex-none justify-center ${isUploadAreaVisible ? 'bg-primary text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                        <button 
                            onClick={() => setIsCreateFolderModalOpen(true)}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex-1 sm:flex-none justify-center"
                        >
                            <FolderPlus className="w-4 h-4" />
                            Buat Folder
                        </button>
                    </div>
                </div>

                {/* Upload Area */}
                {isUploadAreaVisible && (
                    <div 
                        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors animate-fade-in ${dragActive ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Unggah File Media</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                            Tarik dan lepas file ke area ini, atau klik tombol di bawah untuk memilih file (Mendukung JPG, PNG, PDF, MP4).
                        </p>
                        <label className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg cursor-pointer transition-colors font-medium">
                            Pilih File
                            <input type="file" multiple className="hidden" onChange={handleChange} />
                        </label>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari file..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        <Filter className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                        {['all', 'image', 'document', 'video'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                    filterType === type 
                                    ? 'bg-primary text-white' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {type === 'all' ? 'Semua File' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Render Folders First */}
                    {(filterType === 'all' || filterType === 'folder') && filteredFolders.map((folder) => (
                        <div 
                            key={folder.id} 
                            onClick={() => setCurrentFolder(folder.id)}
                            onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                            onDragLeave={() => setDragOverFolderId(null)}
                            onDrop={(e) => handleFolderDrop(e, folder.id)}
                            className={`bg-white dark:bg-slate-800 rounded-xl border ${dragOverFolderId === folder.id ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-700'} shadow-sm overflow-hidden group cursor-pointer hover:border-primary/50 transition-all`}
                        >
                            <div className="aspect-square bg-slate-50 dark:bg-slate-900/50 relative flex items-center justify-center p-4">
                                <Folder className="w-16 h-16 text-yellow-400 fill-yellow-400/20" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); setRenameFolderModal({ isOpen: true, folder, newName: folder.name }); }} className="p-1.5 bg-white dark:bg-slate-800 hover:bg-blue-500 hover:text-white rounded-lg text-blue-500 shadow-sm transition-colors" title="Ubah Nama">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => handleDeleteFolder(folder.id, e)} className="p-1.5 bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 shadow-sm transition-colors" title="Hapus Folder">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-slate-700/50">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={folder.name}>{folder.name}</p>
                                <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span>Folder</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Render Files */}
                    {filteredMedia.length === 0 && filteredFolders.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            Tidak ada item yang ditemukan.
                        </div>
                    ) : (
                        filteredMedia.map((item) => (
                            <div 
                                key={item.id} 
                                draggable
                                onDragStart={(e) => handleFileDragStart(e, item.id)}
                                onDragEnd={() => setDraggingFileId(null)}
                                className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group cursor-grab active:cursor-grabbing ${draggingFileId === item.id ? 'opacity-50 ring-2 ring-primary/20' : ''}`}
                            >
                                <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative flex items-center justify-center p-4">
                                    {item.type === 'image' && item.url !== '#' ? (
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover absolute inset-0" />
                                    ) : (
                                        getIcon(item.type)
                                    )}
                                    
                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button onClick={() => setPreviewItem(item)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Pratinjau">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => copyLink(item.url)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Salin Link">
                                            <Link className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white backdrop-blur-sm transition-colors" title="Hapus">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={item.name}>{item.name}</p>
                                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        <span>{item.size}</span>
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">
                                {previewItem.name}
                            </h3>
                            <button 
                                onClick={() => setPreviewItem(null)} 
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0 text-slate-500 dark:text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[50vh]">
                            {previewItem.type === 'image' && (
                                <img src={previewItem.url} alt={previewItem.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
                            )}
                            {previewItem.type === 'video' && (
                                <video src={previewItem.url} controls autoPlay className="max-w-full max-h-[70vh] rounded-lg shadow-lg bg-black"></video>
                            )}
                            {previewItem.type === 'document' && (
                                <div className="text-center p-8">
                                    <FileText className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">Pratinjau langsung tidak tersedia untuk format dokumen ini.</p>
                                    <a href={previewItem.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
                                        Unduh File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {isCreateFolderModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Buat Folder Baru</h3>
                            <button 
                                onClick={() => setIsCreateFolderModalOpen(false)} 
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nama Folder
                            </label>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Misal: Dokumen Penting"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateFolder();
                                }}
                            />
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsCreateFolderModalOpen(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim()}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                            >
                                Buat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Folder Modal */}
            {renameFolderModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Ubah Nama Folder</h3>
                            <button 
                                onClick={() => setRenameFolderModal({ isOpen: false, folder: null, newName: '' })} 
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nama Folder
                            </label>
                            <input
                                type="text"
                                value={renameFolderModal.newName}
                                onChange={(e) => setRenameFolderModal(prev => ({ ...prev, newName: e.target.value }))}
                                placeholder="Misal: Dokumen Penting"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-slate-200"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameFolder();
                                }}
                            />
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button 
                                onClick={() => setRenameFolderModal({ isOpen: false, folder: null, newName: '' })}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleRenameFolder}
                                disabled={!renameFolderModal.newName.trim()}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DesktopLayout>
    );
};

export default MediaManagerPage;
