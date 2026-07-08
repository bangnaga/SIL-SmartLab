import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import * as tmImage from '@teachablemachine/image';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const BacteriaDetectionPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [model, setModel] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [allPredictions, setAllPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetecting, setIsDetecting] = useState(false);
    const [mode, setMode] = useState('camera'); // 'camera' or 'upload'
    const [capturedImage, setCapturedImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Placeholder Teachable Machine Model URL
    // Suggestion: "https://teachablemachine.withgoogle.com/models/I7N_XUv97/" (Example model for bacteria)
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/I7N_XUv97/";

    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            setIsLoading(true);
            // Mocking model load since teachablemachine was removed
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockModel = {
                predict: async () => {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return [
                        { className: 'E. Coli', probability: 0.85 },
                        { className: 'Staphylococcus', probability: 0.12 },
                        { className: 'Unknown', probability: 0.03 }
                    ];
                }
            };
            setModel(mockModel);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to load model:", err);
            toast.error("Gagal memuat model AI. Pastikan URL model valid.");
            setIsLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error("Gagal mengakses kamera.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const handlePredict = async () => {
        if (!model) return;

        let target;
        if (mode === 'camera') {
            target = videoRef.current;
        } else {
            target = document.getElementById('uploaded-image');
        }

        if (!target) return;

        setIsDetecting(true);
        try {
            const predictions = await model.predict(target);
            // Sort by probability
            predictions.sort((a, b) => b.probability - a.probability);
            setPrediction(predictions[0]);
            setAllPredictions(predictions);

            // Log to database
            await api.logMLPrediction({
                user_id: user?.id,
                result_label: predictions[0].className,
                confidence: predictions[0].probability,
                image_url: mode === 'upload' ? capturedImage : null
            });

            toast.success("Deteksi berhasil!");
        } catch (err) {
            toast.error("Terjadi kesalahan saat deteksi.");
        }
        setIsDetecting(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCapturedImage(event.target.result);
                setPrediction(null);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm rounded-b-2xl">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-icons-round text-slate-600">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-primary-600 bg-clip-text text-transparent">
                    AI Bacteria Detection
                </h1>
            </header>

            <main className="p-6 max-w-lg mx-auto overflow-hidden">
                {/* Mode Selector */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm mb-6 border border-slate-200">
                    <button
                        onClick={() => { setMode('camera'); startCamera(); }}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === 'camera' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="material-icons-round text-lg">videocam</span>
                        Live Camera
                    </button>
                    <button
                        onClick={() => { setMode('upload'); stopCamera(); }}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="material-icons-round text-lg">upload</span>
                        Upload Gambar
                    </button>
                </div>

                {/* Viewport Card */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-[3/4] relative border-4 border-white">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-slate-800">
                            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="animate-pulse">Memuat Model AI...</p>
                        </div>
                    ) : mode === 'camera' ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onLoadedMetadata={startCamera}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            {capturedImage ? (
                                <img id="uploaded-image" src={capturedImage} alt="Upload" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="text-center p-8">
                                    <span className="material-icons-round text-6xl text-white/20 mb-4">image_search</span>
                                    <p className="text-white/40">Silakan upload gambar sampel mikroskop</p>
                                    <label className="mt-6 inline-block bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold cursor-pointer hover:bg-teal-600 transition-colors">
                                        Pilih File
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating HUD */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-primary-400'} animate-pulse`}></div>
                        <span className="text-[10px] text-white/90 font-bold tracking-widest uppercase">
                            {isLoading ? 'System Warming' : 'System Ready'}
                        </span>
                    </div>

                    {/* Scan Animation Overlay */}
                    {isDetecting && (
                        <div className="absolute inset-x-0 h-1 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-[scan_2s_ease-in-out_infinite] z-20"></div>
                    )}
                </div>

                {/* Predict Button */}
                <div className="mt-8">
                    <button
                        disabled={isLoading || isDetecting || (mode === 'upload' && !capturedImage)}
                        onClick={handlePredict}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${isLoading || isDetecting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-primary-500 text-white hover:shadow-teal-500/25'
                            }`}
                    >
                        {isDetecting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Menganalisis...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round">biotech</span>
                                Mulai Deteksi
                            </>
                        )}
                    </button>
                </div>

                {/* Result Section */}
                {prediction && (
                    <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-[fadeIn_0.5s_ease-out]">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Hasil Klasifikasi</h3>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
                                <span className="material-icons-round text-3xl text-teal-600">bug_report</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-slate-800">{prediction.className}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="material-icons-round text-sm">
                                                {i < Math.round(prediction.probability * 5) ? 'star' : 'star_border'}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 ml-1">
                                        {(prediction.probability * 100).toFixed(1)}% Confidence
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Confidence Bars */}
                        <div className="space-y-3">
                            {allPredictions.slice(0, 3).map((p, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1 px-1">
                                        <span>{p.className}</span>
                                        <span>{(p.probability * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 transition-all duration-1000"
                                            style={{ width: `${p.probability * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                onClick={() => navigate('/lab/lkp', { state: { prediction: prediction.className } })}
                                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-icons-round text-lg">edit_note</span>
                                Simpan ke LKP
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default BacteriaDetectionPage;
