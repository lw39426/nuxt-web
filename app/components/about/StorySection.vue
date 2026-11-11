<script setup lang="ts">
import { ref } from 'vue';
import { useStoryScroll } from '~/composables/useStoryScroll';

// 人物三个切面数据：身份 / 信念 / 表达；主句按字幕行保留自然换行。
const scenes = [
  {
    number: '01',
    title: '以代码为语言',
    label: '身份 / IDENTITY',
    quoteLines: ['把复杂留给自己，', '把清晰留给使用的人。'],
    detail: '全栈开发者 · 创意工程师',
    symbol: '{ }'
  },
  {
    number: '02',
    title: '以设计为视角',
    label: '信念 / BELIEF',
    quoteLines: ['技术应当服务于人，', '而非相反。'],
    detail: '在代码与设计的交汇处寻找平衡。',
    symbol: '◯'
  },
  {
    number: '03',
    title: '以好奇为线索',
    label: '表达 / EXPRESSION',
    quoteLines: ['代码是诗，设计是画。'],
    detail: '我用技术讲述每一个故事。',
    symbol: '∗'
  }
];

const storyScene = ref<HTMLElement | null>(null);
useStoryScroll(storyScene);
</script>

<template>
  <section
    ref="storyScene"
    aria-labelledby="story-heading"
    class="story-scene relative z-10 pt-14 pb-6 md:pt-16 px-4 md:px-8 box-border overflow-hidden"
  >
    <!-- 背景水印 -->
    <div
      class="absolute font-['Space_Mono',monospace] text-[clamp(5rem,15vw,15rem)] font-bold text-black/[0.03] dark:text-white/[0.02] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none tracking-wider"
      aria-hidden="true"
    >
      STORY
    </div>

    <div class="relative z-10 max-w-[1200px] mx-auto">
      <!-- 标题区：宽屏合为一行，把视口空间留给卡片正文 -->
      <header
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-4 mb-3 md:mb-5"
      >
        <div class="min-w-0">
          <div
            class="font-['Space_Mono',monospace] text-xs tracking-[0.2em] text-purple-600 dark:text-purple-400 mb-3 uppercase"
          >
            Character Study / 人物的三个切面
          </div>
          <h2
            id="story-heading"
            class="font-['Noto_Serif_SC',serif] text-[clamp(2rem,3.2vw,3.2rem)] font-bold leading-[1.2] text-gray-900 dark:text-white"
          >
            镜头靠近，<br class="md:hidden" />
            <span
              class="bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent"
            >
              故事展开。
            </span>
          </h2>
        </div>
        <p
          class="shrink-0 font-['Space_Mono',monospace] text-xs tracking-[0.12em] text-black/50 dark:text-white/50"
        >
          继续滚动，翻阅人物卡片 ↓
        </p>
      </header>

      <!-- 启用固定动效时叠放三张卡片。 -->
      <div class="story-stage grid grid-cols-1 gap-6 relative">
        <article
          v-for="scene in scenes"
          :key="scene.number"
          class="story-card group relative flex flex-col min-w-0 p-5 md:p-8 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm transition-colors duration-300 hover:border-purple-500 dark:hover:border-purple-400 overflow-hidden"
        >
          <!-- 内容独立于卡面，退到背层时仍保留完整卡片轮廓。 -->
          <div class="story-card-content flex flex-1 flex-col min-w-0">
            <!-- 顶部：标签与序号 -->
            <div
              class="flex items-center justify-between gap-3 font-['Space_Mono',monospace] text-[0.7rem] tracking-[0.15em] text-black/50 dark:text-white/50"
            >
              <span>{{ scene.label }}</span>
              <span class="shrink-0">{{ scene.number }} / 03</span>
            </div>

            <!-- 主体：正文优先，小屏隐藏不承载信息的装饰符号 -->
            <div
              class="story-card-body flex-1 grid md:grid-cols-[minmax(0,1fr)_0.5fr] gap-6 items-center py-6"
            >
              <div class="story-card-copy min-w-0">
                <h3
                  class="story-subtitle font-['Noto_Serif_SC',serif] text-sm font-normal text-purple-600 dark:text-purple-400 mb-4"
                >
                  {{ scene.title }}
                </h3>
                <p
                  class="font-['Noto_Serif_SC',serif] text-[clamp(1.5rem,2.5vw,2.2rem)] leading-[1.6] text-gray-900 dark:text-gray-100"
                >
                  <span v-for="line in scene.quoteLines" :key="line" class="story-subtitle block">
                    {{ line }}
                  </span>
                </p>
                <p
                  class="story-subtitle mt-4 text-sm text-black/60 dark:text-white/60 leading-[1.8] font-light"
                >
                  {{ scene.detail }}
                </p>
              </div>
              <div
                class="hidden md:block text-[clamp(3rem,6vw,6rem)] leading-none text-purple-500/25 dark:text-purple-400/25 text-center select-none"
                aria-hidden="true"
              >
                {{ scene.symbol }}
              </div>
            </div>

            <!-- 底部：署名，三张卡片保持同一基线 -->
            <div
              class="flex items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/10 font-['Space_Mono',monospace] text-[0.65rem] tracking-[0.15em] text-black/50 dark:text-white/50"
            >
              <span>入梦 / RU MENG</span>
              <span>CHARACTER STUDY</span>
            </div>
          </div>
        </article>
      </div>

      <!-- 仅在实际启用固定切换时显示，由动效上下文统一恢复 -->
      <div
        class="story-progress hidden h-[2px] mt-5 bg-black/10 dark:bg-white/10"
        aria-hidden="true"
      >
        <span class="block h-full w-full bg-purple-500 dark:bg-purple-400 origin-left scale-x-0" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.story-stage[data-layout='stacked'] {
  isolation: isolate;
  /* 为前景左右错位、倾角和背卡露边留出空间，不测量或固定舞台高度。 */
  padding: 32px clamp(32px, 4vw, 56px) 64px;
}

.story-stage[data-layout='stacked'] .story-card {
  /* 不透明底层阻断背卡文字，保留玻璃感的柔和色泽与高光。 */
  background: linear-gradient(135deg, var(--accent-soft), transparent 55%), var(--surface);
  box-shadow:
    0 18px 36px -24px color-mix(in srgb, var(--overlay) 70%, transparent),
    0 4px 10px -6px color-mix(in srgb, var(--overlay) 40%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--fg) 6%, transparent);
  will-change: transform;
}

@media (width < 900px) {
  .story-stage[data-layout='stacked'] {
    padding: 12px 10px 44px;
  }

  .story-stage[data-layout='stacked'] .story-card {
    padding: 16px;
    backdrop-filter: none;
  }

  .story-stage[data-layout='stacked'] .story-card-body {
    padding-block: 16px;
  }

  .story-stage[data-layout='stacked'] .story-card-copy > p:first-of-type {
    font-size: clamp(1.25rem, 5.5vw, 1.5rem);
  }
}
</style>
