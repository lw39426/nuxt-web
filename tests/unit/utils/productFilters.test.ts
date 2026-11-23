import { describe, expect, it } from 'vitest'
import type { Product, ProductBrand, ProductSeriesGroup } from '~/types/product'
import {
  applyProductFilters,
  buildActiveFilterTags,
  buildProductFilterGroups,
  countActiveFilters,
  countSeriesProducts,
  createEmptyProductFilters
} from '~/utils/productFilters'

const brandA: ProductBrand = { code: 'BRAND-A', name: '品牌甲', logo: '' }
const brandB: ProductBrand = { code: 'BRAND-B', name: '品牌乙', logo: '' }

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

    expect(groups[0]?.options).toEqual([
      { value: '主角', label: '主角' },
      { value: '反派', label: '反派' }
    ])
    expect(groups[1]?.options).toEqual([
      { value: '90年代', label: '90年代' },
      { value: '00年代', label: '00年代' },
      { value: '20年代', label: '20年代' }
    ])
    expect(groups[2]?.options).toEqual([{ value: '热血', label: '热血' }])
  })

  it('品牌候选项只来自显式真实品牌列表，不从商品或作品分类推导', () => {
    const products = [
      product({ brand: { ...brandA, name: '商品旧名' }, category_name: '作品分类' }),
      product({ id: 2, brand: { code: 'PRODUCT-ONLY', name: '商品内品牌', logo: '' } })
    ]

    expect(buildProductFilterGroups(products).find((group) => group.key === 'brand')).toEqual({
      key: 'brand',
      label: '品牌',
      options: []
    })
    expect(
      buildProductFilterGroups(products, [brandB, brandA]).find((group) => group.key === 'brand')
    ).toEqual({
      key: 'brand',
      label: '品牌',
      options: [
        { value: 'BRAND-B', label: '品牌乙' },
        { value: 'BRAND-A', label: '品牌甲' }
      ]
    })
  })

  it('空筛选时原样返回系列数据', () => {
    const input = [series([product({ id: 1 })])]
    expect(applyProductFilters(input, createEmptyProductFilters())).toBe(input)
  })

  it('多品牌按 OR、与类型年代标签按 AND 过滤，并隐藏空系列', () => {
    const filters = createEmptyProductFilters()
    filters.brand = [brandA.code, brandB.code]
    filters.character_type = ['主角']
    filters.era = ['90年代']
    filters.tag = ['热血']
    const matching = {
      character_type: '主角',
      era: '90年代',
      tags: [{ id: 1, name: '热血', color: '', weight: 1 }]
    }
    const otherBrand = { ...brandA, code: 'BRAND-C' }

    const result = applyProductFilters(
      [
        series([
          product({ ...matching, id: 1, brand: brandA }),
          product({ ...matching, id: 2, brand: brandB }),
          product({ ...matching, id: 3, brand: otherBrand }),
          product({ ...matching, id: 4, brand: brandA, character_type: '反派' }),
          product({ ...matching, id: 5, brand: brandA, era: '00年代' }),
          product({ ...matching, id: 6, brand: brandB, tags: [] })
        ]),
        series([product({ ...matching, id: 7, brand: otherBrand })], 2)
      ],
      filters
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.products.map((item) => item.id)).toEqual([1, 2])
  })

  it('品牌只匹配 code 而非名称，排除 null 品牌与空 code', () => {
    const filters = createEmptyProductFilters()
    const input = [
      series([
        product({ id: 1, brand: { ...brandA, name: '品牌新名称' } }),
        product({ id: 2, brand: { ...brandB, name: brandA.code } }),
        product({ id: 3, brand: null }),
        product({ id: 4, brand: { ...brandA, code: '', name: brandA.code } })
      ])
    ]

    filters.brand = [brandA.code]
    expect(applyProductFilters(input, filters)[0]?.products.map((item) => item.id)).toEqual([1])

    filters.brand = ['品牌新名称']
    expect(applyProductFilters(input, filters)).toEqual([])
  })

  it('统计包含品牌的已选数量，展示已选名称并保留未知品牌 code', () => {
    const filters = createEmptyProductFilters()
    filters.character_type = ['主角']
    filters.era = ['90年代']
    filters.tag = ['热血', '侦探']
    filters.brand = [brandA.code, 'UNKNOWN']

    expect(countActiveFilters(filters)).toBe(6)
    expect(buildActiveFilterTags(filters, [brandA, brandB])).toEqual([
      { key: 'character_type', label: '类型', value: '主角', displayValue: '主角' },
      { key: 'era', label: '年代', value: '90年代', displayValue: '90年代' },
      { key: 'tag', label: '标签', value: '热血', displayValue: '热血' },
      { key: 'tag', label: '标签', value: '侦探', displayValue: '侦探' },
      { key: 'brand', label: '品牌', value: 'BRAND-A', displayValue: '品牌甲' },
      { key: 'brand', label: '品牌', value: 'UNKNOWN', displayValue: 'UNKNOWN' }
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
