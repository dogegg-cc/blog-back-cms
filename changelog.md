# 更新日志 (Changelog)

## [1.0.0] - 2026-04-06

### ✨ 新增特性 (Added)
- **身份认证工具类 (auth.ts)**:
  - 抽离了 `localStorage` 的 Token 操作（获取、设置、移除）。
  - 统一了系统中对 `blog_token` 的访问入口。
- **登录页面 (LoginView)**:
  - 提供了带背景渐变的精致登录界面。
  - 集成了表单校验（用户名/密码长度及必填项）。
  - 实现了基于 `localStorage` 的 Mock 登录跳转逻辑。
  - **路由守卫**: 实现了全局前置守卫，确保未登录用户强制重定向至 `/login`，已登录用户不可重复进入登录页。
- **项目规约**: 初始化了 [`.antigravity.rules`](file:///Users/jiao/Desktop/Project/blog/blog-back-cms/.antigravity.rules) 规约文件，确立了 Antigravity 协助开发标准。
- **自动导入系统**: 集成 `unplugin-auto-import` 和 `unplugin-vue-components`。现在 Element Plus 组件及库函数无需手动导入即可在代码中直接使用。
- **基础布局 (BaseLayout)**:
  - 采用了标准的 `Sidebar` + `Navbar` + `Main` 结构。
  - 支持侧边栏响应式折叠逻辑。
  - 集成了页面切换的平滑过渡动画 (`fade-transform`)。
- **状态管理**: 引入 Pinia 并创建了 `app` store，用于持久化侧边栏的折叠状态。
- **仪表盘 (Dashboard)**: 提供了基础的数据统计卡片示例页面。
- **全局样式**: 提供了包含全屏重置和滚动条美化的 `main.css`。

### 🔧 优化与修复 (Fixed)
- **Vite 修正**: 将 `vite` 版本从 `^8.0.3` 降级至当前主流稳定的 `^6.0.0`，解决了插件间的 `peerDependencies` 冲突。
- **组件规范**: 将所有单单词组件重命名为符合 Vue 规范的多单词形式（如 `AppSidebar`, `AppNavbar`, `DashboardView`）。
- **国际化**: 在 `App.vue` 中配置了 Element Plus 的中文语言包 (`zh-cn`)。

### 📐 路由配置 (Routing)
- 初始化了 Vue Router 并配置了基于 `BaseLayout` 的嵌套路由结构。

---

> [!NOTE]
> 本次更新为项目搭建了完整的后台管理系统骨架，开发环境现已就绪。
