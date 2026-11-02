/** 站点级配置类型定义 */

/** 价格展示开关配置 */
export interface PriceSwitchConfig {
  /** 是否展示商品与站点价格信息 */
  price_enabled: boolean
  /** 配置更新时间（ISO 8601 UTC 秒级） */
  updated_at: string
}
