<script setup lang="ts">
import { useAddressApi } from '~/composables/api/address';
import type { Address, AddressPayload } from '~/composables/api/address';

const { list, create, update, remove, setDefault } = useAddressApi();

const isLoading = ref(true);
const error = ref(false);
const addresses = ref<Address[]>([]);
const showModal = ref(false);
const editingAddress = ref<Address | null>(null);
const isSaving = ref(false);

const form = ref<AddressPayload>({
  recipient_name: '',
  phone: '',
  address_line: '',
  is_default: false
});

const loadAddresses = async () => {
  isLoading.value = true;
  error.value = false;
  try {
    const data = await list();
    addresses.value = data || [];
  } catch (err) {
    error.value = true;
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  editingAddress.value = null;
  form.value = { recipient_name: '', phone: '', address_line: '', is_default: false };
  showModal.value = true;
};

const openEditModal = (address: Address) => {
  editingAddress.value = address;
  form.value = {
    recipient_name: address.recipient_name,
    phone: address.phone,
    address_line: address.address_line,
    is_default: address.is_default
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    if (editingAddress.value) {
      await update(editingAddress.value.id, form.value);
    } else {
      await create(form.value);
    }
    showModal.value = false;
    await loadAddresses();
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'address-save-error',
      title: '保存失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('确定删除该地址？')) return;
  try {
    await remove(id);
    await loadAddresses();
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'address-delete-error',
      title: '删除失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  }
};

const handleSetDefault = async (id: number) => {
  try {
    await setDefault(id);
    await loadAddresses();
  } catch (err: any) {
    const toast = useToast();
    toast.add({
      id: 'address-default-error',
      title: '设置失败',
      description: err.message || '请稍后再试',
      color: 'error'
    });
  }
};

onMounted(loadAddresses);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">地址管理</h1>
      <UButton color="primary" size="sm" @click="openCreateModal">
        <span class="i-carbon-add w-4 h-4 mr-1" />
        新增地址
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="i-carbon-circle-dash w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div class="i-carbon-warning text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">加载失败</p>
      <UButton color="primary" variant="outline" @click="loadAddresses">重试</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="addresses.length === 0" class="text-center py-20">
      <div class="i-carbon-location text-5xl text-gray-300 mb-4" />
      <p class="text-gray-500 mb-4">暂无收货地址</p>
      <UButton color="primary" variant="outline" @click="openCreateModal">添加地址</UButton>
    </div>

    <!-- Address List -->
    <div v-else class="space-y-4">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{
                address.recipient_name
              }}</span>
              <span class="text-sm text-gray-500">{{ address.phone }}</span>
              <span
                v-if="address.is_default"
                class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              >
                默认
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ address.address_line }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-4">
            <UButton
              v-if="!address.is_default"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="handleSetDefault(address.id)"
            >
              设为默认
            </UButton>
            <UButton color="neutral" variant="ghost" size="xs" @click="openEditModal(address)">
              编辑
            </UButton>
            <UButton color="error" variant="ghost" size="xs" @click="handleDelete(address.id)">
              删除
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ editingAddress ? '编辑地址' : '新增地址' }}
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">收件人</label>
            <input
              v-model="form.recipient_name"
              type="text"
              required
              placeholder="请输入收件人姓名"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">手机号</label>
            <input
              v-model="form.phone"
              type="tel"
              required
              placeholder="请输入手机号"
              class="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600 dark:text-gray-400 mb-1 block">详细地址</label>
            <textarea
              v-model="form.address_line"
              required
              rows="2"
              placeholder="请输入详细地址"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              id="is-default"
              v-model="form.is_default"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label for="is-default" class="text-sm text-gray-600 dark:text-gray-400"
              >设为默认地址</label
            >
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="isSaving"
              @click="
                () => {
                  showModal = false;
                }
              "
            >
              取消
            </UButton>
            <UButton color="primary" type="submit" :loading="isSaving"> 保存 </UButton>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>
