import os
import json
import anthropic
from agent.learning.tracker import get_recent_learnings

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are an expert Indian stock market trading agent.
You analyze real-time market data, technical signals, and contextual factors to make trading decisions.

Your decisions must be grounded in:
- Technical analysis (RSI, MACD, Bollinger Bands, EMAs)
- Market context and current conditions
- Past decisions and their outcomes (provided in context)
- Risk management (never risk more than 5% of portfolio on a single trade)

Always respond in valid JSON with this exact structure:
{
  "action": "BUY" | "SELL" | "HOLD",
  "symbol": "<symbol>",
  "quantity": <integer or null if HOLD>,
  "confidence": <float 0.0-1.0>,
  "reasoning": "<concise explanation>",
  "risk_note": "<any risk flags>"
}"""


def decide(symbol: str, quote: dict, signals: dict, portfolio_summary: dict) -> dict:
    recent = get_recent_learnings(10)
    past_context = json.dumps(recent, indent=2) if recent else "No prior decisions yet."

    user_message = f"""
Analyze and decide for: {symbol}

LIVE QUOTE:
{json.dumps(quote, indent=2)}

TECHNICAL SIGNALS:
{json.dumps(signals, indent=2)}

CURRENT PORTFOLIO:
{json.dumps(portfolio_summary, indent=2)}

RECENT DECISIONS & OUTCOMES:
{past_context}

Make a trading decision. Be decisive but prudent.
"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    text = response.content[0].text.strip()
    # extract JSON from response
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])
