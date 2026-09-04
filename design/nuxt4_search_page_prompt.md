# 角色与任务
你是一名精通 Nuxt 4 + Vue 3 + Tailwind CSS 的高级前端工程师。请基于以下设计规范，编写一个完整的搜索中心页面（包含三种状态：搜索前、搜索中、搜索后）。

# 设计参考来源
- 主风格参考：WorkBuddy（腾讯 AI 办公助手）个人版后台
- 风格关键词：现代极简、轻科技、薄荷绿品牌色、卡片式布局、大圆角、大量留白

# 技术栈要求
- Nuxt 4 (Nuxt 3 兼容模式)
- Vue 3 Composition API + `<script setup>`
- Tailwind CSS v3/v4
- Lucide Vue (或 Heroicons) 作为图标库
- 不使用任何 UI 组件库（如 Element Plus / Ant Design），全部手写组件
- TypeScript 类型定义

# 全局设计系统（Design Tokens）

## 色彩
- 品牌主色（强调/按钮/进度/高亮）：#00D9A5（薄荷青绿）
- 品牌深色（主按钮/标题）：#1A1A1A（近黑）
- 背景底色：#F5F5F7（极浅灰，页面底层）
- 卡片背景：#FFFFFF（纯白）
- 文字主色：#1A1A1A
- 文字次要：#666666
- 文字辅助/占位：#999999
- 分割线/边框：#E5E5E5 或 #F0F0F0
- 选中态背景：#F0FDF9（极淡薄荷绿）
- Hover 背景：#F5F5F5
- 空状态/禁用：#CCCCCC
- 评分星星色：#FFB800
- 热销排名色：#FF6B6B(1st) / #FF9F43(2nd) / #FECA57(3rd)

## 字体
- 全局字体：system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif
- 标题：font-semibold (600)，大号
- 正文：font-normal (400)，常规
- 辅助文字：text-sm (14px)，text-xs (12px)

## 圆角
- 大卡片/模块：rounded-2xl (16px)
- 按钮/标签/输入框：rounded-xl (12px) 或 rounded-full（胶囊）
- 小标签：rounded-lg (8px)
- 搜索框：rounded-2xl (16px)

## 阴影
- 卡片默认：shadow-sm 或 `0 2px 8px rgba(0,0,0,0.04)`
- 卡片 Hover：shadow-md 或 `0 4px 16px rgba(0,0,0,0.06)`
- 下拉面板：`0 8px 32px rgba(0,0,0,0.08)`
- 不使用强烈阴影，保持扁平轻量感

## 间距
- 页面内边距：p-6 或 p-8 (24-32px)
- 卡片内边距：p-5 或 p-6 (20-24px)
- 模块间距：gap-6 (24px)

# 页面整体布局

采用左右三栏布局（Desktop > 1024px）：

```
┌─────────────────────────────────────────────────────┐
│  顶部搜索栏（固定 sticky top-0，z-50）               │
├──────────┬──────────────────────────────┬──────────┤
│          │                              │          │
│  筛选器   │      结果列表 / 内容区        │  推荐区   │
│ (220px)  │      (flex-1 自适应)         │ (240px)  │
│  sticky  │                              │  sticky  │
└──────────┴──────────────────────────────┴──────────┘
```

- 页面背景：#F5F5F7
- 最大内容宽度：1100px，居中
- 三栏间距：gap-6 (24px)
- 左侧筛选器和右侧推荐区使用 `position: sticky; top: 140px`

# 顶部搜索栏（全局固定）

- 背景：白色，底部 1px 边框 #F0F0F0
- 内边距：py-5 px-8 (20px 32px)
- 内部最大宽度：900px，居中

## 搜索框区域
- 左侧标题："🔍 搜索中心" — text-xl font-bold
- 搜索框容器：flex-1，相对定位
  - 输入框：width 100%, height 48px, padding 0 48px, border 2px #E5E5E5, rounded-2xl
  - focus 状态：border-color #00D9A5, box-shadow `0 0 0 3px rgba(0,217,165,0.1)`
  - 占位文案："搜索产品、文章或帮助文档，如 Nuxt4 教程"
  - 左侧搜索图标（绝对定位，left 16px, color #999）
  - 右侧：清除按钮（✕，输入有内容时显示）+ "搜索" 按钮（黑色背景，白色文字，rounded-xl）

## 分类 Tab
- 位于搜索框下方，水平排列，gap-2
- Tab 项："全部" / "📦 产品" / "📝 文章"
- 选中态：背景 #1A1A1A，白色文字，rounded-full，font-medium
- 未选中态：背景 #F5F5F5，文字 #666，rounded-full
- hover 态：未选中时背景略深

# 状态一：搜索前（Empty State）

当搜索框为空且未聚焦时展示。

## 1. 最近搜索
- 标题行："最近搜索"（左，font-semibold）+ "清空" 文字按钮（右，#999）
- 内容：横向 flex-wrap 胶囊标签
  - 每个标签：inline-flex, padding 8px 16px, 白色背景, rounded-full, border 1px #F0F0F0
  - 右侧带 ✕ 删除按钮（#ccc, hover #999）
  - hover：border-color #00D9A5
  - 最多展示 6-8 条

## 2. 热门搜索
- 标题："🔥 热门搜索" — font-semibold, mb-4
- 布局：grid grid-cols-2, gap-3
- 每个排名项：白色卡片, rounded-xl, padding 14px 16px, flex 布局
  - 排名数字：
    - 1st: 18px bold, #FF6B6B, 宽 24px
    - 2nd: 18px bold, #FF9F43, 宽 24px
    - 3rd: 18px bold, #FECA57, 宽 24px
    - 4+: 14px semibold, #ccc, 宽 24px, text-center
  - 中间：搜索词文本，14px, #333
  - 右侧：搜索次数，12px, #999
  - hover：border 1px #00D9A5, translateY(-1px), shadow-md

## 3. 分类快捷入口
- 标题："按分类浏览" — font-semibold, mb-4
- 布局：grid grid-cols-4, gap-4
- 每个分类卡片：白色背景, rounded-2xl, padding 24px, text-center
  - 图标区：48x48, 背景 #F0FDF9, rounded-xl, 居中, 24px emoji
  - 分类名：14px font-semibold
  - 数量：12px #999
  - hover：border 1px #00D9A5, translateY(-2px), shadow-lg

# 状态二：搜索中（Typing / Suggesting）

当搜索框有内容且处于 focus 状态时，下方展示下拉联想面板。

## 下拉面板容器
- 绝对定位，覆盖在页面上方（z-40）
- 背景白色, rounded-2xl, border 1px #F0F0F0
- 阴影：`0 8px 32px rgba(0,0,0,0.08)`
- 最大宽度与搜索框对齐（900px）

## 搜索直达区（Search Direct）
- 条件：针对高确定性关键词展示
- 背景：#F0FDF9（薄荷绿极淡）
- 顶部标签："搜索直达" — 12px, #00D9A5, font-semibold, 带小圆点指示器
- 内容：水平 flex, gap-4, padding 16px 20px
  - 左侧：商品图标/图片 48x48, 白色背景, rounded-xl
  - 中间：商品名（15px bold）+ 描述（13px #666）
  - 右侧：价格（16px bold）+ "查看" 按钮（薄荷绿背景, 白色文字, rounded-xl）

## 分类联想列表
- 按分类分组展示，每组带灰色标题栏
- 分组标题：12px, #999, font-semibold, 背景 #FAFAFA, padding 12px 20px
- 联想项：padding 10px 20px, flex, gap-3, cursor-pointer
  - 左侧：类型图标（📦/📝）, color #999
  - 中间：联想文本，匹配部分用 `<strong style="color: #00D9A5">` 高亮
  - 右侧：类型标签（"产品"/"文章"），12px, #999, 背景 #F5F5F5, rounded-md, padding 2px 8px
  - hover：背景 #F8F9FA

## 底部提示
- 居中文字："按 Enter 查看「关键词」的全部结果"
- 关键词加粗，border-top 1px #F5F5F5, padding 12px 20px

# 状态三：搜索后（Results State）

用户执行搜索后展示三栏结果页。

## 左侧筛选器（220px, sticky）

白色卡片容器, rounded-2xl, padding 20px, 内部模块间距 20px。

### 模块 1：内容类型
- 标题："筛选条件" — 15px font-semibold
- 子标题："内容类型" — 13px bold #333, mb-2
- 复选框列表：
  - 全部、产品、文章
  - checkbox 样式：accent-color #00D9A5, 16x16
  - 文字：14px #333
  - 垂直排列, gap-2

### 模块 2：价格区间
- 标题："价格区间" — 13px bold #333, mb-2
- 双输入框：width 70px, height 36px, border 1px #E5E5E5, rounded-lg, 13px
  - placeholder "¥0" / "¥9999"
  - 中间分隔符 "-"（#ccc）
- 可视化滑块：
  - 轨道：height 4px, 背景 #F0F0F0, rounded-full
  - 填充段：背景 #00D9A5
  - 两个拖拽手柄：14px 圆形, 白色背景, border 2px #00D9A5, shadow-sm

### 模块 3：评分
- 标题："评分" — 13px bold #333, mb-2
- 单选列表：
  - ⭐⭐⭐⭐⭐ 4.5分以上
  - ⭐⭐⭐⭐ 4分以上
  - 全部
  - radio accent-color #00D9A5

### 模块 4：标签
- 标题："标签" — 13px bold #333, mb-2
- 标签云：flex-wrap, gap-2
  - 未选中：padding 6px 12px, 背景 #F5F5F5, 文字 #666, rounded-full, 12px, cursor-pointer
  - 选中：背景 #F0FDF9, 文字 #00D9A5, border 1px #00D9A5

## 中间结果区（flex-1）

### 结果头部
- 左侧："找到 **128** 个相关结果" — 14px #666，数字加粗 #1A1A1A
- 右侧：
  - 已选筛选标签：inline-flex 胶囊，背景 #F0FDF9，文字 #00D9A5，右侧带 ✕ 删除
  - 分隔线：1px 宽, 16px 高, #E5E5E5
  - 排序下拉：border 1px #E5E5E5, rounded-lg, padding 6px 12px, 13px
    - 选项：综合排序 / 最新发布 / 热度最高 / 价格从低到高

### 混合结果卡片列表
垂直 flex, gap-4。每张卡片：白色背景, rounded-2xl, padding 20px, border 1px transparent。

**hover 统一效果**：border-color #00D9A5, shadow `0 4px 16px rgba(0,0,0,0.05)`, transition 0.2s

---

### 产品卡片结构
- 整体：flex, gap-5
- 左侧图片：120x120, 背景 #F8F9FA, rounded-xl, flex-shrink-0, 居中 emoji/图片
- 右侧内容区：flex-1, min-width-0
  - 顶部行：flex, justify-between
    - 左侧：
      - 类型标签行：flex, gap-2, mb-1
        - "产品" 标签：12px, #00D9A5, 背景 #F0FDF9, rounded-md, padding 2px 8px, font-medium
        - 分类：12px #999
      - 商品名：16px font-semibold, #1A1A1A, line-height 1.4
    - 右侧价格区：text-right, flex-shrink-0
      - 现价：20px bold #1A1A1A
      - 原价：13px #999, line-through
  - 描述：14px #666, mt-2, line-clamp-2, line-height 1.5
  - 底部行：flex, justify-between, mt-3
    - 左侧元信息：flex, gap-3, items-center
      - 评分：⭐ 黄色 + 数字 13px #666
      - 月销量：13px #999
      - 店铺名：13px #999
    - 右侧操作：flex, gap-2
      - 收藏按钮：36x36, border 1px #E5E5E5, 白色背景, rounded-xl, 居中 🤍 图标
      - 主按钮：height 36px, padding 0 20px, 背景 #1A1A1A, 白色文字, rounded-xl, 13px font-medium

---

### 文章卡片结构
- 整体：无图片，纯文字信息密度型
- 顶部：类型标签行（同产品卡片，但显示"文章" + 分类如"技术教程 · 前端框架"）
- 标题：17px font-semibold, #1A1A1A, mb-2, line-height 1.4
- 摘要：14px #666, mb-3, line-clamp-2, line-height 1.6
- 底部行：flex, justify-between
  - 左侧作者区：flex, gap-3, items-center
    - 头像：28px 圆形, 背景 #1A1A1A 或 #00D9A5, 白色文字（首字）, 12px bold
    - 作者名：13px #333
    - 发布时间：12px #999
    - 互动数据：12px #999（阅读 x.xk · 赞 xxx）
  - 右侧标签云：flex, gap-2
    - 每个标签：padding 4px 10px, 背景 #F5F5F5, #666, rounded-md, 12px

---

### 分页器
- 居中，flex, gap-2, mt-8
- 上一页/下一页按钮：36x36, border 1px #E5E5E5, 白色背景, rounded-xl, #999
- 页码按钮：36x36, 同上样式，当前页：背景 #1A1A1A, 白色文字, border-none
- 省略号：#999

## 右侧推荐区（240px, sticky）

### 模块 1：相关推荐
- 白色卡片, rounded-2xl, padding 20px, mb-4
- 标题："🔥 相关推荐" — 15px font-semibold, mb-4
- 内容：垂直排列, gap-4
  - 每个推荐项：cursor-pointer
    - 图片区：width 100%, height 120px, 背景 #F8F9FA, rounded-xl, 居中 emoji, mb-2
    - 商品名：14px font-semibold, hover 变 #00D9A5
    - 价格：13px #666，带划线原价

### 模块 2：热门标签
- 白色卡片, rounded-2xl, padding 20px
- 标题："🏷️ 热门标签" — 15px font-semibold, mb-4
- 标签云：flex-wrap, gap-2
  - 标签样式：padding 6px 12px, 背景 #F5F5F5, #666, rounded-full, 12px, cursor-pointer
  - hover：背景 #F0FDF9, 文字 #00D9A5

# 无结果状态（Zero Results）

当搜索结果为空时，中间结果区替换为：
- 居中布局，padding 60px
- 大图标：搜索机器人或放大镜，64px，#E5E5E5
- 主文案："未找到与「xxx」相关的内容" — 16px #666
- 副文案："建议检查关键词拼写，或尝试更通用的词语" — 14px #999
- 推荐区："为您推荐以下热门内容" + 3-4 个热门卡片（简化版）
- 操作按钮："清除筛选条件"（薄荷绿文字按钮）+ "提交需求"（黑色按钮）

# 交互细节

1. **搜索框交互**：
   - focus 时 border 变薄荷绿 + 外发光
   - 输入内容时显示清除按钮
   - 输入时实时触发联想（debounce 300ms）
   - Enter 执行搜索，展示结果页

2. **状态切换动画**：
   - 三种状态切换使用 fade 过渡，duration 200ms
   - 卡片 hover 统一：border 变薄荷绿 + 轻微阴影

3. **筛选器交互**：
   - 复选框/单选变更即时更新结果（无需确认按钮）
   - 价格区间输入后按 Enter 或失焦时触发筛选
   - 已选筛选项以胶囊标签展示在结果头部，可点击删除

4. **分页交互**：
   - 点击页码平滑滚动到结果区顶部
   - 当前页码禁用 hover 效果

5. **加载状态**：
   - 结果区首次加载显示骨架屏（shimmer 动画：#F5F5F5 到 #EEEEEE 渐变）
   - 骨架屏：3-4 个灰色矩形块，高度与真实卡片一致

# 代码结构建议

```
~/pages/search.vue              # 主页面，管理三种状态
~/components/search/
  SearchBar.vue                 # 顶部搜索栏（含 Tab）
  SuggestionDropdown.vue        # 搜索中下拉联想面板
  RecentSearches.vue            # 最近搜索标签
  TrendingSearches.vue          # 热门搜索排名
  CategoryShortcuts.vue         # 分类快捷入口
  FilterSidebar.vue             # 左侧筛选器
  ResultHeader.vue              # 结果头部（数量 + 排序）
  ProductCard.vue               # 产品结果卡片
  ArticleCard.vue               # 文章结果卡片
  RecommendationSidebar.vue     # 右侧推荐区
  EmptyState.vue                # 无结果状态
  Pagination.vue                # 分页器
  SkeletonCard.vue              # 骨架屏
~/components/ui/
  Card.vue                      # 白色圆角卡片包装器
  Badge.vue                     # 标签组件（多种变体）
  Button.vue                    # 按钮组件（黑色/薄荷绿/文字/图标）
```

# Mock 数据要求

请在组件内部提供完整的 mock 数据，确保：
1. 最近搜索至少 4 条
2. 热门搜索至少 6 条（含排名）
3. 分类快捷入口 4 个
4. 联想数据：产品 2 条 + 文章 3 条 + 搜索直达 1 条
5. 搜索结果：混合 4 条（2 产品 + 2 文章）
6. 右侧推荐 2 个商品 + 6 个热门标签
7. 分页共 10 页

所有数据使用中文，内容贴合技术/数码主题。

# 响应式适配

- **Desktop (>1024px)**：完整三栏布局
- **Tablet (768-1024px)**：
  - 左侧筛选器隐藏，改为顶部横向滚动筛选条（sticky）
  - 右侧推荐区隐藏
  - 结果区全宽
- **Mobile (<768px)**：
  - 顶部搜索栏简化（标题隐藏）
  - 筛选器变为底部抽屉（点击"筛选"按钮弹出）
  - 结果卡片单列全宽
  - 分类 Tab 可横向滚动
  - 分页器简化为"加载更多"按钮

# TypeScript 类型定义

```typescript
interface SearchSuggestion {
  id: string
  type: 'product' | 'article'
  title: string
  highlight: string // 匹配高亮部分
  category?: string
}

interface ProductResult {
  id: string
  type: 'product'
  name: string
  image: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  sales: number
  shop: string
  description: string
}

interface ArticleResult {
  id: string
  type: 'article'
  title: string
  summary: string
  author: { name: string; avatar: string }
  publishDate: string
  readCount: number
  likeCount: number
  tags: string[]
  category: string
}

type SearchResult = ProductResult | ArticleResult

interface FilterState {
  types: ('product' | 'article')[]
  priceRange: [number, number]
  rating: number | null
  tags: string[]
}
```

# 额外要求
1. 所有颜色使用 Tailwind 自定义配置或 CSS 变量，禁止多处硬编码
2. 使用 `<script setup lang="ts">` 语法
3. 组件 props 和 emits 必须带类型定义
4. 适当的代码注释说明每个区块
5. 确保无 console 报错，无未使用变量
6. 图片/emoji 区域使用占位 div + emoji 或 Lucide 图标，不依赖外部图片资源
7. 搜索状态使用 `useState` 或 `ref` 管理：`searchQuery`, `searchState` ('empty'|'typing'|'results'), `activeTab`, `filters`, `currentPage`
