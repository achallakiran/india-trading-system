import json
import os
from datetime import datetime

PORTFOLIO_FILE = os.path.join(os.path.dirname(__file__), "../../data/portfolio.json")
TRADES_FILE = os.path.join(os.path.dirname(__file__), "../../data/trades.json")

INITIAL_CAPITAL = 100000.0


def _load(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def _save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def get_portfolio():
    return _load(PORTFOLIO_FILE, {
        "cash": INITIAL_CAPITAL,
        "positions": {},
        "created": datetime.now().isoformat(),
    })


def buy(symbol: str, price: float, quantity: int, reason: str = "") -> dict:
    portfolio = get_portfolio()
    cost = price * quantity
    if cost > portfolio["cash"]:
        return {"status": "rejected", "reason": "Insufficient paper cash"}

    portfolio["cash"] -= cost
    pos = portfolio["positions"].get(symbol, {"quantity": 0, "avg_price": 0})
    total_qty = pos["quantity"] + quantity
    avg_price = ((pos["quantity"] * pos["avg_price"]) + cost) / total_qty
    portfolio["positions"][symbol] = {"quantity": total_qty, "avg_price": round(avg_price, 2)}
    _save(PORTFOLIO_FILE, portfolio)

    trade = {
        "timestamp": datetime.now().isoformat(),
        "symbol": symbol,
        "action": "BUY",
        "price": price,
        "quantity": quantity,
        "value": cost,
        "reason": reason,
    }
    trades = _load(TRADES_FILE, [])
    trades.append(trade)
    _save(TRADES_FILE, trades)
    return {"status": "executed", "trade": trade}


def sell(symbol: str, price: float, quantity: int, reason: str = "") -> dict:
    portfolio = get_portfolio()
    pos = portfolio["positions"].get(symbol)
    if not pos or pos["quantity"] < quantity:
        return {"status": "rejected", "reason": f"Insufficient position in {symbol}"}

    proceeds = price * quantity
    portfolio["cash"] += proceeds
    pos["quantity"] -= quantity
    if pos["quantity"] == 0:
        del portfolio["positions"][symbol]
    else:
        portfolio["positions"][symbol] = pos
    _save(PORTFOLIO_FILE, portfolio)

    trade = {
        "timestamp": datetime.now().isoformat(),
        "symbol": symbol,
        "action": "SELL",
        "price": price,
        "quantity": quantity,
        "value": proceeds,
        "pnl": round((price - pos["avg_price"]) * quantity, 2),
        "reason": reason,
    }
    trades = _load(TRADES_FILE, [])
    trades.append(trade)
    _save(TRADES_FILE, trades)
    return {"status": "executed", "trade": trade}


def get_summary(current_prices: dict = None) -> dict:
    portfolio = get_portfolio()
    positions_value = 0
    positions_detail = []
    for sym, pos in portfolio["positions"].items():
        cp = current_prices.get(sym, pos["avg_price"]) if current_prices else pos["avg_price"]
        market_value = cp * pos["quantity"]
        pnl = (cp - pos["avg_price"]) * pos["quantity"]
        positions_value += market_value
        positions_detail.append({
            "symbol": sym,
            "quantity": pos["quantity"],
            "avg_price": pos["avg_price"],
            "current_price": cp,
            "market_value": round(market_value, 2),
            "pnl": round(pnl, 2),
        })
    total_value = portfolio["cash"] + positions_value
    return {
        "cash": round(portfolio["cash"], 2),
        "positions_value": round(positions_value, 2),
        "total_value": round(total_value, 2),
        "total_pnl": round(total_value - INITIAL_CAPITAL, 2),
        "positions": positions_detail,
    }
