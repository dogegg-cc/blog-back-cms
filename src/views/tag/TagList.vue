<template>
  <div class="tag-list-container">
    <el-card class="action-card" shadow="never">
      <div class="header-actions">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增标签</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 {{ selectedIds.length ? `(${selectedIds.length})` : "" }}
          </el-button>
        </div>
        <div class="right">
          <el-input
            v-model="searchQuery"
            placeholder="搜索标签名称"
            class="search-input"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </div>
    </el-card>

    <div v-loading="loading" class="tag-grid">
      <el-row :gutter="20">
        <el-col
          v-for="item in filteredList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="tag-col"
        >
          <el-card
            class="tag-item-card"
            :class="{ active: selectedIds.includes(item.id) }"
            shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <el-checkbox
                  :model-value="selectedIds.includes(item.id)"
                  @change="(val: boolean) => handleCheckboxChange(val, item.id)"
                />
                <span class="tag-name">{{ item.name }}</span>
              </div>
            </template>
            <div class="card-content">
              <!-- 根据用户要求，标签仅显示名称，卡片更紧凑 -->
              <div class="tag-info-preview">
                <el-tag size="small" effect="dark" round># {{ item.name }}</el-tag>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" link :icon="Edit" @click="handleEdit(item)">编辑</el-button>
              <el-divider direction="vertical" />
              <el-button type="danger" link :icon="Delete" @click="handleSingleDelete(item)">
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && filteredList.length === 0" description="未发现标签" />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="400px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="60px" status-icon>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确认 {{ isEdit ? "保存" : "创建" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Plus, Delete, Edit, Search } from "@element-plus/icons-vue";
import { getTagList, createTag, updateTag, deleteTags } from "@/api/tag";
import type { TagResponse, CreateTagParams } from "@/api/types";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

// 数据载入状态
const loading = ref(false);
const submitLoading = ref(false);
const tagList = ref<TagResponse[]>([]);
const selectedIds = ref<string[]>([]);
const searchQuery = ref("");

// 对话框表单
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  id: "",
  name: "",
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: "请输入标签名称", trigger: "blur" }],
});

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getTagList();
    tagList.value = res;
  } catch (error) {
    console.error("获取标签列表失败", error);
  } finally {
    loading.value = false;
  }
};

// 列表筛选
const filteredList = computed(() => {
  if (!searchQuery.value) return tagList.value;
  const query = searchQuery.value.toLowerCase();
  return tagList.value.filter((item) => item.name.toLowerCase().includes(query));
});

// 选中处理
const handleCheckboxChange = (val: boolean, id: string) => {
  if (val) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
  } else {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }
};

// 新增
const handleAdd = () => {
  isEdit.value = false;
  form.id = "";
  form.name = "";
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (item: TagResponse) => {
  isEdit.value = true;
  form.id = item.id;
  form.name = item.name;
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEdit.value) {
          // PUT 请求拼接 ID 到 URL
          await updateTag(form.id, { name: form.name } as CreateTagParams);
          ElMessage.success("标签更新成功");
        } else {
          await createTag({ name: form.name } as CreateTagParams);
          ElMessage.success("标签创建成功");
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        console.error("提交失败", error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 删除逻辑
const handleSingleDelete = (item: TagResponse) => {
  doDelete([item.id]);
};

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return;
  doDelete(selectedIds.value);
};

const doDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${ids.length} 个标签吗？该操作不可撤销。`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await deleteTags(ids);
    ElMessage.success("删除成功");
    // 清空选中
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败", error);
    }
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.tag-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .action-card {
    margin-bottom: 20px;

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-input {
        width: 300px;
      }
    }
  }

  .tag-grid {
    .tag-col {
      margin-bottom: 20px;
    }

    .tag-item-card {
      transition: all 0.3s;
      border: 1px solid transparent;

      &.active {
        border-color: var(--el-color-primary);
        background-color: #f0f7ff;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .tag-name {
          font-weight: bold;
          font-size: 16px;
          color: #303133;
        }
      }

      .card-content {
        min-height: 40px;
        display: flex;
        align-items: center;

        .tag-info-preview {
          width: 100%;
        }
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;
      }
    }
  }
}
</style>
