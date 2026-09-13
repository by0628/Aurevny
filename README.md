# 🌍 全球热点态势感知系统

> **仿企业级数据可视化大屏** · 实时时事热点 · 零后端部署 · GitHub Pages 一键上线

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy: GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-green.svg)](./QUICKSTART.md)

---

## ✨ 功能一览

| 功能 | 说明 |
|------|------|
| 🗺️ **OSM 地图** | 矢量 + 卫星双模式（不用 Google） |
| 🔥 **实时热点** | 世界/国内 Tab 切换，点击列表 → 地图 flyTo 定位 |
| 📊 **ECharts** | 情感饼图、趋势线、词云、分类柱状图、仪表盘 |
| 💫 **飞线动画** | 贝塞尔曲线 + 流动虚线 |
| 📱 **手机适配** | 底部 Tab（🗺️地图 / 🔥热点 / 📊分析） |
| 🔄 **自动更新** | 每 5 分钟数据自动刷新 |
| 💾 **离线缓存** | localStorage，断网也能看 |
| 🛡️ **三级降级** | API → 代理 → 内置数据，永远不崩 |

---

## 🚀 3 分钟部署到 GitHub Pages

详见 **[QUICKSTART.md](./QUICKSTART.md)**

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/你的用户名/hotspot-dashboard.git
git push -u origin main
# → Settings → Pages → Deploy from branch → main
```

---

## 🛠 技术栈

```
HTML/CSS/JS (原生，零框架依赖)
├── Leaflet.js          → OSM 矢量 + Esri 卫星
├── ECharts 5           → 图表可视化
└── 数据层（三选一）
    ├── api-zero-config.js  ⭐ 默认：内置动态数据，零配置
    ├── api-github.js       → 第三方热榜 API（vvhan + Hacker News）
    └── snapshot-loader.js  → GitHub Actions 快照文件
```

---

## 📁 项目结构

```
global-hotspot-dashboard/
├── index.html              # 主页面
├── test-api.html           # API 连通性测试
├── QUICKSTART.md           # 📖 3分钟部署指南（看这个！）
├── .github/workflows/
│   └── update-hotspots.yml # GitHub Actions 定时抓取
├── css/style.css           # 全部样式 + 响应式
├── js/
│   ├── mockData.js         # 内置数据（兜底）
│   ├── api-zero-config.js  # ⭐ 零配置实时数据（默认）
│   ├── api-github.js       # 第三方 API 模式（可选）
│   ├── snapshot-loader.js  # 快照加载器（可选）
│   ├── map.js              # 地图 + 飞线
│   ├── charts.js           # ECharts 图表 + KPI
│   ├── main.js             # 主控制器
│   └── main-realtime.js    # 实时数据 → UI 绑定
├── cloudflare-proxy.js     # CORS 代理 Worker（可选）
└── .nojekyll               # GitHub Pages 配置
```

---

## 🔑 数据模式说明

### 模式 1：零配置（默认 ✅ 推荐）

`api-zero-config.js` — 内置动态数据，每 5 分钟自动变化：
- ✅ 不需要任何外部服务
- ✅ GitHub Pages 直接可用
- ✅ 视觉上和实时一模一样

### 模式 2：第三方 API（可选升级）

`api-github.js` — 连接真实热榜：
- `api.vvhan.com` — 百度/知乎/微博热搜
- `hacker-news.firebaseio.com` — 世界热点
- 3 个 CORS 代理自动兜底

> 先用 `test-api.html` 测试连通性，≥3 个通过就可用。

### 模式 3：GitHub Actions 快照（进阶）

开启 `.github/workflows/update-hotspots.yml` 后：
- 每 30 分钟自动抓取真实热榜
- 生成 `hotspots-snapshot.json`
- 页面直接读文件，**无 CORS 问题**

---

## 💡 答辩话术

> 系统采用"静态前端 + 多源数据聚合"架构，支持三级降级策略（实时 API → CORS 代理 → 基线数据），可部署于 GitHub Pages 等纯静态托管平台。热点数据经浏览器端地理编码与分类标注后驱动可视化，世界/国内双模式独立数据源，支持点击联动定位与自动刷新。

---

## 📱 本地预览

```bash
# Python（最简单）
python3 -m http.server 8080
# → http://localhost:8080

# Node
npx serve .
```

---

## ⚠️ 注意事项

- **首次部署**先打开 `test-api.html` 测试 API 连通性
- **CORS 问题** → 用零配置模式（`api-zero-config.js`）完全规避
- **想真实时** → 开启 GitHub Actions workflow
- **不要忘了** `.nojekyll` 文件（已包含）

---

## 📄 License

MIT License — 随便用，商用也行
