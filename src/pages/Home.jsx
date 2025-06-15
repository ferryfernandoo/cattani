import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  // Initialize priceData with default values
  const [priceData, setPriceData] = useState({
    averagePrice: 0,
    averageChange: 0,
    regions: []
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('6m');
  const userName = localStorage.getItem('userName');
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  // Fetch palm oil price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/prices`);
        
        if (!response.data || !response.data.current || !Array.isArray(response.data.current)) {
          throw new Error('Invalid data format received');
        }

        // Calculate average price with safety checks
        const avgPrice = response.data.current.length > 0
          ? Math.round(
              response.data.current.reduce((acc, item) => acc + (item.price || 0), 0) / 
              response.data.current.length
            )
          : 0;

        // Calculate average change with safety checks
        const changes = response.data.current.map(item => {
          const regionHistory = (response.data.historical || [])
            .filter(h => h.region === item.region)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          if (regionHistory.length > 0) {
            const oldPrice = regionHistory[regionHistory.length - 1].price || 0;
            return oldPrice > 0 ? ((item.price - oldPrice) / oldPrice) * 100 : 0;
          }
          return 0;
        });

        const avgChange = changes.length > 0
          ? changes.reduce((acc, val) => acc + val, 0) / changes.length
          : 0;

        setPriceData({
          averagePrice: avgPrice || 0,
          averageChange: avgChange || 0,
          regions: response.data.current || []
        });

        setHistoricalData(response.data.historical || []);
        setLastUpdate(new Date().toLocaleString());
        setError(null);
      } catch (err) {
        console.error("Error fetching palm oil price:", err);
        setError("Gagal memuat data harga sawit");
        
        // Try fallback data
        try {
          const fallbackResponse = await axios.get(`${API_URL}/prices/fallback`);
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data.current)) {
            const avgPrice = Math.round(
              fallbackResponse.data.current.reduce((acc, item) => acc + (item.price || 0), 0) / 
              fallbackResponse.data.current.length
            );
            setPriceData({
              averagePrice: avgPrice || 0,
              averageChange: 0,
              regions: fallbackResponse.data.current
            });
            setHistoricalData(fallbackResponse.data.historical || []);
            setLastUpdate(new Date().toLocaleString());
          }
        } catch (fallbackError) {
          console.error("Fallback data fetch failed:", fallbackError);
          setPriceData({
            averagePrice: 0,
            averageChange: 0,
            regions: []
          });
          setHistoricalData([]);
          setError("Gagal memuat data. Silakan coba lagi nanti.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Process historical data for chart (matching Monitor's implementation)
  const processHistoricalData = () => {
    // Guard against undefined or empty historical data
    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      return {
        labels: [],
        prices: []
      };
    }

    // Group by date and calculate average price per region
    const groupedData = {};
    historicalData.forEach(item => {
      if (!item || !item.timestamp || !item.price) return; // Skip invalid entries
      
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!groupedData[date]) {
        groupedData[date] = {
          total: item.price,
          count: 1
        };
      } else {
        groupedData[date].total += item.price;
        groupedData[date].count += 1;
      }
    });

    // Calculate averages and sort by date
    const sortedDates = Object.keys(groupedData).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const averages = sortedDates.map(date => ({
      date,
      price: Math.round(groupedData[date].total / groupedData[date].count)
    }));

    // Filter based on selected timeframe
    const now = new Date();
    const timeframeMonths = parseInt(chartTimeframe) || 6; // Default to 6 months if parsing fails
    const filteredData = averages.filter(item => {
      const date = new Date(item.date);
      const monthsDiff =
        (now.getFullYear() - date.getFullYear()) * 12 +
        now.getMonth() -
        date.getMonth();
      return monthsDiff <= timeframeMonths;
    });

    return {
      labels: filteredData.map(item => item.date),
      prices: filteredData.map(item => item.price)
    };
  };

  // Chart configuration
  const chartData = {
    labels: processHistoricalData()?.labels || [],
    datasets: [
      {
        label: "Harga Rata-rata (Rp/Kg)",
        data: processHistoricalData()?.prices || [],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Trend Harga Sawit ${
          chartTimeframe === '1m'
            ? '1 Bulan'
            : chartTimeframe === '3m'
            ? '3 Bulan'
            : '6 Bulan'
        } Terakhir`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `Rp ${value.toLocaleString()}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Kondisi sawit data
  const kondisiSawit = {
    status: "Sehat",
    estimasiPanen: "15 Hari",
    produktivitas: "85%",
    kelembaban: "75%",
    suhu: "28°C",
  };

  // Quick action buttons data with improved icons
  const quickActions = [
    { 
      icon: "📝", 
      title: "Catat Sawit", 
      description: "Catat hasil panen dan kondisi sawit",
      color: "from-emerald-400 to-teal-500", 
      path: "/catatan" 
    },
    { 
      icon: "📊", 
      title: "Laporan", 
      description: "Lihat laporan performa kebun",
      color: "from-blue-400 to-indigo-500", 
      path: "/laporan" 
    },
    { 
      icon: "🌡️", 
      title: "Monitor", 
      description: "Pantau kondisi sawit realtime",
      color: "from-violet-400 to-purple-500", 
      path: "/monitor" 
    },
    { 
      icon: "💰", 
      title: "Harga", 
      description: "Update harga sawit terkini",
      color: "from-amber-400 to-orange-500", 
      path: "/harga" 
    },
  ];

  // Timeframe selection component
  const TimeframeSelector = () => (
    <div className="flex items-center gap-2 mb-4">
      <ClockIcon className="h-5 w-5 text-gray-500" />
      <div className="flex bg-gray-100 rounded-lg p-1">
        {[
          { value: '1m', label: '1 Bulan' },
          { value: '3m', label: '3 Bulan' },
          { value: '6m', label: '6 Bulan' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setChartTimeframe(option.value)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              chartTimeframe === option.value
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      {/* Hero Section with Price */}
      <motion.div 
        className="bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-3xl p-8 mb-8 shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CATTANI Dashboard 🌴
        </motion.h1>
        
        {/* Real-time Price Card */}
        <motion.div 
          className="bg-white/20 backdrop-blur-md rounded-2xl p-6 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100">Harga Sawit Hari Ini</p>
              {loading ? (
                <div className="animate-pulse h-8 w-32 bg-white/30 rounded mt-1"></div>
              ) : (
                <h2 className="text-3xl font-bold">
                  Rp {priceData?.averagePrice?.toLocaleString()}/Kg
                </h2>
              )}
            </div>
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-xl">
              {priceData?.averageChange > 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-300 mr-1" />
                  <span className="text-green-100">{priceData.averageChange.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-300 mr-1" />
                  <span className="text-red-100">{Math.abs(priceData.averageChange).toFixed(2)}%</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800">
          Hai, {userName} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di CATTANI Dashboard
        </p>
      </motion.div>

      {/* Price Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-6 shadow-lg mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Grafik Harga Sawit
            </h2>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            Update: {lastUpdate}
          </p>
        </div>
        
        <TimeframeSelector />
        
        {processHistoricalData() ? (
          <div className="h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Data tidak tersedia</p>
          </div>
        )}
      </motion.div>

      {/* Price Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-6 shadow-lg mb-6"
      >
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Harga Rata-rata
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Update: {lastUpdate || 'Belum ada data'}
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-bold text-gray-900">
                  Rp {priceData.averagePrice.toLocaleString()}
                </p>
                <p className="text-gray-500">per kilogram</p>
              </div>
              <div className={`flex items-center ${
                priceData.averageChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {priceData.averageChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-6 w-6" />
                ) : (
                  <ArrowTrendingDownIcon className="h-6 w-6" />
                )}
                <span className="text-lg font-semibold">
                  {Math.abs(priceData.averageChange).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Region Overview */}
            <div className="mt-6 space-y-2">
              {priceData.regions.map((region, idx) => (
                <div
                  key={region.region || idx}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {region.region || 'Region tidak diketahui'}
                    </span>
                  </div>
                  <div className="text-gray-900 font-semibold">
                    Rp {(region.price || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Kondisi Sawit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-lg"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Status Kebun</h2>
          <div className="space-y-4">
            <motion.div 
              className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <p className="text-gray-600 text-sm">Status Tanaman</p>
                <p className="font-semibold text-emerald-600 text-lg">{kondisiSawit.status}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <p className="text-gray-600 text-sm">Estimasi Panen</p>
                <p className="font-semibold text-blue-600 text-lg">{kondisiSawit.estimasiPanen}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </motion.div>

            <motion.div 
              className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <p className="text-gray-600 text-sm">Produktivitas</p>
                <p className="font-semibold text-orange-600 text-lg">{kondisiSawit.produktivitas}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-br ${action.color} p-6 rounded-3xl shadow-lg cursor-pointer`}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex flex-col h-full">
                <span className="text-3xl mb-2">{action.icon}</span>
                <h3 className="text-white font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
