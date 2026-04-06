<template>
  <div class="page-module-edit-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">{{ id ? '编辑信息流模块' : '添加信息流模块' }}</span>
          <el-button @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <PageModuleForm
        v-if="!loading"
        :initial-data="moduleData"
        :submitting="submitting"
        @save="handleSave"
        @cancel="handleBack"
      />
      <div v-else v-loading="true" style="height: 300px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import PageModuleForm from '@/components/page-module/PageModuleForm.vue';
import { getPageModuleList, createPageModule, updatePageModule } from '@/api/page-module';
import type { PageModuleResponseDto, CreatePageModuleParams, UpdatePageModuleParams } from '@/api/types';

const route = useRoute();
const router = useRouter();
const id = ref(route.params.id as string);

const loading = ref(false);
const submitting = ref(false);
const moduleData = ref<PageModuleResponseDto | null>(null);

const handleBack = () => {
  router.push('/page-module/list');
};

const loadModuleDetail = async () => {
  if (!id.value) return;
  
  loading.value = true;
  try {
    // 后端没有获取单个 ID 的接口，由于数据量小且之前已有 list 接口，我们可以暂用获取 list 后过滤的方式，或者建议后端添加单个接口。
    // 这里为了演示目的先从 list 中找。
    const list = await getPageModuleList();
    const target = list.find(item => item.id === id.value);
    if (!target) {
      ElMessage.error('该模块不存在');
      handleBack();
      return;
    }
    moduleData.value = target;
  } finally {
    loading.value = false;
  }
};

const handleSave = async (formData: CreatePageModuleParams | UpdatePageModuleParams) => {
  submitting.value = true;
  try {
    if (id.value) {
      await updatePageModule(id.value, formData);
      ElMessage.success('修改成功');
    } else {
      await createPageModule(formData as CreatePageModuleParams);
      ElMessage.success('添加成功');
    }
    handleBack();
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadModuleDetail();
});
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
