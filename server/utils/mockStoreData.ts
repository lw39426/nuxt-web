import type { Product } from '../../app/types/product'

export interface MockCategoryItem {
  id: number
  name: string
  imageUrl: string
}

const STORE_CATEGORIES: MockCategoryItem[] = [
  {
    id: 101,
    name: 'iPhone',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-iphone-nav-202509?wid=1200&hei=780&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXM1doT212VzJoWjBSKzRpbmNETHN1QnRHU3BERzdnOWdiQkwvWTZGajY2b1M0TjRWdzF2UjRGVEY0c3dBQVZ6VFN0TmdKaCs3NTJMbFVuOGp2LzI5RGc'
  },
  {
    id: 102,
    name: 'iPad',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-ipad-nav-202405?wid=400&hei=260&fmt=png-alpha&.v=dW5XbHI1eDVpd01qWUU4bFRtWGZXNGFLQTJVNnlNQmQrVmRBYnZYei9jckUzelNmMnRxajE0NHhmMWtLazl6eG53M0FRZHBXNTh1U1lFVEtSR2YzTm5qbE56RWRpRFNIRXZvbkd2S0l5dTg'
  },
  {
    id: 103,
    name: 'AirPods',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-airpods-nav-202509?wid=400&hei=260&fmt=png-alpha&.v=Q0Z1bWFqMUpRRnp3T0Y0VWJpdk1yMDhFUStvWHB3SDlDa3VrdUZORWRqeld1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VGZUMjJQZFhhT2thWmkxZjhra3FyZEk'
  },
  {
    id: 105,
    name: 'Apple Watch',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-watch-nav-202509_GEO_CN?wid=400&hei=260&fmt=png-alpha&.v=S0tSVzBtSkRkSFFhMm1zS1NmeWtkK0gvNGFhODF5SWpidW9tVnFmL2Irb2VvdFg5cVlhUGU4K01Fajc1NW0yZ2M5THdmR1U4Nmp4b2NFbEg2N21UQzYzZVFZZGtHNUI4c1NvME1xTTYxSzc5a0ZJUzF4N0hxOTgyVVJQTk50c2M'
  },
  {
    id: 106,
    name: 'Apple Vision Pro',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-vision-pro-nav-202401?wid=400&hei=260&fmt=png-alpha&.v=VzVpanYvTldHb05iVXFhc0xveWRLM25jd0w4dXFwc1hFbWZkNm9IcUR2bytSMWt1ZUNyTGx4SjRKL1pSL0ZDeGpCeVFkSWhuN0RJazJDeHBqaFFac0hlZzcwajlwb1R2dHNlazl1dldSUGQ5RzBLTDk5c25YRG5wR2ZpUlI4RFM'
  },
  {
    id: 108,
    name: 'HomePod',
    imageUrl:
      'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-13-homepod-nav-202301?wid=400&hei=260&fmt=png-alpha&.v=WVcvamRucHVMMWs5SXZ3bVJ3Q2hpZGR0czFXNWdCUW14eTN2U29pLzNMcld1aTN5QlRYNG5PRjJxc2d1RklXbVM0TjRWdzF2UjRGVEY0c3dBQVZ6VFJmbWU0TjJLamxsdTltNkZVZ1RhbDA'
  }
]

const STORE_SERIES_PRODUCTS: Record<string, Product[]> = {
  iPhone: [
    {
      id: 1,
      title: 'iPhone 15 Pro Max',
      name: 'iPhone 15 Pro Max',
      price: 9999,
      originalPrice: 10999,
      description: '钛金属设计，A17 Pro 芯片，专业级相机系统',
      rating: 5,
      reviewCount: 2543,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-50-compare-202509?wid=960&hei=1000&fmt=p-jpg&qlt=95&.v=STRSSU4ybmVMUHJmaEdDQXNBcjFuWE1yMUpwVHBiWWVTR0JjOGRhZzE1Mmo2Z1ptREdBenZRTjZuSCtBemFnUTRHeXB5TnVsU3R6Qjd0Y2JzbURyWE9wL2Z4WmY3WVd4M1JEaVVQcEVQMVYrYWpGdS9XeFgvbS9ITnNYOEhYaG4'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-50-compare-202509?wid=960&hei=1000&fmt=p-jpg&qlt=95&.v=STRSSU4ybmVMUHJmaEdDQXNBcjFuWE1yMUpwVHBiWWVTR0JjOGRhZzE1Mmo2Z1ptREdBenZRTjZuSCtBemFnUTRHeXB5TnVsU3R6Qjd0Y2JzbURyWE9wL2Z4WmY3WVd4M1JEaVVQcEVQMVYrYWpGdS9XeFgvbS9ITnNYOEhYaG4',
      brand: 'Apple',
      isNew: true,
      isSale: true,
      code: 'APPLE-IPHONE-15PM',
      sales: 2543,
      stock: 120,
      memory: '512GB'
    },
    {
      id: 2,
      title: 'iPhone 15 Pro',
      name: 'iPhone 15 Pro',
      price: 8999,
      originalPrice: 9999,
      description: '6.1 英寸显示屏，钛金属设计',
      rating: 5,
      reviewCount: 1876,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17pro-202509?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25jaUtlSkZ1cHdCU1J4ZWZjamdoYzhpRkMxQXc4S3pBZE5lUDJlTzVYSUYydFMwV0hhcmdVdXZzZ1NwTlFUaEgwTDc0akx0V0lSSVRoL2tPb3ZabW5DM0k'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17pro-202509?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25jaUtlSkZ1cHdCU1J4ZWZjamdoYzhpRkMxQXc4S3pBZE5lUDJlTzVYSUYydFMwV0hhcmdVdXZzZ1NwTlFUaEgwTDc0akx0V0lSSVRoL2tPb3ZabW5DM0k',
      brand: 'Apple',
      code: 'APPLE-IPHONE-15P',
      sales: 1876,
      stock: 160,
      memory: '256GB'
    },
    {
      id: 3,
      title: 'iPhone 15',
      name: 'iPhone 15',
      price: 5999,
      originalPrice: 6999,
      description: '全新的相机系统，A16 仿生芯片',
      rating: 4.5,
      reviewCount: 1234,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17-202509?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25jaVVYemprcUVJOVFFWHE5dFpoU3I4STgycjlDNGdlREhyeERCVjM1SXkycjBvTHRTQjdCWE9PcW9rdVY3NVlSRE83OVV5YWxuQ1ltOTRFL2xza1R6dzQ'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-card-40-17-202509?wid=680&hei=528&fmt=p-jpg&qlt=95&.v=WVVFRzUzVk1oblJhbW9PbGNSU25jaVVYemprcUVJOVFFWHE5dFpoU3I4STgycjlDNGdlREhyeERCVjM1SXkycjBvTHRTQjdCWE9PcW9rdVY3NVlSRE83OVV5YWxuQ1ltOTRFL2xza1R6dzQ',
      brand: 'Apple',
      code: 'APPLE-IPHONE-15',
      sales: 1234,
      stock: 200,
      memory: '128GB'
    },
    {
      id: 4,
      title: 'iPhone 14 Pro',
      name: 'iPhone 14 Pro',
      price: 6999,
      originalPrice: 7999,
      description: '动态岛，ProMotion 技术',
      rating: 4.5,
      reviewCount: 987,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPhone14Pro__GHORTS_1?wid=400&hei=400&fmt=png-alpha&.v=1664009459000'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPhone14Pro__GHORTS_1?wid=400&hei=400&fmt=png-alpha&.v=1664009459000',
      brand: 'Apple',
      code: 'APPLE-IPHONE-14P',
      sales: 987,
      stock: 88,
      memory: '256GB'
    },
    {
      id: 5,
      title: 'iPhone SE',
      name: 'iPhone SE',
      price: 2999,
      originalPrice: 3999,
      description: '强大的 A15 仿生芯片',
      rating: 4,
      reviewCount: 654,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPhoneSE_PDP_Carousel__GHOLR_1_202304?wid=400&hei=400&fmt=png-alpha&.v=1679072899373'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPhoneSE_PDP_Carousel__GHOLR_1_202304?wid=400&hei=400&fmt=png-alpha&.v=1679072899373',
      brand: 'Apple',
      code: 'APPLE-IPHONE-SE',
      sales: 654,
      stock: 300,
      memory: '128GB'
    }
  ],
  iPad: [
    {
      id: 11,
      title: 'iPad Pro 12.9 英寸',
      name: 'iPad Pro 12.9 英寸',
      price: 9999,
      originalPrice: 10999,
      description: 'M2 芯片，Liquid Retina XDR 显示屏，ProMotion 技术',
      rating: 5,
      reviewCount: 876,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Pro-Wi-Fi-Space-Black-202210?wid=400&hei=400&fmt=png-alpha&.v=1665081969766'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Pro-Wi-Fi-Space-Black-202210?wid=400&hei=400&fmt=png-alpha&.v=1665081969766',
      brand: 'Apple',
      isNew: true,
      code: 'APPLE-IPAD-PRO-129',
      sales: 876,
      stock: 90,
      memory: '512GB'
    },
    {
      id: 12,
      title: 'iPad Pro 11 英寸',
      name: 'iPad Pro 11 英寸',
      price: 7999,
      originalPrice: 8999,
      description: 'M2 芯片，11 英寸 Liquid Retina 显示屏',
      rating: 5,
      reviewCount: 654,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Pro-Wi-Fi-Space-Black-11-202210?wid=400&hei=400&fmt=png-alpha&.v=1665081969766'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Pro-Wi-Fi-Space-Black-11-202210?wid=400&hei=400&fmt=png-alpha&.v=1665081969766',
      brand: 'Apple',
      code: 'APPLE-IPAD-PRO-11',
      sales: 654,
      stock: 100,
      memory: '256GB'
    },
    {
      id: 13,
      title: 'iPad Air',
      name: 'iPad Air',
      price: 5999,
      originalPrice: 6999,
      description: 'M1 芯片，10.9 英寸液晶视网膜显示屏',
      rating: 4.5,
      reviewCount: 543,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Air-Wi-Fi-Space-Gray-202303?wid=400&hei=400&fmt=png-alpha&.v=1678886290491'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-Air-Wi-Fi-Space-Gray-202303?wid=400&hei=400&fmt=png-alpha&.v=1678886290491',
      brand: 'Apple',
      code: 'APPLE-IPAD-AIR',
      sales: 543,
      stock: 130,
      memory: '256GB'
    },
    {
      id: 14,
      title: 'iPad',
      name: 'iPad',
      price: 2999,
      originalPrice: 3999,
      description: 'A14 仿生芯片，10.9 英寸液晶视网膜显示屏',
      rating: 4,
      reviewCount: 432,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-10th-Wi-Fi-Blue-2022?wid=400&hei=400&fmt=png-alpha&.v=1662144574000'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-10th-Wi-Fi-Blue-2022?wid=400&hei=400&fmt=png-alpha&.v=1662144574000',
      brand: 'Apple',
      code: 'APPLE-IPAD-10TH',
      sales: 432,
      stock: 180,
      memory: '128GB'
    },
    {
      id: 15,
      title: 'iPad mini',
      name: 'iPad mini',
      price: 3999,
      originalPrice: 4999,
      description: 'A17 Pro 芯片，8.3 英寸显示屏，轻薄便携',
      rating: 4.5,
      reviewCount: 321,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-mini-Wi-Fi-Purple-202210?wid=400&hei=400&fmt=png-alpha&.v=1664883283000'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iPad-mini-Wi-Fi-Purple-202210?wid=400&hei=400&fmt=png-alpha&.v=1664883283000',
      brand: 'Apple',
      code: 'APPLE-IPAD-MINI',
      sales: 321,
      stock: 170,
      memory: '128GB'
    }
  ],
  AirPods: [
    {
      id: 21,
      title: 'AirPods Pro（第 2 代）',
      name: 'AirPods Pro（第 2 代）',
      price: 1899,
      originalPrice: 1999,
      description: '主动降噪，空间音频，MagSafe 充电',
      rating: 5,
      reviewCount: 1234,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQDA3?wid=400&hei=400&fmt=png-alpha&.v=1694009204397'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQDA3?wid=400&hei=400&fmt=png-alpha&.v=1694009204397',
      brand: 'Apple',
      isNew: true,
      isSale: true,
      code: 'APPLE-AIRPODS-PRO2',
      sales: 1234,
      stock: 260
    },
    {
      id: 22,
      title: 'AirPods（第 3 代）',
      name: 'AirPods（第 3 代）',
      price: 1099,
      originalPrice: 1299,
      description: '空间音频，个性化音频体验',
      rating: 4.5,
      reviewCount: 876,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MME73?wid=400&hei=400&fmt=png-alpha&.v=1694448600000'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MME73?wid=400&hei=400&fmt=png-alpha&.v=1694448600000',
      brand: 'Apple',
      code: 'APPLE-AIRPODS-3',
      sales: 876,
      stock: 280
    },
    {
      id: 23,
      title: 'AirPods Max',
      name: 'AirPods Max',
      price: 3999,
      originalPrice: 4399,
      description: '空间音频，自适应音频，天文台级音效',
      rating: 5,
      reviewCount: 654,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-max-select-silver-202310?wid=400&hei=400&fmt=png-alpha&.v=1697224198155'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-max-select-silver-202310?wid=400&hei=400&fmt=png-alpha&.v=1697224198155',
      brand: 'Apple',
      code: 'APPLE-AIRPODS-MAX',
      sales: 654,
      stock: 140
    },
    {
      id: 24,
      title: 'AirPods Pro（第 1 代）',
      name: 'AirPods Pro（第 1 代）',
      price: 899,
      originalPrice: 1299,
      description: '主动降噪，防汗防水',
      rating: 4,
      reviewCount: 432,
      images: [
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MWP22?wid=400&hei=400&fmt=png-alpha&.v=1659639098000'
      ],
      main_image:
        'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MWP22?wid=400&hei=400&fmt=png-alpha&.v=1659639098000',
      brand: 'Apple',
      code: 'APPLE-AIRPODS-PRO1',
      sales: 432,
      stock: 220
    }
  ]
}

const PRODUCT_DETAIL_LIST: Product[] = [
  {
    id: 1,
    title: 'OPPO Reno15 星光蝴蝶结 12GB+512GB 官方标配',
    price: 3199,
    originalPrice: 3299,
    rating: 4.8,
    reviewCount: 3399,
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'OPPO',
    memory: '512GB',
    description:
      '6.32英寸AMOLED精致小直屏，全息光刻工艺，裸眼3D蝴蝶结完美绽放。搭载天玑8450旗舰芯片，四主摄超清影像系统，6200mAh大电池，80W超级闪充，IP69满级防水。',
    screenSize: '6.32"',
    screenType: 'AMOLED',
    battery: '6200mAh',
    protectionClass: 'IP69',
    promotions: [
      '6期免息 | 每天仅需17.77元，支持花呗',
      '积分10倍膨胀',
      '购物送积分',
      '【以旧换新】至高补贴 1000 元'
    ],
    highlights: [
      { text: '2亿像素后置摄像头' },
      { text: '6200mAh电池容量' },
      { text: '80W超级闪充' },
      { text: 'IP69满级防水' }
    ],
    memoryOptions: ['256GB', '512GB', '1TB'],
    versionOptions: ['官方标配', '套装版'],
    colorOptions: [
      { name: '星光蝴蝶结', hex: '#C0C0C0' },
      { name: '极光蓝', hex: '#1E90FF' },
      { name: '可露丽棕', hex: '#8B6914' }
    ],
    guarantees: [
      { name: '7天价保', description: '7天内降价可补差价' },
      { name: '官方正品', description: '100%原厂正品' },
      { name: '全国联保', description: '全国联保服务' },
      { name: '官方发货&售后', description: '全国联保与官方售后支持' }
    ],
    services: [
      {
        id: 'screen_protection_1',
        name: '屏碎保·一年',
        price: 159,
        originalPrice: 199,
        discount: '限时8折'
      },
      { id: 'screen_protection_2', name: '屏碎保·两年', price: 239, originalPrice: 299 },
      { id: 'extend_warranty', name: 'OPPO延长保·一年', price: 159 },
      { id: 'exchange_180days', name: '180天只换不修', price: 129 }
    ]
  },
  {
    id: 2,
    title: 'OPPO Reno15 Pro 星光蝴蝶结 12GB+256GB',
    price: 3599,
    originalPrice: 3699,
    rating: 4.7,
    reviewCount: 2100,
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'OPPO',
    memory: '256GB',
    description: 'OPPO Reno15 Pro 5G旗舰机型',
    screenSize: '6.8"',
    screenType: 'AMOLED',
    battery: '6200mAh',
    protectionClass: 'IP69',
    promotions: ['6期免息', '积分5倍膨胀'],
    highlights: [{ text: '5000万潜望长焦' }, { text: '120Hz高刷屏' }, { text: '80W快充' }],
    memoryOptions: ['256GB', '512GB'],
    colorOptions: [
      { name: '星光蝴蝶结', hex: '#C0C0C0' },
      { name: '极光蓝', hex: '#1E90FF' }
    ]
  },
  {
    id: 3,
    title: 'OPPO Reno14 人鱼姬 12GB+256GB',
    price: 2599,
    originalPrice: 2699,
    rating: 4.6,
    reviewCount: 1856,
    images: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'OPPO',
    memory: '256GB',
    description: '轻薄旗舰，设计精致',
    screenSize: '6.3"',
    screenType: 'AMOLED',
    battery: '5900mAh',
    protectionClass: 'IP68',
    promotions: ['6期免息', '积分5倍膨胀'],
    highlights: [{ text: '4800万主摄' }, { text: '120Hz屏幕' }, { text: '67W快充' }]
  },
  {
    id: 4,
    title: 'OPPO Find X9 Pro',
    price: 4999,
    originalPrice: 5199,
    rating: 4.9,
    reviewCount: 4256,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'OPPO',
    memory: '512GB',
    description: '顶级旗舰工艺',
    screenSize: '6.8"',
    screenType: 'AMOLED',
    battery: '6500mAh',
    protectionClass: 'IP69'
  }
]

export const getMockStoreCategories = () => STORE_CATEGORIES

export const getSeriesProductsByCategoryId = (categoryId: number) => {
  const category = STORE_CATEGORIES.find((item) => item.id === categoryId)
  if (!category) return []
  return STORE_SERIES_PRODUCTS[category.name] || []
}

export const getMockStoreSeries = () => {
  return STORE_CATEGORIES.map((category) => {
    const products = STORE_SERIES_PRODUCTS[category.name] || []
    return {
      categoryId: category.id,
      category: category.name,
      featured: products[0] || null,
      otherProducts: products.slice(1)
    }
  }).filter((item) => item.featured)
}

export const getMockProductList = (): Product[] => PRODUCT_DETAIL_LIST

export const getMockProductById = (id: number): Product | null => {
  return PRODUCT_DETAIL_LIST.find((item) => item.id === id) || null
}
