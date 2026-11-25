<script setup lang="ts">
import { useUserApi } from '~/composables/api/user';
import { useAuthStore } from '~/stores/auth';
import { useUiStore } from '~/stores/ui';
import PageHeader from '~/components/ui/PageHeader.vue';
const { updatePassword } = useUserApi();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToast();
const passwords = reactive({ oldPassword: '', newPassword: '', confirm: '' });
const touched = reactive({ oldPassword: false, newPassword: false, confirm: false });
const passwordVisible = reactive({ oldPassword: false, newPassword: false, confirm: false });
const saving = shallowRef(false);

/** 独立切换指定密码框的明文显示，不改变密码内容。 */
function togglePasswordVisibility(field: keyof typeof passwords) {
  passwordVisible[field] = !passwordVisible[field];
}

/** 根据当前输入派生字段错误，新密码变更时同步更新确认密码的提示。 */
const passwordErrors = computed(() => ({
  oldPassword: passwords.oldPassword ? '' : '请输入原密码',
  newPassword: !passwords.newPassword
    ? '请输入新密码'
    : passwords.newPassword.length < 6 || passwords.newPassword.length > 128
      ? '新密码须为 6–128 个字符'
      : '',
  confirm: !passwords.confirm
    ? '请再次输入新密码'
    : passwords.newPassword !== passwords.confirm
      ? '两次新密码输入不一致'
      : ''
}));

/** 校验密码输入，仅在接口提交成功或失败时显示全局提示。 */
async function savePassword() {
  if (saving.value) return;
  touched.oldPassword = touched.newPassword = touched.confirm = true;
  if (Object.values(passwordErrors.value).some(Boolean)) return;
  saving.value = true;
  try {
    await updatePassword({
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword
    });
    auth.clearAuth();
    touched.oldPassword = touched.newPassword = touched.confirm = false;
    passwordVisible.oldPassword = passwordVisible.newPassword = passwordVisible.confirm = false;
    passwords.oldPassword = passwords.newPassword = passwords.confirm = '';
    toast.add({ title: '密码修改成功，请重新登录', color: 'success' });
    await navigateTo('/');
    ui.openAuthModal('login');
  } catch (error) {
    const message = (error as { message?: string }).message;
    toast.add({ title: message || '密码修改失败，请重试', color: 'error' });
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <div>
    <PageHeader title="账号安全" subtitle="修改登录密码，管理账号安全" />
    <ProfileCard title="修改密码">
      <form class="max-w-lg space-y-5 p-4 sm:p-6" novalidate @submit.prevent="savePassword">
        <UFormField
          label="原密码"
          name="oldPassword"
          required
          :error="touched.oldPassword ? passwordErrors.oldPassword : undefined"
        >
          <UInput
            v-model="passwords.oldPassword"
            :type="passwordVisible.oldPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="w-full"
            :ui="{ base: 'pe-10', trailing: 'pe-1' }"
            :disabled="saving"
            @blur="touched.oldPassword = true"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                :disabled="saving"
                :aria-label="passwordVisible.oldPassword ? '隐藏原密码' : '显示原密码'"
                :aria-pressed="passwordVisible.oldPassword"
                @mousedown.prevent
                @click="togglePasswordVisibility('oldPassword')"
              >
                <span
                  :class="passwordVisible.oldPassword ? 'i-carbon-view' : 'i-carbon-view-off'"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </UButton>
            </template>
          </UInput>
        </UFormField>
        <UFormField
          label="新密码"
          name="newPassword"
          required
          help="6–128 个字符，修改成功后需要重新登录"
          :error="touched.newPassword ? passwordErrors.newPassword : undefined"
        >
          <UInput
            v-model="passwords.newPassword"
            :type="passwordVisible.newPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="6"
            maxlength="128"
            required
            class="w-full"
            :ui="{ base: 'pe-10', trailing: 'pe-1' }"
            :disabled="saving"
            @blur="touched.newPassword = true"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                :disabled="saving"
                :aria-label="passwordVisible.newPassword ? '隐藏新密码' : '显示新密码'"
                :aria-pressed="passwordVisible.newPassword"
                @mousedown.prevent
                @click="togglePasswordVisibility('newPassword')"
              >
                <span
                  :class="passwordVisible.newPassword ? 'i-carbon-view' : 'i-carbon-view-off'"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </UButton>
            </template>
          </UInput>
        </UFormField>
        <UFormField
          label="确认新密码"
          name="confirm"
          required
          :error="touched.confirm ? passwordErrors.confirm : undefined"
        >
          <UInput
            v-model="passwords.confirm"
            :type="passwordVisible.confirm ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="w-full"
            :ui="{ base: 'pe-10', trailing: 'pe-1' }"
            :disabled="saving"
            @blur="touched.confirm = true"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                square
                :disabled="saving"
                :aria-label="passwordVisible.confirm ? '隐藏确认新密码' : '显示确认新密码'"
                :aria-pressed="passwordVisible.confirm"
                @mousedown.prevent
                @click="togglePasswordVisibility('confirm')"
              >
                <span
                  :class="passwordVisible.confirm ? 'i-carbon-view' : 'i-carbon-view-off'"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </UButton>
            </template>
          </UInput>
        </UFormField>
        <UButton type="submit" :loading="saving">保存新密码</UButton>
      </form>
    </ProfileCard>
  </div>
</template>
