<template>
  <div class="category-edit-container">
    <el-page-header @back="router.back()">
      <template #content>
        <span class="header-title">编辑分类 - {{ categoryForm.name || "加载中..." }}</span>
      </template>
    </el-page-header>

    <div class="main-content">
      <el-row :gutter="24">
        <!-- 左侧：基础信息 -->
        <el-col :span="8">
          <el-card shadow="never" class="info-card">
            <template #header>
              <div class="card-header">
                <span>分类基础信息</span>
              </div>
            </template>
            <el-form
              ref="categoryFormRef"
              :model="categoryForm"
              :rules="categoryRules"
              label-position="top"
            >
              <el-form-item label="分类名称" prop="name">
                <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
              </el-form-item>
              <el-form-item label="别名 (Slug)" prop="slug">
                <el-input v-model="categoryForm.slug" placeholder="请输入别名" />
                <p class="form-tip">用于 URL 路径，仅支持小写字母、数字和连字符</p>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="handleUpdateCategory">
                  保存基本信息
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧：标签管理 -->
        <el-col :span="16">
          <el-card shadow="never" class="tag-card">
            <template #header>
              <div class="card-header">
                <span>标签管理</span>
                <div class="header-actions">
                  <el-button type="primary" link :icon="Plus" @click="showAddTagInput = true">
                    添加标签
                  </el-button>
                </div>
              </div>
            </template>

            <!-- 快速添加标签 -->
            <div v-if="showAddTagInput" class="add-tag-box">
              <el-input
                v-model="newTagName"
                placeholder="在此输入标签名称"
                class="tag-input"
                @keyup.enter="handleAddTag"
              >
                <template #append>
                  <el-button @click="handleAddTag">添加</el-button>
                </template>
              </el-input>
              <el-button type="info" link @click="showAddTagInput = false">取消</el-button>
            </div>

            <el-table v-loading="tagLoading" :data="tagList" style="width: 100%">
              <el-table-column label="标签名称" min-width="200">
                <template #default="{ row }">
                  <div v-if="row.isEditing" class="editing-cell">
                    <el-input
                      v-model="row.editName"
                      size="small"
                      @keyup.enter="handleSaveTag(row)"
                      @keyup.esc="cancelEditTag(row)"
                    />
                    <div class="edit-actions">
                      <el-button color="#67c23a" :icon="Check" circle size="small" @click="handleSaveTag(row)" />
                      <el-button color="#f56c6c" :icon="Close" circle size="small" @click="cancelEditTag(row)" />
                    </div>
                  </div>
                  <span v-else>{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="right">
                <template #default="{ row }">
                  <el-button
                    v-if="!row.isEditing"
                    type="primary"
                    link
                    @click="startEditTag(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="!row.isEditing"
                    type="danger"
                    link
                    @click="handleDeleteTag(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="!tagLoading && tagList.length === 0" description="暂无标签，点击右上方添加" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Check, Close } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { getCategoryList, updateCategory } from "@/api/category";
import { getTagList, createTag, updateTag, deleteTags } from "@/api/tag";
import type { TagResponse } from "@/api/types";

const route = useRoute();
const router = useRouter();
const categoryId = route.params.id as string;

// 分类基本信息
const categoryFormRef = ref<FormInstance>();
const saving = ref(false);
const categoryForm = reactive({
  name: "",
  slug: "",
});

const categoryRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  slug: [
    { required: true, message: "请输入别名", trigger: "blur" },
    { pattern: /^[a-z0-9-]+$/, message: "仅支持小写字母、数字和连字符", trigger: "blur" },
  ],
});

// 标签列表
interface TagItem extends TagResponse {
  isEditing: boolean;
  editName: string;
}
const tagLoading = ref(false);
const tagList = ref<TagItem[]>([]);
const showAddTagInput = ref(false);
const newTagName = ref("");

// 初始化加载
const loadData = async () => {
  try {
    // 获取分类详情 (由于没有单个获取接口，从列表中查)
    const categories = await getCategoryList();
    const current = categories.find((c) => c.id === categoryId);
    if (current) {
      categoryForm.name = current.name;
      categoryForm.slug = current.slug;
    } else {
      ElMessage.error("未找到该分类");
      router.back();
      return;
    }

    // 获取所属标签
    fetchTags();
  } catch (error) {
    console.error("加载失败", error);
  }
};

const fetchTags = async () => {
  tagLoading.value = true;
  try {
    const res = await getTagList(categoryId);
    tagList.value = res.map((tag) => ({
      ...tag,
      isEditing: false,
      editName: tag.name,
    }));
  } finally {
    tagLoading.value = false;
  }
};

// 更新分类
const handleUpdateCategory = async () => {
  if (!categoryFormRef.value) return;
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        await updateCategory(categoryId, categoryForm);
        ElMessage.success("保存成功");
      } finally {
        saving.value = false;
      }
    }
  });
};

// 标签操作
const handleAddTag = async () => {
  if (!newTagName.value.trim()) {
    ElMessage.warning("标签名称不能为空");
    return;
  }
  try {
    await createTag({
      name: newTagName.value.trim(),
      categoryId,
    });
    ElMessage.success("添加成功");
    newTagName.value = "";
    showAddTagInput.value = false;
    fetchTags();
  } catch (error) {
    console.error("添加标签失败", error);
  }
};

const startEditTag = (row: TagItem) => {
  row.editName = row.name;
  row.isEditing = true;
};

const cancelEditTag = (row: TagItem) => {
  row.isEditing = false;
};

const handleSaveTag = async (row: TagItem) => {
  if (!row.editName.trim()) {
    ElMessage.warning("名称不能为空");
    return;
  }
  if (row.editName === row.name) {
    row.isEditing = false;
    return;
  }
  try {
    await updateTag(row.id, { name: row.editName.trim() });
    ElMessage.success("更新成功");
    row.name = row.editName;
    row.isEditing = false;
  } catch (error) {
    console.error("更新标签失败", error);
  }
};

const handleDeleteTag = (row: TagItem) => {
  ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？`, "提示", {
    type: "warning",
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
  }).then(async () => {
    try {
      await deleteTags([row.id]);
      ElMessage.success("删除成功");
      fetchTags();
    } catch (error) {
      console.error("删除标签失败", error);
    }
  });
};

onMounted(loadData);
</script>

<style lang="less" scoped>
.category-edit-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .header-title {
    font-weight: 600;
  }

  .main-content {
    margin-top: 24px;

    .info-card,
    .tag-card {
      height: 100%;
      border-radius: 8px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }

    .form-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }

    .add-tag-box {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f8f9fb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 12px;

      .tag-input {
        width: 300px;
      }
    }

    .editing-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .edit-actions {
        display: flex;
        gap: 4px;
      }
    }
  }
}
</style>
