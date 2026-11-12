<script setup lang="ts">
import type { Banner } from '~/composables/api/home';
import { NuxtLink } from '#components';

const placeholderImage = '/images/blog-cover-placeholder.webp';

/**
 * 轮播数据契约：字段名照抄 Banner 接口，真实响应可直接传入（结构兼容，多余字段不影响赋值）。
 * banner 接口后续新增展示字段时，在这里补字段名 + 模板加一处消费即可。
 */
type CarouselItem = Pick<
  Banner,
  'id' | 'title' | 'description' | 'image_url' | 'link_type' | 'link_target' | 'created_at'
>;

const props = withDefaults(
  defineProps<{
    posts: CarouselItem[];
    pending?: boolean;
    failed?: boolean;
    /** hero：桌面端大号排版（博客页全宽）；compact：半栏小号排版 */
    size?: 'hero' | 'compact';
    headingTag?: 'h1' | 'h3';
  }>(),
  { size: 'hero', headingTag: 'h1' }
);
const emit = defineEmits<{ retry: [] }>();

/** 跳转链接：空串表示不可跳转（link_type=NONE 或未配 link_target），模板据此降级为静态容器 */
const postLink = (post: CarouselItem): string => {
  const target = post.link_target?.trim() || '';
  return !target || post.link_type?.toLowerCase() === 'none' ? '' : target;
};

const containerRef = useTemplateRef<HTMLElement>('containerRef');
const {
  index,
  interactive,
  dragOffset,
  goPrev,
  goNext,
  goTo,
  pause,
  resume,
  onPointerDown,
  onClickCapture
} = useStackedCarousel(() => props.posts.length);

// 按循环距离确定左右层级。只有两张时，额外显示同一张侧卡的左侧预览。
const visibleSlides = computed(() =>
  props.posts.flatMap((post, itemIndex) => {
    const count = props.posts.length;
    let offset = (itemIndex - index.value + count) % count;
    if (offset > count / 2) offset -= count;
    const depth = Math.abs(offset);
    const slide = {
      post,
      itemIndex,
      offset,
      mirrored: false,
      style: {
        '--offset': Math.max(-3, Math.min(3, offset)),
        '--scale': depth === 0 ? 1 : depth === 1 ? 0.8 : 0.64,
        zIndex: Math.max(0, 3 - depth),
        opacity: depth > 2 ? 0 : depth === 0 ? 1 : depth === 1 ? 0.65 : 0.4,
        visibility: depth > 2 ? ('hidden' as const) : ('visible' as const)
      }
    };
    if (count !== 2 || offset !== 1) return [slide];

    return [
      slide,
      { ...slide, mirrored: true, offset: -1, style: { ...slide.style, '--offset': -1 } }
    ];
  })
);
</script>

<template>
  <div
    ref="containerRef"
    class="stacked-carousel relative w-full isolate group"
    :class="[
      { 'is-interactive': interactive, 'has-two-slides': posts.length === 2 },
      `carousel-${size}`
    ]"
    role="region"
    aria-roledescription="轮播"
    aria-label="精选内容"
    @mouseenter="pause('hover')"
    @mouseleave="resume('hover')"
    @focusin="pause('focus')"
    @focusout="
      (event) => {
        if (!containerRef?.contains(event.relatedTarget as Node)) resume('focus');
      }
    "
    @keydown.left.prevent="goPrev"
    @keydown.right.prevent="goNext"
    @dragstart.prevent
  >
    <div
      v-if="posts.length === 0"
      class="carousel-empty absolute inset-0 overflow-hidden rounded-3xl bg-gray-900 text-white"
    >
      <UiImage
        :src="placeholderImage"
        alt=""
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div
        class="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10 md:p-6 md:pt-12"
      >
        <p class="text-sm font-medium" role="status">
          {{ pending ? '正在加载轮播…' : failed ? '轮播加载失败' : '暂无轮播内容' }}
        </p>
        <button
          v-if="failed && !pending"
          type="button"
          class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          @click="emit('retry')"
        >
          重试
        </button>
      </div>
    </div>

    <div
      v-if="posts.length > 0"
      class="carousel-stage"
      :style="{ '--drag': `${dragOffset}px` }"
      @pointerdown="onPointerDown"
      @click.capture="onClickCapture"
    >
      <template v-if="size === 'compact' && interactive">
        <button
          type="button"
          class="carousel-edge carousel-edge-prev"
          aria-label="上一张"
          @click="goPrev"
        ></button>
        <button
          type="button"
          class="carousel-edge carousel-edge-next"
          aria-label="下一张"
          @click="goNext"
        ></button>
      </template>
      <!-- 不可跳转的 banner 渲染为静态容器，避免空链接把用户带回列表页 -->
      <div
        v-for="slide in visibleSlides"
        :key="slide.mirrored ? `mirror-${slide.post.id}` : slide.post.id"
        class="carousel-card"
        :class="{
          'is-current': slide.offset === 0,
          'is-outer': Math.abs(slide.offset) === 2,
          'is-mirrored': slide.mirrored
        }"
        :style="slide.style"
        :aria-hidden="slide.mirrored || Math.abs(slide.offset) > 2 ? true : undefined"
      >
        <component
          :is="postLink(slide.post) === '' ? 'div' : NuxtLink"
          v-bind="postLink(slide.post) === '' ? undefined : { to: postLink(slide.post) }"
          class="absolute inset-0"
          :tabindex="slide.offset === 0 ? undefined : -1"
          :aria-hidden="slide.offset !== 0"
        >
          <!-- 底层背景图 -->
          <UiImage
            :src="slide.post.image_url"
            :fallback="placeholderImage"
            :alt="slide.post.title || '未命名'"
            :loading="slide.offset === 0 ? 'eager' : 'lazy'"
            :fetchpriority="slide.offset === 0 ? 'high' : 'auto'"
            decoding="async"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <!-- 叠加层: 渐变遮罩（底部深色向上渐变透明） -->
          <div
            class="carousel-shade absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          ></div>
          <!-- 叠加层: 标题与描述（多项时底部让位给指示点） -->
          <div
            class="carousel-caption absolute bottom-0 left-0 w-full"
            :aria-hidden="slide.offset !== 0"
          >
            <div class="carousel-date text-gray-300 font-medium">
              {{ formatDate(slide.post.created_at) }}
            </div>
            <component
              :is="slide.offset === 0 ? headingTag : 'span'"
              class="carousel-title font-bold text-white leading-tight line-clamp-2"
            >
              {{ slide.post.title || '未命名' }}
            </component>
            <p
              v-if="slide.post.description"
              class="carousel-description text-gray-300 line-clamp-2"
            >
              {{ slide.post.description }}
            </p>
          </div>
        </component>
        <button
          v-if="slide.offset !== 0 && Math.abs(slide.offset) <= 2"
          type="button"
          class="carousel-select absolute inset-0 w-full h-full"
          :aria-label="`查看第 ${slide.itemIndex + 1} 项：${slide.post.title || '未命名'}`"
          :tabindex="slide.mirrored ? -1 : undefined"
          @click="goTo(slide.itemIndex)"
        ></button>
      </div>
    </div>

    <template v-if="interactive">
      <div class="carousel-dots" aria-label="选择轮播内容">
        <button
          v-for="(post, dotIndex) in posts"
          :key="post.id"
          type="button"
          class="carousel-dot"
          :class="{ 'is-active': dotIndex === index }"
          :aria-current="dotIndex === index ? 'true' : undefined"
          :aria-label="`跳转到第 ${dotIndex + 1} 项`"
          @click="goTo(dotIndex)"
        >
          <span></span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stacked-carousel {
  min-width: 0;
  container-type: inline-size;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  padding: 6px 4px 0;
}
.is-interactive .carousel-card {
  cursor: grab;
  user-select: none;
}
.is-interactive .carousel-card:active {
  cursor: grabbing;
}
.carousel-stage {
  position: relative;
  touch-action: pan-y;
  overflow: hidden;
}
.carousel-card {
  position: absolute;
  top: 0;
  left: calc((100% - var(--card-width, 70%)) / 2);
  width: var(--card-width, 70%);
  height: 100%;
  overflow: hidden;
  border: 0;
  padding: 0;
  border-radius: 24px;
  background: var(--ui-bg, #f3f4f6);
  text-align: left;
  color: inherit;
  transform: translateX(calc(var(--offset) * var(--card-step, 19.5%) + var(--drag, 0px)))
    scale(var(--scale));
  transition:
    transform 600ms cubic-bezier(0.22, 0.68, 0, 1),
    opacity 600ms ease,
    visibility 600ms;
}
.carousel-edge {
  display: none;
}
.carousel-select {
  border: 0;
  background: transparent;
  cursor: pointer;
}
.carousel-card:not(.is-current) {
  cursor: pointer;
}
.carousel-caption,
.carousel-shade {
  transition: opacity 300ms;
}
.carousel-card:not(.is-current) .carousel-caption,
.carousel-card:not(.is-current) .carousel-shade {
  opacity: 0;
}
.carousel-caption {
  padding: clamp(12px, 3cqw, 28px);
}
.carousel-date {
  margin-bottom: 4px;
  font-size: 12px;
}
.carousel-title {
  font-size: clamp(15px, 3.1cqw, 36px);
  overflow-wrap: anywhere;
}
.carousel-compact .carousel-title {
  font-size: clamp(15px, 3.9cqw, 24px);
}
.carousel-description {
  margin-top: 6px;
  font-size: clamp(13px, 1.6cqw, 16px);
}
.carousel-dots {
  padding-top: 12px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.carousel-dot {
  display: grid;
  place-items: center;
  width: 18px;
  height: 36px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.carousel-dot span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d6d7dc;
  transition:
    background 200ms,
    transform 200ms;
}
.carousel-dot.is-active span {
  background: #8874ee;
  transform: scale(1.15);
}
.carousel-card:focus-within,
.carousel-select:focus-visible,
.carousel-edge:focus-visible,
.carousel-dot:focus-visible {
  outline: 2px solid #8874ee;
  outline-offset: -3px;
}
@container (width < 560px) {
  .carousel-description {
    display: none;
  }
}
@container (width < 420px) {
  .carousel-card {
    --card-width: 80%;
    --card-step: 20%;
    border-radius: 16px;
  }
  .carousel-card.is-outer,
  .carousel-date {
    display: none;
  }
}
@media (width >= 1024px) {
  .carousel-compact {
    padding: 0;
    --card-width: 76%;
    --card-step: 16.5%;
  }
  .carousel-compact.has-two-slides {
    --card-step: 20%;
  }
  .carousel-edge {
    display: block;
    position: absolute;
    inset-block: 0;
    width: 50%;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .carousel-edge-prev {
    inset-inline-start: 0;
  }
  .carousel-edge-next {
    inset-inline-end: 0;
  }
}
@media (pointer: coarse) {
  .carousel-dot {
    width: 28px;
    height: 32px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .carousel-card,
  .carousel-caption,
  .carousel-shade,
  .carousel-dot span {
    transition: none;
  }
}
</style>
