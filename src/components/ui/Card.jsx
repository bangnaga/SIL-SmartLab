import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-2xl shadow-2xl shadow-primary-900/5 dark:shadow-none border border-slate-100 dark:border-slate-800 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
