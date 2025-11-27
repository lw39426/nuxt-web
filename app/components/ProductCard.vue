<template>
  <el-card class="card flex flex-col gap-2" shadow="hover">
    <div class="thumb relative w-100% aspect-[1/1] overflow-hidden rounded-2">
      <el-image :src="product.cover" fit="cover" lazy>
        <template #error>
          <div class="thumb-fallback flex items-center justify-center w-100% h-100% bg-[#f5f7fa] text-#999">无图</div>
        </template>
      </el-image>
      <div class="quick absolute right-2 top-2 flex gap-1">
        <el-tooltip content="收藏" placement="top">
          <el-button circle size="small" @click.stop="onToggleFav">
            <el-icon v-if="favorited"><StarFilled /></el-icon>
            <el-icon v-else><Star /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="详情" placement="top">
          <el-button circle size="small" @click.stop="gotoDetail">
            <el-icon><View /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="info flex flex-col gap-1">
      <div class="title font-600 truncate" :title="product.name">{{ product.name }}</div>
      <div class="price text-#f56c6c font-700">￥{{ product.price }}</div>
      <div class="ops">
        <el-button size="small" type="primary" :loading="adding" @click="onAdd">加入购物车</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useCartApi } from '~/composables/api/cart'

interface Props {
  product: { id: number; name: string; price: number; cover?: string }
}

const props = defineProps<Props>()
const favorited = ref(false)
const adding = ref(false)
const { add } = useCartApi()

async function onAdd() {
  try {
    adding.value = true
    await add({ productId: props.product.id, quantity: 1 })
  } catch (e) {
    console.error('加入购物车失败', e)
  } finally {
    adding.value = false
  }
}

function onToggleFav() {
  favorited.value = !favorited.value
}

/**
 * 跳转到商品详情
 */
function gotoDetail() {
  navigateTo(`/products/${props.product.id}`)
}
</script>

<style scoped>
.thumb :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ops {
  display: flex;
}
</style>
