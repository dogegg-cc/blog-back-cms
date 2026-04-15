<template>
  <div class="page-module-edit-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ id ? "编辑信息流模块" : "添加信息流模块" }}</span>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <PageModuleForm
        :module-id="id"
        :submitting="submitting"
        @save="handleSave"
        @cancel="handleBack"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import PageModuleForm from "@/components/page-module/PageModuleForm.vue";
import { createPageModule, updatePageModule } from "@/api/page-module";
import type { CreatePageModuleParams, UpdatePageModuleParams } from "@/api/types";

const route = useRoute();
const router = useRouter();
const id = ref(route.params.id as string);

const submitting = ref(false);

const handleBack = () => {
  router.push("/page-module/list");
};

const handleSave = async (formData: CreatePageModuleParams | UpdatePageModuleParams) => {
  submitting.value = true;
  try {
    if (id.value) {
      await updatePageModule(id.value, formData);
      ElMessage.success("修改成功");
    } else {
      await createPageModule(formData as CreatePageModuleParams);
      ElMessage.success("添加成功");
    }
    handleBack();
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="less" scoped>
.page-module-edit-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}
</style>
