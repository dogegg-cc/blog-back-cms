/**
 * 首页模块相关常量配置
 */

/**
 * 模块内容类型
 */
export const PAGE_MODULE_TYPES = [
  { label: "文章列表", value: "POST_LIST" },
  { label: "照片集", value: "PHOTO_GALLERY" },
] as const;

/**
 * 模块样式类型
 */
export const PAGE_MODULE_STYLE_TYPES = [
  { label: "列表样式", value: "list" },
  { label: "网格样式", value: "grid" },
  { label: "幻灯片", value: "carousel" },
] as const;

/**
 * 类型映射表 (用于列表展示)
 */
export const PAGE_MODULE_TYPE_MAP = Object.fromEntries(
  PAGE_MODULE_TYPES.map((item) => [item.value, item.label]),
);

/**
 * 样式映射表 (用于列表展示)
 */
export const PAGE_MODULE_STYLE_MAP = Object.fromEntries(
  PAGE_MODULE_STYLE_TYPES.map((item) => [item.value, item.label]),
);
