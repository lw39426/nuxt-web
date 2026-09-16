<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';

interface HistoryItem {
  id: number;
  title: string;
  image: string;
  price: number;
  viewedAt: string;
}

interface GroupedHistory {
  label: string;
  items: HistoryItem[];
}

const isLoading = ref(true);
const error = ref(false);

const historyData = ref<HistoryItem[]>([
  {
    id: 1,
    title: 'Apple iPhone 15 Pro Max 256GB 原色钛金属',
    image: '',
    price: 9999,
    viewedAt: '今天 14:30'
  },
  { id: 2, title: 'Sony WH-1000XM5 无线降噪耳机', image: '', price: 2699, viewedAt: '今天 11:20' },
  { id: 3, title: 'MacBook Pro 14英寸 M3芯片', image: '', price: 14999, viewedAt: '今天 09:15' },
  { id: 4, title: 'iPad Air 5 64GB WLAN版', image: '', price: 4799, viewedAt: '昨天 20:45' },
  { id: 5, title: 'AirPods Pro 第二代 USB-C', image: '', price: 1899, viewedAt: '昨天 16:30' },
  { id: 6, title: 'Dell UltraSharp 27 4K 显示器', image: '', price: 3899, viewedAt: '昨天 10:00' },
  { id: 7, title: 'Logitech MX Master 3S 鼠标', image: '', price: 699, viewedAt: '8月20日 18:20' },
  { id: 8, title: 'Keychron K2 机械键盘', image: '', price: 548, viewedAt: '8月20日 15:10' }
]);

const groupedHistory = computed<GroupedHistory[]>(() => {
  const groups: Record<string, HistoryItem[]> = {};
  for (const item of historyData.value) {
    const label = item.viewedAt.split(' ')[0] || '其他';
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
});

const loadHistory = async () => {
  isLoading.value = true;
  error.value = false;
  await new Promise((r) => setTimeout(r, 500));
  isLoading.value = false;
};

const handleClear = () => {
  if (!confirm('确定清空浏览历史？')) return;
  historyData.value = [];
  const toast = useToast();
  toast.add({ id: 'history-clear-success', title: '已清空浏览历史', color: 'success' });
};

onMounted(loadHistory);
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <PageHeader title="浏览历史" subtitle="查看您最近浏览过的商品" class="mt-2" />
      <UButton
        v-if="historyData.length > 0"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="handleClear"
      >
        <template #leading>
          <span class="i-carbon-trash-can w-4 h-4" />
        </template>
        清空
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-6">
      <div v-for="i in 2" :key="i">
        <div class="h-4 w-16 bg-surface-muted rounded mb-3 animate-pulse" />
        <div class="bg-surface rounded-2xl shadow-sm">
          <div
            v-for="j in 3"
            :key="j"
            class="flex items-center gap-4 p-4 animate-pulse"
            :class="{ 'border-t border-line': j > 1 }"
          >
            <div class="w-16 h-16 rounded-xl bg-surface-muted" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-48 bg-surface-muted rounded" />
              <div class="h-5 w-24 bg-surface-muted rounded" />
            </div>
            <div class="h-3 w-12 bg-surface-muted rounded" />
          </div>
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
      <UButton color="primary" variant="outline" @click="loadHistory">重新加载</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="historyData.length === 0" class="text-center py-20">
      <div
        class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-time text-4xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">暂无浏览记录</p>
      <p class="text-sm text-fg-subtle">去逛逛吧</p>
    </div>

    <!-- History List -->
    <div v-else class="space-y-6">
      <div v-for="group in groupedHistory" :key="group.label">
        <div class="flex items-center gap-2 mb-3">
          <span class="i-carbon-calendar text-sm text-fg-subtle" />
          <h3 class="text-sm font-medium text-fg">{{ group.label }}</h3>
          <span class="text-xs text-fg-subtle">{{ group.items.length }} 件商品</span>
        </div>

        <div class="bg-surface ring-1 ring-line rounded-2xl overflow-hidden shadow-sm">
          <div
            v-for="(item, idx) in group.items"
            :key="item.id"
            class="group flex items-center gap-4 p-4 transition-colors duration-200 cursor-pointer hover:bg-surface-muted dark:hover:bg-elevated"
            :class="{ 'border-t border-line': idx > 0 }"
          >
            <div
              class="w-16 h-16 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
            >
              <UiImage v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
              <span v-else class="i-carbon-package w-8 h-8 text-fg-subtle" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-sm font-medium text-fg line-clamp-1 group-hover:text-skin transition-colors"
              >
                {{ item.title }}
              </p>
              <p class="text-base font-bold text-fg mt-1">¥{{ item.price.toLocaleString() }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-xs text-fg-subtle" :title="item.viewedAt">
                {{ item.viewedAt.split(' ')[1] }}
              </span>
              <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <UButton color="neutral" variant="ghost" size="xs" aria-label="加入购物车">
                  <span
                    class="i-carbon-shopping-cart w-3.5 h-3.5 transition-colors group-hover:text-skin"
                  />
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
