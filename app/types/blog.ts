// types/blog.ts
export interface Author {
  name: string
  role: string
  avatar: string
}

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  category: string // e.g., 'Engineering', 'Announcements'
  image: string
  author: Author
  date: string
  readTime?: string
  isHero?: boolean
}
