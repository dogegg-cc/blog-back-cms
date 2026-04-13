<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="page-module-form">
    <div v-if="loading" class="form-loading" v-loading="true">
      <div class="loading-text">正在加载模块详情...</div>
    </div>
    <div v-else-if="fetchError" class="form-error">
      <el-result icon="error" title="加载失败" sub-title="无法获取模块详情，请检查网络或重试">
        <template #extra>
          <el-button type="primary" @click="props.moduleId && fetchDetail(props.moduleId)">
            重试
          </el-button>
        </template>
      </el-result>
    </div>
    <template v-else>
      <div class="form-body">
        <div class="section-title">基本配置</div>
        <el-row :gutter="40">
          <el-col :span="16">
            <el-form-item label="模块标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="主要显示的标题名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="模块简介" prop="intro">
              <el-input
                v-model="form.intro"
                type="textarea"
                :rows="3"
                placeholder="模块的描述信息（可选）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型" prop="type">
              <el-select
                v-model="form.type"
                :disabled="isEdit"
                placeholder="内容载体类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="item in PAGE_MODULE_TYPES"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="样式" prop="styleType">
              <el-select v-model="form.styleType" placeholder="渲染样式" style="width: 100%">
                <el-option
                  v-for="item in PAGE_MODULE_STYLE_TYPES"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="排序权重" prop="sortOrder">
              <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
            <el-form-item label="激活状态" prop="isActive">
              <el-switch v-model="form.isActive" active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />
        <div class="section-title">内容编排</div>

        <!-- 文章列表模式 -->
        <div v-if="form.type === 'POST_LIST'" class="content-config-card">
          <div class="content-header">
            <div class="tip">已选择的文章将按顺序在此模块中展示（可调整顺序）</div>
            <el-button type="primary" :icon="Plus" @click="showArticleSelect = true"
              >选取文章</el-button
            >
          </div>

          <div class="article-grid-container">
            <draggable
              v-model="selectedArticles"
              item-key="id"
              class="article-grid"
              animation="300"
              ghost-class="ghost-card"
            >
              <template #item="{ element, index }">
                <div class="article-card-wrapper">
                  <div class="article-card" :style="getCardStyle(element)">
                    <!-- 蒙版 -->
                    <div class="card-mask"></div>

                    <!-- 操作按钮 (右上角) -->
                    <div class="card-actions">
                      <el-icon class="action-btn del" @click.stop="removeArticle(index)"
                        ><Delete
                      /></el-icon>
                    </div>

                    <!-- 分类标签 (左上角) -->
                    <div v-if="element.category" class="card-category">
                      {{ element.category.name }}
                    </div>

                    <!-- 内容 -->
                    <div class="card-content">
                      <h4 class="card-title">{{ element.title }}</h4>
                      <p class="card-intro">{{ element.summary || "暂无简介" }}</p>
                      <div class="card-tags">
                        <span v-for="tag in element.tags?.slice(0, 2)" :key="tag.id" class="mini-tag">
                          #{{ tag.name }}
                        </span>
                      </div>
                    </div>

                    <!-- 拖拽手柄 -->
                    <div class="drag-handle">
                      <el-icon><Rank /></el-icon>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
            <div v-if="!selectedArticles.length" class="empty-placeholder">
              <el-empty :image-size="60" description="点击右上角按钮添加文章" />
            </div>
          </div>
        </div>

        <!-- 照片集模式 -->
        <div v-else-if="form.type === 'PHOTO_GALLERY'" class="content-config-card">
          <div class="content-header">
            <div class="tip">支持上传多张照片，支持拖拽排序</div>
            <div class="button-items">
              <el-upload
                :action="`${IMAGE_BASE_URL}/api/upload/image`"
                :headers="{ dogtoken: getToken() ?? '' }"
                :show-file-list="false"
                name="file"
                multiple
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
              >
                <el-button type="primary" :icon="Upload">上传照片</el-button>
              </el-upload>
              <el-button
                type="primary"
                plain
                :icon="Plus"
                @click="mediaDialogVisible = true"
                style="margin-left: 12px"
              >
                媒体库选取
              </el-button>
            </div>
          </div>

          <div class="photo-gallery-container">
            <draggable v-model="photoItems" item-key="index" class="photo-grid" animation="300">
              <template #item="{ element, index }">
                <div class="photo-card">
                  <el-image
                    :src="getFullImageUrl(element.metadata?.thumbnailUrl)"
                    fit="cover"
                    class="photo-img"
                  />
                  <div class="photo-mask">
                    <el-icon class="del-icon" @click="removePhoto(index)"><Delete /></el-icon>
                  </div>
                </div>
              </template>
            </draggable>
            <div v-if="!photoItems.length" class="empty-placeholder">
              <el-empty :image-size="60" description="点击右上角按钮上传照片" />
            </div>
          </div>
        </div>
      </div>

      <div class="footer-actions">
        <el-button size="large" @click="$emit('cancel')">取消</el-button>
        <el-button size="large" type="primary" :loading="submitting" @click="submitForm">
          提交保存
        </el-button>
      </div>

      <ArticleSelectDialog v-model="showArticleSelect" @select="handleArticlesSelect" />
      <MediaSelectDialog v-model="mediaDialogVisible" multiple @select="handleMediaSelect" />
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { Plus, Delete, Upload, Rank } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type UploadProps } from "element-plus";
import ArticleSelectDialog from "./ArticleSelectDialog.vue";
import { getToken } from "@/utils/auth";
import { IMAGE_BASE_URL, getFullImageUrl } from "@/utils/url";
import { PAGE_MODULE_TYPES, PAGE_MODULE_STYLE_TYPES } from "@/config/pageModule";
import { getPageModuleDetail } from "@/api/page-module";
import type {
  CreatePageModuleParams,
  ArticleSummaryDto,
  ArticleListItem,
  PhotoItemDto,
} from "@/api/types";
import draggable from "vuedraggable";
import { processImageBeforeUpload } from "@/utils/image";

const props = defineProps<{
  moduleId?: string | null;
  submitting?: boolean;
}>();

const emit = defineEmits(["save", "cancel"]);

const formRef = ref<FormInstance>();
const showArticleSelect = ref(false);
const mediaDialogVisible = ref(false);
const isEdit = computed(() => !!props.moduleId);
const loading = ref(false);
const fetchError = ref(false);

const form = reactive<CreatePageModuleParams>({
  title: "",
  type: "POST_LIST",
  intro: "",
  styleType: "default",
  sortOrder: 0,
  isActive: true,
  content: {
    articleIds: [],
    photoIds: [],
  },
});

const selectedArticles = ref<ArticleSummaryDto[]>([]);
const photoItems = ref<PhotoItemDto[]>([]);

const rules = {
  title: [{ required: true, message: "请输入模块标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择内容类型", trigger: "change" }],
  styleType: [{ required: true, message: "请选择样式类型", trigger: "change" }],
};

// 获取详情数据
const fetchDetail = async (id: string) => {
  loading.value = true;
  fetchError.value = false;
  try {
    const data = await getPageModuleDetail(id);
    if (data) {
      Object.assign(form, {
        title: data.title,
        type: data.type,
        intro: data.intro || "",
        styleType: data.styleType,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        content: {
          articleIds: data.content.articleIds || [],
          photoIds: data.content.photoIds || [],
        },
      });
      selectedArticles.value = data.content.articles || [];
      photoItems.value = data.content.photoItems || [];
    }
  } catch (error) {
    console.error("Fetch page module detail error:", error);
    fetchError.value = true;
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.moduleId,
  (val) => {
    if (val) {
      fetchDetail(val);
    } else {
      // 重置表单（如果是从编辑切换回新增，理论上由父组件控制销毁，但这里做个保险）
      Object.assign(form, {
        title: "",
        type: "POST_LIST",
        intro: "",
        styleType: "default",
        sortOrder: 0,
        isActive: true,
        content: {
          articleIds: [],
          photoIds: [],
        },
      });
      selectedArticles.value = [];
      photoItems.value = [];
    }
  },
  { immediate: true },
);

const handleTypeChange = () => {
  // 切换类型时可以添加一些确认逻辑（如果已有数据）
};

const handleArticlesSelect = (articles: ArticleListItem[]) => {
  const existingIds = new Set(selectedArticles.value.map((a) => a.id));
  const newArticles = articles
    .filter((a) => !existingIds.has(a.id))
    .map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      bannerItem: a.bannerItem,
      category: a.category,
      tags: a.tags,
    }));
  selectedArticles.value = [...selectedArticles.value, ...newArticles];
};

const removeArticle = (index: number) => {
  selectedArticles.value.splice(index, 1);
};

const getCardStyle = (item: ArticleSummaryDto) => {
  if (item.bannerItem) {
    return {
      backgroundImage: `url(${getFullImageUrl(item.bannerItem.metadata?.thumbnailUrl)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };
};

const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
  try {
    return await processImageBeforeUpload(file);
  } catch {
    return false;
  }
};

const handleMediaSelect = (items: PhotoItemDto[]) => {
  if (items.length > 0) {
    photoItems.value.push(...items);
    ElMessage.success(`成功从媒体库导入 ${items.length} 张图片`);
  }
};

const handleUploadSuccess: UploadProps["onSuccess"] = (res) => {
  const data = res.data as PhotoItemDto;
  if (res.code === 1 && data) {
    photoItems.value.push(data);
    ElMessage.success("上传成功");
  } else {
    ElMessage.error(res.message || "上传失败");
  }
};

const removePhoto = (index: number) => {
  photoItems.value.splice(index, 1);
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      // 深度拷贝以防直接修改响应式数据
      const payload = JSON.parse(JSON.stringify(form));

      if (form.type === "POST_LIST") {
        payload.content.articleIds = selectedArticles.value.map((a) => a.id);
        payload.content.photoIds = [];
      } else {
        payload.content.photoIds = photoItems.value.map((a) => a.id);
        payload.content.articleIds = [];
      }

      // 显式删除废弃字段 imageUrls (如果存在的话)
      if (payload.content.imageUrls) {
        delete payload.content.imageUrls;
      }

      emit("save", payload);
    }
  });
};
</script>

<style lang="less" scoped>
.page-module-form {
  .form-loading,
  .form-error {
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-radius: 8px;

    .loading-text {
      margin-top: 16px;
      color: #909399;
      font-size: 14px;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2f3d;
    margin-bottom: 24px;
    padding-left: 12px;
    border-left: 4px solid #409eff;
  }

  .form-body {
    padding: 10px 0;
  }

  .content-config-card {
    background: #f8f9fb;
    border-radius: 8px;
    padding: 20px;
    margin-top: 10px;

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .tip {
        font-size: 14px;
        color: #909399;
      }
      .button-items {
        display: flex;
        gap: 10px;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .article-grid-container {
    .article-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .article-card-wrapper {
      cursor: move;
    }

    .article-card {
      position: relative;
      height: 160px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.02);

        .card-actions {
          opacity: 1;
        }
      }

      .card-mask {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.85) 0%,
          rgba(0, 0, 0, 0.2) 60%,
          transparent 100%
        );
        z-index: 1;
      }

      .card-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 3;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;

        .action-btn {
          width: 28px;
          height: 28px;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 14px;

          &:hover {
            background: #f56c6c;
          }
        }
      }

      .card-category {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 2;
        padding: 2px 8px;
        background: #409eff;
        color: #fff;
        font-size: 11px;
        border-radius: 4px;
        font-weight: 500;
      }

      .card-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;
        padding: 12px;
        color: #fff;

        .card-title {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 600;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-intro {
          margin: 0 0 8px;
          font-size: 12px;
          opacity: 0.8;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-tags {
          display: flex;
          gap: 6px;
          .mini-tag {
            font-size: 10px;
            opacity: 0.7;
          }
        }
      }

      .drag-handle {
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 2;
        color: rgba(255, 255, 255, 0.4);
        font-size: 18px;
      }
    }

    .ghost-card {
      opacity: 0.5;
      background: #c8ebfb;
    }
  }

  .photo-gallery-container {
    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .photo-card {
      position: relative;
      background: #fff;
      border-radius: 6px;
      overflow: hidden;
      aspect-ratio: 1;
      border: 1px solid #ebeef5;
      cursor: move;

      .photo-img {
        width: 100%;
        height: 100%;
      }

      .photo-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;

        .del-icon {
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          &:hover {
            color: #f56c6c;
          }
        }
      }

      &:hover .photo-mask {
        opacity: 1;
      }
    }
  }

  .empty-placeholder {
    padding: 20px 0;
  }

  .footer-actions {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
}
</style>
