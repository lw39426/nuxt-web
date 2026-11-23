import { computed, shallowRef, watch } from 'vue'
import type { ChatParticipant } from '~/types/chat'
import { getChatIdentity, getChatParticipants, isSameChatParticipant } from '~/utils/chat'

/**
 * 组合真实聊天传输与 REST 成员资料，身份仅采用 Socket 已确认的完整类型与 ID。
 * 当前身份的真实资料快照可跨普通断线保留，不读取或写入认证用户资料。
 */
export function useChatSession() {
  const transport = useChat()
  const selfProfile = shallowRef<ChatParticipant | undefined>()

  /** 身份失效或变化时立即清空旧资料，优先用当前房间的真实匹配快照完整替换缓存。 */
  function syncSelfProfile() {
    const identity = getChatIdentity(transport.identity.value)
    if (!identity || !isSameChatParticipant(selfProfile.value, identity)) {
      selfProfile.value = undefined
    }
    if (!identity) return

    for (const room of [transport.activeRoom.value, ...transport.rooms.value]) {
      const participants = getChatParticipants(room)
      if (!participants) continue
      for (const participant of participants) {
        if (isSameChatParticipant(participant, identity)) {
          selfProfile.value = { ...participant }
          return
        }
      }
    }
  }

  watch([transport.identity, transport.rooms, transport.activeRoom], syncSelfProfile, {
    immediate: true,
    deep: true,
    flush: 'sync'
  })

  /** 仅将已确认身份与真实匹配资料用于本人展示，未知资料保持缺失。 */
  const self = computed<ChatParticipant | undefined>(() => {
    const identity = getChatIdentity(transport.identity.value)
    if (!identity) return undefined
    return { ...selfProfile.value, ...identity }
  })

  return { ...transport, self }
}
