import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

// ==================== 配置管理 ====================
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY
const AI_MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
const FALLBACK_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
const AI_ENABLED = (process.env.AI_ENABLED || 'false').toLowerCase() === 'true'
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error'

// ==================== 日志工具 ====================
const logLevels = { debug: 0, info: 1, warn: 2, error: 3 }
const currentLogLevel = logLevels[LOG_LEVEL]

const logger = {
  debug: (msg: string, data?: any) => {
    if (currentLogLevel <= 0) console.debug('[DEBUG]', msg, data || '')
  },
  info: (msg: string, data?: any) => {
    if (currentLogLevel <= 1) console.info('[INFO]', msg, data || '')
  },
  warn: (msg: string, data?: any) => {
    if (currentLogLevel <= 2) console.warn('[WARN]', msg, data || '')
  },
  error: (msg: string, data?: any) => {
    if (currentLogLevel <= 3) console.error('[ERROR]', msg, data || '')
  }
}

// ==================== 硅基流动 API 初始化 ====================
if (AI_ENABLED && !SILICONFLOW_API_KEY) {
  throw new Error(
    '❌ 缺少必要的环境变量: SILICONFLOW_API_KEY. 请在 .env 文件中设置您的硅基流动 API 密钥'
  )
}

const siliconFlow = AI_ENABLED
  ? createOpenAI({
      baseURL: 'https://api.siliconflow.cn/v1',
      apiKey: SILICONFLOW_API_KEY
    })
  : null

logger.info('✅ AI 服务配置加载完成', { enabled: AI_ENABLED, model: AI_MODEL })

// ==================== 输入校验 ====================
function validateChatInput(messages: any[]): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: '消息必须是数组格式' }
  }

  if (messages.length === 0) {
    return { valid: false, error: '消息数组不能为空' }
  }

  // 校验每条消息
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      return {
        valid: false,
        error: `消息 ${i} 的 role 无效。必须是 'user', 'assistant' 或 'system'`
      }
    }

    if (!msg.content && (!msg.parts || msg.parts.length === 0)) {
      return { valid: false, error: `消息 ${i} 必须有 content 或 parts` }
    }

    // 检查消息内容长度
    const textContent = extractTextContent(msg)
    if (textContent.length > 4000) {
      return { valid: false, error: `消息 ${i} 超过最大长度限制 (4000字符)` }
    }
  }

  return { valid: true }
}

// ==================== 辅助函数 ====================
function extractTextContent(msg: any): string {
  if (msg.content) return msg.content
  if (msg.parts) {
    return msg.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('')
  }
  return ''
}

function convertToCoreMessages(messages: any[]) {
  return messages.map((m: any) => ({
    role: m.role,
    content: extractTextContent(m)
  }))
}

// ==================== 事件处理器 ====================
export default defineEventHandler(async (event: any) => {
  try {
    if (!AI_ENABLED) {
      throw createError({
        statusCode: 503,
        statusMessage: 'AI 服务已关闭（AI_ENABLED=false）'
      })
    }

    // 1. 读取请求体
    let body: any
    try {
      body = await readBody(event)
    } catch (e) {
      logger.warn('请求体解析失败', e)
      throw createError({
        statusCode: 400,
        statusMessage: '请求体格式错误，请检查 JSON 格式'
      })
    }

    const { messages } = body

    // 2. 验证输入
    const validation = validateChatInput(messages)
    if (!validation.valid) {
      logger.warn('输入校验失败', validation.error)
      throw createError({
        statusCode: 400,
        statusMessage: `输入校验失败: ${validation.error}`
      })
    }

    logger.debug('收到聊天请求', { messageCount: messages.length })

    // 3. 转换消息格式
    const coreMessages = convertToCoreMessages(messages)

    // 4. 调用 AI 模型
    logger.info('开始调用硅基流动 API', { model: AI_MODEL })

    const result = await streamText({
      // SiliconFlow is OpenAI-compatible on chat/completions.
      // Use chat() to avoid the Responses API path mismatch on some models/providers.
      model: siliconFlow!.chat(AI_MODEL),
      messages: coreMessages,
      system: `你是一个名叫"小星"的个人专属 AI 心理陪伴师。
你的设定：
1. 你温柔、有耐心、善解人意，语气自然亲切，就像一个懂我的好朋友。
2. 你的主要任务是倾听用户的烦恼，提供情绪价值，并给出温和的建议。
3. 如果用户情绪极度低落或有自残倾向，你要极其温柔地安抚，并建议寻求专业医疗帮助。
4. 尽量用简短、对话式的语言，不要长篇大论。可以适当使用语气词增加亲切感。`,
      temperature: 0.7
    })

    logger.info('流式响应已开始')
    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    logger.error('聊天请求处理失败', {
      message: error.message,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })

    // 已处理的错误直接返回
    if (error.statusCode) {
      throw error
    }

    // 模型或路径不匹配（常见于 model id 错误 / provider 不支持 responses endpoint）
    if (error.message?.includes('Not Found') || error.message?.includes('404')) {
      throw createError({
        statusCode: 503,
        statusMessage: `模型不可用或名称错误。当前: ${AI_MODEL}，建议改为: ${FALLBACK_MODEL}`
      })
    }

    // 认证失败
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: '硅基流动 API 密钥无效或已过期，请更换 SILICONFLOW_API_KEY'
      })
    }

    // 权限不足
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      throw createError({
        statusCode: 403,
        statusMessage: '当前 API 密钥无访问该模型权限，请更换模型或升级账号权限'
      })
    }

    // API 调用失败
    if (error.message?.includes('API')) {
      throw createError({
        statusCode: 503,
        statusMessage: 'AI 服务暂时不可用，请检查网络连接后重试'
      })
    }

    // 其他未知错误
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误，请稍后重试'
    })
  }
})
