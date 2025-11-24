<template>
  <div class="page">
    <el-card shadow="never" class="detail">
      <div class="title">{{ detail?.title }}</div>
      <div class="content" v-html="detail?.content" />
    </el-card>

    <el-card shadow="never" class="related">
      <div class="sub-title">相关文章</div>
      <el-space wrap>
        <NuxtLink v-for="item in relatedList" :key="item.id" :to="`/articles/${item.id}`">
          <el-tag>{{ item.title }}</el-tag>
        </NuxtLink>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useArticleApi } from '~/composables/api/article'
import { useMock } from '~/composables/useMock'

const route = useRoute()
const { detail: getDetail, related } = useArticleApi()
const mock = useMock()
const {
  public: { useMock: useMockFlag }
} = useRuntimeConfig()

const detail = ref<any>(null)
const relatedList = ref<any[]>([])

/**
 * 拉取文章详情
 */
async function fetchDetail() {
  try {
    const id = Number(route.params.id)
    const res = useMockFlag ? await mock.getArticleDetail(id) : await getDetail(id)
    detail.value = res.data
  } catch (e: any) {
    ElMessage.error(e?.message || '加载文章详情失败')
  }
}

/**
 * 拉取相关文章
 */
async function fetchRelated() {
  try {
    const id = Number(route.params.id)
    const res = useMockFlag ? await mock.getRelatedArticles(id) : await related(id)
    relatedList.value = res.data
  } catch (e: any) {
    ElMessage.error(e?.message || '加载相关文章失败')
  }
}

onMounted(() => {
  fetchDetail()
  fetchRelated()
})
</script>

<style scoped>
.page {
  padding: 16px;
}
.detail {
  margin-bottom: 16px;
}
.title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}
.content :deep(p) {
  line-height: 1.8;
}
.sub-title {
  font-weight: 600;
  margin-bottom: 8px;
}
</style>
