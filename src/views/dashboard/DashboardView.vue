<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="i in 4" :key="i">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据统计 {{ i }}</span>
              <el-tag :type="getTagType(i)">实时</el-tag>
            </div>
          </template>
          <div class="card-body">
            <h2 class="num">{{ 1234 * i }}</h2>
            <p class="desc">今日新增访客数量</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <div class="card-header">
          <span>系统公告</span>
        </div>
      </template>
      <el-empty description="暂无新公告" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
const getTagType = (i: number) => {
  const types = ['success', 'warning', 'danger', 'info']
  return types[(i - 1) % 4]
}
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
}

.num {
  font-size: 28px;
  margin: 10px 0;
  color: #409EFF;
}

.desc {
  font-size: 14px;
  color: #909399;
}

.mt-20 {
  margin-top: 20px;
}
</style>
