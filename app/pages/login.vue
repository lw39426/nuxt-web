<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const account = ref('')

const accountOptions = [
  { label: '快速选择账号', value: '' },
  { label: '管理员 admin', value: 'admin@demo.com' },
  { label: '运营账号 ops', value: 'ops@demo.com' }
]

watch(account, (value) => {
  if (value) {
    form.value.email = value
  }
})

const handleLogin = () => {
  // TODO: Implement login logic
  navigateTo('/')
  console.log('Login with:', form.value)
}
</script>

<template>
  <div>
    <h1
      class="text-[28px] leading-tight font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-[28px]"
    >
      欢迎回来 <span class="ml-1 inline-block">👋🏻</span>
    </h1>
    <p class="mt-3 text-slate-500 dark:text-slate-400 sm:text-lg">
      请输入您的账户信息以开始管理您的项目
    </p>

    <form class="mt-6 space-y-4 sm:mt-7 lg:mt-5 lg:space-y-3" @submit.prevent="handleLogin">
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
          v-model="form.email"
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
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            class="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-base text-slate-700 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:h-11 lg:text-sm"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300 lg:w-11"
            @click="showPassword = !showPassword"
          >
            <span :class="showPassword ? 'i-carbon-view-off' : 'i-carbon-view'" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <label class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>记住账号</span>
        </label>
        <a href="#" class="font-medium text-blue-600 transition hover:text-blue-500">忘记密码?</a>
      </div>

      <button
        type="submit"
        class="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,.28)] transition duration-200 hover:bg-blue-500 lg:h-11 lg:text-sm"
      >
        登录
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
        <NuxtLink to="/register" class="font-medium text-blue-600 transition hover:text-blue-500">
          创建账号
        </NuxtLink>
      </p>
    </form>
  </div>
</template>
