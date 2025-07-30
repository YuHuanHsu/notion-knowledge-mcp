# Notion Knowledge MCP Server

> 🚀 基於 Cloudflare Workers 的 Notion 知識庫 MCP 服務器，專為程式開發知識管理設計

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/etjang10/notion-knowledge-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特色功能

- 🔍 **智能搜索** - 在 Notion 知識庫中快速找到相關內容
- 📝 **自動記錄** - Claude Code Hooks 自動保存代碼片段
- 📊 **統計分析** - 知識庫內容統計和趨勢分析
- 🌐 **全球加速** - Cloudflare CDN 確保極速響應
- 🔒 **安全可靠** - 環境變數加密存儲，API Token 安全管理

## 🚀 快速開始

### 1. 部署到 Cloudflare Workers

#### 方法一：一鍵部署
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/etjang10/notion-knowledge-mcp)

#### 方法二：手動部署
```bash
# 克隆倉庫
git clone https://github.com/etjang10/notion-knowledge-mcp.git
cd notion-knowledge-mcp

# 安裝依賴
npm install

# 登入 Cloudflare
npx wrangler login

# 設定環境變數
npx wrangler secret put NOTION_TOKEN

# 部署
npm run deploy
```

### 2. 配置 Notion

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 創建新的 Integration
3. 複製 Integration Token
4. 在你的知識庫頁面授權 Integration

### 3. 配置 Claude 客戶端

#### Claude Desktop
複製 `config/claude-desktop.json` 到 `~/.claude_desktop_config.json`

#### Claude Code
複製 `config/claude-code.json` 到你的專案 `.claude/settings.json`

## 📖 使用指南

### 基本操作

**搜索知識：**
```
請搜索關於 "React Hooks" 的知識
```

**添加知識：**
```
請將這段代碼保存到知識庫：
[你的代碼]
```

**查看統計：**
```
請顯示知識庫統計信息
```

### API 端點

- `GET /health` - 健康檢查  
- `GET /tools` - 工具列表
- `POST /call` - MCP 工具調用

## 🛠️ 開發

### 本地開發
```bash
npm run dev
```

### 測試
```bash
npm test
```

### 部署
```bash
npm run deploy
```

## 📝 配置

### 環境變數
- `NOTION_TOKEN` - Notion Integration Token
- Database ID: `0648189f-8545-4fca-9fc2-f2671d1c6cf6` (已內建)

### 自定義配置
編輯 `wrangler.toml` 來自定義部署設定

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 這個倉庫
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開一個 Pull Request

## 📄 授權

這個專案使用 MIT 授權 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 🙏 致謝

- [Cloudflare Workers](https://workers.cloudflare.com/) - 提供無服務器運行環境
- [Notion API](https://developers.notion.com/) - 提供強大的知識庫 API
- [Claude MCP](https://modelcontextprotocol.io/) - 提供模型上下文協議

## 📞 支援

如有問題請：
1. 查看 [Issues](https://github.com/etjang10/notion-knowledge-mcp/issues)
2. 創建新的 Issue
3. 查看文檔 [docs/](docs/)

---

**Live Demo**: https://notion-knowledge.etjang10.workers.dev
