import request from '@/utils/request'

/**
 * 获取分类文章占比数据
 */
export function getCategoryRatio() {
  return request.get<Array<{ name: string; value: number }>>('/api/blog/statistics/category-ratio')
}

/**
 * 获取分类平均热度数据
 */
export function getCategoryPopularity() {
  return request.get<Array<{ name: string; value: number }>>('/api/blog/statistics/category-popularity')
}

/**
 * 获取文章发布趋势数据
 */
export function getPostTrend() {
  return request.get<Array<{ label: string; value: number }>>('/api/blog/statistics/post-trend')
}

/**
 * 获取全站统计汇总数据
 */
export function getStatisticsSummary() {
  return request.get<{
    articleCount: number
    categoryCount: number
    tagCount: number
    totalViews: number
  }>('/api/blog/statistics/summary')
}

