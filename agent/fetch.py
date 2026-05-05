"""
Fetch live data and compute signals for given symbols.
Outputs a JSON report for Claude to analyze and decide on.
Run: python -m agent.fetch --symbols RELIANCE,TCS,INFY
"""

import argparse
import json
import sys
from datetime import datetime

from agent.data.groww import get_quote, get_historical, get_portfolio, get_positions
from agent.signals.technical import compute_signals
from agent.execution.paper import get_summary


def fetch_all(symbols: list[str]) -> dict:
    report = {
        "timestamp": datetime.now().isoformat(),
        "mode": "PAPER",
        "stocks": {},
        "portfolio": {},
        "errors": [],
    }

    current_prices = {}
    for symbol in symbols:
        try:
            quote = get_quote(symbol)
            candles = get_historical(symbol, days=90)
            signals = compute_signals(candles)
            # use live last_price from quote for P&L, fall back to candle close
            live_price = quote.get("last_price") or signals.get("current_close", 0)
            current_prices[symbol] = live_price
            report["stocks"][symbol] = {
                "quote": quote,
                "signals": signals,
                "live_price": live_price,
            }
        except Exception as e:
            report["errors"].append({"symbol": symbol, "error": str(e)})

    report["portfolio"] = get_summary(current_prices)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbols", default="RELIANCE,TCS,INFY")
    args = parser.parse_args()
    symbols = [s.strip().upper() for s in args.symbols.split(",")]
    report = fetch_all(symbols)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
