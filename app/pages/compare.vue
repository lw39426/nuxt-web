<script setup lang="ts">
import type { Product } from '~/types/product';
import { useProductApi } from '~/composables/api/product';
import { useCompareStore } from '~/stores/compare';

/**
 * 角色对比页
 * - 选取 2-4 个角色并排对比：四维评分条形对比 + 属性表格
 * - 数据来源：对比栏 store 中的角色 code → 逐个拉取详情接口
 * - 少于 2 个角色时展示引导（去列表页添加）
 */
useSeoMeta({
  title: '角色对比 - YouMi 角色百科',
  description: '并排对比 2-4 个角色的四维评分与资料档案'
});

const { getDetail } = useProductApi();
const compareStore = useCompareStore();

/** 对比页角色列表（按加入顺序） */
const characters = ref<Product[]>([]);
const loading = ref(false);
/** 客户端挂载后置 true：区分「SSR 初始空态」与「真实的空对比栏」，避免首屏闪引导态 */
const hydrated = ref(false);

/** 逐个拉取角色详情；单个失败跳过不阻塞整页 */
async function loadCharacters() {
  const codes = compareStore.codes;
  if (codes.length === 0) {
    characters.value = [];
    return;
  }
  loading.value = true;
  try {
    const results = await Promise.allSettled(codes.map((code) => getDetail(code)));
    characters.value = results
      .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
      .map((r) => r.value);
  } finally {
    loading.value = false;
  }
}

/**
 * 客户端挂载时恢复 localStorage 对比列表并拉取详情：
 * SSR 阶段 store 为空（服务端无 localStorage），不能在 setup 顶层 restore，
 * 否则客户端水合时序错乱
 */
onMounted(async () => {
  compareStore.restore();
  hydrated.value = true;
  await loadCharacters();
  // store 变化（本页移除 / 其他入口加入）时自动重载
  watch(
    () => compareStore.codes,
    () => loadCharacters()
  );
});

/** 从对比栏移除（watch 自动刷新列表） */
function removeFromCompare(code: string) {
  compareStore.remove(code);
}

/** 清空对比栏 */
function clearAll() {
  compareStore.clear();
}

/** 四维评分维度定义（key 与 ratings 字段对齐） */
const ratingDims = [
  { key: 'popularity', label: '人气', color: 'bg-amber-400' },
  { key: 'power', label: '战力', color: 'bg-red-500' },
  { key: 'intelligence', label: '智商', color: 'bg-blue-500' },
  { key: 'charm', label: '颜值', color: 'bg-pink-500' }
] as const;

/** 取某角色某维评分值（缺失按 0，条形宽度百分比） */
const ratingValue = (c: Product, key: string) =>
  Math.round(((c.ratings?.[key as keyof typeof c.ratings] as number) || 0) * 10);

/** 某维度全场最高分对应角色 code 集合（用于"最强"高亮） */
const bestIdsOf = (key: string) => {
  const max = Math.max(...characters.value.map((c) => ratingValue(c, key)), 0);
  if (max <= 0) return new Set<string>();
  return new Set(characters.value.filter((c) => ratingValue(c, key) === max).map((c) => c.code));
};

/** 属性行定义：label + 取值函数（缺失显示 —） */
const attrRows = [
  { label: '所属作品', value: (c: Product) => c.brand?.name || '—' },
  { label: '角色类型', value: (c: Product) => c.character_type || '—' },
  { label: '出品年代', value: (c: Product) => c.era || '—' },
  { label: '出处', value: (c: Product) => c.origin || '—' },
  {
    label: '标签',
    value: (c: Product) => (c.tags?.length ? c.tags.map((t) => t.name).join(' / ') : '—')
  },
  {
    label: '能力亮点',
    value: (c: Product) => (c.highlights?.length ? c.highlights.map((h) => h.text).join('；') : '—')
  },
  {
    label: '经典语录',
    value: (c: Product) => (c.quotes?.length ? c.quotes[0]!.text : '—')
  }
];
</script>

<template>
  <div class="bg-canvas min-h-screen py-10 pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页头 -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-fg">角色对比</h1>
          <p class="text-sm text-fg-subtle mt-1">
            并排对比 2-4 个角色的四维评分与资料档案（{{ characters.length }}/{{ 4 }}）
          </p>
        </div>
        <button
          v-if="characters.length > 0"
          class="px-4 py-2 text-sm text-fg-muted border border-line rounded-lg hover:text-fg hover:border-fg transition-colors"
          @click="clearAll"
        >
          清空对比
        </button>
      </div>

      <!-- 骨架屏：加载中 或 SSR 初始（尚未水合，无法得知 localStorage 状态） -->
      <div v-if="loading || !hydrated" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="i in Math.max(characters.length, 2)"
          :key="i"
          class="bg-surface rounded-2xl p-6"
        >
          <div class="h-8 w-2/3 bg-elevated rounded mb-6 animate-pulse" />
          <div v-for="j in 4" :key="j" class="h-3 bg-elevated rounded mb-4 animate-pulse" />
        </div>
      </div>

      <!-- 引导态：少于 2 个角色（水合后） -->
      <div
        v-else-if="characters.length < 2"
        class="flex flex-col items-center justify-center py-24 text-center border border-line rounded-2xl bg-surface"
      >
        <div class="i-carbon-compare text-6xl text-fg-subtle mb-4" />
        <h2 class="text-lg font-semibold text-fg mb-2">
          {{ characters.length === 0 ? '还没有选择对比角色' : '再选一个角色就能开始对比' }}
        </h2>
        <p class="text-sm text-fg-muted mb-6">在角色图鉴中点击「对比」，最多可同时对比 4 个角色</p>
        <div class="flex items-center gap-3">
          <!-- 已选 1 个时的预览 -->
          <div
            v-if="characters.length === 1"
            class="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm rounded-full"
          >
            已选：{{ characters[0]!.name }}
          </div>
          <NuxtLink
            to="/products"
            class="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            去角色图鉴挑选
          </NuxtLink>
        </div>
      </div>

      <!-- 对比主内容：≥2 个角色 -->
      <template v-else>
        <!-- 头部角色卡带 -->
        <div
          class="grid gap-4 mb-10"
          :style="{ gridTemplateColumns: `repeat(${characters.length}, minmax(0, 1fr))` }"
        >
          <div
            v-for="c in characters"
            :key="c.code"
            class="relative bg-surface border border-line rounded-2xl p-5 text-center"
          >
            <!-- 移除按钮 -->
            <button
              class="absolute top-2 right-2 w-7 h-7 rounded-full bg-elevated text-fg-muted hover:text-red-500 flex items-center justify-center transition-colors"
              :aria-label="`移除 ${c.name}`"
              @click="removeFromCompare(c.code)"
            >
              <div class="i-carbon-close text-sm" />
            </button>
            <div
              class="w-14 h-14 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold mb-3"
            >
              {{ c.name?.slice(0, 1) }}
            </div>
            <h3 class="font-semibold text-fg">{{ c.name }}</h3>
            <p class="text-xs text-fg-subtle mt-1">{{ c.brand?.name }}</p>
          </div>
        </div>

        <!-- 四维评分条形对比 -->
        <section class="mb-10">
          <h2 class="text-lg font-bold text-fg mb-4 flex items-center gap-2">
            <div class="i-carbon-analytics text-accent" />
            四维评分对比
          </h2>
          <div class="bg-surface border border-line rounded-2xl p-6 space-y-6">
            <div v-for="dim in ratingDims" :key="dim.key">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-fg">{{ dim.label }}</span>
                <span class="text-xs text-fg-subtle">满分 10</span>
              </div>
              <!-- 每个角色一行：名字 + 条形 + 分值 -->
              <div
                v-for="c in characters"
                :key="`${dim.key}-${c.code}`"
                class="flex items-center gap-3 mb-2"
              >
                <span class="w-20 shrink-0 text-xs text-fg-muted truncate">{{ c.name }}</span>
                <div class="flex-1 h-3 bg-elevated rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="dim.color"
                    :style="{ width: `${ratingValue(c, dim.key)}%` }"
                  />
                </div>
                <span
                  class="w-12 text-right text-xs font-semibold"
                  :class="bestIdsOf(dim.key).has(c.code) ? 'text-accent' : 'text-fg-subtle'"
                >
                  {{ ratingValue(c, dim.key) / 10 }}
                  <span v-if="bestIdsOf(dim.key).has(c.code)" class="text-[10px]"> 最强</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 属性表格对比 -->
        <section>
          <h2 class="text-lg font-bold text-fg mb-4 flex items-center gap-2">
            <div class="i-carbon-document text-accent" />
            资料档案对比
          </h2>
          <div class="bg-surface border border-line rounded-2xl overflow-x-auto">
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="row in attrRows"
                  :key="row.label"
                  class="border-b border-line last:border-b-0"
                >
                  <th
                    class="w-28 shrink-0 px-5 py-4 text-left text-xs font-medium text-fg-subtle align-top bg-canvas-elevated/50"
                  >
                    {{ row.label }}
                  </th>
                  <td
                    v-for="c in characters"
                    :key="`${row.label}-${c.code}`"
                    class="px-5 py-4 text-fg-muted align-top"
                  >
                    {{ row.value(c) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
