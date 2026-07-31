<script setup lang="ts">
import { useUserApi } from '~/composables/api/user';

const { updatePassword } = useUserApi();

const isSaving = ref(false);
const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
});

const loginRecords = ref<any[]>([]);
const isLoadingRecords = ref(true);

const loadLoginRecords = async () => {
  isLoadingRecords.value = true;
  try {
    const data = await $fetch('/api/user/login-records');
    loginRecords.value = data?.data || [];
  } catch (err) {
    console.error('Failed to load login records:', err);
  } finally {
    isLoadingRecords.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    const toast = useToast();
    toast.add({ id: 'pwd-mismatch', title: '两次输入的密码不一致', color: 'error' });
    return;
  }
  isSaving.value = true;
  try {
    await updatePassword({
      old_password: passwordForm.value.old_password,
      new_password: passwordForm.value.new_password
    });
    const toast = useToast();
    toast.add({ id: 'pwd-change-success', title: '密码修改成功', color: 'success' });
    passwordForm.value = { old_password: '', new_password: '', confirm_password: '' };
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'pwd-change-error',
      title: '修改失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadLoginRecords);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">账号安全</h1>

    <div class="space-y-8">
      <!-- 修改密码 -->
      <section class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h2>
        <form class="space-y-4 max-w-md" @submit.prevent="handleChangePassword">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">当前密码</label>
            <input
              v-model="passwordForm.old_password"
              type="password"
              required
              placeholder="请输入当前密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">新密码</label>
            <input
              v-model="passwordForm.new_password"
              type="password"
              required
              placeholder="请输入新密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">确认新密码</label>
            <input
              v-model="passwordForm.confirm_password"
              type="password"
              required
              placeholder="请再次输入新密码"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <UButton color="primary" type="submit" :loading="isSaving"> 确认修改 </UButton>
        </form>
      </section>

      <!-- 登录记录 -->
      <section class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">登录记录</h2>
        <div v-if="isLoadingRecords" class="flex justify-center py-10">
          <div class="i-carbon-circle-dash w-6 h-6 animate-spin text-gray-400" />
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="record in loginRecords"
            :key="record.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <div>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ record.device }} · {{ record.browser }}
                <span
                  v-if="record.current"
                  class="ml-2 text-xs px-2 py-0.5 rounded bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                >
                  当前设备
                </span>
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ record.location }} · {{ record.ip }}</p>
            </div>
            <span class="text-xs text-gray-400 shrink-0">{{ record.loginAt }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
