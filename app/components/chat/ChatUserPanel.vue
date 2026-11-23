<script setup lang="ts">
import { computed } from 'vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UIcon from '@nuxt/ui/components/Icon.vue';
import type { ChatParticipant, ChatRoom } from '~/types/chat';
import {
  CHAT_MISSING,
  formatChatLastSeen,
  formatChatListTime,
  getChatMemberCount,
  getChatParticipants,
  getChatPresence,
  getChatRole,
  getChatText,
  hasChatIdentity,
  isSameChatParticipant
} from '~/utils/chat';
import ChatAvatar from './ChatAvatar.vue';

const props = withDefaults(
  defineProps<{
    room?: ChatRoom;
    self?: ChatParticipant;
    participant?: ChatParticipant;
  }>(),
  { room: undefined, self: undefined, participant: undefined }
);

const emit = defineEmits<{
  close: [];
  inspect: [participant: ChatParticipant | undefined];
}>();

/** 群聊未选中成员时展示概览，显式传入的参与者始终优先。 */
const isGroupOverview = computed(() => props.room?.type === 'group' && !props.participant);

/** 从参与者的真实字段派生资料，缺失信息统一占位且不展示无效 ID。 */
const profile = computed(() => {
  const participant = props.participant;
  const role = getChatRole(participant);
  const presence = getChatPresence(participant);
  const id = participant?.id;

  return {
    name: getChatText(participant?.name),
    id: typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? String(id) : CHAT_MISSING,
    role,
    roleLabel: role,
    presence,
    presenceLabel: presence.label,
    lastSeen: formatChatLastSeen(participant),
    isSelf: isSameChatParticipant(participant, props.self)
  };
});

/** 通过公共成员契约生成真实群概览，区分明确数量、无消息及缺失字段。 */
const overview = computed(() => ({
  name: getChatText(props.room?.name),
  memberCount: props.room ? getChatMemberCount(props.room) : CHAT_MISSING,
  lastMessageTime:
    props.room?.last_message === null
      ? '还没有消息'
      : formatChatListTime(props.room?.last_message?.created_at)
}));

/** 保留成员集合缺失与明确空集合，缺少有效身份时仅用索引作为渲染键。 */
const members = computed(() => {
  const participants = props.room ? getChatParticipants(props.room) : undefined;
  return participants?.map((participant, index) => {
    const role = getChatRole(participant);
    const presence = getChatPresence(participant);

    return {
      participant,
      key: hasChatIdentity(participant) ? `${participant.type}:${participant.id}` : index,
      name: getChatText(participant.name),
      roleLabel: role,
      presenceLabel: presence.label,
      isSelf: isSameChatParticipant(participant, props.self)
    };
  });
});
</script>

<template>
  <section class="chat-user-panel" aria-label="会话资料">
    <header class="chat-user-panel__header">
      <h2 class="chat-user-panel__title">会话资料</h2>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        class="chat-user-panel__close"
        aria-label="关闭用户资料"
        @click="emit('close')"
      >
        <UIcon name="i-lucide-x" class="chat-user-panel__icon" aria-hidden="true" />
      </UButton>
    </header>

    <button
      v-if="room?.type === 'group' && participant"
      type="button"
      class="chat-user-panel__overview-back"
      @click="emit('inspect', undefined)"
    >
      <UIcon name="i-lucide-arrow-left" class="chat-user-panel__icon" aria-hidden="true" />
      返回群聊概览
    </button>
    <div
      class="chat-user-panel__profile"
      :class="{ 'chat-user-panel__profile--group': isGroupOverview }"
    >
      <p class="chat-user-panel__profile-kind">{{ isGroupOverview ? '群聊概览' : '用户资料' }}</p>
      <ChatAvatar v-if="isGroupOverview" :name="overview.name" size="lg" group />
      <ChatAvatar v-else :participant="participant" size="lg" show-status />
      <h3 class="chat-user-panel__name">{{ isGroupOverview ? overview.name : profile.name }}</h3>
      <div class="chat-user-panel__badges">
        <span class="chat-user-panel__badge">{{
          isGroupOverview ? '群聊' : profile.roleLabel
        }}</span>
        <span v-if="!isGroupOverview && profile.isSelf" class="chat-user-panel__badge">我</span>
      </div>
      <p v-if="isGroupOverview" class="chat-user-panel__presence">点击下方成员查看资料</p>
      <p v-else class="chat-user-panel__presence">
        <span
          v-if="profile.presence.state !== 'unknown'"
          class="chat-user-panel__dot"
          :class="{ 'chat-user-panel__dot--online': profile.presence.state === 'online' }"
          aria-hidden="true"
        />
        {{ profile.presenceLabel }}
      </p>
    </div>

    <dl class="chat-user-panel__details">
      <template v-if="!isGroupOverview">
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">用户 ID</dt>
          <dd class="chat-user-panel__value chat-user-panel__id">{{ profile.id }}</dd>
        </div>
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">社区身份</dt>
          <dd class="chat-user-panel__value">{{ profile.role }}</dd>
        </div>
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">最近活跃</dt>
          <dd class="chat-user-panel__value">{{ profile.lastSeen }}</dd>
        </div>
      </template>
      <template v-else>
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">会话类型</dt>
          <dd class="chat-user-panel__value">群聊</dd>
        </div>
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">成员数量</dt>
          <dd class="chat-user-panel__value">{{ overview.memberCount }}</dd>
        </div>
        <div class="chat-user-panel__detail">
          <dt class="chat-user-panel__label">最近消息</dt>
          <dd class="chat-user-panel__value">{{ overview.lastMessageTime }}</dd>
        </div>
      </template>
    </dl>

    <section v-if="isGroupOverview" class="chat-user-panel__members" aria-label="群聊成员">
      <h3 class="chat-user-panel__section-title">成员列表</h3>
      <ul v-if="members?.length" class="chat-user-panel__list">
        <li v-for="member in members" :key="member.key" class="chat-user-panel__member">
          <button
            type="button"
            class="chat-user-panel__member-button"
            :aria-label="`查看${member.name}的用户资料`"
            @click="emit('inspect', member.participant)"
          >
            <ChatAvatar :participant="member.participant" size="sm" show-status />
            <span class="chat-user-panel__member-copy">
              <span class="chat-user-panel__member-heading">
                <span class="chat-user-panel__member-name">{{ member.name }}</span>
                <span v-if="member.isSelf" class="chat-user-panel__self">我</span>
              </span>
              <span class="chat-user-panel__member-meta">
                {{ member.roleLabel }} · {{ member.presenceLabel }}
              </span>
            </span>
            <UIcon
              name="i-lucide-chevron-right"
              class="chat-user-panel__member-icon"
              aria-hidden="true"
            />
          </button>
        </li>
      </ul>
      <p v-else class="chat-user-panel__empty">
        {{ members === undefined ? CHAT_MISSING : '暂无成员' }}
      </p>
    </section>

    <footer class="chat-user-panel__footer">
      <UIcon name="i-lucide-message-circle" class="chat-user-panel__icon" aria-hidden="true" />
      <p class="chat-user-panel__reminder">友善交流，保护个人信息</p>
    </footer>
  </section>
</template>

<style scoped>
.chat-user-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 264px;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  padding: 0 16px 16px;
  overflow-y: auto;
  color: var(--fg);
  background: var(--surface);
  font-family: inherit;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.chat-user-panel > * {
  flex-shrink: 0;
}
.chat-user-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 1;
  min-width: 0;
  min-height: 72px;
  box-sizing: border-box;
  margin-inline: -16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.chat-user-panel__title,
.chat-user-panel__section-title {
  min-width: 0;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.chat-user-panel :deep(.chat-user-panel__close) {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  color: var(--fg-muted);
  background: var(--surface);
  box-shadow: none;
  cursor: pointer;
}

.chat-user-panel__overview-back {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 10px;
  padding: 8px;
  color: var(--fg-muted);
  text-align: left;
  font-size: 13px;
}
.chat-user-panel__overview-back:hover {
  background: var(--surface-muted);
}
.chat-user-panel__overview-back:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.chat-user-panel__icon,
.chat-user-panel__member-icon {
  flex: none;
  width: 16px;
  height: 16px;
}

.chat-user-panel__profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 18px 12px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--accent-soft);
  text-align: center;
}

.chat-user-panel__profile--group {
  background: var(--brand-soft);
}

.chat-user-panel__profile-kind {
  margin: 0 0 4px;
  color: var(--fg-muted);
  font-size: 12px;
}

.chat-user-panel__name {
  max-width: 100%;
  min-width: 0;
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.chat-user-panel__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
}

.chat-user-panel__badge,
.chat-user-panel__self {
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--fg);
  background: var(--brand-soft);
  font-size: 11px;
  font-weight: 500;
}

.chat-user-panel__presence {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin: 0;
  color: var(--fg-muted);
  font-size: 12px;
}

.chat-user-panel__dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--fg-muted);
}

.chat-user-panel__dot--online {
  background: var(--brand);
}

.chat-user-panel__details {
  min-width: 0;
  margin: 0;
}

.chat-user-panel__detail {
  display: grid;
  grid-template-columns: minmax(0, 76px) minmax(0, 1fr);
  align-items: baseline;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}

.chat-user-panel__label {
  min-width: 0;
  color: var(--fg-muted);
  font-size: 12px;
}

.chat-user-panel__value {
  min-width: 0;
  margin: 0;
  font-size: 13px;
  text-align: right;
  overflow-wrap: anywhere;
}

.chat-user-panel__id {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  user-select: text;
}

.chat-user-panel__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
  margin: 0;
}

.chat-user-panel__metric {
  min-width: 0;
  padding: 12px 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-muted);
  text-align: center;
}

.chat-user-panel__count {
  min-width: 0;
  margin: 6px 0 0;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.chat-user-panel__members {
  min-width: 0;
}

.chat-user-panel__list {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.chat-user-panel__member {
  min-width: 0;
}

.chat-user-panel__member-button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 10px 0;
  border: 0;
  border-radius: 10px;
  color: var(--fg);
  background: var(--surface);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.chat-user-panel__member-copy {
  flex: 1;
  min-width: 0;
}

.chat-user-panel__member-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  min-width: 0;
}

.chat-user-panel__member-name {
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
}

.chat-user-panel__self {
  flex: none;
  padding: 1px 6px;
  font-size: 10px;
}

.chat-user-panel__member-meta {
  display: block;
  margin-top: 4px;
  color: var(--fg-muted);
  font-size: 11px;
}

.chat-user-panel__member-icon {
  color: var(--fg-muted);
}

.chat-user-panel :deep(.chat-user-panel__close:hover) {
  color: var(--fg);
  background: var(--surface-muted);
}

.chat-user-panel__member-button:hover {
  background: var(--brand-soft);
}

.chat-user-panel :deep(.chat-user-panel__close:focus-visible),
.chat-user-panel__member-button:focus-visible {
  outline: 2px solid var(--btn-lpurple-text);
  outline-offset: 2px;
}

.chat-user-panel__empty {
  margin: 10px 0 0;
  color: var(--fg-muted);
  font-size: 12px;
}

.chat-user-panel__footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  color: var(--fg-muted);
}

.chat-user-panel__reminder {
  min-width: 0;
  margin: 0;
  font-size: 12px;
}

@media (max-width: 767px) {
  .chat-user-panel {
    width: 100%;
  }
}
</style>
