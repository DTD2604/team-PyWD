import cv2
import mediapipe as mp

# Cấu hình Mediapipe Hands
mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

# Khởi tạo model Mediapipe Hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,  # Xử lý tối đa 2 bàn tay
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5)

# Mở camera
cap = cv2.VideoCapture(0)
   
while cap.isOpened():
    success, image = cap.read()
    if not success:
        print("Không thể đọc frame từ camera")
        break

    # Chuyển đổi màu từ BGR sang RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Dò tìm các điểm landmarks của bàn tay trong ảnh
    results = hands.process(image_rgb)

    # Lưu trữ tọa độ của các bàn tay
    hand_landmarks_list = []
    Textoutput = ''
    # Vẽ và lấy tọa độ của từng bàn tay
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Lấy tọa độ của các landmarks của từng bàn tay
            landmarks = []
            for idx, landmark in enumerate(hand_landmarks.landmark):
                h, w, c = image.shape
                cx, cy = int(landmark.x * w), int(landmark.y * h)
                landmarks.append((cx, cy))
                
                # Vẽ các landmarks của từng bàn tay
                mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                # Vẽ tên landmark
                cv2.putText(image, f"{idx}", (cx, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

            # Lưu trữ tọa độ của các bàn tay
            hand_landmarks_list.append(landmarks)

    # Nhận diện và hiển thị chữ "Xin chào"
    if len(hand_landmarks_list) >= 2:  # Đảm bảo có ít nhất 2 bàn tay được nhận diện
        # Lấy tọa độ của các ngón tay từ hai bàn tay
        # Bàn tay trái
        left_hand_landmarks = hand_landmarks_list[0]
        index_finger_left = left_hand_landmarks[8]  # Ngón tay trỏ của bàn tay trái
        middle_finger_left = left_hand_landmarks[12]  # Ngón tay giữa của bàn tay trái
        
        # Bàn tay phải
        right_hand_landmarks = hand_landmarks_list[1]
        index_finger_right = right_hand_landmarks[8]  # Ngón tay trỏ của bàn tay phải
        middle_finger_right = right_hand_landmarks[12]  # Ngón tay út của bàn tay phải
        
        # So sánh vị trí của các ngón tay để nhận diện chữ "Xin chào"
        if ( index_finger_left[1] < middle_finger_left[1] and
            index_finger_right[1] < middle_finger_right[1] and
            abs(index_finger_left[0] - index_finger_right[0]) < 50 ):  # Kiểm tra khoảng cách ngang giữa hai ngón tay trỏ
            Textoutput = 'xinchao'
            
    cv2.putText(image, str(Textoutput), (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3, cv2.LINE_AA)
    # Hiển thị ảnh với các landmarks và chữ cái nhận diện được
    cv2.imshow('Hand Tracking', image)

    # Thoát khỏi chương trình khi nhấn phím Esc
    if cv2.waitKey(5) & 0xFF == 27:
        break

# Giải phóng tài nguyên
cap.release()
cv2.destroyAllWindows()
