<template>
  <div class="category-list-container">
    <el-card class="action-card" shadow="never">
      <div class="header-actions">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增分类</el-button>
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
            placeholder="搜索分类名称或别名"
            class="search-input"
            clearable
            :prefix-icon="Search"
          />
        </div>
      </div>
    </el-card>

    <div v-loading="loading" class="category-grid">
      <el-row :gutter="20">
        <el-col
          v-for="item in filteredList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="category-col"
        >
          <el-card
            class="category-item-card"
            :class="{ active: selectedIds.includes(item.id) }"
            shadow="hover"
          >
            <template #header>
              <div class="card-header">
                <el-checkbox
                  :model-value="selectedIds.includes(item.id)"
                  @change="(val: boolean) => handleCheckboxChange(val, item.id)"
                />
                <span class="category-name">{{ item.name }}</span>
              </div>
            </template>
            <div class="card-content">
              <div class="info-item">
                <span class="label">别名 (Slug):</span>
                <el-tag size="small" type="info" effect="plain">{{ item.slug }}</el-tag>
              </div>
              <div v-if="item.tags && item.tags.length > 0" class="info-item tags-item">
                <span class="label">标签:</span>
                <div class="tag-wrapper">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag.id"
                    size="small"
                    type="success"
                    class="m-1"
                  >
                    {{ tag.name }}
                  </el-tag>
                </div>
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

      <el-empty v-if="!loading && filteredList.length === 0" description="未发现分类" />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="别名" prop="slug">
          <el-input v-model="form.slug" placeholder="请输入分类别名 (Slug)" />
          <div class="form-tip">通常用于 URL 路径，建议使用英文、数字和连字符</div>
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
import { useRouter } from "vue-router";
import { Plus, Delete, Edit, Search } from "@element-plus/icons-vue";
import { getCategoryList, createCategory, updateCategory, deleteCategories } from "@/api/category";
import type { CategoryResponse, CreateCategoryParams } from "@/api/types";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();

// 数据载入状态
const loading = ref(false);
const submitLoading = ref(false);
const categoryList = ref<CategoryResponse[]>([]);
const selectedIds = ref<string[]>([]);
const searchQuery = ref("");

// 对话框表单
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const form = reactive({
  id: "",
  name: "",
  slug: "",
});

const rules = reactive<FormRules>({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  slug: [
    { required: true, message: "请输入分类别名", trigger: "blur" },
    { pattern: /^[a-z0-9-]+$/, message: "只能包含小写字母、数字和连字符", trigger: "blur" },
  ],
});

// 获取数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getCategoryList();
    categoryList.value = res;
  } catch (error) {
    console.error("获取分类列表失败", error);
  } finally {
    loading.value = false;
  }
};

// 列表筛选
const filteredList = computed(() => {
  if (!searchQuery.value) return categoryList.value;
  const query = searchQuery.value.toLowerCase();
  return categoryList.value.filter(
    (item) => item.name.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query),
  );
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
  form.slug = "";
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (item: CategoryResponse) => {
  router.push(`/article/category/edit/${item.id}`);
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
          await updateCategory(form.id, form as CreateCategoryParams);
          ElMessage.success("分类更新成功");
        } else {
          await createCategory(form as CreateCategoryParams);
          ElMessage.success("分类创建成功");
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
const handleSingleDelete = (item: CategoryResponse) => {
  doDelete([item.id]);
};

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return;
  doDelete(selectedIds.value);
};

const doDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${ids.length} 个分类吗？这将导致关联的文章失去该分类。`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await deleteCategories(ids);
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
.category-list-container {
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

  .category-grid {
    .category-col {
      margin-bottom: 20px;
    }

    .category-item-card {
      height: 100%;
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

        .category-name {
          font-weight: bold;
          font-size: 16px;
          color: #303133;
        }
      }

      .card-content {
        min-height: 40px;

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;

          .label {
            font-size: 13px;
            color: #909399;
            flex-shrink: 0;
            padding-top: 2px;
          }

          &.tags-item {
            margin-top: 12px;
            
            .tag-wrapper {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;

              .m-1 {
                margin: 0;
              }
            }
          }
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

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.4;
  }
}
</style>
