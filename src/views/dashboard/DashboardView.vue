<template>
  <div class="dashboard-container">
    <!-- 顶部基础统计占位 (可选) -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in summaryCards" :key="item.title">
        <el-card shadow="hover" class="summary-card">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :lg="10" :md="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon class="mr-5"><PieChart /></el-icon>分类文章占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :lg="14" :md="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon class="mr-5"><Histogram /></el-icon>分类阅读排行榜 (平均热度)</span>
            </div>
          </template>
          <div ref="barChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span><el-icon class="mr-5"><TrendCharts /></el-icon>内容产出趋势 (按月)</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-box line-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue'
import * as echarts from 'echarts'
import { PieChart, Histogram, TrendCharts, Document, Collection, PriceTag, View } from '@element-plus/icons-vue'
import { getCategoryRatio, getCategoryPopularity, getPostTrend, getStatisticsSummary } from '@/api/statistics'

// 基础统计卡片配置 (使用 ref 包装以便动态更新)
const summaryCards = ref([
  { title: '创作总数', value: '---', icon: Document, color: '#409EFF' },
  { title: '分类专栏', value: '---', icon: Collection, color: '#67C23A' },
  { title: '标签云', value: '---', icon: PriceTag, color: '#E6A23C' },
  { title: '全站阅读', value: '---', icon: View, color: '#F56C6C' }
])

// 图表 DOM 引用
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)
const lineChartRef = ref<HTMLElement | null>(null)

// ECharts 实例 (使用 shallowRef 优化性能)
const pieInstance = shallowRef<echarts.ECharts | null>(null)
const barInstance = shallowRef<echarts.ECharts | null>(null)
const lineInstance = shallowRef<echarts.ECharts | null>(null)

interface ChartDataItem { name: string; value: number }
interface TrendDataItem { label: string; value: number }

/**
 * 初始化饼图：分类文章占比
 */
const initPieChart = (data: ChartDataItem[]) => {
  if (!pieChartRef.value) return
  pieInstance.value = echarts.init(pieChartRef.value)
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '分类占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: data
      }
    ]
  }
  pieInstance.value.setOption(option)
}

/**
 * 初始化柱状图：各分类阅读热度
 */
const initBarChart = (data: ChartDataItem[]) => {
  if (!barChartRef.value) return
  barInstance.value = echarts.init(barChartRef.value)
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: data.map(i => i.name),
      axisTick: { show: false }
    },
    series: [
      {
        name: '平均阅读量',
        type: 'bar',
        data: data.map(i => i.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }
  barInstance.value.setOption(option)
}

/**
 * 初始化折线趋势图
 */
const initLineChart = (data: TrendDataItem[]) => {
  if (!lineChartRef.value) return
  lineInstance.value = echarts.init(lineChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(i => i.label)
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '发布数量',
        type: 'line',
        smooth: true,
        data: data.map(i => i.value),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0)' }
          ])
        },
        lineStyle: { width: 3, color: '#409EFF' },
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  lineInstance.value.setOption(option)
}

/**
 * 处理窗口缩放
 */
const handleResize = () => {
  if (pieInstance.value) pieInstance.value.resize()
  if (barInstance.value) barInstance.value.resize()
  if (lineInstance.value) lineInstance.value.resize()
}

onMounted(async () => {
  try {
    // 获取异步统计数据
    const [summary, ratio, popularity, trend] = await Promise.all([
      getStatisticsSummary(),
      getCategoryRatio(),
      getCategoryPopularity(),
      getPostTrend()
    ])

    // 初始化图表
    initPieChart(ratio)
    initBarChart(popularity)
    initLineChart(trend)

    // 更新汇总卡片数值 (安全更新各索引位数据)
    if (summaryCards.value[0]) summaryCards.value[0].value = summary.articleCount.toLocaleString()
    if (summaryCards.value[1]) summaryCards.value[1].value = summary.categoryCount.toLocaleString()
    if (summaryCards.value[2]) summaryCards.value[2].value = summary.tagCount.toLocaleString()
    if (summaryCards.value[3]) summaryCards.value[3].value = summary.totalViews.toLocaleString()

    window.addEventListener('resize', handleResize)
  } catch (err) {
    console.error('获取统计数据失败', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (pieInstance.value) pieInstance.value.dispose()
  if (barInstance.value) barInstance.value.dispose()
  if (lineInstance.value) lineInstance.value.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.summary-card {
  border: none;
  border-radius: 12px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  font-weight: bold;
  display: flex;
  align-items: center;
}

.chart-box {
  width: 100%;
  height: 350px;
}

.line-chart {
  height: 400px;
}

.mt-20 {
  margin-top: 20px;
}

.mr-5 {
  margin-right: 5px;
}
</style>
