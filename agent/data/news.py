"""
News sentiment fetcher using free RSS feeds — no API key needed.
Sources: Economic Times, Moneycontrol, NSE announcements.
"""

import re
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta


RSS_FEEDS = {
    "economic_times": "https://economictimes.indiatimes.com/markets/stocks/rss.cms",
    "moneycontrol": "https://www.moneycontrol.com/rss/latestnews.xml",
    "business_standard": "https://www.business-standard.com/rss/markets-106.rss",
}

POSITIVE_WORDS = [
    "surge", "rally", "gain", "rise", "jump", "soar", "profit", "growth",
    "beat", "record", "outperform", "upgrade", "buy", "bullish", "strong",
    "expand", "win", "positive", "boost", "recovery", "high",
]

NEGATIVE_WORDS = [
    "fall", "drop", "decline", "loss", "crash", "plunge", "weak", "miss",
    "downgrade", "sell", "bearish", "cut", "warn", "risk", "low", "concern",
    "slowdown", "disappoint", "slump", "below",
]


def _score_headline(text: str) -> int:
    text_lower = text.lower()
    score = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    score -= sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    return score


def _fetch_rss(url: str, timeout: int = 8) -> list[dict]:
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        items = []
        for item in root.iter("item"):
            title = item.findtext("title", "").strip()
            pub_date = item.findtext("pubDate", "").strip()
            if title:
                items.append({"title": title, "pub_date": pub_date})
        return items
    except Exception:
        return []


def get_market_sentiment() -> dict:
    """Fetch headlines from all sources and compute overall market sentiment."""
    all_headlines = []
    for source, url in RSS_FEEDS.items():
        items = _fetch_rss(url)
        for item in items[:10]:  # top 10 from each source
            item["source"] = source
            item["score"] = _score_headline(item["title"])
            all_headlines.append(item)

    if not all_headlines:
        return {"status": "unavailable", "sentiment": "NEUTRAL", "score": 0, "headlines": []}

    total_score = sum(h["score"] for h in all_headlines)
    sentiment = "BULLISH" if total_score > 3 else "BEARISH" if total_score < -3 else "NEUTRAL"

    top_positive = sorted(all_headlines, key=lambda x: x["score"], reverse=True)[:3]
    top_negative = sorted(all_headlines, key=lambda x: x["score"])[:3]

    return {
        "status": "ok",
        "sentiment": sentiment,
        "score": total_score,
        "total_headlines": len(all_headlines),
        "top_positive": [h["title"] for h in top_positive if h["score"] > 0],
        "top_negative": [h["title"] for h in top_negative if h["score"] < 0],
    }


def get_stock_news(symbol: str) -> dict:
    """Search headlines mentioning a specific stock symbol or company."""
    all_headlines = []
    for source, url in RSS_FEEDS.items():
        items = _fetch_rss(url)
        for item in items:
            if symbol.upper() in item["title"].upper():
                item["source"] = source
                item["score"] = _score_headline(item["title"])
                all_headlines.append(item)

    if not all_headlines:
        return {"symbol": symbol, "mentions": 0, "sentiment": "NO NEWS", "headlines": []}

    avg_score = sum(h["score"] for h in all_headlines) / len(all_headlines)
    sentiment = "POSITIVE" if avg_score > 0 else "NEGATIVE" if avg_score < 0 else "NEUTRAL"

    return {
        "symbol": symbol,
        "mentions": len(all_headlines),
        "sentiment": sentiment,
        "avg_score": round(avg_score, 2),
        "headlines": [h["title"] for h in all_headlines[:5]],
    }
