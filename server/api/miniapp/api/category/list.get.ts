export default defineEventHandler(async () => {
  /**
   * 获取分类列表（Mock）
   */
  const data = [
    {
      id: 1,
      name: '数码电子',
      children: [
        { id: 11, name: '手机' },
        { id: 12, name: '电脑' },
        { id: 13, name: '智能穿戴' }
      ]
    },
    {
      id: 2,
      name: '家居生活',
      children: [
        { id: 21, name: '收纳' },
        { id: 22, name: '清洁' }
      ]
    },
    {
      id: 3,
      name: '美妆个护',
      children: [
        { id: 31, name: '护肤' },
        { id: 32, name: '彩妆' }
      ]
    },
    {
      id: 4,
      name: '运动户外',
      children: [
        { id: 41, name: '跑步' },
        { id: 42, name: '骑行' }
      ]
    }
  ]

  return { code: 200, message: 'success', data, timestamp: new Date().toISOString() }
})
