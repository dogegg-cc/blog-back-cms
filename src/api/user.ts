import request from "@/utils/request";
import type { LoginParams, LoginResponse, UpdatePasswordParams } from "./types";

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
