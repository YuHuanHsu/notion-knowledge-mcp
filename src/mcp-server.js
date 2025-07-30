#!/usr/bin/env node

const https = require('https');

class NotionKnowledgeMCP {
  constructor() {
    this.name = "notion-knowledge";
    this.version = "1.0.0";
  }

  async callWorker(method, params = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ method, params });
      const req = https.request('https://notion-knowledge-mcp.etjang10.workers.dev/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            resolve(result.result || body);
          } catch(e) {
            resolve(body);
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async handleRequest(request) {
    try {
      switch (request.method) {
        case 'initialize':
          return {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: this.name,
              version: this.version
            }
          };

        case 'tools/list':
          return {
            tools: [
              {
                name: "add_knowledge",
                description: "添加新知識到程式開發知識庫",
                inputSchema: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "知識條目標題" },
                    content: { type: "string", description: "詳細內容，支援 Markdown 格式" },
                    project: { type: "string", description: "專案分類", default: "其他" },
                    type: { type: "string", description: "知識類型", default: "學習筆記" },
                    keywords: { type: "array", items: { type: "string" }, description: "關鍵字標籤", default: [] },
                    language: { type: "string", description: "程式語言", default: "" },
                    importance: { type: "string", description: "重要程度", default: "中" },
                    file_path: { type: "string", description: "相關檔案路徑（可選）", default: "" }
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
                    project_filter: { type: "string", description: "按專案過濾", default: "" },
                    type_filter: { type: "string", description: "按知識類型過濾", default: "" },
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
            ]
          };

        case 'tools/call':
          const { name, arguments: args } = request.params;
          const result = await this.callWorker(name, args);
          return {
            content: [
              {
                type: "text",
                text: result
              }
            ]
          };

        default:
          throw new Error(`Unknown method: ${request.method}`);
      }
    } catch (error) {
      throw {
        code: -32603,
        message: error.message
      };
    }
  }
}

// 主程序
async function main() {
  const server = new NotionKnowledgeMCP();
  
  process.stdin.setEncoding('utf8');
  let buffer = '';

  process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留不完整的行

    for (const line of lines) {
      if (line.trim()) {
        try {
          const request = JSON.parse(line);
          const response = await server.handleRequest(request);
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: request.id,
            result: response
          }));
        } catch (error) {
          console.log(JSON.stringify({
            jsonrpc: "2.0",
            id: request?.id || null,
            error: error
          }));
        }
      }
    }
  });

  process.stdin.on('end', () => {
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}