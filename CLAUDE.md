# India Trading Agent — Living Documentation

> Auto-enhanced on every new learning, feature, or decision.
> Last updated: 2026-05-05

---

## Project Overview

An autonomous AI-powered stock trading agent for Indian markets (NSE/BSE).
Claude AI (within Claude Code session) acts as the decision brain.
Groww API provides live market data and order execution.
Starts in **paper mode** (virtual ₹1,00,000, real data), transitions to live trading when confident.

---

## Architecture

```
DATA LAYER       → Groww API (live quotes, OHLCV history, portfolio)
SIGNAL LAYER     → Technical indicators (RSI, MACD, BB, EMA, ATR, Volume)
DECISION ENGINE  → Claude AI (in this session) reads signals → Buy/Sell/Hold
EXECUTION LAYER  → Paper engine now → Live Groww orders later
LEARNING LAYER   → Logs decisions + outcomes → refines strategy over time
DASHBOARD        → React frontend (Phase 6)
```

---

## Project Structure

```
india-trading-system/
├── CLAUDE.md                        # This file — living documentation
├── requirements.txt                 # Python dependencies
├── agent/
│   ├── auth.py                      # Groww SDK client init
│   ├── fetch.py                     # Fetch data + compute signals (outputs JSON)
│   ├── execute.py                   # Execute paper trade + log decision
│   ├── main.py                      # Legacy full-cycle runner (kept for reference)
│   ├── data/
│   │   └── groww.py                 # Groww API wrappers
│   ├── signals/
│   │   └── technical.py             # RSI, MACD, BB, EMA, ATR
│   ├── execution/
│   │   └── paper.py                 # Paper trading engine
│   └── learning/
│       └── tracker.py               # Decision + outcome logger
├── data/
│   ├── learnings.json               # Decision log (tracked in git)
│   ├── portfolio.json               # Paper portfolio (gitignored)
│   └── trades.json                  # Paper trade history (gitignored)
└── docs/
    ├── beginners-guide.md           # Concepts explained for beginners
    ├── strategies.md                # Trading strategies in use
    └── learnings.md                 # What the agent has learned
```

---

## Build Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Groww API auth + live data fetch + signals | ✅ Complete |
| 2 | Claude decision engine (in-session) | ✅ Complete |
| 3 | Paper execution engine | ✅ Complete |
| 4 | Strategy framework | 🔄 Next |
| 5 | Additional data sources (news, FII/DII, macro) | ⏳ Pending |
| 6 | Learning layer (outcome tracking + refinement) | ⏳ Pending |
| 7 | React monitoring dashboard | ⏳ Pending |
| 8 | Live trading | ⏳ Pending |

---

## Groww API — Auth & Setup (Critical)

**Token type:** Daily Access Token (not TOTP, not API key+secret)

**How to generate each morning:**
1. Go to https://groww.in/trade-api/api-keys
2. Click "Generate API key" → "Generate Access Token"
3. Copy the token
4. Run: `echo 'export GROWW_API_KEY=your_token' > ~/.zshenv`

**Token properties:**
- Expires at **6 AM IST daily** — must be renewed each trading day
- IP-locked to registered static IP (currently: 171.76.81.42)
- Permissions: order-basic, live_data-basic, non_trading-basic, order_read_only-basic

**Working SDK methods:**
| Method | Notes |
|--------|-------|
| `get_quote(trading_symbol, exchange, segment)` | Live quote with OHLC, depth, volume |
| `get_historical_candle_data(trading_symbol, exchange, segment, start_time, end_time)` | OHLCV history — use this, NOT get_historical_candles (forbidden) |
| `get_instrument_by_exchange_and_trading_symbol(exchange, trading_symbol)` | Gets groww_symbol, exchange_token, instrument details |
| `get_holdings_for_user()` | Real portfolio holdings |
| `get_positions_for_user()` | Intraday positions |

**How to run a fetch:**
```bash
source ~/.zshenv && GROWW_API_KEY=$GROWW_API_KEY python -m agent.fetch --symbols RELIANCE,TCS,INFY
```

---

## How Claude Makes Decisions

Claude (in this Claude Code session) reads the JSON output from `agent.fetch` and decides:
- **BUY** — strong signal, good risk/reward, portfolio has room
- **SELL** — exit signal or stop loss triggered
- **HOLD** — wait for better entry or conflicting signals

Then executes via:
```bash
source ~/.zshenv && GROWW_API_KEY=$GROWW_API_KEY python -m agent.execute --symbol RELIANCE --action BUY --quantity 10 --price 1463.6 --reason "reason here"
```

---

## Risk Rules (Always Applied)

- Max 20% of portfolio in any single stock
- Stop loss at 5% below entry price
- Only trade during market hours: 9:15 AM – 3:30 PM IST (Mon–Fri)
- Paper mode ON until 30+ days of consistent profit

---

## Signal Reference

| Signal | Bullish | Bearish |
|--------|---------|---------|
| RSI (14) | 30–50 (recovering) | >70 (overbought) |
| MACD | MACD crosses above signal | MACD crosses below signal |
| EMA | Price above EMA20/50/200 | Price below EMAs |
| Bollinger Bands | Price bounces off lower band | Price rejected at upper band |
| Volume | High volume on up moves | High volume on down moves |

---

## Custom Commands

| Command | Description |
|---------|-------------|
| `/trade` | Run one agent cycle: fetch → Claude decides → execute → log |

---

## Learnings Log

| Date | Learning |
|------|----------|
| 2026-05-05 | `get_historical_candles()` returns "Access forbidden" — use `get_historical_candle_data()` instead |
| 2026-05-05 | Daily access token (not API key+secret) is the correct auth method for Groww |
| 2026-05-05 | Anthropic API key not needed — Claude in this session acts as decision engine |
| 2026-05-05 | RELIANCE: RSI 65.7, bearish MACD crossover, above all EMAs — HOLD decision |

---

## Decisions & Notes

- **2026-05-05:** Project started. Paper mode first for safety.
- **2026-05-05:** Claude in Claude Code session = decision engine (no separate Anthropic API billing).
- **2026-05-05:** Phase 1 complete — live data, signals, paper execution all confirmed working.
