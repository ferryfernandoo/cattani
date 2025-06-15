import React from 'react';
import { motion } from 'framer-motion';

const Profil = () => {
  const userProfile = {
    nama: 'Pak Tani',
    lokasi: 'Riau',
    luasLahan: '5 Hektar',
    bergabung: 'Juni 2025',
    jumlahPohon: '500 pohon',
    avatar: '👨‍🌾',
    prestasi: [
      { icon: '🏆', label: 'Top Performer' },
      { icon: '⭐', label: 'Rating 5.0' },
      { icon: '🌱', label: 'Inovator' }
    ]
  };

  const statsData = [
    { label: 'Produksi', value: '2.5 ton', icon: '📦' },
    { label: 'Pendapatan', value: 'Rp 25.000.000', icon: '💰' },
    { label: 'Kualitas', value: 'A+', icon: '⭐' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4"
    >
      {/* Profile Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-4xl shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {userProfile.avatar}
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-800">{userProfile.nama}</h1>
        <p className="text-gray-600 flex items-center justify-center mt-2">
          <i className="fas fa-map-marker-alt mr-2"></i>
          {userProfile.lokasi}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white p-4 rounded-2xl shadow-lg text-center border border-gray-100"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl mb-2 block">{stat.icon}</span>
            <p className="text-xs text-gray-600">{stat.label}</p>
            <p className="text-sm font-bold text-gray-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Informasi Lahan */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Informasi Lahan</h2>
        <div className="space-y-4">
          <motion.div 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-gray-600">Luas Lahan</span>
            <span className="font-semibold text-emerald-600">{userProfile.luasLahan}</span>
          </motion.div>
          <motion.div 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-gray-600">Jumlah Pohon</span>
            <span className="font-semibold text-emerald-600">{userProfile.jumlahPohon}</span>
          </motion.div>
          <motion.div 
            className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-gray-600">Bergabung Sejak</span>
            <span className="font-semibold text-emerald-600">{userProfile.bergabung}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Prestasi */}
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold mb-4">Prestasi</h2>
        <div className="space-y-3">
          {userProfile.prestasi.map((prestasi, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-2xl">{prestasi.icon}</span>
              <span className="text-gray-800">{prestasi.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl font-medium shadow-lg"
        >
          Edit Profil
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-medium shadow-lg"
        >
          Pengaturan
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profil;
