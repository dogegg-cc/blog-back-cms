<template>
  <div class="page-module-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">首页信息流配置</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            添加模块
          </el-button>
        </div>
      </template>

      <el-table :data="moduleList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="模块名称" min-width="150" />
        
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'POST_LIST' ? 'success' : 'warning'">
              {{ PAGE_MODULE_TYPE_MAP[row.type] || row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="intro" label="简介" show-overflow-tooltip min-width="180" />

        <el-table-column prop="styleType" label="样式类型" width="100" align="center">
            <template #default="{ row }">
                <el-tag effect="plain">{{ PAGE_MODULE_STYLE_MAP[row.styleType] || row.styleType }}</el-tag>
            </template>
        </el-table-column>

        <el-table-column label="激活状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              :loading="row.statusLoading"
              @change="(val: any) => handleStatusChange(row, val as boolean)"
            />
          </template>
        </el-table-column>

        <el-table-column label="创建 / 修改时间" width="200">
          <template #default="{ row }">
            <div class="time-info text-secondary">
              <div><span class="dot create"></span> 创：{{ formatDate(row.createdAt) }}</div>
              <div><span class="dot update"></span> 修：{{ formatDate(row.updatedAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPageModuleList, deletePageModule, updatePageModule } from "@/api/page-module";
import { PAGE_MODULE_TYPE_MAP, PAGE_MODULE_STYLE_MAP } from "@/config/pageModule";
import type { PageModuleResponseDto } from "@/api/types";

const router = useRouter();
const loading = ref(false);
const moduleList = ref<(PageModuleResponseDto & { statusLoading?: boolean })[]>([]);

const loadData = async () => {
  loading.value = true;
  try {
    const data = await getPageModuleList();
    moduleList.value = data.map(item => ({ ...item, statusLoading: false }));
  } finally {
    loading.value = false;
  }
};

const handleStatusChange = async (row: PageModuleResponseDto & { statusLoading?: boolean }, val: boolean) => {
  row.statusLoading = true;
  try {
    await updatePageModule(row.id, { isActive: val });
    ElMessage.success(`${val ? "激活" : "禁用"}成功`);
  } catch {
    row.isActive = !val; // 恢复状态
  } finally {
    row.statusLoading = false;
  }
};

const handleDelete = (row: PageModuleResponseDto) => {
  ElMessageBox.confirm(`确定要彻底删除首页模块 "${row.title}" 吗？`, "警告", {
    type: "warning",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    try {
      await deletePageModule(row.id);
      ElMessage.success("删除成功");
      loadData();
    } catch {
      // 错误由请求拦截器处理
    }
  });
};

const handleCreate = () => {
    router.push('/page-module/create');
};

const handleEdit = (row: PageModuleResponseDto) => {
    router.push(`/page-module/edit/${row.id}`);
};


const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${Y}-${M}-${D} ${h}:${m}`;
};

onMounted(loadData);
</script>

<style lang="less" scoped>
.page-module-container {
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
      color: #303133;
    }
  }

  .empty-text {
    font-size: 13px;
    color: #c0c4cc;
    font-style: italic;
  }

  .time-info {
    font-size: 12px;
    line-height: 1.6;

    .dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        margin-right: 4px;
        vertical-align: middle;
        
        &.create { background-color: #67c23a; }
        &.update { background-color: #409eff; }
    }
  }

  .text-secondary {
    color: #909399;
  }

  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
    
    .el-table__header-wrapper th {
        background-color: #f8f9fb;
    }
  }
}
</style>
