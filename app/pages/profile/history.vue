<script setup lang="ts">
interface HistoryEntry {
  id: string;
  type: 'product' | 'article';
  title: string;
  image: string;
  meta: string;
  viewedAt: string;
}

const isLoading = ref(true);
const error = ref(false);
const history = ref<HistoryEntry[]>([]);

const loadHistory = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await $fetch('/api/user/history');
    history.value = data?.data || [];
  } catch (err: any) {
    error.value = true;
    console.error('加载浏览历史失败:', err);
  } finally {
    isLoading.value = false;
  }
};

const clearHistory = () => {
  if (!confirm('确定清空浏览历史？')) return;
  history.value = [];
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0)
    return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (days === 1)
    return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

onMounted(loadHistory);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-fg">浏览历史</h1>
      <UButton
        v-if="history.length > 0"
        color="neutral"
        variant="outline"
        size="sm"
        @click="clearHistory"
      >
        清空历史
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="flex items-center justify-center gap-2 mb-4">
        <div class="i-carbon-warning text-5xl text-fg-subtle mb-4" />
      </div>
      <p class="text-fg-muted mb-4">加载失败</p>
      <UButton color="neutral" variant="outline" @click="loadHistory">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="history.length === 0" class="text-center py-20">
      <div class="flex items-center justify-center gap-2 mb-4">
        <div class="i-carbon-time text-5xl text-fg-subtle mb-4" />
      </div>
      <p class="text-fg-muted">暂无浏览记录</p>
    </div>

    <!-- History List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in history"
        :key="item.id"
        class="flex items-center gap-4 bg-surface-muted rounded-xl p-3 hover:bg-elevated transition-colors"
      >
        <img
          :src="item.image"
          :alt="item.title"
          class="h-14 w-14 rounded-lg object-cover shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-fg truncate">{{ item.title }}</p>
          <p class="text-xs text-fg-muted mt-1">{{ item.meta }}</p>
        </div>
        <span class="text-xs text-fg-subtle shrink-0">{{ formatTime(item.viewedAt) }}</span>
      </div>
    </div>
  </div>
</template>
