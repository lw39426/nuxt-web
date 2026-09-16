<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import { useCheckinApi, type CheckinStatus } from '~/composables/api/checkin';

/**
 * 每日签到页
 * - Hero 状态卡（连续天数 / 积分 / 一键签到）
 * - 当月打卡日历（已签 / 今日 / 未来 / 周末着色）
 * - 奖励梯度 + 里程碑徽章
 * 视觉：皮肤驱动 —— 颜色全部引用 --skin-* 变量（profile-skins.css），
 * 由 useProfileSkin 切换 macaron（马卡龙弥散光）/ mint（薄荷洗色）
 */
const { getStatus, doCheckin } = useCheckinApi();
const toast = useToast();

const isLoading = ref(true);
const error = ref(false);
const isCheckingIn = ref(false);
const status = ref<CheckinStatus | null>(null);

/** 当前展示的月份（默认当月） */
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth()); // 0-based

const today = new Date();
const todayStr = formatDate(today);

/** 已签日期集合（快速查表） */
const checkinSet = computed(() => new Set(status.value?.checkin_dates || []));

/** 加载签到状态 */
const loadStatus = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    status.value = await getStatus();
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

/** 执行签到：成功后刷新状态并 Toast 反馈 */
const handleCheckin = async () => {
  if (isCheckingIn.value || status.value?.checked_today) return;
  isCheckingIn.value = true;
  try {
    const result = await doCheckin();
    status.value = result;
    toast.add({
      id: 'checkin-success',
      title: `签到成功 +${result.earned_points} 积分`,
      description: `已连续签到 ${result.streak_days} 天`,
      color: 'success'
    });
  } catch (e: any) {
    // 409 = 重复签到，刷新状态即可
    if (e?.code === 409) {
      await loadStatus();
      toast.add({ id: 'checkin-dup', title: '今天已经签到过了', color: 'neutral' });
    } else {
      toast.add({ id: 'checkin-error', title: '签到失败，请稍后重试', color: 'error' });
    }
  } finally {
    isCheckingIn.value = false;
  }
};

/** 月份切换（禁用未来月份） */
const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
};
const nextMonth = () => {
  const now = new Date();
  if (viewYear.value === now.getFullYear() && viewMonth.value === now.getMonth()) return;
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
};

/** 日历单元格（weekday 1-7，周一起） */
interface CalCell {
  day: number;
  dateStr: string;
  checked: boolean;
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
}

/** 日历网格：月初补位 + 当月每一天 */
const calendarCells = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1);
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  // JS getDay: 0=周日；转成周一开头的偏移
  const offset = (firstDay.getDay() + 6) % 7;
  const cells: (null | CalCell)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = ((offset + d - 1) % 7) + 1;
    const dateStr = formatDate(new Date(viewYear.value, viewMonth.value, d));
    cells.push({
      day: d,
      dateStr,
      checked: checkinSet.value.has(dateStr),
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isWeekend: weekday >= 6
    });
  }
  return cells;
});

/** 当月已签天数 */
const monthCheckedCount = computed(() => calendarCells.value.filter((c) => c?.checked).length);

/** 距下一梯度还差几天（全部达成则取最大梯度） */
const nextTier = computed(() => {
  const tiers = status.value?.reward_tiers || [];
  const streak = status.value?.streak_days || 0;
  return tiers.find((t) => t.days > streak) || null;
});

/** 里程碑轨道进度：当前连续天数在梯度区间中的填充比例（0-100） */
const tierProgressPercent = computed(() => {
  const tiers = status.value?.reward_tiers || [];
  const streak = status.value?.streak_days || 0;
  if (tiers.length === 0) return 0;
  const maxDays = tiers[tiers.length - 1].days;
  return Math.min(Math.round((streak / maxDays) * 100), 100);
});

/** 里程碑进度百分比（以最大梯度 30 天为满格） */
const streakPercent = computed(() => {
  const streak = status.value?.streak_days || 0;
  return Math.min(Math.round((streak / 30) * 100), 100);
});

/** 日期格式化为 YYYY-MM-DD */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

useSeoMeta({ title: '每日签到 - YouMi 角色百科' });

onMounted(loadStatus);
</script>

<template>
  <div>
    <PageHeader title="每日签到" subtitle="坚持打卡，积攒属于你的角色积分" class="mt-2" />

    <!-- 加载中 -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle" />
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-fg-subtle mb-4" />
      <p class="text-fg-muted mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadStatus">重试</UButton>
    </div>

    <div v-else-if="status" class="space-y-6">
      <!-- 签到状态 Hero：薄荷渐变洗色 -->
      <section class="hero relative overflow-hidden rounded-3xl">
        <div class="hero-blob hero-blob--a" aria-hidden="true" />
        <div class="hero-blob hero-blob--b" aria-hidden="true" />
        <div class="hero-dots" aria-hidden="true" />

        <div class="relative p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <!-- 连续天数 -->
            <div class="flex items-center gap-4">
              <div class="streak-box">
                <span class="text-3xl font-extrabold leading-none hero-num">{{
                  status.streak_days
                }}</span>
                <span class="text-[11px] hero-num-sub mt-1">天</span>
              </div>
              <div>
                <p class="font-bold text-lg hero-ink">连续签到</p>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span class="hero-chip">累计 {{ status.total_points }} 积分</span>
                  <span class="hero-chip">本月已签 {{ monthCheckedCount }} 天</span>
                </div>
              </div>
            </div>

            <div class="flex-1" />

            <!-- 签到按钮 -->
            <button
              class="checkin-btn"
              :class="{ 'checkin-btn--done': status.checked_today }"
              :disabled="status.checked_today || isCheckingIn"
              @click="handleCheckin"
            >
              <span
                :class="
                  status.checked_today ? 'i-carbon-checkmark-filled' : 'i-carbon-calendar-check'
                "
                class="w-5 h-5"
              />
              <span v-if="isCheckingIn" class="i-carbon-circle-dash w-5 h-5 animate-spin" />
              <span v-else>{{ status.checked_today ? '今日已签到' : '立即签到' }}</span>
            </button>
          </div>

          <!-- 连续签到进度 -->
          <div class="mt-7">
            <div class="flex items-center justify-between text-xs hero-ink-sub mb-2">
              <span>连续签到进度</span>
              <span v-if="nextTier"
                >再签 {{ nextTier.days - status.streak_days }} 天可领
                {{ nextTier.points }} 积分</span
              >
              <span v-else>已达最高梯度，保持下去！</span>
            </div>
            <div class="hero-track">
              <div class="hero-fill" :style="{ width: `${streakPercent}%` }" />
            </div>
          </div>
        </div>
      </section>

      <!-- 打卡日历（小而美） -->
      <ProfileCard title="打卡日历">
        <div class="p-5 sm:p-6">
          <!-- 月份切换 -->
          <div class="flex items-center justify-between mb-5">
            <button class="cal-nav" aria-label="上一月" @click="prevMonth">
              <span class="i-carbon-chevron-left w-3.5 h-3.5" />
            </button>
            <span class="text-sm font-semibold text-fg tracking-wide"
              >{{ viewYear }} 年 {{ viewMonth + 1 }} 月</span
            >
            <button
              class="cal-nav"
              :disabled="viewYear === today.getFullYear() && viewMonth === today.getMonth()"
              aria-label="下一月"
              @click="nextMonth"
            >
              <span class="i-carbon-chevron-right w-3.5 h-3.5" />
            </button>
          </div>

          <!-- 星期表头（周一起） -->
          <div class="grid grid-cols-7 mb-2.5">
            <div
              v-for="w in ['一', '二', '三', '四', '五', '六', '日']"
              :key="w"
              class="text-center text-[10px] text-fg-subtle py-1 tracking-widest"
            >
              {{ w }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(cell, i) in calendarCells" :key="i" class="h-10 sm:h-11">
              <div
                v-if="cell"
                class="cal-cell"
                :class="{
                  'cal-cell--checked': cell.checked,
                  'cal-cell--today': cell.isToday,
                  'cal-cell--future': cell.isFuture && !cell.checked,
                  'cal-cell--weekend': cell.isWeekend && !cell.checked && !cell.isFuture
                }"
                :title="cell.dateStr"
              >
                {{ cell.day }}
                <!-- 今日角标：一个“今”字 -->
                <span v-if="cell.isToday && !cell.checked" class="cal-today-badge">今</span>
              </div>
            </div>
          </div>

          <!-- 图例 -->
          <div class="cal-legend">
            <span class="cal-legend-item"><i class="lg-dot lg-dot--mint" />已签到</span>
            <span class="cal-legend-item"><i class="lg-dot lg-dot--amber" />今日待签</span>
            <span class="cal-legend-item"><i class="lg-dot lg-dot--sky" />周末</span>
          </div>
        </div>
      </ProfileCard>

      <!-- 奖励梯度 + 徽章 -->
      <ProfileCard title="奖励规则">
        <div class="p-5 sm:p-6 space-y-9">
          <!-- 连续签到奖励梯度：里程碑轨道（进度线 + 节点） -->
          <div>
            <p class="text-sm text-fg-muted mb-5">
              连续签到天数越长，每日奖励越丰厚（断签后重新计数）
            </p>
            <div class="tier-track">
              <!-- 背景进度线：已达成部分点亮品牌渐变 -->
              <div class="tier-line" aria-hidden="true">
                <div class="tier-line-fill" :style="{ width: tierProgressPercent + '%' }" />
              </div>

              <!-- 节点们：等距分布在进度线上 -->
              <div class="tier-nodes">
                <div
                  v-for="tier in status.reward_tiers"
                  :key="tier.days"
                  class="tier-node"
                  :class="{
                    'tier-node--on': (status.streak_days || 0) >= tier.days,
                    'tier-node--next': nextTier?.days === tier.days
                  }"
                >
                  <div class="tier-node-dot">
                    <span
                      v-if="(status.streak_days || 0) >= tier.days"
                      class="i-carbon-checkmark-filled w-3.5 h-3.5"
                    />
                    <span v-else class="tier-node-day">{{ tier.days }}</span>
                  </div>
                  <p class="tier-node-label">{{ tier.days }} 天</p>
                  <p class="tier-node-points">+{{ tier.points }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 里程碑徽章 -->
          <div>
            <p class="text-sm text-fg-muted mb-4">达成连续签到里程碑，解锁专属徽章</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="badge in status.badges"
                :key="badge.id"
                class="badge-card"
                :class="{ 'badge-card--on': badge.unlocked }"
              >
                <div class="badge-orb" :class="{ 'badge-orb--on': badge.unlocked }">
                  <span :class="[badge.icon, 'w-6 h-6']" />
                </div>
                <div class="text-center">
                  <p class="text-sm font-medium text-fg">{{ badge.name }}</p>
                  <p class="text-xs text-fg-subtle mt-0.5">连续 {{ badge.days }} 天</p>
                </div>
                <span v-if="badge.unlocked" class="badge-tag">已解锁</span>
              </div>
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
 * 皮肤驱动样式：颜色全部引用全局 --skin-* 变量
 * （app/assets/css/profile-skins.css；由 useProfileSkin 写入
 *  <html data-profile-skin="macaron|mint"> 切换，亮暗自动适配）
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

/* 点阵纹理：右上角网点，向左下淡出（颜色随皮肤） */
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

/* Hero 文字/组件色 */
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

/* 连续天数数字盒：白玻璃小卡 */
.streak-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--skin-glass);
  backdrop-filter: blur(8px);
  box-shadow:
    var(--skin-shadow-md),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

/* Hero 信息小胶囊 */
.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--wash-ink);
  background: var(--wash-card);
}

/* 签到按钮：玻璃底胶囊 + 皮肤主色文字；已签到态退化为半透明 */
.checkin-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--skin-accent);
  background: var(--skin-glass);
  backdrop-filter: blur(8px);
  box-shadow: var(--skin-shadow-btn);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}
.checkin-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgb(var(--skin-accent-rgb) / 0.3);
}
.checkin-btn:disabled {
  cursor: default;
}
.checkin-btn--done {
  color: rgb(var(--skin-accent-rgb) / 0.55);
  background: var(--skin-glass);
  box-shadow: none;
  opacity: 0.75;
}

/* Hero 进度条：半透明主色轨道 + 皮肤渐变填充 */
.hero-track {
  height: 8px;
  border-radius: 9999px;
  overflow: hidden;
  background: rgb(var(--skin-accent-rgb) / 0.15);
}
.hero-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--skin-fill-gradient);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- 打卡日历（小而美：淡彩底 + 数字下小圆点标记） ---------- */
.cal-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  color: var(--fg-subtle);
  background: var(--surface-muted);
  transition: all 0.2s ease;
}
.cal-nav:hover:not(:disabled) {
  color: var(--skin-ink-strong);
  background: var(--skin-chip-hover);
}
.cal-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 单元格：小号圆角片 + 日期数字下方 3px 状态点 */
.cal-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--fg-muted);
  background: transparent;
  transition: background-color 0.2s ease;
}
.cal-cell::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  transform: translateX(-50%);
  background: transparent;
  transition: background-color 0.2s ease;
}

/* 已签：皮肤淡色底 + 主题点，数字加深 */
.cal-cell--checked {
  color: var(--skin-ink-strong);
  font-weight: 700;
  background: var(--skin-chip-bg);
}
.cal-cell--checked::after {
  background: var(--skin-dot);
}

/* 今日（未签）：琥珀实底白字 + 呼吸光圈，一眼锁定 */
.cal-cell--today {
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow:
    0 3px 10px rgba(245, 158, 11, 0.4),
    0 0 0 0 rgba(245, 158, 11, 0.45);
  animation: today-pulse 2.4s ease-out infinite;
}
.cal-cell--today::after {
  background: rgba(255, 255, 255, 0.85);
}
.cal-cell--today .cal-today-badge {
  display: none;
}
/* 今日已签：转为皮肤实底渐变，白点 + 对勾角标 */
.cal-cell--today.cal-cell--checked {
  color: var(--skin-ink-on);
  background: var(--skin-solid);
  box-shadow:
    var(--skin-solid-shadow),
    0 0 0 2px rgba(255, 255, 255, 0.9);
}
.cal-cell--today.cal-cell--checked::after {
  background: var(--skin-ink-on);
}
.dark .cal-cell--today {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: today-pulse 2.4s ease-out infinite;
}

/* 今日呼吸光圈动画 */
@keyframes today-pulse {
  0% {
    box-shadow:
      0 3px 10px rgba(245, 158, 11, 0.4),
      0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  70% {
    box-shadow:
      0 3px 10px rgba(245, 158, 11, 0.4),
      0 0 0 6px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow:
      0 3px 10px rgba(245, 158, 11, 0.4),
      0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* “今”字角标（JS 动画不可用时的静态标识，正常被今日实底替代隐藏） */
.cal-today-badge {
  position: absolute;
  top: 2px;
  right: 3px;
  font-size: 8px;
  font-weight: 700;
  line-height: 1;
  color: #b45309;
}

/* 周末（未签）：淡天蓝底 + 极淡点 */
.cal-cell--weekend {
  color: #3f6f8f;
  background: #e8f5fc;
}
.cal-cell--weekend::after {
  background: rgba(96, 165, 250, 0.4);
}
.dark .cal-cell--weekend {
  color: var(--fg-muted);
  background: rgba(96, 165, 250, 0.08);
}

/* 普通日：悬浮时才出现极浅底 */
.cal-cell:not(.cal-cell--checked):not(.cal-cell--today):not(.cal-cell--future):not(
    .cal-cell--weekend
  ):hover {
  background: var(--surface-muted);
}

/* 未来日期：无底无点，弱化 */
.cal-cell--future {
  color: var(--fg-subtle);
  opacity: 0.4;
}

/* 图例 */
.cal-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.15rem;
  padding-top: 0.9rem;
  border-top: 1px dashed var(--line);
}
.cal-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  color: var(--fg-subtle);
}
.lg-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
}
.lg-dot--mint {
  background: var(--skin-dot);
}
.lg-dot--amber {
  background: #f59e0b;
}
.lg-dot--sky {
  background: rgba(96, 165, 250, 0.55);
}

/* ---------- 奖励梯度：里程碑轨道 ---------- */
.tier-track {
  position: relative;
  padding: 0 1.25rem;
}
/* 背景进度线：灰轨道 + 品牌渐变填充（首尾对齐节点圆心，节点实底会盖住线） */
.tier-line {
  position: absolute;
  top: 19px; /* 与节点圆心对齐（dot 高 38px 一半） */
  left: calc(1.25rem + 19px); /* 容器 padding + 节点半径 */
  right: calc(1.25rem + 19px);
  height: 6px;
  border-radius: 9999px;
  background: var(--surface-muted);
  z-index: 0;
}
.tier-line-fill {
  height: 100%;
  border-radius: 9999px;
  background: var(--skin-fill-gradient);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 节点列：等距（节点在上层，实底圆盖住穿过的进度线） */
.tier-nodes {
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: 1;
}
.tier-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  min-width: 44px;
}
/* 节点圆 */
.tier-node-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--fg-subtle);
  background: var(--surface);
  border: 2px solid var(--line-strong);
  transition: all 0.3s ease;
}
/* 未达节点内显示天数数字 */
.tier-node-day {
  font-size: 0.72rem;
}
/* 已达节点：皮肤实底渐变 + 对勾 + 泛光 */
.tier-node--on .tier-node-dot {
  color: var(--skin-ink-on);
  border-color: transparent;
  background: var(--skin-solid);
  box-shadow: var(--skin-solid-shadow);
}
/* 下一目标节点：琥珀虚线圈呼吸提示 */
.tier-node--next:not(.tier-node--on) .tier-node-dot {
  border-color: #f59e0b;
  border-style: dashed;
  color: #b45309;
  animation: tier-next-pulse 2.4s ease-out infinite;
}
.dark .tier-node--next:not(.tier-node--on) .tier-node-dot {
  color: #fbbf24;
}
/* 节点文字 */
.tier-node-label {
  font-size: 0.68rem;
  color: var(--fg-muted);
}
.tier-node-points {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--fg-subtle);
  font-variant-numeric: tabular-nums;
}
.tier-node--on .tier-node-label,
.tier-node--on .tier-node-points {
  color: var(--skin-ink-strong);
}

/* 下一目标呼吸动画 */
@keyframes tier-next-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.35);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(245, 158, 11, 0);
  }
}

/* ---------- 里程碑徽章 ---------- */
.badge-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.1rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: var(--surface-muted);
  opacity: 0.65;
  transition: all 0.3s ease;
}
.badge-card--on {
  opacity: 1;
  border-color: var(--skin-card-border);
  background: var(--skin-card-gradient);
}

.badge-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  color: var(--fg-subtle);
  background: var(--surface-muted);
}
.badge-orb--on {
  color: #ffffff;
  background: linear-gradient(135deg, #ffd76e, #f59e0b);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
}

.badge-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--skin-ink-on);
  background: var(--skin-solid);
}
</style>
