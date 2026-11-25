/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  gender: number
  bg_cover?: string
  avatar: string
  description: string
  enable: number
  birthday: string
  create_at: string
}

/** 启用用户的公开资料，除 ID 外所有字段均允许为空。 */
export interface PublicUserInfo {
  id: number
  username: string | null
  nickname: string | null
  gender: number | null
  avatar: string | null
  bg_cover: string | null
  country: string | null
  province: string | null
  city: string | null
  description: string | null
  create_at: string | null
}
export type UserProfileSummary = Pick<UserInfo, 'id' | 'nickname' | 'avatar' | 'gender' | 'phone'>

/** 更新用户信息请求体 */
export interface UpdateUserInfoPayload {
  username?: string
  avatar?: string
  bg_cover?: string
  nickname?: string
  email?: string
  gender?: number
  birthday?: string
  description?: string
}

/**
 * 用户信息模块 API 封装
 * 前缀: /user
 * 除公开详情外需要鉴权
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
   * 修改密码：400 保留业务错误，401 使用通用鉴权刷新，结果提示由页面负责。
   * POST /user/updatePassword
   */
  async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
    return await post<null>('/user/updatePassword', payload, {
      suppressErrorToast: true
    })
  }

  /**
   * 获取个人资料
   * GET /user/profile
   */
  async function getProfile() {
    return await get<UserProfileSummary>('/user/profile')
  }

  /**
   * @deprecated 服务端暂未开放手机号绑定，调用会返回 HTTP 403。
   * POST /user/bindPhone
   */
  async function bindPhone(payload: { phone: string }) {
    return await post<null>('/user/bindPhone', payload)
  }

  /**
   * 获取启用用户的公开详情，不因资料请求失败触发登录刷新。
   * GET /user/:id，无需鉴权。
   */
  async function getPublicInfo(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('无效的用户 ID')
    return await get<PublicUserInfo>(`/user/${id}`, undefined, {
      suppressErrorToast: true,
      skipAuthRefresh: true
    })
  }

  async function uploadImage(file: File, target: 'avatar' | 'bgCover') {
    if (!/\.(jpe?g|png|gif|bmp|webp)$/i.test(file.name))
      throw new Error('请选择 JPG、PNG、GIF、BMP 或 WebP 图片')
    if (!file.size || file.size > 10 * 1024 * 1024)
      throw new Error('图片大小须大于 0 且不超过 10MB')
    const body = new FormData()
    body.append('file', file)
    return await post<{ avatar?: string; bg_cover?: string }>(`/user/${target}`, body)
  }

  return { getInfo, updateInfo, updatePassword, getProfile, bindPhone, getPublicInfo, uploadImage }
}
