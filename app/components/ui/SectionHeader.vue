<script setup lang="ts">
interface Props {
  /** 楼层主标题 */
  title: string;
  /** 标题末尾需要着色强调的片段（必须与 title 尾部一致才能命中） */
  highlight?: string;
  /** 眉题：楼层小标签 */
  label?: string;
  /** 眉题图标（UnoCSS 图标类名，如 i-lucide-sparkles） */
  icon?: string;
  /** 楼层描述 */
  description?: string;
  /** 强调色系：brand=品牌绿，accent=强调紫，muted=弱化灰 */
  tone?: 'brand' | 'accent' | 'muted';
  /**
   * 布局：left=左侧标题区+右侧 #actions 操作区（默认），
   * center=整块居中（标题区之外的插槽不渲染）
   */
  align?: 'left' | 'center';
}

const props = withDefaults(defineProps<Props>(), {
  highlight: '',
  label: '',
  icon: '',
  description: '',
  tone: 'brand',
  align: 'left'
});

const toneClasses = {
  brand: { label: 'text-brand', emphasized: 'text-brand' },
  accent: { label: 'text-accent', emphasized: 'text-accent' },
  muted: { label: 'text-fg-subtle', emphasized: 'text-fg' }
} as const;

/** 拆出标题尾部的高亮片段，交给模板着色；不匹配则整句原样渲染 */
const titleParts = computed(() => {
  if (props.highlight && props.title.endsWith(props.highlight)) {
    return {
      lead: props.title.slice(0, -props.highlight.length),
      emphasized: props.highlight
    };
  }
  return { lead: props.title, emphasized: '' };
});
</script>

<template>
  <div
    :class="
      align === 'center'
        ? 'text-center'
        : 'flex flex-col md:flex-row md:items-end md:justify-between gap-6'
    "
  >
    <div :class="align === 'center' ? 'flex flex-col items-center' : 'max-w-2xl'">
      <!-- 眉题：楼层标记（胶囊造型与全站标签/按钮的圆角语言一致） -->
      <p
        v-if="label"
        class="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
        :class="toneClasses[tone].label"
      >
        <span>{{ label }}</span>
        <slot name="label-icon">
          <span v-if="icon" :class="icon" class="text-sm" aria-hidden="true" />
        </slot>
      </p>

      <!-- 楼层标题 -->
      <h2
        class="mt-5 text-[2rem] md:text-[2.75rem] leading-[1.15] font-bold tracking-[-0.03em] text-fg transition-colors"
      >
        {{ titleParts.lead
        }}<span v-if="titleParts.emphasized" :class="toneClasses[tone].emphasized">{{
          titleParts.emphasized
        }}</span>
      </h2>

      <!-- 楼层描述 -->
      <p v-if="description" class="mt-4 text-base md:text-lg leading-relaxed text-fg-muted">
        {{ description }}
      </p>
    </div>

    <!-- 右侧操作区（仅 left 布局）：如「查看全部」入口、楼层筛选项 -->
    <div v-if="align === 'left' && $slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
