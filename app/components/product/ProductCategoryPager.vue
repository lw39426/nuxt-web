<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import type { ProductCategory } from '~/types/product';

const props = defineProps<{ categories: ProductCategory[]; selectedCategoryId: number | null }>();
const emit = defineEmits<{ select: [id: number | null] }>();

const pageSize = 10;
const entries = computed(() => [{ id: null, name: '全部', image: '' }, ...props.categories]);
const pages = computed(() =>
  Array.from({ length: Math.ceil(entries.value.length / pageSize) }, (_, index) =>
    entries.value.slice(index * pageSize, (index + 1) * pageSize)
  )
);
const selectedPage = computed(() =>
  Math.max(
    0,
    Math.floor(entries.value.findIndex(({ id }) => id === props.selectedCategoryId) / pageSize)
  )
);
const track = useTemplateRef<HTMLDivElement>('track');
const currentPage = shallowRef(0);

function syncPage() {
  const element = track.value;
  if (!element?.clientWidth || !window.matchMedia('(max-width: 767px)').matches) return;
  currentPage.value = Math.min(
    pages.value.length - 1,
    Math.round(element.scrollLeft / element.clientWidth)
  );
}

function goTo(page: number, smooth = false) {
  const element = track.value;
  if (!element?.clientWidth || !window.matchMedia('(max-width: 767px)').matches) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollTo({
    left: page * element.clientWidth,
    behavior: smooth && !reduceMotion ? 'smooth' : 'instant'
  });
  if (!smooth || reduceMotion) currentPage.value = page;
}

watch(selectedPage, (page) => goTo(page), { flush: 'post' });
useResizeObserver(track, () => goTo(selectedPage.value));
</script>

<template>
  <div role="group" aria-label="按作品分类筛选">
    <div ref="track" class="category-track" @scroll.passive="syncPage">
      <div v-for="(page, index) in pages" :key="index" class="category-page">
        <button
          v-for="entry in page"
          :key="entry.id ?? 'all'"
          type="button"
          class="category-entry"
          :aria-pressed="entry.id === selectedCategoryId"
          @click="emit('select', entry.id)"
        >
          <span class="category-art" aria-hidden="true">
            <UiImage
              v-if="entry.id !== null && entry.image"
              :src="entry.image"
              alt=""
              loading="lazy"
              class="h-full w-full object-contain"
            >
              <template #fallback><span class="i-lucide-layers h-5 w-5" /></template>
            </UiImage>
            <span
              v-else
              :class="entry.id === null ? 'i-carbon-grid' : 'i-lucide-layers'"
              class="h-5 w-5 md:h-8 md:w-8"
            />
          </span>
          <span class="category-name">{{ entry.name }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="pages.length > 1"
      class="category-pagination md:hidden"
      role="group"
      aria-label="分类分页"
    >
      <button
        v-for="(_, index) in pages"
        :key="index"
        type="button"
        :aria-label="`分类第 ${index + 1} 页`"
        :aria-current="index === currentPage ? 'page' : undefined"
        @click="goTo(index, true)"
      >
        <span />
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-track {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-track::-webkit-scrollbar {
  display: none;
}

.category-entry {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.375rem 0.125rem;
  border-radius: 0.75rem;
  color: var(--fg-muted);
  cursor: pointer;
}

.category-entry:focus-visible,
.category-pagination button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.category-entry[aria-pressed='true'] {
  background: var(--brand-soft);
  color: var(--fg);
  font-weight: 600;
}

.category-art {
  display: grid;
  width: clamp(2rem, 10vw, 2.75rem);
  height: clamp(2rem, 10vw, 2.75rem);
  place-items: center;
  overflow: hidden;
  border-radius: 0.65rem;
  background: var(--surface);
}

.category-name {
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  overflow-wrap: anywhere;
  font-size: 0.75rem;
  line-height: 1.15;
  text-align: center;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.category-pagination {
  display: flex;
  justify-content: center;
  margin-top: 0.125rem;
}

.category-pagination button {
  display: grid;
  width: 2rem;
  height: 1.75rem;
  place-items: center;
  border-radius: 999px;
  cursor: pointer;
}

.category-pagination button span {
  width: 0.375rem;
  height: 0.3125rem;
  border-radius: 999px;
  background: var(--line-strong);
}

.category-pagination button[aria-current='page'] span {
  width: 1rem;
  background: var(--accent);
}

@media (max-width: 767px) {
  .category-track {
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
  }

  .category-page {
    display: grid;
    min-width: 0;
    flex: 0 0 100%;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    align-content: start;
    gap: 0.35rem 0.2rem;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
}

@media (min-width: 768px) {
  .category-track {
    justify-content: space-between;
    gap: 0.5rem;
  }

  .category-page {
    display: contents;
  }

  .category-entry {
    min-width: 5rem;
  }

  .category-art {
    width: 4.5rem;
    height: 4.5rem;
    background: transparent;
  }

  .category-pagination {
    display: none;
  }
}
</style>
