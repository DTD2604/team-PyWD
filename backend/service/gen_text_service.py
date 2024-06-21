import os
import requests
import json
import logging
from dotenv import load_dotenv
from backend.model.chat_history import ChatHistory

chat_history = ChatHistory()

# Cấu hình logging
logging.basicConfig(level=logging.INFO)

# Tải biến môi trường từ tệp token.env
load_dotenv(dotenv_path='token.env')

# Đọc token và bot_id từ biến môi trường
token = os.getenv('COZE_TOKEN')
bot_id = os.getenv('COZE_BOT_ID')

# Kiểm tra token và bot_id đã được nạp đúng chưa
if not token or not bot_id:
    logging.error("Token hoặc Bot ID không được nạp đúng cách")

# URL API của Coze
url = 'https://api.coze.com/open_api/v2/chat'

# Tạo đối tượng ChatHistory
chat_history = ChatHistory()


def send_message(conversation_id, user, query):
    logging.info(f"Gửi tin nhắn: conversation_id={conversation_id}, user={user}, query={query}")

    # Thêm tin nhắn mới vào lịch sử
    chat_history.add_message(user, query)

    # Dữ liệu yêu cầu với chat_history
    data = {
        "conversation_id": conversation_id,
        "bot_id": bot_id,
        "user": user,
        "query": query,
        "stream": True,
        "chat_history": chat_history.get_history()
    }

    # Headers bao gồm token
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Host': 'api.coze.com',
        'Connection': 'keep-alive'
    }

    # Gửi yêu cầu POST tới Coze API và nhận đối tượng response
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        # Kiểm tra mã trạng thái của phản hồi
        response.raise_for_status()

        # Ghi lại thông tin phản hồi từ API
        logging.info(f"Phản hồi từ API: {response.status_code} {response.text}")

        # Kiểm tra loại nội dung của phản hồi
        content_type = response.headers.get('Content-Type', '')

        if 'application/json' in content_type:
            # Phản hồi là JSON, chuyển đổi nội dung phản hồi thành JSON
            try:
                response_json = response.json()
                logging.info(f"Phản hồi JSON từ API: {response_json}")

                # Thêm phản hồi bot vào lịch sử
                bot_response = response_json.get("response", "No response")
                chat_history.add_message("bot", bot_response)

                # Xử lý các tham số phản hồi khác
                response_params = response_json.get("response_params", {})
                return {
                    "response": bot_response,
                    "response_params": response_params
                }
            except json.JSONDecodeError:
                logging.error("Phản hồi không phải là JSON hợp lệ")
                return {
                    "response": "No response",
                    "response_params": {}
                }
        elif 'text/event-stream' in content_type:
            # Phản hồi là text/event-stream, xử lý sự kiện
            response_params = {
                'role': '',
                'content': '',
                'conversation_id': '',
                'seq_id': ''
            }

            for line in response.iter_lines():
                if line:
                    # Giải mã dòng từ byte thành chuỗi UTF-8 để hỗ trợ tiếng Việt
                    decoded_line = line.decode('utf-8')
                    logging.info(f"Received line: {decoded_line}")

                    if decoded_line.startswith('data:'):
                        # Lấy phần sau 'data:' và chuyển đổi thành JSON
                        try:
                            event_data = json.loads(decoded_line[len('data:'):])
                            logging.info(f"Parsed JSON event data: {event_data}")

                            # Kiểm tra điều kiện dừng
                            if not event_data.get('is_finish', ''):

                                # Ghép nội dung phản hồi
                                if 'message' in event_data and 'role' in event_data['message']:
                                    response_params['role'] = event_data['message']['role']

                                if 'message' in event_data and 'content' in event_data['message']:
                                    response_params['content'] += event_data['message']['content']

                                if 'conversation_id' in event_data:
                                    response_params['conversation_id'] = event_data['conversation_id']

                                if 'seq_id' in event_data:
                                    response_params['seq_id'] = event_data['seq_id']

                        except json.JSONDecodeError:
                            logging.error("Lỗi khi giải mã dữ liệu JSON từ event-stream")

            # Thêm phản hồi vào lịch sử trò chuyện
            chat_history.add_message("bot", response_params['content'])

            return {
                "response": 'response',
                "response_params": response_params
            }
        else:
            # Phản hồi không phải là JSON hay text/event-stream, xử lý phản hồi khác
            logging.error(f"Phản hồi không phải là JSON hay text/event-stream: {content_type}")
            return {
                "response": "",
                "response_params": []
            }
    except requests.exceptions.RequestException as e:
        logging.error(f"Yêu cầu tới API Coze thất bại: {str(e)}")
        raise
