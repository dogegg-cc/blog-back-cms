import request from '@/utils/request'
import type { TagResponse } from './types'

/**
 * 获取所有标签列表
 */
export function getTagList() {
  return request<TagResponse[]>('/api/blog/tag/list')
}
