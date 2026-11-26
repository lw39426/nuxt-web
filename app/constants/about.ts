export interface Stat {
  num: number
  unit: string
  label: string
}

export interface Skill {
  name: string
  top: string
  left: string
  fontSize: string
}

export interface TimelineEvent {
  year: string
  title: string
  desc: string
  tag: string
}

export interface Work {
  title: string
  desc: string
  tags: string[]
  icon: string
  color: string
}

export const aboutScrollMedia = {
  desktop: '(min-width: 900px) and (min-height: 720px)',
  compact: '(width < 900px) and (min-height: 600px)',
  motion: '(prefers-reduced-motion: no-preference)'
}

export const stats: Stat[] = [{ num: 2, unit: '年', label: '开发经验' }]

export const skills: Skill[] = [
  { name: 'Vue / Nuxt', top: '10%', left: '20%', fontSize: '1.1rem' },
  { name: 'TypeScript', top: '25%', left: '60%', fontSize: '0.9rem' },
  { name: 'Node.js', top: '50%', left: '15%', fontSize: '1rem' },
  { name: 'Python', top: '55%', left: '65%', fontSize: '1.2rem' },
  { name: 'GSAP', top: '65%', left: '55%', fontSize: '1.2rem' },
  { name: 'Three.js', top: '85%', left: '65%', fontSize: '1rem' }
]

export const timeline: TimelineEvent[] = [
  {
    year: '从好奇出发',
    title: '保持学习的热情',
    desc: '多问一个为什么，多试一种可能，让新的想法慢慢生长。',
    tag: '起点'
  },
  {
    year: '在尝试中前进',
    title: '把想法付诸实践',
    desc: '从一个小功能、一处小细节开始，在动手的过程中寻找答案。',
    tag: '实践'
  },
  {
    year: '向更好的体验靠近',
    title: '用心打磨每个细节',
    desc: '让表达更清晰，让使用更顺手，带着耐心继续完善手中的作品。',
    tag: '继续'
  }
]

export const works: Work[] = [
  {
    title: 'uni-app 小程序与 Flutter',
    desc: '使用 uni-app 开发小程序，使用 Flutter 构建跨平台应用，完成页面搭建、接口对接与移动端交互。',
    tags: ['uni-app', '微信小程序', 'Flutter', 'Dart'],
    icon: '◈',
    color: '#c084fc'
  },
  {
    title: 'Vue 管理端与用户端',
    desc: '搭建管理后台和用户界面，处理表单、列表、路由与状态管理，兼顾业务功能和使用体验。',
    tags: ['Vue', 'TypeScript', 'Pinia'],
    icon: '◉',
    color: '#38bdf8'
  },
  {
    title: 'Nuxt 网站开发',
    desc: '使用 Nuxt 构建网站，结合服务端渲染、响应式布局与 SEO 配置，让内容更容易被访问和发现。',
    tags: ['Nuxt', 'SSR', 'SEO'],
    icon: '◎',
    color: '#4ade80'
  },
  {
    title: 'Python / Node.js',
    desc: '编写后端接口和实用脚本，处理数据、连接数据库与外部服务，为前端页面提供支持。',
    tags: ['Python', 'Node.js', 'REST API'],
    icon: '◆',
    color: '#fb923c'
  }
]
