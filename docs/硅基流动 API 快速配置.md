## 硅基流动 API 快速配置

### 📋 前提条件
- 已在 https://cloud.siliconflow.cn 注册账户
- 已获得 API 密钥

### ⚙️ 配置步骤

#### 1. 创建 `.env` 本地配置文件

在项目根目录创建 `.env` 文件（不要上传到 Git）：

```bash
# .env
SILICONFLOW_API_KEY=sk-您的密钥...

# 可选：选择模型（默认为 Qwen/Qwen2.5-7B-Instruct）
AI_MODEL=Qwen/Qwen2.5-7B-Instruct

# 可选：日志级别 (debug|info|warn|error，默认为 info)
LOG_LEVEL=info
```

#### 2. 硅基流动支持的模型

一些常用模型：
- `Qwen/Qwen2.5-7B-Instruct` (推荐) - 平衡性能和成本
- `Qwen/Qwen2.5-14B-Instruct` - 更强的语言理解
- `meta-llama/Llama-3.1-8B-Instruct`
- 更多模型见: https://docs.siliconflow.cn/docs/model

### 🚀 启动应用

```bash
# 本地开发
pnpm dev

# 生产部署
pnpm build
node .output/server/index.mjs
```

### 📊 日志级别说明

| 级别 | 说明 |
|------|------|
| `debug` | 详细调试信息（请求参数、消息转换过程） |
| `info` | 重要业务事件（API初始化成功、请求开始） |
| `warn` | 警告（校验失败、请求体异常） |
| `error` | 错误（API调用失败、服务器错误） |

### 🧪 测试 API

使用 curl 测试：

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "你好，我是小王"
      }
    ]
  }'
```

### 🔐 安全建议

- `.env` 文件**不要**上传到 Git，已在 `.gitignore` 中
- 不要在客户端代码中使用 API 密钥
- 定期轮换 API 密钥
- 在生产环境中通过环境变量管理密钥

### ❌ 常见问题

**问：404 错误**
- 检查 `.env` 文件是否存在且在根目录
- 重启开发服务器：`pnpm dev`

**问：401/403 认证错误**
- 检查 `SILICONFLOW_API_KEY` 是否正确
- 确保 API 密钥未过期或被撤销

**问：消息超过4000字符**
- 当前限制为 4000 字符/消息
- 可在 `server/api/chat.post.ts` 的 `validateChatInput` 函数中调整

### 📚 更多资源

- [硅基流动官方文档](https://docs.siliconflow.cn)
- [AI SDK 文档](https://sdk.vercel.ai)
- [Nuxt Server API 文档](https://nuxt.com/docs/guide/directory-structure/server)
