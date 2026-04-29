export function useAuthApi() {
  const { post } = useApi()

  /**
   * 获取用户信息（POST /user/info）
   */
  async function getInfo() {
    return await post('/user/info')
  }

  return { getInfo }
}
