<template>
  <div class="article-list-container">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="分类">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择分类"
            clearable
            @change="handleQuery"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="queryParams.tagId"
            placeholder="请选择标签"
            clearable
            @change="handleQuery"
          >
            <el-option v-for="item in tagList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="table-actions">
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量删除 {{ selectedIds.length ? `(${selectedIds.length})` : "" }}
        </el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="articleList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.bannerUrl"
              style="width: 80px; height: 50px; border-radius: 4px"
              :src="getFullImageUrl(row.bannerUrl)"
              :preview-src-list="[getFullImageUrl(row.bannerUrl)]"
              preview-teleported
              fit="cover"
            />
            <span v-else style="color: #999; font-size: 12px">暂无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="summary" label="简介" min-width="250" show-overflow-tooltip />
        <el-table-column label="分类/标签" width="200">
          <template #default="{ row }">
            <div class="category-tag-cell">
              <el-tag v-if="row.category" size="small" type="success" effect="plain" class="m-1">
                {{ row.category.name }}
              </el-tag>
              <template v-if="row.tags && row.tags.length">
                <el-tag v-for="tag in row.tags" :key="tag.id" size="small" type="info" class="m-1">
                  {{ tag.name }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读" width="100" align="center" sortable />
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt ? dayjs(row.createdAt).format("YYYY-MM-DD HH:mm") : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ row.updatedAt ? dayjs(row.updatedAt).format("YYYY-MM-DD HH:mm") : "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleSingleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getArticleList, deleteArticles } from "@/api/article";
import { getCategoryList } from "@/api/category";
import { getTagList } from "@/api/tag";
import type { ArticleListItem, ArticleQuery, CategoryResponse, TagResponse } from "@/api/types";
import { getFullImageUrl } from "@/utils/url";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";

const router = useRouter();

// 数据加载状态
const loading = ref(false);
const articleList = ref<ArticleListItem[]>([]);
const total = ref(0);
const categoryList = ref<CategoryResponse[]>([]);
const tagList = ref<TagResponse[]>([]);
const selectedIds = ref<string[]>([]);

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  categoryId: undefined as string | undefined,
  tagId: undefined as string | undefined,
});

// 获取基础数据
const fetchStaticData = async () => {
  try {
    const [categories, tags] = await Promise.all([getCategoryList(), getTagList()]);
    categoryList.value = categories;
    tagList.value = tags;
  } catch (error) {
    console.error("获取基础数据失败", error);
  }
};

// 获取文章列表
const fetchArticleList = async () => {
  loading.value = true;
  try {
    // 过滤掉值为 null/undefined/空字符串 的参数，避免后端校验或过滤逻辑错误
    const params = Object.fromEntries(
      Object.entries(queryParams).filter(([, v]) => v != null && v !== ""),
    ) as unknown as ArticleQuery;
    const res = await getArticleList(params);
    articleList.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

// 筛选与分页
const handleQuery = () => {
  queryParams.page = 1;
  fetchArticleList();
};

const resetQuery = () => {
  queryParams.categoryId = undefined;
  queryParams.tagId = undefined;
  handleQuery();
};

const handleSizeChange = (val: number) => {
  queryParams.limit = val;
  fetchArticleList();
};

const handleCurrentChange = (val: number) => {
  queryParams.page = val;
  fetchArticleList();
};

// 选中处理
const handleSelectionChange = (selection: ArticleListItem[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 编辑文章
const handleEdit = (row: ArticleListItem) => {
  router.push(`/article/edit/${row.id}`);
};

// 删除文章逻辑
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return;
  doDelete(selectedIds.value);
};

const handleSingleDelete = (row: ArticleListItem) => {
  doDelete([row.id]);
};

const doDelete = async (ids: string[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${ids.length} 篇文章吗？一旦删除不可恢复！`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      },
    );

    await deleteArticles(ids);
    ElMessage.success("操作成功");

    // 如果当前页删完了，往前跳一页
    if (articleList.value.length === ids.length && queryParams.page > 1) {
      queryParams.page--;
    }
    fetchArticleList();
  } catch (err) {
    // 处理取消或错误
    if (err !== "cancel") {
      console.error("删除操作失败", err);
    }
  }
};

onMounted(() => {
  fetchStaticData();
  fetchArticleList();
});
</script>

<style lang="less" scoped>
.article-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);

  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      display: flex;
      flex-wrap: wrap;
    }

    .filter-summary {
      margin-top: 12px;
      padding: 8px 12px;
      background-color: #f8f9fb;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        font-size: 13px;
        color: #606266;
      }

      .filter-tag {
        margin-right: 4px;
      }
    }

    .table-actions {
      border-top: 1px solid #ebeef5;
      padding-top: 15px;
      margin-top: 10px;
    }
  }

  .table-card {
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .category-tag-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .m-1 {
      margin: 2px;
    }
  }
  .el-form--inline {
    .el-form-item {
      .el-input,
      .el-cascader,
      .el-select,
      .el-autocomplete {
        width: 240px;
      }
    }
  }
}

:deep(.el-table__row) {
  height: 60px;
}
</style>
