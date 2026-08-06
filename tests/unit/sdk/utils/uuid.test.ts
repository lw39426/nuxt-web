// tests/unit/sdk/utils.uuid.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { uuidV4 } from '@sdk/tracker/utils/uuid'

describe('uuidV4', () => {
  // RFC4122 v4 正则：8-4-4-4-12 的十六进制，第 3 段以 4 开头，第 4 段以 8/9/a/b 开头
  const V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

  it('生成符合 RFC4122 v4 格式的 UUID', () => {
    expect(uuidV4()).toMatch(V4_REGEX)
  })

  it('每次调用返回不同值', () => {
    const set = new Set(Array.from({ length: 100 }, () => uuidV4()))
    expect(set.size).toBe(100)
  })

  describe('crypto.randomUUID 不可用时的 fallback 路径', () => {
    let originalRandomUUID: Crypto['randomUUID']
    let originalGetRandomValues: Crypto['getRandomValues']

    beforeEach(() => {
      const crypto = globalThis.crypto
      originalRandomUUID = crypto.randomUUID
      originalGetRandomValues = crypto.getRandomValues
      // @ts-expect-error 故意删除走 fallback
      delete crypto.randomUUID
    })

    afterEach(() => {
      globalThis.crypto.randomUUID = originalRandomUUID
      globalThis.crypto.getRandomValues = originalGetRandomValues
    })

    it('没有 crypto.getRandomValues 时也能生成格式正确的 v4 UUID', () => {
      // @ts-expect-error 故意删除走 Math.random 分支
      delete globalThis.crypto.getRandomValues
      // 防止 Math.random 返回固定值导致断言不稳，这里只校验格式
      expect(uuidV4()).toMatch(V4_REGEX)
    })

    it('有 crypto.getRandomValues 但没有 randomUUID 时仍能生成 v4 UUID', () => {
      expect(uuidV4()).toMatch(V4_REGEX)
    })
  })
})
