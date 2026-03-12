// Binance API Integration for AtikAnaliz
// Real-time crypto data and candlestick charts

import { fetchWithProxy } from './cors-proxy';

const BASE_URL = 'https://api.binance.com';

// Supported trading pairs
const SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
  'DOGEUSDT', 'AVAXUSDT', 'OPUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT',
  'ARBUSDT', 'SUIUSDT', 'TRXUSDT', 'LTCUSDT'
];

// Interval mappings
const INTERVAL_MAP = {
  '1m': '1m',
  '5m': '5m', 
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d'
};

// Fetch current price for all symbols
export async function getAllPrices() {
  try {
    const response = await fetchWithProxy(`${BASE_URL}/api/v3/ticker/price`);
    const data = await response.json();
    
    return SYMBOLS.map(symbol => {
      const ticker = data.find(t => t.symbol === symbol);
      return {
        s: symbol.replace('USDT', ''),
        sym: symbol,
        price: ticker ? parseFloat(ticker.price) : 0
      };
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
}

// Fetch 24hr ticker statistics for change percentages
export async function get24hrStats() {
  try {
    const response = await fetchWithProxy(`${BASE_URL}/api/v3/ticker/24hr?symbols=${JSON.stringify(SYMBOLS)}`);
    const data = await response.json();
    
    return data.reduce((acc, ticker) => {
      const symbol = ticker.symbol.replace('USDT', '');
      acc[symbol] = {
        change24: parseFloat(ticker.priceChangePercent),
        volume: parseFloat(ticker.volume)
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching 24hr stats:', error);
    return {};
  }
}

// Fetch candlestick data
export async function getCandlesticks(symbol, interval = '15m', limit = 100) {
  try {
    const binanceInterval = INTERVAL_MAP[interval] || '15m';
    const response = await fetchWithProxy(
      `${BASE_URL}/api/v3/klines?symbol=${symbol}USDT&interval=${binanceInterval}&limit=${limit}`
    );
    const data = await response.json();
    
    return data.map(([timestamp, open, high, low, close, volume]) => ({
      t: parseInt(timestamp),
      o: parseFloat(open),
      h: parseFloat(high),
      l: parseFloat(low),
      c: parseFloat(close),
      v: parseFloat(volume)
    }));
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error);
    return [];
  }
}

// Real-time price updates (WebSocket simulation with polling)
export function startPriceUpdates(callback, interval = 5000) {
  let isRunning = true;
  
  async function updatePrices() {
    if (!isRunning) return;
    
    try {
      const prices = await getAllPrices();
      const stats = await get24hrStats();
      
      const enrichedPrices = prices.map(coin => ({
        ...coin,
        ...stats[coin.s]
      }));
      
      callback(enrichedPrices);
    } catch (error) {
      console.error('Price update error:', error);
    }
    
    if (isRunning) {
      setTimeout(updatePrices, interval);
    }
  }
  
  updatePrices();
  
  return {
    stop: () => { isRunning = false; }
  };
}

// Get single symbol data with candles
export async function getSymbolData(symbol, interval = '15m') {
  try {
    const [prices, stats, candles] = await Promise.all([
      getAllPrices(),
      get24hrStats(),
      getCandlesticks(symbol, interval)
    ]);
    
    const coinData = prices.find(p => p.s === symbol);
    const symbolStats = stats[symbol];
    
    return {
      ...coinData,
      ...symbolStats,
      candles
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}
