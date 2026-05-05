import pandas as pd
import ta


def compute_signals(candles: list) -> dict:
    """
    Compute technical indicators from OHLCV candle data.
    candles: list of [timestamp, open, high, low, close, volume]
    """
    if len(candles) < 30:
        return {"error": "Insufficient data for signal computation"}

    df = pd.DataFrame(candles, columns=["timestamp", "open", "high", "low", "close", "volume"])
    df = df.astype({"open": float, "high": float, "low": float, "close": float, "volume": float})

    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]

    return {
        "rsi_14": round(ta.momentum.RSIIndicator(close, window=14).rsi().iloc[-1], 2),
        "macd": round(ta.trend.MACD(close).macd().iloc[-1], 2),
        "macd_signal": round(ta.trend.MACD(close).macd_signal().iloc[-1], 2),
        "macd_diff": round(ta.trend.MACD(close).macd_diff().iloc[-1], 2),
        "ema_20": round(ta.trend.EMAIndicator(close, window=20).ema_indicator().iloc[-1], 2),
        "ema_50": round(ta.trend.EMAIndicator(close, window=50).ema_indicator().iloc[-1], 2),
        "ema_200": round(ta.trend.EMAIndicator(close, window=200).ema_indicator().iloc[-1] if len(candles) >= 200 else None, 2) if len(candles) >= 200 else None,
        "bb_upper": round(ta.volatility.BollingerBands(close).bollinger_hband().iloc[-1], 2),
        "bb_lower": round(ta.volatility.BollingerBands(close).bollinger_lband().iloc[-1], 2),
        "bb_mid": round(ta.volatility.BollingerBands(close).bollinger_mavg().iloc[-1], 2),
        "atr": round(ta.volatility.AverageTrueRange(high, low, close).average_true_range().iloc[-1], 2),
        "volume_sma_20": round(volume.rolling(20).mean().iloc[-1], 0),
        "current_close": round(close.iloc[-1], 2),
        "prev_close": round(close.iloc[-2], 2),
        "price_change_pct": round(((close.iloc[-1] - close.iloc[-2]) / close.iloc[-2]) * 100, 2),
    }
