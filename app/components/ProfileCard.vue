<script setup lang="ts">
/**
 * 个人中心卡片容器：统一 bg-surface 圆角卡片 + 可选标题头
 * 头部左区默认渲染品牌竖条 + 标题，也可用 #header 插槽完全自定义；
 * 右区用 #actions 放操作按钮（编辑/保存/升级等）
 */
interface Props {
  /** 标题；传入后头部渲染品牌竖条 + 标题 */
  title?: string;
  /** 头部下方是否有分隔线 */
  bordered?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  bordered: true
});
</script>

<template>
  <div class="bg-surface ring-1 ring-line rounded-2xl shadow-sm overflow-hidden">
    <div
      v-if="title || $slots.header || $slots.actions"
      class="flex items-center justify-between gap-3 px-6 py-5"
      :class="bordered ? 'border-b border-line' : ''"
    >
      <div class="flex items-center gap-3 min-w-0">
        <template v-if="title">
          <span class="w-1 h-5 bg-skin rounded-full shrink-0" />
          <h2 class="text-base font-semibold text-fg truncate">{{ title }}</h2>
        </template>
        <slot name="header" />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </div>
</template>
