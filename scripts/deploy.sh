#!/bin/bash

echo "🚀 部署 Notion Knowledge MCP Server"
echo "================================="

# 檢查必要工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安裝，請先安裝: npm install -g $1"
        exit 1
    fi
}

echo "📋 檢查必要工具..."
check_command "node"
check_command "npm"

# 安裝 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安裝 Wrangler CLI..."
    npm install -g wrangler
fi

# 檢查登入狀態
echo "🔐 檢查 Cloudflare 登入狀態..."
if ! wrangler auth status &> /dev/null; then
    echo "👤 請登入 Cloudflare..."
    wrangler login
fi

# 檢查專案結構
if [ ! -f "src/worker.js" ]; then
    echo "❌ 找不到 src/worker.js，請確認文件結構正確"
    exit 1
fi

if [ ! -f "wrangler.toml" ]; then
    echo "❌ 找不到 wrangler.toml，請確認文件結構正確"
    exit 1
fi

# 設定環境變數
echo "🔑 設定 Notion Token..."
echo "Token: [YOUR_NOTION_TOKEN]"
echo "[YOUR_NOTION_TOKEN]" | wrangler secret put NOTION_TOKEN

echo "✅ 環境變數設定完成"

# 部署
echo "🚀 開始部署到 Cloudflare Workers..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📋 接下來的步驟："
    echo "1. 測試部署："
    echo "   curl https://notion-knowledge.etjang10.workers.dev/health"
    echo ""
    echo "2. 配置 Claude 客戶端："
    echo "   - Claude Desktop: 複製 config/claude-desktop.json 到 ~/.claude_desktop_config.json"
    echo "   - Claude Code: 複製 config/claude-code.json 到 .claude/settings.json"
    echo ""
    echo "3. 開始使用！"
    echo ""
    echo "🔗 你的 MCP Server URL:"
    echo "   https://notion-knowledge.etjang10.workers.dev"
else
    echo "❌ 部署失敗，請檢查錯誤信息"
    exit 1
fi
