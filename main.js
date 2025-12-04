// Electron 主程序 (main process)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 範例：主程序可以接收 renderer 的訊息
ipcMain.on('app:ping', (event, payload) => {
  console.log('收到 ping:', payload);
  event.reply('app:pong', { time: Date.now() });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // macOS 慣例
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) createWindow();
});
