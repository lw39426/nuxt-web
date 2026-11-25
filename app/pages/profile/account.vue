<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import PageHeader from '~/components/ui/PageHeader.vue';
import { useUserApi, type UserInfo } from '~/composables/api/user';
import { useCheckinApi } from '~/composables/api/checkin';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';

const { getInfo, updateInfo, uploadImage } = useUserApi();

const toast = useToast();
const auth = useAuthStore();
const imageInput = useTemplateRef<HTMLInputElement>('imageInput');
const uploadTarget = shallowRef<'avatar' | 'bgCover'>('avatar');
const uploading = shallowRef(false);
const pendingImage = shallowRef<File>();
const pendingImageUrl = shallowRef('');

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

const account = shallowRef({ username: '', phone: '', createdAt: '', avatar: '', cover: '' });
const registrationFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai'
});
const registrationDate = computed(() => {
  const date = new Date(account.value.createdAt);
  return Number.isNaN(date.getTime()) ? '未提供' : registrationFormatter.format(date);
});

const maxBirthday = computed(() => today(getLocalTimeZone()));
const birthdayValue = computed(() => {
  try {
    return form.value.birthday ? parseDate(form.value.birthday) : undefined;
  } catch {
    return undefined;
  }
});
const birthdayLabel = computed(() => {
  const date = birthdayValue.value;
  return date ? `${date.year}年${date.month}月${date.day}日` : '';
});
const emailInput = useTemplateRef<{ inputRef: HTMLInputElement | null }>('emailInput');

const toProfileForm = (data: UserInfo) => ({
  nickname: data.nickname || '',
  email: data.email || '',
  gender: data.gender == null ? undefined : String(data.gender),
  birthday: data.birthday?.slice(0, 10) || '',
  description: data.description || ''
});

/** 加载用户资料，并同步当前账号的封面；迟到的读取不覆盖新上传结果。 */
const loadProfile = async () => {
  const currentUser = auth.user;
  isLoading.value = true;
  error.value = false;
  try {
    const data = await getInfo();
    if (data) {
      account.value = {
        username: data.username || '',
        phone: data.phone || '',
        createdAt: data.create_at || '',
        avatar: data.avatar?.trim() || '',
        cover: data.bg_cover?.trim() || ''
      };
      if (
        currentUser &&
        auth.user === currentUser &&
        data.id === currentUser.id &&
        data.bg_cover !== undefined
      ) {
        auth.setAuth({ user: { ...currentUser, bg_cover: account.value.cover } });
      }
      const loaded = toProfileForm(data);
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
  if (isSaving.value) return;
  if (!form.value.nickname?.trim()) {
    toast.add({ title: '请填写昵称', color: 'error' });
    return;
  }
  const email = form.value.email.trim();
  if (emailInput.value?.inputRef?.validity.typeMismatch) {
    toast.add({ title: '请输入有效的邮箱地址', color: 'error' });
    emailInput.value.inputRef.focus();
    return;
  }
  if (form.value.birthday > maxBirthday.value.toString()) {
    toast.add({ title: '生日不能晚于今天', color: 'error' });
    return;
  }

  const submitted = { ...form.value, nickname: form.value.nickname.trim(), email };
  const emailChanged = email !== originalForm.value.email.trim();
  isSaving.value = true;
  try {
    await updateInfo({
      nickname: submitted.nickname,
      ...(emailChanged ? { email } : {}),
      gender: form.value.gender ? Number(form.value.gender) : undefined,
      birthday: form.value.birthday,
      description: form.value.description.trim()
    });
    if (emailChanged) {
      const latest = await getInfo();
      const savedEmail = latest?.email?.trim() ?? '';
      if (latest) originalForm.value = toProfileForm(latest);
      if (!latest || savedEmail.toLowerCase() !== email.toLowerCase()) {
        toast.add({ title: '未确认邮箱更新，请检查后重试', color: 'error' });
        return;
      }
      submitted.email = savedEmail;
    }
    form.value = submitted;
    originalForm.value = { ...submitted };
    if (auth.user) auth.setAuth({ user: { ...auth.user, nickname: submitted.nickname } });
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

function chooseImage(target: 'avatar' | 'bgCover') {
  if (uploading.value || isSaving.value) return;
  uploadTarget.value = target;
  imageInput.value?.click();
}
function discardPendingImage() {
  pendingImage.value = undefined;
  if (pendingImageUrl.value) URL.revokeObjectURL(pendingImageUrl.value);
  pendingImageUrl.value = '';
}
async function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || uploading.value) return;
  discardPendingImage();
  pendingImage.value = file;
  pendingImageUrl.value = URL.createObjectURL(file);
}
async function confirmImageUpload() {
  const file = pendingImage.value;
  if (!file || uploading.value) return;
  const target = uploadTarget.value;
  uploading.value = true;
  try {
    const result = await uploadImage(file, target);
    const url = target === 'avatar' ? result.avatar : result.bg_cover;
    if (!url) throw new Error('上传响应未返回图片地址，请刷新资料确认');
    account.value = { ...account.value, [target === 'avatar' ? 'avatar' : 'cover']: url };
    if (target === 'avatar' && auth.user) auth.setAuth({ user: { ...auth.user, avatar: url } });
    toast.add({ title: '图片已更新', color: 'success' });
  } catch (error) {
    toast.add({
      title: error instanceof Error ? error.message : '图片上传失败，请重试',
      color: 'error'
    });
  } finally {
    uploading.value = false;
    discardPendingImage();
  }
}
onBeforeUnmount(discardPendingImage);

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
  <div class="account-page">
    <input
      ref="imageInput"
      type="file"
      class="hidden"
      accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
      aria-label="选择资料图片"
      @change="onImageChange"
    />
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
            :disabled="uploading"
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
        <div class="p-4 sm:p-8">
          <div class="flex flex-col lg:flex-row gap-5 sm:gap-10">
            <!-- 头像区 -->
            <div class="shrink-0 lg:w-40 lg:pt-2">
              <div class="flex items-center gap-4 lg:flex-col lg:gap-3">
                <button
                  type="button"
                  class="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-skin focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-transform duration-200"
                  :disabled="uploading || isSaving"
                  aria-label="更换头像"
                  @click="chooseImage('avatar')"
                >
                  <UAvatar
                    :src="account.avatar || undefined"
                    alt=""
                    class="size-14 overflow-hidden bg-skin-solid ring-4 ring-surface sm:size-28"
                    :ui="{ image: 'object-cover' }"
                  >
                    <span class="font-bold text-2xl sm:text-5xl">
                      {{ form.nickname?.charAt(0) || account.username?.charAt(0) || '用' }}
                    </span>
                  </UAvatar>
                  <span
                    class="absolute bottom-0 right-0 w-6 h-6 sm:bottom-1 sm:right-1 sm:w-9 sm:h-9 bg-surface rounded-full border-2 border-line shadow-md flex items-center justify-center transition-all duration-200"
                    :class="isEditing ? 'group-hover:bg-skin-soft group-hover:border-skin' : ''"
                  >
                    <span
                      class="i-carbon-camera w-4 h-4 transition-colors duration-200"
                      :class="isEditing ? 'text-fg-muted group-hover:text-skin' : 'text-fg-muted'"
                    />
                  </span>
                </button>
                <p class="text-xs sm:text-sm text-fg-muted">
                  {{ uploading ? '正在上传…' : '点击头像更换' }}
                </p>
              </div>
              <dl
                class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm lg:grid-cols-1"
              >
                <div class="min-w-0">
                  <dt class="text-xs text-fg-muted">用户名（账号）</dt>
                  <dd class="mt-1 break-all text-fg">{{ account.username || '未提供' }}</dd>
                </div>
                <div class="min-w-0">
                  <dt class="text-xs text-fg-muted">手机号</dt>
                  <dd class="mt-1 break-all text-fg">{{ account.phone || '未绑定' }}</dd>
                </div>
                <div class="col-span-2 lg:col-span-1">
                  <dt class="text-xs text-fg-muted">注册时间</dt>
                  <dd class="mt-1 text-fg">
                    <time v-if="registrationDate !== '未提供'" :datetime="account.createdAt">
                      {{ registrationDate }}
                    </time>
                    <span v-else>{{ registrationDate }}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- 信息网格：使用相对定位 + 绝对定位层叠，避免 CLS 布局跳动 -->
            <div class="flex-1 min-w-0 relative">
              <!-- 展示模式层 -->
              <div
                class="info-layer info-layer--display grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6"
                :class="{ 'opacity-0 invisible': isEditing }"
              >
                <div class="form-field-wrap">
                  <label class="form-field-label">昵称</label>
                  <div class="form-field-display">
                    {{ form.nickname || '-' }}
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
                    {{ birthdayLabel || '-' }}
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
                  <label for="profile-nickname" class="form-field-label">
                    <span class="text-red-500 mr-0.5">*</span>昵称
                  </label>
                  <UInput
                    id="profile-nickname"
                    v-model="form.nickname"
                    placeholder="请输入昵称"
                    variant="none"
                  />
                </div>
                <div class="form-field-wrap">
                  <label for="profile-email" class="form-field-label">邮箱</label>
                  <UInput
                    id="profile-email"
                    ref="emailInput"
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="请输入邮箱"
                    variant="none"
                  />
                </div>
                <div class="form-field-wrap">
                  <label class="form-field-label">性别</label>
                  <USelect
                    v-model="form.gender"
                    aria-label="性别"
                    :items="genderOptions"
                    placeholder="请选择性别"
                    variant="none"
                  />
                </div>
                <div class="form-field-wrap">
                  <span id="profile-birthday-label" class="form-field-label">生日</span>
                  <UPopover :content="{ align: 'start' }">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      trailing-icon="i-carbon-calendar"
                      aria-labelledby="profile-birthday-label profile-birthday-value"
                      class="w-full justify-between font-normal"
                    >
                      <span
                        id="profile-birthday-value"
                        :class="{ 'text-fg-subtle': !birthdayLabel }"
                      >
                        {{ birthdayLabel || '请选择生日' }}
                      </span>
                    </UButton>
                    <template #content="{ close }">
                      <UCalendar
                        :model-value="birthdayValue"
                        :max-value="maxBirthday"
                        locale="zh-CN"
                        weekday-format="short"
                        :week-starts-on="1"
                        prevent-deselect
                        @update:model-value="
                          (value) => {
                            if (!value) return;
                            form.birthday = value.toString();
                            close();
                          }
                        "
                      />
                    </template>
                  </UPopover>
                </div>
                <div class="form-field-wrap form-field-wrap--area sm:col-span-2">
                  <label class="form-field-label">个人简介</label>
                  <UTextarea
                    v-model="form.description"
                    aria-label="个人简介"
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
          :subtitle="
            account.phone ? `已绑定 · ${account.phone}（暂不支持更换）` : '手机号绑定暂未开放'
          "
          subtitle-class="text-skin"
          action-text=""
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

    <UModal
      :open="!!pendingImage"
      title="确认更换资料图片"
      :description="
        uploadTarget === 'bgCover' ? '确认后会立即更新个人封面。' : '确认后会立即更新头像。'
      "
      :ui="{ content: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' }"
      @update:open="(open: boolean) => !open && discardPendingImage()"
    >
      <template #body>
        <img
          v-if="pendingImageUrl"
          :src="pendingImageUrl"
          alt="待上传图片预览"
          class="max-h-72 w-full rounded-xl object-contain"
        />
        <p class="mt-3 text-sm text-fg-muted">{{ pendingImage?.name }}</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="soft" :disabled="uploading" @click="discardPendingImage"
            >取消</UButton
          >
          <UButton color="primary" :loading="uploading" @click="confirmImageUpload"
            >确认并上传</UButton
          >
        </div>
      </template>
    </UModal>
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
  overflow-wrap: anywhere;
  min-width: 0;
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
 * ---------- 编辑层控件皮肤（Nuxt UI v4 data-slot 选择器） ----------
 * UInput/USelect/UTextarea 和日期触发按钮的交互元素均带
 * data-slot="base"；组件已设 variant="none" 去掉自带背景描边，
 * 由这里统一绘制成与 .form-field-display 完全同规格的外观，
 * 两层叠放切换时宽度/高度/圆角/字号零差异。
 */
.form-field-wrap :deep([data-slot='root']),
.form-field-wrap :deep([data-slot='base']) {
  width: 100%;
}

.form-field-wrap :deep([data-slot='base']) {
  min-width: 0;
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

/* 简介多行编辑：与展示层 --textarea 同高同排版 */
.form-field-wrap--area :deep([data-slot='base']) {
  min-height: 90px;
  line-height: 1.625;
}
/* 手机端让当前模式自然撑开，长文本和输入控件不会覆盖下一张卡片。 */
@media (max-width: 639px) {
  .info-layer {
    gap: 1rem;
  }
  .info-layer.invisible {
    display: none;
  }
  .info-layer.absolute {
    position: static;
  }
  .info-layer--display {
    gap: 0;
  }
  .info-layer--display .form-field-wrap {
    flex-direction: row;
    align-items: baseline;
    gap: 1rem;
    min-height: 48px;
    padding-block: 0.75rem;
    border-bottom: 1px solid var(--line);
  }
  .info-layer--display .form-field-wrap:last-child {
    border-bottom: 0;
  }
  .info-layer--display .form-field-label {
    flex: 0 0 4rem;
    margin: 0;
  }
  .info-layer--display .form-field-display {
    min-width: 0;
    min-height: 0;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
  }
  .account-page :deep(button[data-slot='base']),
  .form-field-wrap :deep([data-slot='base']) {
    min-height: 44px;
  }
  .form-field-wrap :deep(input),
  .form-field-wrap :deep(textarea) {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .info-layer {
    transition: none;
  }
}
</style>
