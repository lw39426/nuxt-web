export default defineEventHandler(async () => {
  return {
    code: 200,
    message: 'success',
    data: {
      hero: {
        backgroundImage: '/futuristic-moon-background.jpg',
        title: '李晚晚是傻子 <br /> 哈哈哈哈哈',
        subtitle:
          'Meet the next generation of documentation. AI-native, beautiful out-of-the-box, and built for collaboration.'
      }
    }
  }
})
