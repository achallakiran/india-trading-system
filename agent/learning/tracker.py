import json
import os
from datetime import datetime

LEARNINGS_FILE = os.path.join(os.path.dirname(__file__), "../../data/learnings.json")


def _load():
    try:
        with open(LEARNINGS_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"version": "1.0", "created": datetime.now().isoformat(), "learnings": []}


def _save(data):
    with open(LEARNINGS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def log_decision(symbol: str, action: str, signals: dict, reasoning: str, confidence: float):
    data = _load()
    data["learnings"].append({
        "timestamp": datetime.now().isoformat(),
        "type": "decision",
        "symbol": symbol,
        "action": action,
        "signals_snapshot": signals,
        "reasoning": reasoning,
        "confidence": confidence,
        "outcome": None,
    })
    _save(data)


def record_outcome(symbol: str, entry_price: float, exit_price: float, quantity: int):
    """Called automatically when a SELL is executed. Closes the loop on the BUY decision."""
    data = _load()
    pnl = round((exit_price - entry_price) * quantity, 2)
    pnl_pct = round(((exit_price - entry_price) / entry_price) * 100, 2)

    # find the most recent open BUY decision for this symbol
    matched = False
    for entry in reversed(data["learnings"]):
        if (entry.get("symbol") == symbol
                and entry.get("action") == "BUY"
                and entry.get("outcome") is None):
            entry["outcome"] = {
                "exit_price": exit_price,
                "entry_price": entry_price,
                "quantity": quantity,
                "pnl": pnl,
                "pnl_pct": pnl_pct,
                "result": "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN",
                "closed_at": datetime.now().isoformat(),
            }
            matched = True
            break

    if not matched:
        # log the sell as a standalone entry if no matching buy found
        data["learnings"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "decision",
            "symbol": symbol,
            "action": "SELL",
            "signals_snapshot": {"entry_price": entry_price, "exit_price": exit_price},
            "reasoning": "Standalone sell — no matching buy found",
            "confidence": 0.0,
            "outcome": {
                "exit_price": exit_price,
                "entry_price": entry_price,
                "quantity": quantity,
                "pnl": pnl,
                "pnl_pct": pnl_pct,
                "result": "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN",
                "closed_at": datetime.now().isoformat(),
            },
        })

    _save(data)
    return {"pnl": pnl, "pnl_pct": pnl_pct, "result": "WIN" if pnl > 0 else "LOSS" if pnl < 0 else "BREAKEVEN"}


def get_stats() -> dict:
    """Compute win rate, avg P&L, best/worst trades from closed decisions."""
    data = _load()
    closed = [e for e in data["learnings"] if e.get("outcome") is not None]
    if not closed:
        return {"message": "No closed trades yet"}

    wins = [e for e in closed if e["outcome"].get("result") == "WIN"]
    losses = [e for e in closed if e["outcome"].get("result") == "LOSS"]
    pnls = [e["outcome"]["pnl"] for e in closed]

    return {
        "total_closed": len(closed),
        "wins": len(wins),
        "losses": len(losses),
        "win_rate_pct": round(len(wins) / len(closed) * 100, 1),
        "total_pnl": round(sum(pnls), 2),
        "avg_pnl": round(sum(pnls) / len(pnls), 2),
        "best_trade": max(closed, key=lambda e: e["outcome"]["pnl"])["symbol"],
        "worst_trade": min(closed, key=lambda e: e["outcome"]["pnl"])["symbol"],
    }


def get_recent_learnings(n: int = 20) -> list:
    data = _load()
    return data["learnings"][-n:]
