<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
interface Comment {
  id: number;
  targetTitle: string;
  targetImage: string;
  content: string;
  rating: number;
  createdAt: string;
  status: 'pending' | 'published';
}

const isLoading = ref(true);
const error = ref(false);
const activeTab = ref<'pending' | 'published'>('published');

const comments = ref<Comment[]>([
  {
    id: 1,
    targetTitle: 'Apple iPhone 15 Pro Max 256GB 原色钛金属',
    targetImage: '',
    content:
      '非常满意！手感很好，拍照效果出色，系统流畅。电池续航也比我预期的要好，一天重度使用没问题。',
    rating: 5,
    createdAt: '2026-08-20',
    status: 'published'
  },
  {
    id: 2,
    targetTitle: 'Sony WH-1000XM5 无线降噪耳机',
    targetImage: '',
    content: '降噪效果一流，续航也很给力，推荐购买。佩戴舒适度比上一代提升不少。',
    rating: 4,
    createdAt: '2026-08-15',
    status: 'published'
  },
  {
    id: 3,
    targetTitle: 'MacBook Pro 14英寸 M3芯片',
    targetImage: '',
    content: '',
    rating: 0,
    createdAt: '2026-08-25',
    status: 'pending'
  }
]);

const filteredComments = computed(() => comments.value.filter((c) => c.status === activeTab.value));

const publishedCount = computed(
  () => comments.value.filter((c) => c.status === 'published').length
);
const pendingCount = computed(() => comments.value.filter((c) => c.status === 'pending').length);

const loadComments = async () => {
  isLoading.value = true;
  error.value = false;
  await new Promise((r) => setTimeout(r, 500));
  isLoading.value = false;
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => i < rating);
};

onMounted(loadComments);
</script>

<template>
  <div>
    <PageHeader title="我的评论" subtitle="查看和管理您的商品评价" class="mt-2" />

    <!-- Tabs -->
    <div class="bg-surface ring-1 ring-line rounded-2xl shadow-sm mb-6 overflow-hidden">
      <div class="flex">
        <button
          class="flex-1 relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200"
          :class="
            activeTab === 'published'
              ? 'text-skin-strong bg-skin-soft/50'
              : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
          "
          @click="activeTab = 'published'"
        >
          <span class="i-carbon-star w-4 h-4" />
          已评价
          <span
            class="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center"
            :class="
              activeTab === 'published' ? 'bg-skin text-on-skin' : 'bg-surface-muted text-fg-subtle'
            "
          >
            {{ publishedCount }}
          </span>
          <span
            v-if="activeTab === 'published'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-skin-tab rounded-full"
          />
        </button>
        <button
          class="flex-1 relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200"
          :class="
            activeTab === 'pending'
              ? 'text-skin-strong bg-skin-soft/50'
              : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
          "
          @click="activeTab = 'pending'"
        >
          <span class="i-carbon-clock w-4 h-4" />
          待评价
          <span
            class="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center"
            :class="
              activeTab === 'pending' ? 'bg-skin text-on-skin' : 'bg-surface-muted text-fg-subtle'
            "
          >
            {{ pendingCount }}
          </span>
          <span
            v-if="activeTab === 'pending'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-skin-tab rounded-full"
          />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-surface rounded-2xl p-5 shadow-sm animate-pulse">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-surface-muted" />
          <div class="h-4 w-48 bg-surface-muted rounded" />
        </div>
        <div class="flex gap-1 mb-3">
          <div v-for="j in 5" :key="j" class="w-4 h-4 rounded bg-surface-muted" />
        </div>
        <div class="h-4 w-full bg-surface-muted rounded mb-2" />
        <div class="h-4 w-2/3 bg-surface-muted rounded" />
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
      <UButton color="primary" variant="outline" @click="loadComments">重新加载</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredComments.length === 0" class="text-center py-20">
      <div
        class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-chat text-4xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">
        暂无{{ activeTab === 'published' ? '已评价' : '待评价' }}内容
      </p>
      <p class="text-sm text-fg-subtle">
        {{ activeTab === 'published' ? '去评价购买的商品吧' : '所有商品都已评价' }}
      </p>
    </div>

    <!-- Comment List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="group/comment bg-surface ring-1 ring-line rounded-2xl shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:ring-line-strong"
      >
        <!-- 头部：商品 + 评分/日期 + 状态 -->
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-300 group-hover/comment:scale-105"
          >
            <UiImage
              v-if="comment.targetImage"
              :src="comment.targetImage"
              class="w-full h-full object-cover"
            />
            <span v-else class="i-carbon-package w-6 h-6 text-fg-subtle" />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-fg truncate transition-colors duration-200 group-hover/comment:text-skin"
            >
              {{ comment.targetTitle }}
            </p>
            <div class="flex items-center gap-2 mt-1 text-xs text-fg-subtle">
              <template v-if="comment.status === 'published'">
                <div class="flex items-center gap-0.5">
                  <span
                    v-for="(filled, i) in renderStars(comment.rating)"
                    :key="i"
                    class="w-3.5 h-3.5"
                    :class="
                      filled
                        ? 'i-carbon-star-filled text-amber-400'
                        : 'i-carbon-star text-line-strong'
                    "
                  />
                </div>
                <span class="font-medium text-fg-muted">{{ comment.rating }}.0</span>
              </template>
              <span>{{ comment.createdAt }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <Badge :variant="comment.status === 'published' ? 'success' : 'warning'">
              {{ comment.status === 'published' ? '已评价' : '待评价' }}
            </Badge>
            <span
              class="i-carbon-arrow-right w-4 h-4 text-skin shrink-0 opacity-0 -translate-x-1 group-hover/comment:opacity-100 group-hover/comment:translate-x-0 transition-all duration-300"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- 评价内容 -->
        <div class="mt-4">
          <p v-if="comment.status === 'published'" class="text-sm text-fg leading-relaxed">
            {{ comment.content }}
          </p>
          <div
            v-else
            class="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3"
          >
            <p class="text-sm text-fg-muted">您还没有评价此商品，快去分享您的使用体验吧</p>
            <UButton color="primary" size="sm" class="shrink-0">去评价</UButton>
          </div>
        </div>

        <!-- 操作区 -->
        <div
          v-if="comment.status === 'published'"
          class="mt-4 pt-3 border-t border-line flex items-center justify-end gap-1"
        >
          <UButton color="neutral" variant="ghost" size="xs" icon="i-carbon-edit">编辑</UButton>
          <UButton color="error" variant="ghost" size="xs" icon="i-carbon-trash-can">删除</UButton>
        </div>
      </div>
    </div>
  </div>
</template>
