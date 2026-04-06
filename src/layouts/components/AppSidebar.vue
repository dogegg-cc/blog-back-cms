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
    <el-menu-item index="/dashboard">
      <el-icon><Menu /></el-icon>
      <template #title>仪表盘</template>
    </el-menu-item>

    <el-sub-menu index="/article">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>内容管理</span>
      </template>
      <el-menu-item index="/article/list">文章列表</el-menu-item>
      <el-menu-item index="/article/category">分类管理</el-menu-item>
    </el-sub-menu>

    <el-menu-item index="/user">
      <el-icon><User /></el-icon>
      <template #title>用户管理</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Menu, Document, User } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)
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
