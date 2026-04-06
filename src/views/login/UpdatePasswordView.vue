<template>
  <div class="update-pwd-container">
    <el-card class="update-pwd-card" shadow="always">
      <div class="title-area">
        <h2>修改密码</h2>
        <p>首次登录或安全要求，请修改您的初始密码</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            :prefix-icon="Check"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-button"
          :loading="loading"
          @click="handleSubmit"
        >
          确 认 修 改
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Check } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { updatePassword } from '@/api/user'
import { setUpdatePasswordStatus } from '@/utils/auth'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await updatePassword({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword
        })
        
        ElMessage.success('密码修改成功')
        // 更新标志位
        setUpdatePasswordStatus(true)
        // 进入系统
        router.push('/')
      } finally {
        loading.value = false
      }
    }
  })
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

    .submit-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 10px;
    }
  }
}
</style>
