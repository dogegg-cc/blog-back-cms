import request from "@/utils/request";
import type { PaginatedMediaResult } from "./types";

/**
 * 获取媒体库图片列表
 * @param params 分页参数
 */
export function getMediaList(params: { page: number; limit: number }) {
  // 注意：用户给出的完整 URL 是 http://localhost:3001/system/media/static-images?page=1&limit=5
  // 根据项目现有的拦截逻辑，这里使用相对路径 /system/media/static-images
  return request<PaginatedMediaResult>({
    url: "/system/media/static-images",
    method: "get",
    params,
  });
}
