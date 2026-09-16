<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import { useCollectionApi, type CollectionCharacter } from '~/composables/api/collection';

/**
 * 角色图鉴页
 * - 收集进度：Hero + 圆环计数
 * - 图鉴墙：按 IP 分组，已收集 = 剪贴卡（光面 + 收集印记），未收集 = 打孔卡（剪影 + ？？？）
 * - 已收集可取消收集（乐观更新，失败回滚）
 * 视觉：皮肤驱动 —— 颜色全部引用 --skin-* 变量（profile-skins.css），
 * 由 useProfileSkin 切换 macaron（马卡龙弥散光）/ mint（薄荷洗色）
 */
const { getCollection, toggle } = useCollectionApi();
const toast = useToast();

const isLoading = ref(true);
const error = ref(false);
const characters = ref<CollectionCharacter[]>([]);
const total = ref(0);
const collectedCount = ref(0);
const togglingIds = ref(new Set<number>());

/** IP 分组（保持后端顺序） */
const grouped = computed(() => {
  const map = new Map<string, CollectionCharacter[]>();
  for (const c of characters.value) {
    if (!map.has(c.brand)) map.set(c.brand, []);
    map.get(c.brand)!.push(c);
  }
  return [...map.entries()].map(([brand, list]) => ({
    brand,
    list,
    collected: list.filter((c) => c.collected).length
  }));
});

/** 收集进度百分比 */
const progressPercent = computed(() =>
  total.value === 0 ? 0 : Math.round((collectedCount.value / total.value) * 100)
);

/** 进度环参数（SVG 圆环） */
const RING_RADIUS = 54;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

/** 每组收集百分比（用于分组头进度微条） */
const groupPercent = (g: { collected: number; list: CollectionCharacter[] }) =>
  g.list.length === 0 ? 0 : Math.round((g.collected / g.list.length) * 100);

/** 加载图鉴数据 */
const loadCollection = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await getCollection();
    characters.value = data?.characters || [];
    total.value = data?.total || 0;
    collectedCount.value = data?.collected_count || 0;
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

/** 切换收集状态（乐观更新，失败回滚） */
const handleToggle = async (c: CollectionCharacter) => {
  if (togglingIds.value.has(c.id)) return;
  togglingIds.value.add(c.id);

  const prev = c.collected;
  c.collected = !c.collected;
  collectedCount.value += c.collected ? 1 : -1;

  try {
    await toggle(c.id);
    toast.add({
      id: 'collection-toggle',
      title: c.collected ? `已收集「${c.name}」` : `已取消收集「${c.name}」`,
      color: 'success'
    });
  } catch {
    // 回滚
    c.collected = prev;
    collectedCount.value += prev ? 1 : -1;
    toast.add({ id: 'collection-error', title: '操作失败，请稍后重试', color: 'error' });
  } finally {
    togglingIds.value.delete(c.id);
  }
};

useSeoMeta({ title: '角色图鉴 - YouMi 角色百科' });

onMounted(loadCollection);
</script>

<template>
  <div>
    <PageHeader title="角色图鉴" subtitle="收集你遇见过的每一个角色" class="mt-2" />

    <!-- 加载中 -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle" />
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-fg-subtle mb-4" />
      <p class="text-fg-muted mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadCollection">重试</UButton>
    </div>

    <template v-else>
      <!-- 收集进度 Hero：薄荷渐变洗色 -->
      <section class="hero relative overflow-hidden rounded-3xl">
        <div class="hero-blob hero-blob--a" aria-hidden="true" />
        <div class="hero-blob hero-blob--b" aria-hidden="true" />
        <div class="hero-dots" aria-hidden="true" />

        <div class="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-7">
          <!-- 进度环 -->
          <div class="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 128 128" class="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                :r="RING_RADIUS"
                fill="none"
                stroke="currentColor"
                class="ring-track"
                stroke-width="11"
              />
              <circle
                cx="64"
                cy="64"
                :r="RING_RADIUS"
                fill="none"
                stroke="currentColor"
                class="ring-fill"
                stroke-width="11"
                stroke-linecap="round"
                :stroke-dasharray="RING_CIRC"
                :stroke-dashoffset="RING_CIRC * (1 - progressPercent / 100)"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-extrabold hero-num"
                >{{ progressPercent }}<span class="text-base font-bold">%</span></span
              >
              <span class="text-[11px] hero-num-sub mt-0.5">已收集</span>
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left">
            <p class="text-lg font-bold hero-ink">
              已收集 <span class="text-2xl hero-num">{{ collectedCount }}</span> /
              {{ total }} 位角色
            </p>
            <p class="text-sm hero-ink-sub mt-1.5 leading-relaxed">
              浏览角色详情并收藏，即可点亮图鉴。集齐整个系列会盖上纪念印章。
            </p>
          </div>
        </div>
      </section>

      <!-- 图鉴墙（按 IP 分组） -->
      <div v-for="group in grouped" :key="group.brand" class="mt-9">
        <!-- 分组头：IP 名 + 进度微条 + 集齐印章 -->
        <div class="group-head">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-base font-semibold text-fg flex items-center gap-2.5">
              <span class="group-dot" aria-hidden="true" />
              {{ group.brand }}
              <span v-if="group.collected === group.list.length" class="stamp">
                <span class="i-carbon-checkmark-filled w-3 h-3" />
                已集齐
              </span>
            </h2>
            <span class="group-count tabular-nums">
              {{ group.collected }}<span class="group-count-sep">/</span>{{ group.list.length }}
              <span class="group-count-pct">{{ groupPercent(group) }}%</span>
            </span>
          </div>
          <!-- 收集进度微条：随完成度点亮品牌渐变 -->
          <div class="group-track">
            <div
              class="group-fill"
              :class="{ 'group-fill--full': group.collected === group.list.length }"
              :style="{ width: `${groupPercent(group)}%` }"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <template v-for="c in group.list" :key="c.id">
            <!-- 单张图鉴卡 -->
            <div
              class="card group/card relative rounded-2xl transition-all duration-300"
              :class="c.collected ? 'card--got' : 'card--miss'"
            >
              <NuxtLink
                :to="`/products/${c.code || c.id}`"
                class="block px-2.5 pt-3.5 pb-3 text-center"
              >
                <!-- 头像位 -->
                <div class="card-orb" :class="c.collected ? 'card-orb--got' : 'card-orb--miss'">
                  <span v-if="c.collected" class="text-lg font-bold">{{
                    c.name?.slice(0, 1)
                  }}</span>
                  <span v-else class="i-carbon-locked w-5 h-5" />
                </div>
                <p class="card-name" :class="c.collected ? 'text-fg' : 'card-name--miss'">
                  {{ c.collected ? c.name : '？？？' }}
                </p>
                <!-- 职业小胶囊：已收集显示角色定位，未收集显示神秘提示 -->
                <p v-if="c.collected" class="card-tag">{{ c.character_type }}</p>
                <p v-else class="card-tag card-tag--miss">未遇见</p>
              </NuxtLink>

              <!-- 收集 / 取消收集按钮：悬浮才出现，避免抢眼 -->
              <button
                class="card-btn"
                :class="c.collected ? 'card-btn--off' : 'card-btn--on'"
                :disabled="togglingIds.has(c.id)"
                :aria-label="c.collected ? '取消收集' : '收集'"
                @click.stop="handleToggle(c)"
              >
                <span
                  :class="
                    c.collected
                      ? 'i-carbon-favorite-filled w-3.5 h-3.5'
                      : 'i-carbon-favorite w-3.5 h-3.5'
                  "
                />
              </button>

              <!-- 收集印记：已收集卡左上角小徽章 -->
              <span v-if="c.collected" class="card-mark" aria-hidden="true">
                <span class="i-carbon-checkmark-filled w-2.5 h-2.5" />
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 空态 -->
      <div v-if="characters.length === 0" class="text-center py-20">
        <div
          class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
        >
          <span class="i-carbon-grid text-4xl text-fg-subtle" />
        </div>
        <p class="text-fg font-medium mb-1">图鉴还是空的</p>
        <p class="text-sm text-fg-subtle">
          去
          <NuxtLink to="/products" class="text-skin hover:underline">角色图鉴列表</NuxtLink>
          遇见你的第一个角色吧
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================
 * 皮肤驱动样式：颜色全部引用全局 --skin-* 变量
 * （app/assets/css/profile-skins.css；由 useProfileSkin 写入
 *  <html data-profile-skin="macaron|mint"> 切换，亮暗自动适配）
 * 与 checkin.vue 共用同一套视觉语言
 * ============================================================ */
.hero {
  background: var(--skin-hero-bg);
}

/* Hero 装饰弥散光球：大球 + 小球（颜色随皮肤） */
.hero-blob {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(2px);
}
.hero-blob--a {
  width: 240px;
  height: 240px;
  top: -80px;
  right: -50px;
  background: var(--skin-blob-a);
}
.hero-blob--b {
  width: 160px;
  height: 160px;
  bottom: -60px;
  left: 20%;
  background: var(--skin-blob-b);
}
.hero-dots {
  position: absolute;
  top: 14px;
  right: 150px;
  width: 150px;
  height: 90px;
  pointer-events: none;
  background-image: radial-gradient(circle, var(--skin-dots-color) 1.5px, transparent 1.5px);
  background-size: 13px 13px;
  -webkit-mask-image: linear-gradient(to bottom left, #000, transparent 75%);
  mask-image: linear-gradient(to bottom left, #000, transparent 75%);
}

.hero-ink {
  color: var(--skin-ink);
}
.hero-ink-sub {
  color: var(--skin-ink-sub);
}
.hero-num {
  color: var(--skin-ink);
}
.hero-num-sub {
  color: var(--skin-ink-sub);
}

/* 进度环：轨道半透明主色，填充皮肤实色 */
.ring-track {
  color: rgb(var(--skin-accent-rgb) / 0.15);
}
.ring-fill {
  color: var(--skin-dot);
  filter: drop-shadow(0 2px 6px rgb(var(--skin-accent-rgb) / 0.4));
  transition: stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- 分组头 ---------- */
.group-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--skin-solid);
  box-shadow: 0 0 0 3px var(--skin-ring-halo);
}

/* 分组计数：收集数高亮 + 分隔符/百分比弱化 */
.group-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--skin-ink-strong);
}
.group-count-sep {
  color: var(--fg-subtle);
  font-weight: 400;
  padding: 0 1px;
}
.group-count-pct {
  margin-left: 0.4rem;
  padding: 0.08rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--skin-ink-strong);
  background: var(--skin-chip-bg);
}

/* 分组进度微条：集齐时整条点亮并泛光 */
.group-track {
  height: 4px;
  border-radius: 9999px;
  overflow: hidden;
  background: var(--surface-muted);
}
.group-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--skin-fill-soft);
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.group-fill--full {
  background: var(--skin-fill-gradient);
  box-shadow: 0 0 8px rgb(var(--skin-accent-rgb) / 0.45);
}

/* 集齐印章：旋转 6° 的描边章（皮肤渐变底） */
.stamp {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--skin-ink-strong);
  border: 1.5px solid var(--skin-chip-border);
  background: var(--skin-card-gradient);
  transform: rotate(-4deg);
}

/* ---------- 图鉴卡 ---------- */
/* 已收集：光面卡（皮肤渐变） */
.card--got {
  background: var(--skin-card-gradient);
  box-shadow: var(--skin-shadow-sm);
}
.card--got:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgb(var(--skin-accent-rgb) / 0.18);
}

/* 未收集：打孔卡（虚线边 + 灰底剪影） */
.card--miss {
  border: 1.5px dashed var(--line-strong);
  background: var(--surface-muted);
  opacity: 0.8;
}
.card--miss:hover {
  border-color: var(--skin-dot);
  opacity: 1;
}

/* 头像位 */
.card-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 0.5rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
}
.card-orb--got {
  color: var(--skin-ink-on);
  background: var(--skin-solid);
  box-shadow: var(--skin-solid-shadow);
}
.card--got:hover .card-orb--got {
  transform: scale(1.08);
}
.card-orb--miss {
  color: var(--fg-subtle);
  background: var(--surface);
  filter: grayscale(1);
}

/* 名称 */
.card-name {
  font-size: 0.78rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-name--miss {
  color: var(--fg-subtle);
  opacity: 0.6;
}

/* 职业小胶囊：已收集 = 玻璃底皮肤主色字；未收集 = 灰底神秘提示 */
.card-tag {
  display: inline-block;
  max-width: 100%;
  margin-top: 0.4rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.62rem;
  color: var(--skin-ink-strong);
  background: var(--skin-glass);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-tag--miss {
  color: var(--fg-subtle);
  background: var(--surface-muted);
}

/* 收集按钮：小圆钮，悬浮才浮现（常态隐藏降低视觉噪音） */
.card-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  opacity: 0;
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
.card:hover .card-btn,
.card-btn:focus-visible {
  opacity: 1;
  transform: translateY(0);
}
.card-btn--on {
  color: var(--fg-subtle);
  background: var(--surface);
  border: 1px solid var(--line);
}
.card-btn--on:hover {
  color: var(--skin-ink-strong);
  border-color: var(--skin-chip-border);
  background: var(--skin-chip-hover);
}
.card-btn--off {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
.card-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 收集印记：已收集卡左上角皮肤主色小徽章 */
.card-mark {
  position: absolute;
  top: -4px;
  left: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  color: var(--skin-ink-on);
  background: var(--skin-solid);
  box-shadow: 0 2px 8px rgb(var(--skin-accent-rgb) / 0.4);
}
</style>
