<template>
  <div class="check-report-container">

    <!-- 筛选区域 -->
    <div class="search-box">
      <el-form :model="queryParams" inline :inline-message="true" class="search-form">
        <el-form-item label="点检日期">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="设备分类">
          <el-select v-model="queryParams.categoryId" placeholder="请选择" clearable style="width:160px">
            <el-option label="起重设备" value="1001" />
            <el-option label="运输设备" value="1002" />
            <el-option label="电气设备" value="1003" />
            <el-option label="机械设备" value="1004" />
          </el-select>
        </el-form-item>
        <el-form-item label="点检状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width:140px">
            <el-option label="未检" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已检" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="异常状态">
          <el-select v-model="queryParams.isAbnormal" placeholder="请选择" clearable style="width:140px">
            <el-option label="正常" value="2" />
            <el-option label="异常" value="1" />
            <el-option label="待检" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button type="success" @click="exportExcel">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 核心数据卡片 -->
    <div class="data-card-group">
      <div class="data-card" v-for="(item, index) in statCards" :key="index">
        <div class="card-icon" :style="{ background: item.color }">
          <el-icon :size="24"><component :is="item.icon" /></el-icon>
        </div>
        <div class="card-content">
          <p class="label">{{ item.label }}</p>
          <p class="value">{{ item.value }}</p>
        </div>
      </div>
    </div>

    <!-- 图表区域：4个图表一行，高度统一 -->
    <div class="chart-wrapper">
      <div class="chart-item">
        <div class="chart-title">点检完成率趋势</div>
        <div id="trendChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">设备分类点检统计</div>
        <div id="categoryChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">异常设备TOP10</div>
        <div id="abnormalChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">点检类型占比</div>
        <div id="typeChart" class="chart-box"></div>
      </div>
    </div>

    <!-- 统计表格：占屏幕50%以上高度 -->
    <div class="table-box">
      <div class="table-header">
        <span class="table-title">点检明细统计表</span>
        <span class="table-desc">共 {{ total }} 条记录</span>
      </div>
      <el-table
        v-loading="loading"
        :data="tableList"
        border
        stripe
        size="default"
        highlight-current-row
        style="width:100%"
        height="100"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="点检计划ID" prop="planId" width="120" align="center" />
        <el-table-column label="设备编号" prop="equipCode" width="140" align="center" />
        <el-table-column label="设备名称" prop="equipName" min-width="180" />
        <el-table-column label="设备小类" prop="categoryName" width="120" align="center" />
        <el-table-column label="点检员" prop="inspectorName" width="100" align="center" />
        <el-table-column label="点检日期" prop="checkDate" width="120" align="center" />
        <el-table-column label="点检状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 2 ? 'success' : scope.row.status === 1 ? 'warning' : 'info'">
              {{ scope.row.status === 2 ? '已检' : scope.row.status === 1 ? '进行中' : '未检' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="异常状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isAbnormal === 2 ? 'success' : scope.row.isAbnormal === 1 ? 'danger' : 'info'">
              {{ scope.row.isAbnormal === 2 ? '正常' : scope.row.isAbnormal === 1 ? '异常' : '待检' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点检内容" prop="content" min-width="200" />
        <el-table-column label="点检标准" prop="standard" min-width="180" />
        <el-table-column label="完成时限" prop="timeLimit" width="100" align="center" />
        <el-table-column label="备注" prop="remark" min-width="150" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ECharts from 'echarts'
import { Search, Refresh, Download, PieChart, Histogram, TrendCharts, Warning } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  dateRange: [],
  categoryId: '',
  status: '',
  isAbnormal: '',
  pageNum: 1,
  pageSize: 30
})

// 表格与加载
const loading = ref(false)
const tableList = ref([])
const total = ref(0)

// 图表实例
let trendChart = null
let categoryChart = null
let abnormalChart = null
let typeChart = null

// 核心统计卡片
const statCards = ref([
  { label: '总点检任务', value: '1,286', icon: PieChart, color: '#409EFF' },
  { label: '已完成', value: '1,054', icon: TrendCharts, color: '#67C23A' },
  { label: '未完成', value: '232', icon: Histogram, color: '#F56C6C' },
  { label: '异常设备', value: '48', icon: Warning, color: '#E6A23C' },
  { label: '点检完成率', value: '82.1%', icon: PieChart, color: '#0FC6C2' }
])

// 获取报表数据
const getList = async () => {
  loading.value = true
  try {
    setTimeout(() => {
      tableList.value = getMockTableData()
      total.value = 1286
      loading.value = false
      initCharts()
      ElMessage.success('数据加载成功')
    }, 500)
  } catch (e) {
    loading.value = false
    ElMessage.error('数据加载失败')
  }
}

// 重置查询
const resetQuery = () => {
  queryParams.dateRange = []
  queryParams.categoryId = ''
  queryParams.status = ''
  queryParams.isAbnormal = ''
  queryParams.pageNum = 1
  getList()
}

// 导出Excel
const exportExcel = () => {
  ElMessage.success('导出成功，文件下载中...')
}

// 初始化所有图表
const initCharts = () => {
  // 趋势图
  trendChart = ECharts.init(document.getElementById('trendChart'))
  trendChart.setOption(getTrendOption())

  // 设备分类图
  categoryChart = ECharts.init(document.getElementById('categoryChart'))
  categoryChart.setOption(getCategoryOption())

  // 异常TOP图
  abnormalChart = ECharts.init(document.getElementById('abnormalChart'))
  abnormalChart.setOption(getAbnormalOption())

  // 点检类型占比
  typeChart = ECharts.init(document.getElementById('typeChart'))
  typeChart.setOption(getTypeOption())
}

// 窗口自适应
const resizeCharts = () => {
  trendChart?.resize()
  categoryChart?.resize()
  abnormalChart?.resize()
  typeChart?.resize()
}

// 图表配置
const getTrendOption = () => ({
  xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'] },
  yAxis: { type: 'value' },
  series: [{ data: [70, 85, 78, 92, 88, 95, 82], type: 'line', smooth: true }]
})
const getCategoryOption = () => ({
  xAxis: { type: 'category', data: ['起重', '运输', '电气', '机械'] },
  yAxis: { type: 'value' },
  series: [{ data: [320, 282, 491, 302], type: 'bar' }]
})
const getAbnormalOption = () => ({
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: ['设备A', '设备B', '设备C', '设备D', '设备E'] },
  series: [{ data: [12, 8, 7, 5, 3], type: 'bar' }]
})
const getTypeOption = () => ({
  series: [{ type: 'pie', radius: '50%', data: [
    { value: 400, name: '日常点检' },
    { value: 300, name: '周点检' },
    { value: 200, name: '月点检' }
  ]}]
})

// 模拟表格数据 30条
const getMockTableData = () => {
  const list = []
  for(let i=1; i<=30; i++){
    list.push({
      planId: `P${String(i).padStart(3,'0')}`,
      equipCode: `EQ-2025-${String(i).padStart(3,'0')}`,
      equipName: `${['桥式','电动','液压','升降'][i%4]}起重机${i}号`,
      categoryName: ['起重设备','运输设备','电气设备','机械设备'][i%4],
      inspectorName: ['张三','李四','王五','赵六'][i%4],
      checkDate: '2025-04-20',
      status: i%3 ===0 ? 0 : i%3 ===1 ? 1 : 2,
      isAbnormal: i%5 ===0 ? 1 : 2,
      content: '制动/液压/电气系统检查',
      standard: '运行正常无异常',
      timeLimit: '24H',
      remark: i%5 ===0 ? '需维护' : '正常'
    })
  }
  return list
}

onMounted(() => {
  getList()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped lang="scss">
.check-report-container {
  padding: 20px;
  background: #f5f7fa;
//   min-height: 100vh;
}
.page-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  .title { font-size: 22px; font-weight: 600; color: #1f2329; margin-right: 12px; }
  .desc { font-size: 14px; color: #909399; }
}
.search-box {
  background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.data-card-group {
  display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  .data-card {
    flex: 1; min-width: 200px; background: #fff; border-radius: 8px; padding: 20px;
    display: flex; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .card-icon {
    width: 56px; height: 56px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; color: #fff; margin-right: 16px;
  }
  .card-content {
    .label { font-size:14px; color:#909399; margin:0; }
    .value { font-size:24px; font-weight:600; color:#1f2329; margin:4px 0 0; }
  }
}

/* 图表：一行4个，统一高度 */
.chart-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  .chart-item {
    flex: 1;
    height: 260px;
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .chart-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .chart-box {
    width: 100%;
    height: 200px;
  }
}

/* 表格高度占屏幕50%以上 */
.table-box {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
//   min-height: 50vh;
  height: 680px;
  display: flex;
  flex-direction: column;
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .table-title { font-size:16px; font-weight:600; }
    .table-desc { font-size:13px; color:#909399; }
  }
  :deep(.el-table) {
    flex: 1;
  }
  :deep(.el-table__inner-wrapper) {
    height: 100%;
  }
  :deep(.el-table__body-wrapper) {
    height: calc(50vh - 150px) !important;
    overflow-y: auto;
  }
}
:deep(.el-pagination) {
  margin-top: 16px;
  text-align: right;
}
</style>