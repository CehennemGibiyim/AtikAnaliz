// Authentication Settings Component
// API key management and trading configuration

import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../api/trading';

const AuthSettings = ({ onAuthChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [testnet, setTestnet] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  // Load saved credentials
  useEffect(() => {
    const savedApiKey = localStorage.getItem('binance_api_key');
    const savedSecret = localStorage.getItem('binance_secret_key');
    const savedTestnet = localStorage.getItem('binance_testnet');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSecret) setSecretKey(savedSecret);
    if (savedTestnet) setTestnet(JSON.parse(savedTestnet));
    
    if (savedApiKey && savedSecret) {
      handleConnect();
    }
  }, []);

  const handleConnect = async () => {
    if (!apiKey || !secretKey) {
      setError('API Key ve Secret Key gereklidir');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set credentials
      tradingAPI.setCredentials(apiKey, secretKey, testnet);
      
      // Test connection
      const accountData = await tradingAPI.getAccountInfo();
      
      // Save credentials
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_secret_key', secretKey);
      localStorage.setItem('binance_testnet', JSON.stringify(testnet));
      
      setIsAuthenticated(true);
      setAccountInfo(accountData);
      onAuthChange(true);
      
    } catch (err) {
      setError(`Bağlantı hatası: ${err.message}`);
      setIsAuthenticated(false);
      setAccountInfo(null);
      onAuthChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('binance_api_key');
    localStorage.removeItem('binance_secret_key');
    localStorage.removeItem('binance_testnet');
    
    setApiKey('');
    setSecretKey('');
    setIsAuthenticated(false);
    setAccountInfo(null);
    onAuthChange(false);
  };

  return (
    <div style={{
      background: '#161b2e',
      border: '1px solid #2b3158',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12
    }}>
      <div style={{
        fontSize: 10,
        color: '#848e9c',
        letterSpacing: 2,
        marginBottom: 10,
        fontWeight: 700
      }}>
        📡 TRADING BAĞLANTISI
      </div>

      {isAuthenticated ? (
        <div>
          {/* Connected State */}
          <div style={{
            background: '#0ecb8110',
            border: '1px solid #0ecb8133',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#0ecb81'
              }}>
                ✅ Bağlandı
              </span>
              <span style={{
                fontSize: 9,
                background: testnet ? '#f0b90b20' : '#0ecb8120',
                color: testnet ? '#f0b90b' : '#0ecb81',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}>
                {testnet ? 'TESTNET' : 'LIVE'}
              </span>
            </div>
            
            {accountInfo && (
              <div style={{ fontSize: 10, color: '#848e9c', lineHeight: 1.6 }}>
                <div>API Key: {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}</div>
                <div>Hesap Türü: {accountInfo.accountType || 'Futures'}</div>
                <div>Bakiye: {accountInfo.totalWalletBalance || 'Bilinmiyor'} USDT</div>
              </div>
            )}
          </div>

          <button
            onClick={handleDisconnect}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              border: '1px solid #f6465d44',
              background: '#f6465d15',
              color: '#f6465d',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            🔌 Bağlantıyı Kes
          </button>
        </div>
      ) : (
        <div>
          {/* Login Form */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 9,
              color: '#848e9c',
              marginBottom: 4
            }}>
              API KEY
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Binance API Key..."
              style={{
                width: '100%',
                background: '#0b0e17',
                border: '1px solid #2b3158',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#eaecef',
                fontSize: 11,
                fontFamily: 'Nunito, sans-serif',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 9,
              color: '#848e9c',
              marginBottom: 4
            }}>
              SECRET KEY
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showSecret ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Binance Secret Key..."
                style={{
                  width: '100%',
                  background: '#0b0e17',
                  border: '1px solid #2b3158',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#eaecef',
                  fontSize: 11,
                  fontFamily: 'Nunito, sans-serif',
                  outline: 'none',
                  paddingRight: '40px'
                }}
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#848e9c',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {showSecret ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <input
                type="checkbox"
                id="testnet"
                checked={testnet}
                onChange={(e) => setTestnet(e.target.checked)}
                style={{ accentColor: '#0ecb81' }}
              />
              <label htmlFor="testnet" style={{
                fontSize: 10,
                color: '#848e9c',
                cursor: 'pointer'
              }}>
                Testnet Modu (Güvenli Test)
              </label>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#f6465d10',
              border: '1px solid #f6465d33',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12,
              fontSize: 10,
              color: '#f6465d'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: loading ? '#2b3158' : 'linear-gradient(135deg, #0ecb81, #06b6d4)',
              color: '#0b0e17',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px #0ecb8140'
            }}
          >
            {loading ? '🔄 Bağlanıyor...' : '🔗 Bağlan'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthSettings;
