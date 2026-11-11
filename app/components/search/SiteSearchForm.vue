<script setup lang="ts">
const query = defineModel<string>({ required: true });
defineProps<{ error: string; hasResults: boolean }>();
const emit = defineEmits<{ submit: []; clear: [] }>();
const input = useTemplateRef<HTMLInputElement>('input');

function clear() {
  query.value = '';
  emit('clear');
  input.value?.focus();
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <form role="search" @submit.prevent="emit('submit')">
    <label for="site-search-query" class="sr-only">搜索角色、商品或文章</label>
    <div
      class="search-field flex min-h-14 items-center gap-2 rounded-full border border-line-strong bg-surface p-1.5 pl-4 sm:gap-3 sm:pl-5"
    >
      <span class="i-lucide-search h-5 w-5 shrink-0 text-fg-muted" aria-hidden="true" />
      <input
        id="site-search-query"
        ref="input"
        v-model="query"
        type="text"
        enterkeyhint="search"
        autocomplete="off"
        placeholder="搜索角色、商品或文章"
        class="min-w-0 flex-1 bg-transparent py-2 text-base text-fg outline-none placeholder:text-fg-muted"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? 'site-search-validation' : undefined"
      />
      <button
        v-if="query || hasResults"
        type="button"
        aria-label="清空搜索词"
        class="grid h-10 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-fg-muted hover:bg-surface-muted hover:text-fg"
        @click="clear"
      >
        <span class="i-lucide-x h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="submit"
        class="min-h-11 shrink-0 cursor-pointer rounded-full bg-fg px-4 text-sm font-semibold text-canvas hover:opacity-85 sm:px-6"
      >
        搜索
      </button>
    </div>
    <p v-if="error" id="site-search-validation" class="mt-2 text-sm text-fg" role="alert">
      {{ error }}
    </p>
  </form>
</template>

<style scoped>
.search-field {
  box-shadow: 0 2px 5px rgb(0 0 0 / 5%);
}

.search-field:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}
</style>
