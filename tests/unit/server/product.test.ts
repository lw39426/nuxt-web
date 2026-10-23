import { describe, expect, it } from 'vitest'
import { normalizeProduct, normalizeProductBrand } from '../../../server/utils/product'

describe('normalizeProductBrand', () => {
  it('将字符串品牌归一化为对象', () => {
    expect(normalizeProductBrand('名侦探柯南')).toEqual({
      code: '',
      name: '名侦探柯南',
      logo: ''
    })
  })

  it('保留对象品牌并补齐缺失字段', () => {
    expect(normalizeProductBrand({ code: 'conan', name: '名侦探柯南' })).toEqual({
      code: 'conan',
      name: '名侦探柯南',
      logo: ''
    })
  })

  it('空值返回 null', () => {
    expect(normalizeProductBrand(null)).toBeNull()
    expect(normalizeProductBrand('')).toBeNull()
    expect(normalizeProductBrand({ code: 'empty' })).toBeNull()
  })
})

describe('normalizeProduct', () => {
  it('兼容旧接口的字符串品牌、蛇形价格与 id', () => {
    const product = normalizeProduct({
      id: 25,
      code: 'prd_25',
      name: '测试商品',
      price: 7999,
      sale_price: 6999,
      brand: '测试品牌',
      favorite_count: 0
    })

    expect(product.id).toBe(25)
    expect(product.brand).toEqual({ code: '', name: '测试品牌', logo: '' })
    expect(product.salePrice).toBe(6999)
    expect(product.favorite_count).toBe(0)
  })

  it('新契约缺少 id 与 favorite_count 时不生成字段', () => {
    const product = normalizeProduct({
      code: 'prd_26',
      name: '测试商品',
      price: 7999,
      salePrice: 6999,
      brand: null
    })

    expect(product).not.toHaveProperty('id')
    expect(product).not.toHaveProperty('favorite_count')
    expect(product.brand).toBeNull()
    expect(product.price).toBe(7999)
    expect(product.salePrice).toBe(6999)
  })

  it('Mock 数据使用 reviewCount 时回填 favorite_count', () => {
    const product = normalizeProduct({ code: 'CHAR-1', reviewCount: 12 })
    expect(product.favorite_count).toBe(12)
  })
})
