export interface MockProduct {
  id: number
  title: string
  price: number
  originalPrice?: number
  description: string
  rating: number
  reviewCount: number
  images: string[]
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  brand: string
  memory?: string
  screenSize?: string
  screenType?: string
  battery?: string
  protectionClass?: string
  isNew?: boolean
  isSale?: boolean
  categoryId?: number // Added for server filtering
}

const brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Honor']
const memories = ['128GB', '256GB', '512GB', '1TB']
const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Purple', hex: '#800080' }
]

export const getMockProducts = (): MockProduct[] => {
  const products: MockProduct[] = []

  for (let i = 1; i <= 100; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const memory = memories[Math.floor(Math.random() * memories.length)]
    const price = Math.floor(Math.random() * 2000) + 500
    const isSale = Math.random() > 0.7

    products.push({
      id: i,
      title: `${brand} Phone Model ${i} ${memory}`,
      price: price,
      originalPrice: isSale ? price + 200 : undefined,
      description: `This is a great phone from ${brand} with ${memory} storage.`,
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 500),
      images: [
        `https://picsum.photos/seed/${i}/400/400`,
        `https://picsum.photos/seed/${i}-2/400/400`
      ],
      brand: brand,
      memory: memory,
      colors: [colors[Math.floor(Math.random() * colors.length)]],
      isNew: Math.random() > 0.8,
      isSale: isSale,
      categoryId: 11 // Assuming 11 is mobile phones for now
    })
  }

  return products
}
