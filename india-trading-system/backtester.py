"""
India Trading System — Real Data Backtester
============================================
Run this on YOUR computer (not here) where Yahoo Finance is accessible.

Setup (one time):
  pip install yfinance pandas numpy colorama

Run:
  python backtester.py

It will fetch real NSE data and test strategies on it.
"""

import json
import sys
from datetime import datetime, timedelta

try:
    import yfinance as yf
    import pandas as pd
    import numpy as np
except ImportError:
    print("Missing packages. Run: pip install yfinance pandas numpy")
    sys.exit(1)

try:
    from colorama import Fore, Style, init
    init()
    G = Fore.GREEN
    R = Fore.RED
    Y = Fore.YELLOW
    C = Fore.CYAN
    W = Fore.WHITE
    B = Style.BRIGHT
    E = Style.RESET_ALL
except ImportError:
    G = R = Y = C = W = B = E = ""

# ── CONFIG ────────────────────────────────────────────────────────────────────

CAPITAL = 100_000          # Paper trading capital ₹1 lakh
RISK_PER_TRADE_PCT = 1.0   # Risk 1% of capital per trade
COMMISSION = 20            # Zerodha flat ₹20 per order (₹40 round trip)

NIFTY50_SYMBOLS = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
    "HINDUNILVR", "SBIN", "BHARTIARTL", "KOTAKBANK", "LT",
    "WIPRO", "HCLTECH", "ASIANPAINT", "MARUTI", "SUNPHARMA",
    "TITAN", "BAJFINANCE", "AXISBANK", "DRREDDY", "NESTLEIND",
]

def fetch_data(symbol, period="1y"):
    """Fetch real NSE data from Yahoo Finance."""
    ticker = f"{symbol}.NS"
    print(f"  Fetching {ticker}...", end=" ")
    try:
        df = yf.download(ticker, period=period, progress=False, auto_adjust=True)
        if df.empty:
            print(f"{R}No data{E}")
            return None
        df.columns = [c.lower() for c in df.columns]
        df = df[['open', 'high', 'low', 'close', 'volume']].dropna()
        print(f"{G}✓ {len(df)} days{E}")
        return df
    except Exception as e:
        print(f"{R}Error: {e}{E}")
        return None

# ── INDICATORS ────────────────────────────────────────────────────────────────

def ema(series, period):
    return series.ewm(span=period, adjust=False).mean()

def rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0).rolling(period).mean()
    loss = (-delta.clip(upper=0)).rolling(period).mean()
    rs = gain / loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))

def atr(df, period=14):
    hl = df['high'] - df['low']
    hc = (df['high'] - df['close'].shift()).abs()
    lc = (df['low'] - df['close'].shift()).abs()
    tr = pd.concat([hl, hc, lc], axis=1).max(axis=1)
    return tr.rolling(period).mean()

# ── STRATEGIES ────────────────────────────────────────────────────────────────

def strategy_ema_crossover(df, fast=9, slow=21):
    """
    EMA Crossover Strategy
    Buy when fast EMA crosses above slow EMA
    Sell when fast EMA crosses below slow EMA
    """
    df = df.copy()
    df['ema_fast'] = ema(df['close'], fast)
    df['ema_slow'] = ema(df['close'], slow)
    df['signal'] = 0
    df.loc[df['ema_fast'] > df['ema_slow'], 'signal'] = 1
    df.loc[df['ema_fast'] < df['ema_slow'], 'signal'] = -1
    df['crossover'] = df['signal'].diff()
    df['buy'] = df['crossover'] == 2
    df['sell'] = df['crossover'] == -2
    return df

def strategy_rsi_bounce(df, oversold=30, overbought=70):
    """
    RSI Bounce Strategy
    Buy when RSI crosses above oversold (30)
    Sell when RSI crosses above overbought (70)
    """
    df = df.copy()
    df['rsi'] = rsi(df['close'])
    df['buy'] = (df['rsi'].shift() < oversold) & (df['rsi'] >= oversold)
    df['sell'] = (df['rsi'].shift() < overbought) & (df['rsi'] >= overbought)
    return df

def strategy_ema_rsi_combo(df, fast=20, slow=50, rsi_min=45, rsi_max=65):
    """
    Combined EMA + RSI Strategy (more filtered = higher quality signals)
    Buy: Price above slow EMA + fast EMA rising + RSI in sweet spot
    """
    df = df.copy()
    df['ema_fast'] = ema(df['close'], fast)
    df['ema_slow'] = ema(df['close'], slow)
    df['rsi_val'] = rsi(df['close'])
    df['atr_val'] = atr(df)

    # Entry: price above both EMAs, fast EMA trending up, RSI in range
    df['buy'] = (
        (df['close'] > df['ema_slow']) &
        (df['ema_fast'] > df['ema_slow']) &
        (df['ema_fast'] > df['ema_fast'].shift(3)) &
        (df['rsi_val'] >= rsi_min) &
        (df['rsi_val'] <= rsi_max)
    ) & ~(
        (df['close'] > df['ema_slow']) &
        (df['ema_fast'] > df['ema_slow']) &
        (df['ema_fast'] > df['ema_fast'].shift(3)) &
        (df['rsi_val'] >= rsi_min) &
        (df['rsi_val'] <= rsi_max)
    ).shift(1).fillna(False)

    df['sell'] = df['rsi_val'] > 70
    return df

STRATEGIES = {
    "1": ("EMA Crossover (9/21)", strategy_ema_crossover, "swing"),
    "2": ("RSI Bounce (30/70)", strategy_rsi_bounce, "swing"),
    "3": ("EMA + RSI Combo (20/50)", strategy_ema_rsi_combo, "swing"),
}

# ── BACKTEST ENGINE ────────────────────────────────────────────────────────────

def run_backtest(df, strategy_fn, capital=CAPITAL, risk_pct=RISK_PER_TRADE_PCT):
    df = strategy_fn(df)
    df = df.dropna().copy()

    balance = capital
    position = 0
    entry_price = 0
    stop_loss = 0
    trades = []

    for i, (date, row) in enumerate(df.iterrows()):
        # Check stop loss hit
        if position > 0 and row['low'] <= stop_loss:
            pnl = (stop_loss - entry_price) * position - COMMISSION * 2
            balance += pnl
            trades.append({
                'type': 'SL Hit', 'date': str(date.date()),
                'entry': entry_price, 'exit': stop_loss,
                'qty': position, 'pnl': round(pnl, 2),
                'balance': round(balance, 2)
            })
            position = 0
            continue

        # Entry signal
        if row.get('buy', False) and position == 0:
            risk_amt = balance * (risk_pct / 100)
            atr_val = row.get('atr_val', row['close'] * 0.02)
            sl_distance = max(atr_val * 1.5, row['close'] * 0.01)
            qty = int(risk_amt / sl_distance)
            if qty < 1:
                continue
            cost = qty * row['close'] + COMMISSION
            if cost > balance:
                continue
            entry_price = row['close']
            stop_loss = entry_price - sl_distance
            position = qty
            balance -= cost

        # Exit signal
        elif row.get('sell', False) and position > 0:
            exit_price = row['close']
            pnl = (exit_price - entry_price) * position - COMMISSION * 2
            balance += position * exit_price + pnl - (position * exit_price)
            balance = balance  # net already in pnl calc
            # recalc cleanly
            proceeds = position * exit_price - COMMISSION
            balance_before_entry = balance + position * entry_price + COMMISSION
            balance = balance_before_entry - position * entry_price - COMMISSION + proceeds
            pnl = (exit_price - entry_price) * position - COMMISSION * 2
            trades.append({
                'type': 'Signal Exit', 'date': str(date.date()),
                'entry': round(entry_price, 2), 'exit': round(exit_price, 2),
                'qty': position, 'pnl': round(pnl, 2),
                'balance': round(balance, 2)
            })
            position = 0

    # Force close any open position at last price
    if position > 0:
        exit_price = df['close'].iloc[-1]
        pnl = (exit_price - entry_price) * position - COMMISSION * 2
        trades.append({
            'type': 'Force Close', 'date': str(df.index[-1].date()),
            'entry': round(entry_price, 2), 'exit': round(exit_price, 2),
            'qty': position, 'pnl': round(pnl, 2),
            'balance': round(balance + pnl, 2)
        })
        balance += pnl

    # Stats
    if not trades:
        return None

    pnls = [t['pnl'] for t in trades]
    winners = [p for p in pnls if p > 0]
    losers = [p for p in pnls if p < 0]

    return {
        'trades': trades,
        'total_trades': len(trades),
        'winners': len(winners),
        'losers': len(losers),
        'win_rate': round(len(winners) / len(trades) * 100, 1),
        'total_pnl': round(sum(pnls), 2),
        'final_capital': round(balance, 2),
        'return_pct': round((balance - capital) / capital * 100, 2),
        'avg_win': round(sum(winners) / len(winners), 2) if winners else 0,
        'avg_loss': round(sum(losers) / len(losers), 2) if losers else 0,
        'best_trade': round(max(pnls), 2),
        'worst_trade': round(min(pnls), 2),
        'expectancy': round((len(winners)/len(trades)) * (sum(winners)/len(winners) if winners else 0) +
                            (len(losers)/len(trades)) * (sum(losers)/len(losers) if losers else 0), 2),
    }

# ── DISPLAY ───────────────────────────────────────────────────────────────────

def print_header():
    print(f"\n{B}{C}{'='*60}")
    print(f"   🇮🇳  INDIA TRADING SYSTEM — Real Data Backtester")
    print(f"{'='*60}{E}\n")

def print_results(symbol, strategy_name, results, period):
    if not results:
        print(f"  {R}No trades generated for {symbol}{E}")
        return

    pnl_color = G if results['total_pnl'] >= 0 else R
    print(f"\n{B}{W}── {symbol} | {strategy_name} | {period} ──{E}")
    print(f"  Trades: {results['total_trades']}  |  "
          f"Win Rate: {Y}{results['win_rate']}%{E}  |  "
          f"W:{G}{results['winners']}{E} L:{R}{results['losers']}{E}")
    print(f"  Total P&L:   {pnl_color}{B}₹{results['total_pnl']:,.0f}{E}  "
          f"({pnl_color}{results['return_pct']:+.1f}%{E})")
    print(f"  Final Cap:   {C}₹{results['final_capital']:,.0f}{E}")
    print(f"  Expectancy:  {pnl_color}₹{results['expectancy']:,.0f}{E} per trade")
    print(f"  Best Trade:  {G}₹{results['best_trade']:,.0f}{E}  |  "
          f"Worst: {R}₹{results['worst_trade']:,.0f}{E}")

    # Show last 5 trades
    print(f"\n  {B}Last 5 trades:{E}")
    for t in results['trades'][-5:]:
        color = G if t['pnl'] >= 0 else R
        print(f"    {t['date']}  {t['type']:<14}  "
              f"Entry: ₹{t['entry']:.0f}  Exit: ₹{t['exit']:.0f}  "
              f"P&L: {color}₹{t['pnl']:,.0f}{E}")

def save_results(all_results):
    filename = f"backtest_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\n{G}✓ Results saved to {filename}{E}")
    print(f"  You can import this into your web app's Backtester page later.")

# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print_header()

    # Choose strategy
    print(f"{B}Available Strategies:{E}")
    for k, (name, _, style) in STRATEGIES.items():
        print(f"  {Y}{k}{E}. {name} ({style})")

    print(f"  {Y}4{E}. Run ALL strategies on ONE stock")
    print(f"  {Y}5{E}. Run ONE strategy on ALL Nifty 50 stocks (portfolio scan)")
    choice = input(f"\n{C}Choose [1-5]: {E}").strip()

    # Choose period
    print(f"\n{B}Data Period:{E}")
    periods = {"1": "6mo", "2": "1y", "3": "2y", "4": "3y"}
    for k, v in periods.items():
        print(f"  {Y}{k}{E}. {v}")
    p_choice = input(f"{C}Choose [1-4, default=2]: {E}").strip() or "2"
    period = periods.get(p_choice, "1y")

    all_results = {}

    if choice in ("1", "2", "3"):
        strat_name, strat_fn, _ = STRATEGIES[choice]
        symbol = input(f"{C}Enter NSE symbol (e.g. RELIANCE, TCS): {E}").strip().upper() or "RELIANCE"

        print(f"\n{B}Fetching data...{E}")
        df = fetch_data(symbol, period)
        if df is None:
            print(f"{R}Could not fetch data. Check symbol and internet connection.{E}")
            return

        print(f"\n{B}Running backtest...{E}")
        results = run_backtest(df, strat_fn)
        print_results(symbol, strat_name, results, period)
        all_results[f"{symbol}_{strat_name}"] = results

    elif choice == "4":
        symbol = input(f"{C}Enter NSE symbol: {E}").strip().upper() or "HDFCBANK"
        print(f"\n{B}Fetching data for {symbol}...{E}")
        df = fetch_data(symbol, period)
        if df is None:
            return

        print(f"\n{B}Running all strategies...{E}")
        for k, (strat_name, strat_fn, _) in STRATEGIES.items():
            results = run_backtest(df.copy(), strat_fn)
            print_results(symbol, strat_name, results, period)
            all_results[f"{symbol}_{strat_name}"] = results

        # Summary comparison
        print(f"\n{B}{C}── STRATEGY COMPARISON SUMMARY ──{E}")
        print(f"  {'Strategy':<30} {'Return':>8} {'Win Rate':>10} {'Trades':>8}")
        print(f"  {'-'*60}")
        for k, (n, _, _) in STRATEGIES.items():
            r = all_results.get(f"{symbol}_{n}")
            if r:
                color = G if r['return_pct'] >= 0 else R
                print(f"  {n:<30} {color}{r['return_pct']:>+7.1f}%{E} {r['win_rate']:>9.0f}% {r['total_trades']:>8}")

    elif choice == "5":
        strat_key = input(f"{C}Which strategy? [1/2/3]: {E}").strip() or "1"
        strat_name, strat_fn, _ = STRATEGIES.get(strat_key, STRATEGIES["1"])

        print(f"\n{B}Scanning all Nifty 50 with {strat_name}...{E}")
        scan_results = []
        for sym in NIFTY50_SYMBOLS:
            df = fetch_data(sym, period)
            if df is None:
                continue
            r = run_backtest(df, strat_fn)
            if r:
                all_results[f"{sym}_{strat_name}"] = r
                scan_results.append((sym, r))

        # Rank by return
        scan_results.sort(key=lambda x: x[1]['return_pct'], reverse=True)

        print(f"\n{B}{C}── NIFTY 50 SCAN RESULTS — {strat_name} ──{E}")
        print(f"  {'Symbol':<14} {'Return':>8} {'Win Rate':>10} {'P&L':>12} {'Trades':>8}")
        print(f"  {'-'*56}")
        for sym, r in scan_results:
            color = G if r['return_pct'] >= 0 else R
            print(f"  {sym:<14} {color}{r['return_pct']:>+7.1f}%{E} "
                  f"{r['win_rate']:>9.0f}% {color}₹{r['total_pnl']:>+10,.0f}{E} "
                  f"{r['total_trades']:>8}")

        best = scan_results[0] if scan_results else None
        if best:
            print(f"\n  {G}{B}Best performer: {best[0]} ({best[1]['return_pct']:+.1f}%){E}")

    else:
        print(f"{R}Invalid choice.{E}")
        return

    # Save?
    save = input(f"\n{C}Save results to JSON? (y/n): {E}").strip().lower()
    if save == 'y':
        save_results(all_results)

    print(f"\n{B}Done! Review the results and log your observations in the web app Journal.{E}\n")

if __name__ == "__main__":
    main()
