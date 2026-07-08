import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { LogOut, Bell, Search, Menu, X } from 'lucide-react';
import ThemeCustomizer from '../common/ThemeCustomizer';

const navItems = {
    admin: [
        { icon: 'dashboard', label: 'Dashboard', path: '/dashboard/admin' },
        { icon: 'calendar_today', label: 'Jadwal Praktikum', path: '/calendar' },
        { icon: 'science', label: 'Master Laboratorium', path: '/admin/laboratories' },
        { icon: 'videocam', label: 'Viewer IP Camera', path: '/admin/ip-camera' },
        { icon: 'school', label: 'Master Praktikum', path: '/admin/courses' },
        { icon: 'menu_book', label: 'Materi / LMS', path: '/materials' },
        { icon: 'class', label: 'Master Kelas', path: '/admin/classes' },
        { icon: 'category', label: 'Master Kategori', path: '/admin/categories' },
        { icon: 'perm_media', label: 'Media Manager', path: '/admin/media' },
        { icon: 'inventory_2', label: 'Manajemen Inventaris', path: '/inventory' },
        { icon: 'history', label: 'Histori Transaksi', path: '/transactions' },
        { icon: 'group', label: 'Manajemen User', path: '/admin/users' },
        { icon: 'settings', label: 'Pengaturan', path: '/admin/settings' },
    ],
    lecturer: [
        { icon: 'dashboard', label: 'Dashboard', path: '/dashboard/lecturer' },
        { icon: 'calendar_today', label: 'Jadwal Praktikum', path: '/calendar' },
        { icon: 'class', label: 'Kelola Praktikum', path: '/admin/courses' },
        { icon: 'inventory_2', label: 'Inventaris Lab', path: '/inventory' },
        { icon: 'history', label: 'Histori Transaksi', path: '/transactions' },
        { icon: 'person', label: 'Profil', path: '/profile' },
    ],
    student: [
        { icon: 'dashboard', label: 'Beranda', path: '/dashboard/student' },
        { icon: 'calendar_today', label: 'Jadwal Praktikum', path: '/calendar' },
        { icon: 'search', label: 'Katalog Kelas', path: '/student/catalog' },
        { icon: 'menu_book', label: 'Materi Praktikum', path: '/materials' },
        { icon: 'inventory_2', label: 'Pinjam Alat', path: '/inventory' },
        { icon: 'person', label: 'Profil', path: '/profile' },
    ],
};

const DesktopLayout = ({ children, title = 'Smart Lab', hideSidebar = false }) => {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    
    const role = user?.role?.toLowerCase() || 'student';
    const items = navItems[role] || navItems.student;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-poppins overflow-hidden">
            {/* Mobile Header / Topbar for smaller screens */}
            <div className="md:hidden flex items-center justify-between p-4 glass-sidebar text-slate-800 shadow-md z-20">
                <div className="flex items-center gap-2">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                        <span className="material-icons-round text-2xl text-primary">science</span>
                    )}
                    <span className="font-bold text-lg">{settings?.app_name || 'SmartLab'}</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[100] glass-sidebar text-slate-600 dark:text-slate-300
                transform transition-all duration-300 ease-in-out shrink-0
                ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                md:relative md:flex md:flex-col md:translate-x-0
                ${desktopSidebarOpen ? 'md:w-64' : 'md:w-20'}
                ${hideSidebar ? 'hidden md:hidden' : ''}
            `}>
                <div className="h-20 flex items-center gap-3 px-6 border-b border-white/30 dark:border-slate-700/50">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
                    ) : (
                        <span className="material-icons-round text-3xl text-primary">science</span>
                    )}
                    {desktopSidebarOpen && (
                        <span className="font-extrabold text-2xl tracking-tight text-slate-800 dark:text-white truncate">
                            {settings?.app_name || 'SmartLab'}
                        </span>
                    )}
                </div>

                <div className="flex-1 py-6 px-4 overflow-y-auto no-scrollbar">
                    {desktopSidebarOpen ? (
                        <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 px-2">Menu Utama</div>
                    ) : (
                        <div className="mb-4 text-center"><span className="w-6 h-0.5 bg-slate-300 dark:bg-slate-600 block mx-auto rounded-full"></span></div>
                    )}
                    <nav className="space-y-1">
                        {items.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left leading-snug
                                        ${isActive 
                                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'}
                                    `}
                                >
                                    <span className="material-icons-round text-[20px] shrink-0">{item.icon}</span>
                                    {desktopSidebarOpen && (
                                        <span className="flex-1 whitespace-normal break-words">{item.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors font-medium text-sm text-left leading-snug"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {desktopSidebarOpen && <span className="flex-1 whitespace-normal break-words">Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-[90] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden transition-all duration-300">
                {/* Topbar */}
                <header className="h-20 glass-sidebar shadow-sm flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-[90] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                            className="hidden md:flex p-2 rounded-md hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
                            <p className="text-sm text-secondary dark:text-slate-400 hidden sm:block">{settings?.institution_name || 'Smart Laboratorium Poltekkes Makassar'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Search bar removed per user request */}

                        <ThemeCustomizer />

                        <button className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full bg-tailadmin-body dark:bg-slate-900">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                        <button onClick={() => navigate('/profile')} className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-tailadmin-sidebar dark:text-slate-200">{user?.name || 'Pengguna'}</div>
                                <div className="text-xs text-secondary dark:text-slate-400 capitalize">{role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-tailadmin-body dark:bg-slate-700 flex items-center justify-center">
                                <span className="material-icons-round text-secondary text-lg">person</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DesktopLayout;
