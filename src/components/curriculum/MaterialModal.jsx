import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

const MaterialModal = ({ isOpen, onClose, onSave, courseId, topicId, type: initialType, material }) => {
    const toast = useToast();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [materialType, setMaterialType] = useState(initialType || 'text');
    const [isPrerequisite, setIsPrerequisite] = useState(false);
    const [saving, setSaving] = useState(false);

    // AI Flashcard States
    const [aiConfig, setAiConfig] = useState({
        type: 'Materi Umum (Tanya-Jawab)',
        count: 10,
        concept: '',
        customPrompt: ''
    });
    const [generatingAI, setGeneratingAI] = useState(false);
    const [flashcards, setFlashcards] = useState([]); // Array of { front, back }

    // Quiz States
    const [quizQuestions, setQuizQuestions] = useState([]); // Array of { question, options: [A, B, C, D], answer: 'A' }

    useEffect(() => {
        if (material) {
            setTitle(material.title || '');
            setDescription(material.description || '');
            setUrl(material.url || '');
            setMaterialType(material.type || 'text');
            setIsPrerequisite(!!material.is_prerequisite);
            
            if (material.type === 'flashcard' && material.content) {
                setFlashcards(material.content.flashcards || []);
            }
            if (material.type === 'quiz' && material.content) {
                setQuizQuestions(material.content.questions || []);
            }
        } else {
            setTitle('');
            setDescription('');
            setUrl('');
            setMaterialType(initialType || 'text');
            setIsPrerequisite(false);
            setFlashcards([]);
            setQuizQuestions([]);
        }
    }, [material, initialType]);

    // AI Generation Handler
    const handleGenerateAIFlashcards = async () => {
        if (!aiConfig.concept.trim()) {
            toast.error('Harap masukkan topik atau konsep belajar');
            return;
        }
        setGeneratingAI(true);
        try {
            const data = await api.generateFlashcards({
                user_id: user.id,
                concept: aiConfig.concept,
                type: aiConfig.type,
                count: aiConfig.count,
                customPrompt: aiConfig.customPrompt
            });
            setFlashcards(data.flashcards || []);
            toast.success('Flashcard berhasil digenerate oleh AI!');
        } catch (err) {
            toast.error(err.message || 'Gagal generate flashcards');
        } finally {
            setGeneratingAI(false);
        }
    };

    // Manual Flashcard helpers
    const handleAddFlashcardManual = () => {
        setFlashcards([...flashcards, { front: '', back: '' }]);
    };

    const handleUpdateFlashcard = (idx, side, value) => {
        const updated = [...flashcards];
        updated[idx][side] = value;
        setFlashcards(updated);
    };

    const handleDeleteFlashcard = (idx) => {
        setFlashcards(flashcards.filter((_, i) => i !== idx));
    };

    // Manual Quiz Helpers
    const handleAddQuizQuestion = () => {
        setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], answer: 'A' }]);
    };

    const handleUpdateQuizQuestion = (idx, field, value, optIdx = null) => {
        const updated = [...quizQuestions];
        if (field === 'option' && optIdx !== null) {
            updated[idx].options[optIdx] = value;
        } else {
            updated[idx][field] = value;
        }
        setQuizQuestions(updated);
    };

    const handleDeleteQuizQuestion = (idx) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
    };

    // Form Save
    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Judul materi harus diisi');
            return;
        }

        setSaving(true);
        try {
            let content = null;
            if (materialType === 'flashcard') {
                content = { flashcards };
            } else if (materialType === 'quiz') {
                content = { questions: quizQuestions };
            }

            const payload = {
                title,
                type: materialType,
                url: url || '',
                description: description || '',
                topic_id: topicId || null,
                course_id: courseId,
                content,
                is_prerequisite: isPrerequisite ? 1 : 0,
                lecturer_id: user.id
            };

            if (material) {
                await api.updateMaterial(material.id, payload);
                toast.success('Materi berhasil diperbarui');
            } else {
                await api.createMaterial(payload);
                toast.success('Materi berhasil ditambahkan');
            }
            onSave();
        } catch (err) {
            toast.error('Gagal menyimpan materi');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-8 border-l-primary w-full max-w-2xl flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 px-6 pt-6">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {material ? 'Edit Detail Materi' : 'Tambah Materi Baru'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                <div className="space-y-5 px-6 pb-2">
                    {/* Material Type Selection */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Tipe Materi</label>
                        <select 
                            value={materialType}
                            onChange={(e) => setMaterialType(e.target.value)}
                            disabled={!!material}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100 font-medium"
                        >
                            <option value="text">Materi Teks</option>
                            <option value="video">Materi Video</option>
                            <option value="pdf">Dokumen PDF</option>
                            <option value="quiz">Kuis Interaktif</option>
                            <option value="assignment">Tugas Mandiri</option>
                            <option value="flashcard">Kartu Pengingat</option>
                        </select>
                    </div>

                    {/* Common Title Input */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Judul Materi / Kuis</label>
                        <input 
                            type="text" 
                            placeholder="Contoh: Pengenalan Alat Laboratorium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Conditional fields based on type */}
                    {materialType === 'text' && (
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Isi Materi Teks</label>
                            <textarea 
                                placeholder="Tuliskan materi pembelajaran secara lengkap di sini..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="6"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                            />
                        </div>
                    )}

                    {(materialType === 'video' || materialType === 'pdf') && (
                        <>
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">URL Tautan (Link)</label>
                                <input 
                                    type="text" 
                                    placeholder={materialType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/modul.pdf'}
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Keterangan / Deskripsi</label>
                                <textarea 
                                    placeholder="Deskripsi singkat mengenai video/dokumen pembelajaran ini..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                                />
                            </div>
                        </>
                    )}

                    {materialType === 'assignment' && (
                        <div>
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide font-display block mb-1.5">Petunjuk Tugas Mandiri</label>
                            <textarea 
                                placeholder="Masukkan instruksi pengerjaan tugas secara rinci untuk mahasiswa..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="5"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary mt-1 text-slate-800 dark:text-slate-100"
                            />
                        </div>
                    )}

                    {/* FLASHCARD SECTION */}
                    {materialType === 'flashcard' && (
                        <div className="space-y-4">
                            {/* AI Flashcard Generator Section */}
                            <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/30 dark:bg-emerald-950/5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="material-icons-round text-sm">auto_awesome</span>
                                        Manajemen Kartu Pengingat
                                    </h4>
                                    <button 
                                        type="button"
                                        onClick={handleGenerateAIFlashcards}
                                        disabled={generatingAI}
                                        className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl hover:bg-emerald-700 press-effect flex items-center gap-1"
                                    >
                                        <span className="material-icons-round text-xs">auto_awesome</span>
                                        {generatingAI ? 'Mengekstrak...' : 'Hasilkan via AI (Gemini)'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Tipe Flashcard</label>
                                        <select 
                                            value={aiConfig.type}
                                            onChange={(e) => setAiConfig({ ...aiConfig, type: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs mt-1 text-slate-800 dark:text-slate-100 focus:outline-none"
                                        >
                                            <option value="Materi Umum (Tanya-Jawab)">Materi Umum (Tanya-Jawab)</option>
                                            <option value="Istilah & Pengertian">Istilah & Pengertian</option>
                                            <option value="Langkah Prosedur">Langkah Prosedur</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 uppercase">Jumlah Kartu</label>
                                        <select 
                                            value={aiConfig.count}
                                            onChange={(e) => setAiConfig({ ...aiConfig, count: parseInt(e.target.value) })}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs mt-1 text-slate-800 dark:text-slate-100 focus:outline-none"
                                        >
                                            <option value="5">5 Kartu</option>
                                            <option value="10">10 Kartu</option>
                                            <option value="15">15 Kartu</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Masukkan topik atau konsep belajar</label>
                                    <input 
                                        type="text"
                                        placeholder="Contoh: Tag dasar HTML (h1, p, img, a)..."
                                        value={aiConfig.concept}
                                        onChange={(e) => setAiConfig({ ...aiConfig, concept: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs mt-1 text-slate-800 dark:text-slate-100 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase">Petunjuk Tambahan / Custom Prompt (opsional)</label>
                                    <textarea 
                                        placeholder="Contoh: Gunakan bahasa santai, buat dalam bahasa Inggris, atau fokus pada sintaks."
                                        value={aiConfig.customPrompt}
                                        onChange={(e) => setAiConfig({ ...aiConfig, customPrompt: e.target.value })}
                                        rows="2"
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs mt-1 text-slate-800 dark:text-slate-100 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Flashcards List */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Kartu Flashcard ({flashcards.length})</h4>
                                    <button 
                                        type="button"
                                        onClick={handleAddFlashcardManual}
                                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-icons-round text-sm">add</span>
                                        Tambah Kartu Manual
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-60 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    {flashcards.map((card, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start gap-3">
                                            <div className="flex-1 space-y-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Bagian Depan (Pertanyaan / Istilah)"
                                                    value={card.front}
                                                    onChange={(e) => handleUpdateFlashcard(idx, 'front', e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                                                />
                                                <input 
                                                    type="text"
                                                    placeholder="Bagian Belakang (Jawaban / Pengertian)"
                                                    value={card.back}
                                                    onChange={(e) => handleUpdateFlashcard(idx, 'back', e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteFlashcard(idx)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg"
                                            >
                                                <span className="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                    {flashcards.length === 0 && (
                                        <p className="text-center text-xs text-slate-400 py-6">Belum ada kartu. Gunakan AI Generator atau tambahkan secara manual.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUIZ SECTION */}
                    {materialType === 'quiz' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Pertanyaan Kuis ({quizQuestions.length})</h4>
                                <button 
                                    type="button"
                                    onClick={handleAddQuizQuestion}
                                    className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                                >
                                    <span className="material-icons-round text-sm">add</span>
                                    Tambah Soal Manual
                                </button>
                            </div>

                            <div className="space-y-4 max-h-60 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                                {quizQuestions.map((q, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3 relative">
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteQuizQuestion(idx)}
                                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-lg"
                                        >
                                            <span className="material-icons-round text-sm">delete</span>
                                        </button>

                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Pertanyaan {idx + 1}</label>
                                            <input 
                                                type="text"
                                                placeholder="Contoh: Apa reagen untuk uji hematologi?"
                                                value={q.question}
                                                onChange={(e) => handleUpdateQuizQuestion(idx, 'question', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs mt-1 focus:outline-none text-slate-800 dark:text-slate-100"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                                                <div key={opt}>
                                                    <label className="text-[8px] font-bold text-slate-400 uppercase">Pilihan {opt}</label>
                                                    <input 
                                                        type="text"
                                                        value={q.options[optIdx]}
                                                        onChange={(e) => handleUpdateQuizQuestion(idx, 'option', e.target.value, optIdx)}
                                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-[11px] mt-0.5 focus:outline-none text-slate-800 dark:text-slate-100"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-bold text-slate-400 uppercase">Jawaban Benar</label>
                                            <select 
                                                value={q.answer}
                                                onChange={(e) => handleUpdateQuizQuestion(idx, 'answer', e.target.value)}
                                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg text-xs mt-1 focus:outline-none text-slate-800 dark:text-slate-100 font-bold"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {quizQuestions.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 py-6">Belum ada soal kuis. Silakan tambahkan secara manual.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Jadikan Prerequisite Lock */}
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                        <input 
                            type="checkbox" 
                            id="prerequisite-chk"
                            checked={isPrerequisite}
                            onChange={(e) => setIsPrerequisite(e.target.checked)}
                            className="mt-1 rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                        />
                        <div>
                            <label htmlFor="prerequisite-chk" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Jadikan Prerequisite (Kunci materi selanjutnya)</label>
                            <p className="text-xs text-slate-400 mt-1">Siswa harus menyelesaikan/membuka materi ini sebelum bisa membuka modul materi berikutnya.</p>
                        </div>
                    </div>
                </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-8 px-6 pb-6">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-sm font-bold press-effect hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-xl text-sm font-bold press-effect shadow-md shadow-emerald-600/20"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default MaterialModal;
