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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl shadow-emerald-100/50 border border-emerald-50"
            >
                <div className="text-center">
                    <motion.div 
                        className="mx-auto h-20 w-20 flex items-center justify-center mb-4"
                        animate={{
                            rotate: [0, 10, -10, 0],
                            y: [0, -5, 5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <span className="text-5xl">🌿</span>
                    </motion.div>
                    
                    <motion.h2 
                        className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Welcome to CATTANI
                    </motion.h2>
                    
                    <motion.p 
                        className="text-gray-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        Sign in to your account
                    </motion.p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <motion.div 
                        className="space-y-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
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
                            </motion.div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <motion.div whileHover={{ scale: 1.01 }}>
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
                            </motion.div>
                        </div>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <motion.button
                            whileHover={{ 
                                scale: 1.02,
                                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex justify-center items-center"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <span>Sign In</span>
                            )}
                        </motion.button>
                    </motion.div>
                </form>

                <motion.div 
                    className="text-center text-sm text-gray-500 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Don't have an account?{' '}
                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                        Sign up
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
