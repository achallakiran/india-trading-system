import json
import os
from datetime import datetime

PORTFOLIO_FILE = os.path.join(os.path.dirname(__file__), "../../data/portfolio.json")
TRADES_FILE = os.path.join(os.path.dirname(__file__), "../../data/trades.json")
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "../../data/config.json")

DEFAULT_CAPITAL = 100000.0


def get_config() -> dict:
    try:
        with open(CONFIG_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        config = {
            "initial_capital": DEFAULT_CAPITAL,
            "paper_mode": True,
            "created": datetime.now().isoformat(),
            "note": "Edit initial_capital here to change starting paper money"
        }
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return config


def get_initial_capital() -> float:
    return get_config().get("initial_capital", DEFAULT_CAPITAL)


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
    initial = get_initial_capital()
    return _load(PORTFOLIO_FILE, {
        "initial_capital": initial,
        "cash": initial,
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
    initial = portfolio.get("initial_capital", get_initial_capital())
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
        "initial_capital": initial,
        "cash": round(portfolio["cash"], 2),
        "positions_value": round(positions_value, 2),
        "total_value": round(total_value, 2),
        "total_pnl": round(total_value - initial, 2),
        "total_pnl_pct": round(((total_value - initial) / initial) * 100, 2),
        "positions": positions_detail,
    }
