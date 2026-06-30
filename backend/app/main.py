from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import PlanningRequest, ReflectionRequest
from app.planner import generate_plan, analyze_reflection

app = FastAPI(
    title="The Long Run Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "The Long Run Backend Running 🚀"
    }


@app.post("/generate-plan")
def get_plan(request: PlanningRequest):
    return generate_plan(
        request.goal,
        request.energy,
        request.hours,
        request.deadline
    )


@app.post("/analyze-reflection")
def post_analyze_reflection(request: ReflectionRequest):
    return analyze_reflection(
        request.realistic,
        request.satisfaction,
        request.reflection
    )