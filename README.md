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
npx wrangler secret put NOTION_DATABASE_ID

# 部署
npm run deploy
```

### 2. 配置 Notion

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 創建新的 Integration
3. 複製 Integration Token
4. 創建或選擇一個 Notion 資料庫作為知識庫
5. 複製資料庫 ID（從資料庫 URL 中獲取）
6. 在你的知識庫頁面授權 Integration

### 2.1 部署到 Cloudflare Workers（可選）

如果要部署到 Cloudflare Workers：

```bash
# 設置環境變數
wrangler secret put NOTION_TOKEN        # 你的 Notion Integration Token
wrangler secret put NOTION_DATABASE_ID  # 你的 Notion 資料庫 ID

# 部署
wrangler deploy
```

### 3. 配置 AI 客戶端

#### Claude Desktop
```bash
# 複製配置檔案
cp config/claude-desktop.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Claude Code
```bash
# 使用 claude mcp add 命令（推薦）
claude mcp add notion-knowledge node ./src/mcp-server.js

# 或手動配置：將以下內容添加到 ~/.claude/settings.json
{
  "mcpServers": {
    "notion-knowledge": {
      "command": "node",
      "args": ["<path-to-project>/src/mcp-server.js"]
    }
  }
}
```

#### Gemini CLI
```bash
# 安裝 Gemini CLI
npm install -g @google/gemini-cli

# 配置 MCP 服務器
cp config/gemini-cli-settings.json ~/.gemini/settings.json
# 或將 notion-knowledge 配置合併到現有的 ~/.gemini/settings.json
```

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
- `NOTION_TOKEN` - Notion Integration Token (必須)
- `NOTION_DATABASE_ID` - Notion 資料庫 ID (必須)

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
