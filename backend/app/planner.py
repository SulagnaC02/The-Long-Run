from google import genai
from app.config import GEMINI_API_KEY
import json

client = genai.Client(api_key=GEMINI_API_KEY)

def generate_plan(goal: str, energy: str):
    prompt = f"""
You are an AI productivity coach.

Goal: {goal}
Energy: {energy}

Create a realistic plan for today.

Return ONLY valid JSON with this format:

{{
  "today_summary": "...",
  "today_plan": [
    {{
      "time": "...",
      "task": "..."
    }}
  ],
  "future_relief": "...",
  "reasoning": [
    "...",
    "..."
  ]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)
    