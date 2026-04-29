<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-8">
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

            <!-- Options -->
            <div class="space-y-6">
              <!-- Color -->
              <div v-if="product?.colorOptions?.length">
                <label class="text-sm font-bold text-gray-900 dark:text-white block mb-3"
                  >颜色</label
                >
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="color in product.colorOptions"
                    :key="color.name"
                    class="px-4 py-2 rounded-full border-2 text-sm font-medium transition-all"
                    :class="
                      selectedColor === color.name
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    "
                    @click="selectedColor = color.name"
                  >
                    <span
                      class="inline-block w-3 h-3 rounded-full mr-2"
                      :style="{ backgroundColor: color.hex }"
                    ></span>
                    {{ color.name }}
                  </button>
                </div>
              </div>

              <!-- Memory/Version -->
              <div v-if="product?.memoryOptions?.length">
                <label class="text-sm font-bold text-gray-900 dark:text-white block mb-3"
                  >版本</label
                >
                <div class="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    v-for="mem in product.memoryOptions"
                    :key="mem"
                    class="py-2.5 sm:py-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-all"
                    :class="
                      selectedMemory === mem
                        ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    "
                    @click="selectedMemory = mem"
                  >
                    {{ mem }}
                  </button>
                </div>
              </div>

              <!-- Quantity -->
              <div>
                <label class="text-sm font-bold text-gray-900 dark:text-white block mb-3"
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

            <!-- Services (保障服务) -->
            <div
              v-if="product?.services?.length"
              class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3"
            >
              <p class="text-xs font-bold text-gray-900 dark:text-white mb-3">保障服务(可选)</p>
              <div v-for="service in product.services" :key="service.id" class="space-y-2">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="selectedServices"
                    type="checkbox"
                    :value="service.id"
                    class="mt-1"
                  />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ service.name }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      <span v-if="service.discount" class="text-red-600 font-bold">{{
                        service.discount
                      }}</span>
                      ¥{{ service.price }}
                      <span v-if="service.originalPrice" class="line-through text-gray-500"
                        >¥{{ service.originalPrice }}</span
                      >
                    </p>
                  </div>
                </label>
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
              v-if="product?.highlights?.length"
              class="grid grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-b border-gray-200 dark:border-gray-800"
            >
              <div v-for="(highlight, idx) in product.highlights" :key="idx" class="text-center">
                <div class="mb-1 sm:mb-2 text-xl sm:text-2xl">✨</div>
                <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {{ highlight.text }}
                </p>
              </div>
            </div>

            <!-- Specs and Description Section -->
            <div class="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-6">
              <!-- Section Title -->
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">商品详情</h2>

              <!-- Two Column Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <!-- Specifications -->
                <div class="space-y-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">规格参数</h3>
                  <dl class="space-y-3">
                    <div
                      class="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      <dt class="text-sm text-gray-600 dark:text-gray-400 font-medium">屏幕尺寸</dt>
                      <dd class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ product?.screenSize || '6.7英寸' }}
                      </dd>
                    </div>
                    <div
                      class="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      <dt class="text-sm text-gray-600 dark:text-gray-400 font-medium">屏幕类型</dt>
                      <dd class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ product?.screenType || 'AMOLED' }}
                      </dd>
                    </div>
                    <div
                      class="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      <dt class="text-sm text-gray-600 dark:text-gray-400 font-medium">电池容量</dt>
                      <dd class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ product?.battery || '4300mAh' }}
                      </dd>
                    </div>
                    <div
                      class="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      <dt class="text-sm text-gray-600 dark:text-gray-400 font-medium">防护等级</dt>
                      <dd class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ product?.protectionClass || 'IP68' }}
                      </dd>
                    </div>
                  </dl>
                </div>

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
            v-for="(related, idx) in relatedProducts"
            :key="related.id"
            :class="idx > 1 ? 'hidden sm:block' : ''"
          >
            <ProductCard :product="related" />
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
import { useProducts } from '~/composables/useProducts';

const route = useRoute();
const { getProductById, products, loadProducts } = useProducts();

const product = computed(() => getProductById(Number(route.params.id)));
const activeImage = ref('');
const selectedColor = ref('');
const selectedMemory = ref('');
const selectedServices = ref<string[]>([]);
const quantity = ref(1);

const guaranteeList = computed(() => {
  if (product.value?.guarantees?.length) return product.value.guarantees;
  return [
    { name: '7天价保', description: '7天内降价可补差价' },
    { name: '官方正品', description: '100%原厂正品' },
    { name: '全国联保', description: '全国联保服务' },
    { name: '官方发货&售后', description: '官方发货与售后支持' }
  ];
});

// Initialize defaults when product loads
watchEffect(() => {
  if (product.value) {
    activeImage.value = product.value.images?.[0] || '';
    selectedColor.value = product.value.colorOptions?.[0]?.name || '';
    selectedMemory.value = product.value.memoryOptions?.[0] || '256GB';
  }
});

const relatedProducts = computed(() =>
  products.value.filter((p) => p.id !== product.value?.id).slice(0, 4)
);

onMounted(async () => {
  await loadProducts();
});
</script>
