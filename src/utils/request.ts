import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'
import { config } from '@/config'
import { API_CODE, TOKEN_HEADER } from '@/config/constants'

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
})

// 请求拦截器
service.interceptors.request.use(
  (innerConfig) => {
    const token = getToken()
    if (token) {
      // 从常量中获取请求头名称
      innerConfig.headers[TOKEN_HEADER] = token
    }
    return innerConfig
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 如果 code 不为 SUCCESS，则判断为错误
    if (res.code !== API_CODE.SUCCESS) {
      ElMessage.error(res.message || 'Error')

      // 处理 Token 失效相关的错误码
      const authErrorCodes = [
        API_CODE.UNAUTHORIZED,
        API_CODE.MISSING_TOKEN,
        API_CODE.TOKEN_PARSE_ERROR
      ]
      if (authErrorCodes.includes(res.code)) {
        removeToken()
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.data
    }
  },
  (error) => {
    ElMessage.error(error.message || '网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

import type { AxiosRequestConfig } from 'axios'

export default service as {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>;
  <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  options<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}
