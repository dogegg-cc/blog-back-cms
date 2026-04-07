<template>
  <el-dialog
    v-model="visible"
    title="选择文章"
    width="900px"
    top="5vh"
    append-to-body
    destroy-on-close
    class="article-select-dialog"
  >
    <div class="article-select-container">
      <el-form :inline="true" :model="query" class="search-bar" size="default">
        <el-form-item label="分类">
          <el-select 
            v-model="query.categoryId" 
            placeholder="全部分类" 
            clearable 
            style="width: 150px"
            @change="handleCategoryChange"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select 
            v-model="query.tagId" 
            placeholder="全部标签" 
            clearable 
            :disabled="!query.categoryId"
            style="width: 150px"
          >
            <el-option
              v-for="item in availableTags"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <div v-loading="loading" class="grid-wrapper">
        <div v-if="articleList.length > 0" class="article-grid">
          <div 
            v-for="item in articleList" 
            :key="item.id"
            class="article-card"
            :class="{ active: isSelected(item) }"
            @click="toggleSelection(item)"
          >
            <!-- 背景图/渐变 -->
            <div 
              class="card-bg"
              :style="getCardStyle(item)"
            ></div>
            
            <!-- 蒙版 -->
            <div class="card-mask"></div>

            <!-- 分类标签 (右上角) -->
            <div v-if="item.category" class="card-category">
              {{ item.category.name }}
            </div>

            <!-- 内容区域 -->
            <div class="card-content">
              <h4 class="card-title">{{ item.title }}</h4>
              <p class="card-intro">{{ item.summary || '暂无简介' }}</p>
              
              <div class="card-footer">
                <div class="card-tags">
                  <span v-for="tag in item.tags?.slice(0, 2)" :key="tag.id" class="mini-tag">
                    #{{ tag.name }}
                  </span>
                  <span v-if="(item.tags?.length || 0) > 2" class="mini-tag">...</span>
                </div>
              </div>
            </div>

            <!-- 选中标记 -->
            <div class="select-indicator">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无匹配文章" />
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.limit"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <span class="selected-count">已选择 {{ selectedArticles.length }} 篇文章</span>
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedArticles.length === 0">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { Search, Check } from '@element-plus/icons-vue';
import { getArticleList } from '@/api/article';
import { getCategoryList } from '@/api/category';
import { getFullImageUrl } from '@/utils/url';
import type { ArticleListItem, CategoryResponse } from '@/api/types';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const visible = ref(props.modelValue);
const loading = ref(false);
const articleList = ref<ArticleListItem[]>([]);
const total = ref(0);
const selectedArticles = ref<ArticleListItem[]>([]);

// 元数据
const categories = ref<CategoryResponse[]>([]);

const query = reactive({
  page: 1,
  limit: 12, // 网格展示建议增加每页数量
  categoryId: '',
  tagId: '',
});

// 计算当前分类下的可用标签
const availableTags = computed(() => {
  if (!query.categoryId) return [];
  const category = categories.value.find(c => c.id === query.categoryId);
  return category?.tags || [];
});

const handleCategoryChange = () => {
  query.tagId = ''; // 切换分类时清空标签
};

watch(() => props.modelValue, (val) => {
  visible.value = val;
  if (val) {
    handleSearch();
    selectedArticles.value = []; // 每次打开清空选择，或根据需求保留
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const loadMeta = async () => {
  try {
    const cData = await getCategoryList();
    categories.value = cData;
  } catch (error) {
    console.error('Failed to load metadata', error);
  }
};

const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await getArticleList(query);
    articleList.value = res.items;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  query.page = page;
  handleSearch();
};

const isSelected = (item: ArticleListItem) => {
  return selectedArticles.value.some(a => a.id === item.id);
};

const toggleSelection = (item: ArticleListItem) => {
  const index = selectedArticles.value.findIndex(a => a.id === item.id);
  if (index > -1) {
    selectedArticles.value.splice(index, 1);
  } else {
    selectedArticles.value.push(item);
  }
};

const getCardStyle = (item: ArticleListItem) => {
  if (item.bannerUrl) {
    return {
      backgroundImage: `url(${getFullImageUrl(item.bannerUrl)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  // 随机或固定渐变兜底
  return {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
};

const handleConfirm = () => {
  emit('select', selectedArticles.value);
  visible.value = false;
};

onMounted(() => {
    loadMeta();
});
</script>

<style lang="less" scoped>
.article-select-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}

.article-select-container {
  .search-bar {
    margin-bottom: 20px;
    padding: 12px;
    background: #f8f9fb;
    border-radius: 8px;
  }

  .grid-wrapper {
    min-height: 300px;
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    max-height: 500px;
    overflow-y: auto;
    padding: 4px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e4e7ed;
      border-radius: 3px;
    }
  }

  .article-card {
    position: relative;
    height: 140px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    }

    &.active {
      border-color: #409eff;
      
      .select-indicator {
        opacity: 1;
        transform: scale(1);
      }
    }

    .card-bg {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    .card-mask {
      position: absolute;
      inset: 0;
      z-index: 2;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
    }

    .card-category {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 3;
      padding: 2px 8px;
      background: rgba(64, 158, 255, 0.9);
      color: #fff;
      font-size: 10px;
      border-radius: 4px;
      font-weight: 500;
    }

    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 3;
      padding: 10px;
      color: #fff;

      .card-title {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-intro {
        margin: 0 0 8px;
        font-size: 11px;
        opacity: 0.8;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-tags {
        display: flex;
        gap: 4px;
        .mini-tag {
          font-size: 9px;
          opacity: 0.7;
        }
      }
    }

    .select-indicator {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 4;
      width: 20px;
      height: 20px;
      background: #409eff;
      color: #fff;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

.selected-count {
  float: left;
  line-height: 32px;
  font-size: 13px;
  color: #606266;
}
</style>
