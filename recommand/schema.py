from pydantic import BaseModel
from typing import List

class RecommendRequest(BaseModel):
    userMessage: str

class RecommendResponse(BaseModel):
    recommendations: List[str]
