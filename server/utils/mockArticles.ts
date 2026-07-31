/**
 * 文章模块 Mock 数据
 * 为 /api/v1/article/* 接口提供数据
 */

export interface MockArticleCategory {
  id: number
  name: string
  parent_id: number | null
  is_displayed: number
  sort_order: number
  children: MockArticleCategory[]
}

export interface MockArticle {
  id: number
  code: string
  title: string
  content: string
  image: string
  description: string
  status: number
  audit_reason: string | null
  category_id: number
  category_name: string
  author: string
  user: {
    id: number
    nickname: string
    avatar: string
    description: string
  } | null
  views: number
  likes: number | null
  comment_count: number | null
  favorite_count: number
  tags: { id: number; name: string; color: string; weight: number; type: number }[]
  published_date: string
  update_date: string
}

const ARTICLE_CATEGORIES: MockArticleCategory[] = [
  {
    id: 1,
    name: 'Announcements',
    parent_id: null,
    is_displayed: 1,
    sort_order: 1,
    children: []
  },
  {
    id: 2,
    name: 'Engineering',
    parent_id: null,
    is_displayed: 1,
    sort_order: 2,
    children: []
  },
  {
    id: 3,
    name: 'Product',
    parent_id: null,
    is_displayed: 1,
    sort_order: 3,
    children: []
  },
  {
    id: 4,
    name: 'Tutorial',
    parent_id: null,
    is_displayed: 1,
    sort_order: 4,
    children: []
  },
  {
    id: 5,
    name: 'Design',
    parent_id: null,
    is_displayed: 1,
    sort_order: 5,
    children: []
  }
]

const ARTICLES: MockArticle[] = [
  {
    id: 1,
    code: 'art_72ffe9c2935446d2',
    title: 'Introducing the Mintlify Agent to write documentation with AI',
    content:
      '<p>We are excited to announce the Mintlify Agent, a new AI-powered tool that helps you write and maintain documentation effortlessly.</p>',
    image:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    description:
      'Automatically update documentation with context from PRs, Slack threads, or links.',
    status: 1,
    audit_reason: null,
    category_id: 1,
    category_name: 'Announcements',
    author: 'Han Wang',
    user: {
      id: 1,
      nickname: 'Han Wang',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      description: '创始人 & CEO'
    },
    views: 12580,
    likes: 342,
    comment_count: 28,
    favorite_count: 89,
    tags: [
      { id: 1, name: 'AI', color: '#3B82F6', weight: 10, type: 2 },
      { id: 2, name: 'Documentation', color: '#10B981', weight: 8, type: 2 }
    ],
    published_date: '2025-09-29T08:00:00Z',
    update_date: '2025-09-29T08:00:00Z'
  },
  {
    id: 2,
    code: 'art_8a3bc1d4e5f67890',
    title: 'How we reduced our page load time by 60%',
    content:
      '<p>Performance is a feature. Here is how we optimized our documentation site to achieve sub-second load times.</p>',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop',
    description:
      'A deep dive into the performance optimizations that made our docs significantly faster.',
    status: 1,
    audit_reason: null,
    category_id: 2,
    category_name: 'Engineering',
    author: 'Sarah Chen',
    user: {
      id: 2,
      nickname: 'Sarah Chen',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
      description: '高级工程师'
    },
    views: 8920,
    likes: 256,
    comment_count: 45,
    favorite_count: 124,
    tags: [
      { id: 3, name: 'Performance', color: '#F59E0B', weight: 9, type: 2 },
      { id: 4, name: 'Web', color: '#8B5CF6', weight: 7, type: 2 }
    ],
    published_date: '2025-10-15T10:30:00Z',
    update_date: '2025-10-16T09:00:00Z'
  },
  {
    id: 3,
    code: 'art_9c4de2f5a6b78901',
    title: 'Building a design system that scales',
    content:
      '<p>Design systems are the foundation of consistent user experiences. Here is our approach.</p>',
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2070&auto=format&fit=crop',
    description:
      'Lessons learned from building and maintaining a design system used across multiple products.',
    status: 1,
    audit_reason: null,
    category_id: 5,
    category_name: 'Design',
    author: 'Alex Rivera',
    user: {
      id: 3,
      nickname: 'Alex Rivera',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      description: '设计系统负责人'
    },
    views: 6750,
    likes: 198,
    comment_count: 32,
    favorite_count: 76,
    tags: [
      { id: 5, name: 'Design System', color: '#EC4899', weight: 10, type: 2 },
      { id: 6, name: 'UI', color: '#6366F1', weight: 8, type: 2 }
    ],
    published_date: '2025-11-02T14:00:00Z',
    update_date: '2025-11-03T11:00:00Z'
  },
  {
    id: 4,
    code: 'art_1a2b3c4d5e6f7890',
    title: 'Getting started with our REST API',
    content: '<p>This tutorial walks you through the basics of integrating with our REST API.</p>',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    description: 'A step-by-step guide to authenticating and making your first API calls.',
    status: 1,
    audit_reason: null,
    category_id: 4,
    category_name: 'Tutorial',
    author: 'Mike Johnson',
    user: {
      id: 4,
      nickname: 'Mike Johnson',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
      description: '开发者关系工程师'
    },
    views: 15230,
    likes: 412,
    comment_count: 67,
    favorite_count: 203,
    tags: [
      { id: 7, name: 'API', color: '#14B8A6', weight: 9, type: 2 },
      { id: 8, name: 'Tutorial', color: '#F97316', weight: 7, type: 2 }
    ],
    published_date: '2025-11-20T09:00:00Z',
    update_date: '2025-11-20T09:00:00Z'
  },
  {
    id: 5,
    code: 'art_2b3c4d5e6f7a8901',
    title: 'New dashboard features for better insights',
    content:
      '<p>We have added new visualization tools to help you understand your data better.</p>',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    description:
      'Explore the latest dashboard updates including custom reports and real-time analytics.',
    status: 1,
    audit_reason: null,
    category_id: 3,
    category_name: 'Product',
    author: 'Emily Zhang',
    user: {
      id: 5,
      nickname: 'Emily Zhang',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60',
      description: '产品经理'
    },
    views: 9840,
    likes: 287,
    comment_count: 41,
    favorite_count: 95,
    tags: [
      { id: 9, name: 'Analytics', color: '#0EA5E9', weight: 8, type: 2 },
      { id: 10, name: 'Dashboard', color: '#A855F7', weight: 7, type: 2 }
    ],
    published_date: '2025-12-05T11:00:00Z',
    update_date: '2025-12-06T10:00:00Z'
  },
  {
    id: 6,
    code: 'art_3c4d5e6f7a8b9012',
    title: 'Why we migrated from REST to GraphQL',
    content: '<p>The journey of migrating our API layer and what we learned along the way.</p>',
    image:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    description:
      'A technical deep-dive into our decision to adopt GraphQL and the migration process.',
    status: 1,
    audit_reason: null,
    category_id: 2,
    category_name: 'Engineering',
    author: 'David Kim',
    user: {
      id: 6,
      nickname: 'David Kim',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
      description: '架构师'
    },
    views: 11200,
    likes: 356,
    comment_count: 58,
    favorite_count: 167,
    tags: [
      { id: 11, name: 'GraphQL', color: '#E11D48', weight: 9, type: 2 },
      { id: 7, name: 'API', color: '#14B8A6', weight: 8, type: 2 }
    ],
    published_date: '2026-01-10T08:30:00Z',
    update_date: '2026-01-11T09:00:00Z'
  }
]

/** 获取文章分类列表 */
export const getMockArticleCategories = (): MockArticleCategory[] => ARTICLE_CATEGORIES

/** 获取文章列表（支持分页和分类筛选） */
export const getMockArticles = (params?: {
  page?: number
  pageSize?: number
  category_id?: number
}): {
  articles: MockArticle[]
  pagination: { page: number; pageSize: number; total: number; pages: number }
} => {
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const categoryId = params?.category_id

  let filtered = ARTICLES
  if (categoryId !== undefined && categoryId !== null) {
    filtered = ARTICLES.filter((a) => a.category_id === categoryId)
  }

  const total = filtered.length
  const pages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const articles = filtered.slice(start, start + pageSize)

  return {
    articles,
    pagination: { page, pageSize, total, pages }
  }
}
