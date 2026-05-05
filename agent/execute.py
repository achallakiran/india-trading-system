"""
Execute a paper trade and log the decision + outcome.
Run: python -m agent.execute --symbol RELIANCE --action BUY --quantity 10 --price 1463.6 --reason "RSI oversold, MACD crossover" --confidence 0.8
"""

import argparse
import json
from agent.execution.paper import buy, sell, get_portfolio
from agent.learning.tracker import log_decision, record_outcome


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--action", required=True, choices=["BUY", "SELL", "HOLD"])
    parser.add_argument("--quantity", type=int, default=0)
    parser.add_argument("--price", type=float, required=True)
    parser.add_argument("--reason", default="")
    parser.add_argument("--confidence", type=float, default=0.0)
    parser.add_argument("--signals", default="{}", help="JSON string of full signals snapshot")
    args = parser.parse_args()

    try:
        signals = json.loads(args.signals)
    except Exception:
        signals = {}
    signals["price"] = args.price

    result = {"action": args.action, "symbol": args.symbol}

    if args.action == "BUY" and args.quantity > 0:
        result["trade"] = buy(args.symbol, args.price, args.quantity, args.reason)

        log_decision(
            symbol=args.symbol,
            action="BUY",
            signals=signals,
            reasoning=args.reason,
            confidence=args.confidence,
        )

    elif args.action == "SELL" and args.quantity > 0:
        # get entry price from portfolio before selling
        portfolio = get_portfolio()
        pos = portfolio.get("positions", {}).get(args.symbol)
        entry_price = pos["avg_price"] if pos else args.price

        result["trade"] = sell(args.symbol, args.price, args.quantity, args.reason)

        log_decision(
            symbol=args.symbol,
            action="SELL",
            signals=signals,
            reasoning=args.reason,
            confidence=args.confidence,
        )

        # automatically close the loop on the original BUY decision
        outcome = record_outcome(
            symbol=args.symbol,
            entry_price=entry_price,
            exit_price=args.price,
            quantity=args.quantity,
        )
        result["outcome"] = outcome

    elif args.action == "HOLD":
        log_decision(
            symbol=args.symbol,
            action="HOLD",
            signals=signals,
            reasoning=args.reason,
            confidence=args.confidence,
        )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
