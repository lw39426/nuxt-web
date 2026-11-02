import { computed } from 'vue'
import type { PriceSwitchConfig } from '~/types/site'
import { useSiteApi } from '~/composables/api/site'

/** 价格开关的 SSR 状态键 */
const PRICE_SWITCH_STATE_KEY = 'site-price-switch'
/** 价格开关的 useAsyncData 缓存键 */
const PRICE_SWITCH_FETCH_KEY = 'site-price-switch:request'

/** 默认配置：接口异常时按“不展示价格”处理，避免误伤正常站点 */
const DEFAULT_PRICE_SWITCH: PriceSwitchConfig = {
  price_enabled: false,
  updated_at: ''
}

/**
 * 读取价格展示开关（纯状态读取，不发起请求）
 * 组件内直接调用；priceEnabled 为 false 时隐藏价格相关 UI
 */
export function usePriceSwitch() {
  const config = useState<PriceSwitchConfig>(PRICE_SWITCH_STATE_KEY, () => ({
    ...DEFAULT_PRICE_SWITCH
  }))

  /** 是否展示价格：仅当接口明确返回 false 时隐藏 */
  const priceEnabled = computed(() => config.value?.price_enabled !== false)

  return { config, priceEnabled }
}

/**
 * 预取价格展示开关
 * 仅在 default 布局中 await 调用一次，保证 SSR 首屏即确定价格显隐，
 * 避免客户端二次渲染导致价格闪现
 */
export async function prefetchPriceSwitch(): Promise<void> {
  const { config } = usePriceSwitch()
  const { getPriceSwitch } = useSiteApi()

  await useAsyncData<PriceSwitchConfig>(
    PRICE_SWITCH_FETCH_KEY,
    async () => {
      try {
        const data = await getPriceSwitch()
        config.value = data
        return data
      } catch {
        // 开关获取失败不阻塞首屏，保持默认展示价格
        return { ...DEFAULT_PRICE_SWITCH }
      }
    },
    { default: () => ({ ...DEFAULT_PRICE_SWITCH }) }
  )
}
