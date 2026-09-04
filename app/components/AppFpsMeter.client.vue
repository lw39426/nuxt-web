<script setup lang="ts">
/**
 * 右上角实时 FPS 显示面板（仅开发环境挂载）。
 *
 * 性能考量：
 * 1. rAF 回调内只做整数自增，不读取布局、不写 DOM；
 * 2. 每满 1 秒才更新一次显示，且直接写 textContent / style，
 *    绕过 Vue 响应式与虚拟 DOM diff，避免每秒触发组件重渲染；
 * 3. 元素为 fixed + pointer-events-none，不参与布局也不拦截交互。
 */
const fpsTextRef = ref<HTMLElement | null>(null);

let rafId = 0;

/** 依据帧率返回对应的文字颜色，直观区分流畅 / 一般 / 掉帧 */
const colorOf = (fps: number): string => {
  if (fps >= 55) return '#4ade80';
  if (fps >= 30) return '#fbbf24';
  return '#f87171';
};

onMounted(() => {
  let frames = 0;
  let last = performance.now();

  /** 逐帧计数，每秒结算一次并直接写入 DOM */
  const tick = () => {
    frames++;
    const now = performance.now();
    const elapsed = now - last;

    if (elapsed >= 1000) {
      const fps = Math.round((frames * 1000) / elapsed);
      const el = fpsTextRef.value;
      if (el) {
        el.textContent = `${fps} FPS`;
        el.style.color = colorOf(fps);
      }
      frames = 0;
      last = now;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    class="fixed top-2 right-2 z-[9999] pointer-events-none select-none rounded-md bg-black/70 px-2 py-1 font-mono text-xs leading-none tabular-nums"
    aria-hidden="true"
  >
    <span ref="fpsTextRef" style="color: #4ade80">-- FPS</span>
  </div>
</template>
