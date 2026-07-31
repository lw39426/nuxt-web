<script setup lang="ts">
import { useUserApi } from '~/composables/api/user';

const { getInfo, updateInfo } = useUserApi();

const isLoading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);
const error = ref(false);

const form = ref({
  nickname: '',
  username: '',
  gender: 0,
  birthday: '',
  description: ''
});

const loadProfile = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await getInfo();
    if (data) {
      form.value = {
        nickname: data.nickname || '',
        username: data.username || '',
        gender: data.gender || 0,
        birthday: data.birthday || '',
        description: data.description || ''
      };
    }
  } catch (err: any) {
    error.value = true;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    await updateInfo({
      nickname: form.value.nickname || undefined,
      gender: form.value.gender || undefined,
      birthday: form.value.birthday || undefined,
      description: form.value.description || undefined
    });
    isEditing.value = false;
    const toast = useToast();
    toast.add({ id: 'profile-save-success', title: '保存成功', color: 'success' });
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'profile-save-error',
      title: '保存失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  isEditing.value = false;
  loadProfile();
};

onMounted(loadProfile);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人资料</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadProfile">重试</UButton>
    </div>

    <!-- Content -->
    <div v-else class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
      <!-- 展示模式 -->
      <div v-if="!isEditing" class="space-y-4">
        <div class="flex justify-end">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            @click="
              () => {
                isEditing = true;
              }
            "
          >
            <span class="i-carbon-edit w-4 h-4 mr-1" />
            编辑
          </UButton>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">用户名</p>
            <p class="text-gray-900 dark:text-white">{{ form.username || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">昵称</p>
            <p class="text-gray-900 dark:text-white">{{ form.nickname || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">性别</p>
            <p class="text-gray-900 dark:text-white">
              {{ ['保密', '男', '女'][form.gender] || '保密' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">生日</p>
            <p class="text-gray-900 dark:text-white">{{ form.birthday || '-' }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">简介</p>
            <p class="text-gray-900 dark:text-white">{{ form.description || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- 编辑模式 -->
      <form v-else class="space-y-4" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">用户名</label>
            <input
              :value="form.username"
              disabled
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              placeholder="请输入昵称"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">性别</label>
            <select
              v-model="form.gender"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none"
            >
              <option :value="0">保密</option>
              <option :value="1">男</option>
              <option :value="2">女</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">生日</label>
            <input
              v-model="form.birthday"
              type="date"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">简介</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="介绍一下自己吧"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UButton color="neutral" variant="outline" :disabled="isSaving" @click="handleCancel">
            取消
          </UButton>
          <UButton color="primary" type="submit" :loading="isSaving"> 保存 </UButton>
        </div>
      </form>
    </div>
  </div>
</template>
