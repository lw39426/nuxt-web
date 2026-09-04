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

  // 全局性能监控（开发环境，仅桌面，且需显式开启）
  // 注意：该监控是常驻 requestAnimationFrame 递归，每帧都会执行并读取 performance.now()，
  // 本身即构成滚动时的主线程开销。默认关闭，需要排查掉帧时在控制台执行
  // localStorage.setItem('debug:fps', '1') 后刷新即可启用。
  if (
    import.meta.dev &&
    !window.matchMedia('(max-width: 768px)').matches &&
    localStorage.getItem('debug:fps') === '1'
  ) {
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
