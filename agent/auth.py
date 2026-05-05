import os
import time
import requests

_token_cache = {"token": None, "expires_at": 0}


def get_access_token() -> str:
    if _token_cache["token"] and time.time() < _token_cache["expires_at"]:
        return _token_cache["token"]

    api_key = os.environ.get("GROWW_API_KEY")
    api_secret = os.environ.get("GROWW_API_SECRET")

    if not api_key or not api_secret:
        raise EnvironmentError("GROWW_API_KEY and GROWW_API_SECRET must be set in environment")

    resp = requests.post(
        "https://api.groww.in/v1/token/api/access",
        json={"api_key": api_key, "api_secret": api_secret},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = time.time() + 23 * 3600  # tokens expire daily
    return _token_cache["token"]
