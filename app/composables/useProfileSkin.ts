import { ref, readonly } from 'vue'

/** 皮肤 id（与 profile-skins.css 中 [data-profile-skin] 选择器一一对应） */
export type ProfileSkin = 'macaron' | 'mint'

/** localStorage 持久化 key */
const STORAGE_KEY = 'youmi-profile-skin'

/** 皮肤清单：供切换器渲染（预览色与 profile-skins.css 保持一致） */
export const PROFILE_SKINS: Array<{
  id: ProfileSkin
  name: string
  desc: string
  /** 预览渐变（实底主色，供切换器色卡展示） */
  preview: string
}> = [
  {
    id: 'macaron',
    name: '马卡龙',
    desc: '薰衣草紫 × 桃粉 × 奶黄弥散光',
    preview: 'linear-gradient(135deg, #9d7ce0, #f0a4b8, #ffd166)'
  },
  {
    id: 'mint',
    name: '薄荷',
    desc: '薄荷绿洗色，沉稳清爽',
    preview: 'linear-gradient(135deg, #6fe7c1, #0fa381)'
  }
]

/**
 * 校验任意值是否为合法皮肤 id（localStorage 旧值/脏数据防御）
 * @param value 待校验值
 * @returns 是合法皮肤则返回该皮肤，否则返回 null
 */
function normalizeSkin(value: unknown): ProfileSkin | null {
  return PROFILE_SKINS.some((s) => s.id === value) ? (value as ProfileSkin) : null
}

/* ---------- 模块级单例状态：所有调用方共享同一份 ---------- */
/** 当前皮肤（默认 macaron，与 profile-skins.css 的 :root 回落一致） */
const skin = ref<ProfileSkin>('macaron')
/** 是否已在客户端完成恢复（幂等标记） */
const restored = ref(false)

/**
 * 把皮肤同步到 <html data-profile-skin="...">，驱动 profile-skins.css 变量切换
 * @param value 目标皮肤
 */
function applyToDom(value: ProfileSkin) {
  if (import.meta.client) {
    document.documentElement.dataset.profileSkin = value
  }
}

/**
 * 从 localStorage 恢复皮肤并应用到 DOM（幂等）
 *
 * SSR 安全：服务端直接跳过（保持默认 macaron 渲染）；
 * 由个人中心入口组件在 onMounted 中调用，确保发生在水合之后，不引发属性不匹配。
 */
function restore() {
  if (!import.meta.client || restored.value) return
  restored.value = true
  try {
    const saved = normalizeSkin(localStorage.getItem(STORAGE_KEY))
    if (saved && saved !== skin.value) {
      skin.value = saved
    }
  } catch {
    // 读取失败按默认皮肤处理，不阻塞渲染
  }
  applyToDom(skin.value)
}

/**
 * 切换皮肤：更新状态 + 持久化 + 同步 DOM 属性
 * @param value 目标皮肤 id
 */
function setSkin(value: ProfileSkin) {
  // 校验色彩值
  const next = normalizeSkin(value)
  if (!next || next === skin.value) return
  skin.value = next
  applyToDom(next)
  if (import.meta.client) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 写入失败静默忽略（隐私模式等场景）
    }
  }
}

/**
 * 个人中心皮肤 composable
 *
 * 用法：
 *   const { skin, setSkin, restore } = useProfileSkin()
 *   - 个人中心入口（profile 布局）onMounted 调 restore() 恢复持久化皮肤
 *   - 切换器组件调用 setSkin('mint') 即时换肤
 *   - 页面样式只引用 --skin-* 变量，无需感知具体皮肤
 */
export function useProfileSkin() {
  return { skin: readonly(skin), skins: PROFILE_SKINS, setSkin, restore }
}
