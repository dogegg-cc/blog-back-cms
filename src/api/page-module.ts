import request from "@/utils/request";
import type { PageModuleResponseDto, CreatePageModuleParams, UpdatePageModuleParams } from "./types";

/**
 * 获取首页模块列表
 */
export function getPageModuleList() {
  return request<PageModuleResponseDto[]>({
    url: "/api/pageModule",
    method: "get",
  });
}

/**
 * 创建首页模块
 */
export function createPageModule(data: CreatePageModuleParams) {
  return request<PageModuleResponseDto>({
    url: "/api/pageModule",
    method: "post",
    data,
  });
}

/**
 * 更新首页模块（支持局部更新，如 isActive）
 */
export function updatePageModule(id: string, data: UpdatePageModuleParams) {
  return request<PageModuleResponseDto>({
    url: `/api/pageModule/${id}`,
    method: "patch",
    data,
  });
}

/**
 * 删除首页模块
 */
export function deletePageModule(id: string) {
  return request({
    url: `/api/pageModule/${id}`,
    method: "delete",
  });
}
