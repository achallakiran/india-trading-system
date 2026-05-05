import requests
from agent.auth import get_access_token


def _headers():
    return {"Authorization": f"Bearer {get_access_token()}"}


def get_quote(symbol: str, exchange: str = "NSE") -> dict:
    """Fetch live quote for a symbol."""
    resp = requests.get(
        f"https://api.groww.in/v1/market/quote",
        params={"symbol": symbol, "exchange": exchange},
        headers=_headers(),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def get_historical(symbol: str, exchange: str = "NSE", interval: str = "1d", days: int = 90) -> list:
    """Fetch OHLCV historical data."""
    resp = requests.get(
        f"https://api.groww.in/v1/market/historical",
        params={"symbol": symbol, "exchange": exchange, "interval": interval, "days": days},
        headers=_headers(),
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("candles", [])


def get_portfolio() -> dict:
    """Fetch current holdings from Groww account."""
    resp = requests.get(
        "https://api.groww.in/v1/portfolio/holdings",
        headers=_headers(),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def search_symbol(query: str) -> list:
    """Search for a stock symbol."""
    resp = requests.get(
        "https://api.groww.in/v1/market/search",
        params={"query": query},
        headers=_headers(),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("results", [])
