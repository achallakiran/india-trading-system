// src/data/store.js — Single source of truth for all data

const KEYS = {
  trades: 'its_trades',
  knowledge: 'its_knowledge',
  news: 'its_news',
  lessons: 'its_lessons',
};

// ── DEFAULT SEED DATA ────────────────────────────────────────

const DEFAULT_TRADES = [];

const DEFAULT_KNOWLEDGE = [
  {
    id: 'k1', category: 'Basics', title: 'What is NSE vs BSE?',
    content: `NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are India's two main stock exchanges.\n\n• BSE is older (1875), NSE is newer (1992) but has higher trading volume\n• Nifty 50 is NSE's benchmark index (top 50 companies)\n• Sensex is BSE's benchmark (top 30 companies)\n• Most liquid stocks trade on both exchanges\n• For retail traders, NSE is preferred due to better liquidity`,
    tags: ['beginner', 'markets'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k2', category: 'Basics', title: 'Market Timings in India',
    content: `Indian stock markets operate Monday–Friday (except holidays):\n\n• Pre-open session: 9:00 AM – 9:15 AM (order collection)\n• Regular trading: 9:15 AM – 3:30 PM IST\n• Post-close: 3:30 PM – 4:00 PM\n• Commodity markets (MCX): 9 AM – 11:30 PM\n\nKey: Always convert to IST when checking global market references.`,
    tags: ['beginner', 'timing'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k3', category: 'Indicators', title: 'What is RSI (Relative Strength Index)?',
    content: `RSI measures the speed and magnitude of price changes. It oscillates between 0–100.\n\n• RSI > 70 = Overbought (possible reversal down)\n• RSI < 30 = Oversold (possible reversal up)\n• RSI = 50 = Neutral\n\nFor Indian markets, use RSI on 14-period setting. Nifty and Bank Nifty traders watch RSI on 5-min charts for intraday.`,
    tags: ['indicator', 'technical'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k4', category: 'Indicators', title: 'EMA — Exponential Moving Average',
    content: `EMA gives more weight to recent prices vs SMA (Simple Moving Average).\n\nCommon EMA pairs used by Indian traders:\n• 9 EMA + 21 EMA (intraday)\n• 20 EMA + 50 EMA (swing)\n• 50 EMA + 200 EMA (long-term trend)\n\nSignal: When shorter EMA crosses above longer EMA = Bullish crossover (Buy signal). Opposite = Bearish (Sell signal).`,
    tags: ['indicator', 'technical', 'EMA'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k5', category: 'Indian Markets', title: 'FII vs DII — Who moves Indian markets?',
    content: `FII = Foreign Institutional Investors (global funds investing in India)\nDII = Domestic Institutional Investors (Indian mutual funds, LIC, etc.)\n\n• FII selling = Market usually falls (they have huge capital)\n• DII buying = Acts as a cushion when FIIs sell\n• Check FII/DII data daily on NSE website under "Market Data"\n• High FII buying = Bullish signal for index stocks`,
    tags: ['macro', 'indian-markets'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k6', category: 'Strategy', title: 'Opening Range Breakout (ORB) — Intraday',
    content: `One of the most popular intraday strategies for Nifty/Bank Nifty:\n\n1. Note the High and Low of first 15 minutes (9:15–9:30 AM)\n2. If price breaks ABOVE that high with volume = BUY\n3. If price breaks BELOW that low with volume = SELL SHORT\n4. Stop loss = Opposite end of the opening range\n5. Target = 1.5x to 2x the range\n\nBest on: Nifty 50, Bank Nifty, large-cap stocks like RELIANCE, TCS, HDFC Bank`,
    tags: ['strategy', 'intraday', 'ORB'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k7', category: 'Risk Management', title: 'The 1% Rule — Protect your capital',
    content: `Never risk more than 1–2% of your total capital on a single trade.\n\nExample: If paper trading capital = ₹1,00,000\n→ Max risk per trade = ₹1,000\n\nHow to calculate position size:\nPosition Size = Risk Amount ÷ (Entry Price − Stop Loss Price)\n\nExample: Entry ₹500, SL ₹490, Risk ₹10/share\n→ Position = ₹1,000 ÷ ₹10 = 100 shares`,
    tags: ['risk', 'beginner', 'position-sizing'], addedDate: '2025-01-01', tradeLinked: null
  },
  {
    id: 'k8', category: 'Indian Markets', title: 'Key Indian Sectors to Watch',
    content: `India's market is driven by these key sectors:\n\n🏦 Banking & Finance (HDFC, ICICI, SBI) — Largest weight in Nifty\n💻 IT (TCS, Infosys, Wipro) — Affected by US tech sentiment & INR/USD\n💊 Pharma (Sun Pharma, Dr Reddy's) — Defensive sector\n🚗 Auto (Maruti, Tata Motors) — Follows RBI rates & fuel prices\n🏗️ Infrastructure (L&T) — Budget & govt spending driven\n\nBeginners: Start with Nifty 50 stocks only.`,
    tags: ['sectors', 'indian-markets', 'beginner'], addedDate: '2025-01-01', tradeLinked: null
  },
];

const DEFAULT_NEWS = [
  {
    id: 'n1',
    date: '2025-01-01',
    title: 'RBI holds repo rate at 6.5%',
    category: 'Macro',
    impact: 'Neutral',
    summary: 'RBI Monetary Policy Committee kept rates unchanged. Banking stocks were stable. Market expected this decision.',
    affectedSectors: ['Banking', 'NBFC', 'Real Estate'],
    tradeImpact: '',
    source: 'RBI Official',
  },
];

const DEFAULT_LESSONS = [];

// ── STORAGE HELPERS ─────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── PUBLIC API ───────────────────────────────────────────────

export const store = {
  // TRADES
  getTrades: () => load(KEYS.trades, DEFAULT_TRADES),
  saveTrades: (t) => save(KEYS.trades, t),
  addTrade: (trade) => {
    const trades = store.getTrades();
    const newTrade = { ...trade, id: Date.now().toString(), createdAt: new Date().toISOString() };
    store.saveTrades([newTrade, ...trades]);
    return newTrade;
  },
  updateTrade: (id, patch) => {
    const trades = store.getTrades().map(t => t.id === id ? { ...t, ...patch } : t);
    store.saveTrades(trades);
  },
  deleteTrade: (id) => store.saveTrades(store.getTrades().filter(t => t.id !== id)),

  // KNOWLEDGE
  getKnowledge: () => load(KEYS.knowledge, DEFAULT_KNOWLEDGE),
  saveKnowledge: (k) => save(KEYS.knowledge, k),
  addKnowledge: (item) => {
    const items = store.getKnowledge();
    const newItem = { ...item, id: Date.now().toString(), addedDate: new Date().toISOString().split('T')[0] };
    store.saveKnowledge([...items, newItem]);
    return newItem;
  },

  // NEWS
  getNews: () => load(KEYS.news, DEFAULT_NEWS),
  saveNews: (n) => save(KEYS.news, n),
  addNews: (item) => {
    const items = store.getNews();
    const newItem = { ...item, id: Date.now().toString() };
    store.saveNews([newItem, ...items]);
    return newItem;
  },

  // LESSONS
  getLessons: () => load(KEYS.lessons, DEFAULT_LESSONS),
  addLesson: (lesson) => {
    const lessons = store.getLessons();
    const newLesson = { ...lesson, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
    save(KEYS.lessons, [newLesson, ...lessons]);
    return newLesson;
  },

  // STATS
  getStats: () => {
    const trades = store.getTrades();
    const closed = trades.filter(t => t.status === 'closed');
    const winners = closed.filter(t => (t.pnl || 0) > 0);
    const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
    return {
      totalTrades: trades.length,
      openTrades: trades.filter(t => t.status === 'open').length,
      closedTrades: closed.length,
      winRate: closed.length ? Math.round((winners.length / closed.length) * 100) : 0,
      totalPnl,
      bestTrade: closed.length ? Math.max(...closed.map(t => t.pnl || 0)) : 0,
      worstTrade: closed.length ? Math.min(...closed.map(t => t.pnl || 0)) : 0,
    };
  },
};
