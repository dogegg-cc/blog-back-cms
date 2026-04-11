<template>
  <div class="article-form-container">
    <!-- 顶部操作栏 -->
    <div class="form-topbar">
      <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
      <div class="topbar-title">{{ isEdit ? "编辑文章" : "新建文章" }}</div>
      <el-button type="primary" :loading="submitting" :icon="Check" @click="handleSubmit">
        {{ isEdit ? "保存修改" : "发布文章" }}
      </el-button>
    </div>

    <div class="form-body">
      <!-- 左侧主内容区 -->
      <div class="form-main">
        <!-- 标题 -->
        <el-input
          v-model="form.title"
          placeholder="请输入文章标题..."
          class="title-input"
          maxlength="50"
          show-word-limit
        />

        <!-- Markdown 编辑器 -->
        <div class="editor-wrapper">
          <div v-show="!pageLoading" ref="editorContainer" />
        </div>
      </div>

      <!-- 右侧配置区 -->
      <div class="form-aside">
        <!-- Banner 上传 -->
        <el-card shadow="never" class="aside-card">
          <template #header>
            <span class="card-title">封面图片</span>
          </template>
          <el-upload
            class="banner-uploader"
            :action="`${IMAGE_BASE_URL}/api/upload/image`"
            :headers="uploadHeaders"
            :show-file-list="false"
            accept="image/*"
            :before-upload="beforeBannerUpload"
            :on-success="handleBannerSuccess"
            :on-error="handleUploadError"
          >
            <div class="banner-preview" v-if="bannerPreviewUrl">
              <img :src="bannerPreviewUrl" alt="封面预览" />
              <div class="banner-remove-mask" @click.stop="removeBanner">
                <el-icon><Delete /></el-icon>
              </div>
            </div>
            <div class="banner-placeholder" v-else>
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-tip">点击上传封面图</div>
              <div class="upload-tip-sub">支持 JPG / PNG / WebP</div>
            </div>
          </el-upload>
        </el-card>

        <!-- 简介 -->
        <el-card shadow="never" class="aside-card">
          <template #header>
            <div class="card-header-with-action">
              <span class="card-title">简介</span>
              <el-tooltip content="清除 Markdown 格式" placement="top">
                <el-button type="primary" size="small" :icon="Brush" @click="handleStripSummary" />
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="form.summary"
            type="textarea"
            placeholder="请输入文章简介（选填）..."
            class="summary-input"
            :autosize="{ minRows: 8, maxRows: 10 }"
            maxlength="200"
            show-word-limit
          />
        </el-card>

        <!-- 分类选择 -->
        <el-card shadow="never" class="aside-card">
          <template #header>
            <div class="card-header-with-action">
              <span class="card-title">分类</span>
              <el-button text type="primary" size="small" :icon="Plus" @click="openCategoryDialog">
                新建
              </el-button>
            </div>
          </template>
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类（选填）"
            clearable
            style="width: 100%"
            @change="handleCategoryChange"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-card>

        <!-- 标签选择 -->
        <el-card shadow="never" class="aside-card">
          <template #header>
            <div class="card-header-with-action">
              <span class="card-title">标签</span>
              <el-button text type="primary" size="small" :icon="Plus" @click="openTagDialog">
                新建
              </el-button>
            </div>
          </template>
          <el-select
            v-model="form.tagIds"
            placeholder="请选择标签（可多选）"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            :disabled="!form.categoryId"
            style="width: 100%"
          >
            <el-option
              v-for="item in availableTags"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-card>
      </div>
    </div>

    <!-- 快捷创建分类 Dialog -->
    <el-dialog v-model="categoryDialogVisible" title="新建分类" width="400px">
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="60px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="categoryForm.slug" placeholder="例如: tech-news" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySubmitting" @click="handleCreateCategory">
          确认创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 快捷创建标签 Dialog -->
    <el-dialog v-model="tagDialogVisible" title="新建标签" width="400px">
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="60px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="tagSubmitting" @click="handleCreateTag">
          确认创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Plus, Delete, ArrowLeft, Check, Brush } from "@element-plus/icons-vue";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { getArticleDetail, createArticle, updateArticle } from "@/api/article";
import { getCategoryList, createCategory } from "@/api/category";
import { createTag } from "@/api/tag";
import { processImageBeforeUpload } from "@/utils/image";
import type { CategoryResponse, CreateCategoryParams, CreateTagParams } from "@/api/types";
import { getToken } from "@/utils/auth";
import { IMAGE_BASE_URL, getFullImageUrl, contentToHalfPath, contentToFullPath } from "@/utils/url";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const route = useRoute();

// ============================================================
// 页面模式 : 编辑 vs 新建
// ============================================================
const articleId = computed(() => route.params.id as string | undefined);
const isEdit = computed(() => !!articleId.value);

// ============================================================
// 基础数据
// ============================================================
const pageLoading = ref(false);
const submitting = ref(false);
const categoryList = ref<CategoryResponse[]>([]);

// 上传请求头（带 token）
const uploadHeaders = computed(() => ({
  dogtoken: getToken() ?? "",
}));

// ============================================================
// 表单核心数据
// ============================================================
const form = reactive({
  title: "",
  summary: "",
  categoryId: undefined as string | undefined,
  tagIds: [] as string[],
});

// 计算当前分类下的可用标签
const availableTags = computed(() => {
  if (!form.categoryId) return [];
  const category = categoryList.value.find((c) => c.id === form.categoryId);
  return category?.tags || [];
});

const handleCategoryChange = () => {
  form.tagIds = []; // 切换分类时清空选中的标签
};

// 清除简介中的 Markdown 格式
const handleStripSummary = () => {
  if (!form.summary) return;

  // 简单的正则清除 Markdown 格式
  const cleanText = form.summary
    .replace(/[#*`~]|^\s*[-+*]\s|^\s*\d+\.\s/gm, "") // 移除标题符号、列表符号、加粗、斜体、删除线、代码符
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除链接，保留文本 [text](url) -> text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // 移除图片
    .replace(/>\s+/g, "") // 移除引用符号
    .replace(/\n+/g, " ") // 换行替换为空格
    .trim();

  form.summary = cleanText;
  ElMessage.success("已清除 Markdown 格式");
};

// Banner 相关（半路径存服务器，完整 URL 仅用于预览）
const bannerPath = ref<string>(""); // 半路径，提交给服务器
const bannerPreviewUrl = computed(() => getFullImageUrl(bannerPath.value));

const removeBanner = () => {
  bannerPath.value = "";
};

// ============================================================
// Vditor 编辑器
// ============================================================
let vditorInstance: Vditor | null = null;
const editorContainer = ref<HTMLElement | null>(null);

const initEditor = (content = "") => {
  if (!editorContainer.value) return;
  vditorInstance = new Vditor(editorContainer.value, {
    minHeight: 400, // 最小高度保障，实际高度由外层 CSS flex:1 控制
    mode: "ir",
    theme: "classic",
    placeholder: "请输入文章内容...",
    cache: { enable: false },
    toolbar: [
      "headings",
      "bold",
      "italic",
      "strike",
      "|",
      "line",
      "quote",
      "list",
      "ordered-list",
      "check",
      "outdent",
      "indent",
      "|",
      "code",
      "inline-code",
      "insert-before",
      "insert-after",
      "|",
      "upload",
      "link",
      "table",
      "|",
      "undo",
      "redo",
    ],
    upload: {
      // 完全接管上传流程：手动 fetch → 解析半路径 → 拼接完整 URL → 插入 Markdown
      async handler(files: File[]) {
        let file = files[0];
        if (!file) return null;

        try {
          // 统一校验 + 压缩处理
          file = (await processImageBeforeUpload(file)) as File;
        } catch {
          // 校验不通过
          return null;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch(`${IMAGE_BASE_URL}/api/upload/image`, {
          method: "POST",
          headers: { dogtoken: getToken() ?? "" },
          body: formData,
        })
          .then((res) => res.json())
          .then((res: { code: number; data?: { url: string }; message?: string }) => {
            if (res.code === 1 && res.data?.url) {
              // 拼接完整预览 URL 插入编辑器，半路径已在 url.ts 中转换
              const fullUrl = getFullImageUrl(res.data.url);
              vditorInstance?.insertValue(`![](${fullUrl})\n`);
            } else {
              ElMessage.error(res.message ?? "图片上传失败");
            }
          })
          .catch(() => {
            ElMessage.error("图片上传失败，请检查网络");
          });

        return null; // 返回 null 告知 Vditor 已自行处理
      },
    },
    after() {
      // 编辑器初始化完毕后回填内容
      if (content) {
        vditorInstance?.setValue(content);
      }
    },
  });
};

// ============================================================
// Banner 上传
// ============================================================
const beforeBannerUpload = async (file: File) => {
  try {
    // 统一校验与处理 (返回处理后的 Blob/File 或抛出错误拦截)
    const result = await processImageBeforeUpload(file);
    return result;
  } catch {
    // 校验失败会在工具类里报错给用户，此处只需返回 false 阻止上传
    return false;
  }
};

interface UploadResponse {
  code: number;
  data: { url: string };
}

const handleBannerSuccess = (response: UploadResponse) => {
  if (response.code === 1 && response.data?.url) {
    bannerPath.value = response.data.url; // 存半路径
    ElMessage.success("封面上传成功");
  } else {
    ElMessage.error("封面上传失败，请重试");
  }
};

const handleUploadError = () => {
  ElMessage.error("上传失败，请检查网络或联系管理员");
};

// ============================================================
// 提交文章
// ============================================================
const handleSubmit = async () => {
  if (!form.title.trim()) {
    ElMessage.warning("请输入文章标题");
    return;
  }
  const rawContent = vditorInstance?.getValue() ?? "";
  // 提交前：将编辑器中的完整 URL 还原为半路径
  const content = contentToHalfPath(rawContent);
  if (!rawContent.trim()) {
    ElMessage.warning("请输入文章内容");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || undefined,
      bannerUrl: bannerPath.value || undefined, // 半路径提交给服务器
      content,
      categoryId: form.categoryId || undefined,
      tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
    };

    if (isEdit.value && articleId.value) {
      await updateArticle(articleId.value, payload);
      ElMessage.success("文章更新成功");
    } else {
      await createArticle(payload);
      ElMessage.success("文章发布成功");
    }
    handleBack();
  } catch (error) {
    console.error("提交失败", error);
  } finally {
    submitting.value = false;
  }
};

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/article/list");
  }
};

// ============================================================
// 快捷创建分类
// ============================================================
const categoryDialogVisible = ref(false);
const categorySubmitting = ref(false);
const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive<CreateCategoryParams>({ name: "", slug: "" });
const categoryRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  slug: [
    { required: true, message: "请输入 Slug", trigger: "blur" },
    { pattern: /^[a-z0-9-]+$/, message: "Slug 只能包含小写字母、数字和连字符", trigger: "blur" },
  ],
});

const openCategoryDialog = () => {
  categoryForm.name = "";
  categoryForm.slug = "";
  categoryDialogVisible.value = true;
};

const handleCreateCategory = async () => {
  if (!categoryFormRef.value) return;
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      categorySubmitting.value = true;
      try {
        await createCategory({ name: categoryForm.name, slug: categoryForm.slug });
        ElMessage.success("分类创建成功");
        categoryDialogVisible.value = false;
        // 刷新分类列表
        categoryList.value = await getCategoryList();
      } finally {
        categorySubmitting.value = false;
      }
    }
  });
};

// ============================================================
// 快捷创建标签
// ============================================================
const tagDialogVisible = ref(false);
const tagSubmitting = ref(false);
const tagFormRef = ref<FormInstance>();
const tagForm = reactive<CreateTagParams>({ name: "", categoryId: "" });
const tagRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入标签名称", trigger: "blur" }],
});

const openTagDialog = () => {
  if (!form.categoryId) {
    ElMessage.warning("请先选择文章分类");
    return;
  }
  tagForm.name = "";
  tagForm.categoryId = form.categoryId;
  tagDialogVisible.value = true;
};

const handleCreateTag = async () => {
  if (!tagFormRef.value) return;
  await tagFormRef.value.validate(async (valid) => {
    if (valid) {
      tagSubmitting.value = true;
      try {
        await createTag({
          name: tagForm.name,
          categoryId: tagForm.categoryId,
        });
        ElMessage.success("标签创建成功");
        tagDialogVisible.value = false;
        // 刷新分类列表以获取最新标签
        await loadBaseData();
      } finally {
        tagSubmitting.value = false;
      }
    }
  });
};

// ============================================================
// 初始化：加载分类 + 编辑时回显
// ============================================================
const loadBaseData = async () => {
  const categories = await getCategoryList();
  categoryList.value = categories;
};

const loadArticleDetail = async (id: string) => {
  const detail = await getArticleDetail(id);
  form.title = detail.title;
  form.summary = detail.summary ?? "";
  form.categoryId = detail.category?.id ?? undefined;
  form.tagIds = detail.tags?.map((t) => t.id) ?? [];
  bannerPath.value = detail.bannerUrl ?? "";
  // 回显时：将内容中的半路径扩展为完整 URL，保证编辑器内图片正常加载
  return contentToFullPath(detail.content ?? "");
};

onMounted(async () => {
  pageLoading.value = true;
  let initialContent = "";
  try {
    await loadBaseData();
    if (isEdit.value && articleId.value) {
      initialContent = await loadArticleDetail(articleId.value);
    }
  } finally {
    pageLoading.value = false;
  }
  // 关键：等 loading 结束、DOM 更新后再初始化编辑器
  await nextTick();
  initEditor(initialContent);
});

onBeforeUnmount(() => {
  vditorInstance?.destroy();
  vditorInstance = null;
});
</script>

<style lang="less" scoped>
.article-form-container {
  // 容器悦了整个可用区域，自身不滚动
  height: calc(100vh - 84px);
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  // 不参与滚动，容器本身定高且 overflow:hidden，topbar 始终可见
  flex-shrink: 0;
  z-index: 10;

  .topbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.form-body {
  flex: 1;
  min-height: 0; // 关键：flex 子元素必须指定，否则高度无法向下传递
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: stretch; // 两列非独立滚动
}

.form-main {
  flex: 1;
  min-width: 0;
  min-height: 0; // 必须！与 form-body 的 min-height:0 配合，完成高度链传递
  display: flex;
  flex-direction: column;
  gap: 12px;

  .title-input {
    :deep(.el-input__inner) {
      font-size: 22px;
      font-weight: 600;
      height: 52px;
      border: none;
      border-radius: 0;
      padding: 0 10px;
      box-shadow: none;

      &:focus {
        border-bottom-color: var(--el-color-primary);
      }
    }

    :deep(.el-input__wrapper) {
      border: none;
      box-shadow: none;
      border-radius: 0;
      border-bottom: 2px solid #e4e7ed;
      padding: 0;

      &.is-focus {
        border-bottom-color: var(--el-color-primary);
        box-shadow: none;
      }
    }
    :deep(.el-input__count) {
      padding-right: 10px;
    }
  }

  .editor-wrapper {
    flex: 1; // 占满 form-main 的剩余高度
    min-height: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e4e7ed;

    // 穿透覆盖 Vditor 内部内联高度，让编辑器充满容器
    :deep(.vditor) {
      height: 100% !important;
      display: flex;
      flex-direction: column;
    }

    :deep(.vditor-content) {
      flex: 1;
      min-height: 0 !important;
      overflow: hidden;
    }

    :deep(.vditor-ir),
    :deep(.vditor-sv),
    :deep(.vditor-wysiwyg) {
      height: 100% !important;
      min-height: 0 !important;
      box-sizing: border-box;
      overflow-y: auto !important;
    }
  }
}

.form-aside {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  // 侧边栏独立滚动，不影响主内容区高度
  overflow-y: auto;
  max-height: 100%;

  .aside-card {
    :deep(.el-card__header) {
      padding: 10px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.el-card__body) {
      padding: 14px 16px;
    }
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .card-header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.banner-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
    display: block;
  }
}

.banner-preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .banner-remove-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    font-size: 20px;

    &:hover {
      opacity: 1;
    }
  }
}

.banner-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
  color: #909399;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  .upload-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .upload-tip {
    font-size: 13px;
    font-weight: 500;
  }

  .upload-tip-sub {
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 4px;
  }
}
</style>
