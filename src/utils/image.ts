import { ElMessage } from "element-plus";

/**
 * 图片处理配置
 */
export interface ImageProcessOptions {
  maxSizeMB?: number; // 硬性限制，默认 10MB
  targetSizeMB?: number; // 压缩目标大小，默认 3MB
  maxWidth?: number; // 压缩时的最大宽度
}

const DEFAULT_OPTIONS: Required<ImageProcessOptions> = {
  maxSizeMB: 10,
  targetSizeMB: 3,
  maxWidth: 2560,
};

/**
 * 统一的上传前图片处理方法
 * 功能：10MB 拦截，3-10MB 自动压缩，GIF 跳过压缩
 */
export async function processImageBeforeUpload(
  file: File,
  options: ImageProcessOptions = {},
): Promise<File | Blob> {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const maxSize = settings.maxSizeMB * 1024 * 1024;
  const targetSize = settings.targetSizeMB * 1024 * 1024;

  // 1. 基本校验：必须是图片
  if (!file.type.startsWith("image/")) {
    ElMessage.error("只能上传图片文件！");
    throw new Error("Invalid file type");
  }

  // 2. 10MB 拦截
  if (file.size > maxSize) {
    ElMessage.error(`图片大小不能超过 ${settings.maxSizeMB}MB！`);
    throw new Error("File too large");
  }

  // 3. GIF 跳过压缩逻辑
  if (file.type === "image/gif") {
    return file;
  }

  // 4. 判断是否需要压缩 (3MB - 10MB)
  if (file.size > targetSize) {
    try {
      return await compressImage(file, settings);
    } catch (error) {
      console.error("图片压缩失败，将由于原图尝试上传", error);
      return file;
    }
  }

  // 5. 小于是 3MB 直接返回
  return file;
}

/**
 * 内部 Canvas 压缩实现
 */
async function compressImage(
  file: File,
  settings: Required<ImageProcessOptions>,
): Promise<File | Blob> {
  const targetSizeBytes = settings.targetSizeMB * 1024 * 1024;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      const result = e.target?.result;
      if (typeof result !== "string") {
        reject(new Error("FileReader result is not a string"));
        return;
      }
      img.src = result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context is null"));
          return;
        }

        let width = img.width;
        let height = img.height;

        // 等比缩放
        if (width > settings.maxWidth) {
          height = Math.round((height * settings.maxWidth) / width);
          width = settings.maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 逐步降低质量直到满足 3MB 限制
        let quality = 0.9;
        const compressLoop = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // 如果质量降到 0.1 依然不满足，那也只能返回了（保证循环结束）
                if (blob.size <= targetSizeBytes || quality <= 0.1) {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                  });
                  resolve(compressedFile);
                } else {
                  quality -= 0.1;
                  compressLoop();
                }
              } else {
                reject(new Error("Canvas toBlob failed"));
              }
            },
            "image/jpeg",
            quality,
          );
        };
        compressLoop();
      };
      img.onerror = () => reject(new Error("Image load error"));
    };
    reader.onerror = () => reject(new Error("FileReader error"));
  });
}
