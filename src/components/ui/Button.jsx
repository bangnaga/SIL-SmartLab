import React from 'react';

const Button = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-6 py-4 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2';
    const variants = {
        primary: 'bg-primary hover:bg-[#00753b] text-white shadow-lg shadow-primary-900/10',
        secondary: 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-300 active:bg-primary-50 active:text-primary',
        ghost: 'text-slate-500 dark:text-slate-400 hover:text-primary',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
