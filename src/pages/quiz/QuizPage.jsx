import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '../../components/layout/DesktopLayout';

const QuizPage = () => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('B');
    const [currentQuestion, setCurrentQuestion] = useState(5);

    const options = [
        { id: 'A', text: 'Alkohol 96%' },
        { id: 'B', text: 'Larutan Lugol (Iodium)' },
        { id: 'C', text: 'Safranin' },
        { id: 'D', text: 'Air Suling (Aquades)' },
        { id: 'E', text: 'Metilen Biru' },
    ];

    return (
        <DesktopLayout title="Menu">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/10 pt-8 rounded-b-2xl">
                <div className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center press-effect">
                            <span className="material-icons-round text-slate-600 dark:text-slate-400 text-lg">arrow_back</span>
                        </button>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Modul Mikrobiologi</span>
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white">Kuis: Pewarnaan Gram</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <span className="material-icons-round text-primary text-sm">timer</span>
                        <span className="text-sm font-mono font-bold text-primary">12:45</span>
                    </div>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentQuestion / 20) * 100}%` }}></div>
                </div>
            </header>

            {/* Question Number Nav */}
            <div className="flex gap-2 px-5 py-3 overflow-x-auto hide-scrollbar bg-white/40 dark:bg-primary/5 border-b border-slate-200 dark:border-primary/5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                        key={num}
                        onClick={() => setCurrentQuestion(num)}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${currentQuestion === num
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark scale-110'
                            : num < currentQuestion
                                ? 'bg-primary/20 text-primary'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                    >
                        {num}
                    </button>
                ))}
            </div>

            <main className="flex-1 px-5 py-6 overflow-y-auto hide-scrollbar pb-32">
                <div className="mb-6 animate-fade-in">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-bold mb-3 uppercase tracking-wide">
                        Pertanyaan {currentQuestion} dari 20
                    </div>
                    <h2 className="text-lg font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
                        Setelah pemberian kristal violet pada prosedur pewarnaan Gram, zat apa yang digunakan sebagai mordan untuk memperkuat ikatan warna dengan dinding sel bakteri?
                    </h2>
                </div>

                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-primary/20 shadow-sm">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQDwJGcoz6JBkO9E1_BUZe9ZUWuaqMeKqzr3LDkvoWMmAAZF7c_aCcZRDRy_CESxEaEOiXVcD5_1rOJRfNDuJfAEcP9Yqy52bgrixZyl9yIMJsuGRl_0qM0AHCBRnK6mQ4FL9rQrfW2AVkIdbnjmZdUVV4Kxkv4RAKUwkJJHysI1VIIpM_6Z-itExeviaVkjntyA-QVQSNlpqRr8akXkEJzgQlj7i6eRX3uV7iRK-lpTC6ksFG1MY7OLULb5p1jbJxSCsoWC82EWDw"
                        alt="Microscope slide"
                        className="w-full h-40 object-cover"
                    />
                </div>

                <div className="grid gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOption(option.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group press-effect ${selectedOption === option.id
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-primary/5'
                                }`}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${selectedOption === option.id
                                ? 'bg-gradient-to-br from-primary to-primary-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 group-hover:text-primary'
                                }`}>
                                {option.id}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <span className={`text-sm font-medium ${selectedOption === option.id ? 'text-primary font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {option.text}
                                </span>
                                {selectedOption === option.id && (
                                    <span className="material-icons-round text-primary text-xl">check_circle</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="material-icons-round text-sm">cloud_done</span>
                    <span className="text-[11px] font-medium italic">Jawaban Anda tersimpan otomatis di server Lab</span>
                </div>
            </main>

            {/* Quiz Navigation Footer */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-primary/10 flex gap-3 z-50 pb-8">
                <button
                    onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold press-effect"
                >
                    <span className="material-icons-round text-lg">chevron_left</span>
                    <span>Sebelumnya</span>
                </button>
                <button
                    onClick={() => setCurrentQuestion(Math.min(20, currentQuestion + 1))}
                    className="flex-[1.5] flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-600 text-white font-bold shadow-lg shadow-primary/20 press-effect"
                >
                    <span>Selanjutnya</span>
                    <span className="material-icons-round text-lg">chevron_right</span>
                </button>
            </footer>
        </DesktopLayout>
    );
};

export default QuizPage;
