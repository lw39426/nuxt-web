<script setup lang="ts">
import { useOrderApi } from '~/composables/api/order';
import type { OrderBrief, OrderStatus } from '~/composables/api/order';

const { list } = useOrderApi();

const isLoading = ref(true);
const error = ref(false);
const orders = ref<OrderBrief[]>([]);
const activeTab = ref<OrderStatus | 'all'>('all');

const tabs: { label: string; value: OrderStatus | 'all'; count?: number }[] = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

const statusMap: Record<
  OrderStatus,
  { label: string; variant: 'brand' | 'success' | 'warning' | 'neutral' | 'error'; bg: string }
> = {
  0: { label: '待付款', variant: 'warning', bg: 'bg-amber-50 text-amber-600' },
  1: { label: '已支付', variant: 'brand', bg: 'bg-brand-soft text-brand' },
  2: { label: '已发货', variant: 'brand', bg: 'bg-blue-50 text-blue-600' },
  3: { label: '已完成', variant: 'success', bg: 'bg-green-50 text-green-600' },
  4: { label: '已取消', variant: 'neutral', bg: 'bg-surface-muted text-fg-subtle' }
};

const tabCounts = computed(() => {
  const counts: Record<string, number> = { all: orders.value.length };
  for (const tab of tabs.slice(1)) {
    counts[String(tab.value)] = orders.value.filter((o) => o.status === tab.value).length;
  }
  return counts;
});

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value;
  return orders.value.filter((o) => o.status === activeTab.value);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const loadOrders = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await list();
    orders.value = data?.orders || [];
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadOrders);
</script>

<template>
  <div>
    <PageHeader title="我的订单" subtitle="查看和管理您的所有订单" />

    <!-- Tab 筛选 -->
    <div class="bg-surface rounded-2xl shadow-sm mb-6 overflow-hidden">
      <div class="flex overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="String(tab.value)"
          class="relative flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200"
          :class="
            activeTab === tab.value
              ? 'text-brand bg-brand-soft/50'
              : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
          "
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tabCounts[String(tab.value)] > 0"
            class="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center"
            :class="
              activeTab === tab.value ? 'bg-brand text-on-brand' : 'bg-surface-muted text-fg-subtle'
            "
          >
            {{ tabCounts[String(tab.value)] }}
          </span>
          <!-- 选中指示条 -->
          <span
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
          />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-surface rounded-2xl p-5 shadow-sm animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="h-4 w-32 bg-surface-muted rounded" />
          <div class="h-6 w-16 bg-surface-muted rounded-full" />
        </div>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-surface-muted" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-48 bg-surface-muted rounded" />
            <div class="h-3 w-24 bg-surface-muted rounded" />
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
      <UButton color="primary" variant="outline" @click="loadOrders">重新加载</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-20">
      <div
        class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-shopping-bag text-4xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">
        暂无{{ activeTab === 'all' ? '' : statusMap[activeTab as OrderStatus]?.label }}订单
      </p>
      <p class="text-sm text-fg-subtle">去看看心仪的商品吧</p>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <!-- 卡片头部 -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-line bg-surfaceMuted/50"
        >
          <div class="flex items-center gap-4">
            <span class="text-sm text-fg-muted">订单号</span>
            <span class="text-sm font-medium text-fg font-mono">{{ order.order_no }}</span>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            :class="statusMap[order.status].bg"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-current" />
            {{ statusMap[order.status].label }}
          </span>
        </div>

        <!-- 商品信息 -->
        <div class="p-5">
          <div class="flex items-center gap-4">
            <div
              class="w-20 h-20 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden"
            >
              <UiImage
                v-if="(order as any).items?.[0]?.image"
                :src="(order as any).items[0].image"
                class="w-full h-full object-cover"
              />
              <span v-else class="i-carbon-package w-8 h-8 text-fg-subtle" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-fg line-clamp-1">
                {{ (order as any).items?.[0]?.title || '商品名称' }}
              </p>
              <p class="text-xs text-fg-subtle mt-1">
                {{ (order as any).items?.[0]?.spec || '' }}
                <span v-if="(order as any).items?.length">
                  · x{{ (order as any).items[0].quantity || 1 }}</span
                >
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-lg font-bold text-fg">¥{{ order.total_amount.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- 卡片底部 -->
        <div
          class="flex items-center justify-between px-5 py-3 border-t border-line bg-surfaceMuted/30"
        >
          <span class="text-xs text-fg-subtle">
            {{ formatDate(order.created_at) }} {{ formatTime(order.created_at) }}
          </span>
          <div class="flex items-center gap-2">
            <UButton color="gray" variant="ghost" size="xs">查看详情</UButton>
            <UButton v-if="order.status === 0" color="primary" size="xs">去支付</UButton>
            <UButton v-if="order.status === 3" color="gray" variant="outline" size="xs"
              >再次购买</UButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
