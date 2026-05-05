"""
Review all paper trades, outcomes, and win/loss stats.
Run: python -m agent.review
"""

import json
from agent.learning.tracker import get_stats, get_recent_learnings
from agent.execution.paper import get_summary


def main():
    print("\n" + "="*60)
    print("PAPER TRADING REVIEW")
    print("="*60)

    # portfolio summary
    summary = get_summary()
    print(f"\nPortfolio")
    print(f"  Started with : ₹{summary['initial_capital']:>10,.2f}")
    print(f"  Current value: ₹{summary['total_value']:>10,.2f}")
    print(f"  Cash         : ₹{summary['cash']:>10,.2f}")
    print(f"  P&L          : ₹{summary['total_pnl']:>10,.2f} ({summary['total_pnl_pct']:+.2f}%)")

    # open positions
    if summary["positions"]:
        print(f"\nOpen Positions")
        for p in summary["positions"]:
            print(f"  {p['symbol']:15} qty:{p['quantity']:3}  avg:₹{p['avg_price']:>8.2f}  "
                  f"now:₹{p['current_price']:>8.2f}  P&L:₹{p['pnl']:>8.2f}")
    else:
        print("\n  No open positions")

    # closed trade stats
    stats = get_stats()
    print(f"\nClosed Trade Stats")
    if "message" in stats:
        print(f"  {stats['message']}")
    else:
        print(f"  Total closed : {stats['total_closed']}")
        print(f"  Wins         : {stats['wins']}")
        print(f"  Losses       : {stats['losses']}")
        print(f"  Win rate     : {stats['win_rate_pct']}%")
        print(f"  Total P&L    : ₹{stats['total_pnl']:,.2f}")
        print(f"  Avg P&L/trade: ₹{stats['avg_pnl']:,.2f}")
        print(f"  Best trade   : {stats['best_trade']}")
        print(f"  Worst trade  : {stats['worst_trade']}")

    # recent decisions
    recent = get_recent_learnings(5)
    print(f"\nLast {len(recent)} Decisions")
    for d in recent:
        outcome = d.get("outcome")
        if outcome:
            result = outcome.get("result", "")
            pnl = outcome.get("pnl", 0)
            print(f"  {d['symbol']:12} {d['action']:4}  → {result:9}  ₹{pnl:+.2f}")
        else:
            print(f"  {d['symbol']:12} {d['action']:4}  → OPEN")

    print()


if __name__ == "__main__":
    main()
