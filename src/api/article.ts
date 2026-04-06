import request from "@/utils/request";
import type {
  ArticleListItem,
  ArticleQuery,
  PaginatedResult,
  ArticleDetail,
  CreateArticleParams,
  UpdateArticleParams,
} from "./types";

/**
 * 获取文章列表
 */
export function getArticleList(params: ArticleQuery) {
  return request<PaginatedResult<ArticleListItem>>({
    url: "/api/blog/article/list",
    method: "get",
    params,
  });
}

/**
 * 批量删除文章
 */
export function deleteArticles(ids: string[]) {
  return request({
    url: "/api/blog/article/delete",
    method: "delete",
    data: { ids },
  });
}

/**
 * 获取文章详情
 */
export function getArticleDetail(id: string) {
  return request<ArticleDetail>({
    url: `/api/blog/article/${id}`,
    method: "get",
  });
}

/**
 * 创建文章
 */
export function createArticle(data: CreateArticleParams) {
  return request<ArticleDetail>({
    url: "/api/blog/article/add",
    method: "post",
    data,
  });
}

/**
 * 更新文章（ID 拼接在 URL 中）
 */
export function updateArticle(id: string, data: UpdateArticleParams) {
  return request<ArticleDetail>({
    url: `/api/blog/article/update/${id}`,
    method: "put",
    data,
  });
}
