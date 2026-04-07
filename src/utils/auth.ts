import { STORAGE_KEYS } from '@/config/constants'

const TOKEN_KEY = STORAGE_KEYS.TOKEN
const UPDATE_PWD_KEY = STORAGE_KEYS.UPDATE_PWD_STATUS

/**
 * 获取 Token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置 Token
 * @param token 字符串 Token
 */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除 Token (用于登出)
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(UPDATE_PWD_KEY)
}

/**
 * 获取“是否已修改密码”标志
 */
export function getUpdatePasswordStatus() {
  return localStorage.getItem(UPDATE_PWD_KEY) === 'true'
}

/**
 * 设置“是否已修改密码”标志
 */
export function setUpdatePasswordStatus(status: boolean | string) {
  localStorage.setItem(UPDATE_PWD_KEY, String(status))
}
