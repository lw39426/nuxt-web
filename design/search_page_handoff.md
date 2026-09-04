# 搜索中心页面 — 开发交接文档

> 设计需求源文档:[`design/nuxt4_search_page_prompt.md`](./nuxt4_search_page_prompt.md)
> 本文档记录:已完成内容、关键项目约定(与设计文档的偏差适配)、未完成任务清单及实现指引。
> 交接日期:2026-09-03

---

## 一、任务背景

按设计文档实现搜索中心页面(`/search`),包含三种状态:**搜索前(Empty)**、**搜索中(联想下拉 Typing)**、**搜索后(Results,含无结果 Zero Results)**,左右三栏布局(筛选器 220px / 结果区 flex-1 / 推荐区 240px),响应式适配 Desktop / Tablet / Mobile。

## 二、关键项目约定(必读,与设计文档冲突时以此为准)

设计文档按"Tailwind CSS"编写,但**本项目实际样式方案是 UnoCSS(presetWind3)+ 语义 token 体系**,已按项目现状适配:

| 设计文档写法 | 项目实际写法 |
|---|---|
| `bg-white` / `bg-#F5F5F7` 等硬编码 | 语义 token:`bg-surface` / `bg-canvas-elevated` / `bg-surface-muted` |
| `text-#1A1A1A` / `text-#666` / `text-#999` | `text-fg` / `text-fg-muted` / `text-fg-subtle` |
| `border-#E5E5E5` | `border-line` / `border-line-strong` |
| 品牌色 `#00D9A5` | `bg-brand` / `text-brand` / `bg-brand-soft`(本项目品牌绿 `#0fba81`) |
| 黑色主按钮 `bg-#1A1A1A` | `bg-fg text-canvas` |
| Tailwind 自定义 config | `uno.config.ts` theme.colors + `app/assets/css/theme.css`(唯一事实源) |

其余铁律(详见 `docs/tokens.md`):
1. **禁止给语义色加 `/opacity`**(如 `bg-fg/90` 会静默丢弃透明度),需要时用 `opacity-*` 或 `-soft/-hover/-active` 变体。
2. **图标用 UnoCSS presetIcons 类名**:`i-lucide-*` 或 `i-carbon-*`(已装 `@iconify-json/lucide`),不装 lucide-vue 组件库。
3. 组件**自动导入**(Nuxt 4,`app/components` 下按目录前缀;`search/` 目录组件直接写 `<SearchBar />` 等,无需 import);`app/utils`、`app/composables` 同样自动导入。
4. 全局导航栏是 `fixed`(高 72px / md:80px),**页面内容自带占位**;搜索页的 sticky 元素 `top` 需从 72/80px 起算。
5. `@vueuse/core` 已安装,可直接 `import { useDebounceFn, onClickOutside, useLocalStorage } from '@vueuse/core'`。
6. 代码规范:`<script setup lang="ts">` + Composition API;props/emits 必须带类型;script → template → style 顺序。
7. 现有 `app/components/ui/`(Button/Badge/Card 等)可选用,但搜索页按文档要求全手写,已实现的组件未依赖它们。

## 三、已完成内容(7 个文件)

### 1. 类型定义 `app/types/search.ts`

文档要求的类型全部落地,并有 2 处适配(文件头有注释说明):
- `ProductResult.image` → `emoji: string`(设计文档"额外要求 6"要求不依赖外部图片,用 emoji 占位);
- `ArticleResult.author.avatar` → `avatar: string`(存首字,渲染首字圆形头像);
- 补充 `tags` / `timestamp` 字段(标签筛选与"最新发布"排序需要)。

另有:`SearchTab`('all'|'product'|'article')、`SortKey`、`SearchDirectItem`(搜索直达)、`RecentItem`、`TrendingItem`、`CategoryShortcut`、`RecommendationProduct`、`FilterChip`。

### 2. Mock 数据 `app/utils/searchMock.ts`

| 导出 | 说明 |
|---|---|
| `TOTAL_RESULTS = 128`、`PAGE_SIZE = 13`(→ 10 页)、`PRICE_MIN/MAX = 0/9999`、`FILTER_DEFAULT` | 常量 |
| `DEFAULT_RECENT`(4 条)、`TRENDING_SEARCHES`(6 条含排名)、`CATEGORY_SHORTCUTS`(4 个)、`SEARCH_DIRECT_ITEMS`(1 条,trigger 含 'nuxt') | 搜索前/联想数据 |
| `RECOMMEND_PRODUCTS`(2)、`HOT_TAGS`(6)、`ZERO_RESULT_RECOMMENDS`(4) | 右侧推荐 / 空结果推荐 |
| `SEARCH_POOL` 6 商品 + 6 文章;`getExpandedPool()` 确定性扩展为 128 条(带缓存) | 结果池 |
| `getSuggestions(kw)` 产品≤2 + 文章≤3;`getSearchDirect(kw)` 命中返回直达卡片 | 联想 |
| `filterAndSortResults(items, kw, filters, sort)` 关键词+筛选+排序 | 核心筛选 |
| `buildFilterChips(filters)` → `FilterChip[]`(key: `type`/`price`/`rating`/`tag:xx`) | 结果头已选胶囊 |
| `formatCount`(万缩写)、`formatCompact`(k 缩写) | 格式化 |

### 3. 组件 `app/components/search/`(5 个,均可自动导入)

| 组件 | 职责与契约 |
|---|---|
| `SearchBar.vue` | 顶部搜索栏(标题+输入框+清除+搜索按钮+分类 Tab)。`v-model:query="string"`、`v-model:active-tab="SearchTab"`;props:`suggestions` / `direct` / `showDropdown`;emits:`search`(Enter 或按钮)、`select-suggestion`、`select-direct`、`focus-change(focused)`(Escape 也会触发 false)。内嵌渲染 `SuggestionDropdown`。**注意:目前只有 focus/Escape 会发 focus-change,关闭下拉还需父级处理外部点击(建议父级用 `onClickOutside`)** |
| `SuggestionDropdown.vue` | 联想面板:搜索直达区(brand-soft 底)+ 产品/文章分组联想(关键词 `<strong class="text-brand">` 高亮,纯插值无 v-html)+ 底部"按 Enter 查看"提示 + 无联想兜底文案 |
| `RecentSearches.vue` | 最近搜索。props:`items: RecentItem[]`;emits:`select(keyword)` / `remove(id)` / `clear`;空态有兜底文案 |
| `TrendingSearches.vue` | 热门搜索双列排名卡(1/2/3 名红/橙/黄)。props:`items: TrendingItem[]`;emits:`select(keyword)` |
| `CategoryShortcuts.vue` | 分类快捷入口四宫格。props:`items: CategoryShortcut[]`;emits:`select(item)` |
| `FilterSidebar.vue` | 筛选器(内容类型/价格区间双滑块/评分单选/标签多选)。`v-model="FilterState"`(整体替换更新);价格输入 Enter/blur 提交;桌面侧栏与移动抽屉**复用同一组件**。`TAG_OPTIONS`(Vue3/Nuxt4/TypeScript/机械键盘/显示器/降噪)与结果池标签对应 |

以上组件均已用语义 token,light/dark 双主题自动适配。

## 四、未完成任务(按实施顺序)

### 任务 1:结果区组件 `app/components/search/`(7 个新组件)

均参考设计文档"状态三"的规格,样式全部用语义 token(对照表见上文第二节),hover 统一 `border-brand + shadow-md + transition 0.2s`(卡片默认 `border border-transparent`)。

1. **`ProductCard.vue`** — props:`product: ProductResult`;emits:`favorite(id)` / `detail(id)`。
   结构:flex,左 120x120 emoji 占位块(`bg-surface-muted rounded-xl`),右内容区:类型标签行("产品" 用 `UiBadge` 或手写 `bg-brand-soft text-brand rounded-md px-2 py-0.5 text-xs` + 分类 `text-fg-subtle text-xs`)→ 商品名 16px semibold → 右侧价格区(现价 20px bold,原价 `line-through text-fg-subtle`)→ 描述 `line-clamp-2 text-sm text-fg-muted` → 底部行(评分 ⭐ text-yellow-400、月销量 `formatCount(sales)`、店铺名;右侧收藏 36x36 `border border-line rounded-xl` + 主按钮 `bg-fg text-canvas h-9 px-5 rounded-xl text-[13px]`)。

2. **`ArticleCard.vue`** — props:`article: ArticleResult`;emits:`detail(id)`。
   纯文字密度型:标签行("文章" + `category`)→ 标题 17px semibold → 摘要 `line-clamp-2` → 底部行(左:28px 圆形首字头像(`bg-fg text-canvas` 或 `bg-brand text-on-brand`)+ 作者名 + `publishDate` + `formatCompact(readCount)` 阅读 · `likeCount` 赞;右:标签云 `bg-surface-muted rounded-md px-2.5 py-1 text-xs`)。

3. **`ResultHeader.vue`** — props:`total: number`、`chips: FilterChip[]`、`sort: SortKey`;emits:`update:sort` / `remove-chip(key)` / `clear-filters`。
   左:"找到 **N** 个相关结果"(数字 `text-fg font-bold`);右:已选胶囊(`bg-brand-soft text-brand` 带 ✕)→ 竖分隔线 → 排序下拉(可用原生 `<select class="border border-line rounded-lg px-3 py-1.5 text-[13px]">` 或项目现有 `BaseSelect.vue`,选项:综合排序/最新发布/热度最高/价格从低到高)。

4. **`Pagination.vue`** — `v-model:page`、props:`totalPages: number`;emits 变更后**父级平滑滚动到结果区顶部**。按钮 36x36 `border border-line rounded-xl`,当前页 `bg-fg text-canvas border-none cursor-default`;含上一页/下一页/省略号(页数>7 时省略)。**移动端(<768px)由父级换成"加载更多"按钮,本组件 `hidden md:flex`**。

5. **`SkeletonCard.vue`** — props:`variant?: 'product' | 'article'`(默认 product)。shimmer 动画:`#F5F5F5 → #EEEEEE` 渐变,在 `theme.css` §4 加普通 CSS 类(如 `.skeleton-shimmer`,用 `background: linear-gradient(...) + animation`,颜色可直接写字面量灰,不算业务色);结构模拟真实卡片(左图块 + 三行文字条),父级渲染 3-4 个。

6. **`EmptyState.vue`**(无结果) — props:`keyword: string`;emits:`clear-filters` / `submit-request`。
   居中 py-[60px]:大图标 `i-lucide-search-x` 64px `text-line-strong`(或 `i-lucide-bot`)→ "未找到与「xxx」相关的内容" 16px text-fg-muted → 副文案 14px text-fg-subtle → "为您推荐以下热门内容"(`ZERO_RESULT_RECOMMENDS` 渲染 4 个精简卡,单行横排或 2x2)→ 按钮行("清除筛选条件" `text-brand` 文字按钮 + "提交需求" `bg-fg text-canvas`)。

7. **`RecommendationSidebar.vue`** — 右侧栏(240px)。模块 1"🔥 相关推荐":`RECOMMEND_PRODUCTS` 垂直排(图区 h-[120px] `bg-surface-muted rounded-xl` 居中 emoji + 名称 14px semibold `hover:text-brand` + 价格/划线原价);模块 2"🏷️ 热门标签":`HOT_TAGS` 胶囊(`bg-surface-muted text-fg-muted rounded-full`,hover `bg-brand-soft text-brand`),点击 emit `select-tag(tag)`。

### 任务 2:(可选)`FilterQuickBar.vue` — 平板筛选条

设计文档 Tablet(768-1024px)要求:侧栏隐藏,改为**顶部横向滚动筛选条(sticky)**。最简实现:横向滚动一行已选筛选胶囊 + "筛选"按钮(打开移动抽屉同款),`hidden lg:hidden` 区间显示(即 `md:block lg:hidden`)。若时间紧可跳过,直接用移动端抽屉按钮覆盖平板。

### 任务 3:主页面 `app/pages/search.vue`(核心,状态管理草案如下)

```ts
import type { FilterState, RecentItem, SearchTab, SortKey } from '~/types/search'
import { DEFAULT_RECENT, FILTER_DEFAULT, PAGE_SIZE, buildFilterChips,
  filterAndSortResults, getExpandedPool, getSearchDirect, getSuggestions } from '~/utils/searchMock'
// utils 自动导入,import 亦可省略;保持显式 import 也没问题

const query = shallowRef('')                  // 输入框内容(未提交)
const submittedKeyword = shallowRef('')       // 已提交关键词
const isFocused = shallowRef(false)
const hasSearched = shallowRef(false)         // 是否执行过搜索
const isLoading = shallowRef(false)
const filters = ref<FilterState>({ ...FILTER_DEFAULT })
const sort = shallowRef<SortKey>('relevance')
const currentPage = shallowRef(1)
const recentList = ref<RecentItem[]>([...DEFAULT_RECENT])   // 可选:useLocalStorage('search-recent', ...) 持久化

// 「typing」本质是下拉可见性,页面布局只有 empty/results 两态
const showDropdown = computed(() => isFocused.value && query.value.trim().length > 0)
const searchState = computed(() => (hasSearched.value ? 'results' : 'empty'))

// Tab 与 filters.types 双向派生(writable computed,避免两处状态失同步)
const activeTab = computed<SearchTab>({
  get: () => (filters.value.types.length === 1 ? filters.value.types[0]! : 'all'),
  set: (tab) => { filters.value = { ...filters.value, types: tab === 'all' ? [] : [tab] } }
})

// 联想(mock 为同步数据可直接算;接真实接口时改 useDebounceFn 300ms + AbortController)
const suggestions = computed(() => getSuggestions(query.value))
const direct = computed(() => getSearchDirect(query.value))

// 结果管线(mock 128 条)
const pool = getExpandedPool()
const allResults = computed(() => filterAndSortResults(pool, submittedKeyword.value, filters.value, sort.value))
const totalPages = computed(() => Math.max(1, Math.ceil(allResults.value.length / PAGE_SIZE)))
const pageResults = computed(() => allResults.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))
const isEmpty = computed(() => hasSearched.value && !isLoading.value && allResults.value.length === 0)
const chips = computed(() => buildFilterChips(filters.value))

// 执行搜索:提交关键词、重置页码、记录最近搜索(去重置顶、上限 8)、模拟 600ms loading
function doSearch() { ... }
// 筛选变化即时生效(computed 已覆盖),但需 currentPage 重置为 1:
watch(filters, () => { currentPage.value = 1 }, { deep: true })
watch(sort, () => { currentPage.value = 1 })

// 删除胶囊:按 key 前缀还原对应筛选项(type→[]、price→FILTER_DEFAULT.priceRange、rating→null、tag:xx→移除该标签)
function removeChip(key: string) { ... }
```

**模板骨架:**

```html
<template>
  <div class="min-h-screen bg-canvas-elevated">
    <!-- 顶部搜索栏:吸顶在全局导航下方(导航 fixed 高 72/80px) -->
    <div class="sticky top-[72px] md:top-[80px] z-30" @vue:mounted="/* 或用 onClickOutside 包裹关闭下拉 */">
      <SearchBar v-model:query="query" v-model:active-tab="activeTab" ... />
    </div>

    <main class="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
      <!-- 状态一:搜索前 -->
      <div v-if="searchState === 'empty'" class="max-w-[900px] mx-auto space-y-10">
        <RecentSearches :items="recentList" @select="kw => { query = kw; doSearch() }" ... />
        <TrendingSearches :items="TRENDING_SEARCHES" @select="..." />
        <CategoryShortcuts :items="CATEGORY_SHORTCUTS" @select="..." />
      </div>

      <!-- 状态三:搜索后,三栏 -->
      <div v-else class="flex items-start gap-6">
        <!-- 左筛选:lg 显示,sticky top-[140px];md 以下由"筛选"按钮开抽屉 -->
        <div class="hidden lg:block w-[220px] shrink-0 sticky top-[140px]">
          <FilterSidebar v-model="filters" />
        </div>

        <div class="flex-1 min-w-0">
          <ResultHeader :total="allResults.length" :chips="chips" v-model:sort="sort" ... />
          <Transition name="fade">
            <div v-if="isLoading" class="space-y-4"><SkeletonCard v-for="i in 4" :key="i" /></div>
            <EmptyState v-else-if="isEmpty" :keyword="submittedKeyword" ... />
            <div v-else class="flex flex-col gap-4">
              <template v-for="item in pageResults" :key="item.id">
                <ProductCard v-if="item.type === 'product'" :product="item" />
                <ArticleCard v-else :article="item" />
              </template>
            </div>
          </Transition>
          <Pagination v-if="!isEmpty && totalPages > 1" v-model:page="currentPage" :total-pages="totalPages" class="hidden md:flex" />
          <!-- 移动端:加载更多 -->
          <button class="md:hidden w-full h-10 ..." v-if="currentPage < totalPages" @click="currentPage++">加载更多</button>
        </div>

        <!-- 右推荐:lg 显示,sticky top-[140px] -->
        <div class="hidden lg:block w-[240px] shrink-0 sticky top-[140px]">
          <RecommendationSidebar @select-tag="..." />
        </div>
      </div>
    </main>

    <!-- 移动端筛选抽屉:md 以下,底部滑出,内放同一个 <FilterSidebar v-model="filters" />,遮罩 bg-[var(--overlay)] -->
    <!-- 平板筛选条(可选 FilterQuickBar):md:block lg:hidden -->
  </div>
</template>

<style scoped>
/* 三状态切换 fade 过渡 200ms */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

**已定决策(沿用即可):**
- `searchState` 用 `hasSearched` 推导,不单独存状态;typing 只是下拉可见性(`showDropdown`)。
- 分页点击后 `window.scrollTo({ top: 结果区 offsetTop - 120, behavior: 'smooth' })`。
- 下拉关闭:父级对搜索栏容器用 `onClickOutside(() => isFocused.value = false)`(@vueuse/core);联想项点击后 `doSearch()` 并收起。
- 筛选变化即时生效,无需确认按钮(文档交互 3)。
- 页面 SEO 可加 `useSeoMeta({ title: '搜索中心' })`(项目其他页面未强制,可选)。

### 任务 4:质量验收(必做)

1. **ESLint**:`pnpm lint:fix`(或 `npx eslint app/pages/search.vue app/components/search --fix`);确保无未使用变量、无 console 报错。
2. **TS**:`npx nuxi typecheck`(项目 `typescript.strict: true`)。
3. **浏览器验收**(`pnpm dev` 后访问 `/search`),逐项核对设计文档:
   - [ ] 搜索前:最近搜索(增删清空)、热门搜索排名色、分类入口 hover 上浮;
   - [ ] 输入 "nuxt":300ms 联想出现,直达卡片(brand-soft 底)、分组联想高亮、底部提示;Enter 进结果页;
   - [ ] 结果页:三栏布局(>1024px),结果头计数 + 已选胶囊可删 + 排序 4 项生效;
   - [ ] 筛选:类型/价格(滑块+输入)/评分/标签 即时过滤;筛掉全部时出现无结果页(推荐搜 "zzzz" 验证);
   - [ ] 分页 10 页、切页平滑滚动;首载骨架屏 shimmer;
   - [ ] 响应式:1280 / 900 / 375 三档(平板隐藏侧栏,移动抽屉筛选 + 加载更多 + 搜索栏标题隐藏 + Tab 横滚);
   - [ ] 深色主题切换后无硬编码白底黑字残留(语义 token 应自动翻转);
   - [ ] 无 console 报错、无未使用变量。

## 五、风险与备注

- `searchMock.ts` 的 `getExpandedPool()` 模块级缓存:服务端渲染下数据确定性生成,多请求共享无副作用(纯只读),如后续接真实接口整文件可废弃。
- `SearchBar.vue` 中输入框用了原生 `type="search"`,已用 CSS 隐藏浏览器自带的 ✕(`[&::-webkit-search-cancel-button]:hidden`),清除逻辑用自定义按钮。
- 价格双滑块用两层透明 `<input type="range">` 叠加实现(FilterSidebar 内有注释),`pointer-events: none` 只留拇指可点;若需兼容更老浏览器可换第三方,但项目要求无 UI 库,当前方案够用。
- `RecentSearches`/`CategoryShortcuts` 点击均以关键词驱动 `doSearch()`,与"最近搜索记录关键词"闭环一致。
