from pydantic import BaseModel

class PlanningRequest(BaseModel):
    goal: str
    energy: str
    hours: int
    deadline: str