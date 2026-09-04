<script setup lang="ts">
import { AVATAR_PLACEHOLDER, IMAGE_PLACEHOLDER } from '~/utils/image';

/**
 * 带兜底的图片组件
 * ------------------------------------------------------------
 * - src 为空或加载失败时展示占位图（data URI，不会再触发 error）
 * - variant 决定默认占位图；fallback 可指定自定义兜底图地址
 * - 提供 #fallback 插槽时，空源/加载失败改渲染插槽内容
 *   （如博客作者头像降级为首字母块）
 * - class / loading / decoding 等属性透传给内部 img
 */
interface Props {
  /** 图片地址；为空或加载失败时展示兜底 */
  src?: string | null;
  alt?: string;
  /** 兜底图类型：image=商品/封面等常规图，avatar=用户头像 */
  variant?: 'image' | 'avatar';
  /** 自定义兜底图地址（优先于 variant 默认占位图） */
  fallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  variant: 'image',
  fallback: ''
});

const failed = ref(false);

const resolvedSrc = computed(() => {
  if (!props.src || failed.value) {
    return props.fallback || (props.variant === 'avatar' ? AVATAR_PLACEHOLDER : IMAGE_PLACEHOLDER);
  }
  return props.src;
});

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
  <slot v-if="$slots.fallback && (!src || failed)" name="fallback" />
  <img v-else :src="resolvedSrc" :alt="alt" @error="onError" />
</template>
