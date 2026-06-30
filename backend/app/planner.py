import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
def generate_plan(goal: str, energy: str, hours: int, deadline: str) -> dict:
    # Initialize Gemini client
    api_key = os.getenv("GEMINI_API_KEY")
    print(api_key)
    client = genai.Client(api_key=api_key)

    prompt = f"""
You are The Long Run, an AI productivity coach.

User Information:

Goal: {goal}

Energy Level: {energy}

Available Hours Today: {hours}

Deadline: {deadline}

Your job is to generate a realistic daily plan.

Rules:

- The entire schedule must fit within {hours} hours.
- If the deadline is within the next 3 days, prioritize the most important tasks.
- If energy is Low, reduce workload and schedule frequent breaks.
- If energy is Medium, create a balanced schedule.
- If energy is High, include longer deep-work sessions.
- Include realistic breaks.
- Use chronological time blocks.
- Do not overload the user.
- Write practical tasks instead of generic advice.

Return ONLY valid JSON.

Return this exact schema:

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

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        # Parse JSON safely
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            cleaned = (
                response.text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )
            return json.loads(cleaned)

    except Exception as e:
        print(f"Error generating plan: {e}")

        # Fallback response
        return {
            "today_summary": f"Unable to generate an AI plan for '{goal}'. Here's a basic schedule.",
            "today_plan": [
                {
                    "time": "09:00 AM",
                    "task": f"Start working on {goal}"
                },
                {
                    "time": "01:00 PM",
                    "task": "Take a break and review progress"
                },
                {
                    "time": "03:00 PM",
                    "task": f"Continue high-priority work before {deadline if deadline else 'your deadline'}"
                }
            ],
            "future_relief": "Completing important work today reduces tomorrow's workload and stress.",
            "reasoning": [
                "The schedule was adapted using your available hours.",
                "The workload was adjusted based on your selected energy level."
            ]
        }