<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center min-h-[50vh]">
      <div class="i-carbon-circle-dash text-3xl animate-spin text-gray-400" />
    </div>
    <div
      v-else-if="product"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8"
    >
      <!-- Breadcrumbs 面包屑部分 -->
      <nav class="hidden sm:flex text-sm text-gray-500 mb-8">
        <ol class="flex items-center space-x-2">
          <li>
            <NuxtLink to="/" class="hover:text-gray-900 dark:hover:text-white">首页</NuxtLink>
          </li>
          <li><span class="mx-2">/</span></li>
          <li>
            <NuxtLink to="/products" class="hover:text-gray-900 dark:hover:text-white"
              >商品</NuxtLink
            >
          </li>
          <li><span class="mx-2">/</span></li>
          <li class="text-gray-900 dark:text-white font-medium truncate">
            {{ product?.title }}
          </li>
        </ol>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-20">
        <!-- Gallery (Left, larger) 商品图片展示区域 -->
        <div class="lg:col-span-7 space-y-6">
          <div
            class="aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center relative group"
          >
            <img
              :src="activeImage"
              class="w-full h-full object-contain p-4 sm:p-8 lg:p-12 transition-transform duration-500 group-hover:scale-105"
            />
            <button
              class="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black transition-colors"
            >
              <div class="i-carbon-maximize text-xl" />
            </button>
          </div>
          <div class="flex gap-4 overflow-x-auto pb-2">
            <button
              v-for="img in product?.images"
              :key="img"
              class="w-20 h-20 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-xl border-2 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-all"
              :class="
                activeImage === img
                  ? 'border-black dark:border-white'
                  : 'border-transparent hover:border-gray-200'
              "
              @click="activeImage = img"
            >
              <img :src="img" class="w-full h-full object-contain p-2" />
            </button>
          </div>
          <!-- 商品富文本展示 -->
          <section
            v-if="richTextContent"
            class="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 p-6 sm:p-8"
          >
            <div class="flex items-center justify-between gap-3 mb-6">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">图文详情</h2>
              <span class="text-xs text-gray-500 dark:text-gray-400">商品卖点与详细说明</span>
            </div>
            <article
              class="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
            >
              <div v-html="richTextContent"></div>
            </article>
          </section>
        </div>

        <!-- Info (Right, Sticky) 商品详细信息区域 -->
        <div class="lg:col-span-5">
          <div class="space-y-6 sm:space-y-8 lg:sticky lg:top-24">
            <div>
              <h1
                class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"
              >
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
                <span class="text-sm text-gray-500">{{ product?.reviewCount }} reviews</span>
              </div>
            </div>

            <!-- Price Section -->
            <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
              <div class="flex items-baseline gap-3">
                <span class="text-3xl sm:text-4xl font-bold text-red-600"
                  >¥{{ product?.price }}</span
                >
                <span v-if="product?.originalPrice" class="text-lg text-gray-500 line-through"
                  >¥{{ product.originalPrice }}</span
                >
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">到手价</p>
            </div>

            <!-- Promotions -->
            <div v-if="product?.promotions?.length" class="space-y-2">
              <div
                v-for="(promo, idx) in product.promotions"
                :key="idx"
                class="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
              >
                <span class="text-red-500 font-bold mt-0.5">·</span>
                <span>{{ promo }}</span>
              </div>
            </div>

            <div class="h-px bg-gray-100 dark:bg-gray-800" />

            <!-- 颜色、版本、数量Options -->
            <div class="space-y-3">
              <!-- Quantity -->
              <div>
                <label class="text-sm font-bold text-gray-900 dark:text-white block mb-1"
                  >数量</label
                >
                <div
                  class="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg w-fit"
                >
                  <button
                    class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="quantity = Math.max(1, quantity - 1)"
                  >
                    −
                  </button>
                  <span class="w-8 text-center font-medium">{{ quantity }}</span>
                  <button
                    class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    @click="quantity = quantity + 1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Specs and Description Section -->
            <div class="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-6">
              <!-- Two Column Grid -->
              <div class="grid grid-cols-1 gap-6 sm:gap-8">
                <!-- Description -->
                <div class="space-y-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">商品描述</h3>
                  <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                    <p>{{ product?.description }}</p>
                    <p
                      v-if="product?.title?.includes('Reno')"
                      class="text-gray-600 dark:text-gray-400"
                    >
                      OPPO Reno
                      系列致力于为消费者提供最好的拍照体验和电池续航能力。该产品集合了最新的技术创新和精致的工业设计。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="hidden sm:flex gap-3 pt-4">
              <button
                class="flex-1 bg-black dark:bg-white text-white dark:text-black h-12 rounded-lg font-bold text-base hover:opacity-90 transition-opacity shadow-md"
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
              <p class="text-xs font-bold text-gray-900 dark:text-white">服务保障</p>
              <div
                v-for="guarantee in guaranteeList"
                :key="guarantee.name"
                class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
              >
                <span class="text-green-600">✓</span>
                <span>{{ guarantee.name }}</span>
              </div>
            </div>

            <!-- Highlights Grid (Above Product Details) -->
            <div
              class="grid grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-b border-gray-200 dark:border-gray-800"
            >
              <div v-for="(highlight, idx) in product.highlights" :key="idx" class="text-center">
                <div class="mb-1 sm:mb-2 text-xl sm:text-2xl">✨</div>
                <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {{ highlight.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products 推荐相关商品 -->
      <div
        class="mt-14 sm:mt-20 lg:mt-32 border-t border-gray-100 dark:border-gray-800 pt-10 sm:pt-14 lg:pt-20"
      >
        <div class="flex items-center justify-between mb-12">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">你可能也喜欢</h2>
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
        class="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-black/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 p-3"
      >
        <div class="grid grid-cols-2 gap-3">
          <button
            class="w-full bg-black dark:bg-white text-white dark:text-black h-11 rounded-lg font-bold text-sm"
          >
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

const apiProduct = ref<Product | null>(null);
const relatedProducts = ref<Product[]>([]);
const isLoading = ref(true);
const activeImage = ref('');
const selectedColor = ref('');
const selectedMemory = ref('');
const selectedServices = ref<string[]>([]);
const quantity = ref(1);

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

const fallbackProduct = computed(() => {
  const localProduct = getProductByIdentifier(productIdentifier.value);
  return localProduct ? mapMockProductToViewModel(localProduct) : null;
});

const product = computed(() =>
  apiProduct.value ? mapApiProductToViewModel(apiProduct.value) : fallbackProduct.value
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

/** 加载相关推荐商品 */
async function loadRelatedProducts(productCode?: string): Promise<void> {
  if (!productCode) {
    return;
  }

  try {
    const response = await related(productCode, { limit: 4 });
    relatedProducts.value = Array.isArray(response?.related)
      ? response.related
          .filter((item) => item.id !== product.value?.id)
          .slice(0, 4)
          .map((item) => mapApiProductToCardProduct(item))
      : [];
  } catch (error) {
    console.error('Failed to load related products from API, fallback to mock data:', error);
  }
}

/** 加载详情页数据，后端接口失败时自动回退到本地 mock 商品 */
async function loadProductDetail(): Promise<void> {
  if (!productIdentifier.value) {
    apiProduct.value = null;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  apiProduct.value = null;

  const [, detailResult] = await Promise.allSettled([
    loadProducts(),
    getDetail(productIdentifier.value)
  ]);

  if (detailResult.status === 'fulfilled') {
    apiProduct.value = detailResult.value;
  } else {
    console.error(
      'Failed to load product detail from API, fallback to mock data:',
      detailResult.reason
    );
  }

  const relatedProductCode =
    detailResult.status === 'fulfilled'
      ? detailResult.value.code
      : getProductByIdentifier(productIdentifier.value)?.code;

  await loadRelatedProducts(relatedProductCode);

  isLoading.value = false;
}

watch(
  productIdentifier,
  async () => {
    await loadProductDetail();
  },
  { immediate: true }
);
</script>
