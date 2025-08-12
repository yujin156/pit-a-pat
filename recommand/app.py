
from fastapi import FastAPI
from schema import RecommendRequest, RecommendResponse
from model import recommend
from utils import filter_recommendations

app = FastAPI()

@app.post("/recommend", response_model=RecommendResponse)
def recommend_route(request: RecommendRequest):
    raw = recommend(request.userMessage)
    cleaned = filter_recommendations(raw)
    return RecommendResponse(recommendations=cleaned)