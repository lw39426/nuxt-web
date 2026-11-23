<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UIcon from '@nuxt/ui/components/Icon.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import type { ChatParticipant, ChatRoom } from '~/types/chat';
import {
  CHAT_MISSING,
  formatChatListTime,
  getChatPeer,
  getChatText,
  getChatTitle,
  isSameChatParticipant
} from '~/utils/chat';
import ChatAvatar from './ChatAvatar.vue';

const props = withDefaults(
  defineProps<{
    rooms: ChatRoom[];
    active: number | null;
    self?: ChatParticipant;
    loading: boolean;
    roomsLoading: boolean;
    roomsError: string;
    hasMore: boolean | null;
  }>(),
  { self: undefined }
);
const emit = defineEmits<{
  select: [id: number];
  open: [id: number];
  more: [];
  retry: [];
}>();
const query = shallowRef('');
const filter = shallowRef<'all' | 'unread'>('all');
const showNewChat = shallowRef(false);
const recipient = shallowRef('');
const formError = shallowRef('');

/** 为会话列表派生真实联系人、预览和未读信息，仅明确私聊才查找对方。 */
const roomItems = computed(() =>
  props.rooms.map((room) => {
    const group = room.type === 'group';
    const privateRoom = room.type === 'private';
    const participant = privateRoom ? getChatPeer(room, props.self) : undefined;
    const title = privateRoom ? getChatTitle(room, props.self) : getChatText(room.name);
    const message = room.last_message;
    const sender = message?.sender;
    const prefix = isSameChatParticipant(sender, props.self)
      ? '我：'
      : group
        ? `${getChatText(sender?.name)}：`
        : '';
    const preview =
      message === null
        ? '还没有消息'
        : message === undefined
          ? CHAT_MISSING
          : `${prefix}${getChatText(message.content)}`;
    const unread =
      typeof room.unread_count === 'number' &&
      Number.isSafeInteger(room.unread_count) &&
      room.unread_count >= 0
        ? room.unread_count
        : undefined;
    const unreadLabel =
      unread === undefined
        ? `未读消息数：${CHAT_MISSING}`
        : unread > 0
          ? `${unread} 条未读消息`
          : '';
    return {
      room,
      group,
      participant,
      title,
      preview,
      unread,
      ariaLabel: `${title}${unreadLabel ? `，${unreadLabel}` : ''}`,
      time: formatChatListTime(message?.created_at),
      searchText:
        `${title} ${participant?.name ?? ''} ${participant?.id ?? ''} ${preview}`.toLowerCase()
    };
  })
);
/** 未读总数只累加已知有效数值，不将缺失字段转换为已读。 */
const unreadCount = computed(() =>
  roomItems.value.reduce((count, item) => count + (item.unread ?? 0), 0)
);
/** 标记存在未知未读数的会话，供筛选提示与空状态区分。 */
const hasUnknownUnread = computed(() => roomItems.value.some((item) => item.unread === undefined));
/** 保留本地搜索与未读筛选，未知未读数不计入确定未读的结果。 */
const filteredRooms = computed(() => {
  const search = query.value.trim().toLowerCase();
  return roomItems.value.filter(
    (item) =>
      (filter.value === 'all' || (item.unread !== undefined && item.unread > 0)) &&
      (!search || item.searchText.includes(search))
  );
});
/** 未知分页且已有会话时允许手动尝试，明确没有下一页时隐藏入口。 */
const canLoadMore = computed(
  () => props.hasMore === true || (props.hasMore === null && props.rooms.length > 0)
);
/** 仅展示本人有效的正整数 ID，缺失或无效时使用统一占位。 */
const selfId = computed(() => {
  const id = props.self?.id;
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 ? `ID ${id}` : CHAT_MISSING;
});

/** 校验用户输入后发起私聊，仅在本人身份完整时阻止自聊。 */
function startPrivateChat(): void {
  const id = Number(recipient.value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    formError.value = '请输入有效的用户 ID';
    return;
  }
  if (isSameChatParticipant({ id, type: 'NormalUser' }, props.self)) {
    formError.value = '不能和自己发起私聊';
    return;
  }
  formError.value = '';
  emit('open', id);
}
</script>

<template>
  <aside class="chat-rooms" aria-label="会话列表">
    <div class="chat-rooms__top">
      <div class="chat-rooms__heading">
        <div>
          <h2 class="chat-rooms__title">最近会话</h2>
          <p class="chat-rooms__subtitle">和同好聊聊喜欢的作品</p>
        </div>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-square-pen"
          class="chat-rooms__new"
          aria-label="发起新私聊"
          :aria-expanded="showNewChat"
          aria-controls="chat-new-private"
          @click="showNewChat = !showNewChat"
        />
      </div>
      <form
        v-if="showNewChat"
        id="chat-new-private"
        class="chat-rooms__new-form"
        @submit.prevent="startPrivateChat"
      >
        <label for="chat-recipient" class="chat-rooms__field-label">通过用户 ID 发起私聊</label>
        <div class="chat-rooms__new-fields">
          <UInput
            id="chat-recipient"
            v-model="recipient"
            type="number"
            inputmode="numeric"
            min="1"
            step="1"
            required
            placeholder="输入用户 ID"
            class="chat-rooms__recipient"
            size="lg"
            :aria-invalid="Boolean(formError)"
            :aria-describedby="formError ? 'chat-recipient-error' : undefined"
          />
          <UButton
            type="submit"
            :disabled="loading"
            icon="i-lucide-arrow-right"
            aria-label="开始私聊"
          />
        </div>
        <p v-if="formError" id="chat-recipient-error" class="chat-rooms__form-error" role="alert">
          {{ formError }}
        </p>
      </form>
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="搜索联系人或消息"
        aria-label="搜索已加载的会话"
        class="chat-rooms__search"
        size="lg"
        :ui="{ root: 'w-full' }"
      />
      <div class="chat-rooms__filters" aria-label="会话筛选">
        <button
          type="button"
          class="chat-rooms__filter"
          :class="{ 'chat-rooms__filter--active': filter === 'all' }"
          :aria-pressed="filter === 'all'"
          @click="filter = 'all'"
        >
          全部会话
        </button>
        <button
          type="button"
          class="chat-rooms__filter"
          :class="{ 'chat-rooms__filter--active': filter === 'unread' }"
          :aria-pressed="filter === 'unread'"
          @click="filter = 'unread'"
        >
          未读
          <span v-if="unreadCount" class="chat-rooms__filter-count">{{
            unreadCount > 99 ? '99+' : unreadCount
          }}</span>
          <span v-if="hasUnknownUnread" class="chat-rooms__filter-count">{{ CHAT_MISSING }}</span>
        </button>
      </div>
    </div>

    <div class="chat-rooms__list" :aria-busy="roomsLoading">
      <div v-if="roomsError" class="chat-rooms__empty" role="alert">
        <UIcon name="i-lucide-circle-alert" class="chat-rooms__empty-icon" aria-hidden="true" />
        <strong>会话列表加载失败</strong>
        <p>{{ roomsError }}</p>
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          :loading="roomsLoading"
          :disabled="roomsLoading"
          @click="emit('retry')"
          >重试会话列表</UButton
        >
      </div>
      <div
        v-if="roomsLoading && !rooms.length"
        class="chat-rooms__skeletons"
        role="status"
        aria-label="正在加载会话"
      >
        <div v-for="index in 4" :key="index" class="chat-rooms__skeleton" aria-hidden="true">
          <span class="chat-rooms__skeleton-avatar" />
          <span class="chat-rooms__skeleton-copy"><span /><span /></span>
        </div>
      </div>
      <template v-else>
        <TransitionGroup
          v-if="filteredRooms.length"
          name="chat-room"
          tag="div"
          class="chat-rooms__items"
          appear
        >
          <button
            v-for="item in filteredRooms"
            :key="item.room.id"
            type="button"
            class="chat-room"
            :class="{
              'chat-room--selected': item.room.id === active,
              'chat-room--unread': item.unread !== undefined && item.unread > 0
            }"
            :disabled="loading && item.room.id === active"
            :aria-pressed="item.room.id === active"
            :aria-label="item.ariaLabel"
            @click="emit('select', item.room.id)"
          >
            <ChatAvatar
              :participant="item.participant"
              :name="item.title"
              :group="item.group"
              show-status
            />
            <span class="chat-room__copy">
              <span class="chat-room__headline">
                <strong class="chat-room__name">{{ item.title }}</strong>
                <span v-if="item.group" class="chat-room__role">群聊</span>
                <span v-else-if="item.participant?.type === 'AdminUser'" class="chat-room__role"
                  >管理员</span
                >
              </span>
              <span class="chat-room__preview">{{ item.preview }}</span>
            </span>
            <span class="chat-room__meta">
              <time
                v-if="item.room.last_message !== null"
                :datetime="item.room.last_message?.created_at ?? undefined"
                class="chat-room__time"
                >{{ item.time }}</time
              >
              <span
                v-if="item.unread !== undefined && item.unread > 0"
                class="chat-room__unread"
                aria-hidden="true"
                >{{ item.unread > 99 ? '99+' : item.unread }}</span
              >
              <span v-else-if="item.unread === undefined" class="chat-room__time"
                >未读：{{ CHAT_MISSING }}</span
              >
            </span>
          </button>
        </TransitionGroup>
        <div v-if="!roomsError && !filteredRooms.length" class="chat-rooms__empty" role="status">
          <UIcon
            :name="query ? 'i-lucide-search' : 'i-lucide-messages-square'"
            class="chat-rooms__empty-icon"
            aria-hidden="true"
          />
          <strong>{{
            query
              ? '没有找到相关会话'
              : filter === 'unread'
                ? hasUnknownUnread
                  ? CHAT_MISSING
                  : '没有未读消息'
                : '还没有会话'
          }}</strong>
          <p>
            {{
              query
                ? '试试联系人姓名、ID 或消息关键词。'
                : filter === 'unread'
                  ? hasUnknownUnread
                    ? `部分会话的未读消息数${CHAT_MISSING}。`
                    : '已加载的消息都看过了。'
                  : '点击右上角，发起第一段私聊。'
            }}
          </p>
        </div>
        <p v-if="hasMore === null" class="chat-rooms__pagination" role="status">
          分页信息：{{ CHAT_MISSING }}
        </p>
        <UButton
          v-if="canLoadMore"
          color="neutral"
          variant="ghost"
          block
          :loading="roomsLoading"
          class="chat-rooms__more"
          @click="emit('more')"
          >{{ hasMore === null ? '尝试加载更多会话' : '加载更多会话' }}</UButton
        >
      </template>
    </div>

    <footer class="chat-rooms__self">
      <ChatAvatar :participant="self" size="sm" />
      <div class="chat-rooms__self-copy">
        <strong>{{ getChatText(self?.name) }}</strong>
        <small>{{ selfId }}</small>
      </div>
      <UIcon name="i-lucide-message-circle" class="chat-rooms__self-icon" aria-hidden="true" />
    </footer>
  </aside>
</template>

<style scoped>
.chat-rooms {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: var(--surface);
}
.chat-rooms__top {
  flex: none;
  padding: 0 16px 12px;
}
.chat-rooms__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 72px;
  box-sizing: border-box;
  margin: 0 -16px 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
}
.chat-rooms__title {
  margin: 0;
  color: var(--fg);
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.chat-rooms__subtitle {
  margin: 5px 0 0;
  color: var(--fg-muted);
  font-size: 12px;
}
.chat-rooms :deep(.chat-rooms__new) {
  flex: none;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 10px;
  color: var(--fg);
  background: var(--surface-muted);
}
.chat-rooms__new-form {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-muted);
}
.chat-rooms__field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--fg-muted);
}
.chat-rooms__new-fields {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-rooms__new-fields :deep(button) {
  width: 44px;
  height: 44px;
  flex: none;
  justify-content: center;
  padding: 0;
}
.chat-rooms__recipient :deep(input) {
  min-height: 44px;
  font-size: 16px;
}
.chat-rooms__recipient {
  flex: 1;
  min-width: 0;
}
.chat-rooms__form-error {
  margin: 8px 0 0;
  color: var(--ui-error);
  font-size: 12px;
}
.chat-rooms__search {
  width: 100%;
}
.chat-rooms__search :deep(input) {
  border-radius: 10px;
  background: var(--surface-muted);
  font-size: 14px;
  min-height: 44px;
  padding-inline: 36px 12px;
}
.chat-rooms__filters {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 4px;
  border-radius: 10px;
  background: var(--surface-muted);
}
.chat-rooms__filter {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 7px 8px;
  border-radius: 7px;
  color: var(--fg-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.18s,
    color 0.18s;
}
.chat-rooms__filter--active {
  color: var(--fg);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}
.chat-rooms__filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 5px;
  color: var(--fg);
  background: var(--brand-soft);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.chat-rooms__list {
  flex: 1;
  min-height: 0;
  padding: 4px 8px 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}
.chat-rooms__items {
  position: relative;
  display: flex;
  flex-direction: column;
}
.chat-rooms__items .chat-room-enter-active,
.chat-rooms__items .chat-room-appear-active {
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}
.chat-rooms__items .chat-room-enter-from,
.chat-rooms__items .chat-room-appear-from {
  opacity: 0;
  transform: translateY(8px);
}
.chat-rooms__items .chat-room-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.18s ease;
}
.chat-rooms__items .chat-room-move {
  transition: transform 0.26s ease;
}
.chat-room {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  margin-bottom: 4px;
  padding: 12px 8px;
  border: 1px solid transparent;
  border-radius: 12px;
  text-align: left;
  color: var(--fg);
  cursor: pointer;
  transition:
    background-color 0.18s,
    border-color 0.18s;
}
.chat-room:hover:not(:disabled) {
  background: var(--surface-muted);
}
.chat-room--selected,
.chat-room--selected:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: color-mix(in srgb, var(--accent) 22%, transparent);
}
.chat-room--selected::before {
  content: '';
  position: absolute;
  top: 26%;
  bottom: 26%;
  left: -1px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
}
.chat-room:disabled {
  cursor: wait;
}
.chat-room__copy {
  flex: 1;
  min-width: 0;
}
.chat-room__headline {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.chat-room__name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 550;
}
.chat-room--unread .chat-room__name {
  font-weight: 650;
}
.chat-room__role {
  flex: none;
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--fg-muted);
  background: var(--surface-muted);
  font-size: 9px;
}
.chat-room__preview {
  display: block;
  overflow: hidden;
  margin-top: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-muted);
  font-size: 12px;
  line-height: 1.5;
}
.chat-room__meta {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  flex: none;
}
.chat-room__time {
  color: var(--fg-muted);
  font-family: ui-monospace, Consolas, monospace;
  font-size: 10px;
  white-space: nowrap;
}
.chat-room__unread {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 6px;
  background: var(--brand);
  color: var(--on-brand);
  font-size: 10px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.chat-rooms__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 46px 14px;
  color: var(--fg-muted);
  text-align: center;
  font-size: 13px;
}
.chat-rooms__empty-icon {
  width: 30px;
  height: 30px;
  margin-bottom: 4px;
  color: var(--accent);
}
.chat-rooms__empty p {
  max-width: 210px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}
.chat-rooms__pagination {
  margin: 12px 0 0;
  color: var(--fg-muted);
  text-align: center;
  font-size: 12px;
}
.chat-rooms__more {
  margin-top: 8px;
  font-size: 12px;
}
.chat-rooms__self {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding: 14px 16px;
  border-top: 1px solid var(--line);
}
.chat-rooms__self-copy {
  flex: 1;
  min-width: 0;
}
.chat-rooms__self-copy strong {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
  flex-wrap: wrap;
}
.chat-rooms__self-copy small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--fg-muted);
  font-variant-numeric: tabular-nums;
}
.chat-rooms__self-icon {
  width: 18px;
  height: 18px;
  color: var(--fg-muted);
}
.chat-rooms__skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px;
}
.chat-rooms__skeleton-avatar {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  background: var(--surface-muted);
}
.chat-rooms__skeleton-copy {
  flex: 1;
  display: grid;
  gap: 9px;
}
.chat-rooms__skeleton-copy span {
  width: 80%;
  height: 10px;
  border-radius: 4px;
  background: var(--surface-muted);
}
.chat-rooms__skeleton-copy span:first-child {
  width: 40%;
}
.chat-room:focus-visible,
.chat-rooms__filter:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .chat-room,
  .chat-rooms__filter,
  .chat-rooms__items .chat-room-enter-active,
  .chat-rooms__items .chat-room-appear-active,
  .chat-rooms__items .chat-room-leave-active,
  .chat-rooms__items .chat-room-move {
    transition: none;
  }
}
</style>
