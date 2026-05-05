"""
Execute a paper trade and log the decision.
Run: python -m agent.execute --symbol RELIANCE --action BUY --quantity 10 --price 1463.6 --reason "RSI oversold, MACD crossover"
"""

import argparse
import json
from agent.execution.paper import buy, sell
from agent.learning.tracker import log_decision


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--action", required=True, choices=["BUY", "SELL", "HOLD"])
    parser.add_argument("--quantity", type=int, default=0)
    parser.add_argument("--price", type=float, required=True)
    parser.add_argument("--reason", default="")
    parser.add_argument("--confidence", type=float, default=0.0)
    args = parser.parse_args()

    result = {"action": args.action, "symbol": args.symbol}

    if args.action == "BUY" and args.quantity > 0:
        result["trade"] = buy(args.symbol, args.price, args.quantity, args.reason)
    elif args.action == "SELL" and args.quantity > 0:
        result["trade"] = sell(args.symbol, args.price, args.quantity, args.reason)

    log_decision(
        symbol=args.symbol,
        action=args.action,
        signals={"price": args.price},
        reasoning=args.reason,
        confidence=args.confidence,
    )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
