# India Trading Agent — Living Documentation

> This document is auto-enhanced on every new learning, feature, or decision.
> Last updated: 2026-05-05

---

## Project Overview

An autonomous AI-powered stock trading agent for Indian markets (NSE/BSE).
Uses Claude AI as the decision brain, Groww API for market data and order execution.
Starts in **paper mode** (virtual money, real data), transitions to live trading when confident.

---

## Architecture

```
DATA LAYER       → Groww API, News, NSE/BSE, RBI, Macro sources
SIGNAL LAYER     → Technical indicators, Sentiment, FII/DII, Earnings, Macro
DECISION AGENT   → Claude AI synthesizes all signals → Buy/Sell/Hold + Reasoning
EXECUTION LAYER  → Paper engine (now) → Live Groww orders (later)
LEARNING LAYER   → Logs outcomes, identifies patterns, refines strategy
DASHBOARD        → React frontend for monitoring (Phase 6)
```

---

## Project Structure

```
india-trading-system/
├── CLAUDE.md                  # This file — living documentation
├── requirements.txt           # Python dependencies
├── agent/
│   ├── main.py                # Agent run loop (entry point)
│   ├── auth.py                # Groww OAuth authentication
│   ├── data/
│   │   ├── groww.py           # Groww API client (quotes, history, portfolio)
│   │   ├── news.py            # News sentiment fetcher
│   │   └── macro.py           # Macro data (RBI, FII/DII, inflation)
│   ├── signals/
│   │   └── technical.py       # RSI, MACD, Bollinger Bands, EMA
│   ├── decision/
│   │   └── agent.py           # Claude AI decision engine
│   ├── execution/
│   │   └── paper.py           # Paper trading engine (virtual portfolio)
│   └── learning/
│       └── tracker.py         # Outcome tracking and strategy refinement
├── data/                      # Local data (gitignored sensitive files)
│   └── learnings.json         # Accumulated strategy learnings (tracked)
└── docs/
    ├── architecture.md        # Deep-dive architecture notes
    ├── strategies.md          # Trading strategies in use
    └── learnings.md           # What the agent has learned over time
```

---

## Build Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Groww API auth + live data fetch | 🔄 In Progress |
| 2 | Signal engine (technical indicators) | ⏳ Pending |
| 3 | Claude AI decision agent | ⏳ Pending |
| 4 | Paper execution engine | ⏳ Pending |
| 5 | Learning layer | ⏳ Pending |
| 6 | React monitoring dashboard | ⏳ Pending |
| 7 | Additional data sources (news, FII/DII, macro) | ⏳ Pending |
| 8 | Live trading | ⏳ Pending |

---

## Configuration

| Setting | Value |
|---------|-------|
| Market hours | 9:15 AM – 3:30 PM IST |
| Agent cycle | Every 5 minutes during market hours |
| Paper money | ₹1,00,000 virtual capital |
| Paper mode | ON |
| Exchanges | NSE, BSE |

---

## Decision Factors

The agent considers all of the following before making a decision:

- **Technical:** RSI, MACD, Bollinger Bands, EMA (20/50/200), Volume
- **Sentiment:** News headlines, social media tone
- **Fundamentals:** Quarterly/annual results, promoter holding
- **Institutional:** FII/DII daily flows, bulk/block deals
- **Macro:** RBI policy, inflation (CPI/WPI), USD/INR, crude oil
- **Sector:** Sector rotation, index relative strength
- **Learning:** Past decisions and their outcomes in similar conditions

---

## Data Sources

| Source | Data | Status |
|--------|------|--------|
| Groww API | Live quotes, OHLCV history, portfolio, orders | 🔄 Phase 1 |
| NSE website | FII/DII flows, bulk deals, announcements | ⏳ Phase 7 |
| NewsAPI | News headlines and sentiment | ⏳ Phase 7 |
| RBI | Policy rates, monetary data | ⏳ Phase 7 |

---

## Learnings Log

> Entries added automatically as the agent learns from outcomes.

*(No learnings yet — agent not started)*

---

## Custom Commands

| Command | Description |
|---------|-------------|
| `/trade` | Run one agent cycle: fetch → signal → decide → execute → log |

---

## Decisions & Notes

- **2026-05-05:** Project started. Paper mode chosen first for safety. 5-minute cycle chosen as balance between signal quality and API rate limits.
- **2026-05-05:** Groww API credentials stored in `~/.zshenv` (not in code or chat).
