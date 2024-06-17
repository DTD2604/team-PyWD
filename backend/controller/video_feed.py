from fastapi import APIRouter, WebSocket
from fastapi.responses import HTMLResponse
import cv2
import mediapipe as mp

video_feed_router = APIRouter()

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

camera = cv2.VideoCapture(0)


@video_feed_router.websocket("/video_feed")
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

html = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
    <div>
    <h1>Camera Feed</h1>
    <img id="videoElement" title="camera" style="width:100%;"/>
  </div>
  <script>
  export default {
    mounted: function () {
      this.fetchVideoFeed();
    },
    methods: {
      fetchVideoFeed() {
          const videoElement = document.getElementById('videoElement');
          const ws = new WebSocket('ws://localhost:8000/ws');
          ws.binaryType = 'arraybuffer';  // Ensure binary data is handled correctly
          ws.onmessage = (event) => {
              const blob = new Blob([event.data], {type: 'image/jpeg'});
              const url = URL.createObjectURL(blob);
              videoElement.src = url;
              URL.revokeObjectURL(url);  // Clean up the object URL
          };
      }
    },
  };
  </script>
</body>
</html>
"""


@video_feed_router.get("/")
async def get():
    return HTMLResponse(html)

