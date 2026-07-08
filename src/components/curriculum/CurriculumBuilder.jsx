import React, { useState, useEffect, useRef } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';
import MaterialModal from './MaterialModal';
import Swal from 'sweetalert2';

// ─── Type configs ────────────────────────────────────────────────
const TYPE_CONFIG = {
    text:       { label: 'TEKS',  bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
    video:      { label: 'VIDEO', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    pdf:        { label: 'PDF',   bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    quiz:       { label: 'KUIS',  bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
    assignment: { label: 'TUGAS', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    flashcard:  { label: 'KARTU', bg: '#F0FDFA', color: '#0D9488', border: '#99F6E4' },
};
const getTypeConfig = (type) => TYPE_CONFIG[(type || '').toLowerCase()] || TYPE_CONFIG.text;

const ADD_BUTTONS = [
    { type: 'text',       label: '+ Materi Teks',     cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-transparent' },
    { type: 'video',      label: '+ Materi Video',    cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-transparent' },
    { type: 'pdf',        label: '+ Dokumen PDF',     cls: 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-transparent' },
    { type: 'quiz',       label: '+ Kuis Interaktif', cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200' },
    { type: 'assignment', label: '+ Tugas Mandiri',   cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200' },
    { type: 'flashcard',  label: '+ Kartu Pengingat', cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200' },
];

// ─── Sortable Material Item ──────────────────────────────────────
const SortableMaterialItem = ({ material, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `material-${material.id}`,
    });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
    const cfg = getTypeConfig(material.type);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-slate-100 last:border-b-0 group hover:bg-slate-50/60 transition-colors"
        >
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 shrink-0"
                tabIndex={-1}
            >
                <span className="material-icons-round text-[18px] select-none leading-none">drag_indicator</span>
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-slate-800 leading-snug truncate">{material.title}</span>
                    {material.is_prerequisite ? (
                        <span className="material-icons-round text-[13px] text-orange-400 shrink-0" title="Prasyarat">lock</span>
                    ) : null}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className="px-1.5 py-px rounded text-[9px] font-black tracking-wider shrink-0"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                        {cfg.label}
                    </span>
                    {material.description && (
                        <span className="text-[11px] text-slate-400 truncate">{material.description}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(material)} className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700">Edit</button>
                <button onClick={() => onDelete(material.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-icons-round text-[17px] leading-none">delete_outline</span>
                </button>
            </div>
        </div>
    );
};

// ─── Sortable Topic Card ─────────────────────────────────────────
const SortableTopic = ({ topic, topicNumber, defaultExpanded, onEditTopic, onDeleteTopic, onEditMaterial, onDeleteMaterial, onAddMaterial }) => {
    const { setNodeRef, transform, transition, isDragging } = useSortable({ id: `topic-${topic.id}` });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 };
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
            {/* Topic Header */}
            <div className="flex items-center px-4 py-3.5 gap-3">
                <button
                    onClick={() => setIsExpanded(v => !v)}
                    className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <span
                        className="material-icons-round text-xl leading-none transition-transform duration-200"
                        style={{ display: 'block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >chevron_right</span>
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase shrink-0">
                            Pertemuan {topicNumber}
                        </span>
                        {topic.materials.length > 0 && (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-px rounded-full shrink-0">
                                {topic.materials.length} materi
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-[14px] text-slate-900 leading-snug mt-0.5 truncate">{topic.title}</h3>
                    {topic.description && (
                        <p className="text-[11px] text-emerald-600 mt-0.5 line-clamp-1">{topic.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => onEditTopic(topic)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors" title="Pengaturan Topik">
                        <span className="material-icons-round text-[17px] leading-none">settings</span>
                    </button>
                    <button onClick={() => onDeleteTopic(topic.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Hapus Topik">
                        <span className="material-icons-round text-[17px] leading-none">delete_outline</span>
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-slate-100">
                    {/* Step 2 guide — shown only when no materials yet */}
                    {topic.materials.length === 0 && (
                        <div className="mx-4 my-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2.5">
                            <span className="material-icons-round text-blue-400 text-[16px] mt-0.5 shrink-0">info</span>
                            <p className="text-xs text-blue-700">
                                Topik berhasil dibuat! Sekarang tambahkan <strong>materi</strong> di bawah ini — bisa berupa video, teks, PDF, kuis, tugas, atau kartu pengingat.
                            </p>
                        </div>
                    )}

                    {/* Materials */}
                    <SortableContext items={topic.materials.map(m => `material-${m.id}`)} strategy={verticalListSortingStrategy}>
                        {topic.materials.map(mat => (
                            <SortableMaterialItem key={mat.id} material={mat} onEdit={onEditMaterial} onDelete={onDeleteMaterial} />
                        ))}
                    </SortableContext>

                    {/* Add material pill buttons */}
                    <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-2">
                        {ADD_BUTTONS.map(btn => (
                            <button
                                key={btn.type}
                                onClick={() => onAddMaterial(topic.id, btn.type)}
                                className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors whitespace-nowrap ${btn.cls}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Slide-in Topic Panel ────────────────────────────────────────
const TopicPanel = ({ isOpen, isEdit, title, desc, nextNumber, onTitleChange, onDescChange, onClose, onSave }) => {
    const inputRef = useRef(null);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 z-[90] bg-black/25 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`fixed top-0 right-0 z-[100] h-screen w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-0.5">
                            {isEdit ? 'Edit Pertemuan' : `Pertemuan ${nextNumber}`}
                        </p>
                        <h3 className="font-bold text-[15px] text-slate-900">
                            {isEdit ? 'Edit Detail Pertemuan' : 'Tambah Pertemuan Baru'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-icons-round text-[18px] leading-none">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
                    {!isEdit && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 flex items-start gap-2.5">
                            <span className="material-icons-round text-emerald-500 text-[16px] mt-0.5 shrink-0">lightbulb</span>
                            <p className="text-xs text-emerald-800">
                                <strong>Langkah 1:</strong> Buat Pertemuan/Topik terlebih dahulu. Setelah disimpan, Anda dapat menambahkan materi seperti Video, Teks, Kuis, dll.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Judul Pertemuan <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder={`Contoh: Pertemuan ${nextNumber}: Pengenalan HTML`}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Objektif / Tujuan Pembelajaran
                            <span className="text-slate-400 font-normal ml-1">(opsional)</span>
                        </label>
                        <textarea
                            value={desc}
                            onChange={(e) => onDescChange(e.target.value)}
                            placeholder="Mahasiswa mampu memahami konsep dasar dan menyiapkan environment pengembangan..."
                            rows={4}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                        Batal
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!title.trim()}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Buat Pertemuan →'}
                    </button>
                </div>
            </div>
        </>
    );
};

// ─── Skeleton Loader ─────────────────────────────────────────────
const SkeletonLoader = () => (
    <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-[66px] rounded-xl bg-slate-100 animate-pulse" />)}
    </div>
);

// ─── Guided Empty State ──────────────────────────────────────────
const GuidedEmptyState = ({ onAdd }) => (
    <div className="py-10 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center">
        {/* Step 1 indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">1</div>
                <span className="text-sm font-bold text-emerald-700">Buat Pertemuan</span>
            </div>
            <span className="material-icons-round text-slate-300 text-base">arrow_forward</span>
            <div className="flex items-center gap-2 opacity-40">
                <div className="w-7 h-7 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs font-black">2</div>
                <span className="text-sm font-bold text-slate-500">Tambah Materi</span>
            </div>
        </div>

        <span className="material-icons-round text-5xl text-slate-200 block mb-3">calendar_today</span>
        <p className="font-bold text-slate-700 text-sm">Mulai dengan membuat Pertemuan pertama</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Setiap kelas diorganisir per pertemuan/topik. Setelah pertemuan dibuat, Anda bisa menambahkan video, teks, kuis, dan materi lainnya.
        </p>
        <button
            onClick={onAdd}
            className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors shadow-sm"
        >
            <span className="material-icons-round text-[18px]">add</span>
            Buat Pertemuan Pertama
        </button>
    </div>
);

// ─── Main CurriculumBuilder ──────────────────────────────────────
const CurriculumBuilder = ({ courseId }) => {
    const toast = useToast();
    const [topics, setTopics] = useState([]);
    const [uncategorized, setUncategorized] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicTitle, setTopicTitle] = useState('');
    const [topicDesc, setTopicDesc] = useState('');

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [materialModalConfig, setMaterialModalConfig] = useState({ topicId: null, type: 'text', material: null });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const loadCurriculum = async () => {
        setLoading(true);
        try {
            const data = await api.getCurriculum(courseId);
            setTopics(data.topics || []);
            setUncategorized(data.uncategorized || []);
        } catch {
            toast.error('Gagal memuat kurikulum');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (courseId) loadCurriculum(); }, [courseId]);

    // ── Drag End ──
    const handleDragEnd = async ({ active, over }) => {
        if (!over) return;
        const aId = String(active.id), oId = String(over.id);

        if (aId.startsWith('topic-') && oId.startsWith('topic-')) {
            const aNum = parseInt(aId.replace('topic-', ''));
            const oNum = parseInt(oId.replace('topic-', ''));
            if (aNum === oNum) return;
            const reordered = arrayMove(topics, topics.findIndex(t => t.id === aNum), topics.findIndex(t => t.id === oNum));
            setTopics(reordered);
            try {
                await api.reorderCurriculum(courseId, { topics: reordered.map((t, i) => ({ id: t.id, order_index: i + 1 })) });
                toast.success('Urutan topik diperbarui');
            } catch {
                toast.error('Gagal menyimpan urutan');
                loadCurriculum();
            }
            return;
        }

        if (aId.startsWith('material-')) {
            const aMatId = parseInt(aId.replace('material-', ''));
            let activeMat = null, srcTopicId = null;
            for (const t of topics) {
                const f = t.materials.find(m => m.id === aMatId);
                if (f) { activeMat = f; srcTopicId = t.id; break; }
            }
            if (!activeMat) { activeMat = uncategorized.find(m => m.id === aMatId); }
            if (!activeMat) return;

            let tgtTopicId = srcTopicId, overMatId = null;
            if (oId.startsWith('material-')) {
                overMatId = parseInt(oId.replace('material-', ''));
                for (const t of topics) {
                    if (t.materials.some(m => m.id === overMatId)) { tgtTopicId = t.id; break; }
                }
                if (uncategorized.some(m => m.id === overMatId)) tgtTopicId = null;
            } else if (oId.startsWith('topic-')) {
                tgtTopicId = parseInt(oId.replace('topic-', ''));
            }

            let ut = topics.map(t => ({ ...t, materials: [...t.materials] }));
            let uu = [...uncategorized];

            if (srcTopicId) {
                const si = ut.findIndex(t => t.id === srcTopicId);
                ut[si].materials = ut[si].materials.filter(m => m.id !== aMatId);
            } else {
                uu = uu.filter(m => m.id !== aMatId);
            }

            const updMat = { ...activeMat, topic_id: tgtTopicId };
            if (tgtTopicId) {
                const ti = ut.findIndex(t => t.id === tgtTopicId);
                if (overMatId) {
                    ut[ti].materials.splice(ut[ti].materials.findIndex(m => m.id === overMatId), 0, updMat);
                } else {
                    ut[ti].materials.push(updMat);
                }
            } else {
                if (overMatId) {
                    uu.splice(uu.findIndex(m => m.id === overMatId), 0, updMat);
                } else {
                    uu.push(updMat);
                }
            }

            setTopics(ut);
            setUncategorized(uu);

            const payload = [];
            ut.forEach(t => t.materials.forEach((m, i) => payload.push({ id: m.id, topic_id: t.id, order_index: i + 1 })));
            uu.forEach((m, i) => payload.push({ id: m.id, topic_id: null, order_index: i + 1 }));
            try {
                await api.reorderCurriculum(courseId, { materials: payload });
                toast.success('Urutan materi diperbarui');
            } catch {
                toast.error('Gagal menyimpan urutan');
                loadCurriculum();
            }
        }
    };

    // ── Topic CRUD ──
    const openAddPanel = () => { setSelectedTopic(null); setTopicTitle(''); setTopicDesc(''); setIsPanelOpen(true); };
    const openEditPanel = (topic) => { setSelectedTopic(topic); setTopicTitle(topic.title); setTopicDesc(topic.description || ''); setIsPanelOpen(true); };

    const handleSaveTopic = async () => {
        if (!topicTitle.trim()) return;
        try {
            if (selectedTopic) {
                await api.updateTopic(selectedTopic.id, { title: topicTitle, description: topicDesc });
                toast.success('Pertemuan berhasil diperbarui');
            } else {
                await api.createTopic(courseId, { title: topicTitle, description: topicDesc });
                toast.success('Pertemuan baru berhasil dibuat!');
            }
            setIsPanelOpen(false);
            loadCurriculum();
        } catch {
            toast.error('Gagal menyimpan pertemuan');
        }
    };

    const handleDeleteTopic = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Pertemuan?',
            text: 'Menghapus pertemuan ini juga akan menghapus seluruh materi di dalamnya. Lanjutkan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.deleteTopic(id);
            toast.success('Pertemuan berhasil dihapus');
            loadCurriculum();
        } catch {
            toast.error('Gagal menghapus pertemuan');
        }
    };

    // ── Material CRUD ──
    const handleAddMaterial = (topicId, type) => { setMaterialModalConfig({ topicId, type, material: null }); setIsMaterialModalOpen(true); };
    const handleEditMaterial = (mat) => { setMaterialModalConfig({ topicId: mat.topic_id, type: mat.type, material: mat }); setIsMaterialModalOpen(true); };
    const handleDeleteMaterial = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Materi?',
            text: 'Hapus materi ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });
        if (!result.isConfirmed) return;
        try {
            await api.deleteMaterial(id);
            toast.success('Materi berhasil dihapus');
            loadCurriculum();
        } catch {
            toast.error('Gagal menghapus materi');
        }
    };

    return (
        <div className="space-y-4">
            {/* ── Header bar ── */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-bold text-[14px] text-slate-800">Alur Pembelajaran</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Susun materi per pertemuan/topik. Buat pertemuan terlebih dahulu, lalu tambahkan materi di dalamnya.
                    </p>
                </div>
                {topics.length > 0 && (
                    <button
                        onClick={openAddPanel}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                        <span className="material-icons-round text-[16px] leading-none">add</span>
                        + Pertemuan Baru
                    </button>
                )}
            </div>

            {/* ── Step guide bar — shown when there are topics but some have no materials ── */}
            {!loading && topics.length > 0 && topics.some(t => t.materials.length === 0) && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                            <span className="text-xs font-semibold text-slate-600">Pertemuan Dibuat</span>
                        </div>
                        <span className="material-icons-round text-slate-300 text-sm">arrow_forward</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                            <span className="text-xs font-semibold text-blue-700">Tambahkan Materi ke setiap pertemuan</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <SkeletonLoader />
            ) : topics.length === 0 && uncategorized.length === 0 ? (
                <GuidedEmptyState onAdd={openAddPanel} />
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="space-y-3">
                        <SortableContext items={topics.map(t => `topic-${t.id}`)} strategy={verticalListSortingStrategy}>
                            {topics.map((topic, idx) => (
                                <SortableTopic
                                    key={topic.id}
                                    topic={topic}
                                    topicNumber={idx + 1}
                                    defaultExpanded={idx === 0 || topic.materials.length === 0}
                                    onEditTopic={openEditPanel}
                                    onDeleteTopic={handleDeleteTopic}
                                    onEditMaterial={handleEditMaterial}
                                    onDeleteMaterial={handleDeleteMaterial}
                                    onAddMaterial={handleAddMaterial}
                                />
                            ))}
                        </SortableContext>

                        {/* Add next topic button — bottom shortcut */}
                        <button
                            onClick={openAddPanel}
                            className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-round text-[18px] leading-none">add_circle_outline</span>
                            Tambah Pertemuan Berikutnya
                        </button>

                        {/* Uncategorized */}
                        {uncategorized.length > 0 && (
                            <div className="bg-white rounded-xl border border-dashed border-amber-300 overflow-hidden mt-4">
                                <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100 flex items-center gap-2">
                                    <span className="material-icons-round text-amber-500 text-[15px]">warning_amber</span>
                                    <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Materi Tanpa Pertemuan</h3>
                                    <span className="text-[10px] text-amber-600 ml-1">— seret ke pertemuan yang sesuai</span>
                                </div>
                                <SortableContext items={uncategorized.map(m => `material-${m.id}`)} strategy={verticalListSortingStrategy}>
                                    {uncategorized.map(mat => (
                                        <SortableMaterialItem key={mat.id} material={mat} onEdit={handleEditMaterial} onDelete={handleDeleteMaterial} />
                                    ))}
                                </SortableContext>
                            </div>
                        )}
                    </div>
                </DndContext>
            )}

            {/* ── Topic slide panel ── */}
            <TopicPanel
                isOpen={isPanelOpen}
                isEdit={!!selectedTopic}
                title={topicTitle}
                desc={topicDesc}
                nextNumber={topics.length + 1}
                onTitleChange={setTopicTitle}
                onDescChange={setTopicDesc}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSaveTopic}
            />

            {/* ── Material modal ── */}
            {isMaterialModalOpen && (
                <MaterialModal
                    isOpen={isMaterialModalOpen}
                    onClose={() => setIsMaterialModalOpen(false)}
                    onSave={() => { setIsMaterialModalOpen(false); loadCurriculum(); }}
                    courseId={courseId}
                    topicId={materialModalConfig.topicId}
                    type={materialModalConfig.type}
                    material={materialModalConfig.material}
                />
            )}
        </div>
    );
};

export default CurriculumBuilder;
