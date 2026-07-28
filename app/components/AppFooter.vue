<script setup lang="ts"></script>
<template>
  <footer class="bg-[#f5f5f7] dark:bg-[#1d1d1f] pt-12 md:pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-5 md:px-8">
      <!-- 上部内容 -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10 mb-12">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="flex items-center gap-2 mb-4">
            <div class="h-7 w-7 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-4 h-4 text-white dark:text-black"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"
                />
              </svg>
            </div>
            <span class="font-semibold text-base text-gray-900 dark:text-white">Lyoo</span>
          </NuxtLink>
          <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
            新一代智能购物平台，用科技连接品质生活。
          </p>
        </div>

        <!-- 探索 -->
        <div>
          <h3
            class="text-[11px] font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-3"
          >
            探索
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/products"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >全部商品</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/products"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >热销榜单</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/products"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >新品上市</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/blog"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >资讯中心</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- 服务 -->
        <div>
          <h3
            class="text-[11px] font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-3"
          >
            服务
          </h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >售后服务</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >配送说明</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >退换政策</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >常见问题</a
              >
            </li>
          </ul>
        </div>

        <!-- 关于 -->
        <div>
          <h3
            class="text-[11px] font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-3"
          >
            关于
          </h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/about"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >关于我们</NuxtLink
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >加入我们</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >联系方式</a
              >
            </li>
            <li>
              <NuxtLink
                to="/ai-page"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >AI 助手</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- 法律 -->
        <div>
          <h3
            class="text-[11px] font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wide mb-3"
          >
            法律
          </h3>
          <ul class="space-y-2">
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >隐私政策</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >服务条款</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >Cookie 政策</a
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-3">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">
            Copyright © 2026 Lyoo. 保留所有权利。
          </p>
          <div class="flex items-center gap-5">
            <a
              href="#"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div class="i-carbon-logo-github w-4 h-4" />
            </a>
            <a
              href="#"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div class="i-carbon-logo-twitter w-4 h-4" />
            </a>
            <a
              href="#"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div class="i-carbon-logo-instagram w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
