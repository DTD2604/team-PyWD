const axios = require('axios');
const { token, bot_id } = require('./config/config')
const ChatHistory = require('./backend/model/chat_history')

// Coze API URL
const url = 'https://api.coze.com/open_api/v2/chat';

// Create ChatHistory object
const chatHistory = new ChatHistory();

async function sendMessage(conversation_id, user, list_query) {
  const query = list_query.map(x => `"${x}"`).join(',');
  console.log(`Gửi tin nhắn: conversation_id=${conversation_id}, user=${user}, query=${query}`);

  // Add new message to chat history
  chatHistory.addMessage(user, query);

  // Request data with chat_history
  const data = {
    conversation_id: conversation_id,
    bot_id: bot_id,
    user: user,
    query: `Dựa vào ngữ cảnh cả đoạn hội thoại, hãy tạo ra tối thiểu 4 câu văn gợi ý hoàn chỉnh và có ý nghĩa được tạo thành từ các từ sau (mỗi câu văn gợi ý ngăn cách bằng dấu ".", hạn chế có cảm xúc tiêu cực trong câu): ${query}`,
    stream: false,
    chat_history: chatHistory.getHistory()
  };

  // Headers including token
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Host': 'api.coze.com',
    'Connection': 'keep-alive'
  };

  // Send POST request to Coze API and receive response object
  try {
    const response = await axios.post(url, data, { headers });

    // Log response from API
    console.log(`Phản hồi từ API: ${response.status} ${response.data}`);

    // Check content type of response
    const contentType = response.headers['content-type'];

    if (contentType.includes('application/json')) {
      const responseParams = {
        messages: [],
        conversation_id: ''
      };

      // Extract and process data from 'messages' field
      const messages = response.data.messages || [];

      for (const message of messages) {
        if (message.type !== 'verbose') {
          responseParams.messages.push(message);
        }
      }
      responseParams.conversation_id = conversation_id;

      // Add bot response to chat history
      for (const msg of responseParams.messages) {
        chatHistory.addMessage('bot', msg.content);
      }

      return {
        response: 'response',
        response_params: responseParams
      };
    }
    else if (contentType.includes('text/event-stream')) {
      const responseParams = {
        role: '',
        content: '',
        conversation_id: '',
        seq_id: ''
      };

      response.data.on('data', chunk => {
        const line = chunk.toString('utf-8').trim();
        if (line.startsWith('data:')) {
          const eventData = JSON.parse(line.slice(5));
          console.log(`Parsed JSON event data: ${JSON.stringify(eventData)}`);

          if (!eventData.is_finish) {
            if (eventData.message && eventData.message.role) {
              responseParams.role = eventData.message.role;
            }
            if (eventData.message && eventData.message.content) {
              responseParams.content += eventData.message.content;
            }
            if (eventData.conversation_id) {
              responseParams.conversation_id = eventData.conversation_id;
            }
            if (eventData.seq_id) {
              responseParams.seq_id = eventData.seq_id;
            }
          }
        }
      });

      // Add response to chat history
      chatHistory.addMessage('bot', responseParams.content);

      return {
        response: 'response',
        response_params: responseParams
      };
    }
    else {
      console.error(`Phản hồi không phải là JSON hay text/event-stream: ${contentType}`);
      return {
        response: '',
        response_params: []
      };
    }
  } catch (error) {
    console.error(`Yêu cầu tới API Coze thất bại: ${error.message}`);
    throw error;
  }
}

module.exports = { sendMessage };

// vi du cach sử dụng và param truyền vào phương thức
// sendMessage('123456', 'user1', ['hôm nay', 'tôi', 'game', 'trường', 'buổi chiều'])
//   .then(response => console.log(response))
//   .catch(error => console.error(error));