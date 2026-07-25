---
name: gsap-frameworks
description: GSAP with Vue 3 / Nuxt 4 — lifecycle integration, gsap.context() scoping, cleanup on unmount. Use when writing GSAP animations in Vue or Nuxt components.
license: MIT
---

# GSAP with Vue 3 / Nuxt 4

## When to Use This Skill

Apply when writing or reviewing GSAP code in Vue 3 (Composition API) or Nuxt 4 components.

**Related skills:** For tweens use **gsap-core**; for sequencing use **gsap-timeline**; for scroll-based animation use **gsap-scrolltrigger**.

## Core Principles

- **Create** tweens and ScrollTriggers **after** the component's DOM is available (`onMounted`).
- **Kill or revert** them in `onUnmounted` so nothing runs on detached nodes.
- **Scope selectors** to the component root via `gsap.context(callback, scope)`.

## Vue 3 `<script setup>` (推荐)

```javascript
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const container = ref(null);
let ctx;

onMounted(() => {
  if (!container.value) return;
  ctx = gsap.context(() => {
    gsap.to(".box", { x: 100 });
    gsap.from(".item", { autoAlpha: 0, stagger: 0.1 });
  }, container.value);
});

onUnmounted(() => {
  ctx?.revert();
});
</script>

<template>
  <div ref="container">
    <div class="box">Box</div>
    <div class="item">Item</div>
  </div>
</template>
```

## Vue 3 Options API

```javascript
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";

export default {
  setup() {
    const container = ref(null);
    let ctx;

    onMounted(() => {
      if (!container.value) return;
      ctx = gsap.context(() => {
        gsap.to(".box", { x: 100, duration: 0.6 });
        gsap.from(".item", { autoAlpha: 0, y: 20, stagger: 0.1 });
      }, container.value);
    });

    onUnmounted(() => { ctx?.revert(); });

    return { container };
  }
};
```

## Scoping Selectors

Always pass the scope (container ref) as the second argument to `gsap.context(callback, scope)`:

- ✅ `gsap.context(() => { gsap.to(".box", ...) }, containerRef)` — `.box` scoped to component
- ❌ `gsap.to(".box", ...)` without context scope — may affect elements outside the component

## ScrollTrigger Cleanup

ScrollTrigger instances are included in `gsap.context()` and reverted when `ctx.revert()` is called.

- Create ScrollTriggers inside the same `gsap.context()` callback as tweens
- Call `ScrollTrigger.refresh()` after layout changes (e.g., after data loads, use `nextTick`)

## Nuxt 4 注意事项

- GSAP 插件应注册在 `.client.ts` 插件中（如 `plugins/gsap.client.ts`），避免 SSR 报错
- 使用 `onMounted` 确保 DOM 就绪后再创建动画
- 页面切换时 Nuxt 会自动触发组件 unmount，确保 `ctx.revert()` 被调用

## Do Not

- ❌ 在 `setup()` 中直接创建动画（DOM 可能不存在）
- ❌ 使用全局选择器而不传 scope 给 `gsap.context()`
- ❌ 跳过 cleanup，必须在 `onUnmounted` 中调用 `ctx.revert()`
- ❌ 在组件内重复 `registerPlugin`，应在应用级别注册一次
