// @vitest-environment happy-dom
// tests/components/ArticleCard.test.ts
// 代表组件测试：用 @vue/test-utils 的 mount + stub 子组件（el-card/el-button），
// 只测本组件自身的渲染与交互逻辑，不测 Element Plus 子组件内部。
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ArticleCard from '~/components/ArticleCard.vue'

// ArticleCard 内部把 navigateTo 当 Nuxt 自动导入使用（裸全局）。
// happy-dom 中裸全局解析到 globalThis，用 vi.stubGlobal 注入 mock。
const navigateTo = vi.fn()

describe('ArticleCard', () => {
  beforeEach(() => {
    vi.stubGlobal('navigateTo', navigateTo)
    navigateTo.mockReset()
  })

  it('渲染标题与摘要', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: { id: 1, title: '测试标题', summary: '一段摘要' } },
      global: {
        stubs: {
          'el-card': { template: '<div class="el-card"><slot /></div>' },
          'el-button': { template: '<button class="el-button"><slot /></button>' }
        }
      }
    })
    expect(wrapper.text()).toContain('测试标题')
    expect(wrapper.text()).toContain('一段摘要')
  })

  it('点击"阅读详情"按钮跳转到文章详情页', async () => {
    const wrapper = mount(ArticleCard, {
      props: { article: { id: 42, title: 'T' } },
      global: {
        stubs: {
          'el-card': { template: '<div><slot /></div>' },
          'el-button': { template: '<button><slot /></button>' }
        }
      }
    })
    await wrapper.find('button').trigger('click')
    expect(navigateTo).toHaveBeenCalledWith('/articles/42')
  })
})
