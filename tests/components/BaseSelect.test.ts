// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseSelect from '~/components/BaseSelect.vue'

vi.mock('@popperjs/core', () => ({
  createPopper: vi.fn(() => ({ destroy: vi.fn(), update: vi.fn() }))
}))

const genderOptions = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

// happy-dom 下 stub 掉 Teleport/Transition：
// 面板内联渲染在 wrapper 内，避免 Teleport + Transition 的 DOM 时序问题，保证断言确定性
function mountSelect(props: Record<string, unknown> = {}, modelValue: unknown = null) {
  return mount(BaseSelect, {
    props: { modelValue, options: genderOptions, ...props },
    global: { stubs: { Teleport: true, Transition: true } }
  })
}

async function openPanel(wrapper: VueWrapper) {
  await wrapper.find('button').trigger('click')
  // 面板需先挂载外层壳（isOpen），nextTick 定位后再展示内容（isShown），故 flush 两次
  await nextTick()
  await nextTick()
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('BaseSelect', () => {
  it('未选择时显示 placeholder', () => {
    const wrapper = mountSelect({ placeholder: '请选择性别' })
    expect(wrapper.find('button').text()).toContain('请选择性别')
  })

  it('modelValue 命中选项时显示对应 label', () => {
    const wrapper = mountSelect({}, 1)
    expect(wrapper.find('button').text()).toContain('男')
  })

  it('支持 string[] 简写选项', () => {
    const wrapper = mountSelect({ options: ['a', 'b', 'c'] }, 'b')
    expect(wrapper.find('button').text()).toContain('b')
  })

  it('点击触发展开面板并渲染全部选项', async () => {
    const wrapper = mountSelect()
    await openPanel(wrapper)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="option"]').length).toBe(3)
  })

  it('选择选项后 emit update:modelValue 并关闭面板', async () => {
    const wrapper = mountSelect()
    await openPanel(wrapper)
    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([1])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.find('button').text()).toContain('男')
  })

  it('禁用的选项不可被选择', async () => {
    const wrapper = mountSelect({
      options: [
        { label: '可用', value: 0 },
        { label: '禁用', value: 1, disabled: true }
      ]
    })
    await openPanel(wrapper)
    await wrapper.findAll('[role="option"]')[1].trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
  })

  it('disabled prop 时点击不会展开面板', async () => {
    const wrapper = mountSelect({ disabled: true })
    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('键盘方向键导航并回车选中', async () => {
    const wrapper = mountSelect()
    const trigger = wrapper.find('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([0])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('Escape 关闭面板', async () => {
    const wrapper = mountSelect()
    await openPanel(wrapper)
    await wrapper.find('button').trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })
})
