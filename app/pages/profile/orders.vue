<script setup lang="ts">
import { useOrderApi } from '~/composables/api/order';
import type { OrderBrief, OrderStatus } from '~/composables/api/order';

const { list } = useOrderApi();

const isLoading = ref(true);
const error = ref(false);
const orders = ref<OrderBrief[]>([]);
const activeTab = ref<OrderStatus | 'all'>('all');

const tabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待付款', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  0: { label: '待付款', color: 'text-orange-500' },
  1: { label: '已支付', color: 'text-blue-500' },
  2: { label: '已发货', color: 'text-purple-500' },
  3: { label: '已完成', color: 'text-green-500' },
  4: { label: '已取消', color: 'text-gray-400' }
};

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value;
  return orders.value.filter((o) => o.status === activeTab.value);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const loadOrders = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await list();
    orders.value = data?.orders || [];
  } catch (err: any) {
    error.value = true;
    console.error('加载订单失败:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadOrders);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的订单</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 overflow-x-auto pb-2 no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="String(tab.value)"
        class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadOrders">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-20">
      <div class="i-carbon-package text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无订单</p>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">订单号：{{ order.order_no }}</span>
          <span :class="[statusMap[order.status].color, 'text-sm font-medium']">
            {{ statusMap[order.status].label }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            ¥{{ order.total_amount.toFixed(2) }}
          </span>
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
