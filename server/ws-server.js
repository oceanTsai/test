// 簡單的 WebSocket server（測試用）
// 啟動： node server/ws-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server start on ws://localhost:8080');

// in-memory store (demo，production 請換 DB 或 Redis)
const clients = new Map(); // ws -> nickname
const history = []; // array of { from, text, time }

function broadcast(data, exceptWs = null) {
  const raw = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== exceptWs) {
      client.send(raw);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('client connected');
  // 傳送歷史
  ws.send(JSON.stringify({ type: 'history', items: history.slice(-50) }));

  ws.on('message', (msg) => {
    try {
      const payload = JSON.parse(msg);
      if (payload.type === 'hello') {
        clients.set(ws, payload.nickname || 'anonymous');
        broadcastUsers();
      } else if (payload.type === 'message') {
        const from = payload.nickname || clients.get(ws) || 'anonymous';
        const text = payload.text || '';
        const item = { type: 'message', from, text, time: Date.now() };
        history.push(item);
        // 簡單保護：限制歷史大小
        if (history.length > 1000) history.shift();
        broadcast(item);
      }
    } catch (err) {
      console.error('parse message failed', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastUsers();
    console.log('client disconnected');
  });
});

function broadcastUsers() {
  const names = Array.from(clients.values());
  broadcast({ type: 'users', users: names });
}