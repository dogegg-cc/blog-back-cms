<template>
  <div class="page-module-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">首页信息流配置</span>
          <div class="actions">
            <template v-if="!isReorderMode">
              <el-button :icon="Rank" @click="handleEnterReorder" :disabled="moduleList.length <= 1">
                调整排序
              </el-button>
              <el-button type="primary" :icon="Plus" @click="handleCreate">
                添加模块
              </el-button>
            </template>
            <template v-else>
              <el-button @click="handleCancelReorder">取消</el-button>
              <el-button type="primary" :loading="reorderLoading" @click="handleSaveReorder">
                保存排序
              </el-button>
            </template>
          </div>
        </div>
      </template>

      <div class="table-wrapper" :class="{ 'is-reorder-active': isReorderMode }">
        <el-table :data="moduleList" v-loading="loading" style="width: 100%" :row-key="'id'">
          <el-table-column v-if="isReorderMode" width="60" align="center">
            <template #default>
              <el-icon class="drag-handle"><Rank /></el-icon>
            </template>
          </el-table-column>

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
                :disabled="isReorderMode"
                @change="(val: any) => handleStatusChange(row, val as boolean)"
              />
            </template>
          </el-table-column>

          <el-table-column label="创建 / 修改时间" width="200">
            <template #default="{ row }">
              <div class="time-info text-secondary">
                <div><span class="dot create"></span> 创：{{ row.createdAt ? dayjs(row.createdAt).format(DATE_FORMAT) : "-" }}</div>
                <div><span class="dot update"></span> 修：{{ row.updatedAt ? dayjs(row.updatedAt).format(DATE_FORMAT) : "-" }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :disabled="isReorderMode" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" :disabled="isReorderMode" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { Plus, Rank } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPageModuleList, deletePageModule, updatePageModule, reorderPageModules } from "@/api/page-module";
import { PAGE_MODULE_TYPE_MAP, PAGE_MODULE_STYLE_MAP } from "@/config/pageModule";
import type { PageModuleResponseDto } from "@/api/types";
import dayjs from "dayjs";
import { DATE_FORMAT } from "@/config/constants";
import Sortable from "sortablejs";

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

// 排序模式控制
const isReorderMode = ref(false);
const reorderLoading = ref(false);
let sortableInstance: Sortable | null = null;

const initSortable = async () => {
  await nextTick();
  const el = document.querySelector(".is-reorder-active .el-table__body-wrapper tbody");
  if (!el) return;

  sortableInstance = new Sortable(el as HTMLElement, {
    handle: ".drag-handle",
    animation: 150,
    ghostClass: "ghost-row",
    onEnd: (evt: Sortable.SortableEvent) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
        // 同步 Vue 数据顺序
        const list = [...moduleList.value];
        const [currRow] = list.splice(oldIndex, 1);
        if (currRow) {
            list.splice(newIndex, 0, currRow);
            moduleList.value = list;
        }
      }
    },
  });
};

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
};

const handleEnterReorder = () => {
  isReorderMode.value = true;
  initSortable();
};

const handleCancelReorder = () => {
  destroySortable();
  isReorderMode.value = false;
  loadData(); // 恢复原始顺序
};

const handleSaveReorder = async () => {
  reorderLoading.value = true;
  try {
    const ids = moduleList.value.map(item => item.id);
    await reorderPageModules(ids);
    ElMessage({
        message: "模块排序已成功保存",
        type: "success",
        duration: 3000,
        showClose: true
    });
    destroySortable();
    isReorderMode.value = false;
    loadData();
  } catch (err) {
      console.error('Reorder error:', err);
      // 错误由请求拦截器提示
  } finally {
    reorderLoading.value = false;
  }
};

const handleCreate = () => {
    router.push('/page-module/create');
};

const handleEdit = (row: PageModuleResponseDto) => {
    router.push(`/page-module/edit/${row.id}`);
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

    .actions {
        display: flex;
        gap: 12px;
    }
  }

  .drag-handle {
      cursor: move;
      font-size: 20px;
      color: #409eff;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
          background-color: rgba(64, 158, 255, 0.1);
          transform: scale(1.1);
      }
  }

  .is-reorder-active {
      user-select: none; // 禁止文字全选，防止干扰拖拽
      
      :deep(.el-table__row) {
          cursor: move;
      }
  }

  :deep(.ghost-row) {
      opacity: 0.5;
      background: #c8ebfb !important;
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
