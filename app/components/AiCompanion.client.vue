<template>
  <div
    class="h-screen w-full flex overflow-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative"
  >
    <AiSidebar
      v-model:is-open="isSidebarOpen"
      :sessions="filteredSidebarSessions"
      :active-session-id="activeSessionId"
      :search-query="searchQuery"
      :is-search-open="isSearchOpen"
      @new-chat="startNewChat"
      @toggle-search="isSearchOpen = !isSearchOpen"
      @select-session="selectSession"
      @update:search-query="searchQuery = $event"
    />

    <div class="flex-1 flex flex-col min-w-0 h-full transition-all duration-300">
      <div class="max-w-3xl w-full mx-auto p-4 flex flex-col flex-1 h-full overflow-hidden">
        <!-- 顶部信息 -->
        <header
          class="py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-2 md:px-0"
        >
          <div class="flex items-center gap-3">
            <!-- 左侧：汉堡菜单（移动端显示，点击可切换侧边栏） -->
            <button
              class="p-2 -ml-2 text-gray-600 dark:text-gray-400 md:hidden flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="打开侧边栏"
              @click="isSidebarOpen = !isSidebarOpen"
            >
              <span class="i-lucide-menu text-xl"></span>
            </button>
            <h1 class="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <span class="i-lucide-sparkles text-purple-500"></span> 专属心理陪伴
            </h1>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            {{ isLoading ? '正在认真听你说...' : '在线倾听你的声音' }}
          </div>
        </header>

        <!-- 聊天记录区域 -->
        <main
          ref="messagesContainer"
          class="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-hide"
          :class="messages.length === 0 ? 'flex items-center justify-center' : ''"
        >
          <div
            v-if="messages.length === 0"
            class="flex flex-col items-center justify-center h-full gap-4"
          >
            <h2
              class="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 tracking-wide"
            >
              今天有什么想说的吗？
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 w-full max-w-xl">
              <button
                class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="quickAsk('最近有点焦虑，我该怎么缓解？')"
              >
                缓解焦虑
              </button>
              <button
                class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="quickAsk('最近睡不太好，能陪我梳理一下吗？')"
              >
                睡眠困扰
              </button>
              <button
                class="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                @click="quickAsk('我最近压力很大，想找人聊聊')"
              >
                压力倾诉
              </button>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="m in messages"
            :key="m.id"
            class="flex gap-3"
            :class="m.role === 'user' ? 'flex-row-reverse' : ''"
          >
            <!-- 头像 -->
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="
                m.role === 'user'
                  ? 'bg-green-400 text-white'
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
              "
            >
              <span v-if="m.role === 'user'" class="i-lucide-user text-sm"></span>
              <span v-else class="i-lucide-bot text-sm"></span>
            </div>

            <!-- 消息气泡及操作按钮 -->
            <div
              class="flex flex-col gap-1 max-w-[80%]"
              :class="m.role === 'user' ? 'items-end' : 'items-start'"
            >
              <div
                class="rounded-2xl px-4 py-2 text-sm"
                :class="
                  m.role === 'user'
                    ? 'bg-green-400 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm text-gray-800 dark:text-gray-200'
                "
              >
                <template v-if="getMessageText(m)">
                  <p class="whitespace-pre-wrap leading-relaxed" v-text="getMessageText(m)"></p>
                </template>
                <template v-else>
                  <div class="flex items-center gap-1.5 h-5 px-1">
                    <span
                      class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style="animation-delay: 0ms"
                    ></span>
                    <span
                      class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style="animation-delay: 150ms"
                    ></span>
                    <span
                      class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style="animation-delay: 300ms"
                    ></span>
                  </div>
                </template>
              </div>

              <div class="flex gap-2 opacity-90 transition-opacity px-1 mt-1">
                <button
                  v-if="getMessageText(m)"
                  class="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer relative group/btn"
                  aria-label="复制消息"
                  @click="copyText(getMessageText(m))"
                >
                  <span class="i-lucide-copy text-sm"></span>
                  <span
                    class="absolute top-8 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm"
                  >
                    复制
                  </span>
                </button>

                <button
                  v-if="
                    m.role === 'assistant' &&
                    (getMessageText(m).includes('抱歉') || isErrorMessage(m.id))
                  "
                  class="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer relative group/btn"
                  aria-label="重新生成回复"
                  @click="retryLastMessage"
                >
                  <span class="i-lucide-rotate-cw text-sm"></span>
                  <span
                    class="absolute top-8 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm"
                  >
                    重新生成
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="
              isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user'
            "
            class="flex gap-3"
          >
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
            >
              <span class="i-lucide-bot text-sm"></span>
            </div>
            <div
              class="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
            >
              <div class="flex items-center gap-1.5 h-5 px-1">
                <span
                  class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                ></span>
                <span
                  class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                ></span>
                <span
                  class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                ></span>
              </div>
            </div>
          </div>
        </main>

        <footer class="py-2 pb-4 md:py-4 bg-white dark:bg-gray-900">
          <form
            :class="[
              'relative flex gap-1 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-2 py-1 transition-all duration-200 focus-within:border-gray-300 dark:focus-within:border-gray-600',
              isMultiline ? 'items-end' : 'items-center'
            ]"
            @submit="handleSubmit"
          >
            <button
              type="button"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="附件功能（即将上线）"
            >
              <span class="i-lucide-plus text-lg"></span>
            </button>

            <textarea
              ref="textareaRef"
              v-model="input"
              rows="1"
              class="flex-1 bg-transparent border-none py-1 px-2 outline-none ring-0 focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-400 resize-none leading-6 transition-all duration-200"
              style="
                max-height: 196px;
                min-height: 2rem;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
              "
              placeholder="可以说点什么吗？（Enter 发送，Shift+Enter 换行）"
              @keydown.enter.exact.prevent="handleSubmit"
              @input="adjustTextareaHeight"
            />

            <button
              type="button"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="语音输入（即将上线）"
            >
              <span class="i-lucide-mic text-lg"></span>
            </button>

            <button
              type="submit"
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              :class="
                !input || !input.trim() || isLoading
                  ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:scale-105 shadow-sm'
              "
              :disabled="!input || !input.trim() || isLoading"
              aria-label="发送消息"
            >
              <span v-if="isLoading" class="i-lucide-loader-2 animate-spin text-sm"></span>
              <span v-else class="i-lucide-arrow-up text-base"></span>
            </button>

            <button
              v-show="showScrollButton"
              class="absolute -top-14 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 z-10"
              @click.prevent="scrollToBottom"
            >
              <span class="i-lucide-arrow-down text-sm"></span>
            </button>
          </form>
        </footer>
      </div>
    </div>

    <div
      v-if="toastMessage"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 text-white text-xs px-3 py-1.5 shadow-md z-50"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import { DefaultChatTransport } from 'ai'
import AiSidebar from './AiSidebar.client.vue'

definePageMeta({
  hideFooter: true
})

interface PersistedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

interface PersistedSession {
  id: string
  title: string
  updatedAt: number
  messages: PersistedMessage[]
}

const STORAGE_KEY = 'ai-companion-sessions-v1'
const MAX_SESSIONS = 3

const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isSidebarOpen = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const input = ref('')
const toastMessage = ref('')
const showScrollButton = ref(false)
const isNearBottom = ref(true)
const isMultiline = ref(false)
const sessions = ref<PersistedSession[]>([])
const activeSessionId = ref('')
const isHydrating = ref(true)

let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let toastTimer: ReturnType<typeof setTimeout> | null = null

const getMessageText = (m: UIMessage | any) => {
  if ('content' in m && m.content) return m.content
  if ('parts' in m && Array.isArray(m.parts)) {
    return m.parts.map((part: any) => (part.type === 'text' ? part.text : '')).join('')
  }
  return ''
}

const createSession = (): PersistedSession => ({
  id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '新聊天',
  updatedAt: Date.now(),
  messages: []
})

const showToast = (message: string) => {
  toastMessage.value = message
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 1400)
}

const saveSessionsToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
}

const toPersistedMessages = (source: UIMessage[]): PersistedMessage[] =>
  source
    .map((m) => {
      const text = getMessageText(m).trim()
      return {
        id: m.id,
        role: m.role as PersistedMessage['role'],
        text
      }
    })
    .filter((m) => m.text)

const toUiMessages = (source: PersistedMessage[]): UIMessage[] =>
  source.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text', text: m.text }]
  })) as UIMessage[]

const buildSessionTitle = (source: PersistedMessage[]) => {
  const firstUser = source.find((m) => m.role === 'user')
  if (!firstUser) return '新聊天'
  return firstUser.text.slice(0, 16)
}

const chat = new Chat<UIMessage>({
  id: 'chat',
  transport: new DefaultChatTransport({
    api: '/api/chat'
  }),
  onError: (error: Error) => {
    console.error('Chat error:', error)
    let errorMsg =
      '抱歉，系统开小差了，暂时无法处理您的请求 🌧️。您可以尝试重新发送消息，或者稍后再试~'
    if (error.name === 'AbortError') {
      errorMsg = '抱歉，当前和我聊天的人太多啦，导致响应超时 🥺。您可以稍后重新发送试试~'
    } else if (error.message === 'AI_CONNECTION_FAILED' || error.message.includes('fetch')) {
      errorMsg =
        '抱歉，我的大脑（AI 服务）暂时无法连接或正在维护中 🔧。您可以稍后重新发送，或者联系客服反馈问题~'
    }

    const errorId = `error-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    chat.messages = [
      ...chat.messages,
      {
        id: errorId,
        role: 'assistant',
        parts: [{ type: 'text', text: errorMsg }]
      }
    ]
  }
})

const messages = computed(() => chat.messages)
const isLoading = computed(() => chat.status === 'submitted' || chat.status === 'streaming')

const filteredSidebarSessions = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) {
    return sessions.value.map((s) => ({ id: s.id, title: s.title }))
  }
  return sessions.value
    .filter((s) => s.title.toLowerCase().includes(keyword))
    .map((s) => ({ id: s.id, title: s.title }))
})

const upsertActiveSession = () => {
  const id = activeSessionId.value
  if (!id) return

  const normalizedMessages = toPersistedMessages(chat.messages)
  const targetIndex = sessions.value.findIndex((s) => s.id === id)
  if (targetIndex === -1) return
  const currentSession = sessions.value[targetIndex]
  if (!currentSession) return

  sessions.value[targetIndex] = {
    id: currentSession.id,
    updatedAt: Date.now(),
    messages: normalizedMessages,
    title: buildSessionTitle(normalizedMessages)
  }

  sessions.value = [...sessions.value]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SESSIONS)

  saveSessionsToStorage()
}

const startNewChat = () => {
  if (!isHydrating.value) {
    upsertActiveSession()
  }

  const newSession = createSession()
  sessions.value = [newSession, ...sessions.value].slice(0, MAX_SESSIONS)
  activeSessionId.value = newSession.id
  chat.messages = []
  input.value = ''
  saveSessionsToStorage()
  showToast('已开启新聊天')
}

const selectSession = (sessionId: string) => {
  if (sessionId === activeSessionId.value) return
  upsertActiveSession()

  const target = sessions.value.find((s) => s.id === sessionId)
  if (!target) return

  activeSessionId.value = target.id
  chat.messages = toUiMessages(target.messages)
  input.value = ''
  nextTick(scrollToBottom)
}

const handleScroll = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = setTimeout(() => {
    if (!messagesContainer.value) return
    const container = messagesContainer.value
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    isNearBottom.value = distanceToBottom <= 80
    showScrollButton.value = distanceToBottom > 50
  }, 100)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
    isNearBottom.value = true
    showScrollButton.value = false
  }
}

const copyText = async (text: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    showToast('复制成功')
  } catch (err) {
    console.error('复制失败:', err)
    showToast('复制失败，请重试')
  }
}

const isErrorMessage = (id: string) => id.startsWith('error-msg-')

const retryLastMessage = async () => {
  if (isLoading.value) return

  const regenerate = (chat as any).regenerate
  if (typeof regenerate === 'function') {
    await regenerate.call(chat)
    showToast('正在重新生成回复')
    return
  }

  const userMessages = chat.messages.filter((m) => m.role === 'user')
  if (userMessages.length === 0) return

  const lastUserMessage = userMessages[userMessages.length - 1]
  const text = getMessageText(lastUserMessage)

  if (text) {
    const lastMsg = chat.messages[chat.messages.length - 1]
    if (lastMsg && lastMsg.role === 'assistant' && getMessageText(lastMsg).includes('抱歉')) {
      chat.messages = chat.messages.slice(0, -1)
    }
    chat.sendMessage({ text })
    showToast('已重新发送上一条问题')
  }
}

const handleSubmit = (e?: Event) => {
  e?.preventDefault()
  if (!input.value.trim() || isLoading.value) return

  chat.sendMessage({ text: input.value.trim() })
  input.value = ''
  nextTick(() => adjustTextareaHeight())
}

const quickAsk = (text: string) => {
  input.value = text
  handleSubmit()
}

const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  textarea.style.height = 'auto'
  const scrollHeight = textarea.scrollHeight
  const minHeight = 32 // single line height (2rem = 32px)
  const maxHeight = 196 // 7 lines * 24px + padding = ~196px
  const newHeight = Math.min(scrollHeight, maxHeight)
  textarea.style.height = `${newHeight}px`
  textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
  isMultiline.value = newHeight > minHeight
}

onMounted(() => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = true
  }

  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as PersistedSession[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        sessions.value = parsed
          .map((session) => ({
            ...session,
            messages: Array.isArray(session.messages) ? session.messages : []
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, MAX_SESSIONS)
      }
    } catch {
      sessions.value = []
    }
  }

  if (sessions.value.length === 0) {
    sessions.value = [createSession()]
  }

  const firstSession = sessions.value[0]
  if (firstSession) {
    activeSessionId.value = firstSession.id
    chat.messages = toUiMessages(firstSession.messages)
  }
  saveSessionsToStorage()

  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }

  if (textareaRef.value) {
    textareaRef.value.addEventListener('input', adjustTextareaHeight)
    adjustTextareaHeight()
  }

  isHydrating.value = false
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (textareaRef.value) {
    textareaRef.value.removeEventListener('input', adjustTextareaHeight)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  if (!isHydrating.value) {
    upsertActiveSession()
  }
})

watch(
  () => messages.value,
  () => {
    if (!isHydrating.value) {
      upsertActiveSession()
    }
    nextTick(() => {
      if (messagesContainer.value && isNearBottom.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: true }
)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
