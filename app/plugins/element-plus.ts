import ElementPlus from 'element-plus'
import * as Icons from '@element-plus/icons-vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 注册 Element Plus 主插件
  nuxtApp.vueApp.use(ElementPlus)

  // 注册全部图标组件（按需可后续优化）
  Object.entries(Icons).forEach(([name, component]) => {
    nuxtApp.vueApp.component(name, component as any)
  })
})
