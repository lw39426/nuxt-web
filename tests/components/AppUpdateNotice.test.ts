// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppUpdateNotice from '~/components/AppUpdateNotice.vue'

const hooks = vi.hoisted(() => ({
  callback: () => {},
  remove: vi.fn()
}))
vi.mock('#imports', () => ({
  useNuxtApp: () => ({
    hook: (name: string, callback: () => void) => {
      expect(name).toBe('app:manifest:update')
      hooks.callback = callback
      return hooks.remove
    }
  })
}))

it('更新事件显示一次常驻提示，仅用户点击时刷新，卸载清理订阅', async () => {
  const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => {})
  const wrapper = mount(AppUpdateNotice, {
    global: { stubs: { UButton: { template: '<button><slot /></button>' } } }
  })
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
  hooks.callback()
  hooks.callback()
  await nextTick()
  expect(wrapper.findAll('[role="status"]')).toHaveLength(1)
  expect(wrapper.text()).toContain('新版本已发布')
  expect(reload).not.toHaveBeenCalled()
  await wrapper.get('button').trigger('click')
  expect(reload).toHaveBeenCalledOnce()
  wrapper.unmount()
  expect(hooks.remove).toHaveBeenCalledOnce()
  reload.mockRestore()
})
