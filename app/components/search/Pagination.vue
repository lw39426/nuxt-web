<script setup lang="ts">
interface Props {
  /** 总页数 */
  totalPages: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 页码变更后父级平滑滚动到结果区顶部 */
  change: [page: number];
}>();

/** 当前页:v-model 双向绑定 */
const page = defineModel<number>('page', { default: 1 });

/** 生成页码按钮列表:总数 >7 时折叠中间为省略号 */
const pageItems = computed<(number | '...')[]>(() => {
  const total = props.totalPages;
  const current = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | '...')[] = [1];
  // 窗口:当前页 ±2,并夹在首尾页之间
  let start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  if (current - 2 <= 2) start = 2;
  if (start > 2) items.push('...');
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push('...');
  items.push(total);
  return items;
});

/** 翻页并通知父级滚动 */
function go(target: number) {
  if (target < 1 || target > props.totalPages || target === page.value) return;
  page.value = target;
  emit('change', target);
}
</script>

<template>
  <!-- 分页导航:仅桌面/平板显示,移动端由父级换"加载更多" -->
  <nav class="hidden md:flex items-center justify-center gap-2 mt-6" aria-label="分页">
    <!-- 上一页 -->
    <button
      class="w-9 h-9 flex items-center justify-center border border-line rounded-xl text-fg-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand hover:text-fg"
      :disabled="page <= 1"
      aria-label="上一页"
      @click="go(page - 1)"
    >
      <span class="i-lucide-chevron-left w-4 h-4" aria-hidden="true" />
    </button>

    <!-- 页码/省略号 -->
    <template v-for="(item, idx) in pageItems" :key="`${item}-${idx}`">
      <span
        v-if="item === '...'"
        class="w-9 h-9 flex items-center justify-center text-fg-subtle select-none"
      >
        …
      </span>
      <button
        v-else
        class="w-9 h-9 flex items-center justify-center border border-line rounded-xl text-sm transition-colors cursor-pointer"
        :class="
          item === page
            ? 'bg-fg text-canvas border-none font-semibold cursor-default'
            : 'text-fg-muted hover:border-brand hover:text-fg'
        "
        :aria-label="`第 ${item} 页`"
        :aria-current="item === page ? 'page' : undefined"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <!-- 下一页 -->
    <button
      class="w-9 h-9 flex items-center justify-center border border-line rounded-xl text-fg-muted transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand hover:text-fg"
      :disabled="page >= totalPages"
      aria-label="下一页"
      @click="go(page + 1)"
    >
      <span class="i-lucide-chevron-right w-4 h-4" aria-hidden="true" />
    </button>
  </nav>
</template>
