import type { Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aboutScrollMedia } from '~/constants/about'

export interface AnimationRefs {
  heroScene: Ref<HTMLElement | null>
  heroContent: Ref<HTMLElement | null>
  heroVisual: Ref<HTMLElement | null>
  chapterLabel: Ref<HTMLElement | null>
  titleLine1: Ref<HTMLElement | null>
  titleLine2: Ref<HTMLElement | null>
  heroSub: Ref<HTMLElement | null>
  scrollIndicator: Ref<HTMLElement | null>
  heroCharacter: Ref<HTMLElement | null>
  transitionScene: Ref<HTMLElement | null>
  barTop: Ref<HTMLElement | null>
  barBottom: Ref<HTMLElement | null>
  timelineScene: Ref<HTMLElement | null>
  timelineHeader: Ref<HTMLElement | null>
  timelineTrack: Ref<HTMLElement | null>
  timelineLine: Ref<HTMLElement | null>
  timelineEvents: Ref<(HTMLElement | null)[]>
  worksScene: Ref<HTMLElement | null>
  worksHeader: Ref<HTMLElement | null>
  worksGrid: Ref<HTMLElement | null>
  workCards: Ref<(HTMLElement | null)[]>
  contactScene: Ref<HTMLElement | null>
  contactTitle: Ref<HTMLElement | null>
  contactSub: Ref<HTMLElement | null>
}

export function useScrollAnimations() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
  }

  let ctx: gsap.Context

  function init(scopeEl: HTMLElement, refs: AnimationRefs) {
    ctx = gsap.context(() => {
      buildHeroTimeline(refs)
      buildParallaxEffects(refs)
      buildTransitionTimeline(refs)
      buildTimelineAnimations(refs)
      buildWorksAnimations(refs)
      buildContactAnimations(refs)
    }, scopeEl)
  }

  function revert() {
    if (ctx) ctx.revert()
  }

  return { init, revert }
}

/** 将小猫入场与鼠标转向分层，减少动态时直接呈现完整首屏。 */
function buildHeroTimeline(refs: AnimationRefs) {
  const { chapterLabel, titleLine1, titleLine2, heroSub, scrollIndicator, heroCharacter } = refs
  if (!chapterLabel.value) return

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    tl.from(chapterLabel.value, { y: 30, opacity: 0, duration: 1 })
      .from(titleLine1.value!, { y: 80, opacity: 0, duration: 1.2 }, '-=0.6')
      .from(titleLine2.value!, { y: 80, opacity: 0, duration: 1.2 }, '-=1')
      .from(heroSub.value!, { y: 20, opacity: 0, duration: 1 }, '-=0.8')
      .from(scrollIndicator.value!, { opacity: 0, duration: 1 }, '-=0.5')
      .from(
        heroCharacter.value!,
        { y: 24, scale: 0.92, opacity: 0, duration: 1.2, ease: 'power2.out' },
        0.5
      )
  })
}

/** 首屏视差仅移动外层，在偏好切换时自动撤销，不干扰角色切帧。 */
function buildParallaxEffects(refs: AnimationRefs) {
  const { heroScene, heroContent, heroVisual } = refs
  if (!heroScene.value) return

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(heroContent.value!, {
      y: -100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
    })

    gsap.to(heroVisual.value!, {
      y: -50,
      rotate: 8,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
    })
  })
}

/** 在有足够阅读空间的视口固定字幕，矮屏与减少动效保持完整文档流。 */
function buildTransitionTimeline(refs: AnimationRefs) {
  const { transitionScene, barTop, barBottom } = refs
  const scene = transitionScene.value
  if (!scene) return

  const chapters = Array.from(scene.querySelectorAll<HTMLElement>('.transition-chapter'))
  if (!chapters.length) return

  // 在父级 GSAP context 内创建，卸载时会连同动画、布局属性与监听一起恢复。
  const media = gsap.matchMedia()
  media.add(
    aboutScrollMedia,
    /** 按视口选择固定字幕或轻量入场，并在断点切换时恢复原始阅读布局。 */
    (context) => {
      if (!context.conditions?.motion) return

      const subtitles = chapters.map((chapter) =>
        Array.from(chapter.querySelectorAll<HTMLElement>('.transition-subtitle'))
      )

      const { compact, desktop } = context.conditions
      if (desktop || compact) {
        const text = scene.querySelector('.transition-text')
        gsap.set(scene, { attr: { 'data-layout': 'cinema' } })
        gsap.set(chapters, { autoAlpha: 0 })
        gsap.set(subtitles.flat(), { y: 40, opacity: 0 })
        gsap.set(chapters[0]!, { autoAlpha: 1 })
        gsap.set(subtitles[0]!, { y: 0, opacity: 1 })
        gsap.set(text, { y: 32, opacity: 0 })
        // 遮幅先入场，首章在字幕进入视口时渐显，固定前达到完整可读状态。
        gsap
          .timeline({
            defaults: { duration: 1, ease: 'sine.inOut' },
            scrollTrigger: {
              trigger: scene,
              start: 'top 72%',
              end: 'top 24%',
              scrub: 0.25
            }
          })
          .from(barTop.value!, { yPercent: -100 }, 0)
          .from(barBottom.value!, { yPercent: 100 }, 0)
          .to(text, { y: 0, opacity: 1, duration: 0.7 }, 0.3)

        const film = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: scene,
            start: 'top top',
            end: () => `+=${window.innerHeight * chapters.length * (compact ? 0.82 : 1.08)}`,
            pin: true,
            scrub: 0.65,
            // 子组件先挂载，优先计算上游固定占位，再刷新 Story 等后续触发器。
            refreshPriority: 1,
            invalidateOnRefresh: true
          }
        })

        const enterDuration = 0.7
        const stagger = 0.12
        const readDuration = 1.65
        let position = 0

        chapters.forEach(
          /** 每章逐行入场、完整停留、错峰退场，反向滚动沿同一时间轴还原。 */
          (chapter, index) => {
            const lines = subtitles[index]!
            let readStart = position

            // 首章随容器完成入场，固定后直接进入阅读停顿。
            if (index > 0) {
              film
                .set(chapter, { autoAlpha: 1 }, position)
                .to(
                  lines,
                  { y: 0, opacity: 1, duration: enterDuration, stagger, ease: 'sine.inOut' },
                  position
                )
              readStart += enterDuration + (lines.length - 1) * stagger
            }
            const readEnd = readStart + readDuration

            if (index < chapters.length - 1) {
              const exitDuration = 0.55
              const exitStagger = 0.05
              const exitEnd = readEnd + exitDuration + (lines.length - 1) * exitStagger

              film
                .to(
                  lines,
                  {
                    y: -28,
                    opacity: 0,
                    duration: exitDuration,
                    stagger: { each: exitStagger, from: 'end' },
                    ease: 'sine.inOut'
                  },
                  readEnd
                )
                .set(chapter, { autoAlpha: 0 }, exitEnd)

              position = exitEnd
            } else {
              // 最后一章保留在画面中，阅读停顿结束后自然衔接人物介绍。
              film.set(chapter, { autoAlpha: 1 }, readEnd)
            }
          }
        )

        film.fromTo(
          scene.querySelector('.transition-progress span'),
          { scaleX: 0 },
          { scaleX: 1, duration: film.duration(), ease: 'none' },
          0
        )
      } else {
        chapters.forEach(
          /** 矮屏保留完整文档流，字幕轻量上移渐显。 */
          (chapter, index) => {
            gsap.from(subtitles[index]!, {
              y: 24,
              opacity: 0.35,
              duration: 0.7,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: { trigger: chapter, start: 'top 90%', once: true }
            })
          }
        )
      }

      const refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause()

      /** 合并缩放事件，补齐全局未启用的 resize 刷新与移动端换行变化。 */
      const handleResize = () => {
        refresh.restart(true)
      }
      window.addEventListener('resize', handleResize)
      refresh.restart(true)

      let active = true
      // 字体加载改变字幕换行时，重新计算自然等高舞台和后续模块的位置。
      void document.fonts.ready.then(() => {
        if (active) refresh.restart(true)
      })

      /** 离开动效上下文时移除监听，避免卸载后或断点切换后触发刷新。 */
      return () => {
        active = false
        window.removeEventListener('resize', handleResize)
        refresh.kill()
      }
    },
    scene
  )
}

function buildTimelineAnimations(refs: AnimationRefs) {
  const { timelineScene, timelineHeader, timelineTrack, timelineLine, timelineEvents } = refs
  if (!timelineScene.value) return

  gsap.from(timelineHeader.value!, {
    y: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: timelineScene.value, start: 'top 70%' }
  })

  gsap.from(timelineLine.value!, {
    scaleY: 0,
    transformOrigin: 'top center',
    duration: 1.5,
    ease: 'expo.inOut',
    scrollTrigger: {
      trigger: timelineTrack.value!,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1
    }
  })

  timelineEvents.value?.forEach((el, i) => {
    if (!el) return
    gsap.from(el, {
      x: i % 2 === 0 ? -50 : 50,
      opacity: 0,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 80%' }
    })
  })
}

function buildWorksAnimations(refs: AnimationRefs) {
  const { worksScene, worksHeader, worksGrid, workCards } = refs
  if (!worksScene.value) return

  gsap.from(worksHeader.value!, {
    y: 40,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: worksScene.value, start: 'top 70%' }
  })

  workCards.value?.forEach((el, i) => {
    if (!el) return
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1,
      delay: i * 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: worksGrid.value!, start: 'top 65%' }
    })
  })
}

function buildContactAnimations(refs: AnimationRefs) {
  const { contactScene, contactTitle, contactSub } = refs
  if (!contactScene.value) return

  gsap.from(contactTitle.value!, {
    y: 60,
    opacity: 0,
    duration: 1,
    scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
  })

  gsap.from(contactSub.value!, {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.2,
    scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
  })

  gsap.from('.contact-btn', {
    y: 20,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    delay: 0.4,
    scrollTrigger: { trigger: contactScene.value, start: 'top 65%' }
  })
}
