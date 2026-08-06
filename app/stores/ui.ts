import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Auth Modal State
  const authModalOpen = ref(false)
  const authModalView = ref<'login' | 'register'>('login')

  // Auth Modal Actions
  const openAuthModal = (view: 'login' | 'register' = 'login') => {
    authModalView.value = view
    authModalOpen.value = true
  }

  const closeAuthModal = () => {
    authModalOpen.value = false
  }

  return {
    // Auth Modal
    authModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal
  }
})
