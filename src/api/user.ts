import request from "@/utils/request";
import type { LoginParams, LoginResponse, UpdatePasswordParams, UserInfoDto, UpdateUserParams } from "./types";

/**
 * 用户登录
 */
export function logon(data: LoginParams) {
  return request<LoginResponse>({
    url: "/api/user/logon",
    method: "post",
    data,
  });
}

/**
 * 退出登录
 */
export function logoff() {
  return request({
    url: "/api/user/logoff",
    method: "post",
  });
}

/**
 * 修改密码
 */
export function updatePassword(data: UpdatePasswordParams) {
  return request({
    url: "/api/user/updatePassword",
    method: "post",
    data,
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request<UserInfoDto>({
    url: "/api/user/info",
    method: "get",
  });
}

/**
 * 更新用户信息
 */
export function updateInfo(data: UpdateUserParams) {
  return request<UserInfoDto>({
    url: "/api/user/update",
    method: "post",
    data,
  });
}
