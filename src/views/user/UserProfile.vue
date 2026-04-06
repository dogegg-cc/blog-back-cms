<template>
  <div class="user-profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="profile-form"
        v-loading="loading"
      >
        <div class="profile-layout">
          <!-- 左侧：基本信息 -->
          <div class="form-main">
            <el-form-item label="用户姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="Github" prop="github">
              <el-input v-model="form.github" placeholder="Github 个人主页地址">
                <template #prefix>
                  <el-icon><Share /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="个人简介" prop="slogan">
              <el-input
                v-model="form.slogan"
                type="textarea"
                :rows="4"
                placeholder="这一刻的想法..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="handleSubmit">
                保存修改
              </el-button>
            </el-form-item>
          </div>

          <!-- 右侧：头像上传 -->
          <div class="form-aside">
            <el-form-item label="" label-width="0">
              <div class="avatar-upload-wrapper">
                <el-upload
                  class="avatar-uploader"
                  :action="`${IMAGE_BASE_URL}/api/upload/image`"
                  :headers="{ dogtoken: getToken() ?? '' }"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  name="file"
                >
                  <img v-if="form.avatar" :src="getFullImageUrl(form.avatar)" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                  <div class="upload-tip">点击上传新头像</div>
                </el-upload>
              </div>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { updateInfo } from "@/api/user";
import { IMAGE_BASE_URL, getFullImageUrl } from "@/utils/url";
import { getToken } from "@/utils/auth";
import { ElMessage, type FormInstance, type UploadProps } from "element-plus";
import { Plus, Share } from "@element-plus/icons-vue";
import type { UpdateUserParams } from "@/api/types";

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const submitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  github: "",
  slogan: "",
  avatar: "",
});

const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  email: [{ type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] }],
};

// 初始化表单数据
const initForm = () => {
  if (userStore.userInfo) {
    form.name = userStore.userInfo.name || "";
    form.email = userStore.userInfo.email || "";
    form.github = userStore.userInfo.github || "";
    form.slogan = userStore.userInfo.slogan || "";
    form.avatar = userStore.userInfo.avatar || "";
  }
};

onMounted(() => {
  initForm();
});

// 头像上传逻辑
const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (
    rawFile.type !== "image/jpeg" &&
    rawFile.type !== "image/png" &&
    rawFile.type !== "image/gif"
  ) {
    ElMessage.error("头像必须是图片格式 (JPG/PNG/GIF)!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

const handleAvatarSuccess: UploadProps["onSuccess"] = (response) => {
  if (response.code === 1 && response.data?.url) {
    form.avatar = response.data.url;
    ElMessage.success("上传成功");
  } else {
    ElMessage.error("上传失败");
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const payload: UpdateUserParams = {
          name: form.name,
          email: form.email || undefined,
          github: form.github || undefined,
          slogan: form.slogan || undefined,
          avatar: form.avatar || undefined,
        };
        const updatedInfo = await updateInfo(payload);

        // 更新全局状态
        userStore.setUserInfo(updatedInfo);

        ElMessage.success("个人资料已更新");
      } catch {
        // 全局拦截器会处理错误提示
      } finally {
        submitting.value = false;
      }
    }
  });
};
</script>

<style lang="less" scoped>
.user-profile-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .profile-card {
    max-width: 900px;
    margin: 0 auto;
    border-radius: 12px;
  }

  .card-header {
    font-weight: 600;
    font-size: 16px;
  }

  .profile-layout {
    display: flex;
    gap: 40px;
    padding: 20px 0;

    .form-main {
      flex: 1;
    }

    .form-aside {
      width: 240px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  .avatar-upload-wrapper {
    text-align: center;

    .avatar-uploader {
      border: 1px dashed #dcdfe6;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 160px;
      height: 160px;
      transition: border-color 0.3s;

      &:hover {
        border-color: #409eff;
      }

      .avatar {
        width: 160px;
        height: 160px;
        display: block;
        object-fit: cover;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 160px;
        height: 160px;
        line-height: 160px;
        text-align: center;
      }

      .upload-tip {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        font-size: 12px;
        padding: 4px 0;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .upload-tip {
        opacity: 1;
      }
    }
  }
}
</style>
