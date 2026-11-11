<script setup lang="ts">
import AboutClassic from '~/components/about/AboutClassic.vue';

definePageMeta({ hideFooter: true, hideFloatingMenu: true, hideAiEntry: true });
useSeoMeta({
  title: '关于入梦',
  description: '入梦的人物故事：全栈开发、界面设计，以及用代码构建的作品。'
});
</script>

<template>
  <AboutClassic />
</template>
