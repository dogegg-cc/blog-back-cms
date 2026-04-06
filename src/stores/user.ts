import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserInfoDto } from "@/api/types";
import { getUserInfo } from "@/api/user";

export const useUserStore = defineStore("user", () => {
  const userInfo = ref<UserInfoDto | null>(null);

  const setUserInfo = (info: UserInfoDto | null) => {
    userInfo.value = info;
  };

  const clearUserInfo = () => {
    userInfo.value = null;
  };

  /**
   * 获取用户信息
   * 如果已有数据则直接返回，否则发起 API 请求
   */
  const getInfo = async () => {
    try {
      const info = await getUserInfo();
      setUserInfo(info);
      return info;
    } catch (error) {
      clearUserInfo();
      throw error;
    }
  };

  return {
    userInfo,
    setUserInfo,
    clearUserInfo,
    getInfo,
    // 便利属性
    name: computed(() => userInfo.value?.name || "管理员"),
    avatar: computed(() => userInfo.value?.avatar || ""),
    email: computed(() => userInfo.value?.email || ""),
  };
});
