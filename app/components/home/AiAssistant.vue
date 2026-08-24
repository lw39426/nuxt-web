<script setup lang="ts">
const aiCapabilities = [
  {
    icon: 'i-carbon-chat-bot',
    title: '智能问答',
    desc: '7x24小时在线，秒级响应你的任何产品疑问'
  },
  {
    icon: 'i-carbon-recommend',
    title: '个性推荐',
    desc: '基于深度学习的用户画像，精准匹配你的喜好'
  },
  {
    icon: 'i-carbon-visual-recognition',
    title: '识图找物',
    desc: '上传图片即可智能识别并推荐相似商品'
  },
  {
    icon: 'i-carbon-chart-line',
    title: '价格预测',
    desc: 'AI分析市场趋势，帮你把握最佳购买时机'
  }
];

const demoMessages = [
  { role: 'user', content: '我想买一台适合编程的笔记本电脑' },
  {
    role: 'ai',
    content:
      '推荐 MacBook Pro 16英寸 M3芯片，32GB内存，512GB SSD，适合高强度开发工作。当前优惠价 ¥18,999。',
    hasProduct: true
  },
  {
    role: 'ai',
    content:
      '或者推荐 ThinkPad X1 Carbon Gen 12，仅重 0.99kg，14英寸2.8K OLED屏幕，同样适合编程。¥12,499起。',
    hasProduct: true
  }
];

const aiQuestion = ref('');
const canAskAI = computed(() => aiQuestion.value.trim().length > 0);

const askAI = () => {
  if (!canAskAI.value) return;
  navigateTo({
    path: '/ai-page',
    query: { question: aiQuestion.value.trim() }
  });
};
</script>

<template>
  <section class="relative py-24 md:py-32 bg-canvas overflow-hidden content-visibility-auto">
    <!-- 背景光晕 -->
    <div
      class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"
    />
    <div
      class="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"
    />

    <div class="section-container relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <p
          class="section-header-label text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2"
        >
          <span>AI 赋能</span>
          <span class="i-lucide-sparkles text-sm animate-bounce" />
        </p>
        <h2 class="section-header-title">你的专属 AI 助手</h2>
        <p class="section-header-desc mx-auto">不只是聊天机器人，更是懂你的购物顾问</p>
      </div>

      <!-- 能力卡片 + 对话演示 -->
      <div class="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
        <!-- 左侧：能力特性 -->
        <div class="grid grid-cols-2 gap-4 md:gap-6">
          <div
            v-for="cap in aiCapabilities"
            :key="cap.title"
            class="group bg-surface-muted rounded-3xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-1 border border-line hover:border-pink-500/30 dark:hover:border-pink-400/30 shadow-sm hover:shadow-xl hover:shadow-pink-500/10"
          >
            <div
              class="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-6 shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-500"
            >
              <div
                :class="[
                  cap.icon,
                  'text-2xl text-fg group-hover:text-white transition-colors duration-300'
                ]"
              />
            </div>
            <!-- 能力标题 -->
            <h3 class="text-lg font-bold text-fg mb-2">
              {{ cap.title }}
            </h3>
            <p class="text-sm text-fg-muted leading-relaxed">
              {{ cap.desc }}
            </p>
          </div>
        </div>

        <!-- 右侧：对话演示 -->
        <div class="relative">
          <!-- 装饰背景 -->
          <div
            class="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-[40px] blur-3xl opacity-50 dark:opacity-30"
          />

          <div
            class="relative bg-surface rounded-[32px] overflow-hidden shadow-2xl border border-line backdrop-blur-xl"
          >
            <!-- 顶部栏 -->
            <div class="flex items-center gap-4 px-6 py-5 border-b border-line bg-surface-muted">
              <div class="relative">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
                >
                  <div class="i-carbon-sparkles text-white text-lg" />
                </div>
                <span
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-surface animate-pulse"
                />
              </div>
              <div>
                <p class="text-base font-bold text-fg">小星 AI</p>
                <p
                  class="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest"
                >
                  ONLINE NOW
                </p>
              </div>
            </div>

            <!-- 对话内容 -->
            <div class="px-6 py-6 space-y-6 max-h-[380px] overflow-y-auto custom-scrollbar">
              <div
                v-for="(msg, idx) in demoMessages"
                :key="idx"
                class="flex"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[85%] rounded-[20px] px-5 py-3.5 text-sm leading-relaxed shadow-sm"
                  :class="
                    msg.role === 'user'
                      ? 'bg-fg text-canvas rounded-br-none'
                      : 'bg-surface-muted text-fg rounded-bl-none border border-line'
                  "
                >
                  {{ msg.content }}
                  <div
                    v-if="msg.hasProduct"
                    class="mt-3 pt-3 border-t border-line flex items-center justify-between group/link cursor-pointer"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="i-carbon-shopping-cart text-xs text-purple-600 dark:text-purple-400"
                      />
                      <span class="text-xs font-bold text-purple-600 dark:text-purple-400"
                        >查看推荐商品</span
                      >
                    </div>
                    <div
                      class="i-carbon-chevron-right text-xs text-purple-600 dark:text-purple-400 transition-transform group-hover/link:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 输入框 -->
            <div class="px-6 pb-6 pt-2">
              <div
                class="flex items-center gap-3 bg-surface-muted rounded-2xl px-5 py-1 border border-line transition-all focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/5"
              >
                <input
                  v-model="aiQuestion"
                  type="text"
                  placeholder="试试问AI：推荐一款适合我的耳机..."
                  class="flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle outline-none"
                  @keydown.enter.prevent="askAI"
                />
                <button
                  class="w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-500"
                  :class="
                    canAskAI
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 active:scale-95'
                      : 'bg-surface-muted text-fg-subtle'
                  "
                  :disabled="!canAskAI"
                  @click="askAI"
                >
                  <div class="i-carbon-send-filled text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部CTA -->
      <div class="text-center mt-20">
        <NuxtLink
          to="/ai-page"
          class="inline-flex items-center gap-3 px-10 py-4 bg-fg text-canvas rounded-full text-sm font-bold hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-500 group"
        >
          <div class="i-lucide-sparkles text-lg group-hover:rotate-12 transition-transform" />
          立即体验 AI 助手
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 1000px;
}
</style>
