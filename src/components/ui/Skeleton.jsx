import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', count = 1 }) => {
    const items = Array.from({ length: count });

    if (variant === 'card') {
        return (
            <div className={`space-y-3 ${className}`}>
                {items.map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="skeleton w-12 h-12 rounded-lg shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-3/4 rounded"></div>
                                <div className="skeleton h-3 w-1/2 rounded"></div>
                            </div>
                        </div>
                        <div className="skeleton h-2 w-full rounded-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className={`space-y-2 ${className}`}>
                {items.map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-3 w-2/3 rounded"></div>
                            <div className="skeleton h-2 w-1/3 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default: simple rect
    return (
        <div className={`space-y-2 ${className}`}>
            {items.map((_, i) => (
                <div key={i} className="skeleton h-4 w-full rounded"></div>
            ))}
        </div>
    );
};

export default Skeleton;
