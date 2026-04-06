<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="login-title">
        <h2>博客管理系统</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
          {{ loading ? "登录中..." : "登 录" }}
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance } from "element-plus";

const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const loginRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于 6 位", trigger: "blur" },
  ],
};

import { setToken, setUpdatePasswordStatus } from "@/utils/auth";
import { logon } from "@/api/user";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const data = await logon({
          username: loginForm.username,
          password: loginForm.password
        });

        ElMessage.success("登录成功");
        
        // 存储 Token 和 改密状态
        setToken(data.token);
        setUpdatePasswordStatus(data.isUpdatePassword);

        // 存储用户信息
        userStore.setUserInfo({
            name: data.name ?? null,
            email: data.email ?? null,
            github: data.github ?? null,
            slogan: data.slogan ?? null,
            avatar: data.avatar ?? null,
            isUpdatePassword: data.isUpdatePassword
        });

        // 如果需要修改密码，跳转到改密页
        if (!data.isUpdatePassword) {
            router.push("/update-password");
        } else {
            router.push("/");
        }
      } catch {
        // 错误控制交由 request.ts 中的全局拦截处理
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style lang="less" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #6499af 0%, #ffdcda 100%);

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 20px;
    border-radius: 12px;

    .login-title {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        margin: 0;
        font-size: 28px;
        color: #303133;
        letter-spacing: 1px;
      }

      p {
        margin: 10px 0 0;
        color: #909399;
        font-size: 14px;
      }
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-bottom: 20px;
      margin-top: 20px;
    }

    .login-footer {
      text-align: center;
      font-size: 14px;
      color: #606266;
      gap: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
