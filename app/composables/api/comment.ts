import type { Comment } from '~/types/blog'

/** 创建评论请求体 */
export interface CreateCommentPayload {
  article_id: number
  content: string
  parent_id?: number
}

/**
 * 评论模块 API 封装
 * 前缀: /comments
 * 部分接口需要鉴权
 */
export function useCommentApi() {
  const { get, post, del } = useApi()

  /**
   * 发表评论
   * POST /comments/create
   * 需要鉴权
   */
  async function create(payload: CreateCommentPayload) {
    return await post<Comment>('/comments/create', {
      ...payload,
      parent_id: payload.parent_id ?? 0
    })
  }

  /**
   * 获取文章评论列表
   * GET /comments/article/<article_id>
   */
  async function getByArticle(articleId: number) {
    return await get<{ comments: Comment[]; total: number }>(`/comments/article/${articleId}`)
  }

  /**
   * 评论点赞
   * POST /comments/<comment_id>/like
   * 需要鉴权
   */
  async function like(commentId: number) {
    return await post<{ is_liked: boolean; like_count: number }>(`/comments/${commentId}/like`)
  }

  /**
   * 删除评论
   * DELETE /comments/<comment_id>/delete
   * 需要鉴权（仅评论作者或管理员）
   */
  async function remove(commentId: number) {
    return await del<null>(`/comments/${commentId}/delete`)
  }

  /**
   * 获取用户评论列表
   * GET /comments/user/<user_id>
   */
  async function getByUser(userId: number) {
    return await get<{ comments: Comment[]; total: number }>(`/comments/user/${userId}`)
  }

  /**
   * 获取文章评论统计
   * GET /comments/statistics/<article_id>
   */
  async function statistics(articleId: number) {
    return await get<{ total: number; today: number }>(`/comments/statistics/${articleId}`)
  }

  return { create, getByArticle, like, remove, getByUser, statistics }
}
