import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Microscope, BrainCircuit, Activity, Database, CheckCircle2, ChevronRight, Play, Users, Facebook, Instagram, Twitter, Linkedin, Mail, Moon, Sun } from 'lucide-react';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeService, setActiveService] = useState(0);
    const [activeFeatureTab, setActiveFeatureTab] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    const featureTabs = [
        {
            title: 'Manajemen Inventaris',
            action: 'Lab',
            description: 'Kelola peminjaman, pengembalian, dan ketersediaan alat laboratorium secara real-time.',
            image: '/assets/inventory_management.png'
        },
        {
            title: 'LMS berbasis LLM',
            action: 'AI',
            description: 'Sistem pembelajaran pintar dengan asisten AI (LLM) untuk membantu pemahaman materi praktikum mahasiswa.',
            image: '/assets/ai_lms.png' 
        },
        {
            title: 'Validasi LKP',
            action: 'Digital',
            description: 'Dosen dapat melakukan validasi dan pemberian nilai Lembar Kerja Praktikum secara langsung dalam sistem.',
            image: '/assets/document_validation.png'
        },
        {
            title: 'Penjadwalan',
            action: 'Otomatis',
            description: 'Atur jadwal penggunaan ruang laboratorium agar tidak berbenturan antar mata kuliah atau kelas.',
            image: '/assets/calendar_schedule.png'
        },
        {
            title: 'Evaluasi & Kuis',
            action: 'Interaktif',
            description: 'Uji pemahaman mahasiswa dengan kuis interaktif.',
            image: '/assets/quiz_evaluation.png'
        }
    ];

    useEffect(() => {
        // Default to light theme
        if (localStorage.getItem('theme') === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="bg-white dark:bg-n8n-base min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-primary-600/20 overflow-hidden">
            {/* Topbar */}
            <div className="hidden lg:flex items-center justify-between px-10 py-2 bg-slate-900 dark:bg-n8n-base text-slate-300 text-xs font-semibold">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div> +62 (811) 544-7818</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div> info@sil.ac.id</span>
                </div>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-white transition-colors">Help</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
            </div>

            {/* Navbar */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-n8n-base/95 backdrop-blur-md shadow-sm dark:shadow-none py-4' : 'bg-transparent py-5'} top-0 lg:top-[32px]`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg dark:shadow-none shadow-primary-500/20 text-white transform rotate-[5deg] hover:rotate-0 transition-transform">
                            <Microscope className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>SmartLab<span className="text-primary-500">.</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-7 text-[16px] font-[600] text-slate-800 dark:text-slate-200" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        <a href="#" className="text-primary-600">Beranda</a>
                        <a href="#features" className="hover:text-primary-600 transition-colors">Fitur Utama</a>
                        <a href="#about" className="hover:text-primary-600 transition-colors">Tentang Kami</a>
                        <a href="#contact" className="hover:text-primary-600 transition-colors">Kontak</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2 md:p-3 rounded-full bg-slate-100 dark:bg-n8n-surface text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-n8n-lighter transition-colors">
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link to="/login" className="hidden lg:flex px-7 py-3 text-[15px] font-[600] text-white bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-400 rounded-full transition-all shadow-md dark:shadow-none items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Masuk Sistem <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-40 pb-20 lg:pt-48 lg:pb-20 px-6 overflow-hidden bg-white dark:bg-n8n-base border-b border-slate-100 dark:border-n8n-surface">
                {/* Background Graphics (Image + Video) */}
                <div className="absolute bottom-0 right-0 top-0 z-0 w-full flex-col items-end justify-center hidden lg:flex">
                    <img
                        src="/assets/hero_background.png"
                        alt="Smart Laboratory Hero Background"
                        className="pointer-events-none absolute top-1/2 right-[-5%] -translate-y-1/2 z-10 w-[700px] h-[700px] object-cover select-none opacity-80 mix-blend-multiply dark:mix-blend-screen dark:opacity-60 rounded-full blur-[10px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col items-center xl:items-start text-center xl:text-left">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full xl:max-w-[650px] flex flex-col gap-8">

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-[64px] font-[800] text-slate-900 dark:text-white leading-[1.05] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Smart Laboratorium <br className="hidden md:block" />
                            <span className="text-primary-500 dark:text-primary-400 relative inline-block">
                                Poltekkes Muhammadiyah Makassar
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto xl:mx-0">
                            Sistem Manajemen Informasi Laboratorium modern yang terintegrasi penuh. Mulai dari manajemen inventaris, sistem peminjaman alat, hingga fitur LMS berbasis LLM untuk menunjang kegiatan pembelajaran secara interaktif dan efisien.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto mx-auto xl:mx-0">
                            <a href="#" className="w-full sm:w-auto px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#FF4B4B] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group">
                                Get started for free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a href="#" className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-n8n-surface text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-colors flex items-center justify-center">
                                Talk to sales
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Section Bottom Logos */}
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mt-24 xl:mt-32 flex flex-col lg:flex-row items-center justify-between gap-12 w-full lg:w-[85%] border-t border-slate-200 dark:border-n8n-surface pt-10">
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium w-full lg:w-3/12 max-lg:text-center">
                            Didukung oleh teknologi canggih untuk mempermudah kegiatan praktikum dan administrasi
                        </div>

                        <div className="w-full lg:w-9/12 overflow-hidden h-12 relative flex items-center">
                            {/* Simple CSS animation ticker for logos to match n8n style slightly jumping/blinking or just static flex to be simple and robust */}
                            <div className="flex w-full items-center justify-center lg:justify-between gap-6 lg:gap-8">
                                <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/meta_66ca35072c.svg" alt="Meta" className="h-8 md:h-10 object-contain opacity-50 dark:opacity-60 dark:invert-0 invert grayscale hover:grayscale-0 transition-all" />
                                <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-stage/assets/re_mistral_ai_e2a2bff83f.svg" alt="Mistral AI" className="h-8 md:h-10 object-contain opacity-50 dark:opacity-60 dark:invert-0 invert grayscale hover:grayscale-0 transition-all" />
                                <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-stage/assets/microsoft_logo_white_673a9e3e32.svg" alt="Microsoft" className="h-8 md:h-10 object-contain opacity-50 dark:opacity-60 dark:invert-0 invert grayscale hover:grayscale-0 transition-all hidden sm:block" />
                                <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-stage/assets/wayfair_logo_white_fe595e6b33.svg" alt="Wayfair" className="h-8 md:h-10 object-contain opacity-50 dark:opacity-60 dark:invert-0 invert grayscale hover:grayscale-0 transition-all hidden md:block" />
                                <img src="https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-stage/assets/zendesk_logo_white_33a443408b.svg" alt="Zendesk" className="h-8 md:h-10 object-contain opacity-50 dark:opacity-60 dark:invert-0 invert grayscale hover:grayscale-0 transition-all hidden lg:block" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Tabs Section */}
            <section className="w-full px-6 py-20 lg:py-32 relative bg-white dark:bg-n8n-base border-b border-slate-100 dark:border-n8n-surface">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Tabs List */}
                        <div className="w-full lg:w-3/12 relative border-l border-slate-200 dark:border-white/20 pl-2 lg:pl-0">
                            {/* Animated Indicator */}
                            <div
                                className="absolute left-0 w-1 bg-[#FF6B6B] rounded-sm transition-all duration-300 shadow-[0_0_10px_rgba(255,107,107,0.5)] hidden lg:block"
                                style={{
                                    height: '100px',
                                    transform: `translate(-50%, ${activeFeatureTab * 110}px)`
                                }}
                            />

                            <div className="flex flex-col gap-2">
                                {featureTabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveFeatureTab(idx)}
                                        className={`relative z-10 flex w-full flex-col items-start justify-start rounded-md py-4 pl-6 pr-4 text-left transition-colors ${activeFeatureTab === idx
                                                ? 'bg-slate-50 dark:bg-n8n-surface'
                                                : 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-n8n-surface/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                            }`}
                                    >
                                        {/* Mobile Indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[#FF6B6B] rounded-sm lg:hidden transition-opacity ${activeFeatureTab === idx ? 'opacity-100' : 'opacity-0'}`} />

                                        <div className={`mb-1 text-lg ${activeFeatureTab === idx ? 'text-slate-900 dark:text-white' : ''}`}>
                                            <p><strong>{tab.title}</strong> {tab.action}</p>
                                        </div>
                                        <p className={`text-sm xl:text-md ${activeFeatureTab === idx ? 'text-slate-600 dark:text-slate-300' : ''}`}>
                                            {tab.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-2xl lg:w-9/12 bg-slate-50 dark:bg-n8n-surface border border-slate-200 dark:border-n8n-lighter flex items-center justify-center">
                            <motion.div
                                key={activeFeatureTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative flex size-full flex-col items-center justify-center"
                            >
                                <img
                                    src={featureTabs[activeFeatureTab].image}
                                    alt={featureTabs[activeFeatureTab].title}
                                    className="relative z-20 h-full w-full object-cover rounded-2xl"
                                />
                                {/* Glow effect behind image */}
                                <div className="absolute left-[50%] top-1/2 z-0 w-[50%] h-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-20 blur-[80px]"></div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section (Inserted) */}
            <section className="py-24 bg-white dark:bg-n8n-base relative overflow-hidden" id="about">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Left Column (Images) */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="w-full lg:w-1/2 relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl dark:shadow-none">
                                <img src="/assets/about_lab_1.png" alt="About Smart Lab" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" />
                            </div>

                            {/* Floating Experience Box */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="absolute -bottom-10 -right-4 md:-right-10 bg-white dark:bg-n8n-base p-8 rounded-2xl shadow-2xl dark:shadow-none border-b-4 border-primary-600 max-w-[280px]"
                            >
                                <span className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2 block">Pengalaman</span>
                                <div className="text-5xl font-black text-slate-900 dark:text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>5+</div>
                                <h6 className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed">
                                    Tahun Melayani Praktikum Terintegrasi
                                </h6>
                            </motion.div>
                        </motion.div>

                        {/* Right Column (Content) */}
                        <div className="w-full lg:w-1/2 pt-10 lg:pt-0">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex flex-col gap-6">
                                <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 text-primary-600 font-bold font-sm tracking-widest uppercase">
                                    <span className="w-3 h-3 rounded-full bg-primary-100 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div></span> Tentang Kami
                                </motion.span>

                                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-[54px] font-[800] text-slate-900 dark:text-white leading-[1.1]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                    Mengubah <br className="hidden md:block" /> Cara Belajar <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Lebih Cerdas & Praktis</span><br className="hidden md:block" /> di Laboratorium.
                                </motion.h2>

                                <motion.div variants={fadeInUp} className="mt-4">
                                    <Link to="/about" className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-n8n-surface hover:bg-primary-600 text-slate-900 dark:text-white hover:text-white font-bold rounded-full transition-all duration-300">
                                        Pelajari Lebih Lanjut <div className="w-8 h-8 rounded-full bg-white dark:bg-n8n-base text-slate-900 dark:text-white flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowRight className="w-4 h-4" /></div>
                                    </Link>
                                </motion.div>

                                <motion.div variants={fadeInUp} className="mt-8 flex flex-col md:flex-row items-center gap-8 bg-slate-50 dark:bg-n8n-surface p-8 rounded-[32px] border border-slate-100 dark:border-n8n-surface relative">
                                    {/* Quote Box */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1 text-amber-500 mb-4">
                                            {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium italic mb-6 leading-relaxed">
                                            "Sistem ini sangat membantu mahasiswa dan dosen berkolaborasi dengan efisien. Pencatatan alat jadi akurat dan proses penilaian menjadi sangat transparan."
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h6 className="font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Dr. Budi Santoso</h6>
                                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Kepala Laboratorium</span>
                                            </div>
                                            {/* decorative quote icon */}
                                            <div className="text-4xl text-slate-200 font-serif leading-none">"</div>
                                        </div>
                                    </div>

                                    {/* Video Wrapper */}
                                    <div className="w-full md:w-auto flex-shrink-0 relative overflow-hidden rounded-2xl shadow-lg dark:shadow-none group">
                                        <img src="/assets/about_lab_2.png" alt="Video cover" className="w-[180px] h-full object-cover transform group-hover:scale-105 transition-transform" />
                                        <a href="https://www.youtube.com/watch?v=MLpWrANjFbI" target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-slate-900/20 dark:bg-white/10 group-hover:bg-slate-900/40 dark:group-hover:bg-white/20 transition-colors">
                                            <div className="w-12 h-12 bg-white dark:bg-n8n-base rounded-full flex items-center justify-center text-primary-600 shadow-xl group-hover:scale-110 transition-transform">
                                                <Play className="w-5 h-5 ml-1" fill="currentColor" />
                                            </div>
                                        </a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Client / Brands Section */}
            <section className="py-20 border-b border-slate-100 dark:border-n8n-surface bg-white dark:bg-n8n-base relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <div className="text-center">
                        <motion.h5
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-[38px] font-[800] text-slate-800 dark:text-slate-200 leading-tight"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            Digunakan oleh lebih dari <span className="text-primary-600">500+</span> Mahasiswa di <span className="text-slate-900 dark:text-white border-b-4 border-primary-600">Poltekkes</span>
                        </motion.h5>
                    </div>
                </div>

                {/* Marquee Slider */}
                <div className="relative w-full overflow-hidden whitespace-nowrap mask-image-fade">
                    <div className="inline-flex w-max animate-marquee items-center gap-16 md:gap-24 px-8 md:px-12">
                        {/* First set of logos */}
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <img
                                key={`brand-1-${i}`}
                                src={`/images/bexon/brands/brand-${i}.webp`}
                                alt={`Brand partner ${i}`}
                                className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        ))}
                        {/* Cloned set for loop */}
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <img
                                key={`brand-2-${i}`}
                                src={`/images/bexon/brands/brand-${i}.webp`}
                                alt={`Brand partner ${i} clone`}
                                className="h-10 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        ))}
                    </div>
                </div>
            </section>


            {/* Team Section */}
            <section className="py-24 bg-white dark:bg-n8n-base relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <motion.span
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="inline-flex items-center justify-center gap-2 text-primary-600 font-bold font-sm tracking-widest uppercase mb-4"
                        >
                            <span className="w-3 h-3 rounded-full bg-primary-100 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div></span> Tim Laboran
                        </motion.span>
                        <motion.h2
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="text-4xl md:text-5xl lg:text-[54px] font-[800] text-slate-900 dark:text-white leading-[1.1]"
                            style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                            Laboran Ahli yang Siap <br className="hidden md:block" /> Mendampingi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Praktikum Anda.</span>
                        </motion.h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Member 1 */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group cursor-pointer">
                            <div className="relative rounded-3xl overflow-hidden mb-6 aspect-[4/5] shadow-lg dark:shadow-none">
                                <img src="/assets/team_1.png" alt="Eka Marleni" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />

                                {/* Social Overlay */}
                                <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>
                            <div className="text-center relative">
                                <h4 className="text-2xl font-[800] text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>Eka Marleni</h4>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide">Laboran Senior</span>
                                <a href="mailto:info@bexon.com" className="absolute -top-12 right-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 shadow-xl">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Member 2 */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.1 }} className="group cursor-pointer">
                            <div className="relative rounded-3xl overflow-hidden mb-6 aspect-[4/5] shadow-lg dark:shadow-none">
                                <img src="/assets/team_2.png" alt="Siti Nurhaliza" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>
                            <div className="text-center relative">
                                <h4 className="text-2xl font-[800] text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>Siti Nurhaliza</h4>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide">Admin Peminjaman</span>
                                <a href="mailto:info@bexon.com" className="absolute -top-12 right-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 shadow-xl">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Member 3 */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }} className="group cursor-pointer">
                            <div className="relative rounded-3xl overflow-hidden mb-6 aspect-[4/5] shadow-lg dark:shadow-none">
                                <img src="/assets/team_3.png" alt="Kurniawati" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>
                            <div className="text-center relative">
                                <h4 className="text-2xl font-[800] text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>Kurniawati</h4>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide">Pengawas Lab</span>
                                <a href="mailto:info@bexon.com" className="absolute -top-12 right-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 shadow-xl">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>

                        {/* Member 4 */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.3 }} className="group cursor-pointer">
                            <div className="relative rounded-3xl overflow-hidden mb-6 aspect-[4/5] shadow-lg dark:shadow-none">
                                <img src="/assets/team_4.png" alt="Dian Rahma" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Facebook className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Twitter className="w-4 h-4" /></a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-n8n-base text-primary-600 flex items-center justify-center hover:scale-110 transition-transform"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>
                            <div className="text-center relative">
                                <h4 className="text-2xl font-[800] text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>Dian Rahma</h4>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide">Teknisi Peralatan</span>
                                <a href="mailto:info@bexon.com" className="absolute -top-12 right-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 shadow-xl">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-16 text-center md:hidden">
                        <Link to="/team" className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold rounded-full transition-all">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section (Breaking Boundaries) */}
            <div className="py-24 bg-slate-900 text-white relative overflow-hidden" style={{ backgroundImage: "url('/images/bexon/cta-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-slate-900/80" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-primary-600 rounded-l-full opacity-30 blur-[100px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                        <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-black mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            Siap Memulai,<br />Praktikum <span className="text-primary-400">Sekarang?</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
                            Bergabunglah dan nikmati kemudahan akses fitur manajemen peminjaman alat, penilaian digital, dan modul AI interaktif.
                        </motion.p>
                        <motion.div variants={fadeInUp}>
                            <Link to="/login" className="inline-flex px-10 py-5 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-transform hover:-translate-y-1 text-lg shadow-xl shadow-primary-600/30">
                                Mulai Sekarang
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-n8n-base dark:bg-n8n-base border-t border-slate-200 dark:border-n8n-lighter">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-4 gap-12 border-b border-slate-200 dark:border-n8n-lighter pb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                                    <Microscope className="w-6 h-6" />
                                </div>
                                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>SmartLab<span className="text-primary-600">.</span></span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">
                                Sistem Informasi Laboratorium cerdas yang terintegrasi untuk mendukung kegiatan praktikum, peminjaman alat, dan pembelajaran berbasis AI di Politeknik Muhammadiyah Makassar.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-n8n-surface flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-600 hover:text-white transition-all"><span className="font-bold">fb</span></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-n8n-surface flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-600 hover:text-white transition-all"><span className="font-bold">ig</span></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-n8n-surface flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-600 hover:text-white transition-all"><span className="font-bold">yt</span></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Navigasi</h4>
                            <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-medium">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Beranda</a></li>
                                <li><a href="#features" className="hover:text-primary-600 transition-colors">Fitur Utama</a></li>
                                <li><a href="#about" className="hover:text-primary-600 transition-colors">Tentang Kami</a></li>
                                <li><a href="#contact" className="hover:text-primary-600 transition-colors">Kontak</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Informasi Akademik</h4>
                            <ul className="space-y-4 text-slate-600 dark:text-slate-400 font-medium">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Panduan Penggunaan</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Jadwal Praktikum</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Aturan Laboratorium</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Bantuan (FAQ)</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-400 font-medium">
                        <p>© 2026 Smart Laboratorium Poltekkes Muhammadiyah Makassar. Hak cipta dilindungi.</p>
                        <p>Dibuat dengan ❤️ untuk Pendidikan.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const ServiceCard = ({ icon, title, desc, features, active }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`group p-10 rounded-[24px] transition-all duration-300 relative overflow-hidden ${active ? 'bg-white dark:bg-n8n-base shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-n8n-surface' : 'bg-white dark:bg-n8n-base hover:shadow-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-n8n-surface'
                }`}
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors ${active ? 'bg-primary-600 text-white shadow-lg dark:shadow-none shadow-primary-600/30' : 'bg-blue-50 dark:bg-blue-900/30 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'
                }`}>
                {icon}
            </div>

            <h3 className="text-2xl font-[800] text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                {desc}
            </p>

            <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-n8n-surface text-slate-500 dark:text-slate-400'}`}>
                            <CheckCircle2 className="w-3 h-3" />
                        </div>
                        {feature}
                    </li>
                ))}
            </ul>

            <Link to="/services" className={`inline-flex items-center gap-2 font-bold transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-600'
                }`}>
                Read More <ChevronRight className="w-4 h-4" />
            </Link>

            {active && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 blur-3xl rounded-full" />
            )}
        </motion.div>
    );
};

export default LandingPage;
