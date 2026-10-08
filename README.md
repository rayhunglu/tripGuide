# 大阪・京都 楓遊記

2026.11.19 – 11.27 旅遊行程網站（和紙繪本風）。Express + React + Vite，結構同 nouvelle-anti-aging。

- 行程資料：`src/data/trip.json`（日期、行程、待辦、住宿、航班）
- 前端：`webapp/`（`art.jsx` 為 SVG 插圖，`index.css` 為樣式與動畫，支援 `prefers-reduced-motion`）
- 後端：`src/`（Express 提供 `dist` 靜態檔與 `/api/trip`、`/api/health`）；Vercel 入口為 `api/index.js`
- 待辦勾選與目前日期存於瀏覽器 localStorage

```bash
npm install
npm run dev     # Vite dev server
npm start       # build + Express on :3000
```
