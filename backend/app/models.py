from pydantic import BaseModel

class PlanningRequest(BaseModel):
    goal: str
    energy: str
    hours: int
    deadline: str

class ReflectionRequest(BaseModel):
    realistic: str
    satisfaction: int
    reflection: str
