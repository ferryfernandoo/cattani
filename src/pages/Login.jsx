import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/brand.css';

const Login = () => {
    const [formData, setFormData] = useState({
        name: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (!formData.name || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('userName', formData.name);
            localStorage.setItem('isLoggedIn', 'true');
            setIsLoading(false);
            navigate('/');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-emerald-50"
            >
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
                        <motion.span 
                            className="text-5xl"
                            animate={{
                                rotate: [0, 5, -5, 0],
                                y: [0, -3, 3, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            🌿
                        </motion.span>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent">
                        Welcome to CATTANI
                    </h2>
                    
                    <p className="text-gray-500 font-medium">
                        Sign in to your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <motion.button
                            whileHover={{ 
                                backgroundColor: '#059669' // darker emerald
                            }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-emerald-500 text-white font-medium rounded-xl transition-colors duration-200 flex justify-center items-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{' '}
                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                        Sign up
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
