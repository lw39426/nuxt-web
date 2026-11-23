import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatParticipant, ChatRoom } from '~/types/chat'
import {
  CHAT_MISSING,
  formatChatDate,
  formatChatLastSeen,
  formatChatListTime,
  formatChatTime,
  getChatIdentity,
  getChatMemberCount,
  getChatParticipants,
  getChatPeer,
  getChatPresence,
  getChatRole,
  getChatText,
  getChatTitle,
  hasChatIdentity,
  isSameChatParticipant
} from '~/utils/chat'

describe('聊天文本与身份', () => {
  it('非法文本类型不调用 trim，空值只返回展示占位', () => {
    const values: unknown[] = [undefined, null, '', '  ', 0, false, {}, [], Symbol('text')]
    for (const value of values) {
      expect(getChatText(value)).toBe(CHAT_MISSING)
    }
    expect(getChatText('  后端姓名  ')).toBe('后端姓名')
  })

  it('只接受完整正安全整数 ID 与非空真实类型，不限制后端类型枚举', () => {
    expect(getChatIdentity({ id: 1, type: ' NormalUser ' })).toEqual({
      id: 1,
      type: 'NormalUser'
    })
    expect(getChatIdentity({ id: Number.MAX_SAFE_INTEGER, type: 'BackendUser' })).toEqual({
      id: Number.MAX_SAFE_INTEGER,
      type: 'BackendUser'
    })
    expect(hasChatIdentity({ id: 1, type: 'AdminUser' })).toBe(true)
  })

  it('拒绝无效、不完整和占位身份，非法 type 不触发 trim 异常', () => {
    const values: unknown[] = [
      undefined,
      null,
      1,
      'NormalUser',
      [],
      { id: 1 },
      { type: 'NormalUser' },
      { id: '1', type: 'NormalUser' },
      { id: null, type: 'NormalUser' },
      { id: 0, type: 'NormalUser' },
      { id: -1, type: 'NormalUser' },
      { id: 1.5, type: 'NormalUser' },
      { id: Number.MAX_SAFE_INTEGER + 1, type: 'NormalUser' },
      { id: NaN, type: 'NormalUser' },
      { id: Infinity, type: 'NormalUser' },
      { id: 1, type: null },
      { id: 1, type: 7 },
      { id: 1, type: {} },
      { id: 1, type: [] },
      { id: 1, type: '  ' },
      { id: 1, type: CHAT_MISSING },
      { id: 1, type: ` ${CHAT_MISSING} ` }
    ]
    for (const value of values) {
      expect(getChatIdentity(value)).toBeUndefined()
      expect(hasChatIdentity(value)).toBe(false)
    }
  })

  it('身份比较同时使用类型与 ID，缺失身份不能互相认作本人', () => {
    const self = { id: 1, type: 'NormalUser' }
    expect(isSameChatParticipant({ ...self, name: '后端姓名' }, self)).toBe(true)
    expect(isSameChatParticipant({ id: 1, type: ' NormalUser ' }, self)).toBe(true)
    expect(isSameChatParticipant({ id: 1, type: 'AdminUser' }, self)).toBe(false)
    expect(isSameChatParticipant({ id: 2, type: 'NormalUser' }, self)).toBe(false)
    expect(isSameChatParticipant({ id: 1 }, { id: 1 })).toBe(false)
    expect(isSameChatParticipant(null, self)).toBe(false)
    expect(isSameChatParticipant(undefined, undefined)).toBe(false)
  })

  it('角色仅使用后端明确类型，可空参与者不产生猜测', () => {
    expect(getChatRole({ type: 'NormalUser' })).toBe('社区成员')
    expect(getChatRole({ type: 'AdminUser' })).toBe('社区管理员')
    expect(getChatRole({ type: 'BackendUser' })).toBe(CHAT_MISSING)
    expect(getChatRole(null)).toBe(CHAT_MISSING)
  })
})

describe('真实成员集合与数量', () => {
  it('保留明确空数组，并原样返回全部有效对象而不补造成员资料', () => {
    const empty: ChatParticipant[] = []
    const participants: ChatParticipant[] = [{}, { id: 1, type: 'NormalUser', name: null }]
    expect(getChatParticipants({ id: 1, participants: empty })).toBe(empty)
    expect(getChatParticipants({ id: 1, participants })).toBe(participants)
    expect(participants).toEqual([{}, { id: 1, type: 'NormalUser', name: null }])
  })

  it('缺失集合或任一非法元素返回 unknown，不过滤成假空数组', () => {
    const values: unknown[] = [
      undefined,
      null,
      {},
      '[]',
      0,
      [null],
      [undefined],
      [[]],
      [false],
      ['成员'],
      [1],
      [{ id: 1, type: 'NormalUser' }, null],
      new Array(1)
    ]
    for (const participants of values) {
      const room = { id: 1, participants } as ChatRoom
      expect(getChatParticipants(room)).toBeUndefined()
      expect(getChatMemberCount(room)).toBe(CHAT_MISSING)
    }
    expect(getChatParticipants(null)).toBeUndefined()
  })

  it('区分缺失数量、明确空集合与明确数量 0', () => {
    expect(getChatMemberCount()).toBe(CHAT_MISSING)
    expect(getChatMemberCount(null)).toBe(CHAT_MISSING)
    expect(getChatMemberCount({ id: 1 })).toBe(CHAT_MISSING)
    expect(getChatMemberCount({ id: 1, participants: [] })).toBe(0)
    expect(getChatMemberCount({ id: 1, participant_count: 0, participants: [{}] })).toBe(0)
    expect(getChatMemberCount({ id: 1, participant_count: 3 })).toBe(3)
    expect(getChatMemberCount({ id: 1, participant_count: 3, participants: null })).toBe(3)
    expect(getChatMemberCount({ id: 1, participant_count: Number.MAX_SAFE_INTEGER })).toBe(
      Number.MAX_SAFE_INTEGER
    )
  })

  it('非法数量只允许回退到有效真实数组长度', () => {
    const values: unknown[] = [
      undefined,
      null,
      -1,
      1.5,
      NaN,
      Infinity,
      '0',
      Number.MAX_SAFE_INTEGER + 1
    ]
    for (const participant_count of values) {
      const room = { id: 1, participant_count } as ChatRoom
      expect(getChatMemberCount(room)).toBe(CHAT_MISSING)
      expect(getChatMemberCount({ ...room, participants: [{}, {}] })).toBe(2)
    }
  })
})

describe('房间对方与标题', () => {
  const self: ChatParticipant = { id: 1, type: 'NormalUser' }
  const peer: ChatParticipant = { id: 2, type: 'NormalUser', name: ' 后端对方 ' }

  it('只有明确私聊及完整本人身份才能返回真实非本人参与者', () => {
    const room: ChatRoom = { id: 1, type: 'private', participants: [self, peer] }
    expect(getChatPeer(room, self)).toBe(peer)
    expect(getChatTitle(room, self)).toBe('后端对方')
    expect(getChatPeer(room)).toBeUndefined()
    expect(getChatPeer(room, null)).toBeUndefined()
    expect(getChatPeer(room, { id: 1 })).toBeUndefined()
    expect(getChatPeer(room, { id: 1, type: CHAT_MISSING })).toBeUndefined()
  })

  it('同 ID 不同类型仍是真实对方，身份不完整的对象不能作为对方', () => {
    const admin: ChatParticipant = { id: 1, type: 'AdminUser' }
    expect(getChatPeer({ id: 1, type: 'private', participants: [self, admin] }, self)).toBe(admin)
    expect(
      getChatPeer({ id: 1, type: 'private', participants: [self, { id: 2 }] }, self)
    ).toBeUndefined()
    expect(
      getChatPeer({ id: 1, type: 'private', participants: [self, null] } as ChatRoom, self)
    ).toBeUndefined()
  })

  it('unknown、缺失类型与群聊不猜测私聊对方或姓名', () => {
    for (const type of [undefined, null, 'unknown', 'group']) {
      const room: ChatRoom = { id: 1, type, participants: [self, peer] }
      expect(getChatPeer(room, self)).toBeUndefined()
      expect(getChatTitle(room, self)).toBe(CHAT_MISSING)
    }
    expect(getChatPeer(null, self)).toBeUndefined()
    expect(getChatTitle(null, self)).toBe(CHAT_MISSING)
  })

  it('真实房间名优先，非法标题和参与者姓名不会触发 trim 异常或改变原数据', () => {
    expect(getChatTitle({ id: 1, type: 'group', name: ' 后端群名 ' }, self)).toBe('后端群名')
    const room = {
      id: 1,
      type: 'private',
      name: 7,
      participants: [{ ...peer, name: false }]
    } as unknown as ChatRoom
    expect(getChatTitle(room, self)).toBe(CHAT_MISSING)
    expect(room.name).toBe(7)
    expect(room.participants?.[0]?.name).toBe(false)
  })
})

describe('真实 presence', () => {
  it('明确 false 代表离线且优先于在线文案，明确 true 代表在线', () => {
    expect(getChatPresence({ is_online: false, online_status: 'online' })).toEqual({
      state: 'offline',
      label: '离线'
    })
    expect(getChatPresence({ is_online: true, online_status: 'offline' })).toEqual({
      state: 'online',
      label: '在线'
    })
  })

  it('缺失、null 与非法状态是 unknown，不伪装成离线也不触发 trim 异常', () => {
    expect(getChatPresence()).toEqual({ state: 'unknown', label: CHAT_MISSING })
    expect(getChatPresence(null)).toEqual({ state: 'unknown', label: CHAT_MISSING })
    for (const value of [null, undefined, '', 'unknown', 0, {}, [], Symbol('status')]) {
      const participant = { is_online: value, online_status: value } as ChatParticipant
      expect(getChatPresence(participant)).toEqual({ state: 'unknown', label: CHAT_MISSING })
    }
    expect(
      getChatPresence({ is_online: null, online_status: false } as unknown as ChatParticipant)
    ).toEqual({ state: 'unknown', label: CHAT_MISSING })
  })

  it('仅识别真实在线离线文案', () => {
    expect(getChatPresence({ is_online: null, online_status: ' ONLINE ' })).toEqual({
      state: 'online',
      label: '在线'
    })
    expect(getChatPresence({ online_status: ' 离线 ' })).toEqual({
      state: 'offline',
      label: '离线'
    })
  })
})

describe('本地聊天日期与最近活跃时间', () => {
  /** 固定本地当前日期，保证今天、昨天与午夜断言不依赖执行时刻。 */
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 19, 12, 0, 0))
  })

  /** 恢复真实计时器，避免影响同一进程中的其他测试。 */
  afterEach(() => {
    vi.useRealTimers()
  })

  it('缺失、非法类型和无效日期只展示占位，不生成时间', () => {
    const values: unknown[] = [
      undefined,
      null,
      '',
      '  ',
      'not-a-date',
      CHAT_MISSING,
      0,
      false,
      {},
      [],
      Symbol('date')
    ]
    for (const value of values) {
      expect(formatChatTime(value)).toBe(CHAT_MISSING)
      expect(formatChatDate(value)).toBe(CHAT_MISSING)
      expect(formatChatListTime(value)).toBe(CHAT_MISSING)
      expect(formatChatLastSeen({ last_seen_at: value } as ChatParticipant)).toBe(CHAT_MISSING)
    }
    expect(formatChatLastSeen(null)).toBe(CHAT_MISSING)
  })

  it('本地午夜保留 00:00，不被空值逻辑吞掉或格式化为 24:00', () => {
    const midnight = new Date(2026, 10, 19, 0, 0, 0).toISOString()
    expect(formatChatTime(midnight)).toBe('00:00')
    expect(formatChatListTime(midnight)).toBe('00:00')
    expect(formatChatDate(midnight)).toBe('今天')
    expect(formatChatLastSeen({ is_online: false, last_seen_at: midnight })).toBe('今天 00:00')
  })

  it('按本地日历区分昨天，同年日期不加年份，跨年日期补充年份', () => {
    const yesterday = new Date(2026, 10, 18, 23, 59, 0).toISOString()
    const sameYear = new Date(2026, 8, 20, 9, 30, 0).toISOString()
    const previousYear = new Date(2025, 8, 20, 9, 30, 0).toISOString()
    expect(formatChatDate(yesterday)).toBe('昨天')
    expect(formatChatListTime(yesterday)).toBe('昨天')
    expect(formatChatDate(sameYear)).toBe('9/20')
    expect(formatChatDate(previousYear)).toBe('2025/9/20')
    expect(formatChatListTime(previousYear)).toBe('2025/9/20')
  })

  it('跨年边界的昨天仍按本地日历显示', () => {
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0))
    expect(formatChatDate(new Date(2025, 11, 31, 23, 0, 0).toISOString())).toBe('昨天')
    expect(formatChatDate(new Date(2025, 11, 30, 23, 0, 0).toISOString())).toBe('2025/12/30')
  })

  it('在线与真实最近活跃时间分别展示，未知活跃记录保持缺失', () => {
    expect(formatChatLastSeen({ is_online: true })).toBe('当前在线')
    expect(formatChatLastSeen({ is_online: false })).toBe(CHAT_MISSING)
    expect(formatChatLastSeen({ is_online: null })).toBe(CHAT_MISSING)
    expect(
      formatChatLastSeen({
        is_online: false,
        last_seen_at: new Date(2026, 10, 19, 11, 59, 30).toISOString()
      })
    ).toBe('刚刚')
    expect(
      formatChatLastSeen({ last_seen_at: new Date(2026, 10, 19, 11, 55, 0).toISOString() })
    ).toBe('5 分钟前')
  })
})
