export default defineAppConfig({
  ui: {
    colors: {
      // primary 的实际色值在 assets/css/theme.css 中直接覆盖 --ui-color-primary-*
      // 为品牌绿色阶（app.config 自定义色名链路在 v4.2.1 存在 @theme inline 断链，
      // 故此处保持默认色名，仅覆盖变量）
      primary: 'green',
      // 中性色与 theme.css 的 zinc 系文字/线框 token 对齐
      neutral: 'zinc'
    }
  }
})
