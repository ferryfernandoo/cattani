import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        setLoading(false);
    }, []);    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            
            const { token, user } = response.data;
            if (!token || !user) {
                throw new Error('Invalid response from server');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return true;
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to login. Please try again later.');
        }
    };    const register = async (username, email, password) => {
        try {
            if (!username || !email || !password) {
                throw new Error('All fields are required');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password
            });
            
            const { token, user } = response.data;
            if (!token || !user) {
                throw new Error('Invalid response from server');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateProfile = async (userData) => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/profile', userData);
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        updateProfile,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
