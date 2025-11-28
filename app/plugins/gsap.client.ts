// plugins/gsap.client.ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

export default defineNuxtPlugin(() => {
  // 注册 GSAP 插件
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

  // 性能优化配置
  gsap.config({
    force3D: true,
    nullTargetWarn: false
  })

  // ScrollTrigger 性能优化
  ScrollTrigger.config({
    limitCallbacks: true,
    syncInterval: 40,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
  })

  // 全局性能监控（开发环境）
  if (import.meta.dev) {
    let frameCount = 0
    let lastTime = performance.now()

    const countFrames = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        if (fps < 50) {
          console.warn(`⚠️ GSAP 动画 FPS 较低: ${fps}`)
        }
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(countFrames)
    }

    requestAnimationFrame(countFrames)
  }

  return {
    provide: {
      gsap,
      ScrollTrigger,
      ScrollToPlugin
    }
  }
})
