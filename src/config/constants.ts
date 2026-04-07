/**
 * 全局业务常量
 */

/**
 * 分页配置
 */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 20, 50, 100];

/**
 * 日期格式配置
 */
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm';
export const DATE_ONLY_FORMAT = 'YYYY-MM-DD';

/**
 * 本地存储 Key
 */
export const STORAGE_KEYS = {
  TOKEN: 'blog_token',
  UPDATE_PWD_STATUS: 'is_update_password',
  USER_INFO: 'blog_user_info',
} as const;

/**
 * 请求头相关
 */
export const TOKEN_HEADER = 'dogtoken';

/**
 * API 响应状态码 (业务层)
 */
export const API_CODE = {
  SUCCESS: 1,
  UNAUTHORIZED: 10005,
  MISSING_TOKEN: 10006,
  TOKEN_PARSE_ERROR: 10007,
} as const;
