from fastapi import FastAPI
from pydantic import BaseModel
from app.planner import generate_plan

app = FastAPI(
    title="The Long Run API",
    version="1.0.0"
)

class PlanningRequest(BaseModel):
    goal: str
    energy: str

@app.get("/")
def home():
    return {
        "message": "The Long Run Backend Running 🚀"
    }

@app.post("/generate-plan")
def generate_day_plan(request: PlanningRequest):

    plan = generate_plan(
        request.goal,
        request.energy
    )

    return plan