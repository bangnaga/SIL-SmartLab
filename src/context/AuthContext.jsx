import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        } catch (e) {
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // Heartbeat logic
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                await fetch('http://localhost:3001/api/auth/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
            } catch (err) {
                console.error('Heartbeat failed:', err);
            }
        };

        // Send immediately on login/mount
        sendHeartbeat();

        // Then every 2 minutes
        const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    const isAuthenticated = !!user;

    const hasRole = (role) => {
        if (!user) return false;
        return user.role?.toLowerCase() === role.toLowerCase();
    };

    const value = { user, login, logout, isAuthenticated, hasRole, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
