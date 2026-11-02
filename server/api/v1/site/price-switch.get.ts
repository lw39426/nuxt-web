import type { PriceSwitchConfig } from '~/types/site'

/**
 * 价格展示开关接口
 * GET /api/v1/site/price-switch
 * 优先代理 Flask，失败时降级为本地 Mock
 *
 * 开关用于控制商品（角色）及站点价格信息是否展示；
 * 本地可通过 NUXT_PRICE_SWITCH_DEFAULT=false 模拟关闭态
 */
export default defineEventHandler((event) => {
  /** 构造价格开关 Mock 数据：默认开启，更新时间取当前 UTC 秒级时间 */
  const buildMock = (): PriceSwitchConfig => ({
    price_enabled: useRuntimeConfig().priceSwitchDefault !== false,
    updated_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  })

  return withMockFallback(event, '/site/price-switch', buildMock)
})
