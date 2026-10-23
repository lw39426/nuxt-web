<script setup lang="ts">
import { useCompareStore, MAX_COMPARE } from '~/stores/compare';

/**
 * 全局悬浮对比栏
 * - 有角色加入对比时在页面底部浮现，展示已选角色与「开始对比」入口
 * - /compare 页自身隐藏（页面内已有完整操作）
 * - ClientOnly 挂载（依赖 localStorage 恢复的客户端状态）
 */
const compareStore = useCompareStore();
const route = useRoute();

/** 悬浮条展开状态：默认收起为小胶囊，点击展开 */
const expanded = ref(false);

/** 对比页自身不显示悬浮栏 */
const hidden = computed(() => route.path === '/compare' || compareStore.items.length === 0);

/** 初始化时恢复 localStorage 持久化的对比列表（幂等，SSR 安全） */
compareStore.restore();
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-8 opacity-0"
  >
    <!--
      居中方式必须用 flex 布局而非 left-1/2 + -translate-x-1/2：
      Tailwind v4 与 UnoCSS 会为 -translate-x-1/2 各生成一条规则，
      前者写 translate 属性、后者写 transform 属性，属性不同互不覆盖，
      导致阴影位移被叠加成 -100%（元素整体左偏半个身位）。
    -->
    <div
      v-if="!hidden"
      class="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center px-4 pointer-events-none"
    >
      <!-- 展开态：已选列表 + 操作 -->
      <div
        v-if="expanded"
        class="pointer-events-auto w-fit max-w-full bg-surface/95 backdrop-blur border border-line rounded-2xl shadow-xl px-5 py-4"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-fg">
            对比栏（{{ compareStore.items.length }}/{{ MAX_COMPARE }}）
          </span>
          <div class="flex items-center gap-2">
            <button
              class="text-xs text-fg-subtle hover:text-fg transition-colors"
              @click="compareStore.clear()"
            >
              清空
            </button>
            <button
              class="w-6 h-6 rounded-full bg-elevated text-fg-muted hover:text-fg flex items-center justify-center transition-colors"
              aria-label="收起对比栏"
              @click="expanded = false"
            >
              <div class="i-carbon-chevron-down text-xs" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <!-- 已选角色槽位（含空槽占位） -->
          <div
            v-for="i in MAX_COMPARE"
            :key="i"
            :class="[
              'h-9 px-3 rounded-full flex items-center justify-center text-xs font-medium border',
              i <= compareStore.items.length
                ? 'bg-skin-solid border-transparent'
                : 'bg-surface-muted text-fg-subtle border-dashed border-line'
            ]"
          >
            <template v-if="i <= compareStore.items.length">
              <span class="max-w-24 truncate">{{ compareStore.items[i - 1]!.name }}</span>
              <button
                class="ml-1.5 w-4 h-4 rounded-full hover:text-red-500 flex items-center justify-center transition-colors"
                :aria-label="`移除 ${compareStore.items[i - 1]!.name}`"
                @click="compareStore.remove(compareStore.items[i - 1]!.code)"
              >
                <div class="i-carbon-close text-[10px]" />
              </button>
            </template>
            <div v-else class="i-carbon-add text-fg-subtle" />
          </div>
          <NuxtLink
            to="/compare"
            class="ml-auto px-5 py-2 bg-skin-solid text-xs font-medium rounded-full hover:opacity-90 transition-opacity"
            :class="compareStore.items.length < 2 ? 'pointer-events-none opacity-50' : ''"
          >
            开始对比
          </NuxtLink>
        </div>
      </div>

      <!-- 收起态：小胶囊 -->
      <button
        v-else
        class="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-skin-solid rounded-full hover:opacity-95 transition-opacity"
        @click="expanded = true"
      >
        <div class="i-carbon-compare text-base" />
        <span class="text-xs font-medium"
          >对比 {{ compareStore.items.length }}/{{ MAX_COMPARE }}</span
        >
        <div class="i-carbon-chevron-up text-xs" />
      </button>
    </div>
  </Transition>
</template>
