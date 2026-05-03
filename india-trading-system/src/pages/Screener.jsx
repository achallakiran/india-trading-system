import React, { useState } from 'react';

// Popular Nifty 50 stocks with sectors - static starter list
const NIFTY50 = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', pe: 28.5, marketCap: 'Large' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', pe: 32.1, marketCap: 'Large' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', pe: 19.4, marketCap: 'Large' },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', pe: 26.8, marketCap: 'Large' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', pe: 18.2, marketCap: 'Large' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', pe: 58.3, marketCap: 'Large' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', pe: 11.2, marketCap: 'Large' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', pe: 88.4, marketCap: 'Large' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', pe: 22.7, marketCap: 'Large' },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infra', pe: 35.6, marketCap: 'Large' },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', pe: 22.1, marketCap: 'Large' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', pe: 24.3, marketCap: 'Large' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'FMCG', pe: 52.8, marketCap: 'Large' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', pe: 27.9, marketCap: 'Large' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', pe: 38.2, marketCap: 'Large' },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'FMCG', pe: 89.4, marketCap: 'Large' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', pe: 31.5, marketCap: 'Large' },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', pe: 15.3, marketCap: 'Large' },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma', pe: 18.6, marketCap: 'Large' },
  { symbol: 'NESTLEIND', name: 'Nestlé India', sector: 'FMCG', pe: 72.1, marketCap: 'Large' },
];

const STRATEGIES = [
  {
    id: 'orb',
    name: 'Opening Range Breakout',
    style: 'Intraday',
    icon: '◉',
    description: 'Best for large-cap stocks with high volume. Buy when price breaks above first 15-min high, sell when it breaks below first 15-min low.',
    criteria: ['High average daily volume', 'Large-cap (Nifty 50 preferred)', 'Clear trend on daily chart'],
    avoid: ['Avoid near earnings dates', 'Avoid on low-volume days', 'Avoid in sideways/choppy markets'],
    stocks: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN'],
    bestTime: '9:15 AM – 10:30 AM',
    risk: '0.5–1% of capital per trade',
  },
  {
    id: 'ema',
    name: 'EMA Crossover (9/21)',
    style: 'Intraday / Swing',
    icon: '◎',
    description: 'When 9-period EMA crosses above 21-period EMA = buy signal. Below = sell. Use on 15-min chart for intraday, daily chart for swing.',
    criteria: ['Stock in trending phase (not sideways)', 'Volume confirmation on crossover', 'RSI between 45–65 for buy signal'],
    avoid: ['Avoid in ranging/consolidating markets', 'Avoid if RSI above 70 (overbought)'],
    stocks: ['HDFCBANK', 'TCS', 'WIPRO', 'AXISBANK', 'MARUTI'],
    bestTime: 'Any time after 9:45 AM',
    risk: '1% of capital per trade',
  },
  {
    id: 'rsi',
    name: 'RSI Oversold Bounce',
    style: 'Swing',
    icon: '◈',
    description: 'Look for stocks where RSI has fallen below 30 (oversold) and is starting to recover. Combine with price support for confirmation.',
    criteria: ['RSI < 30 on daily chart', 'Stock near key support level', 'No negative fundamental news', 'Overall market not in panic'],
    avoid: ['Avoid if fundamentals are bad', 'Avoid in bear market (falling RSI can go further down)'],
    stocks: ['SUNPHARMA', 'DRREDDY', 'WIPRO', 'NESTLEIND'],
    bestTime: 'Entry anytime, hold 5–15 days',
    risk: '1–2% of capital per trade',
  },
  {
    id: 'fundamental',
    name: 'Quality Stocks on Dip (SIP style)',
    style: 'Long Term',
    icon: '⬡',
    description: "Buy quality Nifty 50 stocks when they fall 5–10% without any fundamental reason (market correction, not company problem). Hold 6–24 months.",
    criteria: ['Consistent revenue & profit growth', 'Low debt (Debt/Equity < 1)', 'Market leader in sector', 'Correction without news = opportunity'],
    avoid: ['Avoid if company has bad news', 'Avoid just because price looks cheap', 'Always check why it fell'],
    stocks: ['TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'TITAN', 'NESTLEIND'],
    bestTime: 'Any time. Buy in tranches, not all at once.',
    risk: 'Max 5–10% of total capital per stock',
  },
];

const SECTORS = ['All', 'Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Energy', 'Infra', 'NBFC', 'Telecom'];

export default function Screener() {
  const [tab, setTab] = useState('strategies');
  const [sector, setSector] = useState('All');
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const filteredStocks = sector === 'All' ? NIFTY50 : NIFTY50.filter(s => s.sector === sector);

  return (
    <>
      <div className="page-header">
        <h2>Screener & Strategies</h2>
        <p>Find trade setups and understand which stocks suit which strategy</p>
      </div>
      <div className="page-content">
        <div className="pill-nav">
          <button className={tab === 'strategies' ? 'active' : ''} onClick={() => setTab('strategies')}>Strategy Playbook</button>
          <button className={tab === 'stocks' ? 'active' : ''} onClick={() => setTab('stocks')}>Nifty 50 Watchlist</button>
          <button className={tab === 'howto' ? 'active' : ''} onClick={() => setTab('howto')}>How to Screen</button>
        </div>

        {tab === 'strategies' && (
          <div>
            <div className="grid-2">
              {STRATEGIES.map(s => (
                <div key={s.id} className="card" style={{ cursor: 'pointer', borderColor: selectedStrategy?.id === s.id ? 'var(--accent)' : 'var(--border)', background: selectedStrategy?.id === s.id ? 'rgba(240,180,41,0.04)' : '' }}
                  onClick={() => setSelectedStrategy(prev => prev?.id === s.id ? null : s)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{s.name}</span>
                        <span className={`tag ${s.style.toLowerCase().includes('intraday') ? 'intraday' : s.style.toLowerCase().includes('swing') ? 'swing' : 'longterm'}`}>
                          {s.style}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>{s.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedStrategy && (
              <div className="card" style={{ borderColor: 'rgba(240,180,41,0.3)', background: 'rgba(240,180,41,0.03)', marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{selectedStrategy.icon} {selectedStrategy.name} — Full Playbook</div>
                  <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSelectedStrategy(null)}>Close ✕</button>
                </div>
                <div className="grid-2" style={{ marginBottom: 20 }}>
                  <div>
                    <div className="card-title" style={{ color: 'var(--green)' }}>✓ Entry Criteria</div>
                    {selectedStrategy.criteria.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
                        <span style={{ color: 'var(--text2)' }}>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="card-title" style={{ color: 'var(--red)' }}>✗ What to Avoid</div>
                    {selectedStrategy.avoid.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--red)', flexShrink: 0 }}>✗</span>
                        <span style={{ color: 'var(--text2)' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid-3">
                  <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Best Time</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{selectedStrategy.bestTime}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Risk Per Trade</div>
                    <div style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{selectedStrategy.risk}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Suggested Stocks</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {selectedStrategy.stocks.map(s => <span key={s} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 4, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'stocks' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="pill-nav" style={{ margin: 0 }}>
                {SECTORS.map(s => <button key={s} className={sector === s ? 'active' : ''} onClick={() => setSector(s)}>{s}</button>)}
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Company</th>
                      <th>Sector</th>
                      <th>P/E Ratio</th>
                      <th>Suitable For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map(s => (
                      <tr key={s.symbol}>
                        <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{s.symbol}</td>
                        <td style={{ fontSize: 13 }}>{s.name}</td>
                        <td><span className="tag open">{s.sector}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.pe}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {STRATEGIES.filter(st => st.stocks.includes(s.symbol)).map(st => (
                              <span key={st.id} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text3)' }}>{st.name.split(' ')[0]}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'howto' && (
          <div className="grid-2">
            {[
              { title: '🌅 Intraday Screening (Pre-market 8:30 AM)', steps: ["Check FII/DII data from previous day on NSE website", "Look at Nifty/BankNifty futures (gap up or gap down?)", "Identify top gainers/losers from yesterday", "Check if any major news overnight (US markets, crude oil, USD/INR)", "Pick 2–3 stocks from watchlist that have high volume + trend", "Wait for 9:15 AM, watch for ORB setup in first 15 min"] },
              { title: '📅 Swing Trade Screening (Weekly)', steps: ["Open NSE or Screener.in", "Filter: 52-week high breakouts with volume > 2x average", "Check RSI on daily chart — looking for RSI 50–65 range", "Confirm with EMA — price above 20 EMA and 50 EMA", "Check earnings date — avoid entry 1 week before results", "Enter when setup confirms, hold 1–4 weeks"] },
              { title: '📈 Long-term Screening (Monthly)', steps: ["Go to Screener.in → create custom screen", "Revenue growth > 15% YoY for last 3 years", "Net profit margin > 10%", "Debt/Equity < 0.5", "ROCE > 15%", "Market leader or #2 in sector", "Buy in tranches — don't put all money at once"] },
              { title: '🆓 Free Tools for Indian Markets', steps: ["NSE India (nseindia.com) — Official data, FII/DII, charts", "Screener.in — Fundamental screening (free)", "TradingView.com — Best free charting tool", "Moneycontrol.com — News, company results", "Economic Times Markets — Daily market news", "Zerodha Varsity — Free learning resource (highly recommended)"] },
            ].map((section, i) => (
              <div key={i} className="card">
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14, color: 'var(--accent)' }}>{section.title}</div>
                {section.steps.map((step, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{j + 1}.</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
