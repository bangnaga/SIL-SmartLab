import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';

const StudentMaterialViewerInline = ({ material, classId, studentId, isCompleted, onCompleted }) => {
    const toast = useToast();
    const [submitting, setSubmitting] = useState(false);
    
    // Text / Video / PDF state
    const [markingComplete, setMarkingComplete] = useState(false);

    // Flashcard state
    const [activeCardIdx, setActiveCardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const flashcards = material?.content?.flashcards || [];

    // Quiz state
    const quizQuestions = material?.content?.questions || [];
    const [quizAnswers, setQuizAnswers] = useState({}); // { qIdx: 'A' }
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(null);

    // Assignment State
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFile, setSubmissionFile] = useState('');
    const [assignmentResult, setAssignmentResult] = useState(null); // Already submitted info

    useEffect(() => {
        if (!material) return;
        
        // Reset states
        setActiveCardIdx(0);
        setIsFlipped(false);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        setSubmissionText('');
        setSubmissionFile('');
        setAssignmentResult(null);

        // If it's an assignment, load previous submission if any
        if (material.type === 'assignment') {
            const loadSubmission = async () => {
                try {
                    const data = await api.getMaterialSubmission(material.id, studentId);
                    if (data) {
                        setAssignmentResult(data);
                        setSubmissionText(data.submission_text || '');
                        setSubmissionFile(data.file_url || '');
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            loadSubmission();
        }
    }, [material, studentId]);

    // Handle generic text/video/pdf completion
    const handleMarkComplete = async () => {
        setMarkingComplete(true);
        try {
            await api.submitMaterialAssignment(material.id, {
                student_id: studentId,
                class_id: classId,
                submission_text: 'completed',
                file_url: ''
            });
            toast.success('Materi selesai dipelajari!');
            onCompleted(material.id);
        } catch (err) {
            toast.error('Gagal menandai selesai');
        } finally {
            setMarkingComplete(false);
        }
    };

    // Handle Flashcard swipe / navigation
    const handleNextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (activeCardIdx < flashcards.length - 1) {
                setActiveCardIdx(activeCardIdx + 1);
            } else {
                // Last card viewed, auto-complete flashcard
                if (!isCompleted) {
                    handleMarkComplete();
                }
            }
        }, 150);
    };

    const handlePrevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (activeCardIdx > 0) {
                setActiveCardIdx(activeCardIdx - 1);
            }
        }, 150);
    };

    // Handle Quiz Submission
    const handleSubmitQuiz = async () => {
        if (Object.keys(quizAnswers).length < quizQuestions.length) {
            toast.error('Harap jawab semua pertanyaan!');
            return;
        }

        setSubmitting(true);
        try {
            let correctCount = 0;
            quizQuestions.forEach((q, idx) => {
                if (quizAnswers[idx] === q.correctAnswer) {
                    correctCount++;
                }
            });
            const score = Math.round((correctCount / quizQuestions.length) * 100);
            
            await api.submitQuiz({
                student_id: studentId,
                quiz_id: material.id,
                class_id: classId,
                score,
                details: { answers: quizAnswers }
            });

            setQuizScore(score);
            setQuizSubmitted(true);
            toast.success(`Kuis selesai! Skor Anda: ${score}`);
            onCompleted(material.id);
        } catch (err) {
            toast.error('Gagal mengirim jawaban kuis');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Assignment Submit
    const handleSubmitAssignment = async () => {
        if (!submissionText.trim()) {
            toast.error('Harap masukkan jawaban teks Anda!');
            return;
        }

        setSubmitting(true);
        try {
            await api.submitMaterialAssignment(material.id, {
                student_id: studentId,
                class_id: classId,
                submission_text: submissionText,
                file_url: submissionFile
            });
            toast.success('Tugas berhasil dikumpulkan!');
            setAssignmentResult({
                status: 'submitted',
                submission_text: submissionText,
                file_url: submissionFile
            });
            onCompleted(material.id);
        } catch (err) {
            toast.error('Gagal mengumpulkan tugas');
        } finally {
            setSubmitting(false);
        }
    };

    if (!material) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/50 dark:border-slate-800/80 animate-fade-in space-y-6">
            {/* Header */}
            <div>
                <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                    {material.type === 'assignment' ? 'Tugas Mandiri' : material.type === 'flashcard' ? 'Kartu Pengingat' : material.type === 'quiz' ? 'Kuis Interaktif' : material.type}
                </span>
                <h3 className="font-display font-bold text-lg md:text-xl text-slate-900 dark:text-white mt-2">
                    {material.title}
                </h3>
            </div>

            {/* Viewer Body */}
            <div className="space-y-6">
                
                {/* TYPE: TEXT */}
                {material.type === 'text' && (
                    <div className="space-y-5">
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-sm whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-100">
                            {material.description}
                        </div>
                        {!isCompleted ? (
                            <button 
                                onClick={handleMarkComplete}
                                disabled={markingComplete}
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl press-effect text-xs uppercase tracking-wider shadow-lg shadow-primary/25"
                            >
                                {markingComplete ? 'Memproses...' : 'Tandai Selesai Membaca'}
                            </button>
                        ) : (
                            <div className="p-4 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-100/50 flex items-center justify-center gap-2 text-xs font-bold">
                                <span className="material-icons-round text-lg">check_circle</span>
                                Materi Selesai Dibaca
                            </div>
                        )}
                    </div>
                )}

                {/* TYPE: VIDEO / PDF / LINK */}
                {(material.type === 'video' || material.type === 'pdf' || material.type === 'link') && (
                    <div className="space-y-5">
                        {material.description && (
                            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">{material.description}</p>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col items-center text-center">
                            <span className="material-icons-round text-5xl text-primary mb-3">
                                {material.type === 'video' ? 'play_circle' : material.type === 'pdf' ? 'picture_as_pdf' : 'link'}
                            </span>
                            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Tautan Dokumen / Media / Link</h4>
                            <a 
                                href={material.url} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={() => {
                                    if (!isCompleted) handleMarkComplete();
                                }}
                                className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl press-effect flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <span className="material-icons-round text-sm">open_in_new</span>
                                Buka Tautan {material.type === 'link' ? 'Link' : material.type.toUpperCase()}
                            </a>
                        </div>
                        {isCompleted && (
                            <div className="p-4 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-100/50 flex items-center justify-center gap-2 text-xs font-bold">
                                <span className="material-icons-round text-lg">check_circle</span>
                                Materi Selesai Dipelajari
                            </div>
                        )}
                    </div>
                )}

                {/* TYPE: FLASHCARD */}
                {material.type === 'flashcard' && (
                    <div className="space-y-6">
                        {flashcards.length > 0 ? (
                            <div className="space-y-4">
                                <div 
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="h-64 w-full bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-center justify-center p-6 text-center cursor-pointer relative select-none hover:bg-slate-100/30 transition-colors"
                                >
                                    <div className="absolute top-4 left-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {isFlipped ? 'Jawaban' : 'Pertanyaan'}
                                    </div>
                                    <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-400">
                                        {activeCardIdx + 1} / {flashcards.length}
                                    </div>

                                    <p className="font-display font-bold text-base md:text-lg text-slate-850 dark:text-slate-100 leading-relaxed max-w-md">
                                        {isFlipped ? flashcards[activeCardIdx].back : flashcards[activeCardIdx].front}
                                    </p>

                                    <div className="absolute bottom-4 text-[9px] font-bold text-primary/70 animate-pulse">
                                        Klik kartu untuk membalik
                                    </div>
                                </div>

                                <div className="flex justify-between items-center px-1">
                                    <button 
                                        onClick={handlePrevCard}
                                        disabled={activeCardIdx === 0}
                                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 disabled:pointer-events-none press-effect flex items-center gap-1"
                                    >
                                        <span className="material-icons-round text-sm">arrow_back</span>
                                        Sebelumnya
                                    </button>
                                    <button 
                                        onClick={handleNextCard}
                                        className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold press-effect flex items-center gap-1 shadow-lg shadow-primary/20"
                                    >
                                        {activeCardIdx === flashcards.length - 1 ? 'Selesai' : 'Berikutnya'}
                                        <span className="material-icons-round text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-xs text-slate-400 py-12">Tidak ada kartu pengingat.</p>
                        )}
                    </div>
                )}

                {/* TYPE: QUIZ */}
                {material.type === 'quiz' && (
                    <div className="space-y-6">
                        {quizQuestions.length > 0 ? (
                            <div className="space-y-6">
                                {quizQuestions.map((q, idx) => {
                                    const isCorrect = quizAnswers[idx] === q.correctAnswer;
                                    return (
                                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 space-y-4">
                                            <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 flex items-start gap-2.5">
                                                <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5">{idx + 1}</span>
                                                {q.question}
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                                                    const isSelected = quizAnswers[idx] === opt;
                                                    const isAnswerKey = q.correctAnswer === opt;
                                                    
                                                    let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900";
                                                    if (quizSubmitted) {
                                                        if (isAnswerKey) btnStyle = "bg-green-50 border-green-500 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400";
                                                        else if (isSelected && !isCorrect) btnStyle = "bg-red-50 border-red-500 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400";
                                                        else btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                                                    } else if (isSelected) {
                                                        btnStyle = "border-primary bg-primary/5 text-primary";
                                                    }

                                                    return (
                                                        <button 
                                                            key={opt}
                                                            type="button"
                                                            disabled={quizSubmitted}
                                                            onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: opt })}
                                                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${btnStyle}`}
                                                        >
                                                            <span className="font-black text-slate-400">{opt}.</span>
                                                            {q.options[optIdx]}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {!quizSubmitted && !isCompleted ? (
                                    <button 
                                        onClick={handleSubmitQuiz}
                                        disabled={submitting}
                                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl press-effect text-xs uppercase tracking-wider shadow-lg shadow-primary/25"
                                    >
                                        {submitting ? 'Mengirim...' : 'Kirim Jawaban Kuis'}
                                    </button>
                                ) : (
                                    <div className="p-5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-2xl text-center space-y-2">
                                        <span className="material-icons-round text-3xl text-green-500">task_alt</span>
                                        <h4 className="font-black text-green-700 dark:text-green-400 uppercase tracking-widest text-[10px]">Kuis Selesai Dikerjakan</h4>
                                        {quizScore !== null && (
                                            <p className="text-3xl font-black text-green-800 dark:text-green-300">Skor: {quizScore}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-xs text-slate-400 py-12">Tidak ada soal kuis.</p>
                        )}
                    </div>
                )}

                {/* TYPE: ASSIGNMENT */}
                {material.type === 'assignment' && (
                    <div className="space-y-5">
                        <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 space-y-2 text-xs">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Instruksi Tugas:</h4>
                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{material.description}</p>
                        </div>

                        {(!assignmentResult || assignmentResult.status !== 'graded') ? (
                            <div className="space-y-4 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-slate-900">
                                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350 mb-1">Form Pengumpulan Tugas</h4>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Jawaban Teks</label>
                                    <textarea 
                                        placeholder="Tuliskan jawaban atau laporan praktikum Anda di sini..."
                                        value={submissionText}
                                        onChange={(e) => setSubmissionText(e.target.value)}
                                        rows="5"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Link File Lampiran (Opsional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Link GDrive atau OneDrive tempat upload file pendukung..."
                                        value={submissionFile}
                                        onChange={(e) => setSubmissionFile(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                                <button 
                                    onClick={handleSubmitAssignment}
                                    disabled={submitting}
                                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl press-effect text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                                >
                                    {submitting ? 'Mengirim...' : 'Kumpulkan Tugas'}
                                </button>
                            </div>
                        ) : null}

                        {assignmentResult && (
                            <div className="space-y-4 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">Status Tugas:</h4>
                                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${assignmentResult.status === 'graded' ? 'bg-green-50 text-green-600 dark:bg-green-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
                                        {assignmentResult.status === 'graded' ? 'Sudah Dinilai' : 'Menunggu Penilaian'}
                                    </span>
                                </div>

                                {assignmentResult.status === 'graded' && (
                                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-xl space-y-1.5">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-black text-green-700 dark:text-green-400 tracking-wider">NILAI TUGAS:</span>
                                            <span className="text-lg font-black text-green-800 dark:text-green-300">{assignmentResult.grade}</span>
                                        </div>
                                        {assignmentResult.feedback && (
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">Catatan Dosen: "{assignmentResult.feedback}"</p>
                                        )}
                                    </div>
                                )}

                                {assignmentResult.submission_text && (
                                    <div className="text-xs text-slate-500 border-t border-slate-200/60 dark:border-slate-800/80 pt-3 mt-3">
                                        <span className="font-bold block mb-1">Jawaban Terkirim:</span>
                                        <p className="whitespace-pre-wrap leading-relaxed">{assignmentResult.submission_text}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentMaterialViewerInline;
