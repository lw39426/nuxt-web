<template>
  <div class="test">
    <!-- 这是一个超长的注释，用来测试 printWidth 配置是否生效，这行文字应该超过 100 个字符的限制，看看 Prettier 是否会自动换行处理 -->
    <div
      class="very-long-class-name-that-should-exceed-printWidth-limit-of-100-characters-and-should-be-formatted"
    >
      这是一段很长的中文文本，用来测试 printWidth 配置是否对中文内容也生效，如果配置正确的话这段文字应该会被适当处理
    </div>
  </div>
</template>