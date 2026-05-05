import os
import growwapi


def get_client() -> growwapi.GrowwAPI:
    token = os.environ.get("GROWW_API_KEY")
    if not token:
        raise EnvironmentError(
            "GROWW_API_KEY not set. Generate a daily access token from "
            "https://groww.in/trade-api/api-keys and save it:\n"
            "  echo 'export GROWW_API_KEY=your_token' > ~/.zshenv"
        )
    return growwapi.GrowwAPI(token=token)
