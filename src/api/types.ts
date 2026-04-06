/**
 * 登录参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  isUpdatePassword: boolean;
}

/**
 * 修改密码参数
 */
export interface UpdatePasswordParams {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * 分类基础信息
 */
export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
}

/**
 * 标签基础信息
 */
export interface TagResponse {
  id: string;
  name: string;
}

/**
 * 文章列表条目信息
 */
export interface ArticleListItem {
  id: string;
  title: string;
  summary?: string | null;
  bannerUrl?: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category?: CategoryResponse | null;
  tags?: TagResponse[];
}

/**
 * 文章查询参数
 */
export interface ArticleQuery {
  page: number;
  limit: number;
  categoryId?: string;
  tagId?: string;
}

/**
 * 分页包装结构
 */
export interface PaginatedResult<T> {
  total: number;
  items: T[];
}
