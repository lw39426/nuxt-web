# BaseSelect 下拉选择器组件

> 自定义下拉选择器（封装原生 `<select>`），提供统一的视觉风格、键盘导航与无障碍支持，
> 用于登录弹窗、个人资料表单、角色页移动端地区选择等场景。

## 目录

- [为什么封装](#为什么封装)
- [特性](#特性)
- [Props API](#props-api)
- [v-model](#v-model)
- [基础用法](#基础用法)
- [场景示例](#场景示例)
- [键盘交互与无障碍](#键盘交互与无障碍)
- [架构说明](#架构说明)
- [测试](#测试)

---

## 为什么封装

原生 `<select>` 在不同浏览器下的外观不可控，且与项目整体设计（圆角、焦点态、暗色模式）不一致。
本项目封装 `BaseSelect` 实现统一风格，同时补齐键盘导航与 `aria` 无障碍语义。

## 特性

- **v-model 双向绑定**（`defineModel`），支持 `string | number | boolean`
- **两种选项写法**：对象数组 `{ label, value, disabled }` 或原始值数组 `['a', 'b']`
- **三种尺寸**：`sm / md / lg`
- **两种变体**：`default`（常规表单）与 `overlay`（深色覆盖层页面，如角色页）
- **键盘导航**：`↑/↓` 移动、`Enter/Space` 选中、`Esc` 关闭、`Tab` 关闭
- **无障碍**：`combobox` / `listbox` / `option` ARIA 语义 + `aria-activedescendant`
- **弹层定位**：`@popperjs/core` fixed 定位 + Teleport 到 body，不受 `overflow-hidden` / `transform` 裁剪
- **入场动画**：面板向下滑动 + 淡入（`translateY(-8px) → 0`），且先定位再展示，不会左上角闪现
- **暗色模式**：随站点 `dark:` 主题自动切换
- **禁用态**：整体禁用 `disabled` 与单选项禁用 `option.disabled`

---

## Props API

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `options` | `BaseSelectOption[] \| (string \| number \| boolean)[]` | —（必填） | 选项列表 |
| `modelValue` | `string \| number \| boolean \| null` | `null` | 当前选中值（配合 `v-model`） |
| `placeholder` | `string` | `'请选择'` | 未选中时展示的占位文案 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `id` | `string` | — | 透传到按钮，供 `<label for>` 关联 |
| `name` | `string` | — | 透传到按钮的 `name` 属性 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | 触发器尺寸 |
| `variant` | `'default' \| 'overlay'` | `'default'` | 视觉变体 |
| `fluid` | `boolean` | `true` | `true` 时占满父容器宽度，`false` 时收缩包裹内容 |

### 选项结构

```ts
export type BaseSelectOptionValue = string | number | boolean

export interface BaseSelectOption {
  label: string
  value: BaseSelectOptionValue
  disabled?: boolean // 可选：禁用该选项
}
```

也可以直接传原始值数组，组件会按 `label === String(value)` 自动转换。

---

## v-model

组件通过 `defineModel` 实现双向绑定，父组件直接用 `v-model` 即可：

```vue
<BaseSelect v-model="gender" :options="genderOptions" />
```

只读场景（如由路由驱动、由父组件全权控制的展示型选择）可只用 `:model-value` + `@update:model-value`：

```vue
<BaseSelect
  :model-value="currentSlug"
  :options="regionOptions"
  @update:model-value="changeRegion"
/>
```

---

## 基础用法

```vue
<script setup lang="ts">
const account = ref('')

const accountOptions = [
  { label: '快速选择账号', value: '', password: '' },
  { label: 'user', value: 'user', password: '123456' }
]
</script>

<template>
  <BaseSelect
    id="quick-account"
    v-model="account"
    :options="accountOptions"
    placeholder="快速选择账号"
  />
</template>
```

---

## 场景示例

### 1. 登录弹窗（lg 默认样式，全宽）

登录弹窗中的"快速选择账号"即此用法，触发按钮尺寸 `h-12 lg:h-11`、圆角 `rounded-xl`、蓝色焦点环：

```vue
<BaseSelect id="quick-account" v-model="account" :options="accountOptions" />
```

### 2. 个人资料表单（md 尺寸）

性别选择使用 `size="md"`（`h-10 rounded-lg`）与表单其他输入框对齐：

```vue
<BaseSelect v-model="form.gender" size="md" :options="genderOptions" />
```

### 3. 角色页移动端地区选择（overlay 变体）

深色图片背景上使用 `overlay` 变体（半透明黑 + 白字），`fluid="false"` 让触发按钮收缩包裹内容，
定位类（`absolute top-24 left-4 z-20`）通过 class 透传：

```vue
<BaseSelect
  class="sm:hidden absolute top-24 left-4 z-20"
  fluid="false"
  variant="overlay"
  size="sm"
  :model-value="currentRegionSlug"
  :options="regionOptions"
  placeholder="选择地区"
  @update:model-value="changeRegion"
/>
```

> 说明：`class` 会透传到组件根元素（`fallthrough attrs`），`id`/`name` 已声明为 props 透传到触发按钮。

---

## 键盘交互与无障碍

| 按键 | 行为 |
|---|---|
| `↑` / `↓` | 面板关闭时展开并高亮当前选中项；展开时移动高亮（跳过禁用项） |
| `Enter` / `Space` | 选中当前高亮项并关闭 |
| `Esc` | 关闭面板，焦点回到触发器 |
| `Tab` | 关闭面板 |

组件对外暴露语义：

- 触发器：`role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant`
- 面板：`role="listbox"`
- 选项：`role="option"` + `aria-selected` + `aria-disabled`

点击触发器之外的区域（`onClickOutside`）也会关闭面板。

---

## 架构说明

```
app/
  components/BaseSelect.vue     # 纯展示 + v-model + 键盘逻辑（presentation）
  composables/useDropdown.ts    # 弹层状态/定位/点击外部/卸载清理（state + side effects）
```

遵循 Vue 最佳实践做了分层：

- **状态与副作用下沉**：`useDropdown` 封装 `isOpen / highlighted`、Popper 创建/销毁、
  点击外部关闭、卸载清理，组件保持"小而聚焦"
- **响应式**：布尔/数字等原始值使用 `shallowRef`；派生值一律 `computed` 且保持纯函数
- **数据流**：props 下行 + `defineModel` 双向绑定，类型化契约（`defineProps<T>`）
- **模板安全**：面板通过 `<Teleport to="body">` 渲染，规避 `overflow-hidden` / `transform` 祖先裁剪

### 为什么用 Popper + Teleport

- 登录弹窗外层容器带 `overflow-hidden` 且过渡动画含 `transform`（会形成 fixed 定位的包含块），
  因此面板必须 Teleport 到 body 再定位
- Popper 负责弹层相对触发器的定位、视口翻转（`flip`）、越界约束（`preventOverflow`）
- 面板宽度通过 `matchTriggerWidth` modifier 与触发按钮等宽

### 面板双层结构与入场动画

面板是"外层定位壳 + 内层面板"两层：

- **外层**（`ref="panelEl"`）：`fixed z-50`，只承载 Popper 定位（`transform`），无视觉样式
- **内层**（`v-if="isShown"`）：承载面板视觉样式与 `-translate-y-2 → 0` 的下滑 + 淡入动画

这样做解决了两个问题：

1. **左上角闪现**：`open()` 先把外层挂载进 DOM（此时内容未渲染），`nextTick` 中 Popper 同步完成
   首次定位后再置 `isShown = true` 展示内层，面板从一开始就出现在触发器下方，不会先以 `(0,0)`
   渲染再跳位
2. **动画冲突**：Popper 用 `transform` 定位外层，内层再做 `translateY` 滑动互不冲突，
   否则滑动动画会覆盖 Popper 的定位 transform

---

## 测试

`tests/components/BaseSelect.test.ts`（9 个用例，happy-dom）：

| 覆盖点 | 说明 |
|---|---|
| placeholder / 选中 label 渲染 | 未选择与已选择两种展示 |
| string[] 简写选项 | 原始值数组自动转换 |
| 展开面板 | 点击触发，渲染全部选项，`aria-expanded` 更新 |
| 选择选项 | `update:modelValue` emit + 面板关闭 |
| 禁用选项 | 点击不可选中、面板不关闭 |
| disabled 整体禁用 | 点击不展开 |
| 键盘导航 | `ArrowDown` 展开 → 移动高亮 → `Enter` 选中 |
| Esc 关闭 | 面板关闭 |

**测试要点：**

- `@popperjs/core` 通过 `vi.mock` 替换为假实例，隔离定位逻辑
- happy-dom 下 stub `Teleport` / `Transition`，面板内联渲染，断言确定无时序抖动
- 运行：`pnpm run test:component`
