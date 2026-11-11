<script setup lang="ts">
import type { SiteSearchItem } from '#shared/siteSearch';
import type { SearchCardMedia } from '~/composables/useSiteSearchCardMedia';

const props = defineProps<{ item: SiteSearchItem; media?: SearchCardMedia }>();
const cardStyles = {
  character: {
    icon: 'i-lucide-user-round',
    image: 'object-cover',
    frame: 'h-12 w-12 rounded-full bg-brand-soft sm:h-14 sm:w-14',
    layout: 'result-character'
  },
  product: {
    icon: 'i-lucide-package',
    image: 'object-contain p-1.5',
    frame: 'h-18 w-18 rounded-xl bg-surface-muted sm:h-22 sm:w-22',
    layout: 'result-product'
  },
  article: {
    icon: 'i-lucide-file-text',
    image: 'object-cover',
    frame: 'h-16 w-24 rounded-lg bg-surface-muted sm:h-20 sm:w-34',
    layout: 'result-article'
  }
} as const;

const style = computed(() => cardStyles[props.item.entry_type]);
const destination = computed(() => {
  const id = props.item.code?.trim() || String(props.item.id);
  if (props.item.entry_type === 'product') return { name: 'products-id', params: { id } };
  if (props.item.entry_type === 'article') return { name: 'blog-id', params: { id } };
  if (props.media?.region) {
    return {
      name: 'character-id',
      params: { id: props.media.region },
      query: { character: id }
    };
  }
  return { name: 'character-entry-code', params: { code: id } };
});
const highlight = computed(() =>
  props.item.highlight?.split(/<(?:em|mark)>([\s\S]*?)<\/(?:em|mark)>/gi)
);
const unique = (values: (string | null | undefined)[]) =>
  [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
const tags = computed(() => unique(props.media?.tags ?? []).slice(0, 3));
const details = computed(() => {
  const subtitle = props.item.subtitle?.split(/\s+·\s+/) ?? [];
  return unique([...subtitle, ...(props.media?.details ?? [])])
    .filter((value) => !tags.value.includes(value) && value !== props.item.title)
    .join(' · ');
});
</script>

<template>
  <NuxtLink :to="destination" no-prefetch class="result-item group" :class="style.layout">
    <div
      class="result-media relative shrink-0 overflow-hidden"
      :class="style.frame"
      aria-hidden="true"
    >
      <UiImage
        :src="media?.image"
        alt=""
        loading="lazy"
        decoding="async"
        class="h-full w-full transition-transform duration-300 motion-safe:group-hover:scale-105"
        :class="style.image"
      >
        <template #fallback>
          <div class="grid h-full place-items-center text-fg-muted" aria-hidden="true">
            <span :class="style.icon" class="h-5 w-5 opacity-75" />
          </div>
        </template>
      </UiImage>
    </div>

    <div class="result-copy min-w-0 flex-1">
      <h3 class="result-title line-clamp-2 break-words font-semibold leading-snug text-fg">
        {{ item.title }}
      </h3>
      <p v-if="details" class="mt-1 line-clamp-2 break-words text-xs text-fg-muted">
        {{ details }}
      </p>
      <p
        v-else-if="media?.description"
        class="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-fg-muted"
      >
        {{ media.description }}
      </p>
      <ul v-if="tags.length" class="mt-2 flex flex-wrap gap-1.5" aria-label="标签">
        <li
          v-for="tag in tags"
          :key="tag"
          class="max-w-full truncate rounded-md bg-brand-soft px-2 py-0.5 text-xs text-fg"
        >
          {{ tag }}
        </li>
      </ul>
      <p
        v-if="highlight?.length"
        class="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-fg-muted"
      >
        <template v-for="(part, index) in highlight" :key="index">
          <mark v-if="index % 2" class="rounded-sm bg-brand-soft px-0.5 font-medium text-fg">{{
            part
          }}</mark>
          <template v-else>{{ part }}</template>
        </template>
      </p>
    </div>
    <span
      v-if="item.entry_type !== 'article'"
      class="i-lucide-chevron-right h-4 w-4 shrink-0 text-fg-muted"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped>
.result-item {
  display: flex;
  min-width: 0;
  height: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
  padding: 0.625rem;
  transition: background-color 150ms;
}

.result-item:hover {
  background: var(--surface-muted);
}

.result-item:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.result-character {
  align-items: flex-start;
  border: 1px solid var(--line);
}

.result-product {
  align-items: flex-start;
}

.result-title {
  font-size: 0.9375rem;
}

.result-article {
  align-items: flex-start;
  padding: 0.875rem 0.625rem;
}

.result-article .result-media {
  order: 1;
}

.result-article .result-title {
  font-size: 1rem;
  -webkit-line-clamp: 3;
}

@media (max-width: 479px) {
  .result-item {
    gap: 0.625rem;
  }

  .result-article .result-media {
    width: 4.5rem;
    height: 3.375rem;
  }
}
</style>
