import datetime
from agent.auth import get_client

_instrument_cache = {}


def get_instrument(symbol: str, exchange: str = "NSE") -> dict:
    key = f"{exchange}:{symbol}"
    if key not in _instrument_cache:
        api = get_client()
        _instrument_cache[key] = api.get_instrument_by_exchange_and_trading_symbol(
            exchange=exchange, trading_symbol=symbol
        )
    return _instrument_cache[key]


def get_groww_symbol(symbol: str, exchange: str = "NSE") -> str:
    return get_instrument(symbol, exchange).get("groww_symbol", f"{exchange}-{symbol}")


def get_quote(symbol: str, exchange: str = "NSE", segment: str = "CASH") -> dict:
    api = get_client()
    return api.get_quote(trading_symbol=symbol, exchange=exchange, segment=segment)


def get_ltp(symbol: str, exchange: str = "NSE") -> float:
    api = get_client()
    result = api.get_ltp(
        exchange_trading_symbols=(f"{exchange}_{symbol}",),
        segment="CASH",
    )
    key = f"{exchange}_{symbol}"
    return result.get(key, {}).get("ltp", 0.0)


def get_historical(symbol: str, exchange: str = "NSE", days: int = 90) -> list:
    import warnings
    api = get_client()
    end = datetime.datetime.now()
    start = end - datetime.timedelta(days=days)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        result = api.get_historical_candle_data(
            trading_symbol=symbol,
            exchange=exchange,
            segment="CASH",
            start_time=start.strftime("%Y-%m-%d %H:%M:%S"),
            end_time=end.strftime("%Y-%m-%d %H:%M:%S"),
        )
    return result.get("candles", [])


def get_portfolio() -> dict:
    api = get_client()
    return api.get_holdings_for_user()


def get_positions() -> dict:
    api = get_client()
    return api.get_positions_for_user()
