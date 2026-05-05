"""
Fetch live data, signals, news sentiment and FII/DII flows.
Outputs a JSON report for Claude to analyze and decide on.
Run: python -m agent.fetch --symbols RELIANCE,TCS,INFY
"""

import argparse
import json
from datetime import datetime

from agent.data.groww import get_quote, get_historical
from agent.data.news import get_market_sentiment, get_stock_news
from agent.data.fii_dii import get_fii_dii_flows
from agent.signals.technical import compute_signals
from agent.execution.paper import get_summary


def fetch_all(symbols: list[str], include_news: bool = True) -> dict:
    report = {
        "timestamp": datetime.now().isoformat(),
        "mode": "PAPER",
        "market_context": {},
        "stocks": {},
        "portfolio": {},
        "errors": [],
    }

    # market-wide context (FII/DII + sentiment)
    if include_news:
        print("  Fetching market sentiment...", flush=True)
        report["market_context"]["sentiment"] = get_market_sentiment()
        print("  Fetching FII/DII flows...", flush=True)
        report["market_context"]["fii_dii"] = get_fii_dii_flows()

    current_prices = {}
    for symbol in symbols:
        print(f"  Fetching {symbol}...", flush=True)
        try:
            quote = get_quote(symbol)
            candles = get_historical(symbol, days=90)
            signals = compute_signals(candles)
            live_price = quote.get("last_price") or signals.get("current_close", 0)
            current_prices[symbol] = live_price

            stock_data = {
                "quote": quote,
                "signals": signals,
                "live_price": live_price,
            }

            if include_news:
                stock_data["news"] = get_stock_news(symbol)

            report["stocks"][symbol] = stock_data

        except Exception as e:
            report["errors"].append({"symbol": symbol, "error": str(e)})

    report["portfolio"] = get_summary(current_prices)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbols", default="RELIANCE,TCS,INFY")
    parser.add_argument("--no-news", action="store_true", help="Skip news and FII/DII fetch")
    args = parser.parse_args()
    symbols = [s.strip().upper() for s in args.symbols.split(",")]
    report = fetch_all(symbols, include_news=not args.no_news)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
