import { describe, expect, it } from 'vitest'
import type { Product, ProductSeriesGroup } from '~/types/product'
import {
  applyProductFilters,
  buildActiveFilterTags,
  buildProductFilterGroups,
  countActiveFilters,
  countSeriesProducts,
  createEmptyProductFilters
} from '~/utils/productFilters'

function product(overrides: Partial<Product>): Product {
  return {
    id: 1,
    code: 'CHAR-1',
    name: '角色',
    description: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    category_id: 1,
    status: 1,
    main_image: '',
    images: [],
    detail_html: '',
    sales: 0,
    sort: 0,
    brand: { code: '', name: '', logo: '' },
    category_name: '',
    tags: [],
    create_time: '',
    update_time: '',
    ...overrides
  }
}

function series(products: Product[], categoryId = 1): ProductSeriesGroup {
  return {
    categoryId,
    category: `分类-${categoryId}`,
    categoryImage: '',
    products,
    total: products.length
  }
}

describe('productFilters', () => {
  it('按固定顺序聚合年代并去重筛选候选项', () => {
    const groups = buildProductFilterGroups([
      product({
        id: 1,
        era: '20年代',
        character_type: '主角',
        tags: [{ id: 1, name: '热血', color: '', weight: 1 }]
      }),
      product({ id: 2, era: '90年代', character_type: '主角' }),
      product({ id: 3, era: '00年代', character_type: '反派' })
    ])

    expect(groups[0]?.options).toEqual(['主角', '反派'])
    expect(groups[1]?.options).toEqual(['90年代', '00年代', '20年代'])
    expect(groups[2]?.options).toEqual(['热血'])
  })

  it('空筛选时原样返回系列数据', () => {
    const input = [series([product({ id: 1 })])]
    expect(applyProductFilters(input, createEmptyProductFilters())).toBe(input)
  })

  it('不同筛选维度按 AND、同一维度内按 OR 过滤，并隐藏空系列', () => {
    const filters = createEmptyProductFilters()
    filters.character_type = ['主角']
    filters.tag = ['热血']

    const result = applyProductFilters(
      [
        series([
          product({ id: 1, character_type: '主角', tags: [] }),
          product({
            id: 2,
            character_type: '主角',
            tags: [{ id: 1, name: '热血', color: '', weight: 1 }]
          }),
          product({
            id: 3,
            character_type: '反派',
            tags: [{ id: 1, name: '热血', color: '', weight: 1 }]
          })
        ]),
        series([product({ id: 4, character_type: '配角' })], 2)
      ],
      filters
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.products.map((item) => item.id)).toEqual([2])
  })

  it('统计已选筛选数量与已选标签', () => {
    const filters = createEmptyProductFilters()
    filters.character_type = ['主角']
    filters.era = ['90年代']
    filters.tag = ['热血', '侦探']

    expect(countActiveFilters(filters)).toBe(4)
    expect(buildActiveFilterTags(filters)).toEqual([
      { key: 'character_type', label: '类型', value: '主角' },
      { key: 'era', label: '年代', value: '90年代' },
      { key: 'tag', label: '标签', value: '热血' },
      { key: 'tag', label: '标签', value: '侦探' }
    ])
  })

  it('统计系列内角色数量', () => {
    expect(
      countSeriesProducts([
        series([product({ id: 1 }), product({ id: 2 })]),
        series([product({ id: 3 })], 2)
      ])
    ).toBe(3)
  })
})
