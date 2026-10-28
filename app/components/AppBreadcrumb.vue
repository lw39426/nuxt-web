<script setup lang="ts">
export interface BreadcrumbItem {
  label: string;
  to?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>
<template>
  <nav aria-label="面包屑" class="min-w-0">
    <ol class="flex items-center text-sm text-fg-muted">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex items-center min-w-0"
      >
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="shrink-0 transition-colors hover:text-fg"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="block truncate text-fg font-medium"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < items.length - 1"
          class="i-carbon-chevron-right w-3.5 h-3.5 mx-2 text-fg-subtle shrink-0"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
