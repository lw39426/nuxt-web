import { onBeforeUnmount, onMounted, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aboutScrollMedia } from '~/constants/about'

/**
 * 「人物三个切面」滚动动效。
 * 桌面和有足够高度的手机固定场景翻阅牌叠，矮屏淡入，减少动效时静态阅读。
 */
export function useStoryScroll(root: Readonly<Ref<HTMLElement | null>>) {
  let media: ReturnType<typeof gsap.matchMedia> | undefined

  /** 按视口与动效偏好创建动画，断点切换时由上下文恢复原始布局。 */
  const setup = () => {
    media?.revert()
    if (!root.value) return
    gsap.registerPlugin(ScrollTrigger)
    media = gsap.matchMedia()
    media.add(
      aboutScrollMedia,
      (context) => {
        if (!context.conditions?.motion || !root.value) return
        const scope = root.value
        const select = gsap.utils.selector(scope)
        const cards = Array.from(select('.story-card')) as HTMLElement[]
        const stage = select('.story-stage')[0] as HTMLElement | undefined
        if (!stage || cards.length === 0) return
        const { compact, desktop } = context.conditions
        const stacked = desktop || compact

        if (stacked) {
          const contents = select('.story-card-content')
          // 专属字幕挂点按标题、主句各行、说明排序，避免被父级 .quote 动画选中。
          const copies = cards.map((card) =>
            Array.from(card.querySelectorAll<HTMLElement>('.story-subtitle'))
          )
          // 三个切面分别左倾、右倾、居中抬起，百分比位移随卡片宽度自适应。
          const displays = [
            { xPercent: -3, y: 0, rotation: -2.4, scale: 0.99 },
            { xPercent: 2.6, y: 8, rotation: 2, scale: 0.99 },
            { xPercent: 0, y: -8, rotation: -0.6, scale: 1 }
          ]
          const layers = [
            displays[0]!,
            { xPercent: 2.4, y: 22, rotation: 3.2, scale: 0.965 },
            { xPercent: -1.8, y: 38, rotation: -3.4, scale: 0.94 }
          ]

          // Grid 保留自然等高，背卡始终可见；仅隐藏背层正文而非整张卡。
          gsap.set(stage, { attr: { 'data-layout': 'stacked' } })
          cards.forEach((card, index) => {
            gsap.set(card, {
              ...layers[index],
              gridArea: '1 / 1',
              width: '100%',
              transformOrigin: '50% 50%',
              zIndex: cards.length - index,
              pointerEvents: index === 0 ? 'auto' : 'none'
            })
          })
          // 首张保持可读，后续字幕从下方 40px 上移。
          gsap.set(contents[0]!, { autoAlpha: 1 })
          gsap.set(contents.slice(1), { autoAlpha: 0 })
          gsap.set(copies[0]!, { opacity: 1, y: 0 })
          gsap.set(copies.slice(1).flat(), { opacity: 0, y: 40 })
          gsap.set(select('.story-progress'), { display: 'block' })

          const film = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: scope,
              start: () => {
                if (!compact) return 'top 80px'
                // 用可读区域的剩余空间平衡上下留白，矮手机仍从导航下方开始。
                const extraSpace = window.innerHeight - 60 - 78 - scope.offsetHeight
                const inset = Math.max(0, Math.min(extraSpace / 2, 84))
                return `top ${60 + inset}px`
              },
              end: () => `+=${window.innerHeight * (compact ? 1.12 : 2)}`,
              pin: true,
              scrub: 0.45,
              invalidateOnRefresh: true
            }
          })

          /** 字幕逐行上移渐显，卡面重合后落向各自站位；反向滚动沿原路径还原。 */
          const addCardTurn = (card: HTMLElement, index: number) => {
            const previous = cards[index]!
            const remaining = cards[(index + 2) % cards.length]!
            const position = index * 1.32 + 0.6
            const handoff = position + 0.22
            const lifted = {
              xPercent: index === 0 ? -0.5 : 0.8,
              y: -12,
              rotation: index === 0 ? -0.6 : 0.8,
              scale: 0.99
            }

            film
              .to([previous, card], { ...lifted, duration: 0.22, ease: 'power1.inOut' }, position)
              // 旧字幕反向错峰上移渐隐，交接时保留字迹，避免空白停顿。
              .to(
                copies[index]!,
                {
                  opacity: 0,
                  y: -20,
                  duration: 0.36,
                  stagger: { each: 0.03, from: 'end' },
                  ease: 'power1.in'
                },
                position - 0.04
              )
              .to(contents[index]!, { opacity: 0.65, duration: 0.22, ease: 'power1.in' }, position)
              // 两张卡轮廓重合时交接，保留标签和署名作为持续可见的阅读锚点。
              .set(previous, { zIndex: 1, pointerEvents: 'none' }, handoff)
              .set(card, { zIndex: 3, pointerEvents: 'auto' }, handoff)
              .set(remaining, { zIndex: 2 }, handoff)
              .set(contents[index]!, { autoAlpha: 0 }, handoff)
              .set(contents[index + 1]!, { autoAlpha: 0.65 }, handoff)
              .to(contents[index + 1]!, { opacity: 1, duration: 0.22, ease: 'power1.out' }, handoff)
              // 参考电影字幕的上移与错峰节奏，提前在隐藏背层准备首行，后续各行依次展开。
              .to(
                copies[index + 1]!,
                { opacity: 1, y: 0, duration: 0.56, stagger: 0.12, ease: 'power2.out' },
                handoff - 0.2
              )
              .to(previous, { ...layers[2], duration: 0.5, ease: 'power2.inOut' }, handoff)
              .to(remaining, { ...layers[1], duration: 0.5, ease: 'power2.inOut' }, handoff)
              .to(card, { ...displays[index + 1], duration: 0.5, ease: 'power2.out' }, handoff)
          }
          cards.slice(1).forEach(addCardTurn)
          film.to(cards[cards.length - 1]!, { scale: 1, duration: 0.6 })
          film.to(
            select('.story-progress span'),
            { scaleX: 1, duration: film.duration(), ease: 'none' },
            0
          )
        } else {
          // 矮屏在文档流中轻量淡入，保留所有正文。
          cards.forEach((card) => {
            gsap.from(card, {
              y: 24,
              opacity: 0.45,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 70%', scrub: 0.35 }
            })
          })
        }
        ScrollTrigger.refresh()

        if (stacked) {
          // 全局关闭了 resize 自动刷新，此处仅为固定场景补齐尺寸更新。
          const refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause()

          /** 合并连续缩放，重新计算固定宽度和滚动距离。 */
          const handleResize = () => {
            refresh.restart(true)
          }
          window.addEventListener('resize', handleResize)

          return () => {
            window.removeEventListener('resize', handleResize)
            refresh.kill()
          }
        }
      },
      root.value
    )

    // 字体替换可能改变文字换行，重新计算固定区域的占位高度。
    void document.fonts.ready.then(() => {
      if (root.value) ScrollTrigger.refresh()
    })
  }

  onMounted(setup)
  onBeforeUnmount(() => media?.revert())
}
