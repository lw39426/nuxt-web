import type { Product } from '~/types/product'

export const useProducts = () => {
  const products = ref<Product[]>([
    {
      id: 1,
      title: 'Apple iPhone 14 Pro 512GB Gold (MQ233)',
      price: 1437,
      rating: 4.8,
      reviewCount: 124,
      images: [
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '512GB',
      description: 'The ultimate iPhone.',
      colors: [{ name: 'Gold', hex: '#F9E5C9' }]
    },
    {
      id: 2,
      title: 'Apple iPhone 11 128GB White (MQ233)',
      price: 510,
      rating: 4.5,
      reviewCount: 89,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '128GB',
      description: 'Just the right amount of everything.',
      colors: [{ name: 'White', hex: '#FFFFFF' }]
    },
    {
      id: 3,
      title: 'Apple iPhone 11 128GB White (MQ233)',
      price: 550,
      rating: 4.6,
      reviewCount: 56,
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '128GB',
      description: 'Just the right amount of everything.',
      colors: [{ name: 'White', hex: '#FFFFFF' }]
    },
    {
      id: 4,
      title: 'Apple iPhone 14 Pro 1TB Gold (MQ2V3)',
      price: 1499,
      rating: 4.9,
      reviewCount: 200,
      images: [
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '1TB',
      description: 'Pro. Beyond.',
      colors: [{ name: 'Gold', hex: '#F9E5C9' }]
    },
    {
      id: 5,
      title: 'Apple iPhone 14 Pro 1TB Gold (MQ2V3)',
      price: 1399,
      rating: 4.8,
      reviewCount: 150,
      images: [
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '1TB',
      description: 'Pro. Beyond.',
      colors: [{ name: 'Gold', hex: '#F9E5C9' }]
    },
    {
      id: 6,
      title: 'Apple iPhone 14 Pro 128GB Deep Purple (MQ0G3)',
      price: 1600,
      rating: 4.9,
      reviewCount: 312,
      images: [
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '128GB',
      description: 'A magical new way to interact with iPhone.',
      colors: [{ name: 'Deep Purple', hex: '#594F63' }]
    },
    {
      id: 7,
      title: 'Apple iPhone 13 mini 128GB Pink (MLK23)',
      price: 850,
      rating: 4.7,
      reviewCount: 98,
      images: [
        'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '128GB',
      description: 'Your new superpower.',
      colors: [{ name: 'Pink', hex: '#FAD7BD' }]
    },
    {
      id: 8,
      title: 'Apple iPhone 14 Pro 256GB Space Black (MQ0T3)',
      price: 1399,
      rating: 4.9,
      reviewCount: 180,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '256GB',
      description: 'Pro camera system.',
      colors: [{ name: 'Space Black', hex: '#343434' }]
    },
    {
      id: 9,
      title: 'Apple iPhone 14 Pro 256GB Silver (MQ103)',
      price: 1399,
      rating: 4.8,
      reviewCount: 145,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
      ],
      brand: 'Apple',
      memory: '256GB',
      description: 'Designed for durability.',
      colors: [{ name: 'Silver', hex: '#E2E4E1' }]
    }
  ])

  const getProductById = (id: number) => {
    return products.value.find((p) => p.id === id)
  }

  return {
    products,
    getProductById
  }
}
