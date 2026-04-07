/**
 * 应用基础配置
 */

const env = import.meta.env;

export const config = {
  // API 基础地址
  apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // 应用标题
  appTitle: env.VITE_APP_TITLE || 'Blog Back CMS',
  
  // 应用版本 (通常从 package.json 获取，这里手动指定或通过 vite 插件注入)
  appVersion: '1.0.0',
} as const;

export default config;
