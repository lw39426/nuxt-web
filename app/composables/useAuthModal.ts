// 我们使用外部定义的变量或直接引入 ref 管理状态。在 middleware 中调用 useState 时，
// 因为 `abortNavigation` 打断了渲染流程，Nuxt 可能会抛出上下文丢失或 IPC 连接关闭的问题。
// 所以在插件或中间件中，如果不依赖 SSR 补水，可以使用普通响应式对象。

import { ref } from 'vue'

const isModalOpen = ref(false)
const modalView = ref<'login' | 'register'>('login')

export const useAuthModal = () => {
  const openLogin = () => {
    modalView.value = 'login'
    isModalOpen.value = true
  }

  const openRegister = () => {
    modalView.value = 'register'
    isModalOpen.value = true
  }

  const close = () => {
    isModalOpen.value = false
  }

  return {
    isOpen: isModalOpen,
    currentView: modalView,
    openLogin,
    openRegister,
    close
  }
}
