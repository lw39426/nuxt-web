<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { useUiStore } from '~/stores/ui';
import { useAuthStore } from '~/stores/auth';

const uiStore = useUiStore();
const authStore = useAuthStore();
const { loginByUsername, register, getCode } = useAuth();
const isOpen = computed(() => uiStore.authModalOpen);
const currentView = computed(() => uiStore.authModalView);
const close = () => uiStore.closeAuthModal();
const openLogin = () => uiStore.openAuthModal('login');
const openRegister = () => uiStore.openAuthModal('register');

// --- Login State ---
const loginForm = ref({
  email: '',
  password: '',
  captcha: '',
  rememberMe: false
});
const account = ref('');
const accountOptions = [
  { label: '快速选择账号', value: '', password: '' },
  { label: 'user', value: 'user', password: '123456' },
  { label: '运营账号 ops', value: 'ops', password: '123456' }
];

// --- Register State ---
const registerForm = ref({
  nickname: '',
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  captcha: ''
});

// --- Common State ---
const captchaImage = ref('');
const captchaKey = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const fetchCaptcha = async () => {
  try {
    const res = await getCode();
    if (res && res.image) {
      captchaImage.value = res.image;
      captchaKey.value = res.captcha_key;
    }
  } catch (error) {
    console.error('Failed to fetch captcha:', error);
  }
};

// Fetch captcha when modal opens
watch(isOpen, (newVal: any) => {
  if (newVal) {
    fetchCaptcha();
  } else {
    // Reset forms when closing
    showPassword.value = false;
    loginForm.value.password = '';
    loginForm.value.captcha = '';
    registerForm.value.password = '';
    registerForm.value.confirmPassword = '';
    registerForm.value.captcha = '';
  }
});

watch(currentView, () => {
  fetchCaptcha();
  showPassword.value = false;
});

watch(account, (value: string) => {
  if (value) {
    loginForm.value.email = value;
    loginForm.value.password = accountOptions.find((item) => item.value === value)?.password || '';
  }
});

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const res = await loginByUsername({
      username: loginForm.value.email,
      password: loginForm.value.password
    });

    if (res && res.access_token) {
      authStore.setAuth({
        token: res.access_token,
        refreshToken: res.refresh_token,
        user: { id: 0, username: loginForm.value.email }
      });
      close();
    }
  } catch (error: any) {
    console.error('Login failed:', error);
    const toast = useToast();
    toast.add({
      id: 'auth-login-error',
      title: '登录失败',
      description: error.message || '系统繁忙，请稍后再试',
      color: 'error'
    });
    fetchCaptcha();
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  const toast = useToast();
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.add({
      id: 'auth-validation-error',
      title: '校验失败',
      description: '两次输入的密码不一致',
      color: 'error'
    });
    return;
  }

  isLoading.value = true;
  try {
    await register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      phone: registerForm.value.phone || undefined,
      code: registerForm.value.captcha || undefined
    });

    toast.add({
      id: 'auth-register-success',
      title: '注册成功',
      description: '请登录',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });
    openLogin();
  } catch (error: any) {
    console.error('Registration failed:', error);
    toast.add({
      id: 'auth-register-error',
      title: '注册失败',
      description: error.message || '注册失败',
      color: 'error'
    });
    fetchCaptcha();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          @click="close"
        ></div>

        <!-- Modal Panel -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-[430px] lg:max-w-[390px] overflow-hidden rounded-2xl bg-white dark:bg-slate-950 p-6 shadow-2xl sm:p-8"
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              @click="close"
            >
              <span class="i-carbon-close block h-5 w-5" />
            </button>

            <!-- Login View -->
            <div v-if="currentView === 'login'">
              <h3
                class="text-[18px] leading-tight font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-[18px]"
              >
                欢迎回来 <span class="ml-1 inline-block">👋🏻</span>
              </h3>

              <form
                class="mt-6 space-y-4 sm:mt-7 lg:mt-5 lg:space-y-3"
                @submit.prevent="handleLogin"
              >
                <div>
                  <label for="quick-account" class="sr-only">快速选择账号</label>
                  <div class="relative">
                    <select
                      id="quick-account"
                      v-model="account"
                      class="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                    >
                      <option v-for="item in accountOptions" :key="item.label" :value="item.value">
                        {{ item.label }}
                      </option>
                    </select>
                    <span
                      class="i-carbon-chevron-down pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label for="login" class="sr-only">用户名</label>
                  <input
                    id="login"
                    v-model="loginForm.email"
                    type="text"
                    placeholder="请输入用户名"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                </div>

                <div>
                  <label for="password" class="sr-only">密码</label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="loginForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="密码"
                      class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300 lg:w-11"
                      @click="showPassword = !showPassword"
                    >
                      <span
                        :class="showPassword ? 'i-carbon-view-off' : 'i-carbon-view'"
                        class="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>

                <div class="flex gap-3">
                  <div class="flex-1 relative">
                    <label for="captcha" class="sr-only">验证码</label>
                    <input
                      id="captcha"
                      v-model="loginForm.captcha"
                      type="text"
                      placeholder="验证码"
                      class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                    />
                  </div>
                  <div
                    class="h-12 w-32 rounded-xl border border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center bg-gray-50 dark:border-slate-700 lg:h-11"
                    @click="fetchCaptcha"
                  >
                    <img
                      v-if="captchaImage"
                      :src="captchaImage"
                      alt="captcha"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-xs text-gray-400">加载中...</span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <label class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <input
                      v-model="loginForm.rememberMe"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>记住账号</span>
                  </label>
                  <a href="#" class="font-medium text-blue-600 transition hover:text-blue-500"
                    >忘记密码?</a
                  >
                </div>

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,.28)] transition duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed lg:h-11 lg:text-sm"
                >
                  <span
                    v-if="isLoading"
                    class="i-carbon-circle-dash animate-spin h-5 w-5 inline-block align-middle"
                  />
                  <span v-else>登录</span>
                </button>

                <div class="grid grid-cols-2 gap-3 lg:gap-2.5">
                  <button
                    type="button"
                    class="h-11 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-10 lg:text-sm"
                  >
                    手机号登录
                  </button>
                  <button
                    type="button"
                    class="h-11 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-10 lg:text-sm"
                  >
                    扫码登录
                  </button>
                </div>

                <div class="flex items-center gap-4 py-1 text-slate-400">
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span class="text-sm">其他登录方式</span>
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <div class="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-emerald-500 transition hover:bg-emerald-50 hover:scale-105 dark:hover:bg-emerald-900/20"
                  >
                    <span class="i-carbon-logo-wechat h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:scale-105 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span class="i-carbon-logo-github h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    class="grid h-9 w-9 place-items-center rounded-full text-red-500 transition hover:bg-red-50 hover:scale-105 dark:hover:bg-red-900/20"
                  >
                    <span class="i-carbon-logo-google h-6 w-6" />
                  </button>
                </div>

                <p class="pt-1 text-center text-base text-slate-600 dark:text-slate-400 lg:text-sm">
                  还没有账号?
                  <button
                    type="button"
                    class="font-medium text-blue-600 transition hover:text-blue-500"
                    @click="openRegister"
                  >
                    创建账号
                  </button>
                </p>
              </form>
            </div>

            <!-- Register View -->
            <div v-else>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">创建账号</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
                欢迎加入我们，开启您的旅程。
              </p>

              <form class="space-y-4 lg:space-y-3" @submit.prevent="handleRegister">
                <div>
                  <input
                    v-model="registerForm.username"
                    type="text"
                    placeholder="请输入用户名"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                </div>

                <div>
                  <input
                    v-model="registerForm.phone"
                    type="text"
                    placeholder="请输入手机号"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                </div>

                <div>
                  <input
                    v-model="registerForm.nickname"
                    type="text"
                    placeholder="请输入昵称"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                </div>

                <div class="relative">
                  <input
                    v-model="registerForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300 lg:w-11"
                    @click="showPassword = !showPassword"
                  >
                    <span
                      :class="showPassword ? 'i-carbon-view-off' : 'i-carbon-view'"
                      class="h-5 w-5"
                    />
                  </button>
                </div>

                <div class="relative">
                  <input
                    v-model="registerForm.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请再次输入密码"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                  />
                </div>

                <div class="flex gap-3">
                  <div class="flex-1 relative">
                    <input
                      v-model="registerForm.captcha"
                      type="text"
                      placeholder="验证码"
                      class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
                    />
                  </div>
                  <div
                    class="h-12 w-32 rounded-xl border border-slate-200 overflow-hidden cursor-pointer flex items-center justify-center bg-gray-50 dark:border-slate-700 lg:h-11"
                    @click="fetchCaptcha"
                  >
                    <img
                      v-if="captchaImage"
                      :src="captchaImage"
                      alt="captcha"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-xs text-gray-400">加载中...</span>
                  </div>
                </div>

                <div class="pt-2">
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed lg:h-11"
                  >
                    <span
                      v-if="isLoading"
                      class="i-carbon-circle-dash animate-spin h-5 w-5 inline-block align-middle"
                    />
                    <span v-else>注册</span>
                  </button>
                </div>

                <p class="pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  已有账号?
                  <button
                    type="button"
                    class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    @click="openLogin"
                  >
                    立即登录
                  </button>
                </p>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
