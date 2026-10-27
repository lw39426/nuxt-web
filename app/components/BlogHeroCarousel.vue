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

/** 当前轨道指针（含克隆边缘，有效范围 1~posts.length） */
const current = ref(1);
/** 自动播放定时器句柄 */
let timer: ReturnType<typeof setInterval> | null = null;
/** 自动播放间隔（毫秒） */
const AUTO_PLAY_INTERVAL = 5000;
/** 轨道滑动动画时长（毫秒），须与模板里的 duration-700 保持一致 */
const SLIDE_DURATION = 700;
/** 滑动动画的兜底收尾定时器 */
let resetTimer: ReturnType<typeof setTimeout> | null = null;
/** 是否在瞬跳重置中（禁用过渡动画） */
const isResetting = ref(false);

/** 是否可交互切换（多于一篇时才显示箭头与指示点） */
const interactive = computed(() => props.posts.length > 1);

/** 当前真实索引（0~posts.length-1），用于指示点 */
const realIndex = computed(() => {
  if (current.value === 0) return props.posts.length - 1;
  if (current.value === props.posts.length + 1) return 0;
  return current.value - 1;
});

/** 克隆轨道：[末页克隆, ...原数据, 首页克隆] */
const clonedTrack = computed<BlogPost[]>(() => {
  if (props.posts.length === 0) return [];
  const first = props.posts[0]!;
  if (props.posts.length === 1) return [first, first, first];
  const last = props.posts[props.posts.length - 1]!;
  return [last, ...props.posts, first];
});

/** 切换到下一页（轨道指针+1） */
const next = () => {
  if (current.value >= props.posts.length + 1) return;
  current.value++;
};

/** 切换到上一页（轨道指针-1） */
const prev = () => {
  if (current.value <= 0) return;
  current.value--;
};

/** 轨道 DOM 引用（用于瞬跳时强制重排，提交无过渡基线） */
const trackRef = ref<HTMLElement | null>(null);

/**
 * 瞬跳到指定轨道位置（不播放动画）
 * 关键：仅设 transition:none 不够，必须在同一帧内强制重排，
 * 让浏览器把新位移提交为基线；否则恢复过渡后浏览器会把它当成
 * 一次位置变化而播放动画，从而出现"倒带掠过中间图片"。
 * @param target 目标轨道指针
 */
const jumpTo = (target: number) => {
  isResetting.value = true;
  current.value = target;
  nextTick(() => {
    // 强制重排：提交 transition:none + 新位移的基线
    void trackRef.value?.offsetWidth;
    isResetting.value = false;
  });
};

/** 跳转到指定真实索引（瞬跳，无动画） */
const goTo = (index: number) => {
  jumpTo(index + 1);
};

/**
 * 滑到克隆边缘页后瞬跳回对应的真实页。
 * 不能只依赖 transitionend：首张与末尾克隆内容相同，
 * 从首张滑到克隆页时计算后的 transform 没变化（0px → 0px），
 * 浏览器不产生过渡也就永不派发该事件，指针会卡在克隆页导致后续右滑无效。
 * 故以动画时长的定时器兜底，事件若先到则取消定时器重复收尾。
 */
const finishSlide = () => {
  if (resetTimer) {
    clearTimeout(resetTimer);
    resetTimer = null;
  }
  if (current.value === props.posts.length + 1) jumpTo(1);
  else if (current.value === 0) jumpTo(props.posts.length);
};

/** 轨道过渡动画结束时检查是否需要瞬跳到真实页（仅响应轨道自身的 transform） */
const onTrackTransitionEnd = (e: TransitionEvent) => {
  if (e.target !== trackRef.value || e.propertyName !== 'transform') return;
  if (current.value === 0 || current.value === props.posts.length + 1) finishSlide();
};

/** 箭头切换：滑动后同样需要克隆边缘的兜底收尾 */
const goPrev = () => {
  prev();
  scheduleFinish();
};
const goNext = () => {
  next();
  scheduleFinish();
};

/** 启动自动播放（单篇或空数据不启动；SSR 阶段禁止定时器，仅客户端生效） */
const startAutoPlay = () => {
  if (!import.meta.client || timer || !interactive.value) return;
  timer = setInterval(next, AUTO_PLAY_INTERVAL);
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
/** 本次手势是否发生了有效滑动（用于抑制紧随其后的 click 跳转） */
let swiped = false;
/** 实时拖拽偏移量（跟手反馈，松手归零） */
const dragOffset = ref(0);
/** 手势开始时的容器宽度（用于限制跟手位移范围） */
let dragWidth = 0;
/** 轮播容器引用 */
const containerRef = ref<HTMLElement | null>(null);

/** 手势开始：记录起点并暂停自动播放 */
const onDragStart = (x: number, y: number) => {
  dragStartX = x;
  dragStartY = y;
  swiped = false;
  dragOffset.value = 0;
  dragWidth = containerRef.value?.clientWidth || 0;
  stopAutoPlay();
};

/**
 * 为刚发起的一次滑动挂上兜底收尾。
 * 只有落在克隆边缘页（0 与 posts.length+1）时才需要：
 * 这些页与相邻真实页内容相同，transform 计算值不变 → 无 transitionend。
 */
const scheduleFinish = () => {
  if (resetTimer) clearTimeout(resetTimer);
  if (current.value !== 0 && current.value !== props.posts.length + 1) return;
  resetTimer = setTimeout(finishSlide, SLIDE_DURATION + 60);
};

/** 手势结束：水平位移超阈值且大于垂直位移时切换（避免干扰页面垂直滚动） */
const onDragEnd = (x: number, y: number) => {
  const dx = x - dragStartX;
  const dy = y - dragStartY;
  dragOffset.value = 0;
  if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    swiped = true;
    if (dx < 0) next();
    else prev();
    scheduleFinish();
  }
  startAutoPlay();
};

/** 根据当前指针位置计算跟手位移（水平主导时才生效，限制在容器宽度一半内） */
const applyDragOffset = (x: number, y: number) => {
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

/**
 * 轨道位移样式：
 * - 克隆轨道长度 = posts.length + 2，当前指针 1 对应真实首页
 * - 瞬跳重置时禁用过渡，实现无感跳转
 * - 拖拽跟手时禁用过渡保证即时响应
 */
const trackStyle = computed(() => ({
  transform: `translateX(calc(-${current.value * 100}% + ${dragOffset.value}px))`,
  transition: isResetting.value || dragOffset.value !== 0 ? 'none' : undefined
}));

// 数据异步到达后初始化指针并启动自动播放
watch(
  () => props.posts.length,
  (len) => {
    current.value = 1;
    if (len > 1) startAutoPlay();
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
  if (resetTimer) clearTimeout(resetTimer);
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

    <!-- 幻灯片轨道：克隆首尾实现无缝衔接 -->
    <div
      v-if="posts.length > 0"
      ref="trackRef"
      class="flex h-full transition-transform duration-700"
      :style="trackStyle"
      @transitionend="onTrackTransitionEnd"
    >
      <NuxtLink
        v-for="(post, idx) in clonedTrack"
        :key="`${post.id}-${idx}`"
        :to="`/blog/${post.code}`"
        class="relative w-full shrink-0"
        :aria-label="`第 ${idx} 张轮播图`"
      >
        <!-- 底层背景图 -->
        <UiImage
          :src="post.image"
          :alt="post.title"
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
            <span class="text-gray-300 font-medium">{{ post.date }}</span>
          </div>
          <h1
            class="font-bold text-white leading-tight group-hover:text-blue-200 transition-colors line-clamp-2"
            :class="
              size === 'hero'
                ? 'mb-2 md:mb-4 text-lg md:text-4xl lg:text-5xl'
                : 'mb-2 md:mb-3 text-lg md:text-2xl'
            "
          >
            {{ post.title }}
          </h1>
          <p
            class="text-gray-300 line-clamp-2"
            :class="
              size === 'hero'
                ? 'mb-3 md:mb-6 text-[13px] md:text-lg'
                : 'mb-3 md:mb-4 text-[13px] md:text-sm'
            "
          >
            {{ post.excerpt }}
          </p>
          <div class="flex items-center gap-2.5 md:gap-3">
            <UiImage
              :src="post.author?.avatar"
              :alt="post.author?.name || ''"
              class="rounded-full border-2 border-white/20 object-cover"
              :class="size === 'hero' ? 'h-7 w-7 md:h-10 md:w-10' : 'h-7 w-7 md:h-8 md:w-8'"
              variant="avatar"
            />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-white">{{ post.author?.name || '' }}</span>
              <span class="text-xs text-gray-400">{{ post.author?.role }}</span>
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

      <!-- 底部指示点（基于真实索引，当前项拉伸为胶囊）。
           居中用 inset-x-0 + justify-center，不用 left-1/2 + -translate-x-1/2：
           Tailwind v4 写 translate 属性、UnoCSS 写 transform 属性，两者叠加会把元素左推半个身位 -->
      <div class="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
        <button
          v-for="(post, index) in posts"
          :key="`dot-${post.id}`"
          class="h-2 rounded-full transition-all"
          :class="index === realIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'"
          :aria-label="`跳转到第 ${index + 1} 篇`"
          @click.prevent="goTo(index)"
        ></button>
      </div>
    </template>

    <!-- 叠加层: 边框效果（圆角跟随父级传入的形状） -->
    <div
      class="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
    ></div>
  </div>
</template>
