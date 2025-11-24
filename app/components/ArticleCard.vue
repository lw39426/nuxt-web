<template>
  <el-card class="card" shadow="hover">
    <div class="title" :title="article.title">{{ article.title }}</div>
    <div class="summary">{{ article.summary }}</div>
    <div class="ops">
      <el-button size="small" @click="gotoDetail">阅读详情</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  article: { id: number; title: string; summary?: string }
}
const props = defineProps<Props>()

/**
 * 跳转到文章详情
 */
function gotoDetail() {
  navigateTo(`/articles/${props.article.id}`)
}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.title {
  font-weight: 600;
}
.summary {
  color: #666;
  min-height: 40px;
}
.ops {
  margin-top: 4px;
}
</style>
