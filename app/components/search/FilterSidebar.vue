<script setup lang="ts">
import type { FilterState } from '~/types/search';
import { PRICE_MAX, PRICE_MIN } from '~/utils/searchMock';

/** 筛选状态：v-model 双向绑定，子组件以整体替换方式更新（保持单向数据流） */
const filters = defineModel<FilterState>({ required: true });

interface Props {
  /** 隐藏内部标题（移动端抽屉已有自己的标题，避免重复） */
  hideTitle?: boolean;
}

withDefaults(defineProps<Props>(), { hideTitle: false });

/** 标签快捷选项（与 mock 数据池的标签匹配） */
const TAG_OPTIONS = ['Vue3', 'Nuxt4', 'TypeScript', '机械键盘', '显示器', '降噪'];

const typeOptions: { value: 'product' | 'article'; label: string }[] = [
  { value: 'product', label: '产品' },
  { value: 'article', label: '文章' }
];

const ratingOptions: { value: number | null; label: string }[] = [
  { value: 4.5, label: '⭐⭐⭐⭐⭐ 4.5分以上' },
  { value: 4, label: '⭐⭐⭐⭐ 4分以上' },
  { value: null, label: '全部' }
];

const allTypesChecked = computed(() => filters.value.types.length === 0);

function toggleType(value: 'product' | 'article') {
  const current = filters.value.types;
  // 全部勾选等价于「全部」，归一为空数组
  const next = current.includes(value) ? current.filter((t) => t !== value) : [...current, value];
  filters.value = { ...filters.value, types: next.length === 2 ? [] : next };
}

function clearTypes() {
  filters.value = { ...filters.value, types: [] };
}

/* ---------- 价格区间：输入框 + 双滑块 ---------- */
const loNum = shallowRef(filters.value.priceRange[0]);
const hiNum = shallowRef(filters.value.priceRange[1]);
const loText = shallowRef(String(filters.value.priceRange[0]));
const hiText = shallowRef(String(filters.value.priceRange[1]));

// 外部（胶囊删除 / 清空筛选）变更时回同步本地控件
watch(
  () => filters.value.priceRange,
  ([lo, hi]) => {
    loNum.value = lo;
    hiNum.value = hi;
    loText.value = String(lo);
    hiText.value = String(hi);
  }
);

const fillStyle = computed(() => {
  const span = PRICE_MAX - PRICE_MIN;
  const left = ((loNum.value - PRICE_MIN) / span) * 100;
  const width = ((hiNum.value - loNum.value) / span) * 100;
  return { left: `${left}%`, width: `${width}%` };
});

// 双滑块重叠时让最小值滑块可拖拽
const loSliderStyle = computed(() => ({
  zIndex: hiNum.value - loNum.value < (PRICE_MAX - PRICE_MIN) * 0.08 ? 5 : 3
}));

function commitPriceInputs() {
  let lo = Math.min(Math.max(Number(loText.value) || PRICE_MIN, PRICE_MIN), PRICE_MAX);
  let hi = Math.min(Math.max(Number(hiText.value) || PRICE_MAX, PRICE_MIN), PRICE_MAX);
  if (lo > hi) [lo, hi] = [hi, lo];
  loText.value = String(lo);
  hiText.value = String(hi);
  loNum.value = lo;
  hiNum.value = hi;
  filters.value = { ...filters.value, priceRange: [lo, hi] };
}

function onSliderChange() {
  loText.value = String(loNum.value);
  hiText.value = String(hiNum.value);
  filters.value = { ...filters.value, priceRange: [loNum.value, hiNum.value] };
}

/* ---------- 评分（单选）与标签（多选） ---------- */
function setRating(value: number | null) {
  filters.value = { ...filters.value, rating: value };
}

function toggleTag(tag: string) {
  const next = filters.value.tags.includes(tag)
    ? filters.value.tags.filter((t) => t !== tag)
    : [...filters.value.tags, tag];
  filters.value = { ...filters.value, tags: next };
}
</script>

<template>
  <!-- 筛选器白色卡片容器：桌面端为左侧 sticky 侧栏，移动端复用于底部抽屉 -->
  <aside class="bg-surface rounded-2xl p-5 space-y-6">
    <h2 v-if="!hideTitle" class="text-[15px] font-semibold text-fg">筛选条件</h2>

    <!-- 模块 1：内容类型 -->
    <fieldset>
      <legend class="text-[13px] font-bold text-fg mb-2">内容类型</legend>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2.5 text-sm text-fg cursor-pointer select-none">
          <input
            type="checkbox"
            class="w-4 h-4 accent-brand cursor-pointer"
            :checked="allTypesChecked"
            aria-label="内容类型：全部"
            @change="clearTypes"
          />
          全部
        </label>
        <label
          v-for="opt in typeOptions"
          :key="opt.value"
          class="flex items-center gap-2.5 text-sm text-fg cursor-pointer select-none"
        >
          <input
            type="checkbox"
            class="w-4 h-4 accent-brand cursor-pointer"
            :checked="filters.types.includes(opt.value)"
            :aria-label="`内容类型：${opt.label}`"
            @change="toggleType(opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </fieldset>

    <!-- 模块 2：价格区间（输入框 + 可视化双滑块） -->
    <fieldset>
      <legend class="text-[13px] font-bold text-fg mb-2">价格区间</legend>
      <div class="flex items-center gap-2">
        <input
          v-model="loText"
          type="number"
          inputmode="numeric"
          class="w-[70px] h-9 px-2 bg-canvas border border-line rounded-lg text-[13px] text-fg outline-none focus:border-brand"
          :placeholder="`¥${PRICE_MIN}`"
          aria-label="最低价格"
          @keydown.enter="commitPriceInputs"
          @blur="commitPriceInputs"
        />
        <span class="text-fg-subtle">-</span>
        <input
          v-model="hiText"
          type="number"
          inputmode="numeric"
          class="w-[70px] h-9 px-2 bg-canvas border border-line rounded-lg text-[13px] text-fg outline-none focus:border-brand"
          :placeholder="`¥${PRICE_MAX}`"
          aria-label="最高价格"
          @keydown.enter="commitPriceInputs"
          @blur="commitPriceInputs"
        />
      </div>
      <!-- 双滑块：两条透明 range 叠加在可视化轨道上，仅拇指可交互 -->
      <div class="price-range relative h-4 mt-4">
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-line rounded-full" />
        <div
          class="absolute top-1/2 -translate-y-1/2 h-1 bg-brand rounded-full pointer-events-none"
          :style="fillStyle"
        />
        <input
          v-model.number="loNum"
          type="range"
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full"
          :min="PRICE_MIN"
          :max="PRICE_MAX"
          step="10"
          :style="loSliderStyle"
          aria-label="最低价格滑块"
          @change="onSliderChange"
        />
        <input
          v-model.number="hiNum"
          type="range"
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full z-[4]"
          :min="PRICE_MIN"
          :max="PRICE_MAX"
          step="10"
          aria-label="最高价格滑块"
          @change="onSliderChange"
        />
      </div>
    </fieldset>

    <!-- 模块 3：评分（单选） -->
    <fieldset>
      <legend class="text-[13px] font-bold text-fg mb-2">评分</legend>
      <div class="flex flex-col gap-2">
        <label
          v-for="opt in ratingOptions"
          :key="String(opt.value)"
          class="flex items-center gap-2.5 text-sm text-fg cursor-pointer select-none"
        >
          <input
            type="radio"
            name="search-rating"
            class="w-4 h-4 accent-brand cursor-pointer"
            :checked="filters.rating === opt.value"
            :aria-label="`评分：${opt.label}`"
            @change="setRating(opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </fieldset>

    <!-- 模块 4：标签（多选胶囊） -->
    <fieldset>
      <legend class="text-[13px] font-bold text-fg mb-2">标签</legend>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in TAG_OPTIONS"
          :key="tag"
          class="px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer border"
          :class="
            filters.tags.includes(tag)
              ? 'bg-brand-soft text-brand border-brand'
              : 'bg-surface-muted text-fg-muted border-transparent hover:text-fg'
          "
          :aria-pressed="filters.tags.includes(tag)"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </fieldset>
  </aside>
</template>

<style scoped>
.price-range input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  background: transparent;
  pointer-events: none;
  margin: 0;
}
.price-range input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: auto;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: var(--surface);
  border: 2px solid var(--brand);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  cursor: grab;
}
.price-range input[type='range']::-moz-range-thumb {
  pointer-events: auto;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: var(--surface);
  border: 2px solid var(--brand);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  cursor: grab;
}
.price-range input[type='range']::-moz-range-track {
  background: transparent;
}
</style>
