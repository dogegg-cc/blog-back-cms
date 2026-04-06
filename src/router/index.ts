import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BaseLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: '仪表盘',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'article/list',
          name: '文章列表',
          component: () => import('@/views/dashboard/DashboardView.vue'), // 暂时复用仪表盘
        }
      ]
    }
  ],
})

export default router
