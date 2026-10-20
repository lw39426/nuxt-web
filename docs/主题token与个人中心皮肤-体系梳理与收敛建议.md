# 主题 token 体系 与 个人中心皮肤体系 — 职责边界梳理与收敛建议

**日期**: 2026-10-13
**状态**: 待评估（本文档只做梳理，不改代码）
**关联文档**: [主题系统重构-规格与实施计划.md](./主题系统重构-规格与实施计划.md)、[tokens.md](./tokens.md)、[主题切换文档.md](./主题切换文档.md)

---

## 0. 一句话结论

是两套独立体系，**职责划分本应正交（明暗 × 色调），但边界没划干净**：

- 皮肤体系在 `.dark [data-profile-skin]` 里**自己又实现了一遍暗色适配**，与主题体系的 `.dark` 重复；
- 皮肤体系把主题已有的**中性维度（阴影 / 玻璃 / 次级底）**又复制了一份；
- 更关键的是：皮肤类**已经渗透到全站**（导航栏、对比栏、产品图鉴页、全站楼层标题组件），但语义定位仍是「个人中心皮肤」——**名不副实**。

冗余集中在**中性维度**；核心色调（accent / solid / 渐变 / 光斑）是皮肤真正独有的，不算多余。

---

## 1. 两套体系对照

| 维度 | 主题 token 体系 | 个人中心皮肤体系 |
|------|----------------|------------------|
| 事实源 | `app/assets/css/theme.css` | `app/assets/css/profile-skins.css` |
| 切换机制 | `.dark` / `.light` class | `<html data-profile-skin="macaron\|mint">` |
| 正交维度 | **明暗** | **色调** |
| 变量命名 | `--canvas / --surface / --fg / --brand / --accent` | `--skin-*` |
| 消费方式 | `uno.config.ts` `theme.colors` 映射成类名（`bg-surface` / `text-fg` / `bg-brand`） | 手写工具类（`.bg-skin` / `.text-skin` / `.bg-skin-solid` …）+ 页面内直接 `var(--skin-*)` |
| 引擎 | `@nuxtjs/color-mode` | 自建 `useProfileSkin` composable（localStorage 持久化） |
| 名义作用域 | 全站 | 个人中心 |
| 实际作用域 | 全站 | **全站**（见 §3） |

---

## 2. 与既有架构决策的冲突

[主题系统重构-规格与实施计划.md](./主题系统重构-规格与实施计划.md) 已确立三条核心决策：

1. **单一事实源**：颜色值统一收归 `theme.css`，加新主题只改一个文件（§1、§4）。
2. **消灭 `dark:` 双写**：通过 CSS 变量代理，`.dark` 一出现语义类自动翻转（§1、§3.1）。
3. **非明暗主题用 `[data-theme]` 扩展**：oled / sepia 等作为「明暗色调变体」（§10）。

皮肤体系与这三条**逐条相悖**：

| 既有决策 | 皮肤体系的实际做法 | 冲突 |
|----------|-------------------|------|
| 单一事实源 | 另建 `profile-skins.css` 一整套变量 | ❌ 出现第二个事实源 |
| 消灭双写 | `.dark [data-profile-skin='macaron']` 把明暗值重写一遍 | ❌ 等价于「dark 双写」的变体 |
| 非明暗主题走 `[data-theme]` | 用 `[data-profile-skin]` 另开一套属性通道 | ❌ 属性通道分裂 |

> 也就是说：皮肤体系是**架构外挂**，方向与主题系统重构的目标相反。它更像是「上一版 mint 主题」整块迁入个人中心后遗留的产物（`profile-skins.css` 注释自述：`mint 薄荷洗色，上一版本色彩`）。

另注：`--accent`（`#7584cc` 蓝紫）在重构文档 §5.2 中标注为「**占位，未全站统一**」。皮肤体系其实可以看作「个人中心的 accent 随皮肤」，但走了独立变量，未与 `--accent` 合流。

---

## 3. 实际使用范围扫描（关键发现）

### 3.1 皮肤类已渗透全站

`bg-skin-*` / `text-skin` / `bg-skin-solid` 等工具类的引用点**远超个人中心**：

| 文件 | 引用 | 是否个人中心 |
|------|------|--------------|
| `app/components/AppNavbarLayout.vue#L202` | `bg-skin-solid`（用户头像） | ❌ 全局导航栏 |
| `app/components/compare/CompareBar.vue#L75,93,104` | `bg-skin-solid` | ❌ 全局悬浮对比栏 |
| `app/pages/products/index.vue#L17-30` | `bg-skin-glow-a/b/c`、`bg-skin-title` | ❌ 角色图鉴页 |
| `app/components/ui/SectionHeader.vue#L60-88` | `bg-skin-glow-a/b/c`、`bg-skin-title` | ❌ 全站楼层标题组件 |
| `app/components/ProfileCard.vue#L29` | `bg-skin` | 半（个人中心相关） |
| `app/components/ProfileRowItem.vue#L33` | `text-skin` | 半（个人中心相关） |
| `app/pages/profile/*.vue` | 大量 `--skin-*` / 皮肤类 | ✅ 是 |

### 3.2 由此引出的现状问题

`profile-skins.css` 的 `:root` 把 **macaron（马卡龙紫）作为默认皮肤**。而 `data-profile-skin` 属性**只有在水合后、且进入个人中心时**才会被 `useProfileSkin.restore()` 写入 `<html>`（见 `app/composables/useProfileSkin.ts#L62-L74`）。

后果：**未进入个人中心的普通用户（绝大多数）在全站看到的是马卡龙紫**——导航头像、对比栏、产品页光斑、所有楼层标题，都是紫色。这既不是品牌绿，也不是任何有意的全站主色。

> 这不是「冗余」，而是**定位与范围不一致**，且影响面是全站首屏。**建议优先于冗余收敛处理。**

### 3.3 `--skin-*` 变量的直接引用范围

直接 `var(--skin-*)` 引用集中在：`profile/checkin.vue`、`profile/collection.vue`、`profile/favorites.vue`、`profile/account.vue`、`ProfileSidebar.vue`、`ProfileSkinSwitcher.vue`、`AppNavbarLayout.vue`。**影响面可控**，收敛改动主要落在这几个文件。

---

## 4. 冗余点清单（分级）

### 4.1 真冗余（建议收敛）

| # | 皮肤变量 | 主题已有对应 | 说明 |
|---|----------|--------------|------|
| 1 | `--skin-shadow-sm / md / btn`（3 档） | `--shadow-soft`（1 档） | dark 下均为 `rgba(0,0,0,.25~.4)`，语义重合；档位数还不一致 |
| 2 | `--skin-glass` | `--glass-bg` | dark：`rgba(28,28,33,.65)` vs `#232327e6`；light：`rgba(255,255,255,.66)` vs `#ffffffe6`，几乎同一件事 |
| 3 | `.dark [data-profile-skin]` 整块 | `.dark` | 皮肤自己把明暗值重写一遍（含 1、2），等价 dark 双写 |
| 4 | `--accent` 与 `--skin-accent` 双轨 | —— | 全站强调色有两个来源，容易混淆（CompareBar 从 `bg-accent` 改 `bg-skin-solid` 即踩此边界） |

### 4.2 伪冗余（看着像重复，实则语义不同，不建议合并）

| 变量 | 易误判为 | 实际差异 |
|------|----------|----------|
| `--skin-ink-on: #ffffff` | `--on-brand` 的重复 | `--on-brand` 在 dark 下是深绿 `#06281e`（品牌底变亮）；皮肤实底渐变恒偏深、文字恒白。**语义不同，不可合并** |
| `--skin-ink / ink-sub / ink-strong` | `--fg / fg-muted` 的重复 | 个人中心 Hero 文字是**彩色品牌化**（深紫 / 苔绿），非纯中性文字层级 |
| `--skin-chip-bg / chip-hover / chip-border` | `--brand-soft` 的重复 | 随皮肤变化的淡色底（淡紫 / 淡薄荷），是皮肤色调的一部分 |

### 4.3 皮肤真正独有（应保留）

`--skin-accent`、`--skin-solid`、`--skin-solid-shadow`、`--skin-fill-gradient`、`--skin-fill-soft`、`--skin-card-gradient`、`--skin-title-gradient`、`--skin-glow-a/b/c`、`--skin-hero-bg`、`--skin-blob-a/b`、`--skin-dots-color`、`--skin-dot`、`--skin-ring-halo`、`--skin-card-border`。

这些是「色调维度」的表达，主题体系没有对应物，**保留是对的**。

---

## 5. 收敛方案（三档，供评估）

### 方案 A｜边界收口（低风险，建议先做）

**目标**：皮肤只负责色调维度，中性维度回归主题 token；消除皮肤的暗色重写。

- `--skin-shadow-sm/md/btn` → 统一引用 `--shadow-soft`（如需两档，在 `theme.css` 补 `--shadow-md`）
- `--skin-glass` → 复用 `--glass-bg`
- `.dark [data-profile-skin]` 块内**删除中性变量**（阴影 / 玻璃），只保留 accent / solid / fill / glow / blob / dots 等色调变量
- **影响文件**：`profile-skins.css` + 引用 `--skin-shadow-*` / `--skin-glass` 的页面（`checkin.vue`、`collection.vue`、`favorites.vue`）
- **取舍**：亮色下阴影会从「带紫 / 绿调」变成中性灰，品牌感略降（可用 `color-mix` 补回色偏，见 §6）

### 方案 B｜色调对齐（中风险）

**目标**：个人中心的强调色统一走 `--accent`，不再并行 `--skin-accent`。

- 在 `[data-profile-skin]` 作用域内直接覆盖 `--accent: var(--skin-accent)`、`--accent-soft` 同理
- 个人中心页面用全站统一的 `bg-accent / text-accent` 表达强调，减少一套 `--skin-accent` 心智
- 渐变 / 光斑 / 纹理仍保留 `--skin-*`
- **影响**：`account.vue`、`comments.vue`、`favorites.vue`、`addresses.vue`、`orders.vue` 等页面里 `.text-skin` → `text-accent` 等（**量大**）
- **风险**：`--accent` 目前是蓝紫，被全站其他地方用于选中态，覆盖需限定作用域，避免误伤

### 方案 C｜皮肤升格为「全站可切换主题」（高风险，需产品决策）

**目标**：既然皮肤已渗透全站，就正式把它定义为「全站强调色主题」，与明暗正交。

- **默认不再回落 macaron**（当前导致未登录用户全站看到紫），改为回落品牌绿（mint 或纯中性）
- `[data-profile-skin]` 由 `<html>` 统一驱动，全站一致
- 与 `[data-theme]`（oled / sepia，见重构文档 §10）**合并为同一套主题维度体系**
- **影响**：全局视觉 + 产品决策；需先明确「全站默认主色是绿还是紫」

---

## 6. 补充：若要在收敛后保留「品牌色阴影」

主题 `--shadow-soft` 是中性黑，皮肤阴影带品牌色偏。若方案 A 收敛后想保留色偏，可在 `theme.css` 用 `color-mix` 生成：

```css
/* 品牌色阴影（随 --brand 变化，替代皮肤里写死的紫/绿阴影） */
:root {
  --shadow-brand: 0 4px 14px color-mix(in srgb, var(--brand) 18%, transparent);
}
```

（`color-mix` 现代浏览器均支持，且值随 `--brand` 自动翻转，符合单一事实源。）

---

## 7. 待决策问题（评估时请先拍板）

1. **全站默认主色**：未进入个人中心的用户，导航头像 / 对比栏 / 产品页光斑 / 楼层标题，应该是什么颜色？（现状=马卡龙紫，疑为意外）
2. **收敛力度**：只做方案 A（消重复），还是推进到 B / C（统一强调色 / 全站主题化）？
3. **皮肤是否应全站生效**：个人中心的皮肤切换，是否允许影响全站其他页面？还是应严格限定在个人中心？
4. **是否接受亮色阴影去品牌色偏**（方案 A 的取舍），或需保留（走 §6 的 `color-mix`）？

---

## 8. 附：变量级映射建议表（方案 A 口径）

| 皮肤变量 | 处置 | 目标 |
|----------|------|------|
| `--skin-shadow-sm` | 收敛 | `--shadow-soft`（或新 `--shadow-sm`） |
| `--skin-shadow-md` | 收敛 | `--shadow-soft`（或新 `--shadow-md`） |
| `--skin-shadow-btn` | 收敛 | `--shadow-soft`（或新 `--shadow-btn`） |
| `--skin-glass` | 收敛 | `--glass-bg` |
| `--skin-ink-on` | 保留 | 语义不同，勿合并 |
| `--skin-ink / ink-sub / ink-strong` | 保留 | 个人中心彩色文字 |
| `--skin-chip-bg / chip-hover / chip-border` | 保留 | 皮肤色调的淡色底 |
| `--skin-accent / solid / solid-shadow` | 保留 | 皮肤核心色调 |
| `--skin-fill-* / card-gradient / title-gradient` | 保留 | 皮肤渐变 |
| `--skin-glow-* / hero-bg / blob-* / dots-color / dot` | 保留 | 皮肤光斑与纹理 |
| `--skin-ring-halo / card-border` | 保留 | 皮肤描边 / 光晕 |
| `.dark [data-profile-skin]` 内的阴影 / 玻璃 | 删除 | 交给 `.dark` 主题体系 |
