<script setup lang="ts">
const aiCapabilities = [
  {
    icon: 'i-carbon-chat-bot',
    title: '角色问答',
    desc: '随时解答你对动漫角色的各种疑问，从能力到背景故事'
  },
  {
    icon: 'i-carbon-recommend',
    title: '智能推荐',
    desc: '根据你的喜好和浏览历史，推荐你可能喜欢的角色'
  },
  {
    icon: 'i-carbon-visual-recognition',
    title: '角色识别',
    desc: '上传图片即可识别角色信息，快速找到你想了解的角色'
  },
  {
    icon: 'i-carbon-chart-line',
    title: '角色对比',
    desc: '多维度对比不同角色的各项属性，帮你找出最强角色'
  }
];

const demoMessages = [
  { role: 'user', content: '推荐一些海贼王里的强力角色' },
  {
    role: 'ai',
    content: '推荐蒙奇·D·路飞，四皇之一，橡胶果实能力者，人气评分 9.8。目前已觉醒尼卡形态。',
    hasProduct: true
  },
  {
    role: 'ai',
    content: '或者罗罗诺亚·索隆，草帽团剑士，三刀流高手，战力评分 9.2。正在修炼霸王色霸气。',
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
  <section class="relative py-14 md:py-32 bg-canvas overflow-hidden content-visibility-auto">
    <!-- 背景光晕 -->
    <div
      class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"
    />
    <div
      class="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"
    />

    <div class="section-container relative z-10">
      <UiSectionHeader
        class="max-w-3xl mx-auto mb-6 md:mb-24"
        align="center"
        tone="accent"
        label="AI 助手"
        icon="i-lucide-sparkles"
        title="你的专属角色顾问"
        highlight="角色顾问"
        description="不只是聊天机器人，更是懂你的动漫角色百科全书"
      />

      <!-- 对话演示 + 能力索引 -->
      <div class="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <!-- 能力特性：移动端为发丝分隔的索引清单，桌面端恢复 2×2 卡片 -->
        <div class="order-2 grid grid-cols-1 gap-0 md:order-none md:grid-cols-2 md:gap-6">
          <p
            class="flex items-center gap-2 pb-1 text-[14px] font-bold uppercase tracking-[0.22em] text-fg-subtle md:hidden"
          >
            <span class="h-px w-3 bg-line" aria-hidden="true" />
            能力索引
            <span class="h-px w-3 bg-line" aria-hidden="true" />
          </p>
          <template v-for="cap in aiCapabilities" :key="cap.title">
            <div class="h-px bg-line/70 md:hidden" aria-hidden="true" />
            <div
              class="group flex items-start gap-3 py-4 md:block md:rounded-3xl md:border md:border-line md:bg-surface-muted md:p-8 md:shadow-sm md:transition-all md:duration-500 md:hover:-translate-y-1 md:hover:border-pink-500/30 md:hover:shadow-xl md:hover:shadow-pink-500/10 dark:md:hover:border-pink-400/30"
            >
              <div
                class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/10 dark:text-purple-300 md:mt-0 md:mb-6 md:h-14 md:w-14 md:rounded-2xl md:bg-surface md:text-fg md:shadow-sm md:ring-0 md:transition-all md:duration-500 md:group-hover:bg-pink-500 md:group-hover:text-white"
              >
                <div :class="[cap.icon, 'text-xl md:text-2xl']" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-[15px] font-bold leading-snug text-fg md:mb-2 md:text-lg">
                  {{ cap.title }}
                </h3>
                <p
                  class="mt-1 text-[13px] leading-[1.65] text-fg-muted md:mt-0 md:text-sm md:leading-relaxed"
                >
                  {{ cap.desc }}
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- 对话演示：移动端前置为楼层主视觉，桌面端保持右侧 -->
        <div class="relative order-1 md:order-none">
          <!-- 装饰背景 -->
          <div
            class="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-[40px] blur-3xl opacity-50 dark:opacity-30"
          />

          <div
            class="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl backdrop-blur-xl md:rounded-[32px]"
          >
            <!-- 顶部栏 -->
            <div
              class="flex items-center gap-3 border-b border-line bg-surface-muted px-4 py-4 md:gap-4 md:px-6 md:py-5"
            >
              <div class="relative">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20"
                >
                  <div class="i-carbon-chat-bot text-lg text-white" aria-hidden="true" />
                </div>
                <span
                  class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-surface bg-green-500"
                />
              </div>
              <div class="min-w-0">
                <p class="text-base font-bold text-fg">小星 AI</p>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600 dark:text-green-400"
                >
                  ONLINE NOW
                </p>
              </div>
            </div>

            <!-- 对话内容：移动端完整展开，避免卡片内二次滚动 -->
            <div
              class="custom-scrollbar max-h-none space-y-5 overflow-y-auto px-4 py-5 md:max-h-[380px] md:space-y-6 md:px-6 md:py-6"
            >
              <div
                v-for="(msg, idx) in demoMessages"
                :key="idx"
                class="flex items-start gap-2"
                :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  v-if="msg.role === 'ai'"
                  class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm md:hidden"
                  aria-hidden="true"
                >
                  <div class="i-carbon-chat-bot text-[13px]" />
                </div>
                <div
                  class="max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-sm md:px-5 md:py-3.5"
                  :class="
                    msg.role === 'user'
                      ? 'bg-fg text-canvas rounded-br-none'
                      : 'bg-surface-muted text-fg border border-line'
                  "
                >
                  {{ msg.content }}
                  <div
                    v-if="msg.hasProduct"
                    class="group/link mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-purple-500/10 px-3 py-2 md:rounded-none md:border-t md:border-line md:bg-transparent md:px-0 md:pb-0 md:pt-3"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="i-carbon-user-profile text-xs text-purple-600 dark:text-purple-400"
                      />
                      <span class="text-xs font-bold text-purple-600 dark:text-purple-400"
                        >查看角色详情</span
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
            <div class="px-4 pb-5 pt-2 md:px-6 md:pb-6">
              <div
                class="flex items-center gap-2 rounded-2xl border border-line bg-surface-muted px-4 py-1 transition-all focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/5 md:gap-3 md:px-5"
              >
                <input
                  v-model="aiQuestion"
                  type="text"
                  placeholder="试试问AI：推荐一个海贼王里的强力角色..."
                  class="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle md:text-sm"
                  aria-label="向 AI 提问"
                  @keydown.enter.prevent="askAI"
                />
                <button
                  type="button"
                  class="flex h-8 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-500 md:h-8 md:w-10 md:rounded-xl"
                  :class="
                    canAskAI
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 active:scale-95'
                      : 'bg-surface text-fg-subtle md:bg-surface-muted'
                  "
                  :disabled="!canAskAI"
                  aria-label="发送问题"
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
      <div class="text-center mt-10 md:mt-20">
        <NuxtLink
          to="/ai-page"
          class="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-fg px-10 py-4 text-sm font-bold text-canvas transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 md:w-auto"
        >
          <div class="i-lucide-sparkles text-lg group-hover:rotate-12 transition-transform" />
          开始探索角色
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
