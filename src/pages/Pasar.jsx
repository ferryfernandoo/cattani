import React from 'react';
import { motion } from 'framer-motion';

const Pasar = () => {
  const produkList = [
    {
      id: 1,
      nama: 'Premium A',
      harga: 2500,
      stok: 150,
      lokasi: 'Jakarta',
      keterangan: 'Kualitas terbaik'
    },
    {
      id: 2,
      nama: 'Standar B',
      harga: 2000,
      stok: 200,
      lokasi: 'Surabaya',
      keterangan: 'Kualitas standar'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Harga Pasar
        </h1>
        <p className="text-gray-600">Update harga terkini</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produkList.map((produk) => (
          <motion.div
            key={produk.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{produk.nama}</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-emerald-600">
                  Rp {produk.harga.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Stok: {produk.stok} kg
                </p>
                <p className="text-gray-600">
                  Lokasi: {produk.lokasi}
                </p>
                <p className="text-gray-600">
                  {produk.keterangan}
                </p>
              </div>
              <button className="mt-4 w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                Lihat Detail
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Pasar;
