<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import UAvatar from '@nuxt/ui/components/Avatar.vue';
import UIcon from '@nuxt/ui/components/Icon.vue';
import type { ChatParticipant } from '~/types/chat';
import { CHAT_MISSING, getChatPresence, getChatText } from '~/utils/chat';

const props = withDefaults(
  defineProps<{
    participant?: ChatParticipant | null;
    name?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    group?: boolean;
    showStatus?: boolean;
  }>(),
  { size: 'md', group: false, showStatus: false }
);

const dimensions = { xs: 28, sm: 36, md: 44, lg: 84 } as const;
const fontSizes = { xs: 12, sm: 14, md: 17, lg: 32 } as const;
const tones = [
  { background: 'var(--accent-soft)', foreground: 'var(--btn-lpurple-text)' },
  { background: 'var(--brand-soft)', foreground: 'var(--fg)' },
  { background: 'var(--surface-muted)', foreground: 'var(--fg-muted)' }
] as const;

/** 仅使用真实姓名，排除父级或参与者字段中的缺失占位。 */
const realName = computed(() => {
  const name = getChatText(props.name);
  if (name !== CHAT_MISSING) return name;
  const participantName = getChatText(props.participant?.name);
  return participantName === CHAT_MISSING ? '' : participantName;
});
/** 姓名缺失时使用统一占位作为头像的无障碍文案。 */
const displayName = computed(() => realName.value || CHAT_MISSING);
/** 仅使用后端提供的头像地址，群聊和缺失头像保留图标回退。 */
const avatarSource = computed(() => {
  const avatar = getChatText(props.participant?.avatar);
  return !props.group && avatar !== CHAT_MISSING ? avatar : undefined;
});
/** 仅有效的正整数身份参与选色，缺失或无效 ID 使用现有中性配色。 */
const tone = computed(() => {
  const id = props.participant?.id;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) return tones[2];
  return tones[id % tones.length] ?? tones[2];
});
const avatarStyle = computed<CSSProperties>(() => ({
  '--chat-avatar-size': `${dimensions[props.size]}px`,
  width: `${dimensions[props.size]}px`,
  height: `${dimensions[props.size]}px`,
  fontSize: `${fontSizes[props.size]}px`,
  backgroundColor: tone.value.background,
  color: tone.value.foreground
}));
const presence = computed(() => getChatPresence(props.participant));
/** 仅在后端明确给出在线或离线状态时显示状态点。 */
const showKnownStatus = computed(
  () => props.showStatus && !props.group && presence.value.state !== 'unknown'
);
/** 使用真实姓名和状态生成无障碍描述，缺失字段沿用统一占位。 */
const accessibleLabel = computed(() => {
  const avatarLabel = props.group ? `${displayName.value}的群聊头像` : `${displayName.value}的头像`;
  return props.showStatus && !props.group ? `${avatarLabel}，${presence.value.label}` : avatarLabel;
});
</script>

<template>
  <span class="chat-avatar" :style="avatarStyle" role="img" :aria-label="accessibleLabel">
    <UAvatar
      :src="avatarSource"
      :alt="displayName"
      :style="avatarStyle"
      :ui="{ root: 'size-full' }"
      aria-hidden="true"
    >
      <UIcon v-if="group" name="i-lucide-users" class="chat-avatar__icon" aria-hidden="true" />
      <UIcon v-else name="i-lucide-user" class="chat-avatar__icon" aria-hidden="true" />
    </UAvatar>
    <span
      v-if="showKnownStatus"
      class="chat-avatar__status"
      :class="{ 'chat-avatar__status--online': presence.state === 'online' }"
      aria-hidden="true"
    />
  </span>
</template>

<style scoped>
.chat-avatar {
  position: relative;
  display: inline-flex;
  flex: none;
  border-radius: 50%;
  vertical-align: middle;
  user-select: none;
}

.chat-avatar__icon {
  width: calc(var(--chat-avatar-size) * 0.45);
  height: calc(var(--chat-avatar-size) * 0.45);
  color: inherit;
}

.chat-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  width: clamp(7px, calc(var(--chat-avatar-size) * 0.22), 12px);
  height: clamp(7px, calc(var(--chat-avatar-size) * 0.22), 12px);
  border: 2px solid var(--surface);
  border-radius: 50%;
  background: var(--fg-muted);
}

.chat-avatar__status--online {
  background: var(--brand);
}
</style>
