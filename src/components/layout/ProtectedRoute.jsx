import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-background-dark">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memverifikasi...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role?.toLowerCase();
        if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
            // Redirect to their appropriate dashboard
            if (userRole === 'admin') return <Navigate to="/dashboard/admin" replace />;
            if (userRole === 'lecturer') return <Navigate to="/dashboard/lecturer" replace />;
            return <Navigate to="/dashboard/student" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
