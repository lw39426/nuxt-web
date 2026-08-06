import type {
  Address,
  AppNotification,
  FavoriteArticle,
  FavoriteProduct,
  HistoryEntry,
  LoginRecord,
  MyComment,
  Order,
  UserProfile
} from '~~/shared/types/account'

export const mockProfile: UserProfile = {
  id: 'u_10086',
  name: '林清和',
  username: 'qinghe',
  email: 'qinghe@example.com',
  phone: '138****6621',
  avatar: '/avatar.webp',
  bio: '产品设计师，关注效率工具与生活美学。偶尔写点东西。',
  gender: 'female',
  birthday: '1996-04-18',
  location: '浙江 杭州',
  website: 'https://qinghe.design',
  memberLevel: '黄金会员',
  memberPoints: 12480,
  joinedAt: '2021-03-12'
}

export const mockFavoriteProducts: FavoriteProduct[] = [
  {
    id: 'p_1',
    title: 'Aurora 主动降噪头戴式耳机',
    brand: 'Aurora',
    image: '/products/headphones.webp',
    price: 1299,
    originalPrice: 1599,
    inStock: true,
    priceDropped: true,
    category: '数码',
    favoritedAt: '2026-07-20T09:12:00Z'
  },
  {
    id: 'p_2',
    title: 'Keystone 68 客制化机械键盘',
    brand: 'Keystone',
    image: '/products/keyboard.webp',
    price: 749,
    inStock: true,
    priceDropped: false,
    category: '数码',
    favoritedAt: '2026-07-18T14:30:00Z'
  },
  {
    id: 'p_3',
    title: '恒温保冷不锈钢水壶 750ml',
    brand: 'Nordvik',
    image: '/products/bottle.webp',
    price: 189,
    originalPrice: 229,
    inStock: true,
    priceDropped: true,
    category: '生活',
    favoritedAt: '2026-07-15T08:05:00Z'
  },
  {
    id: 'p_4',
    title: 'Lumen 护眼智能桌面台灯',
    brand: 'Lumen',
    image: '/products/lamp.webp',
    price: 459,
    inStock: false,
    priceDropped: false,
    category: '家居',
    favoritedAt: '2026-07-09T21:44:00Z'
  },
  {
    id: 'p_5',
    title: '轻量通勤双肩背包 22L',
    brand: 'Carrywell',
    image: '/products/backpack.webp',
    price: 529,
    inStock: true,
    priceDropped: false,
    category: '配件',
    favoritedAt: '2026-06-28T11:20:00Z'
  },
  {
    id: 'p_6',
    title: '手冲咖啡套装（含玻璃分享壶）',
    brand: 'Brewly',
    image: '/products/coffee-maker.webp',
    price: 368,
    originalPrice: 428,
    inStock: true,
    priceDropped: true,
    category: '生活',
    favoritedAt: '2026-06-22T16:00:00Z'
  }
]

export const mockFavoriteArticles: FavoriteArticle[] = [
  {
    id: 'a_1',
    title: '如何搭建一个真正让人愿意坐下来的工作台',
    excerpt:
      '桌面不是收纳比赛。从动线、光线到线材管理，聊聊我三年里踩过的坑和最后留下来的那几件东西。',
    cover: '/articles/workspace.webp',
    author: '陈叙',
    readMinutes: 8,
    tag: '生活方式',
    publishedAt: '2026-07-11T00:00:00Z',
    favoritedAt: '2026-07-19T10:02:00Z'
  },
  {
    id: 'a_2',
    title: '前端性能优化：先测量，再动手',
    excerpt: '大多数优化都做在了错误的地方。这篇文章讲怎么用真实指标定位瓶颈，而不是凭感觉重构。',
    cover: '/articles/coding.webp',
    author: 'Miles Zhou',
    readMinutes: 12,
    tag: '技术',
    publishedAt: '2026-07-05T00:00:00Z',
    favoritedAt: '2026-07-16T22:41:00Z'
  },
  {
    id: 'a_3',
    title: '在家做出一杯稳定的手冲咖啡',
    excerpt: '水温、粉水比、研磨度——把变量一个个固定下来，你就能每天复现同一杯味道。',
    cover: '/articles/coffee.webp',
    author: '苏晚',
    readMinutes: 6,
    tag: '饮食',
    publishedAt: '2026-06-30T00:00:00Z',
    favoritedAt: '2026-07-02T07:18:00Z'
  },
  {
    id: 'a_4',
    title: '设计系统里最容易被忽略的一件事：留白',
    excerpt: '间距不是装饰，而是信息层级的语言。一套间距标尺能让整个产品的观感立刻统一。',
    cover: '/articles/design.webp',
    author: '林清和',
    readMinutes: 10,
    tag: '设计',
    publishedAt: '2026-06-21T00:00:00Z',
    favoritedAt: '2026-06-25T13:55:00Z'
  }
]

export const mockOrders: Order[] = [
  {
    id: 'o_1',
    orderNo: '20260722399481',
    status: 'shipped',
    total: 1299,
    createdAt: '2026-07-22T10:31:00Z',
    shop: 'Aurora 官方旗舰店',
    items: [
      {
        title: 'Aurora 主动降噪头戴式耳机',
        image: '/products/headphones.webp',
        price: 1299,
        quantity: 1,
        spec: '午夜黑'
      }
    ]
  },
  {
    id: 'o_2',
    orderNo: '20260714288102',
    status: 'pending',
    total: 918,
    createdAt: '2026-07-14T19:02:00Z',
    shop: 'Keystone 数码专营',
    items: [
      {
        title: 'Keystone 68 客制化机械键盘',
        image: '/products/keyboard.webp',
        price: 749,
        quantity: 1,
        spec: '奶白 / 茶轴'
      },
      {
        title: '恒温保冷不锈钢水壶 750ml',
        image: '/products/bottle.webp',
        price: 169,
        quantity: 1,
        spec: '森林绿'
      }
    ]
  },
  {
    id: 'o_3',
    orderNo: '20260628177355',
    status: 'completed',
    total: 368,
    createdAt: '2026-06-28T09:47:00Z',
    shop: 'Brewly 生活馆',
    items: [
      {
        title: '手冲咖啡套装（含玻璃分享壶）',
        image: '/products/coffee-maker.webp',
        price: 368,
        quantity: 1,
        spec: '标准套装'
      }
    ]
  },
  {
    id: 'o_4',
    orderNo: '20260610091274',
    status: 'refunding',
    total: 459,
    createdAt: '2026-06-10T15:25:00Z',
    shop: 'Lumen 照明官方店',
    items: [
      {
        title: 'Lumen 护眼智能桌面台灯',
        image: '/products/lamp.webp',
        price: 459,
        quantity: 1,
        spec: '银色'
      }
    ]
  },
  {
    id: 'o_5',
    orderNo: '20260519044618',
    status: 'cancelled',
    total: 529,
    createdAt: '2026-05-19T08:12:00Z',
    shop: 'Carrywell 户外',
    items: [
      {
        title: '轻量通勤双肩背包 22L',
        image: '/products/backpack.webp',
        price: 529,
        quantity: 1,
        spec: '炭灰'
      }
    ]
  }
]

export const mockHistory: HistoryEntry[] = [
  {
    id: 'h_1',
    type: 'product',
    title: 'Aurora 主动降噪头戴式耳机',
    image: '/products/headphones.webp',
    meta: '¥1,299 · Aurora',
    viewedAt: '2026-07-26T08:41:00Z'
  },
  {
    id: 'h_2',
    type: 'article',
    title: '前端性能优化：先测量，再动手',
    image: '/articles/coding.webp',
    meta: 'Miles Zhou · 12 分钟阅读',
    viewedAt: '2026-07-26T07:55:00Z'
  },
  {
    id: 'h_3',
    type: 'product',
    title: 'Lumen 护眼智能桌面台灯',
    image: '/products/lamp.webp',
    meta: '¥459 · Lumen',
    viewedAt: '2026-07-25T21:30:00Z'
  },
  {
    id: 'h_4',
    type: 'article',
    title: '设计系统里最容易被忽略的一件事：留白',
    image: '/articles/design.webp',
    meta: '林清和 · 10 分钟阅读',
    viewedAt: '2026-07-25T14:12:00Z'
  },
  {
    id: 'h_5',
    type: 'product',
    title: '手冲咖啡套装（含玻璃分享壶）',
    image: '/products/coffee-maker.webp',
    meta: '¥368 · Brewly',
    viewedAt: '2026-07-24T19:08:00Z'
  },
  {
    id: 'h_6',
    type: 'article',
    title: '在家做出一杯稳定的手冲咖啡',
    image: '/articles/coffee.webp',
    meta: '苏晚 · 6 分钟阅读',
    viewedAt: '2026-07-23T10:26:00Z'
  },
  {
    id: 'h_7',
    type: 'product',
    title: 'Keystone 68 客制化机械键盘',
    image: '/products/keyboard.webp',
    meta: '¥749 · Keystone',
    viewedAt: '2026-07-21T16:47:00Z'
  }
]

export const mockNotifications: AppNotification[] = [
  {
    id: 'n_1',
    type: 'order',
    title: '订单已发货',
    content: '订单 20260722399481 已由顺丰速运揽收，预计 7 月 28 日送达。',
    read: false,
    createdAt: '2026-07-25T09:30:00Z'
  },
  {
    id: 'n_2',
    type: 'interaction',
    title: '苏晚 回复了你的评论',
    content: '“水温建议控制在 92 度左右，浅焙豆可以再高一点。”',
    read: false,
    createdAt: '2026-07-24T20:14:00Z'
  },
  {
    id: 'n_3',
    type: 'promotion',
    title: '你收藏的商品降价了',
    content: '「Aurora 主动降噪头戴式耳机」降价 ¥300，现价 ¥1,299。',
    read: false,
    createdAt: '2026-07-20T09:12:00Z'
  },
  {
    id: 'n_4',
    type: 'system',
    title: '登录安全提醒',
    content: '你的账号于 7 月 18 日在新设备（macOS · Chrome）登录，若非本人操作请及时修改密码。',
    read: true,
    createdAt: '2026-07-18T11:02:00Z'
  },
  {
    id: 'n_5',
    type: 'order',
    title: '退款申请已受理',
    content: '订单 20260610091274 的退款申请已提交，预计 3 个工作日内处理完成。',
    read: true,
    createdAt: '2026-07-12T15:40:00Z'
  },
  {
    id: 'n_6',
    type: 'system',
    title: '会员等级提升',
    content: '恭喜你升级为黄金会员，可享受全站包邮与专属客服。',
    read: true,
    createdAt: '2026-06-30T00:00:00Z'
  }
]

export const mockComments: MyComment[] = [
  {
    id: 'c_1',
    targetType: 'product',
    targetTitle: '手冲咖啡套装（含玻璃分享壶）',
    targetImage: '/products/coffee-maker.webp',
    content: '分享壶的做工比预期好，注水口收得很干净。滤杯稍微偏小，一次做两杯有点勉强。',
    rating: 4,
    likes: 32,
    replies: 5,
    createdAt: '2026-07-08T13:20:00Z'
  },
  {
    id: 'c_2',
    targetType: 'article',
    targetTitle: '前端性能优化：先测量，再动手',
    targetImage: '/articles/coding.webp',
    content: '「先测量」这点太重要了。我们团队之前花两周重构了一个根本不在关键路径上的组件。',
    likes: 118,
    replies: 12,
    createdAt: '2026-07-06T09:05:00Z'
  },
  {
    id: 'c_3',
    targetType: 'product',
    targetTitle: 'Keystone 68 客制化机械键盘',
    targetImage: '/products/keyboard.webp',
    content: '茶轴手感很稳，键帽的透光排版也整齐。就是默认没有背光调节键，需要自己改配置。',
    rating: 5,
    likes: 47,
    replies: 3,
    createdAt: '2026-06-19T18:52:00Z'
  },
  {
    id: 'c_4',
    targetType: 'article',
    targetTitle: '如何搭建一个真正让人愿意坐下来的工作台',
    targetImage: '/articles/workspace.webp',
    content: '关于线材管理那段深有同感，桌下走线槽是我去年最值的一笔投入。',
    likes: 64,
    replies: 8,
    createdAt: '2026-06-14T11:33:00Z'
  }
]

export const mockAddresses: Address[] = [
  {
    id: 'ad_1',
    receiver: '林清和',
    phone: '138 0013 6621',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    detail: '文三路 100 号 创意园 B 座 1802',
    zipCode: '310012',
    tag: '公司',
    isDefault: true
  },
  {
    id: 'ad_2',
    receiver: '林清和',
    phone: '138 0013 6621',
    province: '浙江省',
    city: '杭州市',
    district: '拱墅区',
    detail: '莫干山路 288 弄 5 幢 302 室',
    zipCode: '310011',
    tag: '家',
    isDefault: false
  },
  {
    id: 'ad_3',
    receiver: '林母',
    phone: '139 0057 1188',
    province: '江苏省',
    city: '苏州市',
    district: '姑苏区',
    detail: '平江路 66 号 3 单元 101',
    zipCode: '215001',
    tag: '其他',
    isDefault: false
  }
]

export const mockLoginRecords: LoginRecord[] = [
  {
    id: 'l_1',
    device: 'MacBook Pro',
    browser: 'Chrome 141',
    location: '浙江 杭州',
    ip: '116.62.**.**',
    current: true,
    loginAt: '2026-07-26T08:30:00Z'
  },
  {
    id: 'l_2',
    device: 'iPhone 17',
    browser: 'Safari',
    location: '浙江 杭州',
    ip: '183.129.**.**',
    current: false,
    loginAt: '2026-07-25T20:11:00Z'
  },
  {
    id: 'l_3',
    device: 'iPad Air',
    browser: 'Safari',
    location: '江苏 苏州',
    ip: '49.85.**.**',
    current: false,
    loginAt: '2026-07-18T10:58:00Z'
  }
]
