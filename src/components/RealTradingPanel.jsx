// Real Trading Panel Component
// Execute actual trades through Binance API

import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../api/trading';

const RealTradingPanel = ({ 
  coin, 
  isAuthenticated, 
  leverage, 
  balance,
  onPositionOpened,
  onPositionClosed,
  onNotification 
}) => {
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const [realPositions, setRealPositions] = useState([]);
  const [showRealPositions, setShowRealPositions] = useState(false);

  // Fetch real positions
  useEffect(() => {
    if (isAuthenticated) {
      fetchRealPositions();
      const interval = setInterval(fetchRealPositions, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchRealPositions = async () => {
    try {
      const positions = await tradingAPI.getOpenPositions();
      setRealPositions(positions);
    } catch (error) {
      console.error('Error fetching real positions:', error);
    }
  };

  const calculateQuantity = () => {
    if (!quantity) {
      // Auto-calculate based on risk
      const riskAmount = balance * 0.02; // 2% risk
      const calculatedQty = riskAmount / (coin?.price || 1);
      return Math.max(0.001, Math.min(calculatedQty, 100)).toFixed(6);
    }
    return quantity;
  };

  const handlePlaceOrder = async (side) => {
    if (!isAuthenticated) {
      onNotification('❌ Önce trading bağlantısı yapın', 'error');
      return;
    }

    if (!coin) {
      onNotification('❌ Coin seçin', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const finalQuantity = parseFloat(quantity) || parseFloat(calculateQuantity());
      const finalPrice = orderType === 'MARKET' ? null : parseFloat(price);

      if (orderType === 'MARKET') {
        const order = await tradingAPI.placeMarketOrder(coin.s, side, finalQuantity);
        onNotification(`✅ ${side} emri gönderildi: ${coin.s} @ ${finalQuantity}`, 'success');
        onPositionOpened({
          ...order,
          symbol: coin.s,
          side,
          quantity: finalQuantity,
          type: 'MARKET',
          real: true
        });
      } else {
        const order = await tradingAPI.placeLimitOrderWithTPSL(
          coin.s, 
          side, 
          finalQuantity, 
          finalPrice,
          parseFloat(takeProfit),
          parseFloat(stopLoss)
        );
        onNotification(`✅ Limit emri gönderildi: ${coin.s} @ ${finalPrice}`, 'success');
        onPositionOpened({
          ...order,
          symbol: coin.s,
          side,
          quantity: finalQuantity,
          price: finalPrice,
          tp: parseFloat(takeProfit),
          sl: parseFloat(stopLoss),
          type: 'LIMIT',
          real: true
        });
      }

      // Reset form
      setQuantity('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      
    } catch (error) {
      onNotification(`❌ Emir hatası: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (position) => {
    try {
      await tradingAPI.cancelOrder(position.symbol, position.orderId);
      onNotification(`✅ Pozisyon kapatıldı: ${position.symbol}`, 'success');
      onPositionClosed(position);
      fetchRealPositions();
    } catch (error) {
      onNotification(`❌ Kapatma hatası: ${error.message}`, 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        background: '#161b2e',
        border: '1px solid #2b3158',
        borderRadius: 14,
        padding: 16,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
        <div style={{ color: '#848e9c', fontSize: 12 }}>
          Gerçek işlem yapmak için Ayarlar'dan trading bağlantısı yapın
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#161b2e',
      border: '1px solid #2b3158',
      borderRadius: 14,
      padding: 14
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{
          fontSize: 10,
          color: '#848e9c',
          letterSpacing: 2,
          fontWeight: 700
        }}>
          🎯 GERÇEK İŞLEM
        </div>
        <button
          onClick={() => setShowRealPositions(!showRealPositions)}
          style={{
            background: showRealPositions ? '#0ecb8115' : 'transparent',
            border: '1px solid #0ecb8144',
            borderRadius: 6,
            padding: '4px 8px',
            color: '#0ecb81',
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {realPositions.length} Pozisyon
        </button>
      </div>

      {/* Real Positions */}
      {showRealPositions && realPositions.length > 0 && (
        <div style={{
          background: '#0b0e17',
          borderRadius: 10,
          padding: 10,
          marginBottom: 12,
          maxHeight: 200,
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: 9,
            color: '#848e9c',
            marginBottom: 6,
            fontWeight: 700
          }}>
            AÇIK POZİSYONLAR
          </div>
          {realPositions.map((pos, idx) => (
            <div key={idx} style={{
              background: pos.positionAmt > 0 ? '#0ecb8110' : '#f6465d10',
              border: `1px solid ${pos.positionAmt > 0 ? '#0ecb8133' : '#f6465d33'}`,
              borderRadius: 6,
              padding: 8,
              marginBottom: 6
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: 10,
                  color: pos.positionAmt > 0 ? '#0ecb81' : '#f6465d'
                }}>
                  {pos.symbol} {pos.positionAmt > 0 ? 'LONG' : 'SHORT'}
                </span>
                <span style={{
                  fontSize: 9,
                  color: '#848e9c'
                }}>
                  {Math.abs(pos.positionAmt)} @ {pos.entryPrice}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9,
                color: '#848e9c'
              }}>
                <span>PnL: {pos.unrealizedPnl} USDT</span>
                <button
                  onClick={() => handleClosePosition(pos)}
                  style={{
                    background: '#f6465d15',
                    border: '1px solid #f6465d44',
                    borderRadius: 4,
                    padding: '2px 6px',
                    color: '#f6465d',
                    fontSize: 8,
                    cursor: 'pointer'
                  }}
                >
                  Kapat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Type Selection */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: '#848e9c',
          marginBottom: 6
        }}>
          EMİR TİPİ
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['MARKET', 'LIMIT'].map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: `1px solid ${orderType === type ? '#0ecb81' : '#2b3158'}`,
                background: orderType === type ? '#0ecb8115' : 'transparent',
                color: orderType === type ? '#0ecb81' : '#848e9c',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {type === 'MARKET' ? '🚀 Piyasa' : '📊 Limit'}
            </button>
          ))}
        </div>
      </div>

      {/* Order Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            MİKTAR ({coin?.sym || 'SEÇİN'})
          </div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={calculateQuantity()}
            step="0.001"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#eaecef',
              fontSize: 11
            }}
          />
        </div>
        
        {orderType === 'LIMIT' && (
          <div>
            <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
              FİYAT
            </div>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={coin?.price?.toFixed(4)}
              step="0.0001"
              style={{
                width: '100%',
                background: '#0b0e17',
                border: '1px solid #2b3158',
                borderRadius: 8,
                padding: '8px 10px',
                color: '#eaecef',
                fontSize: 11
              }}
            />
          </div>
        )}
      </div>

      {/* TP/SL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            KAR AL (TP)
          </div>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder={coin?.tp?.toFixed(4)}
            step="0.0001"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#eaecef',
              fontSize: 11
            }}
          />
        </div>
        
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            ZARAR DURDUR (SL)
          </div>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder={coin?.sl?.toFixed(4)}
            step="0.0001"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#eaecef',
              fontSize: 11
            }}
          />
        </div>
      </div>

      {/* Order Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          onClick={() => handlePlaceOrder('BUY')}
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: loading ? '#2b3158' : 'linear-gradient(135deg, #0ecb81, #06b6d4)',
            color: '#0b0e17',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px #0ecb8140'
          }}
        >
          {loading ? '⏳' : '🟢 ALIŞ'}
        </button>
        
        <button
          onClick={() => handlePlaceOrder('SELL')}
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: loading ? '#2b3158' : 'linear-gradient(135deg, #f6465d, #ff7060)',
            color: '#fff',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px #f6465d40'
          }}
        >
          {loading ? '⏳' : '🔴 SATIŞ'}
        </button>
      </div>

      {/* Info */}
      <div style={{
        background: '#0b0e17',
        borderRadius: 8,
        padding: '10px',
        marginTop: 8,
        fontSize: 9,
        color: '#848e9c',
        lineHeight: 1.6
      }}>
        <div>💡 <strong>Otomatik Miktar:</strong> Risk %2'si</div>
        <div>⚡ <strong>Piyasa Emri:</strong> Anında gerçekleşir</div>
        <div>📊 <strong>Limit Emri:</strong> Belirtilen fiyattan</div>
        <div>🛡️ <strong>TP/SL:</strong> Otomatik kapanış</div>
      </div>
    </div>
  );
};

export default RealTradingPanel;
