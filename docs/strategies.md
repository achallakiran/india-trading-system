# Trading Strategies — India Trading Agent

> This document evolves as the agent learns what works in Indian markets.
> Last updated: 2026-05-05

---

## Strategy Philosophy

We use a **multi-factor approach**: no single indicator makes a decision. At least 3 signals must agree before buying or selling. This reduces false signals.

Think of it like a panel of judges — you need a majority vote, not one opinion.

---

## Phase 4 Strategy — Trend Following with Momentum Filter

This is our starting strategy. Simple, proven, easy to understand.

### Entry Rules (BUY when ALL of these are true)
1. Price is **above EMA 20 and EMA 50** (uptrend confirmed)
2. RSI is between **40 and 65** (not overbought, has room to run)
3. MACD line is **above signal line** (momentum is positive)
4. Volume is **above 20-day average** (institutional interest)
5. Price is in the **lower half of Bollinger Bands** (reasonable entry, not extended)

### Exit Rules (SELL when ANY of these trigger)
1. RSI crosses **above 75** (overbought — take profits)
2. MACD crosses **below signal line** (momentum reversing)
3. Price drops **5% below entry price** (stop loss — protect capital)
4. Price closes **below EMA 20 for 2 consecutive days** (trend broken)

### Position Sizing
- Max **20% of portfolio** in any single stock
- Start with **small positions** (5–10% each) while learning

---

## Candidate Stocks to Watch

Starting watchlist (large-cap, liquid, well-known):

| Symbol | Company | Sector |
|--------|---------|--------|
| RELIANCE | Reliance Industries | Energy/Retail/Telecom |
| TCS | Tata Consultancy Services | IT |
| INFY | Infosys | IT |
| HDFCBANK | HDFC Bank | Banking |
| ICICIBANK | ICICI Bank | Banking |
| WIPRO | Wipro | IT |
| BAJFINANCE | Bajaj Finance | NBFC |
| AXISBANK | Axis Bank | Banking |

*Why large-caps first?* They are more stable, have high volume (easier to buy/sell), and are less prone to manipulation.

---

## Future Strategies (to be added)

### Phase 5 — Sentiment Layer
Add news sentiment as a filter:
- Positive news + technical BUY signal = stronger conviction
- Negative news = skip even if technicals look good

### Phase 6 — FII/DII Flow Filter
- When FII (foreign investors) are buying heavily = bull signal
- When FII are selling heavily = avoid new positions

### Phase 7 — Sector Rotation
- Identify which sectors are outperforming the Nifty index
- Focus buys in strong sectors, avoid weak ones

### Phase 8 — Earnings Play
- Avoid holding positions into quarterly results (high uncertainty)
- Or specifically trade the post-results momentum

---

## What Has Worked (Running Log)

*To be filled as we run cycles and observe outcomes.*

| Date | Symbol | Signal | Outcome | Learning |
|------|--------|--------|---------|---------|
| — | — | — | — | — |

---

## What Has NOT Worked

*To be filled as we learn from mistakes.*

| Date | Symbol | What went wrong | Lesson |
|------|--------|-----------------|--------|
| — | — | — | — |

---

## Risk Management Rules (Non-negotiable)

1. **Never risk more than 5%** of total portfolio on a single trade (stop loss)
2. **Max 20%** of portfolio in any single stock
3. **No trading in the first 15 minutes** (9:15–9:30 AM) — market is volatile at open
4. **No trading in the last 15 minutes** (3:15–3:30 PM) — prices can spike unpredictably
5. **Paper mode first** — minimum 30 days before considering live trading
