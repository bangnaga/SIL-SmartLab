import React from 'react';

const EmptyState = ({
    icon = 'inbox',
    title = 'Tidak ada data',
    description = 'Data yang Anda cari belum tersedia.',
    action,
    actionLabel = 'Coba Lagi',
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in ${className}`}>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="material-icons-round text-3xl text-slate-300 dark:text-slate-600">{icon}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">{title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px] leading-relaxed">{description}</p>
            {action && (
                <button
                    onClick={action}
                    className="mt-4 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg press-effect hover:bg-primary/20 transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
