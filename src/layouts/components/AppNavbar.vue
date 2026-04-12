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
          <el-avatar
            :size="30"
            :src="getFullImageUrl(userStore.userInfo?.avatarItem?.metadata?.thumbnailUrl)"
          />
          <span class="username">{{ userStore.userInfo?.name ?? "用户" }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/user/profile')">个人信息</el-dropdown-item>
            <el-dropdown-item @click="showUpdatePwd">修改密码</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="pwdDialogVisible"
      title="修改密码"
      width="400px"
      append-to-body
      @close="resetPwdForm"
    >
      <ChangePasswordForm ref="pwdFormRef" @success="pwdDialogVisible = false">
        <template #footer="{ loading, submit }">
          <div style="text-align: right; margin-top: 20px">
            <el-button @click="pwdDialogVisible = false">取 消</el-button>
            <el-button type="primary" :loading="loading" @click="submit">确 认</el-button>
          </div>
        </template>
      </ChangePasswordForm>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { Fold, Expand, ArrowDown } from "@element-plus/icons-vue";
import { removeToken } from "@/utils/auth";
import { ElMessageBox, ElMessage } from "element-plus";
import { logoff } from "@/api/user";
import { getFullImageUrl } from "@/utils/url";
import ChangePasswordForm from "@/components/common/ChangePasswordForm.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const toggleSidebar = () => {
  appStore.toggleSidebar();
};

// 修改密码弹窗控制
const pwdDialogVisible = ref(false);
const pwdFormRef = ref<InstanceType<typeof ChangePasswordForm>>();

const showUpdatePwd = () => {
  pwdDialogVisible.value = true;
};

const resetPwdForm = () => {
  pwdFormRef.value?.resetFields();
};

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    type: "warning",
  })
    .then(async () => {
      try {
        await logoff();
        removeToken();
        userStore.clearUserInfo();
        router.push("/login");
        ElMessage.success("已退出登录");
      } catch {
        // 错误由拦截器处理，但仍需清理本地状态以防万一或根据业务决定
        removeToken();
        userStore.clearUserInfo();
        router.push("/login");
      }
    })
    .catch(() => {});
};
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
  color: #409eff;
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
