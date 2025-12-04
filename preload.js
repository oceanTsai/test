// Preload: 安全地把有限 API 暴露給 renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendPing: (data) => ipcRenderer.send('app:ping', data),
  onPong: (cb) => ipcRenderer.on('app:pong', (event, data) => cb(data))
});
