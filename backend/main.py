from fastapi import FastAPI
from controller.gen_text import gen_text_route
from controller.video_feed import video_feed_router as websocket_router

app = FastAPI()

app.include_router(gen_text_route)
app.include_router(websocket_router)
