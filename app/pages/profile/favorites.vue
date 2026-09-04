<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import { useFavoriteApi } from '~/composables/api/favorite';
import type { FavoriteItem } from '~/composables/api/favorite';
import { useFavoriteStore } from '~/stores/favorite';

const { list, remove } = useFavoriteApi();
const favoriteStore = useFavoriteStore();

const isLoading = ref(true);
const error = ref(false);
const activeTab = ref<'product' | 'article'>('product');
const favorites = ref<FavoriteItem[]>([]);

const productFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'product'));
const articleFavorites = computed(() => favorites.value.filter((f) => f.item_type === 'article'));

const displayItems = computed(() =>
  activeTab.value === 'product' ? productFavorites.value : articleFavorites.value
);

const loadFavorites = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await list();
    favorites.value = data?.favorites || [];
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

/** 取消收藏：接口的 item_id 是商品/文章 ID（非收藏记录 ID），见接口文档「收藏模块」 */
const handleRemove = async (item: FavoriteItem) => {
  try {
    await remove({ item_id: item.item_id, item_type: activeTab.value });
    favorites.value = favorites.value.filter((f) => f.id !== item.id);
    // 同步全局缓存：返回列表/详情页时收藏态立即一致，无需重新查询
    favoriteStore.markRemoved(activeTab.value, item.item_id);
    const toast = useToast();
    toast.add({ id: 'fav-remove-success', title: '已取消收藏', color: 'success' });
  } catch {
    const toast = useToast();
    toast.add({ id: 'fav-remove-error', title: '操作失败', color: 'error' });
  }
};

onMounted(loadFavorites);
</script>

<template>
  <div>
    <PageHeader title="我的收藏" subtitle="管理您收藏的商品和文章" class="mt-2" />

    <!-- Tabs -->
    <div class="bg-surface rounded-2xl shadow-sm mb-6 overflow-hidden">
      <div class="flex">
        <button
          class="flex-1 relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200"
          :class="
            activeTab === 'product'
              ? 'text-brand bg-brand-soft/50'
              : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
          "
          @click="activeTab = 'product'"
        >
          <span class="i-carbon-shopping-cart w-4 h-4" />
          商品
          <span
            class="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center"
            :class="
              activeTab === 'product' ? 'bg-brand text-on-brand' : 'bg-surface-muted text-fg-subtle'
            "
          >
            {{ productFavorites.length }}
          </span>
          <span
            v-if="activeTab === 'product'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
          />
        </button>
        <button
          class="flex-1 relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200"
          :class="
            activeTab === 'article'
              ? 'text-brand bg-brand-soft/50'
              : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
          "
          @click="activeTab = 'article'"
        >
          <span class="i-carbon-document w-4 h-4" />
          文章
          <span
            class="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center"
            :class="
              activeTab === 'article' ? 'bg-brand text-on-brand' : 'bg-surface-muted text-fg-subtle'
            "
          >
            {{ articleFavorites.length }}
          </span>
          <span
            v-if="activeTab === 'article'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
          />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="i in 8"
        :key="i"
        class="bg-surface rounded-2xl overflow-hidden shadow-sm animate-pulse"
      >
        <div class="aspect-square bg-surface-muted" />
        <div class="p-4 space-y-2">
          <div class="h-4 w-3/4 bg-surface-muted rounded" />
          <div class="h-5 w-1/3 bg-surface-muted rounded" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div
        class="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-warning text-3xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">加载失败</p>
      <p class="text-sm text-fg-subtle mb-6">请检查网络连接后重试</p>
      <UButton color="primary" variant="outline" @click="loadFavorites">重新加载</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="displayItems.length === 0" class="text-center py-20">
      <div
        class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-favorite text-4xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">
        暂无收藏{{ activeTab === 'product' ? '商品' : '文章' }}
      </p>
      <p class="text-sm text-fg-subtle">去发现你喜欢的内容吧</p>
    </div>

    <!-- Product Grid -->
    <div v-else-if="activeTab === 'product'" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
      >
        <div class="relative aspect-square bg-surface-muted overflow-hidden">
          <UiImage
            v-if="item.item_image"
            :src="item.item_image"
            :alt="item.item_title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span v-else class="i-carbon-package w-12 h-12 text-fg-subtle" />
          <!-- 取消收藏按钮 -->
          <button
            class="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
            @click.stop="handleRemove(item)"
          >
            <span class="i-carbon-favorite-filled w-4 h-4 text-red-500" />
          </button>
        </div>
        <div class="p-4">
          <p
            class="text-sm font-medium text-fg line-clamp-1 group-hover:text-brand transition-colors"
          >
            {{ item.item_title }}
          </p>
          <p class="text-lg font-bold text-fg mt-2">¥{{ item.price || '0.00' }}</p>
        </div>
      </div>
    </div>

    <!-- Article List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
      >
        <div class="flex gap-4 p-4">
          <div
            class="w-28 h-28 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden"
          >
            <UiImage
              v-if="item.item_image"
              :src="item.item_image"
              :alt="item.item_title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span v-else class="i-carbon-document text-3xl text-fg-subtle" />
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <p
                class="text-sm font-medium text-fg line-clamp-1 group-hover:text-brand transition-colors"
              >
                {{ item.item_title }}
              </p>
              <p class="text-xs text-fg-subtle mt-1 line-clamp-2">{{ item.item_description }}</p>
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-fg-subtle">收藏于 {{ item.created_at?.slice(0, 10) }}</span>
              <button
                class="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                @click.stop="handleRemove(item)"
              >
                取消收藏
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
