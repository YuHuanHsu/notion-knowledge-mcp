// Notion Knowledge MCP Server - Cloudflare Workers
// 🔧 修復版本 - 使用正確的資料庫 ID

class NotionMCPServer {
  constructor(env) {
    this.notionToken = env.NOTION_TOKEN;
    this.databaseId = "0648189f-8545-4fca-9fc2-f2671d1c6cf6"; // 正確的資料庫 ID
    this.headers = {
      'Authorization': `Bearer ${this.notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
  }

  // MCP 工具定義
  getTools() {
    return [
      {
        name: "add_knowledge",
        description: "添加新知識到程式開發知識庫",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "知識條目標題" },
            content: { type: "string", description: "詳細內容，支援 Markdown 格式" },
            project: { 
              type: "string", 
              description: "專案分類",
              enum: ["Web應用", "Mobile應用", "後端API", "DevOps工具", "數據分析", "其他"],
              default: "其他" 
            },
            type: { 
              type: "string", 
              description: "知識類型",
              enum: ["代碼片段", "解決方案", "錯誤記錄", "學習筆記", "配置文件", "最佳實踐"],
              default: "學習筆記" 
            },
            keywords: { 
              type: "array", 
              items: { type: "string" }, 
              description: "關鍵字標籤",
              default: [] 
            },
            language: { 
              type: "string", 
              description: "程式語言",
              enum: ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "HTML/CSS", "SQL", "Shell", ""],
              default: "" 
            },
            importance: { 
              type: "string", 
              description: "重要程度",
              enum: ["高", "中", "低"],
              default: "中" 
            },
            file_path: {
              type: "string",
              description: "相關檔案路徑（可選）",
              default: ""
            }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "search_knowledge",
        description: "在知識庫中搜索相關內容",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "搜索關鍵字" },
            project_filter: {
              type: "string",
              description: "按專案過濾",
              enum: ["", "Web應用", "Mobile應用", "後端API", "DevOps工具", "數據分析", "其他"],
              default: ""
            },
            type_filter: {
              type: "string", 
              description: "按知識類型過濾",
              enum: ["", "代碼片段", "解決方案", "錯誤記錄", "學習筆記", "配置文件", "最佳實踐"],
              default: ""
            },
            limit: { type: "integer", description: "返回結果數量", default: 10 }
          },
          required: ["query"]
        }
      },
      {
        name: "get_recent_knowledge",
        description: "獲取最近的知識條目",
        inputSchema: {
          type: "object", 
          properties: {
            limit: { type: "integer", description: "返回數量", default: 5 }
          }
        }
      },
      {
        name: "get_knowledge_stats",
        description: "獲取知識庫統計信息",
        inputSchema: { type: "object", properties: {} }
      }
    ];
  }

  // 添加知識條目
  async addKnowledge(params) {
    try {
      const { 
        title, content, project = "其他", type = "學習筆記", 
        keywords = [], language = "", importance = "中", file_path = ""
      } = params;
      
      const keywordOptions = keywords.length > 0 ? keywords.map(kw => ({ name: kw })) : [];
      
      const data = {
        parent: { database_id: this.databaseId },
        properties: {
          "標題": { title: [{ text: { content: title } }] },
          "專案名稱": { select: { name: project } },
          "知識類型": { select: { name: type } },
          "重要程度": { select: { name: importance } }
        },
        children: [{
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: content } }] }
        }]
      };
      
      if (keywordOptions.length > 0) {
        data.properties["關鍵字"] = { multi_select: keywordOptions };
      }
      if (language) {
        data.properties["程式語言"] = { select: { name: language } };
      }
      if (file_path) {
        data.properties["檔案路徑"] = { rich_text: [{ text: { content: file_path } }] };
      }
      
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        return `✅ 知識已成功保存到 Notion
📄 標題: ${title}
📁 專案: ${project}
📋 類型: ${type}
🔗 連結: ${result.url}`;
      } else {
        const errorText = await response.text();
        return `❌ 保存失敗: ${response.status} - ${errorText}`;
      }
    } catch (error) {
      return `❌ 添加知識時發生錯誤: ${error.message}`;
    }
  }

  // 搜索知識
  async searchKnowledge(params) {
    try {
      const { query, project_filter = "", type_filter = "", limit = 10 } = params;
      
      const filters = [];
      if (project_filter) {
        filters.push({ property: "專案名稱", select: { equals: project_filter } });
      }
      if (type_filter) {
        filters.push({ property: "知識類型", select: { equals: type_filter } });
      }
      
      const searchData = {
        page_size: Math.min(limit, 100),
        sorts: [{ property: "最後修改", direction: "descending" }]
      };
      
      if (filters.length > 0) {
        searchData.filter = filters.length === 1 ? filters[0] : { and: filters };
      }
      
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(searchData)
      });
      
      if (response.ok) {
        const data = await response.json();
        const filtered = data.results.filter(result => {
          const title = this.extractTitle(result);
          return title.toLowerCase().includes(query.toLowerCase());
        });
        
        return this.formatSearchResults(filtered, query, { project_filter, type_filter });
      } else {
        const errorText = await response.text();
        return `❌ 搜索失敗: ${response.status} - ${errorText}`;
      }
    } catch (error) {
      return `❌ 搜索時發生錯誤: ${error.message}`;
    }
  }

  // 獲取最近的知識條目
  async getRecentKnowledge(params) {
    try {
      const { limit = 5 } = params;
      
      const searchData = {
        page_size: Math.min(limit, 20),
        sorts: [{ property: "最後修改", direction: "descending" }]
      };
      
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(searchData)
      });
      
      if (response.ok) {
        const data = await response.json();
        return this.formatRecentResults(data.results);
      } else {
        const errorText = await response.text();
        return `❌ 獲取最近知識失敗: ${response.status} - ${errorText}`;
      }
    } catch (error) {
      return `❌ 獲取最近知識時發生錯誤: ${error.message}`;
    }
  }

  // 獲取統計信息
  async getKnowledgeStats() {
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ page_size: 100 })
      });
      
      if (response.ok) {
        const data = await response.json();
        return this.formatStats(data.results);
      } else {
        const errorText = await response.text();
        return `❌ 獲取統計失敗: ${response.status} - ${errorText}`;
      }
    } catch (error) {
      return `❌ 獲取統計時發生錯誤: ${error.message}`;
    }
  }

  // 輔助方法
  extractTitle(result) {
    return result.properties["標題"]?.title?.[0]?.text?.content || "無標題";
  }

  extractSelectValue(result, property) {
    return result.properties[property]?.select?.name || "未設定";
  }

  extractMultiSelectValues(result, property) {
    return result.properties[property]?.multi_select?.map(item => item.name) || [];
  }

  formatSearchResults(results, query, filters) {
    if (!results || results.length === 0) {
      return `🔍 搜索 "${query}" 沒有找到相關結果`;
    }
    
    let output = [`🔍 搜索 "${query}" 找到 ${results.length} 個結果:\n`];
    
    results.forEach((result, index) => {
      const title = this.extractTitle(result);
      const project = this.extractSelectValue(result, "專案名稱");
      const type = this.extractSelectValue(result, "知識類型");
      const keywords = this.extractMultiSelectValues(result, "關鍵字");
      
      output.push(`${index + 1}. 📄 ${title}`);
      output.push(`   📁 專案: ${project} | 📋 類型: ${type}`);
      if (keywords.length > 0) output.push(`   🏷️ 標籤: ${keywords.join(", ")}`);
      output.push(`   🔗 連結: ${result.url}`);
      output.push("");
    });
    
    return output.join("\n");
  }

  formatRecentResults(results) {
    if (!results || results.length === 0) {
      return `📅 最近的知識條目: 沒有找到結果`;
    }
    
    let output = [`📅 最近的知識條目 (${results.length} 個):\n`];
    
    results.forEach((result, index) => {
      const title = this.extractTitle(result);
      const project = this.extractSelectValue(result, "專案名稱");
      const type = this.extractSelectValue(result, "知識類型");
      
      output.push(`${index + 1}. 📄 ${title}`);
      output.push(`   📁 ${project} | 📋 ${type}`);
      output.push(`   🔗 ${result.url}`);
      output.push("");
    });
    
    return output.join("\n");
  }

  formatStats(results) {
    if (!results || results.length === 0) {
      return "📊 知識庫統計: 暫無數據";
    }
    
    const stats = { total: results.length, byProject: {}, byType: {}, byLanguage: {} };
    
    results.forEach(result => {
      const project = this.extractSelectValue(result, "專案名稱");
      const type = this.extractSelectValue(result, "知識類型");
      const language = this.extractSelectValue(result, "程式語言");
      
      stats.byProject[project] = (stats.byProject[project] || 0) + 1;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      if (language !== "未設定") {
        stats.byLanguage[language] = (stats.byLanguage[language] || 0) + 1;
      }
    });
    
    let output = [
      "📊 程式開發知識庫統計報告",
      "==============================",
      "",
      `📈 總計: ${stats.total} 個知識條目`,
      "",
      "📁 按專案分布:"
    ];
    
    Object.entries(stats.byProject)
      .sort(([,a], [,b]) => b - a)
      .forEach(([project, count]) => {
        output.push(`  • ${project}: ${count} 個`);
      });
    
    output.push("");
    output.push("📋 按類型分布:");
    Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        output.push(`  • ${type}: ${count} 個`);
      });
    
    if (Object.keys(stats.byLanguage).length > 0) {
      output.push("");
      output.push("💻 按程式語言分布:");
      Object.entries(stats.byLanguage)
        .sort(([,a], [,b]) => b - a)
        .forEach(([language, count]) => {
          output.push(`  • ${language}: ${count} 個`);
        });
    }
    
    return output.join("\n");
  }

  // 處理 MCP 工具調用
  async handleToolCall(toolName, params) {
    switch (toolName) {
      case "add_knowledge":
        return await this.addKnowledge(params);
      case "search_knowledge":
        return await this.searchKnowledge(params);
      case "get_recent_knowledge":
        return await this.getRecentKnowledge(params);
      case "get_knowledge_stats":
        return await this.getKnowledgeStats();
      default:
        return `❌ 未知工具: ${toolName}`;
    }
  }
}

// Cloudflare Workers 主處理器
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (!env.NOTION_TOKEN) {
        return new Response(JSON.stringify({ 
          error: "Missing NOTION_TOKEN environment variable. Please set it in Workers settings." 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const server = new NotionMCPServer(env);
      const url = new URL(request.url);

      // 健康檢查端點
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          database_id: server.databaseId,
          server_url: request.url.replace(url.pathname, '')
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 工具列表端點
      if (url.pathname === '/tools') {
        return new Response(JSON.stringify({
          tools: server.getTools()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // MCP 工具調用端點
      if (url.pathname === '/call' && request.method === 'POST') {
        const { method, params } = await request.json();
        const result = await server.handleToolCall(method, params);
        
        return new Response(JSON.stringify({ 
          result,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 默認回應
      return new Response(`
🎉 Notion Knowledge MCP Server 運行正常！
==========================================

📊 服務狀態: ✅ 正常運行
🔗 服務網址: ${request.url.replace(url.pathname, '')}
📅 當前時間: ${new Date().toISOString()}
💾 資料庫 ID: ${server.databaseId}

📡 可用 API 端點:
• GET  /health - 健康檢查和狀態信息
• GET  /tools  - MCP 工具列表
• POST /call   - MCP 工具調用接口

🛠️ 可用工具:
• add_knowledge - 添加新知識到 Notion 知識庫
• search_knowledge - 搜索現有知識內容
• get_recent_knowledge - 獲取最近添加的知識
• get_knowledge_stats - 查看知識庫統計信息

💡 使用方式:
在 Claude 中直接說話即可，例如：
"請搜索關於 React 的知識"
"請將這段代碼保存到知識庫"
"請顯示知識庫統計信息"

🔧 GitHub 倉庫: https://github.com/etjang10/notion-knowledge-mcp
powered by Cloudflare Workers ⚡
      `.trim(), {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        help: "請檢查 NOTION_TOKEN 環境變數是否正確設定"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
