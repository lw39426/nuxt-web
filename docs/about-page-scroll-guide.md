# About 页初级入门版说明

当前页面已经改成初学者版本，只保留 2 个模块，方便你先理解滚动页的基本结构。

## 当前结构

1. 模块 1：Hero 开场
2. 模块 2：核心表达（趁现在）
3. 底部：Roadmap 文案

对应文件：
- app/pages/about.vue

## 你可以先看这 3 个点

1. 模板结构
- 只保留两个 section 做滚动主内容。

2. UnoCSS 样式
- 大部分样式已改成原子类，基本不需要再维护大量 scoped CSS。

3. GSAP 动画
- 只保留两条 timeline：
  - Hero timeline
  - Now timeline

## 初学者建议改法

按下面顺序改，最稳：

1. 先改文案
- `heroMilestones`
- `chapters`

2. 再改图片
- `nowShards` 里删减或替换图片

3. 最后改动画时长
- 两条 timeline 的 `end`（比如 `+=150%`）
- `duration`
- `stagger`

## 常见调参方向

如果你想更简单：
- 把 `end` 从 `+=150%` 再降到 `+=120%`
- 把 `stagger` 调小（如 0.08 -> 0.05）
- 把 `nowShards` 数量减到 2 张

如果你想稍微更丰富：
- 给 Hero 再加一行副标题
- 给模块 2 增加 1 张碎片图
- 先不要增加新模块

## 下一步可选

1. 保持 2 模块不变，只做文案替换
2. 在模块 2 后追加一个非常轻量的 CTA 模块（静态，无 pin）
