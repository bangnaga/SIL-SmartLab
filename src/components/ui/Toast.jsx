import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
};

const colors = {
    success: 'bg-primary-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

const Toast = ({ toast, onDismiss }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 200);
        }, toast.duration || 3000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold max-w-sm ${colors[toast.type] || colors.info} ${exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
        >
            <span className="material-icons-round text-lg">{icons[toast.type] || 'info'}</span>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200); }} className="ml-2 opacity-70 hover:opacity-100">
                <span className="material-icons-round text-sm">close</span>
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur),
        warning: (msg, dur) => addToast(msg, 'warning', dur),
        info: (msg, dur) => addToast(msg, 'info', dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-6 right-4 z-[200] flex flex-col items-end space-y-2 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast toast={t} onDismiss={dismissToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
