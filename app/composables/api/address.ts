/** 地址对象 */
export interface Address {
  id: number
  recipient_name: string
  phone: string
  address_line: string
  is_default: boolean
}

/** 创建/编辑地址请求体 */
export interface AddressPayload {
  recipient_name: string
  phone: string
  address_line: string
  is_default?: boolean
}

/**
 * 地址管理模块 API 封装
 * 前缀: /user/addresses
 * 需要鉴权
 */
export function useAddressApi() {
  const { get, post, put, del } = useApi()

  /**
   * 获取地址列表
   * GET /user/addresses
   */
  async function list() {
    return await get<Address[]>('/user/addresses')
  }

  /**
   * 新增地址
   * POST /user/addresses
   */
  async function create(payload: AddressPayload) {
    return await post<Address>('/user/addresses', payload)
  }

  /**
   * 编辑地址
   * PUT /user/addresses/<address_id>
   */
  async function update(addressId: number, payload: Partial<AddressPayload>) {
    return await put<Address>(`/user/addresses/${addressId}`, payload)
  }

  /**
   * 删除地址
   * DELETE /user/addresses/<address_id>
   */
  async function remove(addressId: number) {
    return await del<null>(`/user/addresses/${addressId}`)
  }

  /**
   * 设置默认地址
   * PUT /user/addresses/<address_id>/setDefault
   */
  async function setDefault(addressId: number) {
    return await put<null>(`/user/addresses/${addressId}/setDefault`)
  }

  /**
   * 获取默认地址
   * GET /user/addresses/default
   */
  async function getDefault() {
    return await get<Address>('/user/addresses/default')
  }

  return { list, create, update, remove, setDefault, getDefault }
}
