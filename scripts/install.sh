#!/bin/bash

# Notion Knowledge MCP Server 安裝腳本
# 支援 Claude Desktop, Claude Code, 和 Gemini CLI

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_SERVER_PATH="$PROJECT_DIR/src/mcp-server.js"

echo "🚀 Notion Knowledge MCP Server 安裝腳本"
echo "項目路徑: $PROJECT_DIR"
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 請先安裝 Node.js"
    exit 1
fi

# 檢查 MCP 服務器文件
if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo "❌ 錯誤: 找不到 MCP 服務器文件: $MCP_SERVER_PATH"
    exit 1
fi

# 讓腳本可執行
chmod +x "$MCP_SERVER_PATH"

echo "選擇要配置的 AI 客戶端:"
echo "1) Claude Desktop"
echo "2) Claude Code"
echo "3) Gemini CLI"
echo "4) 全部配置"
echo ""
read -p "請輸入選項 (1-4): " choice

case $choice in
    1|4)
        echo ""
        echo "📱 配置 Claude Desktop..."
        CLAUDE_DESKTOP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
        
        # 創建目錄（如果不存在）
        mkdir -p "$(dirname "$CLAUDE_DESKTOP_CONFIG")"
        
        # 檢查現有配置
        if [ -f "$CLAUDE_DESKTOP_CONFIG" ]; then
            echo "⚠️  發現現有的 Claude Desktop 配置"
            read -p "是否備份現有配置？ (y/n): " backup
            if [ "$backup" = "y" ]; then
                cp "$CLAUDE_DESKTOP_CONFIG" "$CLAUDE_DESKTOP_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
                echo "✅ 已備份現有配置"
            fi
        fi
        
        # 創建配置
        cat > "$CLAUDE_DESKTOP_CONFIG" << EOF
{
  "mcpServers": {
    "notion-knowledge": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF
        echo "✅ Claude Desktop 配置完成"
        ;;
esac

case $choice in
    2|4)
        echo ""
        echo "💻 配置 Claude Code..."
        
        # 檢查 Claude Code 是否安裝
        if command -v claude &> /dev/null; then
            echo "使用 claude mcp add 命令配置..."
            claude mcp add notion-knowledge node "$MCP_SERVER_PATH"
            echo "✅ Claude Code 配置完成"
        else
            echo "⚠️  未找到 Claude Code，請手動安裝後執行："
            echo "claude mcp add notion-knowledge node $MCP_SERVER_PATH"
        fi
        ;;
esac

case $choice in
    3|4)
        echo ""
        echo "🔸 配置 Gemini CLI..."
        
        GEMINI_SETTINGS="$HOME/.gemini/settings.json"
        
        # 檢查 Gemini CLI 是否安裝
        if ! command -v gemini &> /dev/null; then
            echo "⚠️  未找到 Gemini CLI，正在安裝..."
            npm install -g @google/gemini-cli
        fi
        
        # 創建目錄（如果不存在）
        mkdir -p "$(dirname "$GEMINI_SETTINGS")"
        
        # 檢查現有配置
        if [ -f "$GEMINI_SETTINGS" ]; then
            echo "⚠️  發現現有的 Gemini CLI 配置"
            read -p "是否合併配置？ (y/n): " merge
            if [ "$merge" = "y" ]; then
                # 備份
                cp "$GEMINI_SETTINGS" "$GEMINI_SETTINGS.backup.$(date +%Y%m%d_%H%M%S)"
                
                # 使用 jq 合併配置（如果有的話）
                if command -v jq &> /dev/null; then
                    temp_file=$(mktemp)
                    jq --arg path "$MCP_SERVER_PATH" '.mcpServers["notion-knowledge"] = {"command": "node", "args": [$path]}' "$GEMINI_SETTINGS" > "$temp_file"
                    mv "$temp_file" "$GEMINI_SETTINGS"
                    echo "✅ 已合併到現有配置"
                else
                    echo "⚠️  請手動將以下配置添加到 $GEMINI_SETTINGS："
                    echo "\"notion-knowledge\": {\"command\": \"node\", \"args\": [\"$MCP_SERVER_PATH\"]}"
                fi
            fi
        else
            # 創建新配置
            cat > "$GEMINI_SETTINGS" << EOF
{
  "theme": "Default",
  "selectedAuthType": "oauth-personal",
  "mcpServers": {
    "notion-knowledge": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF
            echo "✅ Gemini CLI 配置完成"
        fi
        ;;
esac

echo ""
echo "🎉 安裝完成！"
echo ""
echo "📝 使用方式："
echo "1. 重啟相應的 AI 客戶端"
echo "2. 使用自然語言與知識庫互動，例如："
echo "   - \"請搜索關於 React 的知識\""
echo "   - \"請將這段代碼保存到知識庫\""
echo "   - \"請顯示知識庫統計信息\""
echo ""
echo "🔧 MCP 服務器路徑: $MCP_SERVER_PATH"
echo "🌐 Cloudflare Worker: https://notion-knowledge-mcp.etjang10.workers.dev"