<script setup lang="ts">
type Value = string | number | null;
interface Option {
  value: Value;
  label: string;
  color?: string;
}
const props = defineProps<{
  label: string;
  options: Option[];
  selected: Value;
  subtle?: boolean;
  alwaysExpanded?: boolean;
}>();
const emit = defineEmits<{ select: [value: Value] }>();
const isOpen = ref(false);
const expanded = computed(() => props.alwaysExpanded || isOpen.value);
const page = ref(0);
const rows = shallowRef<Option[][]>([]);
const probe = useTemplateRef<HTMLElement>('probe');
const track = useTemplateRef<HTMLElement>('track');
const panelId = useId();
let observer: ResizeObserver | undefined;
let disposed = false;
const pages = computed(() => {
  if (!expanded.value || rows.value.length < 2) {
    return [[rows.value[0] ?? props.options.slice(0, 1)]];
  }
  return Array.from({ length: Math.ceil(rows.value.length / 2) }, (_, index) =>
    rows.value.slice(index * 2, index * 2 + 2)
  );
});
const pageCount = computed(() => pages.value.length);
const pageOffset = (index: number) => {
  const element = track.value;
  const child = element?.children[index] as HTMLElement | undefined;
  return child?.offsetLeft ?? 0;
};
const scrollToPage = (index: number, behavior: ScrollBehavior = 'instant') => {
  track.value?.scrollTo({ left: pageOffset(index), behavior });
};
const syncPage = () => {
  const element = track.value;
  if (!element || !expanded.value) return;
  const stride = pageOffset(1);
  page.value = stride ? Math.min(pageCount.value - 1, Math.round(element.scrollLeft / stride)) : 0;
};

const measure = () => {
  const element = probe.value;
  if (!element) return;
  const result: Option[][] = [];
  let previousTop = -1;
  Array.from(element.children).forEach((child, index) => {
    const top = (child as HTMLElement).offsetTop;
    if (top !== previousTop) {
      result.push([]);
      previousTop = top;
    }
    const option = props.options[index];
    if (option) result[result.length - 1]!.push(option);
  });
  rows.value = result;
  const target = Math.min(page.value, pageCount.value - 1);
  page.value = target;
  void nextTick(() => scrollToPage(target));
};
const changePage = (step: number) => {
  const target = Math.max(0, Math.min(pageCount.value - 1, page.value + step));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollToPage(target, reducedMotion ? 'instant' : 'smooth');
};
const toggle = async () => {
  isOpen.value = !isOpen.value;
  const selectedRow = expanded.value
    ? rows.value.findIndex((row) => row.some((option) => option.value === props.selected))
    : 0;
  const target = Math.max(0, Math.floor(selectedRow / 2));
  page.value = target;
  await nextTick();
  scrollToPage(target);
};
watch(
  () => props.options,
  async () => {
    await nextTick();
    measure();
  },
  { deep: true }
);
onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  if (probe.value) observer.observe(probe.value);
  void document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
});
onUnmounted(() => {
  disposed = true;
  observer?.disconnect();
});
</script>

<template>
  <section class="filter-panel" :class="{ subtle }" :aria-label="label">
    <div ref="probe" class="filter-probe" aria-hidden="true" inert>
      <span v-for="option in options" :key="String(option.value)" class="filter-chip">{{
        option.label
      }}</span>
    </div>
    <div
      :id="panelId"
      ref="track"
      class="filter-track"
      role="group"
      :aria-label="label"
      @scroll.passive="syncPage"
    >
      <div v-for="(visibleRows, pageIndex) in pages" :key="pageIndex" class="filter-content">
        <div v-for="(row, rowIndex) in visibleRows" :key="rowIndex" class="filter-row">
          <button
            v-for="option in row"
            :key="String(option.value)"
            type="button"
            class="filter-chip"
            :class="{ selected: selected === option.value }"
            :style="{ '--filter-color': option.color || '#8874ee' }"
            :aria-pressed="selected === option.value"
            :title="option.label"
            @click="emit('select', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="!alwaysExpanded && rows.length > 1" class="filter-controls">
      <button
        type="button"
        class="filter-control"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        @click="toggle"
      >
        {{ expanded ? '收起' : '展开' }}{{ label }}
        <span
          :class="expanded ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'"
          aria-hidden="true"
        ></span>
      </button>
      <div v-if="expanded && pageCount > 1" class="filter-pagination">
        <button
          type="button"
          class="filter-control"
          :disabled="page === 0"
          :aria-label="label + '上一页'"
          @click="changePage(-1)"
        >
          上一页
        </button>
        <span class="text-xs text-fg-subtle" aria-live="polite"
          >{{ page + 1 }} / {{ pageCount }}</span
        >
        <button
          type="button"
          class="filter-control"
          :disabled="page === pageCount - 1"
          :aria-label="label + '下一页'"
          @click="changePage(1)"
        >
          下一页
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.filter-panel {
  position: relative;
  min-width: 0;
}
.filter-probe,
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-probe {
  position: absolute;
  inset: 0 0 auto;
  visibility: hidden;
  pointer-events: none;
}
.filter-track {
  position: relative;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-block: 3px;
}
.filter-content {
  display: grid;
  gap: 8px;
  flex: 0 0 100%;
  min-width: 0;
  align-content: start;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.filter-chip {
  box-sizing: border-box;
  flex: 0 0 auto;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  background: var(--surface-muted, #f3f4f6);
  color: var(--fg-muted, #6b7280);
}
button.filter-chip {
  cursor: pointer;
}
.filter-chip.selected {
  background: var(--fg, #18181b);
  color: var(--canvas, white);
}
.subtle .filter-chip {
  padding: 5px 12px;
  font-size: 12px;
  background: transparent;
  border-color: var(--line, #e5e7eb);
}
.subtle .filter-chip.selected {
  background: var(--filter-color);
  border-color: transparent;
  color: white;
}
.filter-controls,
.filter-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-controls {
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 4px;
}
.filter-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 32px;
  padding: 4px;
  font-size: 12px;
  color: var(--fg-muted, #6b7280);
  cursor: pointer;
}
.filter-control:disabled {
  opacity: 0.35;
  cursor: default;
}
.filter-chip:focus-visible,
.filter-control:focus-visible {
  outline: 2px solid #8874ee;
  outline-offset: 2px;
}
</style>
