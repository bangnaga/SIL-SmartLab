import React from 'react';

const Input = ({ label, icon, placeholder, type = 'text', ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="material-icons-round text-slate-400 group-focus-within:text-primary transition-colors">
                            {icon}
                        </span>
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    className={`block w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-slate-900 dark:text-white placeholder-slate-300 transition-all font-medium text-sm`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
