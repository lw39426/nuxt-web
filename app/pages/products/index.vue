<template>
  <div class="bg-canvas min-h-screen pb-20">
    <!-- Store Header Section头部分类列表 -->
    <!--
      Implemented based on Apple Store design
      Features: Gradient title, category navigation, responsive layout
    -->
    <div class="bg-canvas-elevated pt-8 md:pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Title and Subtitle Area 标题副标题区域 -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-16"
        >
          <div class="relative">
            <!-- 弥散光背景：皮肤三色光斑，随皮肤切换联动 -->
            <div
              class="absolute -top-14 -left-10 w-72 h-72 bg-skin-glow-a rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            ></div>
            <div
              class="absolute -top-8 left-36 w-60 h-60 bg-skin-glow-b rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            ></div>
            <div
              class="absolute -top-4 left-80 w-52 h-52 bg-skin-glow-c rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            ></div>

            <h1 class="relative text-5xl font-bold mb-2">
              <span class="bg-clip-text text-transparent bg-skin-title"> 角色图鉴 </span>
            </h1>
            <div class="relative mt-4 text-xl font-medium text-fg-muted">
              <span class="text-fg font-bold">每一个角色，都值得被认真看见。</span>
            </div>
          </div>

          <div class="mt-4 md:mt-0 text-right">
            <a
              href="#"
              class="text-fg-muted text-sm flex items-center gap-1 font-medium hover:text-fg md:justify-end"
            >
              共收录 {{ totalCharacters }} 位角色
              <div class="i-carbon-chevron-right text-xs" />
            </a>
          </div>
        </div>

        <!-- Product Categories Navigation 作品分类导航（IP 系列） -->
        <div class="relative group">
          <!-- Scrollable container -->
          <div
            class="flex justify-between overflow-x-auto pb-4 no-scrollbar scroll-smooth gap-8 md:gap-0"
          >
            <div
              v-for="category in categories"
              :key="category.name"
              :class="[
                'flex flex-col items-center min-w-[80px] cursor-pointer group/item space-y-3 pb-2 border-b-4 transition-colors',
                selectedCategory === category.name
                  ? 'border-accent'
                  : 'border-transparent hover:border-line-strong'
              ]"
              @click="selectedCategory = category.name"
            >
              <!-- Icon/Image Container -->
              <div
                class="h-[78px] p-2 w-auto flex items-end justify-center group-hover/item:-translate-y-1 transition-transform duration-300 ease-out"
              >
                <UiImage
                  :src="category.image"
                  :alt="category.name"
                  class="h-full w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <!-- Label -->
              <span class="text-xs font-medium text-fg">
                {{ category.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色筛选栏：类型 / 年代 / 标签 -->
    <div class="bg-canvas py-6 md:py-8 border-b border-line">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <!-- 单个筛选维度行（无候选项时隐藏，兼容后端旧数据） -->
        <div
          v-for="group in filterGroups.filter((g) => g.options.length > 0)"
          :key="group.key"
          class="flex items-start gap-3"
        >
          <span class="w-16 shrink-0 pt-1.5 text-sm font-medium text-fg-muted">
            {{ group.label }}
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in group.options"
              :key="option"
              :class="[
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                isSelected(group.key, option)
                  ? 'bg-accent text-white border-accent'
                  : 'text-fg border-line hover:bg-accent hover:text-white hover:border-accent'
              ]"
              @click="toggleFilter(group.key, option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <!-- 已选筛选标签汇总 + 清空 -->
        <div v-if="activeFilterCount > 0" class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-for="tag in activeFilterTags"
              :key="`${tag.key}-${tag.value}`"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-white text-sm group"
            >
              <span class="text-xs">{{ tag.label }}</span>
              <span class="text-xs text-[#efefef]">{{ tag.value }}</span>
              <button
                type="button"
                class="ml-0.5 rounded-full hover:bg-accent/20 transition-colors p-0.5 grid place-items-center"
                :aria-label="`移除筛选条件: ${tag.value}`"
                @click="toggleFilter(tag.key, tag.value)"
              >
                <span class="i-carbon-close w-4 h-4 inline-block"></span>
              </button>
            </span>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-sm text-fg-muted">
              已筛选 <span class="text-fg font-semibold">{{ filteredCharacterCount }}</span> 位角色
            </span>
            <UButton
              class="bg-btn-lpurple text-btn-lpurple-text hover:bg-btn-lpurple-hover"
              variant="soft"
              size="sm"
              @click="clearFilters"
            >
              <template #leading>
                <span class="i-carbon-reset w-4 h-4" />
              </template>
              重置筛选
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 产品系列展示区域 -->
    <div class="bg-canvas py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 每个系列的展示块 -->
        <div v-if="filteredGroupedProducts.length > 0" class="space-y-16 md:space-y-24">
          <div
            v-for="series in filteredGroupedProducts"
            :id="`series-${series.categoryId}`"
            :key="series.categoryId"
            class="scroll-mt-20"
          >
            <!-- 系列标题 + 特色产品卡片 -->
            <div class="mb-12">
              <!-- 系列名称标题 -->
              <h2 class="text-2xl md:text-3xl font-bold mb-8 text-fg">
                {{ series.category }}
              </h2>

              <!-- 统一的网格布局：响应式适配所有端 -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <!-- 左侧/顶部：分类大卡片 (类似博客 Hero 风格) -->
                <div
                  class="col-span-2 md:col-span-3 lg:col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer isolate transform-gpu min-h-[320px] md:min-h-[280px] lg:min-h-[420px]"
                >
                  <!-- 底层背景图 -->
                  <UiImage
                    v-if="series.categoryImage"
                    :src="series.categoryImage"
                    :alt="series.category"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <!-- 如果没有图片时的降级纯色背景 -->
                  <div
                    v-else
                    class="absolute inset-0 bg-gradient-to-br from-gray-800 to-black transition-transform duration-700 group-hover:scale-105"
                  >
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="i-carbon-image text-8xl text-white/10"></div>
                    </div>
                  </div>

                  <!-- 叠加层: 渐变遮罩 (底部深色向上渐变透明) -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                  ></div>

                  <!-- 叠加层: 边框效果 (抗锯齿) -->
                  <div
                    class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent dark:ring-[#686868] pointer-events-none z-10"
                  ></div>

                  <!-- 分类内容区 (置于最上层) -->
                  <div class="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-20">
                    <h2
                      class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight group-hover:text-blue-200 transition-colors"
                    >
                      {{ series.category }}
                    </h2>
                    <div
                      class="mt-2 flex items-center text-blue-300 font-medium text-sm md:text-base opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                      探索系列角色
                      <div
                        class="i-carbon-arrow-right ml-1 transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>

                <!-- 产品卡片 -->
                <ProductCard
                  v-for="product in series.products"
                  :key="product.id"
                  :product="product"
                />
              </div>
            </div>

            <!-- 分割线 -->
            <div
              v-if="series !== filteredGroupedProducts[filteredGroupedProducts.length - 1]"
              class="mt-16 md:mt-24 border-t border-line"
            ></div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 text-gray-500 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
          <div class="i-carbon-search text-6xl mb-4 text-fg-subtle"></div>
          <h3 class="text-lg font-semibold text-fg mb-2">没有找到匹配的角色</h3>
          <p class="text-sm text-fg-muted">换个筛选条件试试吧</p>
          <button
            v-if="activeFilterCount > 0"
            class="mt-4 px-4 py-2 rounded-full bg-accent text-white text-sm hover:opacity-90"
            @click="clearFilters"
          >
            清空筛选
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCategoryApi } from '~/composables/api/category';
import type { Product } from '~/types/product';

const { getProductCateList, getProducts } = useCategoryApi();
// useToast 必须在 setup 同步阶段调用，不能在 await 之后的回调中使用
const toast = useToast();

interface SeriesGroup {
  categoryId?: number;
  category: string;
  categoryImage: string;
  products: Product[];
}

/** 筛选维度键类型 */
type FilterKey = 'character_type' | 'era' | 'tag';

// 当前选中的分类名称
const selectedCategory = ref<string | null>(null);

// 多维筛选状态：角色类型 / 年代 / 标签（多选）
const selectedFilters = ref<Record<FilterKey, string[]>>({
  character_type: [],
  era: [],
  tag: []
});

/**
 * 服务端预取分类列表与商品数据，避免 CSR 等待
 * - 首屏由 SSR 直接渲染，减少白屏等待
 * - 任一步失败时兜底为空数据并提示
 */
const { data, error } = await useAsyncData(
  'products-store',
  async () => {
    const categoriesRes = await getProductCateList();
    const categories = (categoriesRes || []).map((item: any) => ({
      name: item.name,
      image: item.imageUrl || '',
      id: item.id
    }));

    // 并发拉取每个分类下的商品；单个分类失败不拖垮整页（跳过失败项）
    const seriesList = (
      await Promise.allSettled(
        categories.map(async (item) => {
          const productsRes = await getProducts(item.id, { page: 1, pageSize: 10 });
          const products = productsRes.data || [];
          return {
            categoryId: item.id,
            category: item.name,
            categoryImage: item.image,
            products: products as Product[]
          } as SeriesGroup;
        })
      )
    )
      .filter((r): r is PromiseFulfilledResult<SeriesGroup> => r.status === 'fulfilled')
      .map((r) => r.value);

    return {
      categories,
      groupedProducts: seriesList.filter((item) => item.products.length > 0)
    };
  },
  {
    default: () => ({ categories: [], groupedProducts: [] as SeriesGroup[] })
  }
);

const categories = computed(() => data.value?.categories || []);
const groupedProducts = computed(() => data.value?.groupedProducts || []);

/** 全量角色列表（用于聚合筛选选项与统计总数） */
const allProducts = computed(() => groupedProducts.value.flatMap((series) => series.products));

/** 收录角色总数 */
const totalCharacters = computed(() => allProducts.value.length);

/**
 * 从全量数据聚合各筛选维度的候选项（去重）
 * 角色类型取 character_type，年代取 era，标签取 tags[].name
 */
const filterGroups = computed(() => {
  const types = new Set<string>();
  const eras = new Set<string>();
  const tags = new Set<string>();

  allProducts.value.forEach((product) => {
    if (product.character_type) types.add(product.character_type);
    if (product.era) eras.add(product.era);
    product.tags?.forEach((tag) => tags.add(tag.name));
  });

  // 年代按时间顺序排列（40年代对应《猫和老鼠》等早期作品）
  const eraOrder = ['40年代', '80年代', '90年代', '00年代', '10年代', '20年代'];
  const sortedEras = eraOrder.filter((era) => eras.has(era));

  return [
    { key: 'character_type' as FilterKey, label: '类型', options: [...types] },
    { key: 'era' as FilterKey, label: '年代', options: sortedEras },
    { key: 'tag' as FilterKey, label: '标签', options: [...tags] }
  ];
});

/** 判断某筛选维度下某选项是否已被选中 */
const isSelected = (key: FilterKey, option: string) => selectedFilters.value[key].includes(option);

/** 切换某筛选维度下某选项的选中状态（多选） */
const toggleFilter = (key: FilterKey, option: string) => {
  const list = selectedFilters.value[key];
  const index = list.indexOf(option);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(option);
  }
};

/** 当前生效的筛选项总数 */
const activeFilterCount = computed(
  () =>
    selectedFilters.value.character_type.length +
    selectedFilters.value.era.length +
    selectedFilters.value.tag.length
);

interface ActiveFilterTag {
  key: FilterKey;
  label: string;
  value: string;
}

/** 已选筛选项扁平化列表（用于渲染可删除标签） */
const activeFilterTags = computed<ActiveFilterTag[]>(() => {
  const keyLabel: Record<FilterKey, string> = {
    character_type: '类型',
    era: '年代',
    tag: '标签'
  };
  const tags: ActiveFilterTag[] = [];
  (Object.keys(selectedFilters.value) as FilterKey[]).forEach((key) => {
    selectedFilters.value[key].forEach((value) => {
      tags.push({ key, label: keyLabel[key], value });
    });
  });
  return tags;
});

/** 清空全部筛选条件 */
const clearFilters = () => {
  selectedFilters.value = {
    character_type: [],
    era: [],
    tag: []
  };
};

/**
 * 按筛选条件过滤每个系列内的角色
 * - 类型 / 年代命中任一选项即保留（组内多选为"或"关系）
 * - 标签命中任一选项即保留
 * - 无有效角色数据的系列整块隐藏
 */
const filteredGroupedProducts = computed(() => {
  const { character_type: types, era: eras, tag: tags } = selectedFilters.value;
  const hasFilter = types.length > 0 || eras.length > 0 || tags.length > 0;
  if (!hasFilter) return groupedProducts.value;

  return groupedProducts.value
    .map((series) => ({
      ...series,
      products: series.products.filter((product) => {
        if (types.length > 0 && !types.includes(product.character_type || '')) return false;
        if (eras.length > 0 && !eras.includes(product.era || '')) return false;
        if (tags.length > 0 && !product.tags?.some((tag) => tags.includes(tag.name))) return false;
        return true;
      })
    }))
    .filter((series) => series.products.length > 0);
});

/** 筛选后命中的角色总数 */
const filteredCharacterCount = computed(() =>
  filteredGroupedProducts.value.reduce((sum, series) => sum + series.products.length, 0)
);

// 默认选中第一个分类
if (categories.value.length > 0 && categories.value[0]) {
  selectedCategory.value = categories.value[0]!.name;
}

// 客户端拉取失败时提示一次（SSR 阶段不弹 toast，且每次页面挂载最多提示一次，避免反复弹窗）
let errorNotified = false;
if (import.meta.client) {
  watch(
    error,
    (err) => {
      if (err && !errorNotified) {
        errorNotified = true;
        toast.add({
          id: 'products-store-error',
          title: '加载失败',
          description: '数据加载失败，请刷新页面重试',
          color: 'error'
        });
      }
    },
    { immediate: true }
  );
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
