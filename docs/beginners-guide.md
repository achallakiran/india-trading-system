# Beginner's Guide — India Trading Agent

> Plain English explanations of every concept and decision made while building this system.
> Updated as we learn more.

---

## What is this system?

Think of it as a **smart assistant that watches the stock market for you**. It:
1. Reads live stock prices and patterns from Groww
2. Thinks about whether to buy, sell, or wait
3. Makes trades on your behalf (with fake money first, real money later)
4. Learns from what worked and what didn't

---

## Part 1 — Stock Market Basics

### What is NSE and BSE?
India has two main stock exchanges:
- **NSE** (National Stock Exchange) — the larger one, most stocks trade here
- **BSE** (Bombay Stock Exchange) — the older one, some stocks are only here

We mostly use NSE. When you buy RELIANCE on NSE, you're buying shares of Reliance Industries.

### What is a stock symbol?
Instead of writing "Reliance Industries Limited" every time, the exchange gives it a short code: **RELIANCE**. TCS stands for Tata Consultancy Services, INFY for Infosys, etc.

### What is OHLCV?
Every trading day, a stock has 5 key numbers:
- **O**pen — price when market opened (9:15 AM)
- **H**igh — highest price that day
- **L**ow — lowest price that day
- **C**lose — price when market closed (3:30 PM)
- **V**olume — how many shares were traded

These 5 numbers, recorded every day (or every 5 minutes, etc.), are called **candles** or **candlestick data**.

---

## Part 2 — Technical Indicators (What the Signals Mean)

Technical indicators are **mathematical formulas** applied to price history to spot patterns. Think of them as dashboard gauges in a car.

### RSI — Relative Strength Index
**What it measures:** How fast the price has been moving up or down recently.

**Range:** 0 to 100

| RSI Value | What it means |
|-----------|---------------|
| Below 30 | Stock is "oversold" — may be due for a bounce up (potential BUY) |
| 30–70 | Normal range |
| Above 70 | Stock is "overbought" — may be due for a pullback (potential SELL) |

**Real-world analogy:** Like a rubber band — the more you stretch it (price going up fast), the more it wants to snap back.

**RELIANCE example (2026-05-05):** RSI was 65.7 — close to overbought, so we waited.

---

### MACD — Moving Average Convergence Divergence
**What it measures:** The relationship between two moving averages of price. Shows momentum and direction.

It has three parts:
- **MACD line** — the main line
- **Signal line** — a smoothed version of the MACD line
- **Histogram** — the difference between the two

| Situation | Meaning |
|-----------|---------|
| MACD crosses **above** signal line | Bullish — consider BUY |
| MACD crosses **below** signal line | Bearish — consider SELL or HOLD |

**RELIANCE example:** MACD (17.2) was below signal (18.76) — bearish crossover, so we held.

---

### EMA — Exponential Moving Average
**What it measures:** The average price over the last N days, with more weight on recent prices.

We use three EMAs:
- **EMA 20** — short-term trend (last ~1 month)
- **EMA 50** — medium-term trend (last ~2.5 months)
- **EMA 200** — long-term trend (last ~10 months)

| Price vs EMA | Meaning |
|--------------|---------|
| Price **above** EMA 200 | Long-term uptrend — generally bullish |
| Price **below** EMA 200 | Long-term downtrend — be cautious |
| EMA 20 crosses above EMA 50 | "Golden cross" — strong buy signal |
| EMA 20 crosses below EMA 50 | "Death cross" — strong sell signal |

**RELIANCE example:** Price (1462) was above EMA20 (1447), EMA50 (1416), EMA200 (1382) — all three bullish.

---

### Bollinger Bands
**What it measures:** A range around the average price. When price is near the top band, it's expensive relative to recent history. Near the bottom band = cheap.

Three lines:
- **Upper band** — average + 2 standard deviations
- **Middle band** — 20-day moving average
**Lower band** — average - 2 standard deviations

| Price position | Meaning |
|----------------|---------|
| Near upper band | Potentially overbought |
| Near lower band | Potentially oversold — buy opportunity |
| Bands squeezing together | Big move coming soon (direction unknown) |

---

### ATR — Average True Range
**What it measures:** How much the stock typically moves in a day (volatility).

**Use:** Helps set stop losses. If ATR is ₹10, the stock normally moves ₹10/day, so a stop loss of ₹5 would be too tight.

**RELIANCE example:** ATR was ₹10.31 — so a 5% stop loss (~₹73) gives plenty of room.

---

### Volume
**What it measures:** How many shares traded that day.

| Volume | Meaning |
|--------|---------|
| Much higher than average | Strong conviction — the move is real |
| Much lower than average | Weak signal — don't trust the move |

**RELIANCE example:** Volume (23.5M) was well above 20-day average (15.5M) — confirming the price move was genuine.

---

## Part 3 — The Groww API Setup

### What is an API?
An **API** (Application Programming Interface) is a way for programs to talk to each other. The Groww API lets our Python program ask Groww: "What is RELIANCE's price right now?" and get a response.

### Why does the token expire every day?
Groww resets access tokens at 6 AM every day as a **security measure**. If someone steals your token, the damage is limited to one day. Think of it like a daily visitor pass that expires at end of day.

### What is static IP?
Your home internet connection has an **IP address** — a number that identifies your computer on the internet. Groww restricts the API to only accept requests from your registered IP, so even if someone gets your token, they can't use it from their location.

---

## Part 4 — Paper Trading

### What is paper trading?
Trading with **fake money but real market prices**. 

We start with ₹1,00,000 in virtual cash. Every trade is recorded but no real money moves. The goal: prove the strategy works before risking real money.

### When do we go live?
Only after:
- 30+ days of consistent paper profits
- Understanding why each winning trade worked
- Having stop losses and risk rules in place

---

## Part 5 — How Claude Decides

When you run `/trade`, here's what happens:

1. **Python fetches** live price, OHLCV history, and computes all indicators
2. **Claude reads** all the indicators and asks:
   - Is the trend up or down? (EMAs)
   - Is the stock overbought or oversold? (RSI)
   - Is momentum building or fading? (MACD)
   - Is price near a support or resistance level? (Bollinger Bands)
   - Is volume confirming the move? (Volume vs average)
3. **Claude decides** BUY / SELL / HOLD with a written reason
4. **Python executes** the paper trade and logs the decision

---

## Part 6 — Key Terms Glossary

| Term | Meaning |
|------|---------|
| Bull / Bullish | Expecting prices to go up |
| Bear / Bearish | Expecting prices to go down |
| Stop loss | A pre-set price at which you sell to limit losses |
| Position | The shares you currently hold |
| Portfolio | All your investments together |
| Intraday | Buying and selling within the same day |
| Delivery / CNC | Buying and holding for more than one day |
| Segment | Category of trading: CASH (stocks), FNO (futures & options) |
| LTP | Last Traded Price — the most recent price |
| Volatility | How much the price swings up and down |

---

*This document will grow with every new concept we encounter while building the system.*
