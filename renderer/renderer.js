// 簡單的 renderer 腳本：連到 WebSocket server、處理 UI 與接收廣播
(function () {
  const WS_URL = 'ws://localhost:8080'; // 生產要改成 wss://
  let ws;
  const messagesEl = document.getElementById('messages');
  const userListEl = document.getElementById('userList');
  const sendForm = document.getElementById('sendForm');
  const nicknameInput = document.getElementById('nickname');
  const messageInput = document.getElementById('message');

  function appendMessage({ from, text, time }) {
    const el = document.createElement('div');
    el.className = 'message';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${from} • ${new Date(time).toLocaleTimeString()}`;
    const content = document.createElement('div');
    content.textContent = text;
    el.appendChild(meta);
    el.appendChild(content);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateUsers(list) {
    userListEl.innerHTML = '';
    list.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u;
      userListEl.appendChild(li);
    });
  }

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.addEventListener('open', () => {
      console.log('已連線到 WebSocket');
      // 若有暱稱，自動註冊
      if (nicknameInput.value) {
        ws.send(JSON.stringify({ type: 'hello', nickname: nicknameInput.value }));
      }
    });

    ws.addEventListener('message', (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload.type === 'message') {
          appendMessage(payload);
        } else if (payload.type === 'users') {
          updateUsers(payload.users);
        } else if (payload.type === 'history') {
          payload.items.forEach(i => appendMessage(i));
        }
      } catch (err) {
        console.error('解析訊息錯誤', err);
      }
    });

    ws.addEventListener('close', () => {
      console.log('WebSocket 已關閉，3 秒後重試連線');
      setTimeout(connect, 3000);
    });

    ws.addEventListener('error', (err) => {
      console.error('WebSocket 錯誤', err);
    });
  }

  sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nick = nicknameInput.value.trim();
    const text = messageInput.value.trim();
    if (!nick || !text) return;
    // 若尚未註冊 nickname，先送 hello
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', nickname: nick, text }));
      messageInput.value = '';
    }
  });

  // 讓 main process 的 ping/pong demo 可用（示範 IPC）
  if (window.electronAPI) {
    window.electronAPI.sendPing({ hello: 'from renderer' });
    window.electronAPI.onPong((data) => {
      console.log('收到主程序 pong', data);
    });
  }

  connect();
})();
