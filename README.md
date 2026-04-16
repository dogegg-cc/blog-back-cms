# SoftAurora Blog CMS (blog-back-cms)

![Vue3](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.x-409EFF?logo=element-plus)

`blog-back-cms` 是一个专为 **SoftAurora Blog** 打造的高性能、响应式后台管理系统。采用 Vue 3 生态最新技术栈，提供全功能的博客内容生产与配置管理体验。

## ✨ 功能特性

- 📊 **数据看板**: 基于 ECharts 的多维度统计，实时掌握文章热度、分类分布及发布趋势。
- 📝 **文章管理**: 支持 Markdown 全屏协作编辑（集成 Vditor），具备分页、批量操作及精细化表单校验。
- 📂 **分类与标签**: 结构化的内容归档系统，支持增删改查及关联统计。
- 🧩 **页面模块配置**: 高度灵活的自定义模块管理，支持拖拽排序（Vuedraggable）。
- 🖼️ **媒体中心**: 集中的图片与资源管理。
- 🔐 **用户系统**: 完备的登录鉴权与个人中心。
- ⚡ **极致规范**: 集成 Oxlint 与 Oxfmt，提供极速的代码检查与格式化体验。

## 🛠️ 技术栈

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **构建工具**: [Vite 6](https://vitejs.dev/)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **类型安全**: [TypeScript](https://www.typescriptlang.org/)
- **CSS 增强**: [Less](https://lesscss.org/)
- **辅助库**: Axios (请求), ECharts (图表), Vditor (编辑器), Vuedraggable (拖拽)

## 📂 目录结构

```text
src/
├── api/            # API 接口定义与类型声明
├── assets/         # 静态资源 (样式、图标、图片)
├── components/     # 全局复用组件
├── config/         # 项目全局配置
├── layouts/        # 页面布局容器
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
├── utils/          # 工具函数封装 (Request, Storage等)
├── views/          # 业务逻辑页面模块
└── main.ts         # 入口文件
```

## 🚀 快速上手

### 环境要求
- **Node.js**: `^20.19.0` 或 `>=22.12.0`
- **Package Manager**: `npm` (推荐)

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 构建生产环境
```bash
npm run build
```

### 代码规范与检查
```bash
# 执行全量检查并修复
npm run lint

# 仅执行代码格式化 (基于 Oxfmt)
npm run format
```

## 📋 开发规约

1. **响应结构**: 后端交互遵循标准 `ResponseDto`，格式为 `{ code, data, message }`。
2. **样式隔离**: 组件内 CSS 需使用 `scoped` 属性，并优先使用内置的 CSS 变量。
3. **类型驱动**: 所有 API 接口及其响应数据必须在 `src/api/types.ts` 中定义严格的 TypeScript interface。

---
由 **Antigravity** 协助驱动。
