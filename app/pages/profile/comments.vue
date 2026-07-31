<script setup lang="ts">
import { useCommentApi } from '~/composables/api/comment';
import { useAuthStore } from '~/stores/auth';
import type { Comment } from '~/types/blog';

const { getByUser, remove } = useCommentApi();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref(false);
const comments = ref<Comment[]>([]);

const loadComments = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const userId = authStore.user?.id;
    if (!userId) return;
    const data = await getByUser(userId);
    comments.value = data?.comments || [];
  } catch (err: any) {
    error.value = true;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('确定删除该评论？')) return;
  try {
    await remove(id);
    await loadComments();
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'comment-delete-error',
      title: '删除失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(loadComments);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">我的评论</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadComments">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="comments.length === 0" class="text-center py-20">
      <div class="i-carbon-chat text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500">暂无评论</p>
    </div>

    <!-- Comment List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white mb-2">{{ comment.content }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span>{{ formatDate(comment.created_at) }}</span>
              <span v-if="comment.like_count">👍 {{ comment.like_count }}</span>
            </div>
          </div>
          <UButton color="error" variant="ghost" size="xs" @click="handleDelete(comment.id)">
            删除
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
