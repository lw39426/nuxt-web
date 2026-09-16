<script setup lang="ts">
interface SecurityItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'warning';
  action: string;
  icon: string;
}

interface LoginRecord {
  id: number;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  time: string;
  current: boolean;
}

const securityLevel = ref<'low' | 'medium' | 'high'>('medium');
const securityScore = ref(65);

const securityItems = ref<SecurityItem[]>([
  {
    id: 'password',
    title: '登录密码',
    description: '建议定期更换密码，提高账户安全性',
    status: 'completed',
    action: '修改',
    icon: 'i-carbon-lock'
  },
  {
    id: 'phone',
    title: '手机绑定',
    description: '已绑定手机号 138****8888',
    status: 'completed',
    action: '更换',
    icon: 'i-carbon-phone'
  },
  {
    id: 'email',
    title: '邮箱绑定',
    description: '未绑定邮箱，建议绑定以保障账户安全',
    status: 'pending',
    action: '绑定',
    icon: 'i-carbon-email'
  },
  {
    id: '2fa',
    title: '双重验证',
    description: '开启后登录需要额外验证，大幅提升安全性',
    status: 'pending',
    action: '开启',
    icon: 'i-carbon-shield'
  }
]);

const loginRecords = ref<LoginRecord[]>([
  {
    id: 1,
    device: 'MacBook Pro',
    browser: 'Chrome 128',
    os: 'macOS',
    location: '北京市海淀区',
    ip: '223.5.5.5',
    time: '刚刚',
    current: true
  },
  {
    id: 2,
    device: 'iPhone 15 Pro',
    browser: 'Safari 18',
    os: 'iOS 18',
    location: '北京市朝阳区',
    ip: '223.5.5.6',
    time: '2小时前',
    current: false
  },
  {
    id: 3,
    device: 'ThinkPad X1',
    browser: 'Edge 128',
    os: 'Windows 11',
    location: '上海市浦东新区',
    ip: '101.226.33.44',
    time: '昨天 09:15',
    current: false
  },
  {
    id: 4,
    device: 'iPad Air',
    browser: 'Safari 18',
    os: 'iPadOS 18',
    location: '广州市天河区',
    ip: '183.6.33.77',
    time: '8月20日 18:45',
    current: false
  }
]);

const getDeviceIcon = (os: string) => {
  if (os.includes('iOS') || os.includes('iPhone')) return 'i-carbon-mobile';
  if (os.includes('iPad')) return 'i-carbon-tablet';
  if (os.includes('macOS') || os.includes('Mac')) return 'i-carbon-mac';
  if (os.includes('Windows')) return 'i-carbon-laptop';
  return 'i-carbon-device';
};

const getBrowserIcon = (browser: string) => {
  if (browser.includes('Chrome')) return 'i-carbon-logo-chrome';
  if (browser.includes('Safari')) return 'i-carbon-logo-safari';
  if (browser.includes('Edge')) return 'i-carbon-logo-edge';
  if (browser.includes('Firefox')) return 'i-carbon-logo-firefox';
  return 'i-carbon-globe';
};

const levelConfig = computed(() => {
  const map = {
    low: {
      label: '低',
      color: 'text-red-500',
      barColor: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      icon: 'i-carbon-warning-filled'
    },
    medium: {
      label: '中',
      color: 'text-amber-500',
      barColor: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'i-carbon-information'
    },
    high: {
      label: '高',
      color: 'text-green-500',
      barColor: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: 'i-carbon-checkmark-filled'
    }
  };
  return map[securityLevel.value];
});

const completedCount = computed(
  () => securityItems.value.filter((i) => i.status === 'completed').length
);
</script>

<template>
  <div>
    <PageHeader title="账号安全" subtitle="保护您的账户安全，防范风险" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左列：安全等级 + 安全设置 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 安全等级卡片 -->
        <div class="bg-surface rounded-2xl shadow-sm overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-4">
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center"
                  :class="levelConfig.bgColor"
                >
                  <span :class="[levelConfig.icon, 'w-8 h-8', levelConfig.color]" />
                </div>
                <div>
                  <p class="text-sm text-fg-subtle mb-1">安全等级</p>
                  <p :class="[levelConfig.color, 'text-3xl font-bold']">{{ levelConfig.label }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-4xl font-bold text-fg">
                  {{ securityScore }}
                </p>
                <p class="text-sm text-fg-subtle">安全分</p>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="h-2.5 bg-surfaceMuted rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :class="levelConfig.barColor"
                :style="{ width: `${securityScore}%` }"
              />
            </div>

            <p class="text-xs text-fg-subtle mt-3">
              已完成 <span class="font-medium text-fg">{{ completedCount }}</span
              >/{{ securityItems.length }} 项安全设置，
              <span v-if="securityLevel !== 'high'" class="text-skin">继续提升安全等级</span>
              <span v-else class="text-green-500">您的账户非常安全</span>
            </p>
          </div>
        </div>

        <!-- 安全项列表 -->
        <ProfileCard>
          <template #header>
            <span class="i-carbon-security w-4 h-4 text-fg-muted" />
            <h3 class="text-sm font-medium text-fg">安全设置</h3>
          </template>
          <ProfileRowItem
            v-for="item in securityItems"
            :key="item.id"
            :icon="
              item.status === 'completed'
                ? 'i-carbon-checkmark-filled'
                : item.status === 'warning'
                  ? 'i-carbon-warning-filled'
                  : item.icon
            "
            :title="item.title"
            :subtitle="item.description"
            :icon-bg="
              item.status === 'completed'
                ? 'bg-green-50 dark:bg-green-900/20'
                : item.status === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : 'bg-surface-muted'
            "
            :icon-color="
              item.status === 'completed'
                ? 'text-green-500'
                : item.status === 'warning'
                  ? 'text-amber-500'
                  : 'text-fg-subtle'
            "
            icon-shape="full"
          >
            <template #action>
              <UButton :variant="item.status === 'completed' ? 'ghost' : 'soft'" size="xs">
                {{ item.action }}
              </UButton>
            </template>
          </ProfileRowItem>
        </ProfileCard>
      </div>

      <!-- 右列：登录记录 -->
      <div class="lg:col-span-1">
        <div class="bg-surface rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-line">
            <div class="flex items-center gap-2">
              <span class="i-carbon-time w-4 h-4 text-fg-muted" />
              <h3 class="text-sm font-medium text-fg">最近登录</h3>
            </div>
            <span class="text-xs text-fg-subtle">{{ loginRecords.length }} 条</span>
          </div>

          <div class="divide-y divide-line">
            <div
              v-for="record in loginRecords"
              :key="record.id"
              class="group px-5 py-4 hover:bg-surface-muted/50 transition-colors"
            >
              <div class="flex items-start gap-3">
                <!-- 设备图标 -->
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  :class="record.current ? 'bg-skin-soft' : 'bg-surface-muted'"
                >
                  <span
                    class="w-4.5 h-4.5"
                    :class="[
                      getDeviceIcon(record.os),
                      record.current ? 'text-skin' : 'text-fg-muted'
                    ]"
                  />
                </div>

                <!-- 设备信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-medium text-fg">{{ record.device }}</p>
                  </div>

                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                    <span class="flex items-center gap-1">
                      <span :class="[getBrowserIcon(record.browser), 'w-3 h-3 text-fg-subtle']" />
                      {{ record.browser }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="i-carbon-location w-3 h-3 text-fg-subtle" />
                      {{ record.location }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="i-carbon-network-wired w-3 h-3 text-fg-subtle" />
                      {{ record.ip }}
                    </span>
                  </div>
                </div>

                <!-- 时间 -->
                <div class="text-right shrink-0">
                  <p
                    class="text-xs"
                    :class="record.current ? 'text-skin font-medium' : 'text-fg-subtle'"
                  >
                    {{ record.time }}
                  </p>
                  <UButton
                    v-if="!record.current"
                    variant="ghost"
                    size="xs"
                    class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    踢下线
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="px-5 py-3 border-t border-line bg-surfaceMuted/30">
            <UButton color="error" variant="ghost" size="sm" class="w-full justify-center">
              <template #leading>
                <span class="i-carbon-reset w-4 h-4" />
              </template>
              刷新记录
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
