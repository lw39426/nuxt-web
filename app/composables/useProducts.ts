interface MockProduct {
  id: number
  code?: string
  title?: string
  name?: string
  [key: string]: any
}

/**
 * Mock 商品数据 composable
 * 仅用于开发阶段的 mock 数据展示，实际对接时应使用 useProductApi
 */
export const useProducts = () => {
  const products = ref<MockProduct[]>([])

  /** 加载本地 mock 商品列表，供详情页兜底和相关推荐复用 */
  const loadProducts = async () => {
    if (products.value.length > 0) return

    try {
      const res = await $fetch<{ code: number; message: string; data: MockProduct[] }>(
        '/api/mock/products'
      )
      products.value = Array.isArray(res?.data) ? res.data : []
    } catch (error) {
      console.error('Failed to load mock products:', error)
      products.value = []
    }
  }

  /** 按商品 id 或 code 查找商品，供接口失败时回退使用 */
  const getProductByIdentifier = (identifier: string | number) => {
    const normalizedIdentifier = String(identifier).trim().toLowerCase()
    return (
      products.value.find((product) => {
        const productCode = product.code?.trim().toLowerCase()
        return String(product.id) === normalizedIdentifier || productCode === normalizedIdentifier
      }) || null
    )
  }

  return {
    products,
    loadProducts,
    getProductByIdentifier
  }
}
