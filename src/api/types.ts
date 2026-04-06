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
  name?: string | null;
  email?: string | null;
  github?: string | null;
  slogan?: string | null;
  avatar?: string | null;
}

/**
 * 用户详细信息（API 返回格式）
 */
export interface UserInfoDto {
  name: string | null;
  email: string | null;
  github: string | null;
  slogan: string | null;
  avatar: string | null;
  isUpdatePassword: boolean;
}

/**
 * 更新用户信息参数
 */
export interface UpdateUserParams {
  name?: string;
  email?: string;
  github?: string;
  slogan?: string;
  avatar?: string;
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
  slug: string;
  description?: string;
}

/**
 * 创建分类参数
 */
export interface CreateCategoryParams {
  name: string;
  slug: string;
}

/**
 * 标签基础信息
 */
export interface TagResponse {
  id: string;
  name: string;
}

/**
 * 创建标签参数
 */
export interface CreateTagParams {
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
/**
 * 文章详情（用于编辑回显）
 */
export interface ArticleDetail {
  id: string;
  title: string;
  summary?: string | null;
  bannerUrl?: string | null;
  content: string;
  category?: CategoryResponse | null;
  tags?: TagResponse[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建文章参数
 */
export interface CreateArticleParams {
  title: string;
  summary?: string;
  /** 提交给服务器的半路径 */
  bannerUrl?: string;
  content: string;
  categoryId?: string;
  tagIds?: string[];
}

/**
 * 更新文章参数
 */
export type UpdateArticleParams = CreateArticleParams;
