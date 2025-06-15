import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon,
  MapIcon,
  DocumentTextIcon,
  PrinterIcon,
  CloudArrowDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const CatatanPerkebunan = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [formData, setFormData] = useState({
    jenis: 'pemupukan',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: new Date().toTimeString().substring(0, 5),
    aktivitas: '',
    lokasi: '',
    status: 'proses',
    keterangan: '',
    jumlah: '',
    satuan: 'kg',
    biaya: '',
    supplier: '',
    foto: null
  });
  const [catatanList, setCatatanList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tanggalAwal: '',
    tanggalAkhir: '',
    status: '',
    lokasi: '',
    jenis: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCatatan = localStorage.getItem('catatanPerkebunan');
    const savedProfile = localStorage.getItem('profilePic');
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedCatatan) {
      setCatatanList(JSON.parse(savedCatatan));
    }
    
    if (savedProfile) {
      setProfilePic(savedProfile);
    }
    
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Default notifications
      const defaultNotif = [
        { id: 1, message: 'Selamat datang di aplikasi Catatan Perkebunan Sawit!', read: false, date: new Date().toISOString() },
        { id: 2, message: 'Jangan lupa untuk mencatat aktivitas pemupukan hari ini', read: false, date: new Date().toISOString() }
      ];
      setNotifications(defaultNotif);
      localStorage.setItem('notifications', JSON.stringify(defaultNotif));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('catatanPerkebunan', JSON.stringify(catatanList));
  }, [catatanList]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          foto: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem('profilePic', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode) {
      // Update existing note
      const updatedList = catatanList.map(catatan => 
        catatan.id === formData.id ? { ...formData } : catatan
      );
      setCatatanList(updatedList);
      
      // Add notification
      addNotification(`Catatan "${formData.aktivitas}" telah diperbarui`);
    } else {
      // Add new note
      const newCatatan = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      setCatatanList([newCatatan, ...catatanList]);
      
      // Add notification
      addNotification(`Catatan baru "${formData.aktivitas}" telah ditambahkan`);
    }
    
    setShowForm(false);
    resetForm();
    setEditMode(false);
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      read: false,
      date: new Date().toISOString()
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const resetForm = () => {
    setFormData({
      jenis: 'pemupukan',
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toTimeString().substring(0, 5),
      aktivitas: '',
      lokasi: '',
      status: 'proses',
      keterangan: '',
      jumlah: '',
      satuan: 'kg',
      biaya: '',
      supplier: '',
      foto: null
    });
  };

  const deleteCatatan = (id, e) => {
    e.stopPropagation();
    const catatan = catatanList.find(c => c.id === id);
    if (catatan) {
      addNotification(`Catatan "${catatan.aktivitas}" telah dihapus`);
    }
    setCatatanList(catatanList.filter(catatan => catatan.id !== id));
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      tanggalAwal: '',
      tanggalAkhir: '',
      status: '',
      lokasi: '',
      jenis: ''
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(catatanList, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `catatan-perkebunan-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addNotification(`Data telah diekspor (${catatanList.length} catatan)`);
  };

  const printData = () => {
    window.print();
    addNotification("Data telah diprint");
  };

  const filteredCatatan = catatanList.filter(catatan => {
    // Filter by active tab
    if (activeTab !== 'semua' && catatan.jenis !== activeTab) return false;
    
    // Filter by search term
    if (searchTerm && !catatan.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !catatan.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Filter by date range
    if (filters.tanggalAwal && catatan.tanggal < filters.tanggalAwal) return false;
    if (filters.tanggalAkhir && catatan.tanggal > filters.tanggalAkhir) return false;
    
    // Filter by status
    if (filters.status && catatan.status !== filters.status) return false;
    
    // Filter by location
    if (filters.lokasi && !catatan.lokasi.toLowerCase().includes(filters.lokasi.toLowerCase())) return false;
    
    // Filter by jenis
    if (filters.jenis && catatan.jenis !== filters.jenis) return false;
    
    return true;
  });

  const getIconByType = (type) => {
    switch (type) {
      case 'pemupukan':
        return <CubeIcon className="h-5 w-5 text-green-600" />;
      case 'pestisida':
        return <ShieldCheckIcon className="h-5 w-5 text-red-600" />;
      case 'bibit':
        return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
      case 'pemeliharaan':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-600" />;
      case 'panen':
        return <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-600" />;
      case 'supplier':
        return <TruckIcon className="h-5 w-5 text-orange-600" />;
      case 'keuangan':
        return <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />;
      default:
        return <CubeIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'proses':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'batal':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const openEditForm = (catatan) => {
    setFormData({
      ...catatan,
      foto: catatan.foto || null
    });
    setEditMode(true);
    setShowForm(true);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 shadow-md print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Catatan Perkebunan Sawit</h1>
            <p className="text-emerald-100">Kelola semua aktivitas perkebunan Anda</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 rounded-full hover:bg-emerald-600 relative"
              >
                <BellIcon className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50"
                  >
                    <div className="p-2 border-b">
                      <h3 className="text-sm font-medium text-gray-700">Notifikasi</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Tidak ada notifikasi
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.date).toLocaleString('id-ID')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t text-center">
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Hapus Semua
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <label htmlFor="profile-upload" className="cursor-pointer">
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="h-10 w-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-white" />
                )}
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 print:p-0">
        {/* Action Buttons and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Catatan
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filter
              <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <CloudArrowDownIcon className="h-5 w-5 mr-2" />
              Ekspor
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={printData}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Cetak
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(!showStats)}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {showStats ? 'Sembunyikan Statistik' : 'Tampilkan Statistik'}
            </motion.button>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari catatan..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden print:hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Awal</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={filters.tanggalAwal}
                    onChange={(e) => setFilters({...filters, tanggalAwal: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={filters.tanggalAkhir}
                    onChange={(e) => setFilters({...filters, tanggalAkhir: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={filters.jenis}
                    onChange={(e) => setFilters({...filters, jenis: e.target.value})}
                  >
                    <option value="">Semua Jenis</option>
                    <option value="pemupukan">Pemupukan</option>
                    <option value="pestisida">Pestisida</option>
                    <option value="bibit">Bibit</option>
                    <option value="pemeliharaan">Pemeliharaan</option>
                    <option value="panen">Panen</option>
                    <option value="supplier">Supplier</option>
                    <option value="keuangan">Keuangan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Semua Status</option>
                    <option value="proses">Proses</option>
                    <option value="selesai">Selesai</option>
                    <option value="batal">Batal</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Blok A, B, dll"
                    className="w-full border border-gray-300 rounded-md p-2"
                    value={filters.lokasi}
                    onChange={(e) => setFilters({...filters, lokasi: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
                >
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Summary */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:grid-cols-4 print:mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-sm text-gray-500">Total Catatan</h3>
              <p className="text-2xl font-bold">{catatanList.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="text-sm text-gray-500">Proses</h3>
              <p className="text-2xl font-bold">{catatanList.filter(c => c.status === 'proses').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
              <h3 className="text-sm text-gray-500">Selesai</h3>
              <p className="text-2xl font-bold">{catatanList.filter(c => c.status === 'selesai').length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <h3 className="text-sm text-gray-500">Batal</h3>
              <p className="text-2xl font-bold">{catatanList.filter(c => c.status === 'batal').length}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 border-b border-gray-200 print:hidden">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'semua' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('semua')}
          >
            <CubeIcon className="h-4 w-4 mr-2" />
            Semua
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'pemupukan' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pemupukan')}
          >
            <CubeIcon className="h-4 w-4 mr-2 text-green-600" />
            Pemupukan
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'pestisida' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pestisida')}
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2 text-red-600" />
            Pestisida
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'bibit' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bibit')}
          >
            <ShoppingCartIcon className="h-4 w-4 mr-2 text-blue-600" />
            Bibit
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'pemeliharaan' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('pemeliharaan')}
          >
            <WrenchScrewdriverIcon className="h-4 w-4 mr-2 text-yellow-600" />
            Pemeliharaan
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'panen' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('panen')}
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2 text-purple-600" />
            Panen
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'supplier' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('supplier')}
          >
            <TruckIcon className="h-4 w-4 mr-2 text-orange-600" />
            Supplier
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'keuangan' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('keuangan')}
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-2 text-emerald-600" />
            Keuangan
          </button>
        </div>

        {/* Notes List - Card View */}
        {filteredCatatan.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center print:p-4">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
              alt="No data" 
              className="h-32 mx-auto mb-4 opacity-50 print:h-20"
            />
            <h3 className="text-lg font-medium text-gray-700">Tidak ada catatan ditemukan</h3>
            <p className="text-gray-500">Mulai dengan menambahkan catatan baru</p>
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
              }}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors print:hidden"
            >
              Tambah Catatan
            </button>
          </div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 print:grid-cols-3 print:gap-2"
            >
              {filteredCatatan.map((catatan) => (
                <motion.div
                  key={catatan.id}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 cursor-pointer print:shadow-none print:border"
                  onClick={() => openEditForm(catatan)}
                >
                  <div className="p-5 print:p-3">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        {getIconByType(catatan.jenis)}
                        <h3 className="text-lg font-semibold ml-2 print:text-base">{catatan.aktivitas}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        getStatusColor(catatan.status).bg
                      } ${getStatusColor(catatan.status).text}`}>
                        {catatan.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2 print:text-xs">
                      <CalendarIcon className="h-4 w-4 mr-1 print:h-3 print:w-3" />
                      {new Date(catatan.tanggal).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <ClockIcon className="h-4 w-4 ml-3 mr-1 print:h-3 print:w-3" />
                      {catatan.waktu}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3 print:text-xs">
                      <div className="flex items-center">
                        <MapIcon className="h-4 w-4 mr-1 text-gray-500 print:h-3 print:w-3" />
                        <span>{catatan.lokasi}</span>
                      </div>
                      {catatan.jumlah && (
                        <div>
                          <span className="text-gray-500">Jumlah:</span> {catatan.jumlah} {catatan.satuan}
                        </div>
                      )}
                      {catatan.biaya && (
                        <div>
                          <span className="text-gray-500">Biaya:</span> Rp{parseInt(catatan.biaya).toLocaleString('id-ID')}
                        </div>
                      )}
                      {catatan.supplier && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Supplier:</span> {catatan.supplier}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 print:text-xs">
                      <DocumentTextIcon className="h-4 w-4 mr-1 inline text-gray-500 print:h-3 print:w-3" />
                      {catatan.keterangan}
                    </p>
                    
                    {catatan.foto && (
                      <div className="mb-4">
                        <img 
                          src={catatan.foto} 
                          alt="Foto catatan" 
                          className="h-32 w-full object-cover rounded-md print:h-20"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end print:hidden">
                      <button
                        onClick={(e) => deleteCatatan(catatan.id, e)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Table View (for larger screens) */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden mb-8 print:block print:shadow-none print:border">
              <div className="overflow-x-auto print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 print:bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal/Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biaya</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCatatan.map((catatan) => (
                      <tr key={catatan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getIconByType(catatan.jenis)}
                            <span className="ml-2 capitalize">{catatan.jenis}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{catatan.aktivitas}</div>
                          <div className="text-sm text-gray-500">{catatan.keterangan.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(catatan.tanggal).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-sm text-gray-500">{catatan.waktu}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {catatan.lokasi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {catatan.jumlah && `${catatan.jumlah} ${catatan.satuan}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {catatan.biaya && `Rp${parseInt(catatan.biaya).toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColor(catatan.status).bg
                          } ${getStatusColor(catatan.status).text}`}>
                            {catatan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium print:hidden">
                          <button
                            onClick={(e) => deleteCatatan(catatan.id, e)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => openEditForm(catatan)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 print:hidden"
            onClick={() => {
              setShowForm(false);
              setEditMode(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{editMode ? 'Edit Catatan' : 'Tambah Catatan Baru'}</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Aktivitas</label>
                    <select
                      name="jenis"
                      value={formData.jenis}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value="pemupukan">Pemupukan</option>
                      <option value="pestisida">Pestisida</option>
                      <option value="bibit">Bibit</option>
                      <option value="pemeliharaan">Pemeliharaan</option>
                      <option value="panen">Panen</option>
                      <option value="supplier">Supplier</option>
                      <option value="keuangan">Keuangan</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                    <input
                      type="time"
                      name="waktu"
                      value={formData.waktu}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aktivitas</label>
                    <input
                      type="text"
                      name="aktivitas"
                      value={formData.aktivitas}
                      onChange={handleInputChange}
                      placeholder="Misal: Pemupukan Blok A"
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                    <input
                      type="text"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleInputChange}
                      placeholder="Misal: Blok A, B, dll"
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="jumlah"
                        value={formData.jumlah}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-3/4 border border-gray-300 rounded-l-md p-2"
                      />
                      <select
                        name="satuan"
                        value={formData.satuan}
                        onChange={handleInputChange}
                        className="w-1/4 border border-l-0 border-gray-300 rounded-r-md p-2"
                      >
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                        <option value="karung">karung</option>
                        <option value="batang">batang</option>
                        <option value="hektar">hektar</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biaya (Rp)</label>
                    <input
                      type="number"
                      name="biaya"
                      value={formData.biaya}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Nama supplier"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Detail aktivitas..."
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto Dokumentasi</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {formData.foto ? (
                          <div className="relative">
                            <img 
                              src={formData.foto} 
                              alt="Preview" 
                              className="mx-auto h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, foto: null})}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none"
                              >
                                <span>Upload foto</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">atau drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                      setEditMode(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    {editMode ? 'Update Catatan' : 'Simpan Catatan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CatatanPerkebunan;