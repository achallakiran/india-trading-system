import React, { useState, useCallback } from 'react';

const STOCK_PROFILES = {
  'RELIANCE':   { basePrice: 2800, volatility: 0.015, drift: 0.0003 },
  'TCS':        { basePrice: 3900, volatility: 0.012, drift: 0.0004 },
  'HDFCBANK':   { basePrice: 1650, volatility: 0.013, drift: 0.0003 },
  'INFY':       { basePrice: 1800, volatility: 0.014, drift: 0.0003 },
  'ICICIBANK':  { basePrice: 1200, volatility: 0.016, drift: 0.0004 },
  'SBIN':       { basePrice: 780,  volatility: 0.018, drift: 0.0003 },
  'WIPRO':      { basePrice: 550,  volatility: 0.015, drift: 0.0002 },
  'MARUTI':     { basePrice: 12500,volatility: 0.017, drift: 0.0004 },
  'SUNPHARMA':  { basePrice: 1700, volatility: 0.014, drift: 0.0003 },
  'AXISBANK':   { basePrice: 1100, volatility: 0.018, drift: 0.0003 },
  'BAJFINANCE': { basePrice: 7200, volatility: 0.020, drift: 0.0005 },
  'TITAN':      { basePrice: 3600, volatility: 0.016, drift: 0.0005 },
  'NIFTY50':    { basePrice: 22000,volatility: 0.010, drift: 0.0003 },
  'BANKNIFTY':  { basePrice: 47000,volatility: 0.014, drift: 0.0003 },
};

function generateOHLCV(symbol, days = 252) {
  const profile = STOCK_PROFILES[symbol] || STOCK_PROFILES['RELIANCE'];
  const { basePrice, volatility, drift } = profile;
  let s = symbol.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const u1 = Math.max(1e-10, ((s & 0x7fffffff) / 0x7fffffff));
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const u2 = ((s & 0x7fffffff) / 0x7fffffff);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  const candles = [];
  let price = basePrice;
  const start = new Date(); start.setDate(start.getDate() - days);
  for (let i = 0; i < days * 1.4; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    if (candles.length >= days) break;
    const ret = drift + volatility * rand();
    const open = price * (1 + volatility * rand() * 0.3);
    const close = open * (1 + ret);
    const high = Math.max(open, close) * (1 + Math.abs(rand()) * volatility * 0.5);
    const low  = Math.min(open, close) * (1 - Math.abs(rand()) * volatility * 0.5);
    candles.push({ date: d.toISOString().split('T')[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2) });
    price = close;
  }
  return candles;
}

function calcEMA(vals, p) {
  const k = 2 / (p + 1); let e = null;
  return vals.map((v, i) => {
    if (e === null) { if (i >= p - 1) { e = vals.slice(0, p).reduce((a,b) => a+b,0)/p; return +e.toFixed(2); } return null; }
    e = v * k + e * (1 - k); return +e.toFixed(2);
  });
}

function calcRSI(closes, p = 14) {
  return closes.map((_, i) => {
    if (i < p) return null;
    let g = 0, l = 0;
    for (let j = i - p + 1; j <= i; j++) { const d = closes[j] - closes[j-1]; if (d > 0) g += d; else l -= d; }
    return +(100 - 100 / (1 + g / (l || 0.001))).toFixed(2);
  });
}

function calcATR(candles, p = 14) {
  return candles.map((c, i) => {
    if (i < p) return null;
    let sum = 0;
    for (let j = i - p + 1; j <= i; j++) {
      const prev = candles[j-1]?.close || candles[j].open;
      sum += Math.max(candles[j].high - candles[j].low, Math.abs(candles[j].high - prev), Math.abs(candles[j].low - prev));
    }
    return +(sum / p).toFixed(2);
  });
}

const STRATEGIES = [
  {
    id: 'ema', name: 'EMA Crossover (9/21)', style: 'Swing',
    desc: 'Buys when 9-day EMA crosses above 21-day EMA. Classic trend-following.',
    signal(candles) {
      const c = candles.map(x => x.close);
      const f = calcEMA(c, 9), s = calcEMA(c, 21), atr = calcATR(candles);
      return candles.map((x, i) => ({ ...x, atr: atr[i],
        buy:  i > 0 && f[i] !== null && s[i] !== null && f[i-1] !== null && s[i-1] !== null && f[i] > s[i] && f[i-1] <= s[i-1],
        sell: i > 0 && f[i] !== null && s[i] !== null && f[i-1] !== null && s[i-1] !== null && f[i] < s[i] && f[i-1] >= s[i-1],
      }));
    }
  },
  {
    id: 'rsi', name: 'RSI Bounce (30/70)', style: 'Swing',
    desc: 'Buys when RSI bounces up from oversold (<30). Exits at overbought (>70).',
    signal(candles) {
      const c = candles.map(x => x.close), rsi = calcRSI(c), atr = calcATR(candles);
      return candles.map((x, i) => ({ ...x, rsi: rsi[i], atr: atr[i],
        buy:  i > 0 && rsi[i] !== null && rsi[i-1] !== null && rsi[i-1] < 30 && rsi[i] >= 30,
        sell: i > 0 && rsi[i] !== null && rsi[i-1] !== null && rsi[i-1] < 70 && rsi[i] >= 70,
      }));
    }
  },
  {
    id: 'combo', name: 'EMA + RSI Combo (20/50)', style: 'Swing',
    desc: 'Stricter: price above 50 EMA, RSI 45-65 sweet spot. Fewer but higher-quality signals.',
    signal(candles) {
      const c = candles.map(x => x.close);
      const e20 = calcEMA(c, 20), e50 = calcEMA(c, 50), rsi = calcRSI(c), atr = calcATR(candles);
      return candles.map((x, i) => {
        const ok = e20[i] !== null && e50[i] !== null && rsi[i] !== null;
        const curr = ok && c[i] > e50[i] && e20[i] > e50[i] && rsi[i] >= 45 && rsi[i] <= 65;
        const prev = i > 0 && e20[i-1] !== null && e50[i-1] !== null && rsi[i-1] !== null
          && c[i-1] > e50[i-1] && e20[i-1] > e50[i-1] && rsi[i-1] >= 45 && rsi[i-1] <= 65;
        return { ...x, atr: atr[i], buy: curr && !prev, sell: rsi[i] !== null && rsi[i] > 72 };
      });
    }
  },
];

function runBacktest(signaled, capital, riskPct, rrRatio) {
  const COMM = 20;
  let balance = capital, position = 0, entryPrice = 0, sl = 0, target = 0;
  const trades = [], equity = [capital];
  for (let i = 0; i < signaled.length; i++) {
    const b = signaled[i];
    if (position > 0 && b.low <= sl) {
      const pnl = (sl - entryPrice) * position - COMM * 2;
      balance += pnl;
      trades.push({ date: b.date, type: 'SL', entry: +entryPrice.toFixed(2), exit: +sl.toFixed(2), qty: position, pnl: +pnl.toFixed(0) });
      position = 0; equity.push(+balance.toFixed(0)); continue;
    }
    if (position > 0 && b.high >= target) {
      const pnl = (target - entryPrice) * position - COMM * 2;
      balance += pnl;
      trades.push({ date: b.date, type: 'Target ✓', entry: +entryPrice.toFixed(2), exit: +target.toFixed(2), qty: position, pnl: +pnl.toFixed(0) });
      position = 0; equity.push(+balance.toFixed(0)); continue;
    }
    if (position > 0 && b.sell) {
      const pnl = (b.close - entryPrice) * position - COMM * 2;
      balance += pnl;
      trades.push({ date: b.date, type: 'Signal', entry: +entryPrice.toFixed(2), exit: +b.close.toFixed(2), qty: position, pnl: +pnl.toFixed(0) });
      position = 0; equity.push(+balance.toFixed(0)); continue;
    }
    if (b.buy && position === 0) {
      const atrVal = b.atr || b.close * 0.015;
      const slDist = Math.max(atrVal * 1.5, b.close * 0.01);
      const qty = Math.max(1, Math.floor((balance * riskPct / 100) / slDist));
      if (qty * b.close + COMM > balance) { equity.push(+balance.toFixed(0)); continue; }
      entryPrice = b.close; sl = entryPrice - slDist; target = entryPrice + slDist * rrRatio;
      position = qty; balance -= COMM; equity.push(+balance.toFixed(0)); continue;
    }
    equity.push(+balance.toFixed(0));
  }
  if (position > 0) {
    const last = signaled[signaled.length - 1];
    const pnl = (last.close - entryPrice) * position - COMM * 2;
    balance += pnl;
    trades.push({ date: last.date, type: 'End', entry: +entryPrice.toFixed(2), exit: +last.close.toFixed(2), qty: position, pnl: +pnl.toFixed(0) });
    equity[equity.length - 1] = +balance.toFixed(0);
  }
  if (!trades.length) return null;
  const pnls = trades.map(t => t.pnl);
  const wins = pnls.filter(p => p > 0), losses = pnls.filter(p => p < 0);
  const maxDD = equity.reduce((acc, v, i, arr) => {
    const peak = Math.max(...arr.slice(0, i + 1));
    return Math.max(acc, peak > 0 ? (peak - v) / peak * 100 : 0);
  }, 0);
  return {
    trades, equity,
    totalTrades: trades.length,
    wins: wins.length, losses: losses.length,
    winRate: +(wins.length / trades.length * 100).toFixed(1),
    totalPnl: +pnls.reduce((a,b) => a+b, 0).toFixed(0),
    finalCapital: +balance.toFixed(0),
    returnPct: +((balance - capital) / capital * 100).toFixed(2),
    avgWin: wins.length ? +(wins.reduce((a,b)=>a+b,0)/wins.length).toFixed(0) : 0,
    avgLoss: losses.length ? +(losses.reduce((a,b)=>a+b,0)/losses.length).toFixed(0) : 0,
    bestTrade: +Math.max(...pnls).toFixed(0),
    worstTrade: +Math.min(...pnls).toFixed(0),
    maxDrawdown: +maxDD.toFixed(1),
    expectancy: +((wins.length/trades.length)*(wins.length?wins.reduce((a,b)=>a+b,0)/wins.length:0) +
                   (losses.length/trades.length)*(losses.length?losses.reduce((a,b)=>a+b,0)/losses.length:0)).toFixed(0),
  };
}

function EquityChart({ equity, positive }) {
  if (!equity || equity.length < 2) return null;
  const W = 500, H = 110;
  const min = Math.min(...equity), max = Math.max(...equity), range = max - min || 1;
  const toX = i => (i / (equity.length - 1)) * W;
  const toY = v => H - ((v - min) / range) * (H - 16) - 8;
  const pts = equity.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  const fill = pts + ` L ${W} ${H} L 0 ${H} Z`;
  const color = positive ? '#22c55e' : '#ef4444';
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', marginTop: 8 }}>
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={toY(equity[0])} x2={W} y2={toY(equity[0])} stroke="var(--border2)" strokeWidth="1" strokeDasharray="4,3" />
      <path d={fill} fill="url(#eg)" />
      <path d={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PERIODS = [{ label: '6 months', days: 130 }, { label: '1 year', days: 260 }, { label: '2 years', days: 520 }];
const SYMBOLS = Object.keys(STOCK_PROFILES);

export default function Backtester() {
  const [symbol, setSymbol] = useState('HDFCBANK');
  const [stratIdx, setStratIdx] = useState(0);
  const [periodIdx, setPeriodIdx] = useState(1);
  const [capital, setCapital] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [rrRatio, setRrRatio] = useState(2);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showTrades, setShowTrades] = useState(false);
  const [compareResults, setCompareResults] = useState(null);

  const run = useCallback(() => {
    setRunning(true); setResult(null); setCompareResults(null);
    setTimeout(() => {
      const candles = generateOHLCV(symbol, PERIODS[periodIdx].days);
      const signaled = STRATEGIES[stratIdx].signal(candles);
      setResult(runBacktest(signaled, capital, riskPct, rrRatio));
      setRunning(false);
    }, 500);
  }, [symbol, stratIdx, periodIdx, capital, riskPct, rrRatio]);

  const runCompare = useCallback(() => {
    setRunning(true); setResult(null); setCompareResults(null);
    setTimeout(() => {
      const candles = generateOHLCV(symbol, PERIODS[periodIdx].days);
      setCompareResults(STRATEGIES.map(s => ({ ...s, result: runBacktest(s.signal(candles), capital, riskPct, rrRatio) })));
      setRunning(false);
    }, 700);
  }, [symbol, periodIdx, capital, riskPct, rrRatio]);

  const pos = result?.returnPct >= 0;

  return (
    <>
      <div className="page-header">
        <h2>Strategy Backtester</h2>
        <p>Test strategies on realistic NSE price data — before risking real money</p>
      </div>
      <div className="page-content">

        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>◎</span>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
              Prices use <strong>Geometric Brownian Motion</strong> — same model used by quantitative finance — seeded from each stock's real-world volatility profile. Same symbol + period always gives the same result. For real NSE historical data, run <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>python backtester.py</code> on your laptop.
            </p>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Config panel */}
          <div>
            <div className="card">
              <div className="card-title">Configuration</div>

              <div className="form-group">
                <label className="form-label">Stock / Index</label>
                <select className="form-select" value={symbol} onChange={e => setSymbol(e.target.value)}>
                  {SYMBOLS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Strategy</label>
                {STRATEGIES.map((s, i) => (
                  <div key={s.id} onClick={() => setStratIdx(i)} style={{ padding: '10px 12px', background: stratIdx === i ? 'rgba(240,180,41,0.07)' : 'var(--bg3)', border: `1px solid ${stratIdx === i ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 7, marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</span>
                      <span className="tag swing">{s.style}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Data Period</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {PERIODS.map((p, i) => (
                    <button key={i} onClick={() => setPeriodIdx(i)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: `1px solid ${periodIdx === i ? 'var(--accent)' : 'var(--border)'}`, background: periodIdx === i ? 'rgba(240,180,41,0.1)' : 'var(--bg3)', color: periodIdx === i ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-head)' }}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div className="grid-3">
                {[['Capital ₹', capital, setCapital, 10000, 1000000, 10000],
                  ['Risk % / Trade', riskPct, setRiskPct, 0.5, 5, 0.5],
                  ['R:R Ratio', rrRatio, setRrRatio, 1, 5, 0.5]].map(([label, val, setter, min, max, step]) => (
                  <div key={label} className="form-group">
                    <label className="form-label">{label}</label>
                    <input className="form-input" type="number" value={val} min={min} max={max} step={step} onChange={e => setter(+e.target.value)} />
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text3)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 14, fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
                Risk / trade: ₹{Math.round(capital * riskPct / 100).toLocaleString('en-IN')} &nbsp;·&nbsp; Breakeven win rate: {(1/(1+rrRatio)*100).toFixed(0)}%
                {result && <span style={{ color: result.winRate > (1/(1+rrRatio)*100) ? 'var(--green)' : 'var(--red)' }}> &nbsp;·&nbsp; Your win rate: {result.winRate}% {result.winRate > (1/(1+rrRatio)*100) ? '✓' : '✗'}</span>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={run} disabled={running}>
                  {running ? '◌ Running...' : '▶ Run Backtest'}
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={runCompare} disabled={running}>⇌ Compare</button>
              </div>
            </div>

            <div className="card" style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.03)' }}>
              <div className="card-title" style={{ color: 'var(--green)' }}>🐍 Real Data Backtester</div>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 10 }}>For actual NSE historical data, run on your laptop:</p>
              <div style={{ background: 'var(--bg)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', lineHeight: 1.8 }}>
                pip install yfinance pandas numpy colorama<br />
                python backtester.py
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, lineHeight: 1.5 }}>
                Fetches real OHLCV data from Yahoo Finance → runs same strategies → shows ranked results across all Nifty 50 stocks.
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div>
            {!result && !compareResults && !running && (
              <div className="card" style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--text3)' }}>
                <div style={{ fontSize: 42, marginBottom: 14 }}>↺</div>
                <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>Configure your strategy and click Run Backtest</p>
              </div>
            )}

            {running && (
              <div className="card" style={{ textAlign: 'center', padding: '70px 20px' }}>
                <div style={{ fontSize: 36, marginBottom: 14, display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</div>
                <p style={{ color: 'var(--text2)' }}>Simulating {PERIODS[periodIdx].days} trading days on {symbol}...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {result && !compareResults && !running && (
              <>
                {/* Main result card */}
                <div className="card" style={{ borderColor: pos ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                        {symbol} · {STRATEGIES[stratIdx].name} · {PERIODS[periodIdx].label}
                      </div>
                      <div style={{ fontSize: 34, fontWeight: 800, color: pos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                        {pos ? '+' : ''}₹{Math.abs(result.totalPnl).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 13, color: pos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {pos ? '+' : ''}{result.returnPct}% on ₹{capital.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{result.winRate}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>win rate</div>
                      <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        <span style={{ color: 'var(--green)' }}>{result.wins}W</span> <span style={{ color: 'var(--text3)' }}>/</span> <span style={{ color: 'var(--red)' }}>{result.losses}L</span>
                      </div>
                    </div>
                  </div>
                  <EquityChart equity={result.equity} positive={pos} />
                </div>

                {/* Stats grid */}
                <div className="grid-2" style={{ marginBottom: 12 }}>
                  {[
                    { label: 'Expectancy / Trade', val: `${result.expectancy >= 0 ? '+' : ''}₹${result.expectancy.toLocaleString('en-IN')}`, c: result.expectancy >= 0 ? 'var(--green)' : 'var(--red)' },
                    { label: 'Max Drawdown', val: `-${result.maxDrawdown}%`, c: 'var(--red)' },
                    { label: 'Avg Win', val: `+₹${result.avgWin.toLocaleString('en-IN')}`, c: 'var(--green)' },
                    { label: 'Avg Loss', val: `₹${result.avgLoss.toLocaleString('en-IN')}`, c: 'var(--red)' },
                  ].map(s => (
                    <div key={s.label} className="stat-tile">
                      <div className="label">{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.c, fontFamily: 'var(--font-mono)', marginTop: 6 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Trade log */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', borderBottom: showTrades ? '1px solid var(--border)' : 'none' }} onClick={() => setShowTrades(x => !x)}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Trade Log ({result.totalTrades} trades)</span>
                    <span style={{ color: 'var(--text3)', fontSize: 12 }}>{showTrades ? '▲ hide' : '▼ show'}</span>
                  </div>
                  {showTrades && (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Date','Exit Type','Entry','Exit','Qty','P&L'].map(h => (
                              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.map((t, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(42,42,56,0.4)' }}>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{t.date}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: t.type === 'SL' ? 'rgba(239,68,68,0.15)' : t.type.includes('Target') ? 'rgba(34,197,94,0.15)' : 'var(--bg3)', color: t.type === 'SL' ? 'var(--red)' : t.type.includes('Target') ? 'var(--green)' : 'var(--text3)' }}>{t.type}</span>
                              </td>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>₹{t.entry}</td>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>₹{t.exit}</td>
                              <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{t.qty}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12, color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Compare results */}
            {compareResults && !running && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Strategy Comparison — {symbol} · {PERIODS[periodIdx].label}</div>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => setCompareResults(null)}>✕ Close</button>
                </div>
                {compareResults.map(s => {
                  const r = s.result;
                  if (!r) return <div key={s.id} className="card" style={{ marginBottom: 10 }}><span style={{ color: 'var(--text3)', fontSize: 13 }}>{s.name}: no signals generated</span></div>;
                  const p = r.returnPct >= 0;
                  return (
                    <div key={s.id} className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${p ? 'var(--green)' : 'var(--red)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{r.totalTrades} trades · {r.winRate}% win rate · {r.wins}W/{r.losses}L</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: 24, color: p ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{p ? '+' : ''}{r.returnPct}%</div>
                          <div style={{ fontSize: 12, color: p ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{p ? '+' : ''}₹{r.totalPnl.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <EquityChart equity={r.equity} positive={p} />
                      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)', flexWrap: 'wrap' }}>
                        <span>Expect: <span style={{ color: r.expectancy >= 0 ? 'var(--green)' : 'var(--red)' }}>₹{r.expectancy}</span></span>
                        <span>MaxDD: <span style={{ color: 'var(--red)' }}>{r.maxDrawdown}%</span></span>
                        <span>AvgW: <span style={{ color: 'var(--green)' }}>₹{r.avgWin}</span></span>
                        <span>AvgL: <span style={{ color: 'var(--red)' }}>₹{r.avgLoss}</span></span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
