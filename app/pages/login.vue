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

const handleLogin = () => {
  // TODO: Implement login logic
  navigateTo('/')
  console.log('Login with:', form.value)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nice to see you again</h1>

    <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-5">
        <div>
          <label
            for="login"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >Login</label
          >
          <input
            id="login"
            v-model="form.email"
            type="text"
            placeholder="Email or phone number"
            class="block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm transition-all duration-200 outline-none ring-1 ring-transparent focus:ring-2"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >Password</label
          >
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              class="block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm transition-all duration-200 outline-none ring-1 ring-transparent focus:ring-2 pr-10"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              @click="showPassword = !showPassword"
            >
              <div :class="showPassword ? 'i-carbon-view-off' : 'i-carbon-view'" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <!-- Custom Toggle Switch -->
          <button
            type="button"
            class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="[form.rememberMe ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700']"
            @click="form.rememberMe = !form.rememberMe"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="[form.rememberMe ? 'translate-x-4' : 'translate-x-0']"
            />
          </button>
          <span
            class="ml-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
            @click="form.rememberMe = !form.rememberMe"
            >Remember me</span
          >
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >Forgot password?</a
          >
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 active:scale-[0.98]"
        >
          Sign in
        </button>
      </div>
    </form>

    <div class="mt-8">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-800 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 transition-all duration-200 active:scale-[0.98]"
      >
        <div class="i-logos-google-icon w-5 h-5 text-pink" />
        <span class="text-white">Or sign in with Google</span>
      </button>
    </div>

    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      Dont have an account?
      <NuxtLink
        to="/register"
        class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >Sign up now</NuxtLink
      >
    </p>
  </div>
</template>
