// AI/ML Signal Optimization Engine
// Machine learning for improving signal accuracy

// Historical signal performance tracking
class SignalPerformanceTracker {
  constructor() {
    this.signals = [];
    this.performance = {};
  }

  addSignal(signal, result) {
    const signalKey = `${signal.symbol}_${signal.indicator}_${signal.interval}_${signal.direction}`;
    
    if (!this.performance[signalKey]) {
      this.performance[signalKey] = {
        total: 0,
        wins: 0,
        losses: 0,
        totalProfit: 0,
        totalLoss: 0,
        avgWin: 0,
        avgLoss: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        samples: []
      };
    }

    const perf = this.performance[signalKey];
    const profit = result.profit || 0;
    const isWin = profit > 0;

    // Update basic stats
    perf.total++;
    perf.total += 1;
    if (isWin) {
      perf.wins++;
      perf.totalProfit += profit;
      perf.avgWin = perf.totalProfit / perf.wins;
    } else {
      perf.losses++;
      perf.totalLoss += Math.abs(profit);
      perf.avgLoss = perf.totalLoss / perf.losses;
    }

    // Calculate advanced metrics
    perf.winRate = (perf.wins / perf.total) * 100;
    perf.profitFactor = perf.avgLoss > 0 ? perf.avgWin / perf.avgLoss : 0;
    
    // Calculate Sharpe-like ratio
    const returns = perf.samples.map(s => s.profit || 0);
    if (returns.length > 1) {
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
      perf.sharpeRatio = variance > 0 ? avgReturn / Math.sqrt(variance) : 0;
    }

    // Add to samples
    perf.samples.push({
      timestamp: Date.now(),
      signal: { ...signal },
      result: { ...result },
      profit
    });

    // Keep only last 100 samples per signal type
    if (perf.samples.length > 100) {
      perf.samples = perf.samples.slice(-100);
    }

    // Update drawdown
    let cumulativeProfit = 0;
    let maxProfit = 0;
    perf.samples.forEach(sample => {
      cumulativeProfit += sample.profit;
      maxProfit = Math.max(maxProfit, cumulativeProfit);
      perf.currentDrawdown = maxProfit - cumulativeProfit;
      perf.maxDrawdown = Math.max(perf.maxDrawdown, perf.currentDrawdown);
    });

    this.signals.push({ ...signal, result, timestamp: Date.now() });
  }

  getSignalPerformance(symbol, indicator, interval, direction) {
    const key = `${symbol}_${indicator}_${interval}_${direction}`;
    return this.performance[key] || null;
  }

  getTopPerformingSignals(limit = 10) {
    return Object.entries(this.performance)
      .map(([key, perf]) => ({
        key,
        ...perf,
        score: this.calculateOverallScore(perf)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  calculateOverallScore(perf) {
    if (perf.total < 5) return 0; // Not enough data

    // Weighted scoring system
    const winRateScore = (perf.winRate / 100) * 30;
    const profitFactorScore = Math.min(perf.profitFactor, 3) / 3 * 25;
    const sharpeScore = Math.min(Math.max(perf.sharpeRatio, -2), 2) / 2 * 20;
    const sampleSizeScore = Math.min(perf.total / 50, 1) * 15;
    const drawdownScore = Math.max(0, (100 - perf.maxDrawdown)) / 100 * 10;

    return winRateScore + profitFactorScore + sharpeScore + sampleSizeScore + drawdownScore;
  }
}

// Adaptive signal strength calculator
class AdaptiveSignalStrength {
  constructor() {
    this.marketConditions = {
      volatility: 'normal',
      trend: 'sideways',
      volume: 'normal',
      sentiment: 'neutral'
    };
    this.adjustments = {
      rsi: { oversold: 30, overbought: 70 },
      stoch: { oversold: 20, overbought: 80 },
      macd: { threshold: 0 },
      volume: { multiplier: 1.0 }
    };
  }

  updateMarketConditions(candles, volumeProfile) {
    // Calculate market volatility
    const returns = [];
    for (let i = 1; i < candles.length; i++) {
      returns.push((candles[i].c - candles[i-1].c) / candles[i-1].c);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length);
    
    // Classify volatility
    if (volatility > 0.03) this.marketConditions.volatility = 'high';
    else if (volatility > 0.015) this.marketConditions.volatility = 'medium';
    else this.marketConditions.volatility = 'low';

    // Determine trend
    const sma20 = candles.slice(-20).reduce((sum, c) => sum + c.c, 0) / 20;
    const sma50 = candles.slice(-50).reduce((sum, c) => sum + c.c, 0) / 50;
    const currentPrice = candles[candles.length - 1].c;
    
    if (currentPrice > sma20 && sma20 > sma50) this.marketConditions.trend = 'bullish';
    else if (currentPrice < sma20 && sma20 < sma50) this.marketConditions.trend = 'bearish';
    else this.marketConditions.trend = 'sideways';

    // Analyze volume
    const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.v, 0) / 20;
    const currentVolume = candles[candles.length - 1].v;
    
    if (currentVolume > avgVolume * 1.5) this.marketConditions.volume = 'high';
    else if (currentVolume < avgVolume * 0.7) this.marketConditions.volume = 'low';
    else this.marketConditions.volume = 'normal';

    // Market sentiment based on price action
    const recentCandles = candles.slice(-10);
    const greenCandles = recentCandles.filter(c => c.c > c.o).length;
    const redCandles = recentCandles.filter(c => c.c < c.o).length;
    
    if (greenCandles > redCandles * 1.5) this.marketConditions.sentiment = 'bullish';
    else if (redCandles > greenCandles * 1.5) this.marketConditions.sentiment = 'bearish';
    else this.marketConditions.sentiment = 'neutral';
  }

  adjustSignalStrength(baseSignal, indicatorType) {
    let adjustedSignal = { ...baseSignal };
    const conditions = this.marketConditions;

    // Volatility adjustments
    if (conditions.volatility === 'high') {
      // Reduce confidence in high volatility
      adjustedSignal.confidence *= 0.8;
      adjustedSignal.strength = 'weak';
    } else if (conditions.volatility === 'low') {
      // Increase confidence in low volatility
      adjustedSignal.confidence *= 1.1;
    }

    // Trend adjustments
    if (conditions.trend === 'bullish' && adjustedSignal.direction === 'LONG') {
      adjustedSignal.confidence *= 1.2;
    } else if (conditions.trend === 'bearish' && adjustedSignal.direction === 'SHORT') {
      adjustedSignal.confidence *= 1.2;
    } else if (conditions.trend === 'sideways') {
      adjustedSignal.confidence *= 0.9;
    }

    // Volume confirmation
    if (conditions.volume === 'high') {
      adjustedSignal.confidence *= 1.15;
    } else if (conditions.volume === 'low') {
      adjustedSignal.confidence *= 0.85;
    }

    // Sentiment alignment
    if (conditions.sentiment === adjustedSignal.direction.toLowerCase()) {
      adjustedSignal.confidence *= 1.1;
    }

    // Indicator-specific adjustments
    if (indicatorType === 'RSI') {
      const adjustedOversold = conditions.volatility === 'high' ? 25 : 30;
      const adjustedOverbought = conditions.volatility === 'high' ? 75 : 70;
      
      // Dynamic RSI thresholds based on volatility
      this.adjustments.rsi.oversold = adjustedOversold;
      this.adjustments.rsi.overbought = adjustedOverbought;
    }

    return adjustedSignal;
  }
}

// Neural signal pattern recognition
class NeuralPatternRecognizer {
  constructor() {
    this.patterns = new Map();
    this.minPatternLength = 5;
    this.maxPatternLength = 20;
  }

  extractFeatures(candles, window = 14) {
    const features = [];
    
    for (let i = window; i < candles.length; i++) {
      const windowCandles = candles.slice(i - window, i);
      const closes = windowCandles.map(c => c.c);
      const highs = windowCandles.map(c => c.h);
      const lows = windowCandles.map(c => c.l);
      const volumes = windowCandles.map(c => c.v);

      // Price features
      const returns = [];
      for (let j = 1; j < closes.length; j++) {
        returns.push((closes[j] - closes[j-1]) / closes[j-1]);
      }
      
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length);
      
      // Technical indicators in window
      const rsi = this.calculateSimpleRSI(closes);
      const sma = closes.reduce((a, b) => a + b, 0) / closes.length;
      
      features.push({
        returns: returns.slice(-5), // Last 5 returns
        volatility,
        rsi,
        sma,
        volume: volumes.slice(-5).reduce((a, b) => a + b, 0),
        high: Math.max(...highs.slice(-5)),
        low: Math.min(...lows.slice(-5)),
        trend: closes[closes.length - 1] > sma ? 1 : 0
      });
    }

    return features;
  }

  calculateSimpleRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i-1];
      if (diff > 0) gains += diff;
      else losses -=diff;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  trainPattern(features, outcome) {
    const patternKey = JSON.stringify(features.slice(-10)); // Last 10 features as pattern
    const currentPattern = this.patterns.get(patternKey) || {
      occurrences: 0,
      outcomes: [],
      accuracy: 0
    };

    currentPattern.occurrences++;
    currentPattern.outcomes.push(outcome);
    
    // Keep only last 50 outcomes
    if (currentPattern.outcomes.length > 50) {
      currentPattern.outcomes = currentPattern.outcomes.slice(-50);
    }

    // Calculate accuracy
    const wins = currentPattern.outcomes.filter(o => o.profit > 0).length;
    currentPattern.accuracy = (wins / currentPattern.outcomes.length) * 100;

    this.patterns.set(patternKey, currentPattern);
  }

  predictOutcome(features) {
    const patternKey = JSON.stringify(features.slice(-10));
    const pattern = this.patterns.get(patternKey);

    if (!pattern || pattern.occurrences < 3) {
      return { confidence: 0, prediction: 'NEUTRAL', accuracy: 0 };
    }

    const recentOutcomes = pattern.outcomes.slice(-10);
    const wins = recentOutcomes.filter(o => o.profit > 0).length;
    
    return {
      confidence: pattern.accuracy * (recentOutcomes.length / 10),
      prediction: wins > recentOutcomes.length / 2 ? 'BULLISH' : 'BEARISH',
      accuracy: pattern.accuracy,
      samples: pattern.occurrences
    };
  }
}

// Main ML Signal Optimizer
export class MLSignalOptimizer {
  constructor() {
    this.performanceTracker = new SignalPerformanceTracker();
    this.adaptiveStrength = new AdaptiveSignalStrength();
    this.patternRecognizer = new NeuralPatternRecognizer();
    this.isTraining = false;
  }

  // Optimize signal based on historical performance
  optimizeSignal(baseSignal, candles, volumeProfile) {
    // Update market conditions
    this.adaptiveStrength.updateMarketConditions(candles, volumeProfile);

    // Get historical performance for this signal type
    const perf = this.performanceTracker.getSignalPerformance(
      baseSignal.symbol,
      baseSignal.indicator,
      baseSignal.interval,
      baseSignal.direction
    );

    // Apply adaptive adjustments
    let optimizedSignal = this.adaptiveStrength.adjustSignalStrength(baseSignal, baseSignal.indicator);

    // Incorporate historical performance
    if (perf && perf.total >= 5) {
      // Adjust confidence based on historical win rate
      const performanceMultiplier = perf.winRate / 50; // 50% is baseline
      optimizedSignal.confidence *= performanceMultiplier;
      
      // Add performance metadata
      optimizedSignal.historicalWinRate = perf.winRate;
      optimizedSignal.historicalProfitFactor = perf.profitFactor;
      optimizedSignal.samples = perf.total;
    }

    // Pattern recognition enhancement
    const features = this.patternRecognizer.extractFeatures(candles);
    const patternPrediction = this.patternRecognizer.predictOutcome(features);
    
    if (patternPrediction.confidence > 60) {
      optimizedSignal.patternPrediction = patternPrediction;
      optimizedSignal.confidence = Math.max(
        optimizedSignal.confidence,
        patternPrediction.confidence * 0.5
      );
    }

    // Final confidence capping and normalization
    optimizedSignal.confidence = Math.max(0, Math.min(100, optimizedSignal.confidence));
    optimizedSignal.mlScore = this.calculateMLScore(optimizedSignal);
    optimizedSignal.recommendation = this.generateRecommendation(optimizedSignal);

    return optimizedSignal;
  }

  calculateMLScore(signal) {
    let score = 50; // Base score

    // Historical performance weight (40%)
    if (signal.historicalWinRate) {
      score += (signal.historicalWinRate - 50) * 0.4;
    }

    // Pattern prediction weight (25%)
    if (signal.patternPrediction) {
      score += (signal.patternPrediction.confidence - 50) * 0.25;
    }

    // Market condition alignment weight (20%)
    const marketAlignment = this.calculateMarketAlignment(signal);
    score += marketAlignment * 0.2;

    // Signal strength weight (15%)
    score += (signal.confidence - 50) * 0.15;

    return Math.max(0, Math.min(100, score));
  }

  calculateMarketAlignment(signal) {
    // How well does the signal align with current market conditions?
    const conditions = this.adaptiveStrength.marketConditions;
    
    let alignment = 0;
    
    if (conditions.trend === signal.direction.toLowerCase()) {
      alignment += 30;
    }
    
    if (conditions.sentiment === signal.direction.toLowerCase()) {
      alignment += 20;
    }
    
    if (conditions.volume === 'high') {
      alignment += 10;
    }

    return alignment;
  }

  generateRecommendation(signal) {
    const { mlScore, confidence, direction } = signal;
    
    if (mlScore > 75 && confidence > 70) {
      return {
        action: 'STRONG_BUY',
        reason: 'High ML score with strong confidence',
        riskLevel: 'LOW'
      };
    } else if (mlScore > 60 && confidence > 60) {
      return {
        action: direction === 'LONG' ? 'BUY' : 'SELL',
        reason: 'Moderate ML score with good confidence',
        riskLevel: 'MEDIUM'
      };
    } else if (mlScore > 45 && confidence > 50) {
      return {
        action: 'WEAK_BUY',
        reason: 'Low ML score, consider waiting',
        riskLevel: 'HIGH'
      };
    } else {
      return {
        action: 'WAIT',
        reason: 'Low ML score and confidence',
        riskLevel: 'VERY_HIGH'
      };
    }
  }

  // Record signal outcome for learning
  recordOutcome(signal, outcome) {
    this.performanceTracker.addSignal(signal, outcome);
    
    // Train pattern recognizer
    if (signal.candles) {
      const features = this.patternRecognizer.extractFeatures(signal.candles);
      this.patternRecognizer.trainPattern(features, outcome);
    }
  }

  // Get top performing signal combinations
  getTopStrategies(limit = 10) {
    return this.performanceTracker.getTopPerformingSignals(limit);
  }

  // Export performance data for analysis
  exportPerformanceData() {
    return {
      performance: this.performanceTracker.performance,
      topStrategies: this.getTopStrategies(),
      marketConditions: this.adaptiveStrength.marketConditions,
      patterns: this.patternRecognizer.patterns
    };
  }
}

// Singleton instance for global use
export const mlOptimizer = new MLSignalOptimizer();
export default mlOptimizer;
