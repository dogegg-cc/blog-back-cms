<template>
  <el-dialog
    v-model="visible"
    title="媒体库选择"
    width="900px"
    top="5vh"
    append-to-body
    class="media-select-dialog"
    @open="handleOpen"
  >
    <div class="media-container" v-loading="loading">
      <!-- 图片网格列表 -->
      <div v-if="mediaList.length > 0" class="image-grid">
        <div
          v-for="item in mediaList"
          :key="item.url"
          class="image-item"
          :class="{ active: isSelected(item.url) }"
          @click="toggleSelect(item.url)"
        >
          <div class="image-wrapper">
            <el-image
              :src="getFullImageUrl(item.url)"
              fit="cover"
              class="img-thumb"
              lazy
            />
            <div class="check-icon" v-if="isSelected(item.url)">
              <el-icon><Check /></el-icon>
            </div>
          </div>
          <div class="image-name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
      <el-empty v-else description="暂无图片数据" />

      <!-- 分页栏 -->
      <div class="pagination-footer">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="fetchMedia"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="selected-count">
          已选择 <span>{{ selectedUrls.length }}</span> 张图片
        </div>
        <div>
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="selectedUrls.length === 0"
            @click="handleSubmit"
          >
            确认选择
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Check } from "@element-plus/icons-vue";
import { getMediaList } from "@/api/media";
import type { MediaItem } from "@/api/types";
import { getFullImageUrl } from "@/utils/url";

const props = defineProps<{
  multiple?: boolean; // 是否多选
}>();

const emit = defineEmits<{
  (e: "select", urls: string[]): void;
}>();

// 是否显示 (通过 v-model 绑定外层)
const visible = defineModel<boolean>();

// 数据状态
const loading = ref(false);
const mediaList = ref<MediaItem[]>([]);
const total = ref(0);
const selectedUrls = ref<string[]>([]);

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 12,
});

// 处理打开弹窗
const handleOpen = () => {
  selectedUrls.value = [];
  fetchMedia();
};

// 获取媒体库数据
const fetchMedia = async () => {
  loading.value = true;
  try {
    const res = await getMediaList(queryParams);
    mediaList.value = res.items;
    total.value = res.total;
  } catch (error) {
    console.error("加载媒体库失败", error);
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = () => {
  queryParams.page = 1;
  fetchMedia();
};

// 判断是否选中
const isSelected = (url: string) => {
  return selectedUrls.value.includes(url);
};

// 切换选中状态
const toggleSelect = (url: string) => {
  if (props.multiple) {
    const index = selectedUrls.value.indexOf(url);
    if (index > -1) {
      selectedUrls.value.splice(index, 1);
    } else {
      selectedUrls.value.push(url);
    }
  } else {
    // 单选模式
    selectedUrls.value = [url];
  }
};

// 确认提交
const handleSubmit = () => {
  emit("select", [...selectedUrls.value]);
  visible.value = false;
};
</script>

<style lang="less" scoped>
.media-select-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}

.media-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;

  .image-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
    flex: 1;
  }

  .image-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 6px;
    transition: all 0.2s;
    background: #f8f9fb;

    &:hover {
      background: #f0f2f5;
    }

    &.active {
      border-color: var(--el-color-primary);
      background: #ecf5ff;
    }

    .image-wrapper {
      position: relative;
      aspect-ratio: 1;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;

      .img-thumb {
        width: 100%;
        height: 100%;
        display: block;
      }

      .check-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: var(--el-color-primary);
        color: #fff;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        z-index: 2;
      }
    }

    .image-name {
      font-size: 12px;
      color: #606266;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .pagination-footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-count {
    font-size: 14px;
    color: #606266;

    span {
      color: var(--el-color-primary);
      font-weight: 600;
      margin: 0 4px;
    }
  }
}
</style>
