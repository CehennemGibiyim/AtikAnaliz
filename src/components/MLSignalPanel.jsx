// ML Signal Enhancement Panel
// Display AI/ML optimized signals and performance analytics

import React, { useState, useEffect } from 'react';
import { mlOptimizer } from '../ml/signalOptimizer';

const MLSignalPanel = ({ 
  coins, 
  selectedCoin, 
  isAuthenticated,
  onSignalUpdate 
}) => {
  const [mlSignals, setMlSignals] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [topStrategies, setTopStrategies] = useState([]);
  const [learningMode, setLearningMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Update ML signals when coins change
  useEffect(() => {
    if (!coins || coins.length === 0) return;

    const optimizedSignals = coins.map(coin => {
      // Create base signal from existing analysis
      const baseSignal = {
        symbol: coin.s,
        indicator: coin.indicator || 'STOCHRSI',
        interval: coin.interval || '15m',
        direction: coin.dir,
        confidence: coin.conf,
        price: coin.price,
        candles: coin.candles || []
      };

      // Optimize with ML
      const optimizedSignal = mlOptimizer.optimizeSignal(baseSignal, coin.candles || []);
      return {
        ...coin,
        ...optimizedSignal,
        originalConfidence: coin.conf,
        mlEnhanced: true
      };
    });

    setMlSignals(optimizedSignals);

    // Notify parent of best signal
    const bestSignal = optimizedSignals.reduce((best, current) => 
      current.mlScore > best.mlScore ? current : best
    , optimizedSignals[0]);

    if (onSignalUpdate && bestSignal) {
      onSignalUpdate(bestSignal);
    }

  }, [coins, onSignalUpdate]);

  // Load performance data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const data = mlOptimizer.exportPerformanceData();
      setPerformanceData(data);
      setTopStrategies(data.topStrategies);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRecordOutcome = (signal, outcome) => {
    mlOptimizer.recordOutcome(signal, outcome);
    // Refresh performance data
    const data = mlOptimizer.exportPerformanceData();
    setPerformanceData(data);
    setTopStrategies(data.topStrategies);
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      'LOW': '#0ecb81',
      'MEDIUM': '#f0b90b',
      'HIGH': '#f6465d',
      'VERY_HIGH': '#ff4444'
    };
    return colors[level] || '#848e9c';
  };

  const getMLScoreColor = (score) => {
    if (score >= 80) return '#0ecb81';
    if (score >= 70) return '#0ecb8199';
    if (score >= 60) return '#f0b90b';
    if (score >= 50) return '#f0b90b99';
    return '#f6465d';
  };

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
          🤖 AI/ML SİNYAL GELİŞTİRME
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: showDetails ? '#a78bfa15' : 'transparent',
            border: '1px solid #a78bfa44',
            borderRadius: 6,
            padding: '4px 8px',
            color: '#a78bfa',
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {showDetails ? 'Basit' : 'Detay'}
        </button>
      </div>

      {/* ML Enhanced Signals */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 9,
          color: '#848e9c',
          fontWeight: 700,
          marginBottom: 6
        }}>
          🎯 ML OPTİMİZE EDİLMİŞ SİNYALLAR
        </div>
        
        {mlSignals.slice(0, 5).map((signal, idx) => (
          <div key={signal.s} style={{
            background: '#0b0e17',
            border: '1px solid #2b3158',
            borderRadius: 10,
            padding: 10,
            marginBottom: 6
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 6
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 2
                }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#eaecef'
                  }}>
                    {signal.sym}
                  </span>
                  <span style={{
                    background: signal.dir === 'LONG' ? '#0ecb8115' : '#f6465d15',
                    color: signal.dir === 'LONG' ? '#0ecb81' : '#f6465d',
                    border: `1px solid ${signal.dir === 'LONG' ? '#0ecb8140' : '#f6465d40'}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 9,
                    fontWeight: 700
                  }}>
                    {signal.dir}
                  </span>
                </div>
                
                {signal.mlEnhanced && (
                  <div style={{
                    background: '#a78bfa10',
                    border: '1px solid #a78bfa33',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 8,
                    color: '#a78bfa',
                    fontWeight: 700
                  }}>
                    AI
                  </div>
                )}
              </div>
              
              <div style={{
                fontSize: 10,
                color: '#848e9c',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                ${signal.price > 1 ? signal.price.toFixed(4) : signal.price.toFixed(5)}
              </div>
            </div>

            {/* ML Score and Confidence */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 9, color: '#848e9c' }}>ML Skor:</div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: getMLScoreColor(signal.mlScore),
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {signal.mlScore?.toFixed(0) || '--'}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 9, color: '#848e9c' }}>Güven:</div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: signal.confidence > 70 ? '#0ecb81' : signal.confidence > 50 ? '#f0b90b' : '#f6465d',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {signal.confidence?.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* ML Recommendation */}
            {signal.recommendation && (
              <div style={{
                background: `${getRiskLevelColor(signal.recommendation.riskLevel)}15`,
                border: `1px solid ${getRiskLevelColor(signal.recommendation.riskLevel)}40`,
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 9,
                color: getRiskLevelColor(signal.recommendation.riskLevel),
                fontWeight: 700,
                marginBottom: 4
              }}>
                🤖 {signal.recommendation.action}
              </div>
            )}

            {/* Performance Comparison */}
            {showDetails && signal.historicalWinRate && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
                fontSize: 8,
                color: '#848e9c',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <div>Win Rate: {signal.historicalWinRate?.toFixed(1)}%</div>
                <div>Profit: {signal.historicalProfitFactor?.toFixed(2)}x</div>
                <div>Samples: {signal.samples}</div>
              </div>
            )}

            {/* ML vs Original Comparison */}
            {showDetails && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 8,
                color: '#848e9c'
              }}>
                <span>Orijinal: {signal.originalConfidence}%</span>
                <span>→</span>
                <span style={{ 
                  color: signal.confidence > signal.originalConfidence ? '#0ecb81' : '#f6465d',
                  fontWeight: 700
                }}>
                  {signal.confidence > signal.originalConfidence ? '+' : ''}{(signal.confidence - signal.originalConfidence).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Performing Strategies */}
      {showDetails && topStrategies.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 9,
            color: '#848e9c',
            fontWeight: 700,
            marginBottom: 6
          }}>
            📈 EN İYİ PERFORMANSLI STRATEJİLER
          </div>
          
          {topStrategies.slice(0, 3).map((strategy, idx) => (
            <div key={strategy.key} style={{
              background: '#0b0e17',
              border: '1px solid #2b3158',
              borderRadius: 8,
              padding: 8,
              marginBottom: 4
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 9,
                color: '#eaecef',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span>{strategy.key}</span>
                <span>Skor: {strategy.score?.toFixed(1)}</span>
                <span>Win: {strategy.winRate?.toFixed(1)}%</span>
                <span>Örnek: {strategy.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Controls */}
      <div style={{
        background: '#0b0e17',
        borderRadius: 10,
        padding: 12,
        fontSize: 9,
        color: '#848e9c',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 6 }}>
          <strong>🧠 Öğrenme Modu:</strong> {learningMode ? 'AKTİF' : 'PASİF'}
        </div>
        <div style={{ marginBottom: 6 }}>
          <button
            onClick={() => setLearningMode(!learningMode)}
            disabled={!isAuthenticated}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #a78bfa44',
              background: learningMode ? '#a78bfa15' : 'transparent',
              color: learningMode ? '#a78bfa' : '#a78bfa',
              fontSize: 9,
              fontWeight: 700,
              cursor: isAuthenticated ? 'pointer' : 'not-allowed',
              marginRight: 8
            }}
          >
            {learningMode ? 'Durdur' : 'Başlat'}
          </button>
          
          {learningMode && (
            <span style={{ color: '#0ecb81' }}>
              Sinyal sonuçları kaydediliyor...
            </span>
          )}
        </div>
        
        <div>
          <strong>💡 ML Avantajları:</strong>
        </div>
        <div>• Tarihsel performans analizi</div>
        <div>• Piyasa koşullarına adaptasyon</div>
        <div>• Neural pattern tanıma</div>
        <div>• Otomatik risk ayarı</div>
      </div>
    </div>
  );
};

export default MLSignalPanel;
