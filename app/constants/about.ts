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

export const stats: Stat[] = [
  { num: 2, unit: '年', label: '经验' },
  { num: 42, unit: '+', label: '项目' },
  { num: 12, unit: 'k', label: '提交' }
]

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
    year: '2019',
    title: '踏入代码世界',
    desc: '第一次接触 Vue.js，写下人生第一个 Hello World。',
    tag: '起点'
  },
  {
    year: '2021',
    title: '全栈转型',
    desc: '深入 Node.js 与数据库设计，开始承担完整的产品周期。',
    tag: '蜕变'
  },
  {
    year: '2023',
    title: '独立开发者',
    desc: '发布首款独立产品，一周内登上 Product Hunt 日榜前十。',
    tag: '里程碑'
  }
]

export const works: Work[] = [
  {
    title: 'NarrativeOS',
    desc: '基于 AI 的故事创作平台',
    tags: ['Nuxt', 'AI'],
    icon: '◈',
    color: '#c084fc'
  },
  {
    title: 'FlowBoard',
    desc: '可视化任务管理工具',
    tags: ['Vue', 'GSAP'],
    icon: '◉',
    color: '#38bdf8'
  },
  {
    title: 'EchoMetrics',
    desc: '实时数据分析面板',
    tags: ['Node', 'WS'],
    icon: '◎',
    color: '#4ade80'
  },
  {
    title: 'PixelForge',
    desc: '浏览器内图像处理引擎',
    tags: ['WASM', 'Canvas'],
    icon: '◆',
    color: '#fb923c'
  }
]
