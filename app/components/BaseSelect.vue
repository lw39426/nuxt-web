<script setup lang="ts">
import { computed, useId } from 'vue';
import { useDropdown } from '~/composables/useDropdown';

export type BaseSelectOptionValue = string | number | boolean;

export interface BaseSelectOption {
  label: string;
  value: BaseSelectOptionValue;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    options: BaseSelectOption[] | BaseSelectOptionValue[];
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'overlay';
    fluid?: boolean;
  }>(),
  {
    placeholder: '请选择',
    disabled: false,
    id: undefined,
    name: undefined,
    size: 'lg',
    variant: 'default',
    fluid: true
  }
);

const model = defineModel<BaseSelectOptionValue | null>({ default: null });

const isOverlay = computed(() => props.variant === 'overlay');

const normalizedOptions = computed<BaseSelectOption[]>(() =>
  props.options.map((opt) =>
    typeof opt === 'object' && opt !== null ? opt : { label: String(opt), value: opt }
  )
);

const selectedLabel = computed(() => {
  const matched = normalizedOptions.value.find((opt) => opt.value === model.value);
  return matched ? matched.label : props.placeholder;
});

const hasSelection = computed(() =>
  normalizedOptions.value.some((opt) => opt.value === model.value)
);

const uid = useId();
const panelId = computed(() => `base-select-${uid}`);

const {
  isOpen,
  isShown,
  highlighted,
  triggerEl,
  panelEl,
  listEl,
  open,
  close,
  toggle,
  scrollHighlightedIntoView
} = useDropdown();

const initialHighlight = () =>
  normalizedOptions.value.findIndex((opt) => opt.value === model.value);

const openMenu = () => {
  if (props.disabled) return;
  open(initialHighlight());
};

const toggleMenu = () => {
  if (props.disabled) return;
  toggle(initialHighlight());
};

const selectOption = (opt: BaseSelectOption) => {
  if (opt.disabled) return;
  model.value = opt.value;
  close();
  triggerEl.value?.focus();
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      const enabledIndexes = normalizedOptions.value
        .map((opt, index) => (opt.disabled ? -1 : index))
        .filter((index) => index >= 0);
      if (!enabledIndexes.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const currentPos = enabledIndexes.indexOf(highlighted.value);
      const nextIndex = (currentPos + step + enabledIndexes.length) % enabledIndexes.length;
      highlighted.value = enabledIndexes[nextIndex] ?? 0;
      scrollHighlightedIntoView();
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      const opt = normalizedOptions.value[highlighted.value];
      if (opt) selectOption(opt);
      break;
    }
    case 'Escape': {
      if (isOpen.value) {
        event.preventDefault();
        close();
        triggerEl.value?.focus();
      }
      break;
    }
    case 'Tab':
      close();
      break;
  }
};

const triggerVariantClasses = computed(() => {
  if (isOverlay.value) {
    return 'rounded border border-white/30 bg-black/55 px-3 py-2 text-sm text-white backdrop-blur-sm';
  }
  const sizeClass = {
    sm: 'h-8 rounded-md px-2.5 text-xs',
    md: 'h-10 rounded-lg px-3 text-sm',
    lg: 'h-12 rounded-xl px-4 text-base lg:h-11 lg:text-sm'
  }[props.size];
  return `${sizeClass} border border-slate-200 bg-white text-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`;
});

const focusClasses = 'border-blue-500 ring-3 ring-blue-500/20 dark:border-blue-500';

const chevronClasses = isOverlay.value ? 'text-white/70' : 'text-slate-400';

const panelVariantClasses = computed(() =>
  isOverlay.value
    ? 'rounded border border-white/20 bg-black/90 p-1 text-white shadow-2xl backdrop-blur-md'
    : 'rounded-xl border border-slate-200 bg-white p-1 text-slate-200 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
);

const optionSizeClasses = computed(() => {
  if (isOverlay.value) return 'px-3 py-2 text-sm';
  return {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-3 py-2.5 text-base lg:text-sm'
  }[props.size];
});
// 文字颜色相关
// 选项基础类名
const baseOptionClasses = 'text-slate-500 dark:text-slate-200';
// 选中状态背景色（不含文字颜色，避免覆盖禁用状态颜色）
const selectedBgClasses = isOverlay.value
  ? 'bg-white/10 font-medium'
  : 'bg-blue-500/10 font-medium';
// 选中状态文字颜色
const selectedTextClasses = isOverlay.value ? 'text-white' : 'text-blue-600 dark:text-blue-400';
const optionHoverClasses = isOverlay.value ? 'hover:bg-white/10' : 'hover:bg-blue-500/10';
const checkClasses = isOverlay.value ? 'text-white' : 'text-blue-600 dark:text-blue-400';
const placeholderClasses = isOverlay.value ? 'text-white/60' : 'text-slate-400 dark:text-slate-500';
// 禁用状态文字颜色（不使用透明度，改用色系区分）
const disabledTextClasses = isOverlay.value
  ? 'text-white/40'
  : 'text-slate-300 dark:text-slate-500';
</script>

<template>
  <div :class="['relative', fluid ? 'w-full' : 'inline-block']">
    <button
      :id="id"
      ref="triggerEl"
      type="button"
      :name="name"
      :disabled="disabled"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-activedescendant="isOpen && highlighted >= 0 ? `${panelId}-${highlighted}` : undefined"
      :class="[
        'flex w-full items-center justify-between gap-2 text-left transition-colors',
        triggerVariantClasses,
        isOpen ? focusClasses : ''
      ]"
      @click="toggleMenu"
      @keydown="onKeydown"
    >
      <span :class="['truncate', hasSelection ? '' : placeholderClasses]">
        {{ selectedLabel }}
      </span>
      <span
        :class="[
          'i-carbon-chevron-down h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen ? 'rotate-180' : '',
          chevronClasses
        ]"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isOpen" ref="panelEl" class="fixed z-50">
          <!-- 内层面板：Popper 只定位外层，因此可安全做 translateY 滑动动画 -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="isShown"
              :id="panelId"
              role="listbox"
              :aria-label="placeholder"
              :class="['w-full', panelVariantClasses]"
              @keydown="onKeydown"
            >
              <ul
                ref="listEl"
                class="no-scrollbar max-h-[min(60dvh,24rem)] overflow-y-auto overscroll-contain"
              >
                <li
                  v-for="(opt, index) in normalizedOptions"
                  :id="`${panelId}-${index}`"
                  :key="`${String(opt.value)}-${index}`"
                  role="option"
                  :aria-selected="model === opt.value"
                  :aria-disabled="opt.disabled || undefined"
                  :data-index="index"
                  :class="[
                    'flex w-full items-center justify-between gap-2 rounded-md text-left',
                    optionSizeClasses,
                    opt.disabled ? 'cursor-not-allowed' : optionHoverClasses,
                    model === opt.value ? selectedBgClasses : '',
                    opt.disabled
                      ? disabledTextClasses
                      : model === opt.value
                        ? selectedTextClasses
                        : baseOptionClasses
                  ]"
                  @mousemove="highlighted = index"
                  @click="selectOption(opt)"
                >
                  <span class="truncate">{{ opt.label }}</span>
                  <span
                    v-if="model === opt.value"
                    :class="['i-carbon-checkmark h-4 w-4 shrink-0', checkClasses]"
                  />
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
</style>
