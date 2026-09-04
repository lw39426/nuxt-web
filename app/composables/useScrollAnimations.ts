import type { Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export interface AnimationRefs {
  heroScene: Ref<HTMLElement | null>
  heroContent: Ref<HTMLElement | null>
  heroVisual: Ref<HTMLElement | null>
  chapterLabel: Ref<HTMLElement | null>
  titleLine1: Ref<HTMLElement | null>
  titleLine2: Ref<HTMLElement | null>
  heroSub: Ref<HTMLElement | null>
  scrollIndicator: Ref<HTMLElement | null>
  avatarCore: Ref<HTMLElement | null>
  transitionScene: Ref<HTMLElement | null>
  barTop: Ref<HTMLElement | null>
  barBottom: Ref<HTMLElement | null>
  aboutScene: Ref<HTMLElement | null>
  aboutLeft: Ref<HTMLElement | null>
  aboutRight: Ref<HTMLElement | null>
  statRow: Ref<HTMLElement | null>
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
      buildAboutAnimations(refs)
      buildStatCounter(refs)
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

function buildHeroTimeline(refs: AnimationRefs) {
  const { chapterLabel, titleLine1, titleLine2, heroSub, scrollIndicator, avatarCore } = refs
  if (!chapterLabel.value) return

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.from(chapterLabel.value, { y: 30, opacity: 0, duration: 1 })
    .from(titleLine1.value!, { y: 80, opacity: 0, duration: 1.2 }, '-=0.6')
    .from(titleLine2.value!, { y: 80, opacity: 0, duration: 1.2 }, '-=1')
    .from(heroSub.value!, { y: 20, opacity: 0, duration: 1 }, '-=0.8')
    .from(scrollIndicator.value!, { opacity: 0, duration: 1 }, '-=0.5')
    .from(
      '.orbit-ring',
      { scale: 0, opacity: 0, stagger: 0.15, duration: 1.5, ease: 'back.out(1.2)' },
      '-=1.5'
    )
    .from(avatarCore.value!, { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.5)' }, '-=1')
}

function buildParallaxEffects(refs: AnimationRefs) {
  const { heroScene, heroContent, heroVisual } = refs
  if (!heroScene.value) return

  gsap.to(heroContent.value!, {
    y: -100,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
  })

  gsap.to(heroVisual.value!, {
    y: -50,
    rotate: 15,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: heroScene.value, start: 'top top', end: 'bottom top', scrub: true }
  })
}

function buildTransitionTimeline(refs: AnimationRefs) {
  const { transitionScene, barTop, barBottom } = refs
  if (!transitionScene.value) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: transitionScene.value,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1
    }
  })

  tl.from(barTop.value!, { y: '-70%', duration: 1 })
    .from(barBottom.value!, { y: '100%', duration: 1 }, '<')
    .from('.quote', { y: 40, opacity: 0, stagger: 0.3, duration: 0.8 }, '<')
}

function buildAboutAnimations(refs: AnimationRefs) {
  const { aboutScene, aboutLeft, aboutRight } = refs
  if (!aboutScene.value) return

  gsap.from(aboutLeft.value!, {
    x: -50,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: aboutScene.value, start: 'top 60%' }
  })

  gsap.from(aboutRight.value!, {
    x: 50,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: { trigger: aboutScene.value, start: 'top 60%' }
  })

  gsap.from('.skill-tag', {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: 'back.out(1.5)',
    scrollTrigger: { trigger: aboutScene.value, start: 'top 50%' }
  })
}

function buildStatCounter(refs: AnimationRefs) {
  const { statRow } = refs
  if (!statRow.value) return

  ScrollTrigger.create({
    trigger: statRow.value,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      document.querySelectorAll<HTMLSpanElement>('.stat-num').forEach((el) => {
        const target = { val: 0 }
        gsap.to(target, {
          val: +el.dataset.count!,
          duration: 2.5,
          ease: 'expo.out',
          onUpdate() {
            el.textContent = Math.round(target.val).toString()
          }
        })
      })
    }
  })
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
