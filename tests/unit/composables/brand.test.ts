import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBrandApi } from '~/composables/api/brand'
import type { ProductBrand } from '~/types/product'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({ get })
}))

/** 构造指定条数且 code 唯一的品牌分页测试数据。 */
function brandList(count: number, prefix = 'BRAND'): ProductBrand[] {
  return Array.from({ length: count }, (_, index) => ({
    code: `${prefix}-${index + 1}`,
    name: `品牌${index + 1}`,
    logo: ''
  }))
}

describe('useBrandApi', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it.each([0, 49])('首个短页有 %i 条记录时结束，包括空列表', async (count) => {
    const list = brandList(count)
    get.mockResolvedValueOnce({ list, pagination: null })

    await expect(useBrandApi().getEnabledBrands()).resolves.toEqual(list)
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(
      '/brand/list',
      { status: 1, page: 1, pageSize: 50 },
      { suppressErrorToast: true }
    )
  })

  it.each([0, 1])('连续满页后加载 %i 条的末页，不依赖 total/pages', async (lastCount) => {
    const first = brandList(50, 'FIRST')
    const second = brandList(50, 'SECOND')
    const last = brandList(lastCount, 'LAST')
    get
      .mockResolvedValueOnce({ list: first, pagination: { page: 1, pageSize: 50 } })
      .mockResolvedValueOnce({ list: second, pagination: null })
      .mockResolvedValueOnce({ list: last })

    await expect(useBrandApi().getEnabledBrands()).resolves.toEqual([...first, ...second, ...last])
    expect(get.mock.calls).toEqual(
      [1, 2, 3].map((page) => [
        '/brand/list',
        { status: 1, page, pageSize: 50 },
        { suppressErrorToast: true }
      ])
    )
  })

  it('按 code 去重并跳过无效 code，仍按原始 50 条记录继续分页', async () => {
    const original = { code: 'A', name: '同名品牌', logo: 'old.png' }
    const updated = { ...original, logo: 'new.png' }
    const other = { code: 'B', name: '同名品牌', logo: '' }
    const first = [
      ...Array.from({ length: 44 }, () => original),
      null,
      {},
      { code: 1 },
      { code: null },
      { code: '' },
      { code: ' \t ' }
    ]
    get
      .mockResolvedValueOnce({ list: first })
      .mockResolvedValueOnce({ list: [updated, other, { code: 'C', name: ' ', logo: null }] })

    await expect(useBrandApi().getEnabledBrands()).resolves.toEqual([
      updated,
      other,
      { code: 'C', name: 'C', logo: '' }
    ])
    expect(get).toHaveBeenCalledTimes(2)
  })

  it.each([1, 2])('第 %i 页请求失败时整体拒绝，不返回部分品牌', async (failedPage) => {
    const error = new Error('品牌加载失败')
    if (failedPage === 2) get.mockResolvedValueOnce({ list: brandList(50) })
    get.mockRejectedValueOnce(error)

    await expect(useBrandApi().getEnabledBrands()).rejects.toBe(error)
    expect(get).toHaveBeenCalledTimes(failedPage)
  })

  it.each([
    { label: '响应为空', response: null },
    { label: '响应缺失', response: undefined },
    { label: '缺少 list', response: {} },
    { label: 'list 为 null', response: { list: null } },
    { label: 'list 不是数组', response: { list: {} } },
    { label: '响应未解包', response: { code: 200, data: { list: [] } } }
  ])('后续页$label时整体拒绝，不返回已有品牌', async ({ response }) => {
    get.mockResolvedValueOnce({ list: brandList(50) }).mockResolvedValueOnce(response)

    await expect(useBrandApi().getEnabledBrands()).rejects.toThrow('品牌列表响应格式错误')
    expect(get).toHaveBeenCalledTimes(2)
  })
})
