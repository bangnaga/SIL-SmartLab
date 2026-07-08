import React from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', confirmText = 'OK', onConfirm }) => {
    if (!isOpen) return null;

    const themes = {
        success: {
            icon: 'check_circle',
            color: 'text-primary-500',
            bg: 'bg-primary-50',
            btn: 'bg-primary-500 shadow-primary-200'
        },
        error: {
            icon: 'error',
            color: 'text-red-500',
            bg: 'bg-red-50',
            btn: 'bg-red-500 shadow-red-200'
        },
        warning: {
            icon: 'warning',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            btn: 'bg-amber-500 shadow-amber-200'
        },
        info: {
            icon: 'info',
            color: 'text-primary',
            bg: 'bg-blue-50',
            btn: 'bg-primary shadow-primary-200'
        }
    };

    const theme = themes[type] || themes.info;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
                <div className={`h-24 ${theme.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                    <span className={`material-icons-round text-5xl ${theme.color}`}>{theme.icon}</span>
                </div>

                <div className="p-8 text-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onConfirm || onClose}
                        className={`w-full mt-8 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all ${theme.btn}`}
                    >
                        {confirmText}
                    </button>

                    {onConfirm && (
                        <button
                            onClick={onClose}
                            className="w-full mt-3 py-3 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
