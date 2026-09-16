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
  <section class="relative py-24 md:py-32 bg-canvas overflow-hidden content-visibility-auto">
    <!-- 背景光晕 -->
    <div
      class="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"
    />
    <div
      class="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"
    />

    <div class="section-container relative z-10">
      <UiSectionHeader
        class="max-w-3xl mx-auto mb-16 md:mb-24"
        align="center"
        tone="accent"
        label="AI 助手"
        icon="i-lucide-sparkles"
        title="你的专属角色顾问"
        highlight="角色顾问"
        description="不只是聊天机器人，更是懂你的动漫角色百科全书"
      />

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
                  <!-- <div class="i-carbon- text-white text-lg" /> -->
                </div>
                <span
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-surface animate-pulse"
                />
              </div>
              <div>
                <p class="text-base font-bold text-fg">YouMi AI</p>
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
            <div class="px-6 pb-6 pt-2">
              <div
                class="flex items-center gap-3 bg-surface-muted rounded-2xl px-5 py-1 border border-line transition-all focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/5"
              >
                <input
                  v-model="aiQuestion"
                  type="text"
                  placeholder="试试问AI：推荐一个海贼王里的强力角色..."
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
