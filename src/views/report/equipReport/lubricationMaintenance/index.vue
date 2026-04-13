<template>
  <div class="lubrication-report-container">

    <!-- 筛选区域：适配润滑保养业务维度 -->
    <div class="search-box">
      <el-form :model="queryParams" inline :inline-message="true" class="search-form">
        <el-form-item label="保养日期">
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
        <el-form-item label="保养状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width:140px">
            <el-option label="未保养" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="润滑类型">
          <el-select v-model="queryParams.lubeType" placeholder="请选择" clearable style="width:140px">
            <el-option label="油脂润滑" value="1" />
            <el-option label="液体润滑" value="2" />
            <el-option label="固体润滑" value="3" />
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

    <!-- 核心数据卡片：贴合润滑保养业务指标 -->
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

    <!-- 图表区域：4个一行，高度统一，适配润滑业务 -->
    <div class="chart-wrapper">
      <div class="chart-item">
        <div class="chart-title">保养完成率趋势</div>
        <div id="trendChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">设备分类保养统计</div>
        <div id="categoryChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">润滑类型占比</div>
        <div id="typeChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">超期未保养TOP10</div>
        <div id="overdueChart" class="chart-box"></div>
      </div>
    </div>

    <!-- 统计表格：固定高度100px，30条假数据，贴合润滑保养字段 -->
    <div class="table-box">
      <div class="table-header">
        <span class="table-title">润滑保养明细统计表</span>
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
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="保养计划ID" prop="planId" width="120" align="center" />
        <el-table-column label="设备编号" prop="equipCode" width="140" align="center" />
        <el-table-column label="设备名称" prop="equipName" min-width="180" />
        <el-table-column label="设备小类" prop="categoryName" width="120" align="center" />
        <el-table-column label="保养人员" prop="maintainerName" width="100" align="center" />
        <el-table-column label="保养日期" prop="maintainDate" width="120" align="center" />
        <el-table-column label="保养状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 2 ? 'success' : scope.row.status === 1 ? 'warning' : 'info'">
              {{ scope.row.status === 2 ? '已完成' : scope.row.status === 1 ? '进行中' : '未保养' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="润滑类型" width="100" align="center">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.lubeType === 1 ? '油脂' : scope.row.lubeType === 2 ? '液体' : '固体' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="润滑部位" prop="lubePart" min-width="150" />
        <el-table-column label="润滑剂型号" prop="lubeModel" min-width="150" />
        <el-table-column label="保养周期" prop="maintainCycle" width="100" align="center" />
        <el-table-column label="备注" prop="remark" min-width="120" />
      </el-table>

      <!-- 分页：样式与点检报表一致 -->
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
// 复用图标库，贴合润滑业务视觉
import { Search, Refresh, Download, PieChart, Histogram, TrendCharts, Clock } from '@element-plus/icons-vue'

// 查询参数：新增润滑类型维度，适配业务
const queryParams = reactive({
  dateRange: [],
  categoryId: '',
  status: '',
  lubeType: '',
  pageNum: 1,
  pageSize: 30
})

// 表格与加载状态：与点检报表一致
const loading = ref(false)
const tableList = ref([])
const total = ref(0)

// 图表实例：4个业务图表
let trendChart = null
let categoryChart = null
let typeChart = null
let overdueChart = null

// 核心统计卡片：润滑保养专属指标，配色复用原规范
const statCards = ref([
  { label: '总保养任务', value: '1,568', icon: PieChart, color: '#409EFF' },
  { label: '已完成保养', value: '1,325', icon: TrendCharts, color: '#67C23A' },
  { label: '超期未保养', value: '186', icon: Clock, color: '#F56C6C' },
  { label: '油脂润滑占比', value: '68.5%', icon: Histogram, color: '#E6A23C' },
  { label: '保养完成率', value: '84.5%', icon: PieChart, color: '#0FC6C2' }
])

// 获取报表数据：逻辑复用，仅修改数据维度
const getList = async () => {
  loading.value = true
  try {
    setTimeout(() => {
      tableList.value = getMockTableData()
      total.value = 1568
      loading.value = false
      initCharts()
      ElMessage.success('润滑保养数据加载成功')
    }, 500)
  } catch (e) {
    loading.value = false
    ElMessage.error('润滑保养数据加载失败')
  }
}

// 重置查询：清空所有润滑业务筛选条件
const resetQuery = () => {
  queryParams.dateRange = []
  queryParams.categoryId = ''
  queryParams.status = ''
  queryParams.lubeType = ''
  queryParams.pageNum = 1
  getList()
}

// 导出Excel：复用交互逻辑
const exportExcel = () => {
  ElMessage.success('润滑保养报表导出成功，文件下载中...')
}

// 初始化所有图表：适配润滑业务展示维度
const initCharts = () => {
  // 保养完成率趋势图
  trendChart = ECharts.init(document.getElementById('trendChart'))
  trendChart.setOption(getTrendOption())

  // 设备分类保养统计图
  categoryChart = ECharts.init(document.getElementById('categoryChart'))
  categoryChart.setOption(getCategoryOption())

  // 润滑类型占比图
  typeChart = ECharts.init(document.getElementById('typeChart'))
  typeChart.setOption(getTypeOption())

  // 超期未保养TOP10图
  overdueChart = ECharts.init(document.getElementById('overdueChart'))
  overdueChart.setOption(getOverdueOption())
}

// 窗口自适应：复用方法，保证图表响应式
const resizeCharts = () => {
  trendChart?.resize()
  categoryChart?.resize()
  typeChart?.resize()
  overdueChart?.resize()
}

// 图表配置项：贴合润滑保养业务数据，样式统一
const getTrendOption = () => ({
  xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'], axisLabel: { fontSize: 12 } },
  yAxis: { type: 'value', max: 100, name: '完成率(%)' },
  series: [{ data: [75, 82, 78, 88, 92, 89, 84], type: 'line', smooth: true, color: '#409EFF' }],
  grid: { top: 20, right: 10, bottom: 30, left: 30 }
})
const getCategoryOption = () => ({
  xAxis: { type: 'category', data: ['起重', '运输', '电气', '机械'], axisLabel: { fontSize: 12 } },
  yAxis: { type: 'value', name: '保养次数' },
  series: [{ data: [420, 356, 289, 460], type: 'bar', color: '#67C23A' }],
  grid: { top: 20, right: 10, bottom: 30, left: 30 }
})
const getTypeOption = () => ({
  series: [{ 
    type: 'pie', 
    radius: '50%', 
    data: [
      { value: 68.5, name: '油脂润滑' },
      { value: 25.3, name: '液体润滑' },
      { value: 6.2, name: '固体润滑' }
    ],
    color: ['#E6A23C', '#409EFF', '#0FC6C2']
  }],
  label: { fontSize: 12 }
})
const getOverdueOption = () => ({
  xAxis: { type: 'value', name: '超期天数' },
  yAxis: { type: 'category', data: ['设备A', '设备B', '设备C', '设备D', '设备E'], axisLabel: { fontSize: 12 } },
  series: [{ data: [15, 12, 9, 7, 5], type: 'bar', color: '#F56C6C' }],
  grid: { top: 20, right: 10, bottom: 30, left: 30 }
})

// 模拟表格数据：30条，贴合润滑保养业务字段，数据维度丰富
const getMockTableData = () => {
  const list = []
  for(let i=1; i<=30; i++){
    list.push({
      planId: `LP${String(i).padStart(3,'0')}`,
      equipCode: `EQ-2025-${String(i).padStart(3,'0')}`,
      equipName: `${['桥式','电动','液压','升降'][i%4]}起重机${i}号`,
      categoryName: ['起重设备','运输设备','电气设备','机械设备'][i%4],
      maintainerName: ['张三','李四','王五','赵六','孙七'][i%5],
      maintainDate: i%3 === 2 ? '2025-04-20' : '-',
      status: i%3 ===0 ? 0 : i%3 ===1 ? 1 : 2,
      lubeType: i%3 ===0 ? 1 : i%3 ===1 ? 2 : 3,
      lubePart: `${['轴承','齿轮箱','导轨','液压泵'][i%4]}部位`,
      lubeModel: `${['L-AN46','HL-32','锂基脂3号','二硫化钼'][i%4]}`,
      maintainCycle: `${['7天','15天','30天','90天'][i%4]}`,
      remark: i%5 ===0 ? '需更换润滑剂' : (i%3 ===0 ? '超期未保养' : '正常')
    })
  }
  return list
}

// 生命周期：复用，保证事件绑定/解绑
onMounted(() => {
  getList()
  window.addEventListener('resize', resizeCharts)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped lang="scss">
// 根容器：与点检报表样式完全一致
.lubrication-report-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
// 页面标题：样式复用
.page-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  .title { font-size: 22px; font-weight: 600; color: #1f2329; margin-right: 12px; }
  .desc { font-size: 14px; color: #909399; }
}
// 筛选框：样式复用
.search-box {
  background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
// 核心数据卡片：样式完全复用，仅类名适配
.data-card-group {
  display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  .data-card {
    flex: 1; min-width: 200px; background: #fff; border-radius: 8px; padding: 20px;
    display: flex; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: all 0.3s;
    &:hover { transform: translateY(-3px); }
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
// 图表区域：4个一行，高度统一，样式完全复用
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
// 表格区域：固定高度100px，样式完全复用点检报表
.table-box {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: 680px;
  display: flex;
  flex-direction: column;
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .table-title { font-size:14px; font-weight:600; }
    .table-desc { font-size:12px; color:#909399; }
  }
  :deep(.el-table) {
    flex: 1;
    height: 60px; /* 表格内容区高度 */
  }
  :deep(.el-table__body-wrapper) {
    height: 60px !important;
    overflow-y: auto; /* 内容超出滚动 */
  }
}
// 分页：样式复用，适配固定表格高度
:deep(.el-pagination) {
  margin-top: 8px;
  text-align: right;
  font-size: 12px;
}
</style>