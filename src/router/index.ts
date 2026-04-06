import { createRouter, createWebHistory } from "vue-router";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { getToken, getUpdatePasswordStatus, removeToken } from "@/utils/auth";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "登录",
      component: () => import("@/views/login/LoginView.vue"),
      meta: { hidden: true },
    },
    {
      path: "/update-password",
      name: "修改密码",
      component: () => import("@/views/login/UpdatePasswordView.vue"),
      meta: { hidden: true },
    },
    {
      path: "/",
      component: BaseLayout,
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "仪表盘",
          component: () => import("@/views/dashboard/DashboardView.vue"),
          meta: { icon: "Menu" },
        },
        {
          path: "article",
          name: "内容管理",
          meta: { icon: "Document" },
          redirect: "/article/list",
          children: [
            {
              path: "list",
              name: "文章列表",
              component: () => import("@/views/article/ArticleList.vue"),
              meta: {},
            },
            {
              path: "create",
              name: "新建文章",
              component: () => import("@/views/article/ArticleForm.vue"),
              meta: { hidden: true },
            },
            {
              path: "edit/:id",
              name: "编辑文章",
              component: () => import("@/views/article/ArticleForm.vue"),
              meta: { hidden: true },
            },
            {
              path: "category",
              name: "分类管理",
              component: () => import("@/views/category/CategoryList.vue"),
              meta: {},
            },
            {
              path: "tag",
              name: "标签管理",
              component: () => import("@/views/tag/TagList.vue"),
              meta: {},
            },
          ],
        },
        {
          path: "user/profile",
          name: "个人信息",
          component: () => import("@/views/user/UserProfile.vue"),
          meta: { icon: "User", hidden: true },
        },
        {
          path: "user",
          name: "用户管理",
          component: () => import("@/views/dashboard/DashboardView.vue"), // 临时占位，稍后由用户补充
          meta: { icon: "User" },
        },
      ],
    },
  ],
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = getToken();
  const isUpdatePassword = getUpdatePasswordStatus();
  const userStore = useUserStore();

  if (to.path === "/login") {
    if (token) {
      next("/");
    } else {
      next();
    }
    return;
  }

  // 未登录
  if (!token) {
    next("/login");
    return;
  }

  // 已登录，检查是否已有用户信息（处理页面刷新）
  if (token && !userStore.userInfo) {
    try {
      await userStore.getInfo();
    } catch {
      // 获取失败（可能 Token 到期），清理并去登录
      removeToken();
      next("/login");
      return;
    }
  }

  // 已登录，但未修改初始密码且不在改密页
  if (!isUpdatePassword && to.path !== "/update-password") {
    next("/update-password");
    return;
  }

  // 已登录且已修改密码，访问改密页（可选，通常允许进入，但此处可重定向或放行）
  next();
});

export default router;
