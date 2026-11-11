<script setup lang="ts">
import {
  useDocumentVisibility,
  useElementVisibility,
  useEventListener,
  useMediaQuery,
  useResizeObserver
} from '@vueuse/core';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useId,
  useTemplateRef,
  watch
} from 'vue';
import type { HeroKittenScene } from '~/utils/heroKittenScene';

const props = defineProps<{ pointerTarget: HTMLElement | null; dark: boolean }>();
const host = useTemplateRef<HTMLElement>('host');
const control = useTemplateRef<HTMLButtonElement>('control');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
const hintId = useId();
const renderState = shallowRef<'loading' | 'ready' | 'unavailable'>('loading');
const dragging = shallowRef(false);
const motion = useMediaQuery('(any-hover: hover) and (prefers-reduced-motion: no-preference)');
const visible = useElementVisibility(host);
const documentVisibility = useDocumentVisibility();
const canRender = computed(
  /** 只有可见且初始化完成的场景才提交绘制。 */
  () => visible.value && documentVisibility.value === 'visible' && renderState.value === 'ready'
);
const canAnimate = computed(
  /** 触屏与减少动态偏好保留静态正面，不影响页面滚动。 */
  () => canRender.value && motion.value && props.pointerTarget !== null
);
const fullTurn = Math.PI * 2;
let scene: HeroKittenScene | undefined;
let disposed = false;
let initialization = 0;
let frame = 0;
let previousTime = 0;
let inspecting = false;
let drag: { id: number; x: number; y: number; width: number; height: number } | undefined;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let targetYaw = 0;
let targetPitch = 0;
let currentYaw = 0;
let currentPitch = 0;

/** 获取父级首屏节点，模板引用变化时自动迁移鼠标监听。 */
function getPointerTarget() {
  return props.pointerTarget;
}

/** 获取当前主题，避免在模型内部订阅页面全局状态。 */
function getTheme() {
  return props.dark;
}

/** 对鼠标位置做对称归一化，并限制头部的最大转向。 */
function normalize(offset: number, range: number) {
  return Math.max(-1, Math.min(1, offset / range));
}

/** 限制俯仰角度，既能看见顶部和脚爪，也不会意外倒置。 */
function clampPitch(value: number) {
  return Math.max(-0.65, Math.min(0.65, value));
}

/** 直接更新关节与单帧绘制，不触发逐帧 Vue 组件渲染。 */
function paint() {
  if (disposed) return;
  scene?.setPose(currentX, currentY, currentYaw, currentPitch);
  if (host.value) {
    host.value.dataset.poseX = currentX.toFixed(3);
    host.value.dataset.poseY = currentY.toFixed(3);
    host.value.dataset.yaw = currentYaw.toFixed(3);
    host.value.dataset.pitch = currentPitch.toFixed(3);
    host.value.dataset.animating = String(frame !== 0);
  }
  if (canRender.value) scene?.render();
}

/** 松手或取消拖拽时释放捕获，保留最后的查看角度。 */
function finishDrag(event?: PointerEvent) {
  if (!drag || (event && event.pointerId !== drag.id)) return;
  const pointerId = drag.id;
  drag = undefined;
  dragging.value = false;
  if (control.value?.hasPointerCapture(pointerId)) control.value.releasePointerCapture(pointerId);
}

/** 离屏或失焦时停止调度；保留查看角度，减少动态时恢复静态正面。 */
function pause() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
  finishDrag();
  targetX = currentX = 0;
  targetY = currentY = 0;
  targetYaw = currentYaw;
  targetPitch = currentPitch;
  if (!motion.value) {
    targetYaw = currentYaw = 0;
    targetPitch = currentPitch = 0;
    inspecting = false;
  }
  paint();
}

/** 用时间无关的阻尼平滑转向与拖拽，收敛后完全停止动画调度。 */
function tick(now: number) {
  frame = 0;
  if (!canAnimate.value) return pause();
  const alpha = 1 - Math.exp(-Math.min(now - previousTime, 64) / 145);
  currentX += (targetX - currentX) * alpha;
  currentY += (targetY - currentY) * alpha;
  currentYaw += (targetYaw - currentYaw) * alpha;
  currentPitch += (targetPitch - currentPitch) * alpha;
  const settled =
    Math.max(
      Math.abs(targetX - currentX),
      Math.abs(targetY - currentY),
      Math.abs(targetYaw - currentYaw),
      Math.abs(targetPitch - currentPitch)
    ) < 0.001;
  if (settled) {
    currentX = targetX;
    currentY = targetY;
    currentPitch = targetPitch;
    // 连续转动多圈后压回等价角度，回正时不会绕着模型再转数圈。
    currentYaw = targetYaw - Math.round(targetYaw / fullTurn) * fullTurn;
    targetYaw = currentYaw;
  } else {
    previousTime = now;
    frame = requestAnimationFrame(tick);
  }
  paint();
}

/** 只在目标姿态变化且没有待执行帧时启动动画。 */
function requestTick() {
  if (
    !canAnimate.value ||
    frame ||
    (currentX === targetX &&
      currentY === targetY &&
      currentYaw === targetYaw &&
      currentPitch === targetPitch)
  ) {
    return;
  }
  previousTime = performance.now();
  frame = requestAnimationFrame(tick);
  if (host.value) host.value.dataset.animating = 'true';
}

/** 未进入查看模式时，小猫跟随鼠标轻微位移并转头。 */
function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !canAnimate.value || inspecting) return;
  const box = host.value?.getBoundingClientRect();
  if (!box?.width || !box.height) return;
  targetX = normalize(event.clientX - box.left - box.width / 2, box.width * 0.7);
  targetY = normalize(event.clientY - box.top - box.height * 0.4, box.height * 0.65);
  requestTick();
}

/** 离开首屏只收回跟随动作，不覆盖用户拖拽选定的视角。 */
function leave(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !canAnimate.value || drag) return;
  targetX = 0;
  targetY = 0;
  requestTick();
}

/** 仅鼠标左键启动旋转，捕获指针后移出模型也能安全结束拖拽。 */
function beginDrag(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !canAnimate.value) return;
  const element = control.value;
  if (!element?.clientWidth || !element.clientHeight) return;
  event.preventDefault();
  element.focus({ preventScroll: true });
  drag = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    width: element.clientWidth,
    height: element.clientHeight
  };
  dragging.value = true;
  inspecting = true;
  targetX = targetY = 0;
  element.setPointerCapture(event.pointerId);
  requestTick();
}

/** 左右拖动可连续旋转整圈，上下拖动在安全范围内调整俯仰。 */
function rotate(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.id || !canAnimate.value) return;
  targetYaw += ((event.clientX - drag.x) / drag.width) * fullTurn;
  targetPitch = clampPitch(targetPitch + ((event.clientY - drag.y) / drag.height) * Math.PI);
  drag.x = event.clientX;
  drag.y = event.clientY;
  requestTick();
}

/** 沿最短转向回到正面，回正后重新启用鼠标跟随。 */
function resetView() {
  if (!canAnimate.value) return;
  finishDrag();
  inspecting = false;
  targetX = targetY = 0;
  targetYaw = Math.round(currentYaw / fullTurn) * fullTurn;
  targetPitch = 0;
  requestTick();
}

/** 为不使用拖拽的访客提供方向键旋转，以及回正快捷键。 */
function handleKey(event: KeyboardEvent) {
  if (!canAnimate.value) return;
  switch (event.key) {
    case 'ArrowLeft':
      targetYaw -= Math.PI / 12;
      break;
    case 'ArrowRight':
      targetYaw += Math.PI / 12;
      break;
    case 'ArrowUp':
      targetPitch = clampPitch(targetPitch - 0.1);
      break;
    case 'ArrowDown':
      targetPitch = clampPitch(targetPitch + 0.1);
      break;
    case 'Home':
    case 'Enter':
    case ' ':
    case 'Escape':
      event.preventDefault();
      resetView();
      return;
    default:
      return;
  }
  event.preventDefault();
  inspecting = true;
  targetX = targetY = 0;
  requestTick();
}

/** 根据实际画布尺寸调整投影，像素密度上限为一点五倍。 */
function resize() {
  const element = canvas.value;
  if (!element?.clientWidth || !element.clientHeight || !scene) return;
  scene.resize(
    element.clientWidth,
    element.clientHeight,
    Math.min(window.devicePixelRatio || 1, 1.5)
  );
  paint();
}

/** 更换灯光后按需重绘，减少动态时也能正确切换主题。 */
function updateTheme(dark: boolean) {
  scene?.setTheme(dark);
  paint();
}

/** 挂载后才加载三维模块，SSR 不执行 WebGL；过期初始化不创建资源。 */
async function initialize() {
  const version = ++initialization;
  renderState.value = 'loading';
  try {
    const { createHeroKittenScene } = await import('~/utils/heroKittenScene');
    if (disposed || version !== initialization || !canvas.value) return;
    scene = createHeroKittenScene(canvas.value, props.dark);
    renderState.value = 'ready';
    resize();
  } catch {
    if (disposed || version !== initialization) return;
    scene?.dispose();
    scene = undefined;
    renderState.value = 'unavailable';
  }
}

/** 允许浏览器恢复丢失的绘图上下文，同时停止旧场景动画。 */
function loseContext(event: Event) {
  event.preventDefault();
  initialization++;
  renderState.value = 'unavailable';
  pause();
  scene?.dispose();
  scene = undefined;
}

/** 路由离开时释放模型缓冲区、着色器、指针捕获和动画帧。 */
function dispose() {
  disposed = true;
  initialization++;
  pause();
  scene?.dispose();
  scene = undefined;
}

useEventListener(getPointerTarget, 'pointermove', move, { passive: true });
useEventListener(getPointerTarget, ['pointerleave', 'pointercancel'], leave, { passive: true });
useEventListener(control, 'pointerdown', beginDrag);
useEventListener(control, 'pointermove', rotate, { passive: true });
useEventListener(control, ['pointerup', 'pointercancel', 'lostpointercapture'], finishDrag);
useEventListener('blur', pause);
useEventListener(canvas, 'webglcontextlost', loseContext);
useEventListener(canvas, 'webglcontextrestored', initialize);
useResizeObserver(canvas, resize);
watch([canAnimate, canRender, getPointerTarget], pause, { flush: 'post' });
watch(getTheme, updateTheme);
onMounted(initialize);
onBeforeUnmount(dispose);
</script>

<template>
  <div
    ref="host"
    class="hero-kitten"
    :class="{ 'hero-kitten--dark': dark }"
    data-pose-x="0.000"
    data-pose-y="0.000"
    data-yaw="0.000"
    data-pitch="0.000"
    data-animating="false"
    :data-dragging="dragging"
    :data-interactive="canAnimate"
    :data-render-state="renderState"
  >
    <span v-if="renderState === 'ready'" class="cat-shadow" aria-hidden="true" />
    <button
      ref="control"
      class="cat-control"
      type="button"
      :disabled="!canAnimate"
      aria-label="旋转查看三维小猫"
      :aria-describedby="hintId"
      title="左右拖动可旋转一周，上下拖动可俯仰；方向键旋转，Home 回正"
      @dblclick="resetView"
      @keydown="handleKey"
    >
      <canvas
        ref="canvas"
        class="cat-canvas"
        role="img"
        aria-label="戴浅紫围巾的奶油色三维小猫"
        :aria-hidden="renderState !== 'ready'"
      />
    </button>
    <p v-if="renderState !== 'ready'" :id="hintId" class="cat-status" role="status">
      {{ renderState === 'loading' ? '小猫正在赶来' : '当前环境暂时无法显示 3D 小猫' }}
    </p>
    <p v-else :id="hintId" class="cat-hint">
      {{ canAnimate ? '拖动旋转 · 双击回正' : '很高兴遇见你' }}
      <span v-if="canAnimate" class="sr-only">也可使用方向键旋转，按 Home 或 Enter 回正。</span>
    </p>
  </div>
</template>

<style scoped>
.hero-kitten {
  --cat-ink: #756782;
  --cat-shadow: rgb(78 53 97 / 18%);
  --cat-aura: 0.7;
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  pointer-events: none;
  user-select: none;
}

.hero-kitten::before {
  content: '';
  position: absolute;
  inset: 12% 4%;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 60% 38%, rgb(255 229 194 / 38%), transparent 64%),
    radial-gradient(ellipse at 35% 65%, rgb(216 180 254 / 24%), transparent 64%);
  filter: blur(18px);
  opacity: var(--cat-aura);
}

.cat-shadow {
  position: absolute;
  left: 32%;
  bottom: 14%;
  width: 38%;
  height: 4%;
  border-radius: 50%;
  background: var(--cat-shadow);
  filter: blur(8px);
}

.cat-control {
  position: absolute;
  inset: 0 0 6%;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 28%;
  background: transparent;
  cursor: grab;
  pointer-events: auto;
  touch-action: pan-y;
  -webkit-tap-highlight-color: transparent;
}

.cat-control:focus-visible {
  outline: 2px solid var(--cat-ink);
  outline-offset: 4px;
}

.cat-control:disabled {
  cursor: default;
  pointer-events: none;
}

.hero-kitten[data-dragging='true'] .cat-control {
  cursor: grabbing;
}

.cat-canvas {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cat-hint {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin: 0;
  color: var(--cat-ink);
  font-size: 11px;
  line-height: 1.6;
  letter-spacing: 0.09em;
  text-align: center;
}

.cat-status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 1.25rem;
  color: var(--cat-ink);
  font-size: 13px;
  line-height: 1.8;
  text-align: center;
}

.hero-kitten--dark {
  --cat-ink: #b9acc8;
  --cat-shadow: rgb(190 161 216 / 14%);
  --cat-aura: 0.32;
}
</style>
