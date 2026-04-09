<template>
  <div class="workorder-report-container">


    <!-- 筛选区域 -->
    <div class="search-box">
      <el-form :model="queryParams" inline :inline-message="true" class="search-form">
        <el-form-item label="工单日期">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="创建开始"
            end-placeholder="创建结束"
            value-format="YYYY-MM-DD"
            style="width:300px"
          />
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select v-model="queryParams.orderType" placeholder="请选择" clearable style="width:140px">
            <el-option label="维修工单" value="1" />
            <el-option label="保养工单" value="2" />
            <el-option label="点检工单" value="3" />
            <el-option label="故障工单" value="4" />
            <el-option label="技改工单" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="请选择" clearable style="width:120px">
            <el-option label="紧急" value="1" />
            <el-option label="高" value="2" />
            <el-option label="中" value="3" />
            <el-option label="低" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="queryParams.handleStatus" placeholder="请选择" clearable style="width:140px">
            <el-option label="待分配" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="待验收" value="2" />
            <el-option label="已完成" value="3" />
            <el-option label="已作废" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行部门">
          <el-select v-model="queryParams.deptId" placeholder="请选择" clearable style="width:140px">
            <el-option label="设备部" value="101" />
            <el-option label="维修班" value="102" />
            <el-option label="保养班" value="103" />
            <el-option label="技术部" value="104" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备分类">
          <el-select v-model="queryParams.categoryId" placeholder="请选择" clearable style="width:140px">
            <el-option label="起重设备" value="201" />
            <el-option label="运输设备" value="202" />
            <el-option label="电气设备" value="203" />
            <el-option label="机械设备" value="204" />
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
          <el-button type="info" @click="exportDetailExcel">
            <el-icon><Download /></el-icon> 导出明细
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 核心统计卡片 -->
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

    <!-- 图表区域 -->
    <div class="chart-wrapper">
      <div class="chart-item">
        <div class="chart-title">工单创建量趋势（近7天）</div>
        <div id="createTrendChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">工单类型占比分析</div>
        <div id="typePieChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">处理状态分布统计</div>
        <div id="statusBarChart" class="chart-box"></div>
      </div>
      <div class="chart-item">
        <div class="chart-title">各部门工单处理量TOP5</div>
        <div id="deptRankChart" class="chart-box"></div>
      </div>
    </div>

    <!-- 工单明细表格 -->
    <div class="table-box">
      <div class="table-header">
        <span class="table-title">设备工单明细统计表</span>
        <span class="table-desc">共 {{ total }} 条记录 | 今日新增 {{ todayNew }} 条</span>
      </div>
      <el-table
        v-loading="loading"
        :data="tableList"
        border
        stripe
        size="small"
        highlight-current-row
        style="width:100%"
        :default-sort="{prop: 'createTime', order: 'descending'}"
      >
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="工单编号" prop="orderCode" width="160" align="center" sortable />
        <el-table-column label="工单类型" prop="orderTypeName" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.orderType === 4 ? 'danger' : scope.row.orderType === 1 ? 'primary' : 'success'">
              {{ scope.row.orderTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" prop="priorityName" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 1 ? 'danger' : scope.row.priority === 2 ? 'warning' : 'info'">
              {{ scope.row.priorityName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联设备" width="220">
          <template #default="scope">
            <div>{{ scope.row.equipName }}</div>
            <div style="font-size:12px; color:#999">{{ scope.row.equipCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建人/部门" width="140">
          <template #default="scope">
            <div>{{ scope.row.createUserName }}</div>
            <div style="font-size:12px; color:#999">{{ scope.row.createDeptName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="执行人/部门" width="140">
          <template #default="scope">
            <div>{{ scope.row.execUserName || '未分配' }}</div>
            <div style="font-size:12px; color:#999">{{ scope.row.execDeptName || '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建/完成时间" width="200" align="center">
          <template #default="scope">
            <div>{{ scope.row.createTime }}</div>
            <div style="font-size:12px; color:#999">{{ scope.row.completeTime || '未完成' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" prop="handleStatusName" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.handleStatus)">
              {{ scope.row.handleStatusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理耗时" prop="handleHours" width="100" align="center">
          <template #default="scope">
            {{ scope.row.handleHours || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="工单主题" prop="orderTitle" min-width="200" />
        <el-table-column label="验收结果" prop="checkResultName" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.checkResult">{{ scope.row.checkResultName }}</span>
            <span v-else style="color:#999">—</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
        :page-sizes="[10, 20, 30, 50, 100]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ECharts from 'echarts'
import { Search, Refresh, Download, Warning, Clock, PieChart, UserFilled } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  dateRange: [],
  orderType: '',
  priority: '',
  handleStatus: '',
  deptId: '',
  categoryId: '',
  pageNum: 1,
  pageSize: 50
})

// 表格数据
const loading = ref(false)
const tableList = ref([])
const total = ref(0)
const todayNew = ref(0)

// 图表实例
let createTrendChart = null
let typePieChart = null
let statusBarChart = null
let deptRankChart = null

// 统计卡片（全部使用 100% 安全图标）
const statCards = ref([
  { label: '总创建工单', value: '2,864', icon: Clock, color: '#409EFF' },
  { label: '今日新增工单', value: '68', icon: Clock, color: '#67C23A' },
  { label: '未处理工单', value: '328', icon: Warning, color: '#F56C6C' },
  { label: '已完成工单', value: '2,416', icon: UserFilled, color: '#0FC6C2' },
  { label: '紧急工单', value: '156', icon: Warning, color: '#E6A23C' },
  { label: '故障工单占比', value: '32.5%', icon: PieChart, color: '#F7BA1E' },
  { label: '平均处理耗时', value: '4.2H', icon: Clock, color: '#722ED1' },
  { label: '工单完成率', value: '84.4%', icon: PieChart, color: '#13C2C2' },
  { label: '验收合格率', value: '98.2%', icon: UserFilled, color: '#52C41A' },
  { label: '作废工单', value: '42', icon: Warning, color: '#FF4D4F' }
])

// 状态样式
const getStatusTagType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'primary'
    case 3: return 'success'
    case 4: return 'danger'
    default: return 'gray'
  }
}

// 获取数据
const getList = async () => {
  loading.value = true
  try {
    setTimeout(() => {
      const mockData = getMockTableData()
      tableList.value = mockData
      total.value = 2864
      todayNew.value = 68
      loading.value = false
      initCharts()
      ElMessage.success('设备工单数据加载成功')
    }, 600)
  } catch (e) {
    loading.value = false
    ElMessage.error('设备工单数据加载失败')
  }
}

// 重置
const resetQuery = () => {
  queryParams.dateRange = []
  queryParams.orderType = ''
  queryParams.priority = ''
  queryParams.handleStatus = ''
  queryParams.deptId = ''
  queryParams.categoryId = ''
  queryParams.pageNum = 1
  getList()
}

// 导出
const exportExcel = () => {
  ElMessage.success('设备工单统计报表导出成功，文件下载中...')
}
const exportDetailExcel = () => {
  ElMessage.success('设备工单明细报表导出成功，文件下载中...')
}

// 初始化图表
const initCharts = () => {
  createTrendChart = ECharts.init(document.getElementById('createTrendChart'))
  createTrendChart.setOption(getCreateTrendOption())

  typePieChart = ECharts.init(document.getElementById('typePieChart'))
  typePieChart.setOption(getTypePieOption())

  statusBarChart = ECharts.init(document.getElementById('statusBarChart'))
  statusBarChart.setOption(getStatusBarOption())

  deptRankChart = ECharts.init(document.getElementById('deptRankChart'))
  deptRankChart.setOption(getDeptRankOption())
}

// 自适应
const resizeCharts = () => {
  createTrendChart?.resize()
  typePieChart?.resize()
  statusBarChart?.resize()
  deptRankChart?.resize()
}

// 图表配置
const getCreateTrendOption = () => ({
  xAxis: { type: 'category', data: ['04-14', '04-15', '04-16', '04-17', '04-18', '04-19', '04-20'] },
  yAxis: { type: 'value' },
  series: [{ data: [86,72,98,65,82,95,68], type: 'line', smooth: true, color: '#409EFF' }],
  grid: { top:20, right:15, bottom:30, left:40 }
})

const getTypePieOption = () => ({
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value:32.5, name:'故障工单' },
      { value:28.3, name:'维修工单' },
      { value:20.7, name:'保养工单' },
      { value:12.5, name:'点检工单' },
      { value:6.0, name:'技改工单' }
    ]
  }]
})

const getStatusBarOption = () => ({
  xAxis: { type: 'category', data: ['待分配','处理中','待验收','已完成','已作废'] },
  yAxis: { type: 'value' },
  series: [{ data: [126,202,186,2416,42], type: 'bar' }]
})

const getDeptRankOption = () => ({
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: ['维修班','设备部','保养班','技术部','生产部'] },
  series: [{ data: [896,752,586,328,216], type: 'bar' }]
})

// 模拟50条数据
const getMockTableData = () => {
  const list = []
  const orderTypeMap = {1:'维修工单',2:'保养工单',3:'点检工单',4:'故障工单',5:'技改工单'}
  const priorityMap = {1:'紧急',2:'高',3:'中',4:'低'}
  const statusMap = {0:'待分配',1:'处理中',2:'待验收',3:'已完成',4:'已作废'}
  const deptMap = {101:'设备部',102:'维修班',103:'保养班',104:'技术部',105:'生产部'}
  const equipCateMap = {201:'起重设备',202:'运输设备',203:'电气设备',204:'机械设备'}
  const checkResultMap = {1:'合格',2:'不合格'}

  for(let i=1; i<=50; i++){
    const orderType = [1,2,3,4,5][i%5]
    const priority = [1,2,3,4][i%4]
    const status = [0,1,2,3,4][i%5]
    const createDept = [101,102,103,104,105][i%5]
    const execDept = status===0 ? '' : [101,102,103,104][i%4]
    const equipCate = [201,202,203,204][i%4]
    const checkResult = status===3 ? [1,2][i%2] : ''
    const createTime = `2025-04-${String(14+i%7).padStart(2,'0')} 08:${String(10+i%50).padStart(2,'0')}`
    const completeTime = status===3 ? `2025-04-${String(14+i%7).padStart(2,'0')} 12:${String(10+i%50).padStart(2,'0')}` : ''
    const handleHours = status===3 ? `${2+i%8}.${i%10}H` : ''

    list.push({
      orderCode: `WO2025${String(i).padStart(5,'0')}`,
      orderType, orderTypeName:orderTypeMap[orderType],
      priority, priorityName:priorityMap[priority],
      equipCode: `EQ-2025-${String(i).padStart(3,'0')}`,
      equipName: `${['桥式起重机','电动叉车','高压配电柜','液压泵站','皮带输送机'][i%5]}${i}号`,
      equipCateName: equipCateMap[equipCate],
      createUserName: ['张三','李四','王五','赵六','孙七'][i%5],
      createDeptName: deptMap[createDept],
      execUserName: status===0 ? '' : ['刘一','陈二','杨五','黄六','吴七'][i%5],
      execDeptName: execDept ? deptMap[execDept] : '',
      createTime, completeTime,
      handleStatus:status, handleStatusName:statusMap[status],
      handleHours,
      orderTitle: `${orderTypeMap[orderType]}：${['制动系统故障','定期润滑保养','日常点检检查','电机异响','线路改造'][i%5]}`,
      checkResult, checkResultName:checkResultMap[checkResult] || ''
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
  createTrendChart?.dispose()
  typePieChart?.dispose()
  statusBarChart?.dispose()
  deptRankChart?.dispose()
})
</script>

<style scoped lang="scss">
.workorder-report-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
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
    flex: 1; min-width: 180px; background: #fff; border-radius: 8px; padding: 16px;
    display: flex; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .card-icon {
    width: 48px; height: 48px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; color: #fff; margin-right: 12px;
  }
  .card-content {
    .label { font-size:13px; color:#909399; margin:0; }
    .value { font-size:20px; font-weight:600; color:#1f2329; margin:4px 0 0; }
  }
}
.chart-wrapper {
  display: flex; gap: 16px; margin-bottom: 20px;
  .chart-item {
    flex: 1; height: 260px; background: #fff; border-radius: 8px; padding: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .chart-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
  .chart-box { width: 100%; height: 200px; }
}
.table-box {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: 680px;
  display: flex;
  flex-direction: column;
  .table-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
    .table-title { font-size:14px; font-weight:600; }
    .table-desc { font-size:12px; color:#999; }
  }
  :deep(.el-table) {
    flex: 1;
    height: 60px;
    font-size: 12px;
  }
  :deep(.el-table__body-wrapper) {
    height: 60px !important;
    overflow-y: auto;
  }
}
:deep(.el-pagination) {
  margin-top: 8px;
  text-align: right;
  font-size: 12px;
}
</style>