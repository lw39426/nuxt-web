<template>
  <div class="bg-canvas min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="i-carbon-circle-dash text-3xl animate-spin text-fg-subtle" />
    </div>
    <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Breadcrumbs 面包屑部分 -->
      <nav class="hidden sm:flex text-sm text-fg-muted mb-8">
        <ol class="flex items-center space-x-2">
          <li>
            <NuxtLink to="/" class="hover:text-fg">首页</NuxtLink>
          </li>
          <li><span class="mx-2">/</span></li>
          <li>
            <NuxtLink to="/products" class="hover:text-fg">角色图鉴</NuxtLink>
          </li>
          <li><span class="mx-2">/</span></li>
          <li class="text-fg font-medium truncate">
            {{ product?.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-20">
        <!-- Gallery (Left) 角色立绘 3D 翻转卡片区域 -->
        <div class="lg:col-span-7 space-y-6">
          <!-- 翻转入场动画容器 + 悬停/点击翻转卡片 -->
          <div class="flip-entry">
            <div
              class="flip-card relative w-full cursor-pointer"
              :class="{ 'is-flipped': cardFlipped }"
              @mouseenter="cardFlipped = true"
              @mouseleave="cardFlipped = false"
              @click="cardFlipped = !cardFlipped"
            >
              <!-- 正面：角色立绘 -->
              <div
                class="flip-face aspect-[4/3] rounded-2xl overflow-hidden bg-surface-muted flex items-center justify-center"
              >
                <UiImage
                  :src="activeImage"
                  :alt="product.title"
                  fallback="/images/pro-loading.svg"
                  class="w-full h-full object-contain p-4 sm:p-8 lg:p-12"
                />
              </div>
              <!-- 背面：角色档案卡 -->
              <div
                class="flip-face flip-face-back aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 sm:p-10 flex flex-col justify-between"
              >
                <div>
                  <p class="text-xs text-white/50 mb-2 tracking-wide">
                    {{ product.origin || product.brand }}
                  </p>
                  <h2 class="text-3xl sm:text-4xl font-bold leading-tight">
                    {{ product.title }}
                  </h2>
                  <div class="mt-4 flex items-center gap-2 flex-wrap">
                    <span
                      v-if="product.characterType"
                      class="text-xs px-2 py-1 rounded-full bg-white/10 text-white/90"
                    >
                      {{ product.characterType }}
                    </span>
                    <span v-if="product.era" class="text-xs text-white/50">
                      {{ product.era }}
                    </span>
                  </div>
                </div>
                <!-- 背面四维评分速览 -->
                <div v-if="ratingDims.length > 0" class="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div v-for="dim in ratingDims" :key="dim.key">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs text-white/60">{{ dim.label }}</span>
                      <span class="text-sm font-bold">{{ dim.value.toFixed(1) }}</span>
                    </div>
                    <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-1000 ease-out"
                        :class="dim.barColor"
                        :style="{ width: barsMounted ? `${dim.value * 10}%` : '0%' }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="text-center text-xs text-fg-subtle">悬停 / 点击卡片，查看角色档案</p>

          <!-- 多图缩略图（仅一张时隐藏） -->
          <div v-if="product.images.length > 1" class="flex gap-4 overflow-x-auto pb-2">
            <button
              v-for="img in product?.images"
              :key="img"
              class="w-20 h-20 flex-shrink-0 rounded-xl border-1 overflow-hidden bg-surface-muted transition-all"
              :class="activeImage === img ? 'border-fg' : 'border-transparent hover:border-line'"
              @click="activeImage = img"
            >
              <UiImage :src="img" class="w-full h-full object-contain p-2" />
            </button>
          </div>
        </div>

        <!-- Info (Right, Sticky) 角色详细信息区域 -->
        <div class="lg:col-span-5">
          <div class="space-y-6 sm:space-y-8 lg:sticky lg:top-24">
            <div>
              <p v-if="product.origin" class="text-sm text-fg-muted mb-2">
                {{ product.origin }}
              </p>
              <h1 class="text-2xl sm:text-3xl font-bold text-fg mb-2 leading-tight">
                {{ product?.title }}
              </h1>
              <div class="flex items-center gap-4">
                <div class="flex text-yellow-400 text-sm">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <= Math.round((product?.rating || 0) / 2)
                        ? 'i-carbon:star-filled'
                        : 'i-carbon:star'
                    "
                  />
                </div>
                <span class="text-sm text-fg-muted"
                  >综合评分 {{ product?.rating || '-' }} / 10</span
                >
              </div>
            </div>

            <!-- 四维人工评分 -->
            <div v-if="ratingDims.length > 0" class="space-y-3">
              <h3 class="text-sm font-bold text-fg">四维评分</h3>
              <div v-for="dim in ratingDims" :key="dim.key" class="flex items-center gap-3">
                <span class="w-10 shrink-0 text-xs text-fg-muted">{{ dim.label }}</span>
                <div class="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out"
                    :class="dim.barColor"
                    :style="{ width: barsMounted ? `${dim.value * 10}%` : '0%' }"
                  />
                </div>
                <span class="w-8 text-right text-xs font-semibold text-fg">
                  {{ dim.value.toFixed(1) }}
                </span>
              </div>
            </div>

            <div class="h-px bg-line" />

            <!-- 能力设定 -->
            <div v-if="product.highlights?.length" class="space-y-3">
              <h3 class="text-sm font-bold text-fg">能力设定</h3>
              <ul class="space-y-2">
                <li
                  v-for="(highlight, idx) in product.highlights"
                  :key="idx"
                  class="flex items-start gap-2 text-sm text-fg-muted"
                >
                  <span class="text-accent mt-0.5">◆</span>
                  <span>{{ highlight.text }}</span>
                </li>
              </ul>
            </div>

            <!-- 标签 -->
            <div v-if="product.tags?.length" class="flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag.id"
                class="text-xs px-2 py-1 rounded text-white"
                :style="{ backgroundColor: tag.color || '#3b82f6' }"
              >
                {{ tag.name }}
              </span>
            </div>

            <!-- 收藏按钮 -->
            <button
              class="w-full py-3 rounded-xl font-bold text-base transition-colors border"
              :class="
                isFavorite
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                  : 'border-fg text-fg hover:bg-fg hover:text-canvas'
              "
              :disabled="favoritePending"
              @click="toggleFavorite"
            >
              {{ isFavorite ? '♥ 已收藏' : '♡ 收藏角色' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 角色资料区块：背景故事 / 能力 / 关系 / 台词 -->
      <div class="mt-14 sm:mt-20 lg:mt-24 border-t border-line pt-10 sm:pt-14">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <!-- 背景故事 -->
          <section v-if="product.background" class="lg:col-span-2">
            <h2 class="text-lg sm:text-xl font-bold text-fg mb-4">背景故事</h2>
            <p class="text-sm sm:text-base text-fg-muted leading-loose">
              {{ product.background }}
            </p>
          </section>

          <!-- 人物关系 -->
          <section v-if="product.relationships?.length">
            <h2 class="text-lg sm:text-xl font-bold text-fg mb-4">人物关系</h2>
            <ul class="space-y-3">
              <li
                v-for="(rel, idx) in product.relationships"
                :key="idx"
                class="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3"
              >
                <span class="text-sm font-medium text-fg">{{ rel.name }}</span>
                <span class="text-xs text-fg-muted text-right">{{ rel.relation }}</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- 经典台词 -->
        <section v-if="product.quotes?.length" class="mt-12">
          <h2 class="text-lg sm:text-xl font-bold text-fg mb-6">经典台词</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <blockquote
              v-for="(quote, idx) in product.quotes"
              :key="idx"
              class="relative rounded-2xl border border-line bg-surface-muted p-6 sm:p-8"
            >
              <div class="absolute -top-3 left-6 text-4xl text-accent/30 font-serif">"</div>
              <p class="text-base sm:text-lg text-fg font-medium leading-relaxed">
                {{ quote.text }}
              </p>
              <footer v-if="quote.scene" class="mt-3 text-xs text-fg-subtle">
                —— {{ quote.scene }}
              </footer>
            </blockquote>
          </div>
        </section>
      </div>

      <!-- Related Characters 同作品角色推荐 -->
      <div class="mt-14 sm:mt-20 lg:mt-24 border-t border-line pt-10 sm:pt-14">
        <div class="flex items-center justify-between mb-12">
          <h2 class="text-xl sm:text-2xl font-bold text-fg">同作品角色</h2>
          <NuxtLink to="/products" class="text-sm font-medium hover:underline"
            >查看全部角色</NuxtLink
          >
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div
            v-for="(relatedItem, idx) in relatedProducts"
            :key="relatedItem.id"
            :class="idx > 1 ? 'hidden sm:block' : ''"
          >
            <ProductCard :product="relatedItem" />
          </div>
        </div>
      </div>
    </div>
    <!-- Character Not Found 角色空状态 -->
    <div v-else class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">角色未找到</h1>
        <NuxtLink to="/products">
          <UButton color="neutral">返回角色图鉴</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';
import { useProductApi } from '~/composables/api/product';
import { useProducts } from '~/composables/useProducts';
import { useAuthStore } from '~/stores/auth';
import { useUiStore } from '~/stores/ui';
import { useFavoriteStore } from '~/stores/favorite';

interface ProductHighlight {
  text: string;
}

interface ProductDetailViewModel {
  id: number;
  code?: string;
  title: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  images: string[];
  brand?: string;
  highlights?: ProductHighlight[];
  tags?: Product['tags'];
  // YouMi 角色档案扩展字段
  era?: string;
  characterType?: string;
  origin?: string;
  background?: string;
  ratings?: Product['ratings'];
  relationships?: Product['relationships'];
  quotes?: Product['quotes'];
}

const route = useRoute();
const productIdentifier = computed(() => String(route.params.id ?? '').trim());
const { getDetail, related } = useProductApi();
const { getProductByIdentifier, loadProducts } = useProducts();

const authStore = useAuthStore();
const uiStore = useUiStore();
// 收藏态统一走全局缓存 store，与列表卡片跨页同步
const favoriteStore = useFavoriteStore();
const favoritePending = ref(false);

const activeImage = ref('');
// 3D 翻转卡片状态：false 显示立绘正面，true 显示档案背面
const cardFlipped = ref(false);
// 四维评分条动画：挂载后延迟触发宽度过渡
const barsMounted = ref(false);

/**
 * SSR 预取角色详情：接口优先、本地 Mock 兜底
 * - 服务端直接渲染完整详情，客户端水合复用 payload，避免二次请求
 * - 兜底数据一并放入返回值，保证 SSR 与客户端渲染一致
 */
const { data: detailData, pending } = await useAsyncData(
  () => `product-detail-${productIdentifier.value}`,
  async () => {
    if (!productIdentifier.value) {
      return { apiProduct: null, fallbackProduct: null, relatedItems: [] as Product[] };
    }

    // 接口优先，失败不抛出（由兜底接管），loadProducts 用于填充本地 mock 兜底列表
    const [, detailResult] = await Promise.allSettled([
      loadProducts(),
      getDetail(productIdentifier.value)
    ]);

    const apiProduct = detailResult.status === 'fulfilled' ? detailResult.value : null;
    const localProduct = getProductByIdentifier(productIdentifier.value);
    const fallbackProduct = localProduct ? mapMockProductToViewModel(localProduct) : null;

    // 相关推荐：优先用接口商品的 code，失败则回退到本地 mock
    const relatedProductCode = apiProduct?.code || localProduct?.code;
    let relatedItems: Product[] = [];
    if (relatedProductCode) {
      try {
        const response = await related(relatedProductCode, { limit: 4 });
        relatedItems = Array.isArray(response?.related)
          ? response.related
              .filter((item) => item.id !== (apiProduct?.id ?? localProduct?.id))
              .slice(0, 4)
              .map((item) => mapApiProductToCardProduct(item))
          : [];
      } catch (e) {
        console.error('Failed to load related products, fallback to empty:', e);
      }
    }

    return { apiProduct, fallbackProduct, relatedItems };
  },
  {
    watch: [productIdentifier],
    default: () => ({ apiProduct: null, fallbackProduct: null, relatedItems: [] as Product[] })
  }
);

const isLoading = computed(() => pending.value);

/** 归一化图片列表，保证详情页始终有可用主图 */
function normalizeImages(images?: string[], fallbackImage?: string): string[] {
  const normalizedImages = Array.isArray(images)
    ? images.filter((item) => typeof item === 'string' && item.trim())
    : [];

  if (normalizedImages.length > 0) {
    return normalizedImages;
  }

  return fallbackImage ? [fallbackImage] : [];
}

/** 将后端角色详情映射为页面使用的展示模型 */
function mapApiProductToViewModel(source: Product): ProductDetailViewModel {
  return {
    id: source.id,
    code: source.code,
    title: source.name,
    description: source.description,
    rating: source.rating,
    reviewCount: source.favorite_count || 0,
    images: normalizeImages(source.images, source.main_image),
    brand: source.brand,
    highlights: source.highlights?.length
      ? source.highlights
      : source.tags?.map((tag) => ({ text: tag.name })) || [],
    tags: source.tags,
    era: source.era,
    characterType: source.character_type,
    origin: source.origin,
    background: source.background,
    ratings: source.ratings,
    relationships: source.relationships,
    quotes: source.quotes
  };
}

/** 将本地 mock 角色数据映射为页面使用的展示模型 */
function mapMockProductToViewModel(source: Record<string, any>): ProductDetailViewModel {
  return {
    id: Number(source.id),
    code: source.code,
    title: source.title || source.name || '未命名角色',
    description: source.description || '',
    rating: source.rating || 0,
    reviewCount: source.reviewCount || 0,
    images: normalizeImages(source.images, source.main_image),
    brand: source.brand,
    highlights: Array.isArray(source.highlights) ? source.highlights : [],
    tags: Array.isArray(source.tags) ? source.tags : [],
    era: source.era,
    characterType: source.character_type,
    origin: source.origin,
    background: source.background,
    ratings: source.ratings,
    relationships: Array.isArray(source.relationships) ? source.relationships : undefined,
    quotes: Array.isArray(source.quotes) ? source.quotes : undefined
  };
}

/** 将后端角色转换为 ProductCard 可直接展示的数据 */
function mapApiProductToCardProduct(source: Product): Product {
  return {
    ...source,
    main_image: source.main_image || source.images?.[0] || '',
    images: normalizeImages(source.images, source.main_image)
  };
}

const fallbackProduct = computed(() => detailData.value?.fallbackProduct ?? null);

const product = computed(() =>
  detailData.value?.apiProduct
    ? mapApiProductToViewModel(detailData.value.apiProduct)
    : fallbackProduct.value
);

/** 四维评分展示配置（人气 / 战力 / 智商 / 颜值） */
const ratingDims = computed(() => {
  const r = product.value?.ratings;
  if (!r) return [];
  return [
    { key: 'popularity', label: '人气', value: r.popularity, barColor: 'bg-amber-400' },
    { key: 'power', label: '战力', value: r.power, barColor: 'bg-red-500' },
    { key: 'intelligence', label: '智商', value: r.intelligence, barColor: 'bg-blue-500' },
    { key: 'charm', label: '颜值', value: r.charm, barColor: 'bg-pink-500' }
  ];
});

/** 收藏态：从全局缓存 Set 读取（内存匹配，0 网络请求），跨页自动同步 */
const isFavorite = computed(() =>
  product.value ? favoriteStore.has('product', product.value.id) : false
);

/** 挂载后触发评分条动画与收藏缓存预热 */
onMounted(() => {
  favoriteStore.ensureLoaded().catch(() => {
    // 加载失败静默降级为"未收藏"展示，不阻塞详情页渲染
  });
  setTimeout(() => {
    barsMounted.value = true;
  }, 300);
});

/** 收藏 / 取消收藏：未登录唤起登录弹窗；乐观更新与失败回滚均在 store 内完成 */
const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    uiStore.openAuthModal('login');
    return;
  }
  if (!product.value || favoritePending.value) return;
  favoritePending.value = true;
  try {
    // store 内部：先改本地 Set（UI 立即反馈）→ 请求 → 成功按后端回正 / 失败回滚
    await favoriteStore.toggle('product', product.value.id);
  } catch {
    // 失败提示由 useApi 全局 toast 兜底，本地状态已在 store 内回滚
  } finally {
    favoritePending.value = false;
  }
};

/** 角色切换后同步默认主图并复位翻转状态 */
watchEffect(() => {
  if (product.value) {
    activeImage.value = product.value.images?.[0] || '';
    cardFlipped.value = false;
  }
});

const relatedProducts = computed(() => detailData.value?.relatedItems ?? []);
</script>

<style scoped>
/* 翻转卡片入场动画：整卡以 3D 翻转方式进入视野 */
.flip-entry {
  perspective: 1200px;
  animation: flip-entry 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes flip-entry {
  from {
    transform: rotateY(-180deg);
    opacity: 0.3;
  }
  to {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

/* 翻转卡片本体：悬停 / 点击时正反面互换 */
.flip-card {
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.flip-card.is-flipped {
  transform: rotateY(180deg);
}

/* 正反面：背面隐藏，避免镜像穿透 */
.flip-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-face-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
}
</style>
