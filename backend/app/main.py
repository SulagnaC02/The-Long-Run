from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.planner import generate_plan

app = FastAPI(
    title="The Long Run API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlanningRequest(BaseModel):
    goal: str
    energy: str
    hours: int
    deadline: str

@app.get("/")
def home():
    return {
        "message": "The Long Run Backend Running 🚀"
    }

@app.post("/generate-plan")
def generate_day_plan(request: PlanningRequest):
    return generate_plan(
        request.goal,
        request.energy,
        request.hours,
        request.deadline
    )