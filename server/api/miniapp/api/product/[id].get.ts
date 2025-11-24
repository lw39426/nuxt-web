export default defineEventHandler(async (event) => {
  /**
   * 商品详情（Mock）
   */
  const id = Number(event.context.params?.id)
  const map: Record<number, any> = {
    101: {
      id: 101,
      name: 'iPhone 15',
      price: 6999,
      cover: '/images/placeholder.svg',
      description: 'Apple 最新款智能手机，性能强劲。'
    },
    102: {
      id: 102,
      name: 'MacBook Air',
      price: 8999,
      cover: '/images/placeholder.svg',
      description: '轻薄便携的笔记本电脑，适合办公与创作。'
    },
    103: {
      id: 103,
      name: '扫地机器人',
      price: 1599,
      cover: '/images/placeholder.svg',
      description: '智能清洁，解放双手。'
    },
    104: {
      id: 104,
      name: '跑步鞋',
      price: 499,
      cover: '/images/placeholder.svg',
      description: '舒适轻盈，跑步必备。'
    },
    105: {
      id: 105,
      name: '骑行头盔',
      price: 299,
      cover: '/images/placeholder.svg',
      description: '安全骑行，保护头部。'
    },
    106: {
      id: 106,
      name: '智能手表',
      price: 1299,
      cover: '/images/placeholder.svg',
      description: '健康监测，消息提醒。'
    }
  }
  const data = map[id] || {
    id,
    name: '未知商品',
    price: 0,
    cover: '/images/placeholder.svg',
    description: '暂无描述'
  }
  return { code: 200, message: 'success', data, timestamp: new Date().toISOString() }
})
