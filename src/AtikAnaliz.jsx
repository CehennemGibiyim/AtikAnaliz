// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef, useCallback } from "react";
import { getAllPrices, get24hrStats, getCandlesticks } from './api/binance';
import AuthSettings from './components/AuthSettings';
import RealTradingPanel from './components/RealTradingPanel';
import RiskManager from './components/RiskManager';
import NotificationSystem from './components/NotificationSystem';
import AdvancedChart from './components/AdvancedChart';
import MLSignalPanel from './components/MLSignalPanel';
import MobileOptimization from './components/MobileOptimization';

/* ══════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg0:#0b0e17;--bg1:#111520;--bg2:#161b2e;--bg3:#1c2340;
      --green:#0ecb81;--red:#f6465d;--blue:#1890ff;
      --yellow:#f0b90b;--purple:#a78bfa;--cyan:#06b6d4;
      --text:#eaecef;--muted:#848e9c;--border:#2b3158;
    }
    body{background:var(--bg0);font-family:'Nunito',sans-serif;color:var(--text);overflow-x:hidden;}
    ::-webkit-scrollbar{width:3px;height:3px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
    input,select{outline:none;font-family:'Nunito',sans-serif;}
    input:focus,select:focus{border-color:var(--green)!important;box-shadow:0 0 0 2px #0ecb8115;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.85)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px #0ecb8140}50%{box-shadow:0 0 20px #0ecb8180}}
    .fade-up{animation:fadeUp .35s ease both;}
    .card{transition:transform .18s ease,box-shadow .18s ease;}
    .card:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(14,203,129,.10);}
    .card:active{transform:translateY(0);}
    input::placeholder{color:var(--muted);}
    select option{background:var(--bg2);}
    button{font-family:'Nunito',sans-serif;}
    button:active{transform:scale(.97);}
  `}</style>
);

/* ══════════════════════════════════════════
   SOUND ENGINE
══════════════════════════════════════════ */
const SND = {
  _ctx: null,
  ctx() { if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)(); return this._ctx; },
  play(type) {
    try {
      const c = this.ctx(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      const m = {
        tick:   {f:[1200],d:.04,t:"square",v:.1},
        buy:    {f:[440,554,659],d:.09,t:"triangle",v:.28},
        sell:   {f:[659,554,440],d:.09,t:"triangle",v:.28},
        alarm:  {f:[880,1100,880,1100],d:.07,t:"sine",v:.35},
        notify: {f:[523,659],d:.1,t:"sine",v:.2},
      };
      const cfg = m[type] || m.tick;
      o.type = cfg.t;
      const now = c.currentTime;
      cfg.f.forEach((f, i) => o.frequency.setValueAtTime(f, now + i * cfg.d));
      g.gain.setValueAtTime(cfg.v, now);
      g.gain.exponentialRampToValueAtTime(.001, now + cfg.f.length * cfg.d + .05);
      o.start(now); o.stop(now + cfg.f.length * cfg.d + .1);
    } catch(e) {}
  }
};

/* ══════════════════════════════════════════
   DATA ENGINE
══════════════════════════════════════════ */
const COINS_BASE = [
  {s:"BTC",p:67200},{s:"ETH",p:3420},{s:"SOL",p:167},{s:"BNB",p:583},
  {s:"XRP",p:.621},{s:"ADA",p:.481},{s:"DOGE",p:.182},{s:"AVAX",p:42.5},
  {s:"OP",p:.1208},{s:"DOT",p:8.6},{s:"LINK",p:18.2},{s:"MATIC",p:.923},
  {s:"ARB",p:.95},{s:"SUI",p:3.82},{s:"TRX",p:.132},{s:"LTC",p:92.4},
];

// Real-time price cache
let priceCache = {};
let statsCache = {};

// Generate realistic OHLCV candle data (fallback)
function genCandles(baseP, count = 80, interval = "15m") {
  const candles = [];
  let price = baseP * (0.92 + Math.random() * 0.16);
  const volatility = baseP > 1000 ? 0.008 : baseP > 100 ? 0.012 : baseP > 1 ? 0.018 : 0.025;
  const trend = (Math.random() - 0.48) * 0.003;

  for (let i = 0; i < count; i++) {
    const drift = trend + (Math.random() - 0.5) * volatility * 2;
    const open = price;
    price *= (1 + drift);
    const high = Math.max(open, price) * (1 + Math.random() * volatility * 0.8);
    const low  = Math.min(open, price) * (1 - Math.random() * volatility * 0.8);
    const close = price;
    const vol = baseP * (200 + Math.random() * 800) * (1 + Math.abs(drift) * 20);
    candles.push({ t: i, o: open, h: high, l: low, c: close, v: vol });
  }
  return candles;
}

// Fetch real candle data
async function fetchCandles(symbol, interval, count) {
  try {
    const candles = await getCandlesticks(symbol, interval, count);
    if (candles.length > 0) {
      return candles;
    }
    // Fallback to generated data
    const basePrice = priceCache[symbol] || 100;
    return genCandles(basePrice, count, interval);
  } catch (error) {
    console.error('Error fetching candles:', error);
    const basePrice = priceCache[symbol] || 100;
    return genCandles(basePrice, count, interval);
  }
}

// RSI
function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return closes.map(() => 50);
  const rsi = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i-1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgG = gains / period, avgL = losses / period;
  rsi.length = period;
  rsi.fill(50);
  for (let i = period; i < closes.length; i++) {
    const diff = closes[i] - closes[i-1];
    const g = diff > 0 ? diff : 0, l = diff < 0 ? -diff : 0;
    avgG = (avgG * (period-1) + g) / period;
    avgL = (avgL * (period-1) + l) / period;
    rsi.push(avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL));
  }
  return rsi;
}

// Stochastic RSI
function calcStochRSI(closes, period = 14, kPeriod = 3, dPeriod = 3) {
  const rsi = calcRSI(closes, period);
  const stochK = [], stochD = [];
  for (let i = 0; i < rsi.length; i++) {
    if (i < period) { stochK.push(50); stochD.push(50); continue; }
    const window = rsi.slice(i - period + 1, i + 1);
    const minR = Math.min(...window), maxR = Math.max(...window);
    stochK.push(maxR === minR ? 50 : ((rsi[i] - minR) / (maxR - minR)) * 100);
    if (i >= period + kPeriod - 1) {
      stochD.push(stochK.slice(-dPeriod).reduce((a,b)=>a+b,0)/dPeriod);
    } else stochD.push(50);
  }
  // Smooth K
  const smoothK = [];
  for (let i = 0; i < stochK.length; i++) {
    if (i < kPeriod - 1) smoothK.push(50);
    else smoothK.push(stochK.slice(i-kPeriod+1,i+1).reduce((a,b)=>a+b,0)/kPeriod);
  }
  return { k: smoothK, d: stochD };
}

// EMA
function calcEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) ema.push(data[i] * k + ema[i-1] * (1-k));
  return ema;
}

// MACD
function calcMACD(closes) {
  const ema12 = calcEMA(closes, 12), ema26 = calcEMA(closes, 26);
  const macd = closes.map((_,i) => ema12[i] - ema26[i]);
  const signal = calcEMA(macd, 9);
  const hist = macd.map((v,i) => v - signal[i]);
  return { macd, signal, hist };
}

// Bollinger Bands
function calcBB(closes, period=20, mult=2) {
  return closes.map((_,i) => {
    if (i < period-1) return {mid:closes[i],upper:closes[i],lower:closes[i]};
    const slice = closes.slice(i-period+1, i+1);
    const avg = slice.reduce((a,b)=>a+b,0)/period;
    const std = Math.sqrt(slice.reduce((s,v)=>s+(v-avg)**2,0)/period);
    return {mid:avg, upper:avg+mult*std, lower:avg-mult*std};
  });
}

// KDJ
function calcKDJ(candles, period=9) {
  const K=[], D=[], J=[];
  let k=50, d=50;
  for (let i=0; i<candles.length; i++) {
    if (i < period-1) { K.push(50);D.push(50);J.push(50);continue; }
    const slice = candles.slice(i-period+1, i+1);
    const high = Math.max(...slice.map(c=>c.h));
    const low  = Math.min(...slice.map(c=>c.l));
    const rsv  = high===low ? 50 : (candles[i].c - low)/(high-low)*100;
    k = k * 2/3 + rsv * 1/3;
    d = d * 2/3 + k   * 1/3;
    K.push(k); D.push(d); J.push(3*k - 2*d);
  }
  return {K,D,J};
}

// Interval → volatility multiplier & candle count
const IV_CFG = {
  "1m":  { vol: 2.2, candles: 80, tp: 0.008, sl: 0.005, label: "1 Dakika" },
  "5m":  { vol: 1.6, candles: 80, tp: 0.012, sl: 0.007, label: "5 Dakika" },
  "15m": { vol: 1.0, candles: 80, tp: 0.020, sl: 0.010, label: "15 Dakika" },
  "1h":  { vol: 0.7, candles: 80, tp: 0.030, sl: 0.015, label: "1 Saat" },
  "4h":  { vol: 0.5, candles: 80, tp: 0.045, sl: 0.022, label: "4 Saat" },
  "1d":  { vol: 0.3, candles: 60, tp: 0.070, sl: 0.035, label: "1 Gün" },
};

// Indicator → signal scoring logic
function scoreByIndicator(indicator, rsi, stoch, macdData, kdj, bb, closes) {
  const lastRSI  = rsi[rsi.length-1];
  const lastK    = stoch.k[stoch.k.length-1];
  const lastD    = stoch.d[stoch.d.length-1];
  const lastHist = macdData.hist[macdData.hist.length-1];
  const lastMACD = macdData.macd[macdData.macd.length-1];
  const lastSig  = macdData.signal[macdData.signal.length-1];
  const lastKDJ_K = kdj.K[kdj.K.length-1];
  const lastKDJ_D = kdj.D[kdj.D.length-1];
  const lastKDJ_J = kdj.J[kdj.J.length-1];
  const lastBB   = bb[bb.length-1];
  const lastClose = closes[closes.length-1];

  let ls = 50, ss = 50;

  if (indicator === "RSI") {
    // Pure RSI: oversold/overbought
    if (lastRSI < 30)      { ls = 72 + (30 - lastRSI) * 1.2; ss = 100 - ls; }
    else if (lastRSI < 40) { ls = 62 + (40 - lastRSI) * 0.8; ss = 100 - ls; }
    else if (lastRSI > 70) { ss = 72 + (lastRSI - 70) * 1.2; ls = 100 - ss; }
    else if (lastRSI > 60) { ss = 62 + (lastRSI - 60) * 0.8; ls = 100 - ss; }
    else { ls = 48 + Math.random() * 8; ss = 100 - ls; }

  } else if (indicator === "STOCHRSI") {
    // StochRSI cross signals
    if (lastK < 20 && lastK > lastD)      { ls = 78 + Math.random() * 16; ss = 100 - ls; }
    else if (lastK < 20)                  { ls = 65 + Math.random() * 12; ss = 100 - ls; }
    else if (lastK > 80 && lastK < lastD) { ss = 78 + Math.random() * 16; ls = 100 - ss; }
    else if (lastK > 80)                  { ss = 65 + Math.random() * 12; ls = 100 - ss; }
    else if (lastK > lastD && lastK < 50) { ls = 60 + Math.random() * 14; ss = 100 - ls; }
    else if (lastK < lastD && lastK > 50) { ss = 60 + Math.random() * 14; ls = 100 - ss; }
    else { ls = 48 + Math.random() * 8; ss = 100 - ls; }

  } else if (indicator === "MACD") {
    // MACD histogram + crossover
    if (lastHist > 0 && lastMACD > lastSig) {
      const strength = Math.min(Math.abs(lastHist) / (Math.abs(lastMACD) || 1) * 60, 25);
      ls = 65 + strength; ss = 100 - ls;
    } else if (lastHist < 0 && lastMACD < lastSig) {
      const strength = Math.min(Math.abs(lastHist) / (Math.abs(lastMACD) || 1) * 60, 25);
      ss = 65 + strength; ls = 100 - ss;
    } else if (lastHist > 0) { ls = 58 + Math.random() * 10; ss = 100 - ls; }
    else { ss = 58 + Math.random() * 10; ls = 100 - ss; }

  } else if (indicator === "KDJ") {
    // KDJ J line extremes & cross
    if (lastKDJ_J < 10 && lastKDJ_K > lastKDJ_D)      { ls = 80 + Math.random() * 15; ss = 100 - ls; }
    else if (lastKDJ_J < 20)                            { ls = 68 + Math.random() * 12; ss = 100 - ls; }
    else if (lastKDJ_J > 90 && lastKDJ_K < lastKDJ_D)  { ss = 80 + Math.random() * 15; ls = 100 - ss; }
    else if (lastKDJ_J > 80)                            { ss = 68 + Math.random() * 12; ls = 100 - ss; }
    else if (lastKDJ_K > lastKDJ_D && lastKDJ_J < 60)  { ls = 60 + Math.random() * 14; ss = 100 - ls; }
    else if (lastKDJ_K < lastKDJ_D && lastKDJ_J > 40)  { ss = 60 + Math.random() * 14; ls = 100 - ss; }
    else { ls = 48 + Math.random() * 8; ss = 100 - ls; }

  } else if (indicator === "BB") {
    // Bollinger Band squeeze/breakout
    
    if (lastClose < lastBB.lower)        { ls = 75 + Math.random() * 18; ss = 100 - ls; }
    else if (lastClose > lastBB.upper)   { ss = 75 + Math.random() * 18; ls = 100 - ss; }
    else if (lastClose < lastBB.mid && lastClose > lastBB.lower * 1.005) { ls = 58 + Math.random() * 12; ss = 100 - ls; }
    else if (lastClose > lastBB.mid)     { ss = 58 + Math.random() * 12; ls = 100 - ss; }
    else { ls = 48 + Math.random() * 8; ss = 100 - ls; }
  }

  return { ls: Math.max(10, Math.min(95, ls)), ss: Math.max(10, Math.min(95, ss)) };
}

// Generate full analysis with real data
async function analyzeCoins(interval = "15m", indicator = "STOCHRSI") {
  const ivcfg = IV_CFG[interval] || IV_CFG["15m"];

  try {
    // Fetch real prices and stats
    const prices = await getAllPrices();
    const stats = await get24hrStats();
    
    // Update cache
    prices.forEach(coin => {
      priceCache[coin.s] = coin.price;
    });
    Object.assign(statsCache, stats);

    const analysisPromises = prices.map(async ({s, price}) => {
      const change24 = stats[s]?.change24 || 0;
      
      // Fetch real candles
      const candles = await fetchCandles(s, interval, ivcfg.candles);
      const closes = candles.map(c => c.c);
      
      // Calculate indicators
      const rsi = calcRSI(closes);
      const stoch = calcStochRSI(closes);
      const macdData = calcMACD(closes);
      const bb = calcBB(closes);
      const kdj = calcKDJ(candles);

      // Score based on selected indicator
      let { ls, ss } = scoreByIndicator(indicator, rsi, stoch, macdData, kdj, bb, closes);

      const conf = Math.round(Math.max(ls, ss));
      const isLong = ls >= ss;
      const risk = conf > 82 ? "high" : conf > 67 ? "medium" : "low";
      const tpPct = ivcfg.tp + Math.random() * ivcfg.tp * 0.5;
      const slPct = ivcfg.sl + Math.random() * ivcfg.sl * 0.3;
      const tp = price * (isLong ? 1 + tpPct : 1 - tpPct);
      const sl = price * (isLong ? 1 - slPct : 1 + slPct);

      return {
        s, sym: `${s}/USDT`, price, change24,
        ls: Math.round(ls), ss: Math.round(ss), conf,
        dir: isLong ? "LONG" : "SHORT",
        risk, tp, sl, candles, closes, rsi, stoch, macdData, bb, kdj,
        vol: Math.round(stats[s]?.volume || Math.random() * 5000 + 500),
        interval, indicator,
      };
    });

    const results = await Promise.all(analysisPromises);
    return results.sort((a, b) => b.conf - a.conf);
    
  } catch (error) {
    console.error('Error in analyzeCoins:', error);
    // Fallback to mock data
    return COINS_BASE.map(({s,p}) => {
      const drift = (Math.random()-.49)*0.025 * ivcfg.vol;
      priceCache[s] = (priceCache[s]||p) * (1 + drift*0.3);
      const price = priceCache[s];
      const change24 = (Math.random()-.46)*8;

      const baseVol = p > 1000 ? 0.008 : p > 100 ? 0.012 : p > 1 ? 0.018 : 0.025;
      const ivVol   = baseVol * ivcfg.vol;
      const trend   = (Math.random() - 0.48) * 0.003;
      let cp = price * (0.92 + Math.random() * 0.16);
      const candles = Array.from({length: ivcfg.candles}, () => {
        const d = trend + (Math.random() - 0.5) * ivVol * 2, o = cp;
        cp *= (1 + d);
        return { t: 0, o, h: Math.max(o,cp)*(1+Math.random()*ivVol*.8), l: Math.min(o,cp)*(1-Math.random()*ivVol*.8), c: cp, v: p*500 };
      });

      const closes   = candles.map(c => c.c);
      const rsi      = calcRSI(closes);
      const stoch    = calcStochRSI(closes);
      const macdData = calcMACD(closes);
      const bb       = calcBB(closes);
      const kdj      = calcKDJ(candles);

      let { ls, ss } = scoreByIndicator(indicator, rsi, stoch, macdData, kdj, bb, closes);

      const conf    = Math.round(Math.max(ls, ss));
      const isLong  = ls >= ss;
      const risk    = conf > 82 ? "high" : conf > 67 ? "medium" : "low";
      const tpPct   = ivcfg.tp + Math.random() * ivcfg.tp * 0.5;
      const slPct   = ivcfg.sl + Math.random() * ivcfg.sl * 0.3;
      const tp      = price * (isLong ? 1 + tpPct : 1 - tpPct);
      const sl      = price * (isLong ? 1 - slPct : 1 + slPct);

      return {
        s, sym: `${s}/USDT`, price, change24,
        ls: Math.round(ls), ss: Math.round(ss), conf,
        dir: isLong ? "LONG" : "SHORT",
        risk, tp, sl, candles, closes, rsi, stoch, macdData, bb, kdj,
        vol: (Math.random()*5000+500).toFixed(0),
        interval, indicator,
      };
    });
  }
}

const RISK_CFG = {
  low:    {lbl:"Güvenli",color:"#0ecb81",bg:"#0ecb8115",icon:"🛡️"},
  medium: {lbl:"Dikkat", color:"#f0b90b",bg:"#f0b90b15",icon:"⚡"},
  high:   {lbl:"Riskli", color:"#f6465d",bg:"#f6465d15",icon:"🔥"},
};

const INTERVALS = ["1m","5m","15m","1h","4h","1d"];
// INDICATORS removed (unused)

/* ══════════════════════════════════════════
   CANDLESTICK CHART
══════════════════════════════════════════ */
function CandleChart({ candles, indicator, height = 220, rsi, stoch, macdData, bb, kdj }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);

  const W = 358, H = height;
  const IH = 80; // indicator panel height
  const CH = H - IH - 2; // candle area height

  const visible = candles.slice(-60);
  const cw = W / visible.length;
  const prices = visible.flatMap(c => [c.h, c.l]);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;
  const py = v => CH - ((v - minP) / rangeP) * (CH - 10) - 2;

  // BB lines on candle chart
  const bbVisible = bb ? bb.slice(-60) : [];
  const bbPath = (arr, key) => arr.map((b,i) => `${i===0?"M":"L"}${(i+.5)*cw},${py(b[key])}`).join(" ");

  // Indicator data (last 60)
  const n = visible.length;
  const getInd = arr => (arr || []).slice(-(n+20)).slice(-n);

  const rsiV   = getInd(rsi);
  const stochK = getInd(stoch?.k);
  const stochD = getInd(stoch?.d);
  const macdH  = getInd(macdData?.hist);
  const macdL  = getInd(macdData?.macd);
  const macdS  = getInd(macdData?.signal);
  const kdjK   = getInd(kdj?.K);
  const kdjD   = getInd(kdj?.D);
  const kdjJ   = getInd(kdj?.J);

  const indY = (v, min, max) => IH - ((v-min)/(max-min||1)) * (IH-6) - 2;

  const linePath = (arr, min, max, color) => {
    if (!arr.length) return null;
    const d = arr.map((v,i) => `${i===0?"M":"L"}${(i+.5)*cw},${CH+2+indY(v,min,max)}`).join(" ");
    return <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>;
  };

  const histBars = (arr, min, max) => arr.map((v,i) => {
    const zero = CH+2+indY(0,min,max);
    const y = CH+2+indY(v,min,max);
    return <rect key={i} x={(i+.1)*cw} y={Math.min(y,zero)} width={cw*.8} height={Math.abs(y-zero)||1}
      fill={v>=0?"#0ecb8188":"#f6465d88"}/>;
  });

  let indMin=0, indMax=100, indContent=null;
  if (indicator === "RSI") {
    indContent = (<>
      {linePath(rsiV,0,100,"#f0b90b")}
      <line x1="0" y1={CH+2+indY(70,0,100)} x2={W} y2={CH+2+indY(70,0,100)} stroke="#f6465d44" strokeDasharray="3"/>
      <line x1="0" y1={CH+2+indY(30,0,100)} x2={W} y2={CH+2+indY(30,0,100)} stroke="#0ecb8144" strokeDasharray="3"/>
      {rsiV.length>0&&<text x={4} y={CH+10} fontSize="9" fill="#f0b90b" fontFamily="JetBrains Mono">STOCHRSI: {rsiV[rsiV.length-1]?.toFixed(2)}</text>}
    </>);
  } else if (indicator === "STOCHRSI") {
    indContent = (<>
      {linePath(stochK,0,100,"#f0b90b")}
      {linePath(stochD,0,100,"#a78bfa")}
      <line x1="0" y1={CH+2+indY(80,0,100)} x2={W} y2={CH+2+indY(80,0,100)} stroke="#f6465d44" strokeDasharray="3"/>
      <line x1="0" y1={CH+2+indY(20,0,100)} x2={W} y2={CH+2+indY(20,0,100)} stroke="#0ecb8144" strokeDasharray="3"/>
      {stochK.length>0&&<>
        <text x={4} y={CH+10} fontSize="9" fill="#f0b90b" fontFamily="JetBrains Mono">K:{stochK[stochK.length-1]?.toFixed(2)}</text>
        <text x={60} y={CH+10} fontSize="9" fill="#a78bfa" fontFamily="JetBrains Mono">D:{stochD[stochD.length-1]?.toFixed(2)}</text>
      </>}
    </>);
  } else if (indicator === "MACD") {
    const allV = [...(macdH||[]),...(macdL||[]),...(macdS||[])];
    indMin = Math.min(...allV); indMax = Math.max(...allV);
    indContent = (<>
      {histBars(macdH, indMin, indMax)}
      {linePath(macdL, indMin, indMax, "#0ecb81")}
      {linePath(macdS, indMin, indMax, "#f6465d")}
      {macdL.length>0&&<>
        <text x={4} y={CH+10} fontSize="9" fill="#0ecb81" fontFamily="JetBrains Mono">MACD:{macdL[macdL.length-1]?.toFixed(2)}</text>
        <text x={90} y={CH+10} fontSize="9" fill="#f6465d" fontFamily="JetBrains Mono">SIG:{macdS[macdS.length-1]?.toFixed(2)}</text>
      </>}
    </>);
  } else if (indicator === "KDJ") {
    const allV = [...(kdjK||[]),...(kdjD||[]),...(kdjJ||[])];
    indMin = Math.min(-5,...allV); indMax = Math.max(105,...allV);
    indContent = (<>
      {linePath(kdjK,indMin,indMax,"#f0b90b")}
      {linePath(kdjD,indMin,indMax,"#f6465d")}
      {linePath(kdjJ,indMin,indMax,"#a78bfa")}
      {kdjK.length>0&&<>
        <text x={4} y={CH+10} fontSize="9" fill="#f0b90b" fontFamily="JetBrains Mono">K:{kdjK[kdjK.length-1]?.toFixed(2)}</text>
        <text x={60} y={CH+10} fontSize="9" fill="#f6465d" fontFamily="JetBrains Mono">D:{kdjD[kdjD.length-1]?.toFixed(2)}</text>
        <text x={116} y={CH+10} fontSize="9" fill="#a78bfa" fontFamily="JetBrains Mono">J:{kdjJ[kdjJ.length-1]?.toFixed(2)}</text>
      </>}
    </>);
  } else if (indicator === "BB") {
    indContent = linePath(rsiV,0,100,"#f0b90b");
  }

  return (
    <div style={{position:"relative",userSelect:"none"}}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block"}}
        onMouseLeave={()=>setTooltip(null)}
        onMouseMove={e=>{
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mx = (e.clientX - rect.left) * (W / rect.width);
          const idx = Math.min(Math.floor(mx / cw), visible.length-1);
          if (idx >= 0) setTooltip({...visible[idx], idx});
        }}>

        {/* Grid */}
        {[0.2,0.4,0.6,0.8].map(t=>(
          <line key={t} x1="0" y1={t*CH} x2={W} y2={t*CH} stroke="#1c2340" strokeWidth=".5"/>
        ))}

        {/* Price labels */}
        {[0,0.25,0.5,0.75,1].map(t=>{
          const v = maxP - t*rangeP;
          return <text key={t} x={W-2} y={py(v)+3} fontSize="8" fill="#848e9c" textAnchor="end" fontFamily="JetBrains Mono">
            {v>1?v.toFixed(2):v.toFixed(4)}
          </text>;
        })}

        {/* BB bands on candle chart */}
        {indicator === "BB" && bbVisible.length > 0 && (<>
          <path d={bbPath(bbVisible,"upper")} fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3"/>
          <path d={bbPath(bbVisible,"mid")}   fill="none" stroke="#f0b90b" strokeWidth="1"/>
          <path d={bbPath(bbVisible,"lower")} fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3"/>
        </>)}

        {/* Candles */}
        {visible.map((c, i) => {
          const x = (i + .5) * cw;
          const isGreen = c.c >= c.o;
          const clr = isGreen ? "#0ecb81" : "#f6465d";
          const bodyTop = py(Math.max(c.o, c.c));
          const bodyH = Math.max(1, Math.abs(py(c.o) - py(c.c)));
          return (
            <g key={i} opacity={tooltip?.idx===i?1:.92}>
              <line x1={x} y1={py(c.h)} x2={x} y2={py(c.l)} stroke={clr} strokeWidth=".8"/>
              <rect x={(i+.15)*cw} y={bodyTop} width={cw*.7} height={bodyH}
                fill={isGreen?"#0ecb81":"#f6465d"} rx=".5"/>
            </g>
          );
        })}

        {/* Tooltip vertical line */}
        {tooltip && <line x1={(tooltip.idx+.5)*cw} y1="0" x2={(tooltip.idx+.5)*cw} y2={CH}
          stroke="#848e9c" strokeWidth=".5" strokeDasharray="3"/>}

        {/* Divider */}
        <line x1="0" y1={CH+1} x2={W} y2={CH+1} stroke="#1c2340" strokeWidth="1"/>

        {/* Indicator area */}
        {indContent}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div style={{
          position:"absolute",top:4,left:4,
          background:"#161b2eee",border:"1px solid #2b3158",borderRadius:8,
          padding:"6px 10px",fontSize:9,fontFamily:"JetBrains Mono,monospace",
          pointerEvents:"none",lineHeight:1.8,
        }}>
          <div style={{color:"#848e9c"}}>O: <span style={{color:tooltip.c>=tooltip.o?"#0ecb81":"#f6465d"}}>{tooltip.o>1?tooltip.o.toFixed(4):tooltip.o.toFixed(5)}</span></div>
          <div style={{color:"#848e9c"}}>H: <span style={{color:"#0ecb81"}}>{tooltip.h>1?tooltip.h.toFixed(4):tooltip.h.toFixed(5)}</span></div>
          <div style={{color:"#848e9c"}}>L: <span style={{color:"#f6465d"}}>{tooltip.l>1?tooltip.l.toFixed(4):tooltip.l.toFixed(5)}</span></div>
          <div style={{color:"#848e9c"}}>C: <span style={{color:tooltip.c>=tooltip.o?"#0ecb81":"#f6465d"}}>{tooltip.c>1?tooltip.c.toFixed(4):tooltip.c.toFixed(5)}</span></div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   RING CHART
══════════════════════════════════════════ */
function Ring({value,color,size=72,label}){
  const r=30,circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <svg width={size} height={size} viewBox="0 0 70 70" style={{transform:"rotate(-90deg)"}}>
        <circle cx="35" cy="35" r={r} fill="none" stroke="#1c2340" strokeWidth="7"/>
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={`${circ*value/100} ${circ}`}
          style={{transition:"stroke-dasharray .5s"}}/>
        <text x="35" y="39" textAnchor="middle" fill={color} fontSize="13" fontWeight="800"
          fontFamily="Nunito,sans-serif" transform="rotate(90,35,35)">{value}%</text>
      </svg>
      {label&&<span style={{fontSize:9,color:"#848e9c",letterSpacing:.5}}>{label}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════
   ATIK ANALİZ LOGO SVG
══════════════════════════════════════════ */
function AtikLogo({size=32}){
  return(
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="lg1" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0ecb81"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      {/* Hawk/eagle wings + chart bars — Atik Analiz style */}
      <path d="M20 6 L8 20 L14 18 L20 30 L26 18 L32 20 Z" fill="url(#lg1)" opacity=".9"/>
      <path d="M4 22 L20 12 L36 22" fill="none" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* bars */}
      <rect x="10" y="26" width="4" height="8" rx="1" fill="#0ecb81" opacity=".7"/>
      <rect x="16" y="22" width="4" height="12" rx="1" fill="#0ecb81" opacity=".85"/>
      <rect x="22" y="18" width="4" height="16" rx="1" fill="#0ecb81"/>
      <rect x="28" y="24" width="4" height="10" rx="1" fill="#06b6d4" opacity=".8"/>
      {/* Arrow up */}
      <path d="M30 6 L36 6 L36 12" stroke="#0ecb81" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M30 12 L36 6" stroke="#0ecb81" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function AtikAnaliz() {
  const [tab, setTab] = useState("home");
  const [coins, setCoins] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [autoTrade, setAutoTrade] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [leverage, setLeverage] = useState(10);
  const [balance, setBalance] = useState(100);
  const [riskFilter, setRiskFilter] = useState("all");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartInterval, setChartInterval] = useState("15m");
  const [indicator, setIndicator] = useState("STOCHRSI");
  const [useAdvancedChart, setUseAdvancedChart] = useState(false);
  const [selectedAdvancedIndicators, setSelectedAdvancedIndicators] = useState(['ichimoku', 'volume']);
  // Tarama parametreleri (ana ekranda seçilir)
  const [scanInterval, setScanInterval] = useState("15m");
  const [scanIndicator, setScanIndicator] = useState("STOCHRSI");
  const [positions, setPositions] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [pnl, setPnl] = useState(0);
  const [tgToken, setTgToken] = useState("");
  const [tgChat, setTgChat] = useState("");
  const [manualOrder, setManualOrder] = useState({dir:"LONG",size:"",lev:"",tp:"",sl:""});
  const [alarmForm, setAlarmForm] = useState({sym:"",price:"",type:"above"});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const scanRef = useRef(null);
  const posRef  = useRef(positions);
  posRef.current = positions;

  const snd = useCallback(t => { if (soundOn) SND.play(t); }, [soundOn]);
  const log = useCallback((msg, type="info") => {
    console.log(`[${type.toUpperCase()}] ${msg}`);
    // Optional: Add toast notification here
  }, []);
  const tg = useCallback(async msg => {
    if (!tgToken || !tgChat) return;
    try { await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:tgChat,text:`🦅 <b>ATİK ANALİZ</b>\n${msg}`,parse_mode:"HTML"})}); } catch(e){}
  }, [tgToken, tgChat]);

  const runScan = useCallback(async () => {
    try {
      const fresh = await analyzeCoins(scanInterval, scanIndicator);
      fresh.sort((a,b) => b.conf - a.conf);
      setCoins(fresh);
      snd("tick");

      // Update selected coin data
      if (selectedCoin) {
        const updated = fresh.find(c => c.s === selectedCoin.s);
        if (updated) setSelectedCoin(updated);
      }

      // Alarm check
      setAlarms(prev => prev.map(al => {
        if (al.triggered) return al;
        const c = fresh.find(x => x.s === al.sym);
        if (!c) return al;
        const hit = al.type === "above" ? c.price >= al.price : c.price <= al.price;
        if (hit) {
          snd("alarm");
          log(`🔔 ALARM: ${al.sym} ${al.type==="above"?"↑":"↓"} $${al.price}`, "alarm");
          tg(`🔔 ALARM TETİKLENDİ!\n${al.sym}/USDT\nHedef: $${al.price}\nGüncel: $${c.price.toFixed(4)}`);
          return {...al, triggered:true};
        }
        return al;
      }));

      // Auto trade
      if (autoTrade) {
        fresh.filter(c => c.conf >= 80).forEach(c => {
          if (!posRef.current.find(p => p.sym === c.s && p.open)) {
            const pos = {id:Date.now()+Math.random(),sym:c.s,dir:c.dir,entry:c.price,tp:c.tp,sl:c.sl,lev:leverage,bal:balance,pnl:0,open:true,auto:true,time:new Date().toLocaleTimeString("tr-TR")};
            setPositions(p => [pos,...p].slice(0,15));
            snd(c.dir==="LONG"?"buy":"sell");
            log(`${c.dir==="LONG"?"🟢":"🔴"} OTO ${c.dir}: ${c.s} @ $${c.price.toFixed(4)}`, c.dir==="LONG"?"buy":"sell");
            tg(`${c.dir==="LONG"?"🟢":"🔴"} <b>OTO ${c.dir}</b>\n${c.s}/USDT @ $${c.price.toFixed(4)}\nTP:$${c.tp.toFixed(4)} SL:$${c.sl.toFixed(4)}\nKaldıraç:${leverage}x`);
          }
        });
      }

      // Update P&L
      setPositions(prev => {
        const updated = prev.map(pos => {
          if (!pos.open) return pos;
          const c = fresh.find(x => x.s === pos.sym);
          if (!c) return pos;
          const diff = pos.dir==="LONG" ? (c.price-pos.entry)/pos.entry : (pos.entry-c.price)/pos.entry;
          return {...pos, cur:c.price, pnl:+(diff*pos.bal*pos.lev).toFixed(2)};
        });
        setPnl(updated.reduce((s,p) => s+(p.pnl||0), 0));
        return updated;
      });
    } catch (error) {
      console.error('Scan error:', error);
      log('❌ Tarama hatası: API bağlantısı başarısız', 'error');
    }
  }, [snd, log, tg, autoTrade, leverage, balance, selectedCoin, scanInterval, scanIndicator]);

  useEffect(() => {
    if (scanning) {
      runScan();
      scanRef.current = setInterval(() => runScan(), 5000);
    } else { clearInterval(scanRef.current); }
    return () => clearInterval(scanRef.current);
  }, [scanning, runScan]);

  useEffect(() => {
    if (scanning) { clearInterval(scanRef.current); scanRef.current = setInterval(runScan, 5000); }
  }, [runScan, scanning]);

  const filtered = coins.filter(c => riskFilter==="all" || c.risk===riskFilter);
  const openPos = positions.filter(p => p.open);

  const sentiment = coins.length ? Math.round(coins.reduce((s,c)=>s+c.ls,0)/coins.length) : 50;
  const sentColor = sentiment>65?"#0ecb81":sentiment<35?"#f6465d":"#f0b90b";

  // Manual order submit
  const submitManual = (coin) => {
    if (!coin) return;
    const price = coin.price;
    const sz = parseFloat(manualOrder.size) || balance;
    const lv = parseFloat(manualOrder.lev) || leverage;
    const tp = parseFloat(manualOrder.tp) || coin.tp;
    const sl = parseFloat(manualOrder.sl) || coin.sl;
    const pos = {id:Date.now(),sym:coin.s,dir:manualOrder.dir,entry:price,tp,sl,lev:lv,bal:sz,pnl:0,open:true,auto:false,time:new Date().toLocaleTimeString("tr-TR")};
    setPositions(p => [pos,...p].slice(0,15));
    snd(manualOrder.dir==="LONG"?"buy":"sell");
    log(`${manualOrder.dir==="LONG"?"🟢":"🔴"} MANUEL ${manualOrder.dir}: ${coin.s} @ $${price.toFixed(4)} ${lv}x`, manualOrder.dir==="LONG"?"buy":"sell");
    tg(`${manualOrder.dir==="LONG"?"🟢":"🔴"} <b>MANUEL ${manualOrder.dir}</b>\n${coin.s}/USDT @ $${price.toFixed(4)}\nTP:$${tp.toFixed?tp.toFixed(4):tp} SL:$${sl.toFixed?sl.toFixed(4):sl}\nKaldıraç:${lv}x`);
  };

  /* ── INPUT STYLE ── */
  const inp = {background:"#161b2e",border:"1px solid #2b3158",borderRadius:8,padding:"9px 12px",color:"#eaecef",fontSize:12,fontFamily:"Nunito,sans-serif",width:"100%"};
  const btn = (c,bg,br) => ({padding:"10px 14px",borderRadius:9,border:br?`1px solid ${c}`:"none",background:bg||c,color:bg?c:"#0b0e17",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer",transition:"all .2s"});

  return (
    <div style={{minHeight:"100vh",background:"#0b0e17",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <G/>
      {/* Ambient glow */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:400,height:200,background:"radial-gradient(ellipse,#0ecb8108 0%,transparent 70%)",pointerEvents:"none"}}/>

      {/* ── PHONE FRAME ── */}
      <div style={{
        width:390,maxHeight:"92vh",background:"#111520",borderRadius:44,
        border:"2px solid #1c2340",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 0 0 1px #0b0e17,0 40px 80px rgba(0,0,0,.9),0 0 60px rgba(14,203,129,.06),0 0 0 8px #0b0e17",
        position:"relative",fontFamily:"Nunito,sans-serif",
      }}>

        {/* STATUS BAR */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 24px 4px",background:"#111520",flexShrink:0}}>
          <span style={{fontSize:13,fontWeight:700}}>9:41</span>
          <div style={{width:110,height:24,background:"#0b0e17",borderRadius:12}}/>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            {[3,5,7,9].map((h,i)=>(<div key={i} style={{width:3,height:h,background:i<3?"#eaecef":"#2b3158",borderRadius:1}}/>))}
            <span style={{fontSize:11,marginLeft:2}}>100%</span>
          </div>
        </div>

        {/* APP HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 16px 10px",background:"#111520",borderBottom:"1px solid #161b2e",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <AtikLogo size={34}/>
            <div>
              <div style={{fontSize:16,fontWeight:900,background:"linear-gradient(90deg,#0ecb81,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:.5}}>
                AtikAnaliz
              </div>
              <div style={{fontSize:9,color:"#848e9c",letterSpacing:1.5,marginTop:-2}}>HIZLA ANALİZ ET, AKILLA KAZAN</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {scanning&&<div style={{width:6,height:6,borderRadius:"50%",background:"#0ecb81",animation:"pulse 1s infinite"}}/>}
            <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:800,fontFamily:"JetBrains Mono,monospace",color:pnl>=0?"#0ecb81":"#f6465d"}}>
              {pnl>=0?"+":""}{pnl.toFixed(2)}$
            </div>
            <button onClick={()=>setSoundOn(s=>!s)} style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:13,color:"#848e9c"}}>
              {soundOn?"🔊":"🔇"}
            </button>
          </div>
        </div>

        {/* SCROLL CONTENT */}
        <div style={{flex:1,overflowY:"auto",background:"#111520"}}>

          {/* ══ HOME ══ */}
          {tab==="home" && (
            <div style={{padding:"14px 14px 8px"}}>
              <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>SNAPSHOTS</div>

              {/* Top cards */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {/* Market */}
                <div style={{background:"#161b2e",border:"1px solid #1c2340",borderRadius:16,padding:"12px"}}>
                  <div style={{fontSize:9,color:"#848e9c",letterSpacing:1,marginBottom:6}}>Piyasa Durumu</div>
                  <GaugeSVG value={sentiment} color={sentColor}/>
                  <div style={{textAlign:"center",fontSize:13,fontWeight:800,color:sentColor,marginTop:4}}>
                    {sentiment>65?"Yükseliş":sentiment<35?"Düşüş":"Nötr"}
                  </div>
                  <div style={{textAlign:"center",fontSize:9,color:"#848e9c",marginTop:2}}>
                    {coins.length>0?`BTC: ${coins.find(c=>c.s==="BTC")?.change24?.toFixed(1)||"--"}%`:"Tarama bekleniyor"}
                  </div>
                </div>

                {/* Portfolio */}
                <div style={{background:"#161b2e",border:"1px solid #1c2340",borderRadius:16,padding:"12px"}}>
                  <div style={{fontSize:9,color:"#848e9c",letterSpacing:1,marginBottom:6}}>Portföy Özeti</div>
                  <div style={{fontSize:22,fontWeight:900,color:pnl>=0?"#0ecb81":"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>
                    $ {(balance+pnl).toFixed(2)}
                  </div>
                  <div style={{fontSize:11,color:pnl>=0?"#0ecb81":"#f6465d",marginTop:2}}>
                    {pnl>=0?"▲":"▼"} {Math.abs(pnl/balance*100).toFixed(2)}%
                  </div>
                  <div style={{marginTop:8,fontSize:10,color:"#848e9c"}}>Açık: {openPos.length} poz.</div>
                </div>
              </div>

              {/* AI Sentiment */}
              <div style={{background:"#161b2e",border:"1px solid #1c2340",borderRadius:16,padding:"14px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,color:"#848e9c",letterSpacing:1,marginBottom:4}}>Yapay Zeka Duyarlılığı</div>
                    <div style={{fontSize:24,fontWeight:900,color:sentColor}}>{sentiment}%</div>
                    <div style={{fontSize:11,color:"#848e9c",marginTop:2}}>
                      {sentiment>65?"Yüksek Alım":sentiment<35?"Satış Baskısı":"Denge"}
                    </div>
                  </div>
                  <Ring value={sentiment} color={sentColor} size={76} label={sentiment>65?"Yüksek Al":sentiment<35?"Sat":"Bekle"}/>
                </div>
              </div>

              {/* ── TARAMA PARAMETRELERİ ── */}
              <div style={{background:"linear-gradient(135deg,#161b2e,#1a2035)",border:"1px solid #2b3158",borderRadius:16,padding:"14px",marginBottom:10,boxShadow:"0 4px 20px #0b0e1780"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#0ecb81",boxShadow:"0 0 8px #0ecb81"}}/>
                  <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,fontWeight:700}}>TARAMA PARAMETRELERİ</div>
                </div>

                {/* Zaman Dilimi */}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:9,color:"#06b6d4",marginBottom:6,letterSpacing:1.5,fontWeight:700}}>⏱ ZAMAN DİLİMİ</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {["1m","5m","15m","1h","4h","1d"].map(iv=>{
                      const active = scanInterval===iv;
                      return(
                        <button key={iv} onClick={()=>{setScanInterval(iv);if(scanning){setScanning(false);setTimeout(()=>setScanning(true),100);}snd("tick");}} style={{
                          padding:"6px 13px",borderRadius:8,
                          border:`1px solid ${active?"#06b6d4":"#2b3158"}`,
                          background:active?"#06b6d418":"#0b0e17",
                          color:active?"#06b6d4":"#848e9c",
                          fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"JetBrains Mono,monospace",
                          transition:"all .2s",
                          boxShadow:active?"0 0 12px #06b6d428":"none",
                        }}>{iv}</button>
                      );
                    })}
                  </div>
                </div>

                {/* İndikatör */}
                <div style={{marginBottom:4}}>
                  <div style={{fontSize:9,color:"#a78bfa",marginBottom:6,letterSpacing:1.5,fontWeight:700}}>📊 SİNYAL İNDİKATÖRÜ</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[
                      {k:"STOCHRSI",lbl:"StochRSI"},
                      {k:"RSI",     lbl:"RSI"},
                      {k:"MACD",    lbl:"MACD"},
                      {k:"KDJ",     lbl:"KDJ"},
                      {k:"BB",      lbl:"Bollinger"},
                    ].map(({k,lbl})=>{
                      const active = scanIndicator===k;
                      return(
                        <button key={k} onClick={()=>{setScanIndicator(k);if(scanning){setScanning(false);setTimeout(()=>setScanning(true),100);}snd("tick");}} style={{
                          padding:"6px 10px",borderRadius:8,
                          border:`1px solid ${active?"#a78bfa":"#2b3158"}`,
                          background:active?"#a78bfa18":"#0b0e17",
                          color:active?"#a78bfa":"#848e9c",
                          fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"JetBrains Mono,monospace",
                          transition:"all .2s",
                          boxShadow:active?"0 0 12px #a78bfa28":"none",
                        }}>{lbl}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Active badge */}
                {scanning && (
                  <div style={{marginTop:10,display:"flex",gap:6,alignItems:"center",background:"linear-gradient(90deg,#0ecb8110,#06b6d408)",borderRadius:9,padding:"8px 12px",border:"1px solid #0ecb8120"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:"#0ecb81",animation:"pulse 1s infinite",flexShrink:0,boxShadow:"0 0 8px #0ecb81"}}/>
                    <span style={{fontSize:10,color:"#0ecb81",fontWeight:700}}>
                      {IV_CFG[scanInterval]?.label} · <span style={{color:"#a78bfa"}}>{scanIndicator}</span> ile aktif tarama
                    </span>
                  </div>
                )}
              </div>

              {/* Scan & Auto buttons */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                <button onClick={()=>{setScanning(s=>{const n=!s;log(n?"⚡ Tarama başlatıldı":"🛑 Tarama durduruldu",n?"info":"warn");return n;})}} style={{
                  padding:"14px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,
                  background:scanning?"linear-gradient(135deg,#0ecb81,#06b6d4)":"#161b2e",
                  border:`1px solid ${scanning?"transparent":"#2b3158"}`,
                  color:scanning?"#0b0e17":"#0ecb81",transition:"all .25s",
                  boxShadow:scanning?"0 4px 20px #0ecb8140":"none",
                }}>{scanning?"🛑 DURDUR":"⚡ TARAMA"}</button>

                <button onClick={()=>{setAutoTrade(s=>{const n=!s;snd(n?"buy":"tick");log(n?"🚀 Oto-işlem AKTİF":"🛑 Oto durduruldu",n?"buy":"warn");if(n)tg("🚀 Otomatik işlem aktif!");return n;})}} style={{
                  padding:"14px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,
                  background:autoTrade?"linear-gradient(135deg,#f6465d,#ff7060)":"#161b2e",
                  border:`1px solid ${autoTrade?"transparent":"#2b3158"}`,
                  color:autoTrade?"#fff":"#f6465d",transition:"all .25s",
                  boxShadow:autoTrade?"0 4px 20px #f6465d40":"none",
                }}>{autoTrade?"🛑 OTO-DUR":"🚀 OTO-İŞLEM"}</button>
              </div>

              {/* ATİK SİNYALLER */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,fontWeight:700}}>ATİK SİNYALLER</div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <span style={{fontSize:9,background:"#0b0e17",color:"#a78bfa",border:"1px solid #a78bfa30",borderRadius:5,padding:"2px 8px",fontFamily:"JetBrains Mono,monospace",fontWeight:700}}>{scanIndicator}</span>
                  <span style={{fontSize:9,background:"#0b0e17",color:"#06b6d4",border:"1px solid #06b6d430",borderRadius:5,padding:"2px 8px",fontFamily:"JetBrains Mono,monospace",fontWeight:700}}>{scanInterval}</span>
                  {coins.length>0&&<span style={{fontSize:9,background:"#0ecb8110",color:"#0ecb81",border:"1px solid #0ecb8130",borderRadius:5,padding:"2px 8px",fontWeight:700}}>{coins.slice(0,5).length} sinyal</span>}
                </div>
              </div>
              {coins.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#2b3158",fontSize:12}}>⚡ Taramayı başlatın</div>}
              {coins.slice(0,5).map((c,i)=>(
                <SignalRow key={c.s} coin={c} delay={i*50}
                  onPress={()=>{setSelectedCoin(c);setTab("chart");}}
                  snd={snd}/>
              ))}
            </div>
          )}

          {/* ══ CHART / ANALİZ ══ */}
          {tab==="chart" && (
            <div style={{padding:"10px 12px 8px"}}>
              {!selectedCoin ? (
                <div style={{textAlign:"center",padding:"60px 0",color:"#848e9c"}}>
                  <div style={{fontSize:36,marginBottom:8}}>📊</div>
                  <div>Sinyaller'den bir coin seçin</div>
                </div>
              ) : (
                <>
                  {/* Coin header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:18,fontWeight:900}}>{selectedCoin.sym}</div>
                      <div style={{fontSize:22,fontWeight:900,color:selectedCoin.change24>=0?"#0ecb81":"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>
                        {selectedCoin.price>1?selectedCoin.price.toFixed(4):selectedCoin.price.toFixed(5)}
                      </div>
                      <div style={{fontSize:11,color:selectedCoin.change24>=0?"#0ecb81":"#f6465d"}}>
                        {selectedCoin.change24>=0?"▲":"▼"}{Math.abs(selectedCoin.change24).toFixed(2)}%
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{
                        background:selectedCoin.dir==="LONG"?"#0ecb8115":"#f6465d15",
                        color:selectedCoin.dir==="LONG"?"#0ecb81":"#f6465d",
                        border:`1px solid ${selectedCoin.dir==="LONG"?"#0ecb8133":"#f6465d33"}`,
                        borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:900,marginBottom:4,
                      }}>{selectedCoin.dir}</div>
                      <div style={{fontSize:20,fontWeight:900,color:RISK_CFG[selectedCoin.risk].color}}>{selectedCoin.conf}%</div>
                      <div style={{fontSize:9,color:RISK_CFG[selectedCoin.risk].color,letterSpacing:1}}>{RISK_CFG[selectedCoin.risk].icon} {RISK_CFG[selectedCoin.risk].lbl.toUpperCase()}</div>
                    </div>
                  </div>

                  {/* Interval selector */}
                  <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto"}}>
                    {INTERVALS.map(iv=>(
                      <button key={iv} onClick={()=>{setChartInterval(iv);snd("tick");}} style={{
                        flexShrink:0,padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",
                        fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:11,
                        background:chartInterval===iv?"#0ecb81":"#161b2e",
                        color:chartInterval===iv?"#0b0e17":"#848e9c",
                      }}>{iv}</button>
                    ))}
                  </div>

                  {/* Chart Type Toggle */}
                  <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto"}}>
                    <button 
                      onClick={()=>{setUseAdvancedChart(!useAdvancedChart);snd("tick");}} 
                      style={{
                        flexShrink:0,padding:"4px 10px",borderRadius:6,cursor:"pointer",
                        border:`1px solid ${useAdvancedChart?"#a78bfa":"#2b3158"}`,
                        background:useAdvancedChart?"#a78bfa15":"transparent",
                        color:useAdvancedChart?"#a78bfa":"#848e9c",
                        fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:10,
                      }}
                    >
                      {useAdvancedChart?"🎯 Gelişmiş":"📊 Standart"}
                    </button>
                  </div>

                  {/* Indicator selector — Binance style */}
                  {!useAdvancedChart && (
                    <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto"}}>
                      {["STOCHRSI","RSI","MACD","KDJ","BB"].map(ind=>(
                        <button key={ind} onClick={()=>{setIndicator(ind);snd("tick");}} style={{
                          flexShrink:0,padding:"4px 10px",borderRadius:6,cursor:"pointer",
                          border:`1px solid ${indicator===ind?"#0ecb8166":"#2b3158"}`,
                          fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:10,
                          background:indicator===ind?"#0ecb8115":"transparent",
                          color:indicator===ind?"#0ecb81":"#848e9c",
                        }}>{ind}</button>
                      ))}
                    </div>
                  )}

                  {/* Advanced Indicators Selector */}
                  {useAdvancedChart && (
                    <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto"}}>
                      {[
                        {key:'ichimoku',label:'Ichimoku',color:'#0ecb81'},
                        {key:'elliott',label:'Elliott',color:'#a78bfa'},
                        {key:'fibonacci',label:'Fibonacci',color:'#f0b90b'},
                        {key:'volume',label:'Volume',color:'#06b6d4'},
                        {key:'structure',label:'Structure',color:'#f6465d'}
                      ].map(ind=>(
                        <button 
                          key={ind.key} 
                          onClick={()=>{setSelectedAdvancedIndicators(prev => 
                            prev.includes(ind.key) 
                              ? prev.filter(k=>k!==ind.key)
                              : [...prev,ind.key]
                          );snd("tick");}} 
                          style={{
                            flexShrink:0,padding:"4px 8px",borderRadius:6,cursor:"pointer",
                            border:`1px solid ${selectedAdvancedIndicators.includes(ind.key)?ind.color:"#2b3158"}`,
                            background:selectedAdvancedIndicators.includes(ind.key)?`${ind.color}15`:"transparent",
                            color:selectedAdvancedIndicators.includes(ind.key)?ind.color:"#848e9c",
                            fontFamily:"JetBrains Mono,monospace",fontWeight:700,fontSize:9,
                          }}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* RISK MANAGER */}
                  <RiskManager
                    isAuthenticated={isAuthenticated}
                    balance={balance}
                    leverage={leverage}
                    onRiskUpdate={(score) => {
                      console.log('Risk score updated:', score);
                    }}
                    onAlert={(alert) => {
                      log(alert.message, 'warning');
                    }}
                  />

                  {/* REAL TRADING PANEL */}
                  <RealTradingPanel
                    coin={selectedCoin}
                    isAuthenticated={isAuthenticated}
                    leverage={leverage}
                    balance={balance}
                    onPositionOpened={(pos) => {
                      setPositions(p => [pos,...p].slice(0,15));
                      snd(pos.dir==="LONG"?"buy":"sell");
                      log(`🎯 GERÇEK ${pos.dir}: ${pos.symbol} @ ${pos.price || 'MARKET'}`, pos.dir==="LONG"?"buy":"sell");
                    }}
                    onPositionClosed={(pos) => {
                      setPositions(p => p.map(x => x.id===pos.id?{...x,open:false}:x));
                      log(`🔒 GERÇEK Kapatıldı: ${pos.symbol}`, "sell");
                    }}
                    onNotification={(msg, type) => {
                      log(msg, type);
                    }}
                  />

                  {/* ML SIGNAL PANEL */}
                  <MLSignalPanel
                    coins={coins}
                    selectedCoin={selectedCoin}
                    isAuthenticated={isAuthenticated}
                    onSignalUpdate={(signal) => {
                      console.log('ML optimized signal:', signal);
                    }}
                  />

                  {/* CANDLESTICK/ADVANCED CHART */}
                  <div style={{background:"#0b0e17",borderRadius:12,overflow:"hidden",marginBottom:8,border:"1px solid #1c2340"}}>
                    {useAdvancedChart ? (
                      <AdvancedChart
                        candles={selectedCoin.candles}
                        height={300}
                        selectedIndicators={selectedAdvancedIndicators}
                        onSignalUpdate={(signal) => {
                          console.log('Advanced signal:', signal);
                        }}
                      />
                    ) : (
                      <CandleChart
                        candles={selectedCoin.candles}
                        indicator={indicator}
                        height={300}
                        rsi={selectedCoin.rsi}
                        stoch={selectedCoin.stoch}
                        macdData={selectedCoin.macdData}
                        bb={selectedCoin.bb}
                        kdj={selectedCoin.kdj}
                      />
                    )}
                  </div>

                  {/* Indicators row — Binance style */}
                  <div style={{display:"flex",gap:6,fontSize:10,marginBottom:10,fontFamily:"JetBrains Mono,monospace",flexWrap:"wrap"}}>
                    <span style={{color:"#f0b90b"}}>STOCHRSI: {selectedCoin.stoch?.k?.slice(-1)[0]?.toFixed(2)||"--"}</span>
                    <span style={{color:"#a78bfa"}}>MASTOCHRSI: {selectedCoin.stoch?.d?.slice(-1)[0]?.toFixed(2)||"--"}</span>
                  </div>
                  <div style={{display:"flex",gap:6,fontSize:10,marginBottom:12,fontFamily:"JetBrains Mono,monospace",flexWrap:"wrap"}}>
                    <span style={{color:"#f0b90b"}}>K: {selectedCoin.kdj?.K?.slice(-1)[0]?.toFixed(2)||"--"}</span>
                    <span style={{color:"#f6465d"}}>D: {selectedCoin.kdj?.D?.slice(-1)[0]?.toFixed(2)||"--"}</span>
                    <span style={{color:"#a78bfa"}}>J: {selectedCoin.kdj?.J?.slice(-1)[0]?.toFixed(2)||"--"}</span>
                  </div>

                  {/* TP / SL */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    <div style={{background:"#0ecb8110",border:"1px solid #0ecb8133",borderRadius:10,padding:"10px"}}>
                      <div style={{fontSize:9,color:"#848e9c",marginBottom:2}}>HEDEF (TP)</div>
                      <div style={{fontSize:14,fontWeight:800,color:"#0ecb81",fontFamily:"JetBrains Mono,monospace"}}>${selectedCoin.tp>1?selectedCoin.tp.toFixed(4):selectedCoin.tp.toFixed(5)}</div>
                    </div>
                    <div style={{background:"#f6465d10",border:"1px solid #f6465d33",borderRadius:10,padding:"10px"}}>
                      <div style={{fontSize:9,color:"#848e9c",marginBottom:2}}>ZARAR (SL)</div>
                      <div style={{fontSize:14,fontWeight:800,color:"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>${selectedCoin.sl>1?selectedCoin.sl.toFixed(4):selectedCoin.sl.toFixed(5)}</div>
                    </div>
                  </div>

                  {/* ── MANUEL İŞLEM ── */}
                  <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:14,padding:"14px",marginBottom:8}}>
                    <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>MANUEL İŞLEM</div>

                    {/* LONG / SHORT toggle */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      {["LONG","SHORT"].map(d=>(
                        <button key={d} onClick={()=>setManualOrder(m=>({...m,dir:d}))} style={{
                          padding:"10px",borderRadius:9,border:`1px solid ${manualOrder.dir===d?(d==="LONG"?"#0ecb81":"#f6465d"):"#2b3158"}`,
                          background:manualOrder.dir===d?(d==="LONG"?"#0ecb8118":"#f6465d18"):"transparent",
                          color:manualOrder.dir===d?(d==="LONG"?"#0ecb81":"#f6465d"):"#848e9c",
                          fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:13,cursor:"pointer",
                        }}>{d==="LONG"?"🟢 LONG":"🔴 SHORT"}</button>
                      ))}
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>TUTAR (USDT)</div>
                        <input placeholder={balance} value={manualOrder.size} onChange={e=>setManualOrder(m=>({...m,size:e.target.value}))} style={inp} type="number"/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>KALDIRAÇ (x)</div>
                        <input placeholder={leverage} value={manualOrder.lev} onChange={e=>setManualOrder(m=>({...m,lev:e.target.value}))} style={inp} type="number"/>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      <div>
                        <div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>TP FİYATI</div>
                        <input placeholder={selectedCoin.tp>1?selectedCoin.tp.toFixed(4):selectedCoin.tp.toFixed(5)} value={manualOrder.tp} onChange={e=>setManualOrder(m=>({...m,tp:e.target.value}))} style={inp} type="number" step="any"/>
                      </div>
                      <div>
                        <div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>SL FİYATI</div>
                        <input placeholder={selectedCoin.sl>1?selectedCoin.sl.toFixed(4):selectedCoin.sl.toFixed(5)} value={manualOrder.sl} onChange={e=>setManualOrder(m=>({...m,sl:e.target.value}))} style={inp} type="number" step="any"/>
                      </div>
                    </div>

                    <div style={{background:"#0b0e17",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:10,fontFamily:"JetBrains Mono,monospace"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{color:"#848e9c"}}>Giriş Fiyatı:</span>
                        <span style={{color:"#eaecef"}}>${selectedCoin.price>1?selectedCoin.price.toFixed(4):selectedCoin.price.toFixed(5)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{color:"#848e9c"}}>Pozisyon Boyutu:</span>
                        <span style={{color:"#eaecef"}}>${((parseFloat(manualOrder.size)||balance)*(parseFloat(manualOrder.lev)||leverage)).toFixed(2)}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color:"#848e9c"}}>Tahmini Kâr:</span>
                        <span style={{color:"#0ecb81"}}>+{(Math.abs((parseFloat(manualOrder.tp)||selectedCoin.tp)-selectedCoin.price)/selectedCoin.price*100*(parseFloat(manualOrder.lev)||leverage)).toFixed(2)}%</span>
                      </div>
                    </div>

                    <button onClick={()=>submitManual(selectedCoin)} style={{
                      width:"100%",padding:"13px",borderRadius:11,border:"none",cursor:"pointer",
                      background:`linear-gradient(135deg,${manualOrder.dir==="LONG"?"#0ecb81,#06b6d4":"#f6465d,#ff7060"})`,
                      color:"#0b0e17",fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:14,
                      boxShadow:`0 4px 20px ${manualOrder.dir==="LONG"?"#0ecb8140":"#f6465d40"}`,
                    }}>
                      {manualOrder.dir==="LONG"?"🟢 LONG GİR":"🔴 SHORT GİR"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ SİNYALLER ══ */}
          {tab==="signals" && (
            <div style={{padding:"14px 12px 8px"}}>

              {/* Active scan info banner */}
              {coins.length > 0 && (
                <div style={{
                  background:"linear-gradient(135deg,#161b2e,#1c2340)",
                  border:"1px solid #2b3158",borderRadius:12,
                  padding:"10px 14px",marginBottom:10,
                  display:"flex",justifyContent:"space-between",alignItems:"center",
                }}>
                  <div>
                    <div style={{fontSize:9,color:"#848e9c",letterSpacing:1.5,marginBottom:3}}>AKTİF TARAMA PARAMETRELERİ</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{background:"#0b0e17",color:"#06b6d4",border:"1px solid #06b6d430",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:800,fontFamily:"JetBrains Mono,monospace"}}>⏱ {scanInterval}</span>
                      <span style={{background:"#0b0e17",color:"#a78bfa",border:"1px solid #a78bfa30",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:800,fontFamily:"JetBrains Mono,monospace"}}>📊 {scanIndicator}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:20,fontWeight:900,color:"#0ecb81",fontFamily:"JetBrains Mono,monospace"}}>{filtered.length}</div>
                    <div style={{fontSize:9,color:"#848e9c"}}>sinyal</div>
                  </div>
                </div>
              )}

              {/* Risk filter */}
              <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
                {[
                  {k:"all",   lbl:"🌐 TÜMÜ",  clr:"#0ecb81"},
                  {k:"low",   lbl:"🛡️ GÜVENLİ",clr:"#0ecb81"},
                  {k:"medium",lbl:"⚡ DİKKAT", clr:"#f0b90b"},
                  {k:"high",  lbl:"🔥 RİSKLİ", clr:"#f6465d"},
                ].map(({k,lbl,clr})=>(
                  <button key={k} onClick={()=>setRiskFilter(k)} style={{
                    flexShrink:0,padding:"6px 12px",borderRadius:16,
                    border:`1px solid ${riskFilter===k?clr+"66":"#2b3158"}`,
                    background:riskFilter===k?clr+"18":"transparent",
                    color:riskFilter===k?clr:"#848e9c",
                    fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",
                    transition:"all .2s",
                  }}>{lbl}</button>
                ))}
              </div>

              {filtered.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#2b3158",fontSize:12}}>Taramayı başlatın ⚡</div>}
              {filtered.map((c,i)=>(
                <FullCoinRow key={c.s} coin={c} delay={i*35}
                  onPress={()=>{setSelectedCoin(c);setTab("chart");}}
                  onAlarm={(sym,price,type)=>{
                    setAlarms(p=>[{id:Date.now(),sym,price,type,triggered:false,t:new Date().toLocaleTimeString("tr-TR")},...p]);
                    snd("notify"); log(`🔔 Alarm: ${sym} ${type==="above"?"↑":"↓"} $${price.toFixed(4)}`,"alarm");
                  }}
                  snd={snd}/>
              ))}
            </div>
          )}

          {/* ══ PORTFÖY ══ */}
          {tab==="portfolio" && (
            <div style={{padding:"14px 12px 8px"}}>
              {/* P&L Summary */}
              <div style={{background:"linear-gradient(135deg,#161b2e,#1c2340)",border:"1px solid #2b3158",borderRadius:16,padding:"16px",marginBottom:12}}>
                <div style={{fontSize:9,color:"#848e9c",letterSpacing:2,marginBottom:6}}>TOPLAM PERFORMANS</div>
                <div style={{fontSize:28,fontWeight:900,color:pnl>=0?"#0ecb81":"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>
                  {pnl>=0?"+":""}{pnl.toFixed(2)} $
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:10}}>
                  {[["Açık",openPos.length,"#06b6d4"],["Toplam",positions.length,"#a78bfa"],["Kârlı",positions.filter(p=>p.pnl>0).length,"#0ecb81"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#0b0e17",borderRadius:9,padding:"8px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#848e9c",marginBottom:2}}>{l}</div>
                      <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:8,fontWeight:700}}>POZİSYONLAR</div>
              {openPos.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#2b3158",fontSize:12}}>Açık pozisyon yok</div>}
              {openPos.map(pos=>(
                <PositionCard key={pos.id} pos={pos} onClose={()=>{
                  setPositions(p=>p.map(x=>x.id===pos.id?{...x,open:false}:x));
                  log(`🔒 Kapatıldı: ${pos.sym} ${pos.pnl>=0?"+":""}${pos.pnl}$`,pos.pnl>=0?"buy":"sell");
                }}/>
              ))}

              <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,margin:"12px 0 8px",fontWeight:700}}>ALARMLAR</div>
              {alarms.map(al=>(
                <AlarmRow key={al.id} alarm={al} onDelete={()=>setAlarms(p=>p.filter(x=>x.id!==al.id))}/>
              ))}
              {/* Alarm form */}
              <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:12,padding:"12px",marginTop:8}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:8,fontWeight:700}}>YENİ ALARM</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <input placeholder="KOİN (örn: BTC)" value={alarmForm.sym} onChange={e=>setAlarmForm(f=>({...f,sym:e.target.value.toUpperCase()}))} style={inp}/>
                  <input placeholder="Hedef Fiyat" type="number" value={alarmForm.price} onChange={e=>setAlarmForm(f=>({...f,price:e.target.value}))} style={inp}/>
                  <select value={alarmForm.type} onChange={e=>setAlarmForm(f=>({...f,type:e.target.value}))} style={inp}>
                    <option value="above">↑ Fiyat üzerine çıkınca</option>
                    <option value="below">↓ Fiyat altına inince</option>
                  </select>
                  <button onClick={()=>{
                    if(!alarmForm.sym||!alarmForm.price) return;
                    setAlarms(p=>[{id:Date.now(),sym:alarmForm.sym.replace("USDT",""),price:+alarmForm.price,type:alarmForm.type,triggered:false,t:new Date().toLocaleTimeString("tr-TR")},...p]);
                    snd("notify"); log(`🔔 Alarm: ${alarmForm.sym} ${alarmForm.type==="above"?"↑":"↓"} $${alarmForm.price}`,"alarm");
                    setAlarmForm(f=>({...f,price:""}));
                  }} style={{...btn("#0ecb81"),width:"100%",padding:"11px"}}>🔔 ALARM EKLE</button>
                </div>
              </div>
            </div>
          )}

          {/* ══ AYARLAR ══ */}
          {tab==="settings" && (
            <div style={{padding:"14px 12px 8px"}}>
              {/* Trading Authentication */}
              <AuthSettings onAuthChange={setIsAuthenticated} />

              {/* Notification System */}
              <NotificationSystem
                isAuthenticated={isAuthenticated}
                telegramEnabled={!!tgToken && !!tgChat}
                emailEnabled={false}
                onNotification={(notification) => {
                  log(`🔔 ${notification.title}: ${notification.message}`, 'info');
                }}
              />

              {/* Mobile Optimization */}
              <MobileOptimization
                onThemeChange={(theme) => {
                  console.log('Theme changed to:', theme);
                }}
                onGestureAction={(gesture) => {
                  console.log('Gesture:', gesture);
                }}
                isMobile={window.innerWidth < 768}
              />

              <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:14,padding:"14px",marginBottom:10}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>İŞLEM AYARLARI</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>KALDIRAÇ</div><input type="number" value={leverage} onChange={e=>setLeverage(+e.target.value)} min="1" max="100" style={inp}/></div>
                  <div><div style={{fontSize:9,color:"#848e9c",marginBottom:4}}>BAKİYE $</div><input type="number" value={balance} onChange={e=>setBalance(+e.target.value)} style={inp}/></div>
                </div>
              </div>

              <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:14,padding:"14px",marginBottom:10}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>TELEGRAM BİLDİRİMLERİ</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  <div><div style={{fontSize:9,color:"#848e9c",marginBottom:3}}>BOT TOKEN</div><input placeholder="1234567890:ABCdef..." value={tgToken} onChange={e=>setTgToken(e.target.value)} style={inp} type="password"/></div>
                  <div><div style={{fontSize:9,color:"#848e9c",marginBottom:3}}>CHAT ID</div><input placeholder="-1001234567890" value={tgChat} onChange={e=>setTgChat(e.target.value)} style={inp}/></div>
                  <button onClick={()=>tg("✅ AtikAnaliz bağlantı testi başarılı!\n\n🦅 Bildirimler aktif.")} style={{...btn("#f0b90b"),width:"100%"}}>📨 TEST ET</button>
                  <div style={{background:"#0b0e17",borderRadius:8,padding:"10px",fontSize:10,color:"#848e9c",lineHeight:1.7}}>
                    ① @BotFather → /newbot → Token kopyala<br/>② @userinfobot → Chat ID öğren<br/>③ Test et, hazır!
                  </div>
                </div>
              </div>

              <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:14,padding:"14px",marginBottom:10}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>SES AYARLARI</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:13}}>Uygulama Sesleri</span>
                  <button onClick={()=>setSoundOn(s=>!s)} style={{...btn(soundOn?"#0ecb81":"#848e9c","transparent",true),padding:"6px 14px"}}>
                    {soundOn?"🔊 AÇIK":"🔇 KAPALI"}
                  </button>
                </div>
                {[["tick","📡 Tarama"],["buy","🟢 Alım"],["sell","🔴 Satım"],["alarm","🔔 Alarm"],["notify","📌 Bildirim"]].map(([t,l])=>(
                  <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0b0e17",borderRadius:8,padding:"8px 10px",marginBottom:5}}>
                    <span style={{fontSize:12,color:"#848e9c"}}>{l}</span>
                    <button onClick={()=>SND.play(t)} style={{...btn("#a78bfa","transparent",true),padding:"4px 10px",fontSize:10}}>▶</button>
                  </div>
                ))}
              </div>

              <div style={{background:"#161b2e",border:"1px solid #2b3158",borderRadius:14,padding:"14px"}}>
                <div style={{fontSize:10,color:"#848e9c",letterSpacing:2,marginBottom:10,fontWeight:700}}>KURULUM REHBERİ</div>
                <div style={{fontSize:11,color:"#848e9c",lineHeight:1.9,background:"#0b0e17",borderRadius:10,padding:"12px"}}>
                  <span style={{color:"#0ecb81",fontWeight:700}}>📦 Bilgisayar Kurulumu:</span><br/>
                  1. nodejs.org → Node.js indir<br/>
                  2. <span style={{color:"#f0b90b",fontFamily:"JetBrains Mono,monospace",fontSize:10}}>npx create-react-app atik</span><br/>
                  3. <span style={{color:"#f0b90b",fontFamily:"JetBrains Mono,monospace",fontSize:10}}>cd atik && npm start</span><br/><br/>
                  <span style={{color:"#0ecb81",fontWeight:700}}>📱 Telefon (aynı WiFi):</span><br/>
                  Bilgisayar IP: <span style={{color:"#06b6d4",fontFamily:"JetBrains Mono,monospace",fontSize:10}}>192.168.x.x:3000</span><br/><br/>
                  <span style={{color:"#0ecb81",fontWeight:700}}>🌐 Her Yerden Erişim:</span><br/>
                  vercel.com → ücretsiz deploy
                </div>
              </div>
            </div>
          )}

          <div style={{height:80}}/>
        </div>

        {/* BOTTOM NAV */}
        <div style={{
          borderTop:"1px solid #161b2e",background:"#111520",
          display:"flex",justifyContent:"space-around",
          padding:"8px 0 22px",flexShrink:0,
        }}>
          {[
            {k:"home",   icon:"🏠", lbl:"Ana Sayfa"},
            {k:"signals",icon:"📡", lbl:"Sinyaller"},
            {k:"chart",  icon:"📈", lbl:"Analiz"},
            {k:"portfolio",icon:"💼",lbl:"Portföy"},
            {k:"settings",icon:"⚙️",lbl:"Ayarlar"},
          ].map(({k,icon,lbl})=>(
            <button key={k} onClick={()=>{setTab(k);snd("tick");}} style={{
              background:"none",border:"none",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:2,
              fontFamily:"Nunito,sans-serif",
            }}>
              <span style={{fontSize:19}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,color:tab===k?"#0ecb81":"#848e9c",transition:"color .2s"}}>{lbl}</span>
              {tab===k&&<div style={{width:18,height:2,borderRadius:1,background:"linear-gradient(90deg,#0ecb81,#06b6d4)"}}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── GAUGE SVG ── */
function GaugeSVG({value,color}){
  const angle = -90 + (value/100)*180;
  return(
    <div style={{position:"relative",width:"100%",paddingTop:"52%",overflow:"hidden"}}>
      <svg viewBox="0 0 100 52" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}>
        <path d="M6 50 A44 44 0 0 1 94 50" fill="none" stroke="#1c2340" strokeWidth="7" strokeLinecap="round"/>
        <path d="M6 50 A44 44 0 0 1 94 50" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${(value/100)*138} 138`} style={{transition:"all .5s"}}/>
        <line x1="50" y1="50" x2="50" y2="14" transform={`rotate(${angle},50,50)`}
          stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{transition:"all .5s"}}/>
        <circle cx="50" cy="50" r="3.5" fill={color}/>
      </svg>
    </div>
  );
}

/* ── SIGNAL ROW ── */
function SignalRow({coin,delay,onPress,snd}){
  const rc = RISK_CFG[coin.risk];
  const isLong = coin.dir==="LONG";
  return(
    <div className="card" onClick={()=>{snd("tick");onPress();}} style={{
      background:"linear-gradient(135deg,#161b2e 80%,#1c2340)",
      border:`1px solid ${rc.color}28`,borderRadius:14,
      padding:"12px 13px",marginBottom:8,cursor:"pointer",
      animation:`fadeUp .35s ${delay}ms ease both`,
      borderLeft:`3px solid ${rc.color}`,
      boxShadow:`0 2px 12px ${rc.color}08`,
    }}>
      {/* Top row: symbol + direction + risk */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontWeight:900,fontSize:14,letterSpacing:.3}}>{coin.sym}</span>
          <span style={{
            background:isLong?"#0ecb8118":"#f6465d18",
            color:isLong?"#0ecb81":"#f6465d",
            border:`1px solid ${isLong?"#0ecb8140":"#f6465d40"}`,
            borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800,
          }}>{isLong?"▲ LONG":"▼ SHORT"}</span>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {/* Interval badge */}
          <span style={{background:"#1c2340",color:"#06b6d4",border:"1px solid #06b6d430",borderRadius:5,padding:"2px 6px",fontSize:9,fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>
            {coin.interval||"15m"}
          </span>
          {/* Indicator badge */}
          <span style={{background:"#1c2340",color:"#a78bfa",border:"1px solid #a78bfa30",borderRadius:5,padding:"2px 6px",fontSize:9,fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>
            {coin.indicator||"STOCHRSI"}
          </span>
          <span style={{background:rc.bg,color:rc.color,border:`1px solid ${rc.color}40`,borderRadius:5,padding:"2px 7px",fontSize:9,fontWeight:700}}>{rc.icon}</span>
        </div>
      </div>

      {/* Price info */}
      <div style={{fontSize:10,color:"#848e9c",marginBottom:6,fontFamily:"JetBrains Mono,monospace"}}>
        Giriş: <span style={{color:"#eaecef"}}>${coin.price>1?coin.price.toFixed(4):coin.price.toFixed(5)}</span>
      </div>

      {/* TP / SL / Güven */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,fontFamily:"JetBrains Mono,monospace"}}>
        <span style={{color:"#848e9c"}}>TP: <span style={{color:"#0ecb81",fontWeight:700}}>${coin.tp>1?coin.tp.toFixed(3):coin.tp.toFixed(5)}</span></span>
        <span style={{color:"#848e9c"}}>SL: <span style={{color:"#f6465d",fontWeight:700}}>${coin.sl>1?coin.sl.toFixed(3):coin.sl.toFixed(5)}</span></span>
        {/* Confidence bar */}
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:42,height:4,background:"#1c2340",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${coin.conf}%`,background:`linear-gradient(90deg,${rc.color}88,${rc.color})`,borderRadius:2,transition:"width .4s"}}/>
          </div>
          <span style={{color:rc.color,fontWeight:800,fontSize:11}}>{coin.conf}%</span>
        </div>
      </div>
    </div>
  );
}

/* ── FULL COIN ROW ── */
function FullCoinRow({coin,delay,onPress,onAlarm,snd}){
  const [exp,setExp]=useState(false);
  const rc=RISK_CFG[coin.risk];
  const isLong=coin.dir==="LONG";
  return(
    <div style={{
      background:"linear-gradient(135deg,#161b2e 80%,#1c2340)",
      border:`1px solid ${rc.color}1e`,borderRadius:14,marginBottom:8,overflow:"hidden",
      animation:`fadeUp .3s ${delay}ms ease both`,borderLeft:`3px solid ${rc.color}`,cursor:"pointer",
      boxShadow:`0 2px 16px ${rc.color}06`,
    }} onClick={()=>setExp(e=>!e)}>
      <div style={{padding:"12px 12px 10px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              <div style={{fontSize:15,fontWeight:900}}>{coin.sym}</div>
              {/* Interval + Indicator mini badges */}
              <span style={{background:"#0b0e17",color:"#06b6d4",border:"1px solid #06b6d428",borderRadius:4,padding:"1px 5px",fontSize:8,fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>{coin.interval||"15m"}</span>
              <span style={{background:"#0b0e17",color:"#a78bfa",border:"1px solid #a78bfa28",borderRadius:4,padding:"1px 5px",fontSize:8,fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>{coin.indicator||"STOCHRSI"}</span>
            </div>
            <div style={{fontSize:18,fontWeight:900,color:coin.change24>=0?"#0ecb81":"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>
              ${coin.price>1?coin.price.toFixed(4):coin.price.toFixed(5)}
            </div>
            <div style={{fontSize:10,color:coin.change24>=0?"#0ecb81":"#f6465d"}}>{coin.change24>=0?"▲":"▼"}{Math.abs(coin.change24).toFixed(2)}%</div>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{
              background:isLong?"#0ecb8115":"#f6465d15",
              color:isLong?"#0ecb81":"#f6465d",
              border:`1px solid ${isLong?"#0ecb8133":"#f6465d33"}`,
              borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:900,display:"block",marginBottom:5,
            }}>{isLong?"▲ LONG":"▼ SHORT"}</span>
            <div style={{fontSize:22,fontWeight:900,color:rc.color,lineHeight:1}}>{coin.conf}%</div>
            <div style={{fontSize:9,color:rc.color}}>{rc.icon} {rc.lbl.toUpperCase()}</div>
          </div>
        </div>
        {/* Long/Short bar */}
        <div style={{height:4,borderRadius:2,background:"#1c2340",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${coin.ls}%`,borderRadius:2,background:`linear-gradient(90deg,#0ecb8144,#0ecb81)`,transition:"width .5s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#848e9c",marginTop:3}}>
          <span>LONG {coin.ls}%</span><span>SHORT {coin.ss}%</span>
        </div>
        {/* TP/SL row */}
        <div style={{display:"flex",gap:8,marginTop:7,fontSize:10,fontFamily:"JetBrains Mono,monospace"}}>
          <span style={{color:"#848e9c"}}>TP: <span style={{color:"#0ecb81",fontWeight:700}}>${coin.tp>1?coin.tp.toFixed(3):coin.tp.toFixed(5)}</span></span>
          <span style={{color:"#2b3158"}}>|</span>
          <span style={{color:"#848e9c"}}>SL: <span style={{color:"#f6465d",fontWeight:700}}>${coin.sl>1?coin.sl.toFixed(3):coin.sl.toFixed(5)}</span></span>
        </div>
      </div>
      {exp&&(
        <div style={{borderTop:"1px solid #1c2340",padding:"9px 12px",display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>{onPress();snd("tick");}} style={{flex:1,padding:"7px",borderRadius:7,border:"1px solid #a78bfa44",background:"#a78bfa15",color:"#a78bfa",fontSize:10,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>📊 Grafik</button>
          <button onClick={()=>onAlarm(coin.s,coin.price*1.02,"above")} style={{flex:1,padding:"7px",borderRadius:7,border:"1px solid #0ecb8144",background:"#0ecb8115",color:"#0ecb81",fontSize:10,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>🔔 +2%</button>
          <button onClick={()=>onAlarm(coin.s,coin.price*0.98,"below")} style={{flex:1,padding:"7px",borderRadius:7,border:"1px solid #f6465d44",background:"#f6465d15",color:"#f6465d",fontSize:10,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>🔔 -2%</button>
        </div>
      )}
    </div>
  );
}

/* ── POSITION CARD ── */
function PositionCard({pos,onClose}){
  const isPos=pos.pnl>=0;
  return(
    <div style={{background:isPos?"#0ecb8108":"#f6465d08",border:`1px solid ${isPos?"#0ecb8122":"#f6465d22"}`,borderRadius:12,padding:"11px 12px",marginBottom:7,borderLeft:`3px solid ${isPos?"#0ecb81":"#f6465d"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <span style={{fontWeight:800}}>{pos.sym}/USDT</span>
          <span style={{background:pos.dir==="LONG"?"#0ecb8115":"#f6465d15",color:pos.dir==="LONG"?"#0ecb81":"#f6465d",border:`1px solid ${pos.dir==="LONG"?"#0ecb8133":"#f6465d33"}`,borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800}}>{pos.dir}</span>
          <span style={{fontSize:10,color:"#848e9c"}}>{pos.lev}x</span>
          {pos.auto&&<span style={{fontSize:9,color:"#a78bfa",background:"#a78bfa15",borderRadius:4,padding:"1px 5px"}}>OTO</span>}
        </div>
        <span style={{fontSize:15,fontWeight:900,color:isPos?"#0ecb81":"#f6465d",fontFamily:"JetBrains Mono,monospace"}}>{isPos?"+":""}{pos.pnl?.toFixed(2)}$</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3,fontSize:10,color:"#848e9c",marginBottom:8,fontFamily:"JetBrains Mono,monospace"}}>
        <span>G: <span style={{color:"#eaecef"}}>${pos.entry?.toFixed(4)}</span></span>
        <span>TP: <span style={{color:"#0ecb81"}}>${pos.tp?.toFixed(4)}</span></span>
        <span>SL: <span style={{color:"#f6465d"}}>${pos.sl?.toFixed(4)}</span></span>
      </div>
      <button onClick={onClose} style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid #f6465d44",background:"#f6465d15",color:"#f6465d",fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>🔒 Kapat</button>
    </div>
  );
}

/* ── ALARM ROW ── */
function AlarmRow({alarm,onDelete}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:alarm.triggered?"#ffffff05":"#0ecb8108",border:`1px solid ${alarm.triggered?"#2b3158":"#0ecb8122"}`,borderRadius:9,padding:"9px 12px",marginBottom:5}}>
      <div style={{fontSize:11}}>
        <span style={{fontWeight:800,color:alarm.triggered?"#848e9c":"#eaecef"}}>{alarm.sym}/USDT</span>
        <span style={{color:"#848e9c",margin:"0 5px"}}>{alarm.type==="above"?"↑":"↓"}</span>
        <span style={{color:alarm.triggered?"#848e9c":"#0ecb81",fontFamily:"JetBrains Mono,monospace"}}>${alarm.price}</span>
        {alarm.triggered&&<span style={{marginLeft:7,fontSize:9,color:"#848e9c"}}>✓ Tetiklendi</span>}
      </div>
      <button onClick={onDelete} style={{background:"none",border:"none",color:"#f6465d",cursor:"pointer",fontSize:15}}>✕</button>
    </div>
  );
}
