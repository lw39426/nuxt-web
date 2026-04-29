import type { Product } from '~/types/product'

export const useProducts = () => {
  const products = ref<Product[]>([])

  const loadProducts = async () => {
    if (products.value.length > 0) return

    try {
      const res = await $fetch<{ code: number; message: string; data: Product[] }>(
        '/api/mock/products'
      )
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
