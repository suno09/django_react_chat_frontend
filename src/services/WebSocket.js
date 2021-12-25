class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
    this.username1 = '';
    this.username2 = '';
  }

  connect(currentUser, friendUser) {
    if (currentUser.localeCompare(friendUser) !== 1) {
      [this.username1, this.username2] = [currentUser, friendUser]
    } else {
      [this.username1, this.username2] = [friendUser, currentUser]
    }

    const path = 'ws://localhost:8000/ws/chat_' + this.username1 + '_' + this.username2;
    this.socketRef = new WebSocket(path);
    this.socketRef.onopen = () => {
      console.log('WebSocket open');
    };
    this.socketRef.onmessage = e => {
      this.socketNewMessage(e.data);
    };

    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    this.socketRef.onclose = () => {
      console.log("WebSocket closed");
      // this.connect();
    };
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const command = parsedData.command;
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    if (command === 'messages') {
      this.callbacks[command](parsedData.messages);
    }
    if (command === 'new_message') {
      this.callbacks[command](parsedData.message);
    }
  }

  initChatUser() {
    this.sendMessage({ command: 'init_chat', username1: this.username1, username2: this.username2 });
  }

  fetchMessages() {
    this.sendMessage({ command: 'fetch_messages', username1: this.username1, username2: this.username2 });
  }

  newChatMessage(message) {
    this.sendMessage({ command: 'new_message', from: message.from, text: message.text, username1: this.username1, username2: this.username2 });
  }

  addCallbacks(messagesCallback, newMessageCallback) {
    this.callbacks['messages'] = messagesCallback;
    this.callbacks['new_message'] = newMessageCallback;
  }
  
  sendMessage(data) {
    try {
      this.socketRef.send(JSON.stringify({ ...data }));
    }
    catch(err) {
      console.log(err.message);
    }  
  }

  state() {
    return this.socketRef.readyState;
  }

   waitForSocketConnection(callback){
    const socket = this.socketRef;
    const recursion = this.waitForSocketConnection;
    setTimeout(
      function () {
        if (socket.readyState === 1) {
          console.log("Connection is made")
          if(callback != null){
            callback();
          }
          return;

        } else {
          console.log("wait for connection...")
          recursion(callback);
        }
      }, 1); // wait 5 milisecond for the connection...
  }

}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;
