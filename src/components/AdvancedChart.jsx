// Advanced Chart Component with Ichimoku, Elliott Waves, Fibonacci
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  calculateIchimoku, 
  calculateFibonacci, 
  detectElliottWaves, 
  calculateVolumeProfile,
  analyzeMarketStructure,
  calculateAdvancedSignalScore
} from '../indicators/advanced';

const AdvancedChart = ({ 
  candles, 
  height = 400, 
  selectedIndicators = [],
  onSignalUpdate 
}) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [fibonacciLevels, setFibonacciLevels] = useState(null);
  const [selectedFibRange, setSelectedFibRange] = useState(null);

  const W = 400;
  const H = height;
  const CH = H - 60; // Chart area height (leaving space for indicators)

  // Calculate all advanced indicators
  const indicators = useMemo(() => {
    if (!candles || candles.length === 0) return {};

    const ichimoku = calculateIchimoku(candles);
    const elliott = detectElliottWaves(candles);
    const volumeProfile = calculateVolumeProfile(candles);
    const marketStructure = analyzeMarketStructure(candles);

    // Calculate Fibonacci from last major swing
    const lastCandles = candles.slice(-50);
    const high = Math.max(...lastCandles.map(c => c.h));
    const low = Math.min(...lastCandles.map(c => c.l));
    const fib = calculateFibonacci(high, low);

    return {
      ichimoku,
      elliott,
      volumeProfile,
      marketStructure,
      fibonacci: fib
    };
  }, [candles]);

  // Price scaling
  const priceRange = useMemo(() => {
    if (!candles || candles.length === 0) return { min: 0, max: 100, range: 100 };
    
    const prices = candles.flatMap(c => [c.h, c.l, c.c]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    return { min, max, range };
  }, [candles]);

  const priceToY = (price) => {
    return CH - ((price - priceRange.min) / priceRange.range) * (CH - 20);
  };

  const timeToX = (index) => {
    return (index / candles.length) * W;
  };

  // Generate Ichimoku cloud path
  const generateIchimokuCloud = () => {
    if (!selectedIndicators.includes('ichimoku') || !indicators.ichimoku) return null;

    const { senkouA, senkouB } = indicators.ichimoku;
    const cloudPath = [];
    
    for (let i = 0; i < Math.min(senkouA.length, senkouB.length); i++) {
      if (senkouA[i] !== null && senkouB[i] !== null) {
        const x = timeToX(i);
        const y1 = priceToY(senkouA[i]);
        const y2 = priceToY(senkouB[i]);
        
        cloudPath.push(`M ${x} ${y1} L ${x} ${y2}`);
      }
    }

    return cloudPath.join(' ');
  };

  // Generate Elliott wave lines
  const generateElliottWaves = () => {
    if (!selectedIndicators.includes('elliott') || !indicators.elliott) return [];

    return indicators.elliott.waves.map((wave, idx) => {
      const startX = timeToX(wave.start);
      const endX = timeToX(wave.end);
      const startY = priceToY(candles[wave.start].c);
      const endY = priceToY(candles[wave.end].c);

      return {
        key: idx,
        path: `M ${startX} ${startY} L ${endX} ${endY}`,
        color: wave.direction === 'bullish' ? '#0ecb81' : '#f6465d',
        opacity: wave.confidence / 100,
        label: `${wave.type} (${wave.confidence.toFixed(0)}%)`
      };
    });
  };

  // Generate Fibonacci lines
  const generateFibonacciLines = () => {
    if (!selectedIndicators.includes('fibonacci') || !indicators.fibonacci) return [];

    const fib = indicators.fibonacci;
    return Object.entries(fib).map(([level, price]) => {
      const y = priceToY(price);
      const isKeyLevel = ['0%', '23.6%', '38.2%', '61.8%', '100%'].includes(level);
      
      return {
        level,
        price,
        y,
        isKeyLevel,
        color: level.includes('0%') || level.includes('100%') ? '#eaecef' : '#848e9c'
      };
    });
  };

  // Generate volume profile bars
  const generateVolumeProfile = () => {
    if (!selectedIndicators.includes('volume') || !indicators.volumeProfile) return [];

    const { levels, poc } = indicators.volumeProfile;
    const maxVolume = Math.max(...levels.map(l => l.volume));

    return levels.map((level, idx) => ({
      key: idx,
      price: level.price,
      y: priceToY(level.price),
      volume: level.volume,
      percentage: level.percentage,
      width: (level.volume / maxVolume) * 30, // Max 30px width
      isPOC: poc && Math.abs(level.price - poc.price) < 0.01
    }));
  };

  // Generate support/resistance lines
  const generateStructureLines = () => {
    if (!selectedIndicators.includes('structure') || !indicators.marketStructure) return [];

    const { support, resistance } = indicators.marketStructure;
    const lines = [];

    support.forEach((level, idx) => ({
      key: `support-${idx}`,
      price: level.price,
      y: priceToY(level.price),
      type: 'support',
      strength: level.strength,
      color: '#0ecb81'
    }));

    resistance.forEach((level, idx) => ({
      key: `resistance-${idx}`,
      price: level.price,
      y: priceToY(level.price),
      type: 'resistance',
      strength: level.strength,
      color: '#f6465d'
    }));

    return lines;
  };

  // Handle chart click for Fibonacci range selection
  const handleChartClick = (e) => {
    if (!selectedIndicators.includes('fibonacci')) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const clickIndex = Math.floor((x / W) * candles.length);
    const clickPrice = candles[clickIndex]?.c;

    if (clickPrice) {
      if (!selectedFibRange) {
        setSelectedFibRange({ start: clickIndex, startPrice: clickPrice });
      } else {
        const endPrice = clickPrice;
        const high = Math.max(selectedFibRange.startPrice, endPrice);
        const low = Math.min(selectedFibRange.startPrice, endPrice);
        setFibonacciLevels(calculateFibonacci(high, low));
        setSelectedFibRange(null);
      }
    }
  };

  // Calculate advanced signal
  useEffect(() => {
    if (!candles || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const signal = calculateAdvancedSignalScore(
      lastCandle.c,
      Array(candles.length).fill(50), // Mock RSI
      { k: Array(candles.length).fill(50), d: Array(candles.length).fill(50) }, // Mock Stoch
      { macd: Array(candles.length).fill(0), signal: Array(candles.length).fill(0), hist: Array(candles.length).fill(0) }, // Mock MACD
      Array(candles.length).fill({ mid: lastCandle.c, upper: lastCandle.c * 1.02, lower: lastCandle.c * 0.98 }), // Mock BB
      { K: Array(candles.length).fill(50), D: Array(candles.length).fill(50), J: Array(candles.length).fill(50) }, // Mock KDJ
      indicators.ichimoku,
      indicators.elliott,
      indicators.volumeProfile,
      indicators.marketStructure
    );

    if (onSignalUpdate) {
      onSignalUpdate(signal);
    }
  }, [candles, indicators, onSignalUpdate]);

  const cloudPath = generateIchimokuCloud();
  const elliottWaves = generateElliottWaves();
  const fibLines = generateFibonacciLines();
  const volumeProfile = generateVolumeProfile();
  const structureLines = generateStructureLines();

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        onClick={handleChartClick}
        style={{ cursor: selectedIndicators.includes('fibonacci') ? 'crosshair' : 'default' }}
      >
        {/* Grid */}
        {[0.2, 0.4, 0.6, 0.8].map(t => (
          <line
            key={`grid-${t}`}
            x1="0"
            y1={t * CH}
            x2={W}
            y2={t * CH}
            stroke="#1c2340"
            strokeWidth="0.5"
          />
        ))}

        {/* Ichimoku Cloud */}
        {cloudPath && (
          <path
            d={cloudPath}
            fill="#0ecb8115"
            stroke="#0ecb8144"
            strokeWidth="1"
            opacity="0.3"
          />
        )}

        {/* Fibonacci Lines */}
        {fibLines.map((fib, idx) => (
          <g key={`fib-${idx}`}>
            <line
              x1="0"
              y1={fib.y}
              x2={W}
              y2={fib.y}
              stroke={fib.color}
              strokeWidth={fib.isKeyLevel ? "1" : "0.5"}
              strokeDasharray={fib.isKeyLevel ? "none" : "5,5"}
              opacity="0.7"
            />
            {fib.isKeyLevel && (
              <text
                x="5"
                y={fib.y - 2}
                fill={fib.color}
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                {fib.level}
              </text>
            )}
          </g>
        ))}

        {/* Support/Resistance Lines */}
        {structureLines.map(line => (
          <g key={line.key}>
            <line
              x1="0"
              y1={line.y}
              x2={W}
              y2={line.y}
              stroke={line.color}
              strokeWidth="1.5"
              strokeDasharray="8,4"
              opacity={line.strength / 100}
            />
            <text
              x={W - 40}
              y={line.y - 2}
              fill={line.color}
              fontSize="8"
              fontFamily="JetBrains Mono, monospace"
              opacity={line.strength / 100}
            >
              {line.type === 'support' ? 'S' : 'R'} {line.strength.toFixed(0)}%
            </text>
          </g>
        ))}

        {/* Elliott Waves */}
        {elliottWaves.map(wave => (
          <g key={wave.key}>
            <path
              d={wave.path}
              stroke={wave.color}
              strokeWidth="2"
              fill="none"
              opacity={wave.opacity}
            />
            <text
              x={(timeToX(wave.end) + timeToX(wave.start)) / 2}
              y={priceToY(candles[wave.end].c) - 10}
              fill={wave.color}
              fontSize="7"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              opacity={wave.opacity}
            >
              {wave.label}
            </text>
          </g>
        ))}

        {/* Volume Profile */}
        {volumeProfile.map(vp => (
          <g key={vp.key}>
            <rect
              x={W - vp.width - 5}
              y={vp.y - 2}
              width={vp.width}
              height="4"
              fill={vp.isPOC ? '#0ecb81' : '#848e9c'}
              opacity={0.6}
            />
            {vp.isPOC && (
              <text
                x={W - vp.width - 8}
                y={vp.y + 6}
                fill="#0ecb81"
                fontSize="7"
                fontFamily="JetBrains Mono, monospace"
              >
                POC
              </text>
            )}
          </g>
        ))}

        {/* Candlesticks (simplified) */}
        {candles.slice(-60).map((candle, i) => {
          const x = timeToX(candles.length - 60 + i);
          const isGreen = candle.c >= candle.o;
          const bodyTop = priceToY(Math.max(candle.o, candle.c));
          const bodyHeight = Math.abs(priceToY(candle.o) - priceToY(candle.c));
          const wickTop = priceToY(candle.h);
          const wickBottom = priceToY(candle.l);

          return (
            <g key={i}>
              <line
                x={x}
                y1={wickTop}
                y2={wickBottom}
                stroke={isGreen ? '#0ecb81' : '#f6465d'}
                strokeWidth="0.8"
              />
              <rect
                x={x - 1}
                y={Math.min(bodyTop, priceToY(candle.c))}
                width="2"
                height={Math.max(1, bodyHeight)}
                fill={isGreen ? '#0ecb81' : '#f6465d'}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: '#0b0e17dd',
        border: '1px solid #2b3158',
        borderRadius: 8,
        padding: 8,
        fontSize: 8,
        color: '#848e9c'
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#eaecef' }}>İNDİKATÖRLER</div>
        {[
          { key: 'ichimoku', label: 'Ichimoku', color: '#0ecb81' },
          { key: 'elliott', label: 'Elliott', color: '#a78bfa' },
          { key: 'fibonacci', label: 'Fibonacci', color: '#f0b90b' },
          { key: 'volume', label: 'Volume', color: '#06b6d4' },
          { key: 'structure', label: 'Structure', color: '#f6465d' }
        ].map(ind => (
          <div
            key={ind.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 2,
              opacity: selectedIndicators.includes(ind.key) ? 1 : 0.3
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                background: ind.color,
                borderRadius: 2
              }}
            />
            <span>{ind.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedChart;
