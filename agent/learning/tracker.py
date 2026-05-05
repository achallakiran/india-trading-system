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
        "outcome": None,  # filled in later
    })
    _save(data)


def record_outcome(symbol: str, entry_price: float, exit_price: float, pnl: float):
    data = _load()
    # find the most recent open decision for this symbol
    for entry in reversed(data["learnings"]):
        if entry.get("symbol") == symbol and entry.get("outcome") is None:
            entry["outcome"] = {
                "entry_price": entry_price,
                "exit_price": exit_price,
                "pnl": pnl,
                "recorded_at": datetime.now().isoformat(),
            }
            break
    _save(data)


def get_recent_learnings(n: int = 20) -> list:
    data = _load()
    return data["learnings"][-n:]
