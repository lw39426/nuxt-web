<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import { useAddressApi } from '~/composables/api/address';
import type { Address, AddressPayload } from '~/composables/api/address';

const { list, remove, setDefault } = useAddressApi();

const isLoading = ref(true);
const error = ref(false);
const addresses = ref<Address[]>([]);
const showModal = ref(false);
const editingAddress = ref<Address | null>(null);

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
    addresses.value = data.addresses || [];
  } catch {
    error.value = true;
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

const handleDelete = async (id: number) => {
  if (!confirm('确定删除该地址？')) return;
  try {
    await remove(id);
    await loadAddresses();
    const toast = useToast();
    toast.add({ id: 'address-delete-success', title: '删除成功', color: 'success' });
  } catch {
    const toast = useToast();
    toast.add({ id: 'address-delete-error', title: '删除失败', color: 'error' });
  }
};

const handleSetDefault = async (id: number) => {
  try {
    await setDefault(id);
    await loadAddresses();
  } catch {
    const toast = useToast();
    toast.add({ id: 'address-default-error', title: '设置失败', color: 'error' });
  }
};

onMounted(loadAddresses);
</script>

<template>
  <div>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-8">
      <PageHeader title="地址管理" subtitle="管理您的收货地址" class="mt-2" />
      <UButton v-if="addresses.length !== 0" color="primary" @click="openCreateModal">
        <template #leading>
          <span class="i-carbon-add w-4 h-4" />
        </template>
        <span>新建地址</span>
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="bg-surface rounded-2xl p-5 shadow-sm animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-4 w-16 bg-surface-muted rounded" />
            <div class="h-4 w-24 bg-surface-muted rounded" />
          </div>
          <div class="h-5 w-10 bg-surface-muted rounded-full" />
        </div>
        <div class="h-4 w-full bg-surface-muted rounded mb-2" />
        <div class="h-3 w-3/4 bg-surface-muted rounded" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <div
        class="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-warning text-3xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">加载失败</p>
      <p class="text-sm text-fg-subtle mb-6">请检查网络连接后重试</p>
      <UButton color="primary" variant="outline" @click="loadAddresses">重新加载</UButton>
    </div>

    <!-- Empty -->
    <div v-else-if="addresses.length === 0" class="text-center py-20">
      <div
        class="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4"
      >
        <span class="i-carbon-location text-4xl text-fg-subtle" />
      </div>
      <p class="text-fg font-medium mb-1">暂无收货地址</p>
      <p class="text-sm text-fg-subtle mb-6">添加一个地址以便下单时使用</p>
      <UButton color="primary" @click="openCreateModal">
        <template #leading>
          <span class="i-carbon-add w-4 h-4" />
        </template>
        添加地址
      </UButton>
    </div>

    <!-- Address List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        :class="{ 'ring-2 ring-skin': address.is_default }"
      >
        <!-- 默认地址标识 -->
        <div
          v-if="address.is_default"
          class="bg-skin-soft/50 border-b border-skin px-5 py-2.5 flex items-center gap-2"
        >
          <span class="i-carbon-checkmark-filled w-4 h-4 text-skin" />
          <span class="text-xs font-medium text-skin-strong">默认地址</span>
        </div>

        <!-- 地址信息 -->
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center shrink-0"
            >
              <span class="i-carbon-user text-lg text-fg-subtle" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-fg">{{
                  address.recipient_name || '未命名'
                }}</span>
                <span class="text-sm text-fg-muted">{{ address.phone || '未填写' }}</span>
              </div>
            </div>
          </div>
          <p class="text-sm text-fg-muted leading-relaxed pl-[52px]">
            {{ address.address_line || '未填写详细地址' }}
          </p>
        </div>

        <!-- 操作区 -->
        <div class="flex items-center gap-1 px-5 py-3 border-t border-line bg-surfaceMuted/30">
          <UButton
            v-if="!address.is_default"
            variant="ghost"
            size="xs"
            @click="handleSetDefault(address.id)"
          >
            设为默认
          </UButton>
          <UButton variant="ghost" size="xs" @click="openEditModal(address)">
            <template #leading>
              <span class="i-carbon-edit w-3.5 h-3.5" />
            </template>
            编辑
          </UButton>
          <UButton variant="ghost" size="xs" @click="handleDelete(address.id)">
            <template #leading>
              <span class="i-carbon-trash-can w-3.5 h-3.5" />
            </template>
            删除
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
