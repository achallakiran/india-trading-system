"""
India Trading Agent — Main entry point.
Run: python -m agent.main --symbols RELIANCE,TCS,INFY
"""

import argparse
import json
from datetime import datetime

from agent.data.groww import get_quote, get_historical
from agent.signals.technical import compute_signals
from agent.decision.agent import decide
from agent.execution.paper import buy, sell, get_summary
from agent.learning.tracker import log_decision

PAPER_MODE = True  # set to False only when ready for live trading


def run_cycle(symbols: list[str]):
    print(f"\n{'='*60}")
    print(f"Agent cycle — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Mode: {'PAPER' if PAPER_MODE else 'LIVE'}")
    print(f"{'='*60}")

    current_prices = {}

    for symbol in symbols:
        print(f"\n→ Analyzing {symbol}...")

        try:
            quote = get_quote(symbol)
            candles = get_historical(symbol, days=90)
            signals = compute_signals(candles)
            current_prices[symbol] = signals.get("current_close", 0)

            portfolio = get_summary(current_prices)
            decision = decide(symbol, quote, signals, portfolio)

            print(f"  Decision: {decision['action']} | Confidence: {decision['confidence']}")
            print(f"  Reasoning: {decision['reasoning']}")

            log_decision(
                symbol=symbol,
                action=decision["action"],
                signals=signals,
                reasoning=decision["reasoning"],
                confidence=decision["confidence"],
            )

            if PAPER_MODE:
                price = signals["current_close"]
                if decision["action"] == "BUY" and decision.get("quantity"):
                    result = buy(symbol, price, decision["quantity"], decision["reasoning"])
                    print(f"  Paper trade: {result['status']}")
                elif decision["action"] == "SELL" and decision.get("quantity"):
                    result = sell(symbol, price, decision["quantity"], decision["reasoning"])
                    print(f"  Paper trade: {result['status']}")

        except Exception as e:
            print(f"  Error processing {symbol}: {e}")

    summary = get_summary(current_prices)
    print(f"\nPortfolio Summary:")
    print(f"  Cash: ₹{summary['cash']:,.2f}")
    print(f"  Positions value: ₹{summary['positions_value']:,.2f}")
    print(f"  Total value: ₹{summary['total_value']:,.2f}")
    print(f"  Total P&L: ₹{summary['total_pnl']:,.2f}")


def main():
    parser = argparse.ArgumentParser(description="India Trading Agent")
    parser.add_argument("--symbols", default="RELIANCE,TCS,INFY", help="Comma-separated stock symbols")
    args = parser.parse_args()

    symbols = [s.strip().upper() for s in args.symbols.split(",")]
    run_cycle(symbols)


if __name__ == "__main__":
    main()
