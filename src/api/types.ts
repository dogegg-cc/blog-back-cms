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
  avatarItem?: PhotoItemDto | null;
}

export interface PhotoMetadataDto {
  // 图片中等路径
  mediumUrl: string;
  // 图片缩略图路径
  thumbnailUrl: string;
}

export interface PhotoItemDto {
  // 图片id
  id: string;
  // 图片原始路径
  originalUrl: string;
  // 图片元数据
  metadata?: PhotoMetadataDto | null;
  // 图片高度
  height: number;
  // 图片宽度
  width: number;
  // 图片比例
  ratio: number;
  // 图片类型
  mimetype: string;
  // 创建时间
  createdAt: string;
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
  avatarItem?: PhotoItemDto | null;
}

/**
 * 更新用户信息参数
 */
export interface UpdateUserParams {
  name?: string;
  email?: string;
  github?: string;
  slogan?: string;
  avatarId?: string;
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
  tags?: TagResponse[];
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
  categoryId: string;
}

/**
 * 更新标签参数 (只能修改名称)
 */
export interface UpdateTagParams {
  name: string;
}

/**
 * 文章列表条目信息
 */
export interface ArticleListItem {
  id: string;
  title: string;
  summary?: string | null;
  bannerItem?: PhotoItemDto | null;
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
  bannerItem?: PhotoItemDto | null;
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
  bannerId?: string;
  content: string;
  categoryId?: string;
  tagIds?: string[];
}

/**
 * 更新文章参数
 */
export type UpdateArticleParams = CreateArticleParams;

/**
 * 文章简要信息（用于首页模块内容铺开）
 */
export interface ArticleSummaryDto {
  id: string;
  title: string;
  summary?: string | null;
  bannerItem?: PhotoItemDto | null;
  category?: CategoryResponse | null;
  tags?: TagResponse[];
}

/**
 * 首页模块内容结构
 */
export interface PageModuleContent {
  articleIds?: string[];
  articles?: ArticleSummaryDto[];
  photoIds?: string[];
  photoItems?: PhotoItemDto[];
}

/**
 * 首页模块响应模型
 */
export interface PageModuleResponseDto {
  id: string;
  title: string;
  type: "POST_LIST" | "PHOTO_GALLERY" | string;
  intro?: string | null;
  styleType: string;
  sortOrder: number;
  content: PageModuleContent;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建首页模块参数
 */
export interface CreatePageModuleParams {
  title: string;
  type: string;
  intro?: string;
  styleType: string;
  sortOrder: number;
  content: {
    articleIds?: string[];
    photoIds?: string[];
  };
  isActive: boolean;
}

/**
 * 更新首页模块参数
 */
export type UpdatePageModuleParams = Partial<CreatePageModuleParams>;
/**
 * 媒体库单项数据
 */
export interface MediaItem {
  url: string;
  name: string;
}

/**
 * 媒体库分页返回
 */
export type PaginatedMediaResult = PaginatedResult<PhotoItemDto>;
