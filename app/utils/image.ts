/**
 * 全站图片兜底占位图（SVG data URI）
 * ------------------------------------------------------------
 * - data URI 内联，无额外网络请求，兜底图自身不会再次加载失败
 * - 中性灰配色（zinc-200 底 + zinc-400 图形），明暗主题下都不突兀
 * - 由 UiImage 组件消费：src 为空或加载失败时展示
 */

const svgToDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg.trim())}`

/* 中性灰占位配色 */
const PLACEHOLDER_BG = '#e4e4e7'
const PLACEHOLDER_FG = '#a1a1aa'

/** 商品 / 文章封面等常规图片占位：相框 + 山形图案 */
export const IMAGE_PLACEHOLDER = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
  <rect width='400' height='400' fill='${PLACEHOLDER_BG}'/>
  <g fill='none' stroke='${PLACEHOLDER_FG}' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'>
    <rect x='104' y='124' width='192' height='152' rx='14'/>
    <circle cx='158' cy='172' r='13'/>
    <path d='M114 258l48-48 38 38 42-54 44 64'/>
  </g>
</svg>`)

/** 用户头像占位：头肩剪影 */
export const AVATAR_PLACEHOLDER = svgToDataUri(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
  <rect width='400' height='400' fill='${PLACEHOLDER_BG}'/>
  <g fill='none' stroke='${PLACEHOLDER_FG}' stroke-width='16' stroke-linecap='round'>
    <circle cx='200' cy='156' r='52'/>
    <path d='M104 322c13-62 51-92 96-92s83 30 96 92'/>
  </g>
</svg>`)
