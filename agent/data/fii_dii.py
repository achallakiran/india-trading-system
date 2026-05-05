"""
FII/DII flow fetcher from NSE public data.
No API key needed — NSE publishes this daily.
"""

import requests
from datetime import datetime, timedelta


def get_fii_dii_flows() -> dict:
    """
    Fetch latest FII and DII buy/sell data from NSE.
    Returns net flow and overall market signal.
    """
    try:
        url = "https://www.nseindia.com/api/fiidiiTradeReact"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Accept": "application/json",
            "Referer": "https://www.nseindia.com/",
        }

        session = requests.Session()
        # NSE requires a session cookie — get it first
        session.get("https://www.nseindia.com", headers=headers, timeout=10)
        resp = session.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if not data:
            return {"status": "unavailable"}

        latest = data[0] if isinstance(data, list) else data
        fii_net = float(str(latest.get("fii_net", 0)).replace(",", "") or 0)
        dii_net = float(str(latest.get("dii_net", 0)).replace(",", "") or 0)
        combined = fii_net + dii_net

        return {
            "status": "ok",
            "date": latest.get("date", ""),
            "fii_net": fii_net,
            "dii_net": dii_net,
            "combined_net": round(combined, 2),
            "signal": "BULLISH" if combined > 500 else "BEARISH" if combined < -500 else "NEUTRAL",
            "fii_signal": "BUYING" if fii_net > 0 else "SELLING" if fii_net < 0 else "NEUTRAL",
            "dii_signal": "BUYING" if dii_net > 0 else "SELLING" if dii_net < 0 else "NEUTRAL",
        }

    except Exception as e:
        return {"status": "unavailable", "error": str(e)}
