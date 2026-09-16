<script setup lang="ts">
import { useProfileSkin } from '~/composables/useProfileSkin';

/**
 * 皮肤切换器（两种形态）
 * - 完整模式（默认）：纵向色卡列表，每行 = 预览渐变 + 名称 + 描述，用于悬浮菜单面板
 * - 紧凑模式（compact）：横向渐变色卡并排，选中描边 + 对勾，用于侧边栏等空间紧凑场景
 * - 挂载时自恢复：从 localStorage 读取并写入 <html data-profile-skin>
 * - 状态由 useProfileSkin 单例管理，多处挂载共享同一份状态，切换即时生效并持久化
 */
const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const { skin, skins, setSkin, restore } = useProfileSkin();

onMounted(restore);
</script>

<template>
  <!-- 紧凑模式：横向渐变色卡 -->
  <div v-if="props.compact" class="flex gap-2">
    <button
      v-for="s in skins"
      :key="s.id"
      class="skin-dot"
      :class="{ 'skin-dot--on': skin === s.id }"
      :aria-pressed="skin === s.id"
      :aria-label="s.name"
      :title="`${s.name} · ${s.desc}`"
      @click="setSkin(s.id)"
    >
      <!-- 预览色卡：实底主色渐变 -->
      <span class="skin-dot-swatch" :style="{ background: s.preview }" />
      <!-- 当前皮肤对勾（白色居中叠加） -->
      <span v-if="skin === s.id" class="i-carbon-checkmark-filled skin-dot-check" />
    </button>
  </div>

  <!-- 完整模式：纵向色卡列表 -->
  <div v-else class="space-y-1.5">
    <button
      v-for="s in skins"
      :key="s.id"
      class="skin-chip"
      :class="{ 'skin-chip--on': skin === s.id }"
      :aria-pressed="skin === s.id"
      :title="s.desc"
      @click="setSkin(s.id)"
    >
      <!-- 预览色卡：实底主色渐变 -->
      <span class="skin-chip-swatch" :style="{ background: s.preview }" />
      <span class="min-w-0 flex-1 text-left">
        <span class="skin-chip-name">{{ s.name }}</span>
        <span class="skin-chip-desc">{{ s.desc }}</span>
      </span>
      <!-- 当前皮肤对勾 -->
      <span v-if="skin === s.id" class="i-carbon-checkmark-filled skin-chip-check" />
    </button>
  </div>
</template>

<style scoped>
/* ---------- 紧凑模式：横向色卡 ---------- */
/* 色卡按钮：灰底小圆角块，选中时皮肤主色描边 */
.skin-dot {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: var(--surface-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.skin-dot:hover {
  border-color: var(--skin-chip-border);
}
.skin-dot--on {
  border-color: var(--skin-accent);
}

/* 色卡本体：横向渐变条 */
.skin-dot-swatch {
  display: block;
  width: 100%;
  height: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.12);
}

/* 选中对勾：白色居中叠加在色卡上 */
.skin-dot-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.45));
}

/* ---------- 完整模式：纵向列表 ---------- */
/* 皮肤列表项：灰底小卡，选中时皮肤主色描边 */
.skin-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: var(--surface-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.skin-chip:hover {
  border-color: var(--skin-chip-border);
}
.skin-chip--on {
  border-color: var(--skin-chip-border);
  background: var(--skin-chip-bg);
}

/* 预览色卡：小圆角方块 */
.skin-chip-swatch {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.12);
  flex-shrink: 0;
}

/* 名称 + 描述（名称加粗，描述小字弱化） */
.skin-chip-name {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--fg-muted);
  white-space: nowrap;
}
.skin-chip-desc {
  display: block;
  font-size: 0.62rem;
  line-height: 1.3;
  color: var(--fg-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.skin-chip--on .skin-chip-name {
  color: var(--skin-ink-strong);
}

/* 选中对勾 */
.skin-chip-check {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--skin-accent);
}
</style>
