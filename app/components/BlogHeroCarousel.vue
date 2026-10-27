<script setup lang="ts">
import type { BlogPost } from '~/types/blog';

const props = withDefaults(
  defineProps<{
    posts: BlogPost[];
    /** hero：桌面端大号排版（博客页全宽）；compact：半栏小号排版 */
    size?: 'hero' | 'compact';
  }>(),
  { size: 'hero' }
);

/** 窗口式轨道中的一格：slot 0 / 1 / 2 对应上一张 / 当前 / 下一张 */
type Slide = { post: BlogPost; slot: 0 | 1 | 2 };

/** 当前逻辑索引，恒在 0 ~ posts.length-1；循环靠取模，不靠克隆边缘 */
const index = ref(0);
/** 切换阶段：idle 静止于 -100%，next 动画到 -200%，prev 动画到 0% */
const phase = ref<'idle' | 'next' | 'prev'>('idle');
/** 自动播放定时器句柄 */
let timer: ReturnType<typeof setInterval> | null = null;
/** 自动播放间隔（毫秒） */
const AUTO_PLAY_INTERVAL = 5000;

/** 是否可交互切换（多于一篇时才显示箭头与指示点） */
const interactive = computed(() => props.posts.length > 1);

/**
 * 窗口式轨道：DOM 恒为 [上一张, 当前, 下一张]，静止位固定 -100%。
 * 每次只位移一张，落点后轮转内容并瞬跳回中间，
 * 因此不存在克隆页，也不存在 0 / n+1 这类可卡死的中间态。
 */
const visibleSlides = computed<Slide[]>(() => {
  const n = props.posts.length;
  if (n === 0) return [];
  if (n === 1) return [{ post: props.posts[0]!, slot: 1 }];
  return [
    { post: props.posts[(index.value - 1 + n) % n]!, slot: 0 },
    { post: props.posts[index.value]!, slot: 1 },
    { post: props.posts[(index.value + 1) % n]!, slot: 2 }
  ];
});

/** 轨道 DOM 引用（瞬跳时强制重排用） */
const trackRef = ref<HTMLElement | null>(null);
/** 轮播容器引用 */
const containerRef = ref<HTMLElement | null>(null);
/** 是否在瞬跳重置中（禁用过渡） */
const isResetting = ref(false);
/** 实时拖拽偏移量（跟手反馈，松手归零） */
const dragOffset = ref(0);

/** 静止位置：多篇时中间槽居中（-100%），单篇时无需位移 */
const restingOffset = computed(() => (props.posts.length > 1 ? 1 : 0));
/** 轨道当前槽位：动画期指向目标槽，静止期回到中间槽 */
const trackOffset = computed(() => {
  if (phase.value === 'next') return 2;
  if (phase.value === 'prev') return 0;
  return restingOffset.value;
});

/** 轨道位移：跟手拖拽与瞬跳重置时禁用过渡，其余交给类上的 duration-700 */
const trackStyle = computed(() => ({
  transform: `translateX(calc(-${trackOffset.value * 100}% + ${dragOffset.value}px))`,
  transition: isResetting.value || dragOffset.value !== 0 ? 'none' : undefined
}));

/**
 * 落点收尾：索引取模前进/后退一格，内容轮转后瞬跳回 -100%。
 * 落点前后视口里是同一篇文章的同一位置，瞬跳不可见。
 */
const settle = () => {
  if (phase.value === 'idle') return;
  const n = props.posts.length;
  if (n < 2) {
    phase.value = 'idle';
    return;
  }
  const step = phase.value === 'next' ? 1 : -1;
  isResetting.value = true;
  phase.value = 'idle';
  index.value = (index.value + step + n) % n;
  nextTick(() => {
    // 强制重排：提交 transition:none + -100% 的基线，再恢复过渡
    void trackRef.value?.offsetWidth;
    isResetting.value = false;
  });
};

/** 轨道过渡结束即落点；每次位移恰好一张，过渡必然发生 */
const onTrackTransitionEnd = (e: TransitionEvent) => {
  if (e.target !== trackRef.value || e.propertyName !== 'transform') return;
  settle();
};

/** 启动一次单张位移动画；动画期间的切换输入一律忽略 */
const startSlide = (direction: 'next' | 'prev') => {
  if (!interactive.value || phase.value !== 'idle') return;
  dragOffset.value = 0;
  phase.value = direction;
};

const goPrev = () => startSlide('prev');
const goNext = () => startSlide('next');

/** 指示点：原地轮转内容（静止位仍是 -100%，无需动画） */
const goTo = (target: number) => {
  if (phase.value !== 'idle' || target === index.value) return;
  index.value = target;
};

/** 启动自动播放（单篇或空数据不启动；SSR 阶段禁止定时器，仅客户端生效） */
const startAutoPlay = () => {
  if (!import.meta.client || timer || !interactive.value) return;
  timer = setInterval(() => startSlide('next'), AUTO_PLAY_INTERVAL);
};

/** 停止自动播放 */
const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// ---------- 滑动 / 拖拽切换 ----------
/** 滑动切换阈值（像素）：水平位移超过该值才触发切换 */
const SWIPE_THRESHOLD = 50;
/** 滑动起点坐标 */
let dragStartX = 0;
let dragStartY = 0;
/** 鼠标是否处于按住拖拽中（触摸不需要，touchend 必然触发） */
let isDragging = false;
/** 本次手势是否被接受（动画期间开始的手势直接忽略） */
let dragActive = false;
/** 本次手势是否发生了有效滑动（用于抑制紧随其后的 click 跳转） */
let swiped = false;
/** 手势开始时的容器宽度（用于限制跟手位移范围） */
let dragWidth = 0;

/** 手势开始：记录起点并暂停自动播放；动画进行中不接受新手势 */
const onDragStart = (x: number, y: number) => {
  if (phase.value !== 'idle' || !interactive.value) {
    dragActive = false;
    return;
  }
  dragActive = true;
  dragStartX = x;
  dragStartY = y;
  swiped = false;
  dragOffset.value = 0;
  dragWidth = containerRef.value?.clientWidth || 0;
  stopAutoPlay();
};

/** 手势结束：水平位移超阈值且大于垂直位移时切换（避免干扰页面垂直滚动） */
const onDragEnd = (x: number, y: number) => {
  if (!dragActive) return;
  dragActive = false;
  const dx = x - dragStartX;
  const dy = y - dragStartY;
  dragOffset.value = 0;
  if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    swiped = true;
    startSlide(dx < 0 ? 'next' : 'prev');
  }
  startAutoPlay();
};

/** 根据当前指针位置计算跟手位移（水平主导时才生效，限制在容器宽度一半内） */
const applyDragOffset = (x: number, y: number) => {
  if (!dragActive) return;
  const dx = x - dragStartX;
  const dy = y - dragStartY;
  if (Math.abs(dx) <= Math.abs(dy)) return;
  const max = dragWidth / 2 || 300;
  dragOffset.value = Math.max(-max, Math.min(max, dx));
};

/** 触摸开始 */
const onTouchStart = (e: TouchEvent) => {
  const t = e.touches[0];
  if (t) onDragStart(t.clientX, t.clientY);
};

/** 触摸移动：跟手反馈 */
const onTouchMove = (e: TouchEvent) => {
  const t = e.touches[0];
  if (t) applyDragOffset(t.clientX, t.clientY);
};

/** 触摸结束 */
const onTouchEnd = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (t) onDragEnd(t.clientX, t.clientY);
};

/** 鼠标按下（拖拽起点） */
const onMouseDown = (e: MouseEvent) => {
  isDragging = true;
  onDragStart(e.clientX, e.clientY);
};

/** 全局鼠标移动：拖拽中实时更新跟手位移 */
const onMouseMoveGlobal = (e: MouseEvent) => {
  if (!isDragging) return;
  applyDragOffset(e.clientX, e.clientY);
};

/** 全局鼠标抬起兜底（鼠标拖出容器释放也能正确结束手势） */
const onMouseUpGlobal = (e: MouseEvent) => {
  if (!isDragging) return;
  isDragging = false;
  onDragEnd(e.clientX, e.clientY);
};

/** 滑动后的第一次点击不跳转（防止松手误触 slide 链接） */
const onClickCapture = (e: MouseEvent) => {
  if (swiped) {
    e.preventDefault();
    e.stopPropagation();
    swiped = false;
  }
};

// 数据异步到达后归零到首篇；空数据或单篇时停止自动播放
watch(
  () => props.posts.length,
  (len) => {
    index.value = 0;
    phase.value = 'idle';
    isResetting.value = false;
    dragOffset.value = 0;
    if (len > 1) startAutoPlay();
    else stopAutoPlay();
  },
  { immediate: true }
);

// 挂载/卸载时绑定/解绑全局鼠标监听；SSR 已带数据的场景（如首页）在挂载后补启自动播放
onMounted(() => {
  window.addEventListener('mousemove', onMouseMoveGlobal);
  window.addEventListener('mouseup', onMouseUpGlobal);
  startAutoPlay();
});
onUnmounted(() => {
  stopAutoPlay();
  window.removeEventListener('mousemove', onMouseMoveGlobal);
  window.removeEventListener('mouseup', onMouseUpGlobal);
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full overflow-hidden isolate transform-gpu group"
    :class="interactive ? 'cursor-grab active:cursor-grabbing select-none' : ''"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @dragstart.prevent
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onMouseDown"
    @click.capture="onClickCapture"
  >
    <!-- 数据未加载时的默认占位（保持容器比例，避免布局塌陷） -->
    <div
      v-if="posts.length === 0"
      class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="i-carbon-image text-8xl text-white/10"></div>
      </div>
    </div>

    <!-- 窗口式轨道：始终只有 [上一张, 当前, 下一张] 三格，循环靠取模 -->
    <div
      v-if="posts.length > 0"
      ref="trackRef"
      class="flex h-full transition-transform duration-700"
      :style="trackStyle"
      @transitionend="onTrackTransitionEnd"
    >
      <NuxtLink
        v-for="slide in visibleSlides"
        :key="slide.slot"
        :to="`/blog/${slide.post.code}`"
        class="relative w-full shrink-0"
        :aria-hidden="slide.slot === 1 ? undefined : 'true'"
        :tabindex="slide.slot === 1 ? undefined : -1"
        :aria-label="`第 ${((index + slide.slot - 1 + posts.length) % posts.length) + 1} 篇`"
      >
        <!-- 底层背景图 -->
        <UiImage
          :src="slide.post.image"
          :alt="slide.post.title"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- 叠加层: 渐变遮罩（底部深色向上渐变透明） -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        ></div>
        <!-- 叠加层: 文章内容（多篇时底部让位给指示点） -->
        <div
          class="absolute bottom-0 left-0 w-full"
          :class="[
            size === 'hero' ? 'p-4 md:p-12 md:w-2/3' : 'p-4 md:p-6 md:w-5/6',
            interactive ? 'pb-10' : ''
          ]"
        >
          <div
            :class="
              size === 'hero' ? 'text-xs md:text-sm mb-1.5 md:mb-3' : 'text-xs mb-1.5 md:mb-2'
            "
          >
            <span class="text-gray-300 font-medium">{{ slide.post.date }}</span>
          </div>
          <h1
            class="font-bold text-white leading-tight group-hover:text-blue-200 transition-colors line-clamp-2"
            :class="
              size === 'hero'
                ? 'mb-2 md:mb-4 text-lg md:text-4xl lg:text-5xl'
                : 'mb-2 md:mb-3 text-lg md:text-2xl'
            "
          >
            {{ slide.post.title }}
          </h1>
          <p
            class="text-gray-300 line-clamp-2"
            :class="
              size === 'hero'
                ? 'mb-3 md:mb-6 text-[13px] md:text-lg'
                : 'mb-3 md:mb-4 text-[13px] md:text-sm'
            "
          >
            {{ slide.post.excerpt }}
          </p>
          <div class="flex items-center gap-2.5 md:gap-3">
            <UiImage
              :src="slide.post.author?.avatar"
              :alt="slide.post.author?.name || ''"
              class="rounded-full border-2 border-white/20 object-cover"
              :class="size === 'hero' ? 'h-7 w-7 md:h-10 md:w-10' : 'h-7 w-7 md:h-8 md:w-8'"
              variant="avatar"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white">{{ slide.post.author?.name || '' }}</span>
              <span class="text-xs text-gray-400">{{ slide.post.author?.role }}</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- 左右切换箭头（悬停容器时浮现）。垂直居中用 inset-y-0 + items-center，理由同指示点 -->
    <template v-if="interactive">
      <div class="absolute inset-y-0 left-4 z-20 flex items-center">
        <button
          class="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="上一张"
          @click.prevent="goPrev"
        >
          <div class="i-carbon-chevron-left w-6 h-6"></div>
        </button>
      </div>
      <div class="absolute inset-y-0 right-4 z-20 flex items-center">
        <button
          class="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="下一张"
          @click.prevent="goNext"
        >
          <div class="i-carbon-chevron-right w-6 h-6"></div>
        </button>
      </div>

      <!-- 底部指示点（基于逻辑索引，当前项拉伸为胶囊）。
           居中用 inset-x-0 + justify-center，不用 left-1/2 + -translate-x-1/2：
           Tailwind v4 写 translate 属性、UnoCSS 写 transform 属性，两者叠加会把元素左推半个身位 -->
      <div class="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
        <button
          v-for="(post, dotIndex) in posts"
          :key="`dot-${post.id}`"
          class="h-2 rounded-full transition-all"
          :class="dotIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'"
          :aria-label="`跳转到第 ${dotIndex + 1} 篇`"
          @click.prevent="goTo(dotIndex)"
        ></button>
      </div>
    </template>

    <!-- 叠加层: 边框效果（圆角跟随父级传入的形状） -->
    <div
      class="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
    ></div>
  </div>
</template>
