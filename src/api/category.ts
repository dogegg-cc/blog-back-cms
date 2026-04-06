import request from "@/utils/request";
import type { CategoryResponse, CreateCategoryParams } from "./types";

/**
 * 获取所有分类列表
 */
export function getCategoryList() {
  return request<CategoryResponse[]>("/api/blog/category/list");
}

/**
 * 创建分类
 */
export function createCategory(data: CreateCategoryParams) {
  return request({
    url: "/api/blog/category/add",
    method: "post",
    data,
  });
}

/**
 * 更新分类
 */
export function updateCategory(id: string, data: CreateCategoryParams) {
  return request({
    url: `/api/blog/category/update/${id}`,
    method: "put",
    data,
  });
}

/**
 * 批量删除分类
 */
export function deleteCategories(ids: string[]) {
  return request({
    url: "/api/blog/category/delete",
    method: "delete",
    data: { ids },
  });
}
