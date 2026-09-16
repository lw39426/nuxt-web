<script setup lang="ts">
/**
 * 个人中心通用信息行：左侧图标盒 + 标题/副文本，右侧操作
 * 用于账号绑定、安全设置等同构行；最后一行自动去底边框
 */
interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  /** 副文本颜色类 */
  subtitleClass?: string;
  /** 图标盒底色类 */
  iconBg?: string;
  /** 图标颜色类 */
  iconColor?: string;
  /** 图标盒圆角：xl=圆角方形 full=圆形 */
  iconShape?: 'xl' | 'full';
  /** 右侧操作文案；传入后渲染默认文字按钮并触发 action 事件，也可用 #action 插槽自定义 */
  actionText?: string;
  /** 操作文字颜色类 */
  actionClass?: string;
  /** 行 hover 高亮 */
  hoverable?: boolean;
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  subtitleClass: 'text-fg-subtle',
  iconBg: 'bg-surface-muted',
  iconColor: 'text-fg-muted',
  iconShape: 'xl',
  actionText: '',
  actionClass: 'text-skin',
  hoverable: true
});

defineEmits<{ action: [] }>();
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 px-6 py-4 border-b border-line last:border-b-0 transition-colors"
    :class="hoverable ? 'hover:bg-surface-muted/50' : ''"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-10 h-10 flex items-center justify-center shrink-0"
        :class="[iconBg, iconShape === 'full' ? 'rounded-full' : 'rounded-xl']"
      >
        <span class="w-5 h-5" :class="[icon, iconColor]" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-fg truncate">{{ title }}</p>
        <p v-if="subtitle" class="text-xs mt-0.5 truncate" :class="subtitleClass">{{ subtitle }}</p>
      </div>
    </div>
    <div class="shrink-0">
      <slot name="action">
        <button
          v-if="actionText"
          type="button"
          class="text-sm hover:scale-95 transition-transform duration-100"
          :class="actionClass"
          @click="$emit('action')"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>
