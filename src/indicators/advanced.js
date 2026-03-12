// Advanced Technical Indicators
// Ichimoku Cloud, Elliott Waves, Fibonacci Retracement

// Ichimoku Cloud Calculation
export function calculateIchimoku(candles, tenkanPeriod = 9, kijunPeriod = 26, senkouSpanBPeriod = 52, displacement = 26) {
  if (candles.length < senkouSpanBPeriod) return { tenkan: [], kijun: [], senkouA: [], senkouB: [], chikou: [] };

  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);

  // Tenkan-sen (Conversion Line)
  const tenkan = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < tenkanPeriod - 1) {
      tenkan.push(null);
    } else {
      const high = Math.max(...highs.slice(i - tenkanPeriod + 1, i + 1));
      const low = Math.min(...lows.slice(i - tenkanPeriod + 1, i + 1));
      tenkan.push((high + low) / 2);
    }
  }

  // Kijun-sen (Base Line)
  const kijun = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < kijunPeriod - 1) {
      kijun.push(null);
    } else {
      const high = Math.max(...highs.slice(i - kijunPeriod + 1, i + 1));
      const low = Math.min(...lows.slice(i - kijunPeriod + 1, i + 1));
      kijun.push((high + low) / 2);
    }
  }

  // Senkou Span A (Leading Span A)
  const senkouA = [];
  for (let i = 0; i < tenkan.length; i++) {
    if (tenkan[i] === null || kijun[i] === null) {
      senkouA.push(null);
    } else {
      senkouA.push((tenkan[i] + kijun[i]) / 2);
    }
  }

  // Senkou Span B (Leading Span B)
  const senkouB = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < senkouSpanBPeriod - 1) {
      senkouB.push(null);
    } else {
      const high = Math.max(...highs.slice(i - senkouSpanBPeriod + 1, i + 1));
      const low = Math.min(...lows.slice(i - senkouSpanBPeriod + 1, i + 1));
      senkouB.push((high + low) / 2);
    }
  }

  // Chikou Span (Lagging Span)
  const chikou = closes.map((close, i) => {
    return i < displacement ? null : closes[i - displacement];
  });

  return {
    tenkan,
    kijun,
    senkouA: senkouA.map((val, i) => i < displacement ? null : val),
    senkouB: senkouB.map((val, i) => i < displacement ? null : val),
    chikou
  };
}

// Fibonacci Retracement Levels
export function calculateFibonacci(high, low, trend = 'up') {
  const diff = high - low;
  const levels = {
    '0%': trend === 'up' ? high : low,
    '23.6%': trend === 'up' ? high - diff * 0.236 : low + diff * 0.236,
    '38.2%': trend === 'up' ? high - diff * 0.382 : low + diff * 0.382,
    '50%': (high + low) / 2,
    '61.8%': trend === 'up' ? high - diff * 0.618 : low + diff * 0.618,
    '78.6%': trend === 'up' ? high - diff * 0.786 : low + diff * 0.786,
    '100%': trend === 'up' ? low : high
  };

  return levels;
}

// Elliott Wave Pattern Recognition (Simplified)
export function detectElliottWaves(candles, minWaveLength = 5) {
  if (candles.length < minWaveLength * 3) return { waves: [], confidence: 0 };

  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  
  const waves = [];
  
  // Find potential impulse waves (5-wave pattern)
  for (let i = minWaveLength; i < closes.length - minWaveLength * 2; i++) {
    const wave1 = closes.slice(i - minWaveLength, i);
    const wave2 = closes.slice(i, i + minWaveLength);
    const wave3 = closes.slice(i + minWaveLength, i + minWaveLength * 2);
    
    // Check for 5-wave pattern criteria
    const wave1High = Math.max(...wave1);
    const wave1Low = Math.min(...wave1);
    const wave2High = Math.max(...wave2);
    const wave2Low = Math.min(...wave2);
    const wave3High = Math.max(...wave3);
    const wave3Low = Math.min(...wave3);
    
    // Simplified Elliott wave rules
    if (
      wave2High > wave1High && // Wave 2 doesn't exceed wave 1
      wave3High > wave2High && // Wave 3 exceeds wave 2
      wave2Low > wave1Low && // Wave 2 retraces less than 100% of wave 1
      wave3Low > wave2Low    // Wave 3 retraces less than 100% of wave 2
    ) {
      waves.push({
        start: i - minWaveLength,
        end: i + minWaveLength * 2,
        type: 'impulse',
        direction: 'bullish',
        confidence: calculateWaveConfidence(wave1, wave2, wave3)
      });
    }
  }

  // Find corrective waves (3-wave pattern)
  for (let i = minWaveLength; i < closes.length - minWaveLength; i++) {
    const waveA = closes.slice(i - minWaveLength, i);
    const waveB = closes.slice(i, i + minWaveLength);
    const waveC = closes.slice(i + minWaveLength, i + minWaveLength * 2);
    
    const waveAHigh = Math.max(...waveA);
    const waveALow = Math.min(...waveA);
    const waveBHigh = Math.max(...waveB);
    const waveBLow = Math.min(...waveB);
    const waveCHigh = Math.max(...waveC);
    const waveCLow = Math.min(...waveC);
    
    // Corrective wave pattern
    if (
      waveBHigh < waveAHigh && // Wave B doesn't exceed wave A
      waveCHigh < waveAHigh && // Wave C doesn't exceed wave A
      waveBLow > waveALow * 0.382 && // Wave B retraces at least 38.2%
      waveCLow < waveALow * 0.618   // Wave C retraces at least 61.8%
    ) {
      waves.push({
        start: i - minWaveLength,
        end: i + minWaveLength * 2,
        type: 'corrective',
        direction: 'bearish',
        confidence: calculateWaveConfidence(waveA, waveB, waveC)
      });
    }
  }

  const avgConfidence = waves.length > 0 
    ? waves.reduce((sum, wave) => sum + wave.confidence, 0) / waves.length 
    : 0;

  return {
    waves: waves.slice(-5), // Return last 5 detected waves
    confidence: avgConfidence,
    currentWave: waves.length > 0 ? waves[waves.length - 1] : null
  };
}

function calculateWaveConfidence(wave1, wave2, wave3) {
  const wave1Range = Math.max(...wave1) - Math.min(...wave1);
  const wave2Range = Math.max(...wave2) - Math.min(...wave2);
  const wave3Range = Math.max(...wave3) - Math.min(...wave3);
  
  // Confidence based on wave consistency and proportion
  const avgRange = (wave1Range + wave2Range + wave3Range) / 3;
  const consistency = 1 - (Math.abs(wave1Range - avgRange) + 
                           Math.abs(wave2Range - avgRange) + 
                           Math.abs(wave3Range - avgRange)) / (3 * avgRange);
  
  return Math.max(0, Math.min(100, consistency * 100));
}

// Volume Profile Analysis
export function calculateVolumeProfile(candles, priceLevels = 50) {
  if (candles.length === 0) return { levels: [], poc: null, vah: null, val: null };

  const high = Math.max(...candles.map(c => c.h));
  const low = Math.min(...candles.map(c => c.l));
  const priceRange = high - low;
  const levelSize = priceRange / priceLevels;

  // Create price levels
  const levels = [];
  for (let i = 0; i < priceLevels; i++) {
    const levelLow = low + (i * levelSize);
    const levelHigh = levelLow + levelSize;
    const levelPrice = (levelLow + levelHigh) / 2;
    
    // Calculate volume at this level
    let volumeAtLevel = 0;
    candles.forEach(candle => {
      if (candle.c >= levelLow && candle.c <= levelHigh) {
        volumeAtLevel += candle.v;
      }
    });

    levels.push({
      price: levelPrice,
      low: levelLow,
      high: levelHigh,
      volume: volumeAtLevel,
      percentage: 0 // Will be calculated below
    });
  }

  // Calculate percentages
  const totalVolume = levels.reduce((sum, level) => sum + level.volume, 0);
  levels.forEach(level => {
    level.percentage = totalVolume > 0 ? (level.volume / totalVolume) * 100 : 0;
  });

  // Find POC (Point of Control) - highest volume level
  const poc = levels.reduce((max, level) => 
    level.volume > max.volume ? level : max, levels[0]);

  // Find VAH (Value Area High) and VAL (Value Area Low) - 70% of volume
  const sortedLevels = [...levels].sort((a, b) => b.volume - a.volume);
  let cumulativeVolume = 0;
  const targetVolume = totalVolume * 0.7;
  let vah = null;
  let val = null;

  for (const level of sortedLevels) {
    cumulativeVolume += level.volume;
    if (!vah) vah = level.high;
    val = level.low;
    if (cumulativeVolume >= targetVolume) break;
  }

  return {
    levels: levels.sort((a, b) => a.price - b.price),
    poc,
    vah,
    val,
    totalVolume
  };
}

// Market Structure Analysis (Support/Resistance)
export function analyzeMarketStructure(candles, lookback = 20) {
  if (candles.length < lookback * 2) return { support: [], resistance: [], trend: null };

  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const closes = candles.map(c => c.c);

  // Find swing highs and lows
  const swingHighs = [];
  const swingLows = [];

  for (let i = lookback; i < candles.length - lookback; i++) {
    const currentHigh = highs[i];
    const currentLow = lows[i];
    
    // Check for swing high
    const isSwingHigh = highs.slice(i - lookback, i + lookback + 1)
      .every(h => h <= currentHigh);
    if (isSwingHigh) {
      swingHighs.push({ index: i, price: currentHigh, time: candles[i].t });
    }
    
    // Check for swing low
    const isSwingLow = lows.slice(i - lookback, i + lookback + 1)
      .every(l => l >= currentLow);
    if (isSwingLow) {
      swingLows.push({ index: i, price: currentLow, time: candles[i].t });
    }
  }

  // Identify support and resistance levels
  const support = swingLows
    .sort((a, b) => b.price - a.price)
    .slice(0, 5)
    .map(low => ({
      price: low.price,
      strength: calculateLevelStrength(low, swingLows, candles),
      type: 'support'
    }));

  const resistance = swingHighs
    .sort((a, b) => a.price - b.price)
    .slice(0, 5)
    .map(high => ({
      price: high.price,
      strength: calculateLevelStrength(high, swingHighs, candles),
      type: 'resistance'
    }));

  // Determine trend
  const recentCloses = closes.slice(-lookback);
  const olderCloses = closes.slice(-lookback * 2, -lookback);
  const recentAvg = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
  const olderAvg = olderCloses.reduce((a, b) => a + b, 0) / olderCloses.length;
  
  const trend = recentAvg > olderAvg ? 'bullish' : 
                recentAvg < olderAvg ? 'bearish' : 'sideways';

  return {
    support,
    resistance,
    trend,
    trendStrength: Math.abs((recentAvg - olderAvg) / olderAvg) * 100
  };
}

function calculateLevelStrength(level, allLevels, candles) {
  // Calculate strength based on touches and bounces
  let touches = 0;
  let bounces = 0;
  const tolerance = 0.002; // 0.2% tolerance

  candles.forEach(candle => {
    const nearLevel = Math.abs(candle.c - level.price) <= level.price * tolerance;
    
    if (nearLevel) {
      touches++;
      
      // Check if it bounced off the level
      const isSupport = level.type === 'support';
      const isResistance = level.type === 'resistance';
      
      if ((isSupport && candle.l <= level.price && candle.c > level.price) ||
          (isResistance && candle.h >= level.price && candle.c < level.price)) {
        bounces++;
      }
    }
  });

  const strength = (bounces / touches) * 100;
  const recency = 1 - (candles.length - level.index) / candles.length;
  
  return Math.max(0, Math.min(100, strength * 50 + recency * 50));
}

// Advanced Signal Scoring using all indicators
export function calculateAdvancedSignalScore(
  price, 
  rsi, 
  stoch, 
  macd, 
  bb, 
  kdj, 
  ichimoku, 
  elliott, 
  volumeProfile,
  marketStructure
) {
  let score = 50; // Neutral starting point
  let factors = [];

  // RSI signals
  const lastRSI = rsi[rsi.length - 1];
  if (lastRSI < 30) {
    score += 15;
    factors.push('RSI Oversold');
  } else if (lastRSI > 70) {
    score -= 15;
    factors.push('RSI Overbought');
  }

  // Stochastic signals
  const lastStochK = stoch.k[stoch.k.length - 1];
  const lastStochD = stoch.d[stoch.d.length - 1];
  if (lastStochK < 20 && lastStochK > lastStochD) {
    score += 12;
    factors.push('Stoch Bullish Cross');
  } else if (lastStochK > 80 && lastStochK < lastStochD) {
    score -= 12;
    factors.push('Stoch Bearish Cross');
  }

  // MACD signals
  const lastMACD = macd.macd[macd.macd.length - 1];
  const lastSignal = macd.signal[macd.signal.length - 1];
  const lastHist = macd.hist[macd.hist.length - 1];
  
  if (lastMACD > lastSignal && lastHist > 0) {
    score += 10;
    factors.push('MACD Bullish');
  } else if (lastMACD < lastSignal && lastHist < 0) {
    score -= 10;
    factors.push('MACD Bearish');
  }

  // Bollinger Bands
  const lastBB = bb[bb.length - 1];
  if (price < lastBB.lower) {
    score += 8;
    factors.push('Below Lower BB');
  } else if (price > lastBB.upper) {
    score -= 8;
    factors.push('Above Upper BB');
  }

  // Ichimoku Cloud
  if (ichimoku.senkouA.length > 0) {
    const lastSenkouA = ichimoku.senkouA[ichimoku.senkouA.length - 1];
    const lastSenkouB = ichimoku.senkouB[ichimoku.senkouB.length - 1];
    const lastChikou = ichimoku.chikou[ichimoku.chikou.length - 1];
    const cloudTop = Math.max(lastSenkouA, lastSenkouB);
    const cloudBottom = Math.min(lastSenkouA, lastSenkouB);
    
    if (price > cloudTop && lastChikou > cloudTop) {
      score += 15;
      factors.push('Above Cloud Bullish');
    } else if (price < cloudBottom && lastChikou < cloudBottom) {
      score -= 15;
      factors.push('Below Cloud Bearish');
    }
  }

  // Elliott Waves
  if (elliott.currentWave) {
    const wave = elliott.currentWave;
    if (wave.direction === 'bullish' && wave.confidence > 60) {
      score += 10;
      factors.push('Elliott Bullish Wave');
    } else if (wave.direction === 'bearish' && wave.confidence > 60) {
      score -= 10;
      factors.push('Elliott Bearish Wave');
    }
  }

  // Market Structure
  if (marketStructure.trend === 'bullish') {
    score += 8;
    factors.push('Bullish Structure');
  } else if (marketStructure.trend === 'bearish') {
    score -= 8;
    factors.push('Bearish Structure');
  }

  // Volume confirmation
  if (volumeProfile.poc && volumeProfile.totalVolume > 0) {
    const volumeConfirmation = price > volumeProfile.poc.price ? 1 : -1;
    score += volumeConfirmation * 5;
    factors.push(volumeConfirmation > 0 ? 'Volume Support' : 'Volume Resistance');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    direction: score > 55 ? 'LONG' : score < 45 ? 'SHORT' : 'NEUTRAL',
    confidence: Math.abs(score - 50) * 2,
    factors,
    strength: score > 70 ? 'strong' : score > 60 ? 'moderate' : 'weak'
  };
}
