export interface HomeConfig {
  hero: {
    backgroundImage: string
    title: string
    subtitle: string
  }
}

/**
 * 首页配置 API
 */
export function useHomeApi() {
  const { get } = useApi()

  /**
   * 获取首页配置
   */
  async function getHomeConfig() {
    return await get<HomeConfig>('/home/config')
  }

  return { getHomeConfig }
}
