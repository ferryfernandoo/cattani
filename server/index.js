const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB Atlas connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

// Cache for storing scraped data
let priceCache = {
  timestamp: null,
  data: null,
  historical: null
};

// Function to scrape palm oil prices from multiple sources
async function scrapePalmOilPrices() {
  try {
    const prices = [];
    
    // Source 1: GAPKI Web Scraping
    try {
      const gapkiResponse = await axios.get('https://gapki.id/news/category/harga', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let $ = cheerio.load(gapkiResponse.data);
      $('.post-content').each((i, elem) => {
        const text = $(elem).text();
        const priceMatch = text.match(/Rp\s*(\d{1,3}(?:[.,]\d{3})*)/g);
        const regionMatch = text.match(/(sumatera|kalimantan|riau|jambi|aceh|bengkulu|sumsel|sumut|kalbar|kaltim|kalsel|kalteng)/gi);
        
        if (priceMatch && regionMatch) {
          prices.push({
            source: 'GAPKI',
            region: regionMatch[0],
            price: parsePrice(priceMatch[0]),
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.log('GAPKI scraping failed:', error.message);
    }

    // Source 2: Badan Pusat Statistik (BPS)
    try {
      const bpsResponse = await axios.get('https://www.bps.go.id/indicator/12/1884/1/harga-tbs-kelapa-sawit.html', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let $ = cheerio.load(bpsResponse.data);
      $('.table-responsive tr').each((i, elem) => {
        if (i > 0) {
          const columns = $(elem).find('td');
          const region = $(columns[0]).text().trim();
          const price = $(columns[1]).text().trim();
          if (region && price) {
            prices.push({
              source: 'BPS',
              region,
              price: parsePrice(price),
              timestamp: new Date().toISOString()
            });
          }
        }
      });
    } catch (error) {
      console.log('BPS scraping failed:', error.message);
    }

    // Source 3: Dinas Perkebunan Regional Websites
    const disbunSources = [
      { url: 'https://disbun.sumutprov.go.id/harga-komoditi', region: 'Sumatera Utara' },
      { url: 'https://disbun.riau.go.id/harga-tbs', region: 'Riau' },
      { url: 'https://disbun.kaltimprov.go.id/harga-sawit', region: 'Kalimantan Timur' }
    ];

    for (const source of disbunSources) {
      try {
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        let $ = cheerio.load(response.data);
        $('.price-content, .harga-content, .komoditi-price').each((i, elem) => {
          const text = $(elem).text();
          const priceMatch = text.match(/Rp\s*(\d{1,3}(?:[.,]\d{3})*)/);
          if (priceMatch) {
            prices.push({
              source: 'Dinas Perkebunan',
              region: source.region,
              price: parsePrice(priceMatch[0]),
              timestamp: new Date().toISOString()
            });
          }
        });
      } catch (error) {
        console.log(`${source.region} Disbun scraping failed:`, error.message);
      }
    }

    // Source 4: Social Media Updates (Twitter)
    try {
      const twitterResponse = await axios.get('https://nitter.net/search', {
        params: {
          q: 'harga sawit tbs',
          f: 'tweets'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let $ = cheerio.load(twitterResponse.data);
      $('.tweet-content').each((i, elem) => {
        const text = $(elem).text();
        const priceMatch = text.match(/Rp\s*(\d{1,3}(?:[.,]\d{3})*)/);
        const regionMatch = text.match(/(sumatera|kalimantan|riau|jambi|aceh|bengkulu|sumsel|sumut|kalbar|kaltim|kalsel|kalteng)/i);
        
        if (priceMatch && regionMatch) {
          prices.push({
            source: 'Social Media',
            region: regionMatch[0],
            price: parsePrice(priceMatch[0]),
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.log('Twitter scraping failed:', error.message);
    }

    // Source 5: InfoSawit
    try {
      const infoSawitResponse = await axios.get('https://www.infosawit.com/harga', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      let $ = cheerio.load(infoSawitResponse.data);
      $('.price-table tr').each((i, elem) => {
        const region = $(elem).find('td:first-child').text().trim();
        const priceText = $(elem).find('td:nth-child(2)').text().trim();
        if (region && priceText) {
          prices.push({
            source: 'InfoSawit',
            region: region,
            price: parsePrice(priceText),
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.log('InfoSawit scraping failed:', error.message);
    }

    // Source 6: KPBN API (if available)
    try {
      const kpbnResponse = await axios.get('https://api.kpbn.co.id/api/v1/prices/palm-oil', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (kpbnResponse.data && kpbnResponse.data.prices) {
        kpbnResponse.data.prices.forEach(item => {
          prices.push({
            source: 'KPBN',
            region: item.region,
            price: item.price,
            timestamp: new Date().toISOString()
          });
        });
      }
    } catch (error) {
      console.log('KPBN API request failed:', error.message);
    }

    // Add source credibility ranking
    const sourceCredibility = {
      'KPBN': 5,
      'BPS': 5,
      'GAPKI': 4,
      'Dinas Perkebunan': 4,
      'InfoSawit': 3,
      'Social Media': 1
    };

    // Process and validate prices
    const validatedPrices = prices.filter(price => {
      // Remove outliers and invalid prices
      const isValidPrice = price.price > 500 && price.price < 5000; // Realistic range for palm oil prices
      const isValidRegion = price.region && price.region.length > 2;
      return isValidPrice && isValidRegion;
    });

    // Sort by source credibility
    validatedPrices.sort((a, b) => (sourceCredibility[b.source] || 0) - (sourceCredibility[a.source] || 0));

    // Generate more realistic historical data
    const historical = generateEnhancedHistoricalData(validatedPrices);

    if (validatedPrices.length === 0) {
      const fallbackData = getFallbackData();
      return {
        current: fallbackData,
        historical: generateEnhancedHistoricalData(fallbackData)
      };
    }

    return {
      current: validatedPrices,
      historical
    };
  } catch (error) {
    console.error('Error scraping prices:', error);
    const fallbackData = getFallbackData();
    return {
      current: fallbackData,
      historical: generateEnhancedHistoricalData(fallbackData)
    };
  }
}

// Generate historical data based on current prices
function generateHistoricalData(currentPrices) {
  const months = 6;
  const historical = [];
  const baseVariance = 0.05; // 5% maximum variance

  currentPrices.forEach(priceData => {
    const basePrice = priceData.price;
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Create a realistic price trend
      const variance = (Math.random() - 0.5) * 2 * baseVariance;
      const historicalPrice = Math.round(basePrice * (1 - (i * 0.01) + variance));
      
      historical.push({
        region: priceData.region,
        price: historicalPrice,
        timestamp: date.toISOString(),
        source: priceData.source
      });
    }
  });

  return historical;
}

// Generate enhanced historical data with more realistic trends
function generateEnhancedHistoricalData(currentPrices) {
  const months = 6;
  const historical = [];
  const baseVariance = 0.05; // 5% maximum daily variance
  const trendFactors = {
    uptrend: 0.02,    // 2% monthly increase
    downtrend: -0.015, // 1.5% monthly decrease
    seasonal: 0.03     // 3% seasonal variation
  };

  currentPrices.forEach(priceData => {
    const basePrice = priceData.price;
    let currentPrice = basePrice;
    
    for (let i = 0; i < months; i++) {
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(date.getDate() - day);
        
        // Apply seasonal variations (higher in peak seasons)
        const monthIndex = date.getMonth();
        const seasonalEffect = Math.sin((monthIndex / 11) * Math.PI) * trendFactors.seasonal;
        
        // Apply market trend
        const trendEffect = (Math.random() > 0.6 ? trendFactors.uptrend : trendFactors.downtrend) * (months - i) / months;
        
        // Apply daily variance
        const dailyVariance = (Math.random() - 0.5) * 2 * baseVariance;
        
        // Calculate final price with all factors
        const finalPrice = Math.round(currentPrice * (1 + seasonalEffect + trendEffect + dailyVariance));
        
        // Update current price for next iteration
        currentPrice = finalPrice;
        
        historical.push({
          region: priceData.region,
          price: finalPrice,
          timestamp: date.toISOString(),
          source: priceData.source
        });
      }
    }
  });

  // Sort by timestamp
  historical.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return historical;
}

// Enhanced price parsing helper
function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  // Remove currency symbols, dots for thousands, and convert comma to dot for decimals
  const cleaned = priceStr.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned));
}

// Add route handlers
app.get('/api/prices', async (req, res) => {
  try {
    // Check cache first
    if (priceCache.timestamp && priceCache.data && priceCache.historical) {
      const cacheAge = Date.now() - new Date(priceCache.timestamp).getTime();
      if (cacheAge < 300000) { // 5 minutes cache
        return res.json({
          current: priceCache.data,
          historical: priceCache.historical
        });
      }
    }

    // Fetch fresh data
    const result = await scrapePalmOilPrices();
    
    // Validate the data before caching and sending
    if (!result || !Array.isArray(result.current) || !Array.isArray(result.historical)) {
      console.error('Invalid data format from scraper');
      const fallbackData = getFallbackData();
      return res.json({
        current: fallbackData,
        historical: generateEnhancedHistoricalData(fallbackData)
      });
    }

    // Update cache
    priceCache = {
      timestamp: new Date().toISOString(),
      data: result.current,
      historical: result.historical
    };

    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    // Return fallback data on error
    const fallbackData = getFallbackData();
    res.json({
      current: fallbackData,
      historical: generateEnhancedHistoricalData(fallbackData)
    });
  }
});

// Fallback data endpoint
app.get('/api/prices/fallback', (req, res) => {
  const fallbackData = getFallbackData();
  res.json({
    current: fallbackData,
    historical: generateEnhancedHistoricalData(fallbackData)
  });
});

// Helper function for fallback data
function getFallbackData() {
  return [
    {
      region: 'Sumatera Utara',
      price: 2150,
      source: 'Fallback',
      timestamp: new Date().toISOString()
    },
    {
      region: 'Riau',
      price: 2200,
      source: 'Fallback',
      timestamp: new Date().toISOString()
    },
    {
      region: 'Jambi',
      price: 2100,
      source: 'Fallback',
      timestamp: new Date().toISOString()
    },
    {
      region: 'Kalimantan Barat',
      price: 2050,
      source: 'Fallback',
      timestamp: new Date().toISOString()
    }
  ];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
