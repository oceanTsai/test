# Electron Chat (範例骨架)

這是一個以 Electron 為主、搭配 WebSocket 的聊天室應用程式範例骨架。目的是提供一個開發起點，包含主程序 (main)、preload、安全的 IPC、渲染端 (renderer) 與一個簡單的 WebSocket 測試伺服器。

快速開始
1. 安裝相依套件
   npm install

2. 啟動開發環境（先啟動伺服器，再啟動 Electron）
   node server/ws-server.js
   npm start

功能說明
- main.js: 建立 Electron 視窗與註冊 IPC。
- preload.js: 暴露安全 API 給 renderer。
- renderer/: 前端 UI，包含訊息呈現與輸入。
- server/: 範例 WebSocket 伺服器用於測試。
  
後續建議
- 把 WebSocket 換成 WSS（生產環境）。
- 加入帳號系統與 JWT 驗證。
- 使用資料庫儲存聊天歷史（例如 PostgreSQL / Redis）。
- 加入離線訊息/重試/ACK 機制，與使用者 presence 更新.
