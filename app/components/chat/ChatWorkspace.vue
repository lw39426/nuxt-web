<script setup lang="ts">
import type { ChatParticipant } from '~/types/chat';
import {
  CHAT_MISSING,
  getChatMemberCount,
  getChatPeer,
  getChatText,
  getChatTitle,
  formatChatLastSeen,
  formatChatTime
} from '~/utils/chat';
import ChatAvatar from './ChatAvatar.vue';
import ChatRoomList from './ChatRoomList.vue';
import ChatUserPanel from './ChatUserPanel.vue';

const chat = useChatSession();
const {
  rooms,
  active,
  activeRoom,
  messages,
  connected,
  connectionState,
  error,
  roomsError,
  historyError,
  pending,
  hasRooms,
  hasHistory,
  loading,
  roomsLoading,
  reconnect,
  loadRooms,
  history,
  read,
  select,
  openPrivate,
  send,
  report
} = chat;

/** 当前登录用户对应的聊天参与者，用于派生会话标题与对方资料。 */
const self = computed(() => chat.self.value);
const peer = computed(() => getChatPeer(activeRoom.value, self.value));
const title = computed(() => getChatTitle(activeRoom.value, self.value));
/** 群聊使用真实成员数量，私聊仅显示对方已有的活跃资料。 */
const presenceLabel = computed(() => {
  const room = activeRoom.value;
  if (!room) return '';
  if (room.type === 'group') {
    const count = getChatMemberCount(room);
    return typeof count === 'number' ? `${count} 位成员` : count;
  }
  return formatChatLastSeen(peer.value);
});
/** 连接文案只反映 Socket 状态，不据此推断本人在线资料。 */
const connectionLabel = computed(() => {
  if (connectionState.value === 'connecting') return '连接中';
  return connectionState.value === 'connected' ? '已连接' : '连接已断开';
});
/** 分页未知且已有消息时保留手动下一页入口，不将未知状态视为没有更多。 */
const canLoadHistory = computed(
  () => hasHistory.value === true || (hasHistory.value === null && messages.value.length > 0)
);

/** 群聊默认展示概览，点选成员后才展示其资料。 */
const inspected = ref<ChatParticipant | undefined>(undefined);
const panelParticipant = computed<ChatParticipant | undefined>(() =>
  activeRoom.value?.type === 'group' ? inspected.value : peer.value
);

const draft = ref('');
const feed = ref<HTMLElement>();
let feedResize: ResizeObserver | undefined;
let keepLatestVisible = true;
/** 记录用户是否停留在消息底部，并仅对可见的最新消息上报已读。 */
function onFeedScroll() {
  const element = feed.value;
  if (element) {
    keepLatestVisible = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  }
  void markVisible();
}
watch(
  feed,
  (element) => {
    feedResize?.disconnect();
    if (!element) return;
    keepLatestVisible = true;
    feedResize = new ResizeObserver(() => {
      if (keepLatestVisible) scrollToBottom();
    });
    feedResize.observe(element);
  },
  { flush: 'post' }
);
const showProfile = ref(false);
const mobileView = ref<'rooms' | 'conversation' | 'profile'>('rooms');
let roomOperation = 0;
let disposed = false;

/** 仅在服务端确认 Socket 可发送、真实选中会话有效且草稿非空时允许发送。 */
const canSend = computed(() => {
  const id = activeRoom.value?.id;
  return (
    connected.value &&
    typeof id === 'number' &&
    Number.isSafeInteger(id) &&
    id > 0 &&
    id === active.value &&
    Boolean(draft.value.trim())
  );
});

/** 操作开始时清除旧提示，切房过期或组件卸载后的失败不再写入错误。 */
async function run(task: () => Promise<unknown>, operation?: number) {
  if (disposed) return;
  error.value = '';
  try {
    await task();
  } catch (e) {
    if (!disposed && (operation === undefined || operation === roomOperation)) report(e);
  }
}
/** 仅最新切房操作可更新视图；真实会话历史失败仍进入会话，创建失败则保留原视图。 */
async function openRoom(task: () => Promise<unknown>, selectedId?: number) {
  if (disposed) return;
  const operation = ++roomOperation;
  const previousActive = active.value;
  let completed = false;
  await run(async () => {
    try {
      await task();
      completed = true;
    } finally {
      const room = activeRoom.value;
      if (
        !disposed &&
        operation === roomOperation &&
        room &&
        room.id === active.value &&
        (completed || active.value !== previousActive || room.id === selectedId)
      ) {
        showProfile.value = true;
        mobileView.value = 'conversation';
        await nextTick();
        if (
          !disposed &&
          operation === roomOperation &&
          active.value === room.id &&
          activeRoom.value?.id === room.id
        ) {
          scrollToBottom();
          await markVisible();
        }
      }
    }
  }, operation);
}
/** 将当前消息区滚动到已加载内容的底部，卸载后不再操作视图。 */
function scrollToBottom() {
  if (disposed) return;
  const el = feed.value;
  if (el) el.scrollTop = el.scrollHeight;
}
/** 通过同一发送条件保护按钮与回车入口，仅在发送被接受后清空草稿。 */
function sendMessage() {
  if (!canSend.value) return;
  if (send(draft.value)) draft.value = '';
}
/** 输入法确认不拦截，仅普通无修饰回车发送，Shift+Enter 等保留默认编辑行为。 */
function onComposerKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return;
  if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  event.preventDefault();
  sendMessage();
}
/** 切换桌面端资料栏；移动端切到资料视图。 */
function openProfile() {
  showProfile.value = true;
  mobileView.value = 'profile';
}
/** 关闭资料并清除成员选择，移动端返回仍有效的会话或列表。 */
function closeProfile() {
  inspected.value = undefined;
  showProfile.value = false;
  mobileView.value = activeRoom.value ? 'conversation' : 'rooms';
}

let lastRead = '';
let reading = false;
let readRoomVersion = 0;
/** 仅可见底部上报已读；确认只归属原会话代次与最新消息，过期请求结束后检查当前会话。 */
async function markVisible() {
  const el = feed.value;
  const room = activeRoom.value?.id;
  const newest = messages.value.at(-1);
  const key = `${room}:${newest?.id}`;
  const version = readRoomVersion;
  if (
    !disposed &&
    room !== undefined &&
    room === active.value &&
    el?.clientHeight &&
    newest &&
    !loading.value &&
    !reading &&
    key !== lastRead &&
    !document.hidden &&
    el.scrollHeight - el.scrollTop - el.clientHeight < 40
  ) {
    reading = true;
    try {
      await read();
      if (
        !disposed &&
        version === readRoomVersion &&
        active.value === room &&
        activeRoom.value?.id === room &&
        messages.value.at(-1)?.id === newest.id
      ) {
        lastRead = key;
      }
    } catch (e) {
      if (
        !disposed &&
        version === readRoomVersion &&
        active.value === room &&
        activeRoom.value?.id === room
      ) {
        report(e);
      }
    } finally {
      reading = false;
      if (
        !disposed &&
        (version !== readRoomVersion ||
          active.value !== room ||
          activeRoom.value?.id !== room ||
          messages.value.at(-1)?.id !== newest.id)
      ) {
        void markVisible();
      }
    }
  }
}
/** 切房同步重置已读代次；仅活动会话清空时返回列表并关闭资料，刷新或重连不丢失视图。 */
watch(
  active,
  (room) => {
    if (disposed) return;
    readRoomVersion += 1;
    lastRead = '';
    inspected.value = undefined;
    if (room === null) {
      showProfile.value = false;
      mobileView.value = 'rooms';
    }
  },
  { flush: 'sync' }
);

watch(
  () => messages.value.at(-1)?.id,
  async () => {
    const el = feed.value;
    const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    await nextTick();
    if (feed.value && atBottom) {
      scrollToBottom();
      await markVisible();
    }
  }
);
/**
 * 历史加载结束后补做可见已读检查：
 * markVisible 在 loading 期间会跳过，若加载完成时仍停留底部且页面可见，需重新判断。
 */
watch(loading, async (value) => {
  if (!value) {
    await nextTick();
    await markVisible();
  }
});
onMounted(() => {
  document.addEventListener('visibilitychange', markVisible);
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  disposed = true;
  feedResize?.disconnect();
  document.removeEventListener('visibilitychange', markVisible);
  document.removeEventListener('keydown', onKeydown);
});
/** Esc 关闭资料面板，移动端回到会话视图。 */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && showProfile.value) closeProfile();
}
</script>

<template>
  <main class="chat-page">
    <div class="chat-page__connection" :data-state="connectionState">
      <span class="chat-page__connection-label" role="status" aria-live="polite">
        <span class="chat-page__connection-dot" aria-hidden="true" />
        {{ connectionLabel }}
      </span>
      <UButton
        v-if="connectionState === 'disconnected'"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="run(() => reconnect())"
      >
        重新连接
      </UButton>
    </div>
    <div v-if="error" class="chat-page__alert" role="alert">
      <span class="chat-page__alert-text">{{ error }}</span>
      <div class="chat-page__alert-actions">
        <UButton size="xs" variant="ghost" @click="run(() => loadRooms())">重试列表</UButton>
        <UButton size="xs" variant="ghost" @click="run(() => reconnect())">重新连接</UButton>
      </div>
    </div>

    <div
      class="chat-page__layout"
      :class="{ 'chat-page__layout--profile': showProfile && activeRoom }"
      :data-mobile="mobileView"
    >
      <ChatRoomList
        :rooms="rooms"
        :active="active"
        :self="self"
        :loading="loading"
        :rooms-loading="roomsLoading"
        :has-more="hasRooms"
        :rooms-error="roomsError"
        class="chat-page__rooms"
        @select="openRoom(() => select($event), $event)"
        @open="openRoom(() => openPrivate($event))"
        @more="run(() => loadRooms(true))"
        @retry="run(() => loadRooms())"
      />

      <section class="chat-page__conversation" aria-label="会话消息">
        <template v-if="activeRoom">
          <header class="chat-conversation__header">
            <UButton
              class="chat-conversation__back"
              variant="ghost"
              color="neutral"
              icon="i-lucide-arrow-left"
              aria-label="返回会话列表"
              @click="mobileView = 'rooms'"
            />
            <button
              type="button"
              class="chat-conversation__peer"
              :aria-label="`查看${title}的资料`"
              :title="peer && peer.id != null ? `用户 ID ${peer.id}` : undefined"
              @click="openProfile"
            >
              <ChatAvatar
                :participant="peer"
                :name="title"
                :group="activeRoom.type === 'group'"
                size="sm"
                show-status
              />
              <span class="chat-conversation__peer-copy">
                <strong>{{ title }}</strong>
                <small>{{ presenceLabel }}</small>
              </span>
            </button>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-info"
              class="chat-conversation__info"
              aria-label="查看会话资料"
              @click="openProfile"
            />
          </header>

          <div ref="feed" class="chat-feed" @scroll="onFeedScroll">
            <p v-if="hasHistory === null" class="chat-feed__pagination" role="status">
              分页信息：{{ CHAT_MISSING }}
            </p>
            <UButton
              v-if="canLoadHistory"
              :loading="loading"
              variant="ghost"
              size="xs"
              class="chat-feed__history"
              @click="run(() => history(true))"
            >
              {{ hasHistory === null ? '尝试加载更早消息' : '加载更早消息' }}
            </UButton>
            <p v-if="loading" class="chat-feed__loading" role="status">正在加载消息…</p>
            <div v-else-if="historyError" class="chat-feed__empty" role="alert">
              <p>消息加载失败：{{ historyError }}</p>
              <UButton size="xs" variant="ghost" @click="run(() => history())">重试</UButton>
            </div>
            <p v-else-if="!messages.length" class="chat-feed__empty">还没有消息，说点什么吧。</p>
            <TransitionGroup
              v-if="messages.length"
              name="chat-bubble"
              tag="div"
              class="chat-bubble-group"
              appear
            >
              <article
                v-for="message in messages"
                :key="message.id"
                class="chat-bubble"
                :class="{
                  'chat-bubble--own': message.is_own === true,
                  'chat-bubble--unknown': typeof message.is_own !== 'boolean'
                }"
              >
                <small v-if="typeof message.is_own !== 'boolean'" class="chat-bubble__ownership">
                  消息归属：{{ CHAT_MISSING }}
                </small>
                <small
                  v-if="message.is_own !== true && activeRoom.type === 'group'"
                  class="chat-bubble__sender"
                >
                  {{ getChatText(message.sender?.name) }}
                </small>
                <p class="chat-bubble__content">{{ getChatText(message.content) }}</p>
                <time class="chat-bubble__time" :datetime="message.created_at ?? undefined">
                  {{ formatChatTime(message.created_at) }}
                </time>
              </article>
            </TransitionGroup>
            <article
              v-for="(item, id) in pending"
              v-show="item.room === active"
              :key="id"
              class="chat-bubble chat-bubble--own chat-bubble--pending"
            >
              <p class="chat-bubble__content">{{ item.text }}</p>
              <small class="chat-bubble__status">{{ item.status }}</small>
            </article>
          </div>

          <form class="chat-composer" @submit.prevent="sendMessage">
            <UTextarea
              v-model="draft"
              aria-label="消息内容"
              placeholder="输入消息，回车发送"
              class="chat-composer__input"
              :rows="2"
              @keydown="onComposerKeydown"
            />
            <UButton type="submit" icon="i-lucide-send" :disabled="!canSend" aria-label="发送消息">
              发送
            </UButton>
          </form>
        </template>
        <div v-else class="chat-page__empty">
          <UIcon name="i-lucide-messages-square" class="chat-page__empty-icon" aria-hidden="true" />
          <strong>选择会话开始聊天</strong>
          <p>从左侧会话列表选择，或发起一段新的私聊。</p>
        </div>
      </section>

      <Transition name="chat-panel">
        <ChatUserPanel
          v-if="activeRoom"
          :visible="showProfile"
          :room="activeRoom"
          :self="self"
          :participant="panelParticipant"
          class="chat-page__panel"
          @close="closeProfile"
          @inspect="inspected = $event"
        />
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px 12px max(16px, env(safe-area-inset-bottom));
  overflow: hidden;
  box-sizing: border-box;
}

.chat-page__connection {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  margin-bottom: 10px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--fg-muted);
  background: var(--surface);
  font-size: 12px;
}

.chat-page__connection-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.chat-page__connection-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--fg-muted);
}

.chat-page__connection[data-state='connected'] .chat-page__connection-dot {
  background: var(--brand);
}

.chat-page__connection[data-state='connecting'] .chat-page__connection-dot {
  background: var(--accent);
}

.chat-page__alert {
  flex: none;
  max-height: 22dvh;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--ui-error, #e11d48) 32%, transparent);
  border-radius: 12px;
  color: var(--fg);
  background: color-mix(in srgb, var(--ui-error, #e11d48) 8%, transparent);
  font-size: 13px;
}

.chat-page__alert-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.chat-page__alert-actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
}

.chat-page__layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.chat-page__layout--profile {
  grid-template-columns: 280px minmax(0, 1fr) 264px;
}

.chat-page__rooms,
.chat-page__conversation,
.chat-page__panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.chat-page__rooms {
  border-right: 1px solid var(--line);
}

.chat-page__panel {
  display: none;
  width: 100%;
  border-left: 1px solid var(--line);
}

.chat-page__panel :deep(.chat-user-panel) {
  width: 100%;
}

@media (min-width: 1024px) {
  .chat-page__layout--profile .chat-page__panel {
    display: flex;
  }
}

.chat-page__conversation {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
}

.chat-conversation__header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 72px;
  padding: 12px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--line);
}

.chat-conversation__header :deep(.chat-conversation__back) {
  display: none;
  flex: none;
}

.chat-conversation__header :deep(.chat-conversation__back),
.chat-conversation__header :deep(.chat-conversation__info) {
  width: 44px;
  height: 44px;
  flex: none;
  justify-content: center;
  padding: 0;
}
.chat-conversation__peer {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 12px;
  color: var(--fg);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.chat-conversation__peer:hover {
  background: var(--surface-muted);
}

.chat-conversation__peer:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.chat-conversation__peer-copy {
  min-width: 0;
}

.chat-conversation__peer-copy strong {
  display: block;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-conversation__peer-copy small {
  display: block;
  margin-top: 2px;
  color: var(--fg-muted);
  font-size: 12px;
}

.chat-feed {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.chat-feed__history,
.chat-feed__pagination,
.chat-feed__loading,
.chat-feed__empty {
  align-self: center;
  margin: 0;
}

.chat-feed__pagination,
.chat-feed__loading,
.chat-feed__empty {
  color: var(--fg-muted);
  font-size: 13px;
}

.chat-bubble {
  align-self: flex-start;
  max-width: min(78%, 560px);
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 16px;
  border-bottom-left-radius: 6px;
  background: var(--surface-muted);
  overflow-wrap: anywhere;
}

.chat-bubble--own {
  align-self: flex-end;
  border: 1px solid transparent;
  border-bottom-right-radius: 6px;
  color: var(--on-brand, #fff);
  background: var(--brand);
}

.chat-bubble--unknown {
  align-self: center;
  border-bottom-left-radius: 16px;
}

.chat-bubble__sender,
.chat-bubble__ownership {
  display: block;
  margin-bottom: 4px;
  color: var(--fg-muted);
  font-size: 11px;
}

.chat-bubble__content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.chat-bubble__time,
.chat-bubble__status {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.72;
}

.chat-bubble--pending {
  opacity: 0.78;
}

.chat-composer {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.chat-composer :deep(button) {
  min-height: 44px;
  flex: none;
  justify-content: center;
  padding-inline: 14px;
}
.chat-page .chat-page__panel {
  overflow-y: auto;
  overscroll-behavior: contain;
}
.chat-composer:focus-within {
  border-top-color: color-mix(in srgb, var(--accent) 42%, transparent);
}

.chat-composer :deep(.chat-composer__input) {
  flex: 1;
  min-width: 0;
}

.chat-composer :deep(textarea) {
  border-radius: 12px;
  min-height: 52px;
  font-size: 16px;
  line-height: 1.5;
  max-height: min(160px, 25dvh);
  overflow-y: auto;
}

.chat-page__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: var(--fg-muted);
  text-align: center;
}

.chat-page__empty-icon {
  width: 34px;
  height: 34px;
  margin-bottom: 4px;
  color: var(--accent);
}

.chat-page__empty strong {
  color: var(--fg);
  font-size: 15px;
}

.chat-page__empty p {
  margin: 0;
  font-size: 13px;
}

@media (max-width: 1023px) {
  .chat-page {
    padding: 8px 12px max(12px, env(safe-area-inset-bottom));
  }

  .chat-page__layout,
  .chat-page__layout--profile {
    display: block;
    min-height: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .chat-page__rooms,
  .chat-page__conversation,
  .chat-page__panel {
    display: none;
    height: 100%;
    border: 1px solid var(--line);
    border-radius: 18px;
    overflow: hidden;
    background: var(--surface);
    box-shadow: var(--shadow-soft);
  }

  .chat-page__layout[data-mobile='rooms'] .chat-page__rooms,
  .chat-page__layout[data-mobile='conversation'] .chat-page__conversation {
    display: flex;
  }

  .chat-page__layout--profile[data-mobile='profile'] .chat-page__panel {
    display: flex;
  }

  .chat-conversation__header :deep(.chat-conversation__back) {
    display: inline-flex;
  }
}

/* 页面与区块进入动效 */
@keyframes chat-layout-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

@keyframes chat-view-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes chat-empty-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.chat-page__layout {
  animation: chat-layout-in 0.38s ease both;
}

.chat-bubble-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 消息进入与列表位移 */
.chat-bubble-group .chat-bubble-enter-active,
.chat-bubble-group .chat-bubble-appear-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.chat-bubble-group .chat-bubble-enter-from,
.chat-bubble-group .chat-bubble-appear-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.chat-bubble-group .chat-bubble-move {
  transition: transform 0.28s ease;
}

.chat-bubble {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.chat-bubble:hover {
  transform: translateY(-1px);
}

/* 资料面板滑入 */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.chat-page__empty-icon {
  animation: chat-empty-float 3.2s ease-in-out infinite;
}

@media (max-width: 1023px) {
  .chat-page__rooms,
  .chat-page__conversation,
  .chat-page__panel {
    animation: chat-view-in 0.26s ease both;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chat-page__layout,
  .chat-page__rooms,
  .chat-page__conversation,
  .chat-page__panel,
  .chat-page__empty-icon,
  .chat-bubble,
  .chat-composer,
  .chat-panel-enter-active,
  .chat-panel-leave-active,
  .chat-bubble-group .chat-bubble-enter-active,
  .chat-bubble-group .chat-bubble-appear-active,
  .chat-bubble-group .chat-bubble-move {
    animation: none;
    transition: none;
  }
}
</style>
