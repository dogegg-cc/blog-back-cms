<template>
  <div class="navbar">
    <div class="left">
      <el-icon @click="toggleSidebar" class="fold-btn">
        <Expand v-if="appStore.sidebarCollapsed" />
        <Fold v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="route.name">{{ route.name }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right">
      <el-dropdown trigger="click">
        <span class="user-info">
          <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="username">管理员</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { removeToken } from '@/utils/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    removeToken()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>

<style scoped>
.navbar {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.left {
  display: flex;
  align-items: center;
}

.fold-btn {
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
  color: #606266;
}

.fold-btn:hover {
  color: #409EFF;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.username {
  font-size: 14px;
}
</style>
