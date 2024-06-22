from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from backend.service.gen_text_service import send_message

gen_text_route = APIRouter()


# Mô hình dữ liệu yêu cầu
class QueryRequest(BaseModel):
    conversation_id: str
    user: str
    query: str


@gen_text_route.post("/chat")
def chat(request: QueryRequest):
    try:
        response = send_message(request.conversation_id, request.user, request.query)
        return response
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
