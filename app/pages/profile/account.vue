<script setup lang="ts">
import { useUserApi } from '~/composables/api/user';
import { useCheckinApi } from '~/composables/api/checkin';
import { getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';

const { getInfo, updateInfo } = useUserApi();

const toast = useToast();

const isLoading = ref(true);
const isEditing = ref(false);
const isSaving = ref(false);

const error = ref(false);

/** 性别选项（USelect 使用） */
const genderOptions = [
  { label: '保密', value: '0' },
  { label: '男', value: '1' },
  { label: '女', value: '2' }
];

const form = ref({
  nickname: '',
  username: '',
  phone: '',
  email: '',
  gender: undefined as string | undefined,
  birthday: '',
  description: ''
});

const originalForm = ref({ ...form.value });

const memberPoints = ref(0);
const nextLevelPoints = ref(600);

const progressPercent = computed(() =>
  Math.min(Math.round((memberPoints.value / nextLevelPoints.value) * 100), 100)
);

/** 获取性别展示文字 */
const getGenderLabel = (gender: string | undefined) => {
  if (gender === '1') return '男';
  if (gender === '2') return '女';
  return '保密';
};

/** 生日上限：不允许选择未来日期 */
const maxBirthday = today(getLocalTimeZone());

/** 生日字符串（YYYY-MM-DD）↔ UInputDate 的 DateValue 双向转换 */
const birthdayValue = computed<DateValue | undefined>({
  get: () => {
    const raw = form.value.birthday?.slice(0, 10);
    if (!raw) return undefined;
    try {
      return parseDate(raw);
    } catch {
      return undefined;
    }
  },
  set: (value) => {
    form.value.birthday = value ? value.toString() : '';
  }
});

/** 加载用户资料 */
const loadProfile = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await getInfo();
    if (data) {
      const loaded = {
        nickname: data.nickname || '',
        username: data.username || '',
        phone: data.phone || '',
        email: data.email || '',
        gender: data.gender ? String(data.gender) : undefined,
        birthday: data.birthday || '',
        description: data.description || ''
      };
      form.value = { ...loaded };
      originalForm.value = { ...loaded };
    }
  } catch {
    error.value = true;
  } finally {
    isLoading.value = false;
  }
};

/** 加载签到积分（失败静默，积分区显示 0 不阻塞页面） */
const loadPoints = async () => {
  try {
    const status = await useCheckinApi().getStatus();
    if (status) {
      memberPoints.value = status.total_points;
    }
  } catch {
    // 静默降级
  }
};

/** 进入编辑模式：保存原始数据，设置编辑标记 */
const handleEnterEdit = () => {
  originalForm.value = { ...form.value };
  isEditing.value = true;
};

/** 保存资料：校验后调用更新接口，成功后退出编辑模式 */
const handleSave = async () => {
  if (!form.value.nickname?.trim()) {
    toast.add({ title: '请填写昵称', color: 'error' });
    return;
  }
  isSaving.value = true;
  try {
    await updateInfo({
      nickname: form.value.nickname.trim(),
      gender: form.value.gender ? Number(form.value.gender) : undefined,
      birthday: form.value.birthday || undefined,
      description: form.value.description?.trim() || undefined
    });
    originalForm.value = { ...form.value };
    isEditing.value = false;
    toast.add({ title: '保存成功', color: 'success' });
  } catch {
    toast.add({ title: '保存失败，请稍后重试', color: 'error' });
  } finally {
    isSaving.value = false;
  }
};

/** 取消编辑：还原为进入编辑前的表单内容 */
const handleCancel = () => {
  form.value = { ...originalForm.value };
  isEditing.value = false;
};

/** 更换头像：当前仅提示，待接入上传接口 */
const handleChangeAvatar = () => {
  if (!isEditing.value) return;
  toast.add({ title: '头像上传功能即将开放', color: 'neutral' });
};

/** 账号绑定/更换：当前仅提示，待接入各平台绑定流程 */
const handleBindClick = (_target: string) => {
  toast.add({ title: '账号绑定功能即将开放', color: 'neutral' });
};

onMounted(() => {
  loadProfile();
  loadPoints();
});
</script>

<template>
  <div>
    <PageHeader title="个人资料" subtitle="管理您的账户信息和偏好设置" />

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-fg-subtle" />
    </div>

    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-fg-subtle mb-4" />
      <p class="text-fg-muted mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadProfile">重试</UButton>
    </div>

    <div v-else class="space-y-6">
      <!-- 基本信息卡片 -->
      <ProfileCard title="基本信息">
        <template #actions>
          <UButton
            v-if="isEditing"
            color="neutral"
            variant="soft"
            size="sm"
            :disabled="isSaving"
            @click="handleCancel"
          >
            取消
          </UButton>
          <UButton
            v-if="isEditing"
            color="primary"
            size="sm"
            :loading="isSaving"
            @click="handleSave"
          >
            保存
          </UButton>
          <UButton v-else color="primary" variant="soft" size="sm" @click="handleEnterEdit">
            <template #leading>
              <span class="i-carbon-edit w-4 h-4" />
            </template>
            编辑资料
          </UButton>
        </template>

        <!-- 资料内容区 -->
        <div class="p-6 sm:p-8">
          <div class="flex flex-col lg:flex-row gap-10">
            <!-- 头像区 -->
            <div class="flex flex-col items-center shrink-0 lg:pt-2">
              <button
                type="button"
                class="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-skin focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-transform duration-200"
                :class="isEditing ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'"
                :disabled="!isEditing"
                :aria-label="isEditing ? '更换头像' : '头像'"
                @click="handleChangeAvatar"
              >
                <div
                  class="w-22 h-22 sm:w-28 sm:h-28 rounded-full bg-skin-solid flex items-center justify-center font-bold text-5xl ring-4 ring-surface"
                >
                  {{ form.nickname?.charAt(0) || form.username?.charAt(0) || '用' }}
                </div>
                <span
                  class="absolute bottom-1 right-1 w-9 h-9 bg-surface rounded-full border-2 border-line shadow-md flex items-center justify-center transition-all duration-200"
                  :class="isEditing ? 'group-hover:bg-skin-soft group-hover:border-skin' : ''"
                >
                  <span
                    class="i-carbon-camera w-4 h-4 transition-colors duration-200"
                    :class="isEditing ? 'text-fg-muted group-hover:text-skin' : 'text-fg-muted'"
                  />
                </span>
              </button>
              <p class="text-sm text-fg-muted mt-4">
                {{ '编辑资料后可更换头像' }}
              </p>
            </div>

            <!-- 信息网格：使用相对定位 + 绝对定位层叠，避免 CLS 布局跳动 -->
            <div class="flex-1 min-w-0 relative">
              <!-- 展示模式层 -->
              <div
                class="info-layer grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6"
                :class="{ 'opacity-0 invisible': isEditing }"
              >
                <div class="form-field-wrap">
                  <label class="form-field-label">用户名</label>
                  <div class="form-field-display">
                    {{ form.username || '-' }}
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">昵称</label>
                  <div class="form-field-display">
                    {{ form.nickname || '-' }}
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">手机号</label>
                  <div class="form-field-display">
                    {{ form.phone || '-' }}
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">邮箱</label>
                  <div class="form-field-display">
                    {{ form.email || '-' }}
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">性别</label>
                  <div class="form-field-display">
                    {{ getGenderLabel(form.gender) }}
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">生日</label>
                  <div class="form-field-display">
                    {{ form.birthday || '-' }}
                  </div>
                </div>
                <div class="form-field-wrap sm:col-span-2">
                  <label class="form-field-label">个人简介</label>
                  <div class="form-field-display form-field-display--textarea">
                    {{ form.description || '-' }}
                  </div>
                </div>
              </div>

              <!-- 编辑模式层 -->
              <div
                class="info-layer absolute inset-0 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6"
                :class="{ 'opacity-0 invisible pointer-events-none': !isEditing }"
              >
                <div class="form-field-wrap">
                  <label class="form-field-label">用户名</label>
                  <div class="form-field-display form-field-display--locked">
                    {{ form.username || '-' }}
                    <span class="i-carbon-locked form-field-lock-icon" aria-hidden="true" />
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">
                    <span class="text-red-500 mr-0.5">*</span>昵称
                  </label>
                  <UInput v-model="form.nickname" placeholder="请输入昵称" variant="none" />
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">手机号</label>
                  <div class="form-field-display form-field-display--locked">
                    {{ form.phone || '-' }}
                    <span class="i-carbon-locked form-field-lock-icon" aria-hidden="true" />
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">邮箱</label>
                  <div class="form-field-display form-field-display--locked">
                    {{ form.email || '-' }}
                    <span class="i-carbon-locked form-field-lock-icon" aria-hidden="true" />
                  </div>
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">性别</label>
                  <USelect
                    v-model="form.gender"
                    :items="genderOptions"
                    placeholder="请选择性别"
                    variant="none"
                  />
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">生日</label>
                  <!-- UInputDate 的 DateField 分段渲染在本页 Transition+KeepAlive 结构下
                       会导致 vnode 卸载崩溃（内容区被清空），故用 Popover + 日历选择 -->
                  <UPopover :content="{ align: 'start' }">
                    <UButton
                      variant="none"
                      color="neutral"
                      trailing-icon="i-carbon-calendar"
                      class="w-full justify-between font-normal"
                      :ui="{ trailingIcon: 'ms-auto text-fg-muted' }"
                    >
                      <span :class="form.birthday ? '' : 'text-fg-subtle'">
                        {{ form.birthday || '请选择生日' }}
                      </span>
                    </UButton>
                    <template #content="{ close }">
                      <UCalendar
                        v-model="birthdayValue"
                        :max-value="maxBirthday"
                        @update:model-value="() => close()"
                      />
                    </template>
                  </UPopover>
                </div>
                <div class="form-field-wrap form-field-wrap--area sm:col-span-2">
                  <label class="form-field-label">个人简介</label>
                  <UTextarea
                    v-model="form.description"
                    placeholder="请输入个人简介，介绍一下自己吧~"
                    :rows="3"
                    variant="none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProfileCard>

      <!-- 账号绑定卡片 -->
      <ProfileCard title="账号绑定">
        <ProfileRowItem
          icon="i-carbon-logo-wechat"
          icon-bg="bg-green-50 dark:bg-green-900/20"
          icon-color="text-green-600"
          title="微信"
          subtitle="未绑定"
          action-text="绑定"
          @action="handleBindClick('wechat')"
        />
        <ProfileRowItem
          icon="i-carbon-logo-qq"
          icon-bg="bg-blue-50 dark:bg-blue-900/20"
          icon-color="text-blue-500"
          title="QQ"
          subtitle="未绑定"
          action-text="绑定"
          @action="handleBindClick('qq')"
        />
        <ProfileRowItem
          icon="i-carbon-phone"
          icon-bg="bg-skin-soft"
          icon-color="text-skin"
          title="手机号"
          :subtitle="`已绑定 · ${form.phone || '138****8888'}`"
          subtitle-class="text-skin"
          action-text="更换"
          action-class="text-fg-muted"
          @action="handleBindClick('phone')"
        />
      </ProfileCard>

      <!-- 会员信息卡片 -->
      <ProfileCard title="我的会员">
        <template #actions>
          <UButton color="error" size="sm"> 升级 </UButton>
        </template>

        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-skin-soft flex items-center justify-center">
              <span class="i-carbon-crown w-6 h-6 text-skin" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-fg">普通会员</span>
                <span class="text-xs text-fg-subtle"
                  >{{ memberPoints }}/{{ nextLevelPoints }} 积分</span
                >
              </div>
              <div class="h-1.5 bg-surfaceMuted rounded-full overflow-hidden">
                <div
                  class="h-full bg-skin-fill rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
            </div>
          </div>

          <p class="text-xs text-fg-subtle">
            再消费 ¥200 即可升级为<span class="text-skin font-medium">银牌会员</span>
          </p>
        </div>
      </ProfileCard>
    </div>
  </div>
</template>

<style scoped>
/**
 * 信息层样式：通过层叠定位消除 CLS
 * 两个层（展示/编辑）使用相同的 grid 布局和尺寸，
 * 通过 opacity + visibility 切换可见性，保持容器高度稳定
 */
.info-layer {
  transition:
    opacity 0.25s ease,
    visibility 0.25s ease;
}

/**
 * 表单项容器：统一高度和间距
 * 确保展示模式和编辑模式的每个字段占据相同的空间
 */
.form-field-wrap {
  display: flex;
  flex-direction: column;
  min-height: 76px;
}

/**
 * 表单字段标签：统一视觉风格
 * 替代原有的 text-xs uppercase，改为更现代的标签样式
 */
.form-field-label {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--fg-muted);
  margin-bottom: 0.5rem;
  line-height: 1.25;
}

/**
 * 展示模式的字段内容框：
 * 与编辑模式 UInput/USelect 保持相同的内边距、圆角和最小高度，
 * 确保切换时高度完全一致，消除 CLS
 */
.form-field-display {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--fg);
  background-color: var(--surface-muted);
  border: 1px solid transparent;
  border-radius: 0.625rem;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.form-field-display:hover {
  background-color: var(--surface-muted);
  border-color: var(--line);
}

/**
 * 多行文本展示样式：
 * 与 UTextarea 高度匹配，允许内容换行和长文本显示
 */
.form-field-display--textarea {
  min-height: 90px;
  align-items: flex-start;
  line-height: 1.625;
  white-space: pre-wrap;
  word-break: break-word;
}

/**
 * 编辑层锁定字段（用户名/手机号/邮箱）：
 * 后端更新接口不接收这些字段，编辑态以展示框 + 锁图标呈现，避免"能改但不生效"
 */
.form-field-display--locked {
  gap: 0.5rem;
  color: var(--fg-muted);
}

.form-field-lock-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  color: var(--fg-subtle);
}

/**
 * ---------- 编辑层控件皮肤（Nuxt UI v4 data-slot 选择器） ----------
 * UInput/USelect/UTextarea 的交互元素与 UInputDate 的根元素均带
 * data-slot="base"；组件已设 variant="none" 去掉自带背景描边，
 * 由这里统一绘制成与 .form-field-display 完全同规格的外观，
 * 两层叠放切换时宽度/高度/圆角/字号零差异。
 */
.form-field-wrap :deep([data-slot='root']),
.form-field-wrap :deep([data-slot='base']) {
  width: 100%;
}

.form-field-wrap :deep([data-slot='base']) {
  min-height: 42px;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--fg);
  background-color: var(--surface-muted);
  border: 1px solid transparent;
  border-radius: 0.625rem;
  outline: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field-wrap :deep([data-slot='base']:hover) {
  border-color: var(--line);
}

/* 聚焦 / 下拉展开态：白底 + 皮肤主色描边与光晕 */
.form-field-wrap :deep([data-slot='base']:focus),
.form-field-wrap :deep([data-slot='base']:focus-visible),
.form-field-wrap :deep([data-slot='base']:focus-within),
.form-field-wrap :deep([data-slot='base'][data-state='open']) {
  background-color: var(--surface);
  border-color: rgba(var(--skin-accent-rgb), 0.45);
  box-shadow: 0 0 0 3px rgba(var(--skin-accent-rgb), 0.18);
}

/* 日期分段输入（UInputDate 内部）：还原为裸文本段，继承容器皮肤 */
.form-field-wrap :deep([data-slot='segment']) {
  min-height: 0;
  padding: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  outline: none;
}

/* 简介多行编辑：与展示层 --textarea 同高同排版 */
.form-field-wrap--area :deep([data-slot='base']) {
  min-height: 90px;
  line-height: 1.625;
}
</style>
