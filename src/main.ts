import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/assets/main.css'
// Element Plus 样式由于使用了自动导入插件，无需手动加载组件样式，但在 main.ts 需要引入基础样式（可选，插件会自动处理组件样式）
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
