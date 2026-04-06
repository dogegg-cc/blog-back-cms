import request from '@/utils/request'
import type { CategoryResponse } from './types'

/**
 * 获取所有分类列表
 */
export function getCategoryList() {
  return request<CategoryResponse[]>('/api/blog/category/list')
}
