<template>
  <div class="update-pwd-container">
    <el-card class="update-pwd-card" shadow="always">
      <div class="title-area">
        <h2>修改密码</h2>
        <p>首次登录或安全要求，请修改您的初始密码</p>
      </div>

      <ChangePasswordForm @success="onUpdateSuccess" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { setUpdatePasswordStatus } from '@/utils/auth'
import ChangePasswordForm from '@/components/common/ChangePasswordForm.vue'

const router = useRouter()

const onUpdateSuccess = () => {
  // 更新本地改密状态
  setUpdatePasswordStatus(true)
  // 进入系统主页
  router.push('/')
}
</script>

<style lang="less" scoped>
.update-pwd-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6499af 0%, #ffdcda 100%);

  .update-pwd-card {
    width: 100%;
    max-width: 420px;
    padding: 20px;
    border-radius: 12px;

    .title-area {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }

      p {
        margin: 10px 0 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }
}
</style>
