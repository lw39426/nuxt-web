/**
 * Mock 商品数据 composable
 * 仅用于开发阶段的 mock 数据展示，实际对接时应使用 useProductApi
 */
export const useProducts = () => {
  const products = ref<any[]>([])

  const loadProducts = async () => {
    if (products.value.length > 0) return

    try {
      const res = await $fetch<{ code: number; message: string; data: any[] }>('/api/mock/products')
      products.value = Array.isArray(res?.data) ? res.data : []
    } catch (error) {
      console.error('Failed to load mock products:', error)
      products.value = []
    }
  }

  const getProductById = (id: number) => {
    return products.value.find((p) => p.id === id) || products.value[0]
  }

  return {
    products,
    loadProducts,
    getProductById
  }
}
