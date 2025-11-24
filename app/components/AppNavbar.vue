<template>
  <nav class="fixed top-0 w-full z-50 border-b border-white/5 bg-brand-dark/70 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-teal-600 flex-center">
          <div class="i-carbon-ibm-watson-discovery text-black text-xl" />
        </div>
        <span class="text-xl font-bold text-white tracking-tight">MintlifyClone</span>
      </div>

      <!-- Links -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <NuxtLink to="/" class="hover:text-white transition">Documentation</NuxtLink>
        <NuxtLink to="/" class="hover:text-white transition">Pricing</NuxtLink>
        <NuxtLink to="/" class="hover:text-white transition">Blog</NuxtLink>
        <NuxtLink to="/" class="hover:text-white transition">Careers</NuxtLink>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <button class="text-gray-400 hover:text-white transition hidden sm:block">Sign in</button>
        <button class="btn-primary text-sm !py-2 !px-4">Get Started</button>
      </div>
    </div>
  </nav>
</template>
