<template>
  <div>
    <!-- 这是一个超长的注释，用来测试 printWidth 配置是否生效，这行文字应该超过 100 个字符的限制，看看 Prettier 是否会自动换行处理 -->
    <div
      class="very-long-class-name-that-should-exceed-printWidth-limit-of-100-characters-and-should-be-formatted"
    >
      这是一段很长的中文文本，用来测试 printWidth
      配置是否对中文内容也生效，如果配置正确的话这段文字应该会被适当处理
    </div>

    <!-- 测试一个非常长的属性 -->
    <input
      type="text"
      :placeholder="'这是一个非常长的占位符文本，用来测试当属性值超过 printWidth 限制时的处理情况'"
      class="form-control"
    />
  </div>
</template>

<script setup>
// 这是一个超长的注释，用来测试 printWidth 配置是否生效，这行文字应该超过 100 个字符的限制，看看 Prettier 是否会自动换行处理
const _veryLongVariableNameThatShouldExceedPrintWidthLimitOf100CharactersAndShouldBeFormatted =
  '这是一段很长的字符串内容，用来测试 printWidth 配置是否生效'

const _longObject = {
  veryLongPropertyNameThatShouldExceedPrintWidthLimit:
    '这是一段很长的属性值，用来测试对象属性超过 100 字符限制时的处理情况',
  anotherProperty: '短属性'
}
</script>

<style>
.very-long-class-name-that-should-exceed-printWidth-limit-of-100-characters-and-should-be-formatted {
  color: red;
  font-size: 16px;
}
</style>
