import request from "@/utils/request";
import type { TagResponse, CreateTagParams } from "./types";

/**
 * 获取所有标签列表
 */
export function getTagList() {
  return request<TagResponse[]>("/api/blog/tag/list");
}

/**
 * 创建标签
 */
export function createTag(data: CreateTagParams) {
  return request({
    url: "/api/blog/tag/add",
    method: "post",
    data,
  });
}

/**
 * 更新标签 (ID 拼接在 URL 中)
 */
export function updateTag(id: string, data: CreateTagParams) {
  return request({
    url: `/api/blog/tag/update/${id}`,
    method: "put",
    data,
  });
}

/**
 * 批量删除标签
 */
export function deleteTags(ids: string[]) {
  return request({
    url: "/api/blog/tag/delete",
    method: "delete",
    data: { ids },
  });
}
