<template>
  <div class="bg-canvas min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="i-carbon-circle-dash text-3xl animate-spin text-fg-subtle" />
    </div>
    <div
      v-else-if="product"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8"
    >
      <!-- Breadcrumbs 面包屑部分 -->
      <nav class="hidden sm:flex text-sm text-fg-muted mb-8">
        <ol class="flex items-center space-x-2">
          <li>
            <NuxtLink to="/" class="hover:text-fg">首页</NuxtLink>
          </li>
          <li><span class="mx-2">/</span></li>
          <li>
            <NuxtLink to="/products" class="hover:text-fg">商品</NuxtLink>
          </li>
          <li><span class="mx-2">/</span></li>
          <li class="text-fg font-medium truncate">
            {{ product?.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-20">
        <!-- Gallery (Left, larger) 商品图片展示区域 -->
        <div class="lg:col-span-7 space-y-6">
          <div
            class="aspect-[4/3] bg-surface-muted rounded-2xl overflow-hidden flex items-center justify-center relative group"
          >
            <UiImage
              :src="activeImage"
              class="w-full h-full object-contain p-4 sm:p-8 lg:p-12 transition-transform duration-500 group-hover:scale-105"
            />
            <button
              class="absolute top-4 right-4 p-3 rounded-full bg-glass backdrop-blur hover:bg-elevated transition-colors"
            >
              <div class="i-carbon-maximize text-xl" />
            </button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-2">
            <button
              v-for="img in product?.images"
              :key="img"
              class="w-20 h-20 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-xl border-1 overflow-hidden bg-surface-muted transition-all"
              :class="activeImage === img ? 'border-fg' : 'border-transparent hover:border-line'"
              @click="activeImage = img"
            >
              <UiImage :src="img" class="w-full h-full object-contain p-2" />
            </button>
          </div>
          <!-- 商品富文本展示 -->
          <section
            v-if="richTextContent"
            class="rounded-3xl border border-line bg-surface-muted p-6 sm:p-8"
          >
            <div class="flex items-center justify-between gap-3 mb-6">
              <h2 class="text-lg sm:text-xl font-bold text-fg">图文详情</h2>
              <span class="text-xs text-fg-muted">商品卖点与详细说明</span>
            </div>
            <article
              class="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-fg-muted"
            >
              <div v-html="richTextContent"></div>
            </article>
          </section>
        </div>

        <!-- Info (Right, Sticky) 商品详细信息区域 -->
        <div class="lg:col-span-5">
          <div class="space-y-6 sm:space-y-8 lg:sticky lg:top-24">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-fg mb-2 leading-tight">
                {{ product?.title }}
              </h1>
              <div class="flex items-center gap-4">
                <div class="flex text-yellow-400 text-sm">
                  <div
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <= Math.round(product?.rating || 0)
                        ? 'i-carbon:star-filled'
                        : 'i-carbon:star'
                    "
                  />
                </div>
                <span class="text-sm text-fg-muted">{{ product?.reviewCount }} reviews</span>
              </div>
            </div>

            <!-- Price Section -->
            <div class="bg-surface-muted p-4 rounded-lg space-y-2">
              <div class="flex items-baseline gap-3">
                <span class="text-3xl sm:text-4xl font-bold text-red-600"
                  >¥{{ product?.price }}</span
                >
                <span v-if="product?.originalPrice" class="text-lg text-fg-muted line-through"
                  >¥{{ product.originalPrice }}</span
                >
              </div>
              <p class="text-xs text-fg-muted">到手价</p>
            </div>

            <!-- Promotions -->
            <div v-if="product?.promotions?.length" class="space-y-2">
              <div
                v-for="(promo, idx) in product.promotions"
                :key="idx"
                class="text-sm text-fg-muted flex items-start gap-2"
              >
                <span class="text-red-500 font-bold mt-0.5">·</span>
                <span>{{ promo }}</span>
              </div>
            </div>

            <div class="h-px bg-line" />

            <!-- 颜色、版本、数量Options -->
            <div class="space-y-3">
              <!-- Quantity -->
              <div>
                <label class="text-sm font-bold text-fg block mb-1">数量</label>
                <div class="flex items-center gap-2 border border-line rounded-lg w-fit">
                  <button
                    class="px-3 py-2 hover:bg-surface-muted"
                    @click="quantity = Math.max(1, quantity - 1)"
                  >
                    −
                  </button>
                  <span class="w-8 text-center font-medium">{{ quantity }}</span>
                  <button class="px-3 py-2 hover:bg-surface-muted" @click="quantity = quantity + 1">
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Specs and Description Section -->
            <div class="border-t border-line pt-6 space-y-6">
              <!-- Two Column Grid -->
              <div class="grid grid-cols-1 gap-6 sm:gap-8">
                <!-- Description -->
                <div class="space-y-4">
                  <h3 class="text-lg font-bold text-fg mb-4">商品描述</h3>
                  <div class="text-sm text-fg-muted leading-relaxed space-y-3">
                    <p>{{ product?.description }}</p>
                    <p v-if="product?.title?.includes('Reno')" class="text-fg-muted">
                      OPPO Reno
                      系列致力于为消费者提供最好的拍照体验和电池续航能力。该产品集合了最新的技术创新和精致的工业设计。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="hidden sm:flex gap-3 pt-4">
              <button
                class="flex-1 bg-fg text-canvas h-12 rounded-lg font-bold text-base hover:opacity-90 transition-opacity shadow-md"
              >
                加入购物车
              </button>
              <button
                class="flex-1 bg-red-600 text-white h-12 rounded-lg font-bold text-base hover:bg-red-700 transition-colors shadow-md"
              >
                立即购买
              </button>
            </div>

            <!-- Guarantees -->
            <div class="pt-2 sm:pt-4 space-y-2">
              <p class="text-xs font-bold text-fg">服务保障</p>
              <div
                v-for="guarantee in guaranteeList"
                :key="guarantee.name"
                class="flex items-center gap-2 text-xs text-fg-muted"
              >
                <span class="text-green-600">✓</span>
                <span>{{ guarantee.name }}</span>
              </div>
            </div>

            <!-- Highlights Grid (Above Product Details) -->
            <div class="grid grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-b border-line">
              <div v-for="(highlight, idx) in product.highlights" :key="idx" class="text-center">
                <div class="mb-1 sm:mb-2 text-xl sm:text-2xl">✨</div>
                <p class="text-xs sm:text-sm font-medium text-fg">
                  {{ highlight.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products 推荐相关商品 -->
      <div class="mt-14 sm:mt-20 lg:mt-32 border-t border-line pt-10 sm:pt-14 lg:pt-20">
        <div class="flex items-center justify-between mb-12">
          <h2 class="text-xl sm:text-2xl font-bold text-fg">你可能也喜欢</h2>
          <NuxtLink to="/products" class="text-sm font-medium hover:underline"
            >查看全部商品</NuxtLink
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

      <!-- Mobile Bottom Action Bar -->
      <div
        class="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-glass backdrop-blur border-t border-line p-3"
      >
        <div class="grid grid-cols-2 gap-3">
          <button class="w-full bg-fg text-canvas h-11 rounded-lg font-bold text-sm">
            加入购物车
          </button>
          <button class="w-full bg-red-600 text-white h-11 rounded-lg font-bold text-sm">
            立即购买
          </button>
        </div>
      </div>
    </div>
    <!-- Product Not Found 商品空状态 -->
    <div v-else class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">商品未找到</h1>
        <NuxtLink to="/products">
          <UButton color="neutral">返回商品列表</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';
import { useProductApi } from '~/composables/api/product';
import { useProducts } from '~/composables/useProducts';

interface ProductColorOption {
  name: string;
  hex: string;
}

interface ProductHighlight {
  text: string;
}

interface ProductGuarantee {
  name: string;
  description?: string;
}

interface ProductService {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
}

interface ProductDetailViewModel {
  id: number;
  code?: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  promotions?: string[];
  colorOptions?: ProductColorOption[];
  memoryOptions?: string[];
  services?: ProductService[];
  guarantees?: ProductGuarantee[];
  highlights?: ProductHighlight[];
  screenSize?: string;
  screenType?: string;
  battery?: string;
  protectionClass?: string;
  detailHtml?: string;
}

const route = useRoute();
const productIdentifier = computed(() => String(route.params.id ?? '').trim());
const { getDetail, related } = useProductApi();
const { getProductByIdentifier, loadProducts } = useProducts();

const activeImage = ref('');
const selectedColor = ref('');
const selectedMemory = ref('');
const selectedServices = ref<string[]>([]);
const quantity = ref(1);

/**
 * SSR 预取商品详情：接口优先、本地 Mock 兜底
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

/** 转义文本内容，避免兜底富文本直接注入原始 HTML */
function escapeHtml(value?: string): string {
  if (!value) return '';
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** 将后端返回的分单位金额转换为页面展示的元金额 */
function formatApiPrice(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Number(value.toFixed(2));
}

/** 归一化商品图片列表，保证详情页始终有可用主图 */
function normalizeImages(images?: string[], fallbackImage?: string): string[] {
  const normalizedImages = Array.isArray(images)
    ? images.filter((item) => typeof item === 'string' && item.trim())
    : [];

  if (normalizedImages.length > 0) {
    return normalizedImages;
  }

  return fallbackImage ? [fallbackImage] : [];
}

/** 根据现有商品信息生成兜底富文本内容 */
function buildFallbackDetailHtml(product: Partial<ProductDetailViewModel>): string {
  const highlightHtml = (product.highlights || [])
    .map((item) => `<li>${escapeHtml(item.text)}</li>`)
    .join('');
  const promotionHtml = (product.promotions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');

  return `
    <section>
      <h3>${escapeHtml(product.title || '商品介绍')}</h3>
      <p>${escapeHtml(product.description || '暂无商品详情介绍')}</p>
    </section>
    ${highlightHtml ? `<section><h3>核心亮点</h3><ul>${highlightHtml}</ul></section>` : ''}
    ${promotionHtml ? `<section><h3>优惠信息</h3><ul>${promotionHtml}</ul></section>` : ''}
  `.trim();
}

/** 将后端商品详情映射为页面使用的展示模型 */
function mapApiProductToViewModel(source: Product): ProductDetailViewModel {
  const currentPrice = source.salePrice > 0 ? source.salePrice : source.price;
  const originalPrice = source.salePrice > 0 && source.salePrice < source.price ? source.price : 0;
  const images = normalizeImages(source.images, source.main_image);

  const viewModel: ProductDetailViewModel = {
    id: source.id,
    code: source.code,
    title: source.name,
    description: source.description,
    price: formatApiPrice(currentPrice),
    originalPrice: originalPrice ? formatApiPrice(originalPrice) : undefined,
    reviewCount: source.favorite_count || 0,
    rating: source.favorite_count ? 4.8 : 0,
    images,
    promotions: source.tags?.map((tag) => tag.name).filter(Boolean) || [],
    memoryOptions: [],
    colorOptions: [],
    services: [],
    guarantees: [],
    highlights: source.tags?.map((tag) => ({ text: tag.name })) || [],
    detailHtml: source.detail_html?.trim()
  };

  if (!viewModel.detailHtml) {
    viewModel.detailHtml = buildFallbackDetailHtml(viewModel);
  }

  return viewModel;
}

/** 将本地 mock 商品映射为页面使用的展示模型 */
function mapMockProductToViewModel(source: Record<string, any>): ProductDetailViewModel {
  const viewModel: ProductDetailViewModel = {
    id: Number(source.id),
    code: source.code,
    title: source.title || source.name || '未命名商品',
    description: source.description || '',
    price: Number(source.price || 0),
    originalPrice: source.originalPrice,
    reviewCount: source.reviewCount || 0,
    rating: source.rating || 0,
    images: normalizeImages(source.images, source.main_image),
    promotions: Array.isArray(source.promotions) ? source.promotions : [],
    memoryOptions: Array.isArray(source.memoryOptions) ? source.memoryOptions : [],
    colorOptions: Array.isArray(source.colorOptions) ? source.colorOptions : [],
    services: Array.isArray(source.services) ? source.services : [],
    guarantees: Array.isArray(source.guarantees) ? source.guarantees : [],
    highlights: Array.isArray(source.highlights) ? source.highlights : [],
    screenSize: source.screenSize,
    screenType: source.screenType,
    battery: source.battery,
    protectionClass: source.protectionClass,
    detailHtml:
      typeof source.detail_html === 'string' && source.detail_html.trim()
        ? source.detail_html
        : undefined
  };

  if (!viewModel.detailHtml) {
    viewModel.detailHtml = buildFallbackDetailHtml(viewModel);
  }

  return viewModel;
}

/** 将后端商品转换为 ProductCard 可直接展示的数据 */
function mapApiProductToCardProduct(source: Product): Product {
  const currentPrice = source.salePrice > 0 ? source.salePrice : source.price;
  const originalPrice =
    source.salePrice > 0 && source.salePrice < source.price ? source.price : source.salePrice;

  return {
    ...source,
    price: formatApiPrice(currentPrice),
    salePrice: originalPrice > 0 ? formatApiPrice(originalPrice) : 0,
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

const richTextContent = computed(() => product.value?.detailHtml || '');

const guaranteeList = computed(() => {
  if (product.value?.guarantees?.length) return product.value.guarantees;
  return [
    { name: '7天价保', description: '7天内降价可补差价' },
    { name: '官方正品', description: '100%原厂正品' },
    { name: '全国联保', description: '全国联保服务' },
    { name: '官方发货&售后', description: '官方发货与售后支持' }
  ];
});

/** 商品切换后同步默认选中的图、颜色、版本和数量 */
watchEffect(() => {
  if (product.value) {
    activeImage.value = product.value.images?.[0] || '';
    selectedColor.value = product.value.colorOptions?.[0]?.name || '';
    selectedMemory.value = product.value.memoryOptions?.[0] || '256GB';
    quantity.value = 1;
    selectedServices.value = [];
  }
});

const relatedProducts = computed(() => detailData.value?.relatedItems ?? []);
</script>
