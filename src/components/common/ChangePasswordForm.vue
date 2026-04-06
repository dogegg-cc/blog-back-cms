<template>
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

    <slot name="footer" :loading="loading" :submit="handleSubmit">
      <el-button
        type="primary"
        style="width: 100%"
        :loading="loading"
        @click="handleSubmit"
      >
        保 存 修 改
      </el-button>
    </slot>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Check } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { updatePassword } from '@/api/user'

const props = defineProps<{
  // 额外请求后的自定义回调
  onSuccess?: () => void
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirm = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
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
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
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
        if (props.onSuccess) {
          props.onSuccess()
        }
        emit('success')
      } finally {
        loading.value = false
      }
    }
  })
}

// 供外部访问的重置方法
const resetFields = () => {
  formRef.value?.resetFields()
}

defineExpose({
  resetFields,
  submit: handleSubmit
})
</script>
