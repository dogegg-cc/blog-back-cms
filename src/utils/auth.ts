const TOKEN_KEY = 'blog_token'

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
}
