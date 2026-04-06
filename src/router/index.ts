import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: '登录',
      component: () => import('@/views/login/LoginView.vue'),
    },
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

import { getToken } from '@/utils/auth'

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = getToken()
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
