class ChatHistory {
  constructor() {
    this.history = [];
  }

  addMessage(role, content) {
    this.history.push({ role: role, content: content });
  }

  getHistory() {
    return this.history;
  }
}

module.exports = ChatHistory;