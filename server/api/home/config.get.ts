export default defineEventHandler(async () => {
  return {
    code: 200,
    message: 'success',
    data: {
      hero: {
        backgroundImage: '/futuristic-moon-background.webp',
        title: 'This website can be anything! <br /> It depends on what you want it to become.',
        subtitle:
          'It is wonderful, and at the same time it is also terrible. Please be more tolerant, thank you very much.'
      }
    }
  }
})
