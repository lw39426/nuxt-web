export interface UserInfo {
  id: number
  username: string
  avatar?: string
  email?: string
  phone?: string
}

/**
 * 用户模块 API 封装
 */
export function useUserApi() {
  const { get, post } = useApi()

  /**
   * 获取用户信息（GET /miniapp/user/info）
   */
  async function getInfo() {
    return await get<UserInfo>('/miniapp/user/info')
  }

  /**
   * 更新用户信息（POST /miniapp/user/updateInfo）
   */
  async function updateInfo(payload: Partial<UserInfo>) {
    return await post<UserInfo>('/miniapp/user/updateInfo', payload as any)
  }

  /**
   * 修改密码（POST /miniapp/user/updatePassword）
   */
  async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
    return await post<null>('/miniapp/user/updatePassword', payload)
  }

  /**
   * 获取图形验证码（GET /miniapp/user/getCode）
   */
  async function getCaptcha() {
    return await get<{ imgBase64: string; uuid: string }>('/miniapp/user/getCode')
  }

  return { getInfo, updateInfo, updatePassword, getCaptcha }
}
