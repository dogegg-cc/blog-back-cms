<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="isCollapse"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <template v-for="item in menuList" :key="item.path">
      <!-- 有子菜单的情况 -->
      <el-sub-menu v-if="item.children" :index="item.path">
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="child.path"
        >
          {{ child.title }}
        </el-menu-item>
      </el-sub-menu>

      <!-- 无子菜单的情况 -->
      <el-menu-item v-else :index="item.path">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

// 获取需要显示的路由菜单
const menuList = computed(() => {
  // 找到根布局路由下的子路由
  const layoutRoute = router.options.routes.find(r => r.path === '/')
  if (!layoutRoute || !layoutRoute.children) return []

  // 格式化并过滤路由
  return layoutRoute.children
    .filter(item => !item.meta?.hidden)
    .map(item => {
      // 处理内容管理这种有二级菜单的情况
      if (item.children && item.children.length > 0) {
        return {
          title: item.name as string,
          path: item.path.startsWith('/') ? item.path : `/${item.path}`,
          icon: item.meta?.icon as string,
          children: item.children
            .filter(child => !child.meta?.hidden)
            .map(child => ({
              title: child.name as string,
              // 注意：子路由路径拼接逻辑（这里假设只有一层嵌套）
              path: child.path.startsWith('/') 
                ? child.path 
                : `${item.path.startsWith('/') ? item.path : '/' + item.path}/${child.path}`
            }))
        }
      }

      // 一级菜单
      return {
        title: item.name as string,
        path: item.path.startsWith('/') ? item.path : `/${item.path}`,
        icon: item.meta?.icon as string
      }
    })
})
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}
.sidebar-menu:not(.el-menu--collapse) {
  width: 210px;
}
</style>
