import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Constants
const CACHE_KEY = 'cattani_monitor_data';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const MAX_HISTORY_ITEMS = 288; // 24 hours worth of 5-minute data points

const Monitor = () => {

  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataHistory, setDataHistory] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const lastRefreshAttempt = useRef(0);

  // Load cached data on mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { history, lastUpdateTime } = JSON.parse(cachedData);
        setDataHistory(history);
        setLastUpdate(new Date(lastUpdateTime));
        if (history.length > 0) {

        }
      }
    } catch (err) {
      console.error('Error loading cached data:', err);
    }
  }, []);

  // Save to cache whenever data changes
  useEffect(() => {
    if (dataHistory.length > 0 && lastUpdate) {
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            history: dataHistory,
            lastUpdateTime: lastUpdate.toISOString(),
          })
        );
      } catch (err) {
        console.error('Error saving to cache:', err);
      }
    }
  }, [dataHistory, lastUpdate]);

  // Function to fetch prices with exponential backoff
  const fetchPrices = useCallback(async (isManualRefresh = false) => {
    // Throttle manual refreshes to once every 30 seconds
    if (isManualRefresh) {
      const now = Date.now();
      if (now - lastRefreshAttempt.current < 30000) {
        return;
      }
      lastRefreshAttempt.current = now;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/prices');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // Add timestamp to the data
      const timestampedData = {
        ...data,
        timestamp: new Date().toISOString(),
      };

      // Update price data          // Update history with size limit
      setDataHistory((prevHistory) => {
        const newHistory = [...prevHistory, timestampedData]
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-MAX_HISTORY_ITEMS);
        return newHistory;
      });

      setLastUpdate(new Date());
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError('Gagal memuat data. Akan mencoba lagi dalam beberapa saat.');
      
      // Implement exponential backoff for retries
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchPrices();
        }, retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, retryCount]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchPrices();

    // Set up auto-refresh
    const intervalId = setInterval(fetchPrices, REFRESH_INTERVAL);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchPrices]);

  // Prepare chart data with memoization
  const getChartData = useCallback(() => {
    if (!dataHistory.length) return null;

    const filteredData =
      selectedPeriod === 'day'
        ? dataHistory.filter(
            (d) => new Date(d.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          )
        : dataHistory;

    const labels = filteredData.map((d) =>
      new Date(d.timestamp).toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        ...(selectedPeriod === 'week' && { day: '2-digit', month: '2-digit' }),
      })
    );

    const prices = filteredData.map((d) => d.averagePrice || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Harga Rata-rata (Rp/Kg)',
          data: prices,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          tension: 0.4,
        },
      ],
    };
  }, [dataHistory, selectedPeriod]);

  // Chart options with memoization
  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Trend Harga ${selectedPeriod === 'day' ? 'Harian' : 'Mingguan'}`,
        align: 'start',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }), [selectedPeriod]);

  // Get stats with memoization
  const getStats = useCallback(() => {
    if (!dataHistory.length) return null;

    const prices = dataHistory.map((d) => d.averagePrice || 0).filter((p) => p > 0);
    return {
      current: prices[prices.length - 1],
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      highest: Math.max(...prices),
      lowest: Math.min(...prices),
    };
  }, [dataHistory]);

  const stats = getStats();
  const chartData = getChartData();

  return (
    <div className="container mx-auto px-4 py-8 relative z-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitor Harga</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Pantau perkembangan harga realtime</p>
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Update terakhir: {new Date(lastUpdate).toLocaleString('id-ID')}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Harga Saat Ini</p>
            <p className="text-2xl font-bold text-emerald-600">
              Rp {stats.current?.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Rata-rata</p>
            <p className="text-2xl font-bold text-blue-600">
              Rp {stats.average?.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Tertinggi</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {stats.highest?.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <p className="text-sm text-gray-600 mb-1">Terendah</p>
            <p className="text-2xl font-bold text-red-600">
              Rp {stats.lowest?.toLocaleString()}
            </p>
          </motion.div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedPeriod === 'day'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('day')}
            >
              Harian
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedPeriod === 'week'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedPeriod('week')}
            >
              Mingguan
            </button>
          </div>
          <button
            onClick={fetchPrices}
            disabled={isLoading}
            className={`text-emerald-600 hover:text-emerald-700 disabled:opacity-50 flex items-center`}
          >            <ArrowPathIcon
              className={`h-5 w-5 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : !chartData ? (
          <div className="text-gray-600 text-center py-8">
            {isLoading ? 'Memuat data...' : 'Belum ada data'}
          </div>
        ) : (
          <div className="h-[400px]">
            <Line options={options} data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitor;
