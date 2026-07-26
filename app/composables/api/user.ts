/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  gender: number
  avatar: string
  description: string
  enable: number
  birthday: string
  create_at: string
}

/** 更新用户信息请求体 */
export interface UpdateUserInfoPayload {
  nickname?: string
  gender?: number
  birthday?: string
  description?: string
}

/**
 * 用户信息模块 API 封装
 * 前缀: /user
 * 需要鉴权
 */
export function useUserApi() {
  const { get, post, put } = useApi()

  /**
   * 获取用户信息
   * GET /user/info
   */
  async function getInfo() {
    return await get<UserInfo>('/user/info')
  }

  /**
   * 更新用户信息
   * PUT /user/updateInfo
   */
  async function updateInfo(payload: UpdateUserInfoPayload) {
    return await put<UserInfo>('/user/updateInfo', payload)
  }

  /**
   * 修改密码
   * POST /user/updatePassword
   */
  async function updatePassword(payload: { old_password: string; new_password: string }) {
    return await post<null>('/user/updatePassword', payload)
  }

  /**
   * 获取个人资料
   * GET /user/profile
   */
  async function getProfile() {
    return await get<UserInfo>('/user/profile')
  }

  /**
   * 绑定手机号
   * POST /user/bindPhone
   */
  async function bindPhone(payload: { phone: string; code: string }) {
    return await post<null>('/user/bindPhone', payload)
  }

  /**
   * 更新背景封面
   * POST /user/bgCover
   */
  async function updateBgCover(payload: { bg_cover: string }) {
    return await post<null>('/user/bgCover', payload)
  }

  return { getInfo, updateInfo, updatePassword, getProfile, bindPhone, updateBgCover }
}
