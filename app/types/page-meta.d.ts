/** 本项目页面外观配置。在 definePageMeta 中按需设置，默认均为 false。 */
interface AppPageMeta {
  /** 隐藏顶部导航栏。 */
  hideNavbar?: boolean
  /** 隐藏页面底部 Footer。 */
  hideFooter?: boolean
  /** 隐藏悬浮设置菜单和回到顶部按钮。 */
  hideFloatingMenu?: boolean
  /** 隐藏右侧小星 AI 入口。 */
  hideAiEntry?: boolean
  /** 隐藏底部角色对比浮层。 */
  hideCompareBar?: boolean
  /**
   * 使用整屏工作区，随手机键盘调整可见高度，内容区内部滚动。
   * 适用于聊天等页面，通常同时设置 hideFooter: true。
   */
  fullViewport?: boolean
  /**
   * 导航栏滚动行为，默认 auto。
   * auto：滚动时切换为胶囊；static：始终保持展开形态。
   * static 优先于 forceCapsule。
   */
  navbarScrollBehavior?: 'auto' | 'static'
  /**
   * 固定使用胶囊导航，并取消导航占位。
   * navbarScrollBehavior 为 static 时不生效。
   */
  forceCapsule?: boolean
}

declare module '#app' {
  // 通过声明合并扩展 Nuxt 的类型。
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface PageMeta extends AppPageMeta {}
}

declare module 'vue-router' {
  // 同时为 useRoute().meta 提供相同提示。
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteMeta extends AppPageMeta {}
}

export {}
