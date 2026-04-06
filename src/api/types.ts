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
