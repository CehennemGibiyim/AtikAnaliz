// Risk Management Component
// Advanced risk controls and position sizing

import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../api/trading';

const RiskManager = ({ 
  isAuthenticated, 
  balance, 
  leverage,
  onRiskUpdate,
  onAlert 
}) => {
  const [riskSettings, setRiskSettings] = useState({
    maxRiskPercent: 2.0,        // Max risk per trade
    maxDailyLoss: 10.0,        // Max daily loss %
    maxOpenPositions: 5,        // Max concurrent positions
    maxLeverage: 20,           // Max allowed leverage
    stopLossPercent: 2.0,       // Auto SL %
    takeProfitPercent: 4.0,     // Auto TP %
    trailingStop: false,          // Trailing stop enabled
    trailingStopPercent: 1.0      // Trailing stop %
  });

  const [dailyStats, setDailyStats] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    winningTrades: 0,
    maxDrawdown: 0,
    currentDrawdown: 0
  });

  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState([]);

  // Calculate risk score
  useEffect(() => {
    if (!isAuthenticated) return;

    const score = calculateRiskScore();
    setRiskScore(score);
    onRiskUpdate(score);

    // Check for risk alerts
    checkRiskAlerts(score);
  }, [riskSettings, dailyStats, isAuthenticated]);

  const calculateRiskScore = () => {
    let score = 100; // Start with perfect score

    // Risk per trade penalty
    if (riskSettings.maxRiskPercent > 3) score -= 20;
    else if (riskSettings.maxRiskPercent > 2) score -= 10;

    // Daily loss penalty
    if (dailyStats.currentDrawdown > riskSettings.maxDailyLoss) score -= 30;
    else if (dailyStats.currentDrawdown > riskSettings.maxDailyLoss * 0.8) score -= 15;

    // Leverage penalty
    if (leverage > riskSettings.maxLeverage) score -= 25;
    else if (leverage > riskSettings.maxLeverage * 0.8) score -= 10;

    // Win rate penalty
    if (dailyStats.totalTrades > 10 && dailyStats.winRate < 40) score -= 20;
    else if (dailyStats.totalTrades > 10 && dailyStats.winRate < 50) score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const checkRiskAlerts = (score) => {
    const newAlerts = [];

    if (score < 30) {
      newAlerts.push({
        type: 'critical',
        message: '🚨 KRİTİK RİSK: Risk seviyesi çok yüksek!',
        color: '#f6465d'
      });
    } else if (score < 50) {
      newAlerts.push({
        type: 'warning',
        message: '⚠️ YÜKSEK RİSK: Risk ayarlarını gözden geçirin',
        color: '#f0b90b'
      });
    }

    if (dailyStats.currentDrawdown > riskSettings.maxDailyLoss) {
      newAlerts.push({
        type: 'daily_loss',
        message: `📉 GÜNLÜK ZARAR LİMİTİ: ${dailyStats.currentDrawdown.toFixed(1)}%`,
        color: '#f6465d'
      });
    }

    if (leverage > riskSettings.maxLeverage) {
      newAlerts.push({
        type: 'leverage',
        message: `⚡ KALDIRAÇ LİMİTİ: ${leverage}x > ${riskSettings.maxLeverage}x`,
        color: '#f0b90b'
      });
    }

    setAlerts(newAlerts);
    newAlerts.forEach(alert => onAlert(alert));
  };

  const calculatePositionSize = (entryPrice, stopLossPrice) => {
    const riskAmount = balance * (riskSettings.maxRiskPercent / 100);
    const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
    const positionSize = riskAmount / (riskPerUnit * leverage);
    
    return {
      size: Math.max(0.001, positionSize),
      risk: riskAmount,
      riskPercent: riskSettings.maxRiskPercent
    };
  };

  const calculateAutoSL = (entryPrice, side) => {
    const slPercent = riskSettings.stopLossPercent / 100;
    return side === 'LONG' 
      ? entryPrice * (1 - slPercent)
      : entryPrice * (1 + slPercent);
  };

  const calculateAutoTP = (entryPrice, side) => {
    const tpPercent = riskSettings.takeProfitPercent / 100;
    return side === 'LONG'
      ? entryPrice * (1 + tpPercent)
      : entryPrice * (1 - tpPercent);
  };

  const updateRiskSetting = (key, value) => {
    setRiskSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRiskLevel = () => {
    if (riskScore >= 80) return { label: 'GÜVENLİ', color: '#0ecb81' };
    if (riskScore >= 60) return { label: 'DİKKAT', color: '#f0b90b' };
    if (riskScore >= 40) return { label: 'RİSKLİ', color: '#f6465d' };
    return { label: 'TEHLİKELİ', color: '#ff4444' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div style={{
      background: '#161b2e',
      border: '1px solid #2b3158',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12
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
          🛡️ RİSK YÖNETİMİ
        </div>
        <div style={{
          background: `${riskLevel.color}15`,
          border: `1px solid ${riskLevel.color}40`,
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 10,
          fontWeight: 800,
          color: riskLevel.color
        }}>
          {riskLevel.label}
        </div>
      </div>

      {/* Risk Score */}
      <div style={{
        background: '#0b0e17',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12
      }}>
        <div style={{
          fontSize: 9,
          color: '#848e9c',
          marginBottom: 6
        }}>
          RİSK SKORU
        </div>
        <div style={{
          fontSize: 32,
          fontWeight: 900,
          color: riskLevel.color,
          fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center'
        }}>
          {riskScore}
        </div>
        <div style={{
          height: 6,
          background: '#1c2340',
          borderRadius: 3,
          overflow: 'hidden',
          marginTop: 8
        }}>
          <div style={{
            height: '100%',
            width: `${riskScore}%`,
            background: `linear-gradient(90deg, ${riskLevel.color}88, ${riskLevel.color})`,
            borderRadius: 3,
            transition: 'width 0.5s'
          }} />
        </div>
      </div>

      {/* Risk Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: '#f6465d10',
          border: '1px solid #f6465d33',
          borderRadius: 10,
          padding: 10,
          marginBottom: 12
        }}>
          <div style={{
            fontSize: 9,
            color: '#f6465d',
            fontWeight: 700,
            marginBottom: 6
          }}>
            ⚠️ RİKAR UYARILARI
          </div>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{
              fontSize: 10,
              color: alert.color,
              marginBottom: 4,
              lineHeight: 1.4
            }}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Risk Settings */}
      <div style={{
        fontSize: 9,
        color: '#848e9c',
        fontWeight: 700,
        marginBottom: 8
      }}>
        RİSK AYARLARI
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Max Risk / İşlem (%)
          </div>
          <input
            type="number"
            value={riskSettings.maxRiskPercent}
            onChange={(e) => updateRiskSetting('maxRiskPercent', parseFloat(e.target.value))}
            min="0.1"
            max="10"
            step="0.1"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
        
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Max Günlük Zarar (%)
          </div>
          <input
            type="number"
            value={riskSettings.maxDailyLoss}
            onChange={(e) => updateRiskSetting('maxDailyLoss', parseFloat(e.target.value))}
            min="1"
            max="50"
            step="0.5"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Max Açık Pozisyon
          </div>
          <input
            type="number"
            value={riskSettings.maxOpenPositions}
            onChange={(e) => updateRiskSetting('maxOpenPositions', parseInt(e.target.value))}
            min="1"
            max="20"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
        
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Max Kaldıraç
          </div>
          <input
            type="number"
            value={riskSettings.maxLeverage}
            onChange={(e) => updateRiskSetting('maxLeverage', parseInt(e.target.value))}
            min="1"
            max="125"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Auto Stop Loss (%)
          </div>
          <input
            type="number"
            value={riskSettings.stopLossPercent}
            onChange={(e) => updateRiskSetting('stopLossPercent', parseFloat(e.target.value))}
            min="0.1"
            max="10"
            step="0.1"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
        
        <div>
          <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 4 }}>
            Auto Take Profit (%)
          </div>
          <input
            type="number"
            value={riskSettings.takeProfitPercent}
            onChange={(e) => updateRiskSetting('takeProfitPercent', parseFloat(e.target.value))}
            min="0.5"
            max="20"
            step="0.1"
            style={{
              width: '100%',
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#eaecef',
              fontSize: 10
            }}
          />
        </div>
      </div>

      {/* Info Panel */}
      <div style={{
        background: '#0b0e17',
        borderRadius: 10,
        padding: 12,
        fontSize: 9,
        color: '#848e9c',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 6 }}>
          <strong>💡 Risk Hesaplama:</strong>
        </div>
        <div>• Max Risk: ${((balance * riskSettings.maxRiskPercent) / 100).toFixed(2)} / işlem</div>
        <div>• Max Günlük Zarar: ${((balance * riskSettings.maxDailyLoss) / 100).toFixed(2)}</div>
        <div>• Önerilen Pozisyon: Auto hesaplanır</div>
        <div>• SL/TP: Otomatik ekle</div>
      </div>
    </div>
  );
};

export default RiskManager;
