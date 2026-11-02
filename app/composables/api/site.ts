import type { PriceSwitchConfig } from '~/types/site'

/**
 * 站点配置模块 API 封装
 * 前缀: /site
 * 无鉴权要求
 */
export function useSiteApi() {
  const { get } = useApi()

  /**
   * 获取价格展示开关
   * GET /site/price-switch
   */
  async function getPriceSwitch() {
    return await get<PriceSwitchConfig>('/site/price-switch')
  }

  return { getPriceSwitch }
}
