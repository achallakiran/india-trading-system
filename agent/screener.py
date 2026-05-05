"""
Nifty 50 screener — scans all 50 stocks, scores each, returns top candidates.
Run: python -m agent.screener [--top 10]
"""

import argparse
import json
import warnings
from datetime import datetime
from agent.data.groww import get_quote, get_historical
from agent.data.news import get_market_sentiment, get_stock_news
from agent.data.fii_dii import get_fii_dii_flows
from agent.signals.technical import compute_signals

# Nifty 50 constituents (updated May 2026)
NIFTY_50 = [
    "ADANIENT", "ADANIPORTS", "APOLLOHOSP", "ASIANPAINT", "AXISBANK",
    "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BEL", "BHARTIARTL",
    "BPCL", "BRITANNIA", "CIPLA", "COALINDIA", "DRREDDY",
    "EICHERMOT", "ETERNAL", "GRASIM", "HCLTECH", "HDFCBANK",
    "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDUNILVR", "ICICIBANK",
    "INDUSINDBK", "INFY", "ITC", "JIOFIN", "JSWSTEEL",
    "KOTAKBANK", "LT", "M&M", "MARUTI", "NESTLEIND",
    "NTPC", "ONGC", "POWERGRID", "RELIANCE", "SBILIFE",
    "SHRIRAMFIN", "SBIN", "SUNPHARMA", "TATACONSUM", "TATAMOTORS",
    "TATASTEEL", "TCS", "TECHM", "TITAN", "ULTRACEMCO",
]


def score_stock(signals: dict, quote: dict) -> tuple[int, list[str]]:
    """
    Score a stock 0-100 based on how many entry conditions are met.
    Returns (score, list of reasons).
    """
    score = 0
    reasons = []
    flags = []

    rsi = signals.get("rsi_14")
    macd = signals.get("macd")
    macd_signal = signals.get("macd_signal")
    macd_diff = signals.get("macd_diff")
    ema_20 = signals.get("ema_20")
    ema_50 = signals.get("ema_50")
    ema_200 = signals.get("ema_200")
    close = signals.get("current_close")
    bb_upper = signals.get("bb_upper")
    bb_lower = signals.get("bb_lower")
    bb_mid = signals.get("bb_mid")
    volume = quote.get("volume", 0)
    volume_avg = signals.get("volume_sma_20", 1)
    change_pct = signals.get("price_change_pct", 0)

    # Trend: price above EMAs
    if close and ema_20 and close > ema_20:
        score += 15
        reasons.append("Above EMA20")
    if close and ema_50 and close > ema_50:
        score += 15
        reasons.append("Above EMA50")
    if close and ema_200 and close > ema_200:
        score += 10
        reasons.append("Above EMA200")

    # RSI: sweet spot 40-65
    if rsi and 40 <= rsi <= 65:
        score += 20
        reasons.append(f"RSI {rsi} (healthy range)")
    elif rsi and rsi < 40:
        score += 10
        reasons.append(f"RSI {rsi} (oversold — potential reversal)")
        flags.append("oversold")
    elif rsi and rsi > 70:
        score -= 10
        flags.append(f"RSI {rsi} (overbought — risky entry)")

    # MACD: positive crossover
    if macd and macd_signal and macd > macd_signal:
        score += 20
        reasons.append("MACD above signal (bullish)")
    elif macd_diff and macd_diff > -1 and macd_diff < 0:
        score += 5
        reasons.append("MACD approaching crossover")

    # Volume: above average
    if volume_avg and volume and volume > volume_avg:
        score += 10
        reasons.append(f"Volume above avg ({int(volume/volume_avg*100)}%)")

    # Bollinger: price in lower half = better entry
    if close and bb_mid and bb_upper and close < bb_mid:
        score += 10
        reasons.append("Price below BB midline (room to run)")

    return max(0, min(100, score)), reasons, flags


def run_screener(symbols: list = None, top_n: int = 10) -> dict:
    symbols = symbols or NIFTY_50
    results = []
    errors = []
    total = len(symbols)

    print(f"Fetching market context...", flush=True)
    market_sentiment = get_market_sentiment()
    fii_dii = get_fii_dii_flows()
    print(f"  Sentiment: {market_sentiment.get('sentiment')} | FII/DII: {fii_dii.get('signal', 'N/A')}")

    print(f"Scanning {total} stocks...", flush=True)

    for i, symbol in enumerate(symbols, 1):
        print(f"  [{i}/{total}] {symbol}", end=" ", flush=True)
        try:
            quote = get_quote(symbol)
            candles = get_historical(symbol, days=90)
            if len(candles) < 30:
                print("→ insufficient data")
                continue
            signals = compute_signals(candles)
            score, reasons, flags = score_stock(signals, quote)

            # news bonus: +5 if positive news, -5 if negative
            news = get_stock_news(symbol)
            if news.get("sentiment") == "POSITIVE":
                score += 5
                reasons.append(f"Positive news ({news['mentions']} mentions)")
            elif news.get("sentiment") == "NEGATIVE":
                score -= 5
                flags.append(f"Negative news ({news['mentions']} mentions)")

            results.append({
                "symbol": symbol,
                "score": min(100, max(0, score)),
                "price": signals.get("current_close"),
                "change_pct": signals.get("price_change_pct"),
                "rsi": signals.get("rsi_14"),
                "macd_diff": signals.get("macd_diff"),
                "signals": signals,
                "news": news,
                "reasons": reasons,
                "flags": flags,
            })
            print(f"→ score {score}/100")
        except Exception as e:
            errors.append({"symbol": symbol, "error": str(e)})
            print(f"→ error: {e}")

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "timestamp": datetime.now().isoformat(),
        "market_context": {
            "sentiment": market_sentiment,
            "fii_dii": fii_dii,
        },
        "total_scanned": len(results),
        "errors": len(errors),
        "top_candidates": results[:top_n],
        "full_scores": [{"symbol": r["symbol"], "score": r["score"]} for r in results],
        "error_list": errors,
    }


def main():
    parser = argparse.ArgumentParser(description="Nifty 50 Screener")
    parser.add_argument("--top", type=int, default=10, help="Number of top stocks to return")
    parser.add_argument("--symbols", default=None, help="Override symbol list (comma-separated)")
    args = parser.parse_args()

    symbols = [s.strip().upper() for s in args.symbols.split(",")] if args.symbols else None
    report = run_screener(symbols=symbols, top_n=args.top)

    print("\n" + "="*60)
    print(f"TOP {args.top} CANDIDATES")
    print("="*60)
    for r in report["top_candidates"]:
        flags = f" ⚠ {', '.join(r['flags'])}" if r["flags"] else ""
        print(f"{r['symbol']:15} Score: {r['score']:3}/100  ₹{r['price']:>8.2f}  RSI:{r['rsi']:5.1f}{flags}")
        for reason in r["reasons"]:
            print(f"  ✓ {reason}")
    print(f"\nScanned: {report['total_scanned']} | Errors: {report['errors']}")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
