// config/config.js
const dotenv = require('dotenv');

// Load environment variables from token.env
dotenv.config({ path: 'token.env' });

const token = process.env.COZE_TOKEN;
const bot_id = process.env.COZE_BOT_ID;

if (!token || !bot_id) {
  console.error('Token hoặc Bot ID không được nạp đúng cách');
  process.exit(1);
}

module.exports = { token, bot_id };