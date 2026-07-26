/**
 * 文章类型定义
 * 对应接口文档中的 Article 数据模型
 */

/** 文章标签 */
export interface ArticleTag {
  id: number
  name: string
  color: string
  weight: number
  type: number // 1-商品 2-文章 3-通用
}

/** 文章分类 */
export interface ArticleCategory {
  id: number
  name: string
  parent_id: number | null
  is_displayed: number
  sort_order: number
  children: ArticleCategory[]
}

/** 文章关联用户（发布者） */
export interface ArticleUser {
  id: number
  nickname: string
  avatar: string
  description: string
}

/** 文章评论统计（仅详情接口返回） */
export interface CommentStatistics {
  root_comments: number
  reply_comments: number
  total_comments: number
  total_likes: number
}

/** 文章对象 */
export interface Article {
  id: number
  code: string // 文章业务编码（用于路由，如 art_72ffe9c2935446d2）
  title: string
  content: string
  image: string
  description: string
  status: number
  audit_reason: string | null
  category_id: number
  category_name: string
  author: string // 作者名（字符串）
  user: ArticleUser | null // 发布者信息（含头像/昵称）
  views: number
  likes: number | null
  comment_count: number | null
  favorite_count: number
  tags: ArticleTag[]
  published_date: string // ISO8601 UTC
  update_date: string // ISO8601 UTC
  comment_statistics?: CommentStatistics // 仅文章详情接口返回
}

/** 评论对象 */
export interface Comment {
  id: number
  article_id: number
  user_id: number
  user_nickname: string
  user_avatar: string
  content: string
  parent_id: number
  level: number
  like_count: number
  reply_count: number
  created_at: string
  children: Comment[]
}

// --- 向后兼容类型（供旧组件使用，新代码请使用 Article） ---

export interface Author {
  name: string
  role: string
  avatar: string
}

export interface BlogPost {
  id: number
  code: string
  title: string
  excerpt: string
  category: string
  image: string
  author: Author
  date: string
  readTime?: string
  isHero?: boolean
}
