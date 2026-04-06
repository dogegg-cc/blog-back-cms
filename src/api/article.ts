import request from '@/utils/request'
import type { ArticleListItem, ArticleQuery, PaginatedResult } from './types'

/**
 * 获取文章列表
 */
export function getArticleList(params: ArticleQuery) {
  return request<PaginatedResult<ArticleListItem>>({
    url: '/api/blog/article/list',
    method: 'get',
    params
  })
}

/**
 * 批量删除文章
 */
export function deleteArticles(ids: string[]) {
  return request({
    url: '/api/blog/article/delete',
    method: 'delete',
    data: { ids }
  })
}
