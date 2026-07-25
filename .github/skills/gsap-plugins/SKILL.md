---
name: gsap-plugins
description: GSAP plugins used in this project — ScrollToPlugin for animated scrolling. ScrollTrigger has its own skill (gsap-scrolltrigger). Use when implementing scroll-to-element or smooth scroll position animations.
license: MIT
---

# GSAP Plugins (项目适用)

## When to Use This Skill

Apply when using GSAP plugins other than ScrollTrigger (which has its own skill). This project primarily uses ScrollToPlugin.

**Related skills:** For scroll-based animation use **gsap-scrolltrigger**; for core tweens use **gsap-core**; for Vue/Nuxt integration use **gsap-frameworks**.

## Registering Plugins

Register each plugin once at app level (e.g., in `plugins/gsap.client.ts`):

```javascript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
```

## ScrollToPlugin

Animates scroll position (window or a scrollable element). Use for "scroll to element" or "scroll to position".

```javascript
gsap.to(window, { duration: 1, scrollTo: { y: 500 } });
gsap.to(window, { duration: 1, scrollTo: { y: "#section", offsetY: 50 } });
gsap.to(scrollContainer, { duration: 1, scrollTo: { x: "max" } });
```

**Key config (scrollTo object):**

| Option | Description |
|--------|-------------|
| `x`, `y` | Target scroll position (number), or `"max"` for maximum |
| `element` | Selector or element to scroll to (for scroll-into-view) |
| `offsetX`, `offsetY` | Offset in pixels from the target position |

## Best practices

- ✅ Register plugins once at app level before first use
- ✅ Revert plugin instances when components unmount
- ✅ Use with `gsap.context()` for proper cleanup in Vue components

## Do Not

- ❌ Use a plugin without registering it first (`gsap.registerPlugin()`)
- ❌ Register plugins inside component body (runs every render)
