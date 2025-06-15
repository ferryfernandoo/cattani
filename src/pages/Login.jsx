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

        localStorage.setItem('userName', formData.name);
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoading(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 login-container p-8"
            >
                <div>
                    <motion.div 
                        className="mx-auto h-16 w-16 text-4xl flex items-center justify-center"
                        whileHover={{ rotate: 20, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="brand-icon">🌴</span>
                    </motion.div>
                    <h2 className="mt-6 text-center login-title">
                        Welcome to CATTANI
                    </h2>
                    <p className="mt-2 text-center text-gray-600">
                        Please sign in to continue
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm mt-1"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="custom-button w-full flex justify-center"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Sign in'
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
