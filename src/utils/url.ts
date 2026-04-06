/**
 * 图片预览基础路径 (建议根据环境变量配置，当前硬编码对应后端地址)
 */
export const IMAGE_BASE_URL = 'http://localhost:3001'

/**
 * 补全图片 URL
 * @param path 后端返回的半路径
 * @returns 完整的图片预览地址
 */
export const getFullImageUrl = (path?: string | null): string => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${IMAGE_BASE_URL}${normalizedPath}`
}
