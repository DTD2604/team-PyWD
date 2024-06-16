from fastapi import FastAPI, WebSocket
from controller.gen_text import gen_text_router
from controller.video_feed import video_feed_router as websocket_router
import cv2
import mediapipe as mp

app = FastAPI()

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

camera = cv2.VideoCapture(0)

app.include_router(gen_text_router)
app.include_router(websocket_router)


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        while True:
            success, frame = camera.read()
            if not success:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_detection.process(frame)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            if results.detections:
                for detection in results.detections:
                    mp_drawing.draw_detection(frame, detection)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            await websocket.send_bytes(frame)



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
