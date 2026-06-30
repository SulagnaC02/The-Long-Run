import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
def generate_plan(goal: str, energy: str, hours: int, deadline: str) -> dict:
    # Initialize Gemini client
    # It will use GEMINI_API_KEY environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""
Goal: {goal}
Energy Level: {energy}
Available Hours Today: {hours}
Deadline: {deadline}

Instructions:
• Fit all tasks within the available hours.
• If the deadline is within the next 3 days, prioritize high-impact work.
• If energy is Low, reduce workload and include more breaks.
• If energy is High, schedule more focused deep work.
• Distribute tasks realistically.
• Include time blocks.
• Include future relief.
• Include reasoning.

Return ONLY valid JSON.

Return this exact schema:
{{
  "today_summary": "string",
  "today_plan": [
      {{
          "time": "string",
          "task": "string"
      }}
  ],
  "future_relief": "string",
  "reasoning": ["string"]
}}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        
        # Parse and return JSON
        return json.loads(response.text)
    except Exception as e:
        print(f"Error generating plan: {e}")
        # Standard fallback response matches the required schema
        return {
            "today_summary": f"Unable to fetch automatic plan for '{goal}'. Let's allocate {hours} hours toward your target.",
            "today_plan": [
                {
                    "time": "09:00 AM",
                    "task": f"Kickoff focus block for {goal}"
                },
                {
                    "time": "02:00 PM",
                    "task": f"Iterate on core tasks aiming at {deadline or 'your target'}"
                }
            ],
            "future_relief": "Executing on these initial steps sets up a lighter mental load for tomorrow.",
            "reasoning": [
                f"Generated fallback schedule (Error: {str(e)})",
                "Tasks mapped dynamically based on your available time budget."
            ]
        }

def analyze_reflection(realistic: str, satisfaction: int, reflection: str) -> dict:
    # Initialize Gemini client
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""
Analyze the user's daily reflection.

User's Input:
- Did today's plan feel realistic?: {realistic}
- Satisfaction with progress (1-5 scale): {satisfaction}
- What they would change / Reflection notes: {reflection}

Instructions:
• Analyze the user's reflection and inputs.
• Provide a brief summary of their reflection.
• Offer actionable suggestions for tomorrow's improvements.
• Rule: If satisfaction is <= 2 or the reflection sounds discouraged, return a supportive and encouraging message in the "encouragement" field. Otherwise, leave the "encouragement" field as an empty string ("").

Return ONLY valid JSON.

Return this exact schema:
{{
  "reflection_summary": "string",
  "tomorrow_improvement": "string",
  "encouragement": "string"
}}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing reflection: {e}")
        # Supportive fallbacks based on rules
        needs_encouragement = satisfaction <= 2 or any(word in reflection.lower() for word in ["sad", "hard", "tired", "discouraged", "failed", "bad", "slow", "stuck"])
        return {
            "reflection_summary": "We have noted your reflection on today's progress and schedule realism.",
            "tomorrow_improvement": "For tomorrow, try breaking your main goal into ultra-focused 30-minute intervals and starting with your highest priority task first.",
            "encouragement": "It's completely normal to have off days or feel discouraged. What matters is that you reflected and are ready to adjust tomorrow. Keep going!" if needs_encouragement else ""
        }
