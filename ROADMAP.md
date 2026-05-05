# Roadmap & Session Tracker

> Claude reads this at the start of every session to know exactly where we are and what to build next.
> Updated at end of every session.

---

## Current Status: Phase 4 — Strategy & Screener

---

## What Is Built (Completed)

### Phase 1 — Data Layer ✅
- Groww API auth using daily access token
- Live quotes via `get_quote()`
- Historical OHLCV via `get_historical_candle_data()`
- Instrument lookup via `get_instrument_by_exchange_and_trading_symbol()`

### Phase 2 — Signal Layer ✅
- RSI (14), MACD, EMA (20/50/200), Bollinger Bands, ATR, Volume
- All computed from 90-day OHLCV candles in `agent/signals/technical.py`

### Phase 3 — Decision Engine ✅
- Claude (in Claude Code session) acts as decision engine — no separate Anthropic API cost
- `agent/fetch.py` — fetches data + signals, outputs JSON for Claude to read
- `agent/execute.py` — executes paper trades based on Claude's decision

### Phase 4a — Paper Execution ✅
- Virtual ₹1,00,000 portfolio in `data/portfolio.json`
- Buy/sell/hold with full audit trail in `data/trades.json`
- P&L summary with current prices

### Phase 4b — Screener ✅
- `agent/screener.py` — scans Nifty 50, scores each stock 0-100
- Brings only top N candidates to Claude (keeps token usage low)
- Scoring criteria: EMA trend, RSI range, MACD crossover, Volume, Bollinger position

---

## What To Build Next (In Order)

### 🔲 Phase 4c — Screener + /trade Integration
- Update `/trade` command to run screener first, then decide on top candidates
- Add `/screen` as a standalone command

### ✅ Phase 5 — Additional Data Sources
- News sentiment from ET, Moneycontrol, Business Standard RSS feeds (no API key)
- FII/DII flows from NSE public API — used as market-wide filter
- News score adjusts screener score ±5 per stock
- Sector strength — 🔲 pending

### 🔲 Phase 4c — Screener wired into /trader seamlessly
- /trader → Screen + Trade runs screener then auto-fetches top candidates

### ✅ Phase 6a — Outcome Tracking
- Every SELL automatically closes the loop on the original BUY decision
- `record_outcome()` logs exit price, P&L, WIN/LOSS/BREAKEVEN
- `agent/review.py` shows win rate, avg P&L, best/worst trades

### 🔲 Phase 6b — Strategy Learning
- Weekly review: which signals predicted correctly, which didn't
- Claude updates scoring weights in screener based on observed accuracy

### 🔲 Phase 7 — React Dashboard
- Visual portfolio tracker
- Live P&L chart
- Signal heatmap for all Nifty 50 stocks
- Decision log with reasons

### 🔲 Phase 8 — Live Trading
- Only after 30+ days paper profit
- Switch `PAPER_MODE = False` in execute.py
- Add order confirmation step before executing

---

## Session Log

| Date | What Was Done | Next Session Should |
|------|--------------|---------------------|
| 2026-05-05 | Project setup, Groww API connected, Phase 1-4 complete, screener built, first paper trades executed | Check positions P&L, run /trader → Screen + Trade, fix TATAMOTORS symbol error |
| 2026-05-05 | Scanned all 49 Nifty 50 stocks. Bought APOLLOHOSP @₹7750, HINDALCO @₹1057 (x5), BAJAJFINSV @₹1791 (x5). Cash: ₹78,010 | Tomorrow: refresh Groww token, run /trader, review open positions, scan again |

---

## Daily Routine

1. **Morning (before 9:15 AM IST):** Generate new Groww token from https://groww.in/trade-api/api-keys
2. **9:15 AM:** Run `/screen` to get top candidates
3. **9:30 AM onwards:** Run `/trade` on top candidates
4. **3:30 PM:** Market closes — review decisions
5. **Evening:** Update ROADMAP.md session log

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Groww token | `~/.zshenv` → GROWW_API_KEY |
| Run screener | `source ~/.zshenv && GROWW_API_KEY=$GROWW_API_KEY python -m agent.screener --top 10` |
| Run fetch | `source ~/.zshenv && GROWW_API_KEY=$GROWW_API_KEY python -m agent.fetch --symbols SYM1,SYM2` |
| Execute trade | `source ~/.zshenv && GROWW_API_KEY=$GROWW_API_KEY python -m agent.execute --symbol X --action BUY --quantity N --price P --reason "..."` |
| Portfolio | `data/portfolio.json` |
| Trade history | `data/trades.json` |
| Decisions log | `data/learnings.json` |
