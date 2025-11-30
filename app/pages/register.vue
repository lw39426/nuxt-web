<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)

const handleRegister = () => {
  // TODO: Implement register logic
  console.log('Register with:', form.value)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create an account</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Start your 30-day free trial.</p>

    <form class="space-y-6" @submit.prevent="handleRegister">
      <div class="space-y-5">
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >Name</label
          >
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your name"
            class="block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm transition-all duration-200 outline-none ring-1 ring-transparent focus:ring-2"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >Email</label
          >
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
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
              placeholder="Create a password"
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

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 active:scale-[0.98]"
        >
          Create account
        </button>
      </div>
    </form>

    <div class="mt-8">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-800 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 transition-all duration-200 active:scale-[0.98]"
      >
        <div class="i-logos-google-icon w-5 h-5" />
        <span class="text-white">Sign up with Google</span>
      </button>
    </div>

    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >Log in</NuxtLink
      >
    </p>
  </div>
</template>
