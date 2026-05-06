<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
    @click="$emit('update:isOpen', false)"
  ></div>

  <!-- 侧边栏容器 -->
  <aside
    class="flex-shrink-0 h-full bg-white dark:bg-gray-950 flex flex-col border-r border-gray-200 dark:border-gray-800 transition-[width,transform] duration-300 ease-in-out z-40 overflow-hidden fixed md:relative md:translate-x-0"
    :class="[
      isOpen
        ? 'w-[260px] translate-x-0'
        : 'w-[260px] md:w-[68px] -translate-x-full md:translate-x-0'
    ]"
  >
    <!-- 侧边栏顶部 -->
    <div
      class="p-4 pb-3 flex items-center justify-between h-auto border-b border-gray-100 dark:border-gray-800"
    >
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          :title="isOpen ? '关闭侧边栏' : '打开侧边栏'"
          @click="$emit('update:isOpen', !isOpen)"
        >
          <span class="i-lucide-panel-left text-lg"></span>
        </button>
        <span v-if="isOpen" class="font-semibold text-sm text-gray-700 dark:text-gray-300"
          >小星</span
        >
      </div>
      <button
        class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all transition-opacity duration-300 flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        title="新聊天"
        @click="$emit('new-chat')"
      >
        <span class="i-lucide-square-plus text-lg"></span>
      </button>
    </div>

    <!-- 导航菜单 -->
    <div
      class="px-3 py-2 flex-1 overflow-y-auto overflow-x-hidden space-y-6 flex flex-col items-center w-full"
    >
      <!-- 基础操作 -->
      <div class="space-y-1 w-full">
        <button
          class="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group relative"
          title="新聊天"
          @click="$emit('new-chat')"
        >
          <span class="i-lucide-plus text-gray-500 text-lg flex-shrink-0"></span>
          <span
            class="font-medium whitespace-nowrap transition-opacity duration-200 absolute left-10"
            :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >新聊天</span
          >
          <span
            class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute right-3"
            :class="isOpen ? '' : 'hidden'"
            >Ctrl+Shift+O</span
          >
        </button>
      </div>

      <!-- 工具列表 -->
      <div class="space-y-1 w-full">
        <button
          class="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
          title="图片"
        >
          <span class="i-lucide-image text-gray-500 text-lg flex-shrink-0"></span>
          <span
            class="font-medium whitespace-nowrap transition-opacity duration-200 absolute left-10"
            :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >图片</span
          >
        </button>
        <button
          class="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
          title="项目"
        >
          <span class="i-lucide-folder text-gray-500 text-lg flex-shrink-0"></span>
          <span
            class="font-medium whitespace-nowrap transition-opacity duration-200 absolute left-10"
            :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >项目</span
          >
        </button>
      </div>

      <!-- 历史记录 -->
      <div
        class="w-full transition-opacity duration-300"
        :class="isOpen ? 'opacity-100' : 'opacity-0 hidden'"
      >
        <div class="px-3 text-xs font-medium text-gray-500 mb-2 whitespace-nowrap">你的聊天</div>
        <div class="space-y-0.5">
          <button
            v-for="session in sessions"
            :key="session.id"
            class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors truncate"
            :class="activeSessionId === session.id ? 'bg-gray-200 dark:bg-gray-800' : ''"
            :title="session.title"
            @click="$emit('select-session', session.id)"
          >
            {{ session.title }}
          </button>
          <div v-if="sessions.length === 0" class="px-3 py-2 text-xs text-gray-500">
            暂无聊天记录
          </div>
        </div>
      </div>
    </div>

    <!-- 底部用户信息 -->
    <div class="p-3 mt-auto">
      <button
        class="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 relative"
      >
        <div
          class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden"
        >
          <span class="i-lucide-user text-gray-500 dark:text-gray-400"></span>
        </div>
        <div
          class="text-left flex-1 truncate transition-opacity duration-200 absolute left-14"
          :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        >
          <div class="font-medium truncate">小星</div>
          <!-- <div class="text-xs text-gray-500 dark:text-gray-400">免费版</div> -->
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface SidebarSession {
  id: string;
  title: string;
}

defineProps<{
  isOpen: boolean;
  sessions: SidebarSession[];
  activeSessionId: string;
  searchQuery: string;
  isSearchOpen: boolean;
}>();

defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'new-chat'): void;
  (e: 'select-session', sessionId: string): void;
}>();
</script>
