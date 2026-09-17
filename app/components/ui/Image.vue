<script setup lang="ts">
import { AVATAR_PLACEHOLDER, IMAGE_PLACEHOLDER } from '~/utils/image';

/**
 * 带兜底的图片组件
 * ------------------------------------------------------------
 * - src 为空或加载失败时展示占位图（data URI，不会再触发 error）
 * - variant 决定默认占位图；fallback 可指定自定义兜底图地址
 * - darkFallback 用于暗色模式下的兜底图（如 logo、loading 图），
 *   组件会自动渲染两张图并通过 dark:hidden / dark:block 显隐，
 *   避免 SSR 与客户端首帧的水合 mismatch
 * - 提供 #fallback 插槽时，空源/加载失败改渲染插槽内容
 *   （如博客作者头像降级为首字母块）
 * - class / loading / decoding 等属性显式透传给内部 img；
 *   渲染 #fallback 插槽时由插槽内容自行负责样式与属性
 */
interface Props {
  /** 图片地址；为空或加载失败时展示兜底 */
  src?: string | null;
  alt?: string;
  /** 兜底图类型：image=商品/封面等常规图，avatar=用户头像 */
  variant?: 'image' | 'avatar';
  /** 自定义兜底图地址（优先于 variant 默认占位图） */
  fallback?: string;
  /** 暗色模式下的兜底图地址；提供时自动启用双图显隐 */
  darkFallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  variant: 'image',
  fallback: '',
  darkFallback: ''
});

// 关闭自动继承，改为在内部 img 上显式绑定 $attrs
defineOptions({ inheritAttrs: false });

const failed = ref(false);

// 是否处于兜底态（空源或加载失败）
const shouldShowFallback = computed(() => !props.src || failed.value);

// 兜底图地址（light 版本）
const resolvedFallback = computed(
  () => props.fallback || (props.variant === 'avatar' ? AVATAR_PLACEHOLDER : IMAGE_PLACEHOLDER)
);

/** 换图后重置失败状态，允许重新加载真实图片 */
watch(
  () => props.src,
  () => {
    failed.value = false;
  }
);

function onError() {
  // 已处于兜底态仍触发 error（理论上 data URI 不会）时直接忽略，避免无限循环
  if (failed.value) return;
  failed.value = true;
}
</script>

<template>
  <!-- 正常图片 -->
  <img
    v-if="!shouldShowFallback"
    :src="src || undefined"
    :alt="alt"
    v-bind="$attrs"
    @error="onError"
  />

  <!-- 兜底态：需要双图显暗色适配 -->
  <template v-else-if="darkFallback">
    <img :src="resolvedFallback" :alt="alt" class="dark:hidden" v-bind="$attrs" />
    <img :src="darkFallback" :alt="alt" class="hidden dark:block" v-bind="$attrs" />
  </template>

  <!-- 兜底态：插槽兜底（博客头像等） -->
  <slot v-else-if="$slots.fallback" name="fallback" />

  <!-- 兜底态：单图兜底（无暗色适配、无插槽） -->
  <img v-else :src="resolvedFallback" :alt="alt" v-bind="$attrs" />
</template>
