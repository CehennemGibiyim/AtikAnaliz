// CORS Proxy for Binance API (if needed)
// This helps with browser CORS issues when calling Binance API directly

export const PROXY_URLS = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

export async function fetchWithProxy(url, options = {}) {
  // Try direct fetch first (might work in production)
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
  } catch (error) {
    console.log('Direct fetch failed, trying proxy...');
  }

  // Try proxy servers
  for (const proxy of PROXY_URLS) {
    try {
      const proxyUrl = proxy + url;
      const response = await fetch(proxyUrl, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        }
      });
      
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log(`Proxy ${proxy} failed:`, error.message);
      continue;
    }
  }

  throw new Error('All proxy attempts failed');
}
