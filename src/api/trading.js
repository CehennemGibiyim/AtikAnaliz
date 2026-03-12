// Binance Trading API Integration
// Real position management with authentication

import { fetchWithProxy } from './cors-proxy';

const BASE_URL = 'https://api.binance.com';

// Trading configuration
class TradingAPI {
  constructor() {
    this.apiKey = '';
    this.secretKey = '';
    this.testnet = true; // Default to testnet for safety
  }

  // Set API credentials
  setCredentials(apiKey, secretKey, testnet = true) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.testnet = testnet;
  }

  // Generate signature for authenticated requests
  generateSignature(queryString) {
    // Browser-compatible HMAC-SHA256 implementation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secretKey);
    const messageData = encoder.encode(queryString);
    
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => {
      return crypto.subtle.sign(
        'HMAC',
        key,
        messageData
      );
    }).then(signature => {
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });
  }

  // Get account information
  async getAccountInfo() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await this.generateSignature(queryString);
      
      const response = await fetchWithProxy(
        `${BASE_URL}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  // Get open positions (Futures)
  async getOpenPositions() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v2/positionRisk?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const positions = await response.json();
      return positions.filter(pos => parseFloat(pos.positionAmt) !== 0);
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  // Place a new order
  async placeOrder(symbol, side, type, quantity, price = null, stopPrice = null, timeInForce = 'GTC') {
    try {
      const timestamp = Date.now();
      let orderParams = {
        symbol: `${symbol}USDT`,
        side: side.toUpperCase(), // BUY or SELL
        type: type.toUpperCase(), // MARKET, LIMIT, STOP
        quantity: quantity.toString(),
        timestamp: timestamp
      };

      // Add optional parameters
      if (price) orderParams.price = price.toString();
      if (stopPrice) orderParams.stopPrice = stopPrice.toString();
      if (type.toUpperCase() === 'LIMIT') orderParams.timeInForce = timeInForce;

      const queryString = new URLSearchParams(orderParams).toString();
      const signature = this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`,
        {
          method: 'POST',
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Order Error: ${errorData.msg || response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Place market order
  async placeMarketOrder(symbol, side, quantity) {
    return this.placeOrder(symbol, side, 'MARKET', quantity);
  }

  // Place limit order with TP/SL
  async placeLimitOrderWithTPSL(symbol, side, quantity, price, takeProfit, stopLoss) {
    try {
      // Main limit order
      const mainOrder = await this.placeOrder(symbol, side, 'LIMIT', quantity, price);
      
      // Take profit order
      const tpSide = side === 'BUY' ? 'SELL' : 'BUY';
      await this.placeOrder(symbol, tpSide, 'LIMIT', quantity, takeProfit);
      
      // Stop loss order
      await this.placeOrder(symbol, tpSide, 'STOP', quantity, null, stopLoss);
      
      return mainOrder;
    } catch (error) {
      console.error('Error placing TP/SL order:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(symbol, orderId) {
    try {
      const timestamp = Date.now();
      const queryString = `symbol=${symbol}USDT&orderId=${orderId}&timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`,
        {
          method: 'DELETE',
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Cancel Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  // Get order status
  async getOrderStatus(symbol, orderId) {
    try {
      const timestamp = Date.now();
      const queryString = `symbol=${symbol}USDT&orderId=${orderId}&timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Status Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  // Get leverage brackets
  async getLeverageBrackets() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v1/leverageBracket?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Leverage Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching leverage brackets:', error);
      throw error;
    }
  }

  // Change leverage
  async changeLeverage(symbol, leverage) {
    try {
      const timestamp = Date.now();
      const queryString = `symbol=${symbol}USDT&leverage=${leverage}&timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const baseUrl = this.testnet ? 
        'https://testnet.binancefuture.com' : 
        'https://fapi.binance.com';
      
      const response = await fetchWithProxy(
        `${baseUrl}/fapi/v1/leverage?${queryString}&signature=${signature}`,
        {
          method: 'POST',
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Leverage Change Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error changing leverage:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tradingAPI = new TradingAPI();
export default tradingAPI;
