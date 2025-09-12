<!--
 * @Author: zhangsd
 * @Date: 2025-09-10 16:51:51
 * @LastEditTime: 2025-09-10 16:52:55
 * @LastEditors: zhangsd
 * @Description: 
 * @FilePath: \view\src\views\example\process\detail\CustomFlowChart.vue
-->
<template>
  <div class="custom-flow-chart">
    <div class="chart-toolbar">
      <el-button size="small" @click="resetPosition">重置位置</el-button>
      <el-button size="small" @click="zoomIn">放大</el-button>
      <el-button size="small" @click="zoomOut">缩小</el-button>
      <span class="zoom-info">缩放: {{ Math.round(scale * 100) }}%</span>
      <el-select v-model="filterArea" placeholder="筛选区域" size="small" @change="applyFilter">
        <el-option label="全部" value=""></el-option>
        <el-option label="A区" value="A区"></el-option>
        <el-option label="B区" value="B区"></el-option>
        <el-option label="C区" value="C区"></el-option>
        <el-option label="D区" value="D区"></el-option>
        <el-option label="码头" value="码头"></el-option>
        <el-option label="仓库" value="仓库"></el-option>
      </el-select>
    </div>
    
    <div 
      ref="container" 
      class="chart-container"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <svg 
        ref="svgRef" 
        :width="svgWidth" 
        :height="svgHeight"
        class="flow-svg"
      >
        <!-- 连接线 -->
        <g v-for="edge in filteredEdges" :key="`${edge.source}-${edge.target}`">
          <line
            :x1="getNodeX(edge.source)"
            :y1="getNodeY(edge.source)"
            :x2="getNodeX(edge.target)"
            :y2="getNodeY(edge.target)"
            stroke="#409EFF"
            stroke-width="2"
            marker-end="url(#arrowhead)"
          />
          <text
            v-if="showLabels"
            :x="(getNodeX(edge.source) + getNodeX(edge.target)) / 2"
            :y="(getNodeY(edge.source) + getNodeY(edge.target)) / 2 - 5"
            text-anchor="middle"
            font-size="10"
            fill="#606266"
          >
            {{ edge.label }}
          </text>
        </g>
        
        <!-- 节点 -->
        <g 
          v-for="node in filteredNodes" 
          :key="node.id"
          :transform="`translate(${getNodeX(node.id)}, ${getNodeY(node.id)})`"
          @click="showNodeDetail(node)"
        >
          <rect
            :class="['node-rect', { 'start-node': node.isStart, 'end-node': node.isEnd }]"
            :width="nodeWidth"
            :height="nodeHeight"
            rx="8"
            ry="8"
            :fill="getNodeColor(node)"
            stroke="#409EFF"
            stroke-width="2"
            cursor="pointer"
            opacity="0.9"
          />
          
          <text
            x="50%"
            y="20"
            text-anchor="middle"
            font-size="12"
            font-weight="bold"
            fill="#fff"
          >
            {{ node.name }}
          </text>
          
          <text
            x="50%"
            y="35"
            text-anchor="middle"
            font-size="10"
            fill="#fff"
          >
            {{ node.type }}
          </text>
          
          <text
            x="50%"
            y="50"
            text-anchor="middle"
            font-size="10"
            fill="#fff"
          >
            {{ node.quantity }}件
          </text>
          
          <text
            x="50%"
            y="65"
            text-anchor="middle"
            font-size="10"
            fill="#fff"
          >
            {{ node.weight }}t
          </text>
        </g>
        
        <!-- 箭头标记 -->
        <defs>
          <marker 
            id="arrowhead" 
            markerWidth="10" 
            markerHeight="7" 
            refX="0" 
            refY="3.5" 
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#409EFF" />
          </marker>
        </defs>
      </svg>
    </div>
    
    <!-- 节点详情弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="currentNode?.name"
      width="500px"
      destroy-on-close
    >
      <el-form label-width="80px" size="small">
        <el-form-item label="节点名称">{{ currentNode?.name }}</el-form-item>
        <el-form-item label="节点类型">{{ currentNode?.type }}</el-form-item>
        <el-form-item label="货物信息">{{ currentNode?.goods }}</el-form-item>
        <el-form-item label="件数">{{ currentNode?.quantity }}</el-form-item>
        <el-form-item label="吨数">{{ currentNode?.weight }}</el-form-item>
        <el-form-item label="开始时间">{{ currentNode?.startTime }}</el-form-item>
        <el-form-item label="结束时间">{{ currentNode?.endTime }}</el-form-item>
        <el-form-item label="操作员">{{ currentNode?.operator }}</el-form-item>
        <el-form-item label="备注">{{ currentNode?.remark }}</el-form-item>
        <el-form-item label="区域">{{ currentNode?.area }}</el-form-item>
        <el-form-item label="状态">{{ currentNode?.status }}</el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 关系类型统计 -->
    <div class="relationship-stats">
      <div class="stat-card">
        <h4>一对一关系</h4>
        <p>{{ relationshipTypes.oneToOne.length }} 个</p>
      </div>
      <div class="stat-card">
        <h4>一对多关系</h4>
        <p>{{ relationshipTypes.oneToMany.length }} 个</p>
      </div>
      <div class="stat-card">
        <h4>多对一关系</h4>
        <p>{{ relationshipTypes.manyToOne.length }} 个</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 复杂港口作业流程数据
const flowData = {
  nodes: [
    // 开始节点
    {
      id: 'start_1',
      name: '集港作业',
      type: '集港',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 08:00:00',
      endTime: '2024-01-15 12:00:00',
      operator: '张三',
      remark: '批量进港',
      isStart: true,
      isEnd: false,
      x: 50,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    // 多对一关系 - 多个集港作业汇聚到堆场
    {
      id: 'node_1',
      name: '进入堆场A',
      type: '堆场',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 12:00:00',
      endTime: '2024-01-15 14:00:00',
      operator: '李四',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 200,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    {
      id: 'node_2',
      name: '进入堆场B',
      type: '堆场',
      goods: '钢材',
      quantity: 800,
      weight: 400.0,
      startTime: '2024-01-15 12:30:00',
      endTime: '2024-01-15 14:30:00',
      operator: '王五',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 200,
      y: 200,
      status: 'completed',
      area: 'B区'
    },
    
    // 一对一关系 - 堆场作业与质检
    {
      id: 'node_3',
      name: '质检作业',
      type: '质检',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 14:00:00',
      endTime: '2024-01-15 15:00:00',
      operator: '赵六',
      remark: '质量检测',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 100,
      status: 'completed',
      area: 'A区'
    },
    
    // 一对多关系 - 一个质检作业对应多个装船任务
    {
      id: 'node_4',
      name: '装船作业1',
      type: '装船',
      goods: '钢材',
      quantity: 400,
      weight: 200.0,
      startTime: '2024-01-15 15:00:00',
      endTime: '2024-01-15 17:00:00',
      operator: '钱七',
      remark: '装船作业1',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 50,
      status: 'completed',
      area: '码头1'
    },
    
    {
      id: 'node_5',
      name: '装船作业2',
      type: '装船',
      goods: '钢材',
      quantity: 300,
      weight: 150.0,
      startTime: '2024-01-15 15:30:00',
      endTime: '2024-01-15 17:30:00',
      operator: '孙八',
      remark: '装船作业2',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 150,
      status: 'completed',
      area: '码头2'
    },
    
    {
      id: 'node_6',
      name: '装船作业3',
      type: '装船',
      goods: '钢材',
      quantity: 300,
      weight: 150.0,
      startTime: '2024-01-15 16:00:00',
      endTime: '2024-01-15 18:00:00',
      operator: '周九',
      remark: '装船作业3',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 250,
      status: 'processing',
      area: '码头3'
    },
    
    // 多对一关系 - 多个装船作业汇聚到疏港
    {
      id: 'node_7',
      name: '疏港作业',
      type: '疏港',
      goods: '钢材',
      quantity: 1000,
      weight: 500.0,
      startTime: '2024-01-15 18:00:00',
      endTime: '2024-01-15 20:00:00',
      operator: '吴十',
      remark: '疏港出港',
      isStart: false,
      isEnd: true,
      x: 650,
      y: 150,
      status: 'pending',
      area: '码头'
    },
    
    // 一对一关系 - 装船与转垛
    {
      id: 'node_8',
      name: '转垛作业',
      type: '转垛',
      goods: '钢材',
      quantity: 200,
      weight: 100.0,
      startTime: '2024-01-15 17:00:00',
      endTime: '2024-01-15 19:00:00',
      operator: '郑十一',
      remark: '转垛作业',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 250,
      status: 'completed',
      area: 'A区'
    },
    
    // 多对一关系 - 多个转垛作业汇聚到堆场
    {
      id: 'node_9',
      name: '堆场C入库',
      type: '堆场',
      goods: '钢材',
      quantity: 200,
      weight: 100.0,
      startTime: '2024-01-15 19:00:00',
      endTime: '2024-01-15 20:00:00',
      operator: '王十二',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 350,
      status: 'completed',
      area: 'C区'
    },
    
    {
      id: 'node_10',
      name: '堆场D入库',
      type: '堆场',
      goods: '钢材',
      quantity: 100,
      weight: 50.0,
      startTime: '2024-01-15 19:30:00',
      endTime: '2024-01-15 20:30:00',
      operator: '李十三',
      remark: '堆场入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 450,
      status: 'completed',
      area: 'D区'
    },
    
    // 一对一关系 - 堆场与盘点
    {
      id: 'node_11',
      name: '库存盘点',
      type: '盘点',
      goods: '钢材',
      quantity: 1300,
      weight: 650.0,
      startTime: '2024-01-15 20:00:00',
      endTime: '2024-01-15 21:00:00',
      operator: '赵十四',
      remark: '库存盘点',
      isStart: false,
      isEnd: false,
      x: 650,
      y: 350,
      status: 'pending',
      area: '仓库'
    },
    
    // 多对一关系 - 多个盘点作业汇聚到最终报告
    {
      id: 'end_1',
      name: '作业完成报告',
      type: '报告',
      goods: '钢材',
      quantity: 1300,
      weight: 650.0,
      startTime: '2024-01-15 21:00:00',
      endTime: '2024-01-15 22:00:00',
      operator: '钱十五',
      remark: '作业总结报告',
      isStart: false,
      isEnd: true,
      x: 800,
      y: 350,
      status: 'pending',
      area: '办公室'
    },
    
    // 异常处理节点
    {
      id: 'node_12',
      name: '质检异常处理',
      type: '异常处理',
      goods: '钢材',
      quantity: 50,
      weight: 25.0,
      startTime: '2024-01-15 15:00:00',
      endTime: '2024-01-15 16:00:00',
      operator: '孙十六',
      remark: '质检不合格处理',
      isStart: false,
      isEnd: false,
      x: 350,
      y: 350,
      status: 'completed',
      area: '质检室'
    },
    
    {
      id: 'node_13',
      name: '重新入库',
      type: '堆场',
      goods: '钢材',
      quantity: 50,
      weight: 25.0,
      startTime: '2024-01-15 16:00:00',
      endTime: '2024-01-15 17:00:00',
      operator: '周十七',
      remark: '重新入库',
      isStart: false,
      isEnd: false,
      x: 500,
      y: 550,
      status: 'completed',
      area: 'A区'
    }
  ],
  
  edges: [
    // 开始节点到堆场（一对一）
    { source: 'start_1', target: 'node_1', label: '集港→堆场A' },
    
    // 多对一关系 - 多个集港作业汇聚到堆场
    { source: 'start_1', target: 'node_2', label: '集港→堆场B' },
    
    // 一对一关系 - 堆场到质检
    { source: 'node_1', target: 'node_3', label: '堆场→质检' },
    
    // 一对多关系 - 质检到多个装船
    { source: 'node_3', target: 'node_4', label: '质检→装船1' },
    { source: 'node_3', target: 'node_5', label: '质检→装船2' },
    { source: 'node_3', target: 'node_6', label: '质检→装船3' },
    
    // 多对一关系 - 多个装船作业汇聚到疏港
    { source: 'node_4', target: 'node_7', label: '装船1→疏港' },
    { source: 'node_5', target: 'node_7', label: '装船2→疏港' },
    { source: 'node_6', target: 'node_7', label: '装船3→疏港' },
    
    // 一对一关系 - 装船与转垛
    { source: 'node_6', target: 'node_8', label: '装船→转垛' },
    
    // 多对一关系 - 多个转垛作业汇聚到堆场
    { source: 'node_8', target: 'node_9', label: '转垛→堆场C' },
    { source: 'node_8', target: 'node_10', label: '转垛→堆场D' },
    
    // 一对一关系 - 堆场与盘点
    { source: 'node_9', target: 'node_11', label: '堆场C→盘点' },
    { source: 'node_10', target: 'node_11', label: '堆场D→盘点' },
    
    // 多对一关系 - 多个盘点作业汇聚到报告
    { source: 'node_11', target: 'end_1', label: '盘点→报告' },
    
    // 异常处理关系
    { source: 'node_12', target: 'node_13', label: '异常处理→重新入库' },
    { source: 'node_13', target: 'node_11', label: '重新入库→盘点' },
    
    // 异常处理与主流程并行
    { source: 'node_3', target: 'node_12', label: '质检→异常处理' }
  ],
  
  relationshipTypes: {
    oneToOne: [
      { from: 'node_1', to: 'node_3', description: '堆场作业→质检作业' },
      { from: 'node_3', to: 'node_4', description: '质检作业→装船作业1' },
      { from: 'node_3', to: 'node_5', description: '质检作业→装船作业2' },
      { from: 'node_3', to: 'node_6', description: '质检作业→装船作业3' },
      { from: 'node_8', to: 'node_9', description: '转垛作业→堆场C' },
      { from: 'node_8', to: 'node_10', description: '转垛作业→堆场D' },
      { from: 'node_9', to: 'node_11', description: '堆场C→库存盘点' },
      { from: 'node_10', to: 'node_11', description: '堆场D→库存盘点' }
    ],
    oneToMany: [
      { from: 'node_3', to: ['node_4', 'node_5', 'node_6'], description: '质检作业→多个装船作业' },
      { from: 'node_1', to: ['node_3', 'node_12'], description: '堆场作业→质检和异常处理' }
    ],
    manyToOne: [
      { from: ['start_1'], to: 'node_1', description: '多个集港作业→堆场A' },
      { from: ['start_1'], to: 'node_2', description: '多个集港作业→堆场B' },
      { from: ['node_4', 'node_5', 'node_6'], to: 'node_7', description: '多个装船作业→疏港作业' },
      { from: ['node_8'], to: ['node_9', 'node_10'], description: '转垛作业→多个堆场' },
      { from: ['node_9', 'node_10'], to: 'node_11', description: '多个堆场→库存盘点' },
      { from: ['node_11'], to: 'end_1', description: '多个盘点→最终报告' }
    ]
  }
}

// 响应式数据
const nodes = ref(flowData.nodes)
const edges = ref(flowData.edges)
const relationshipTypes = ref(flowData.relationshipTypes)

// 图表配置
const nodeWidth = 120
const nodeHeight = 80
const svgWidth = ref(1200)
const svgHeight = ref(700)
const scale = ref(1)
const container = ref(null)
const svgRef = ref(null)
const showLabels = ref(true)
const filterArea = ref('')

// 缩放相关
let isDragging = false
let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0

// 当前选中节点
const currentNode = ref(null)
const dialogVisible = ref(false)

// 计算属性
const filteredNodes = computed(() => {
  if (!filterArea.value) return nodes.value
  return nodes.value.filter(node => node.area === filterArea.value)
})

const filteredEdges = computed(() => {
  if (!filterArea.value) return edges.value
  return edges.value.filter(edge => {
    const sourceNode = nodes.value.find(n => n.id === edge.source)
    const targetNode = nodes.value.find(n => n.id === edge.target)
    return sourceNode?.area === filterArea.value || targetNode?.area === filterArea.value
  })
})

// 获取节点坐标
const getNodeX = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId)
  return node ? node.x * scale.value + offsetX : 0
}

const getNodeY = (nodeId) => {
  const node = nodes.value.find(n => n.id === nodeId)
  return node ? node.y * scale.value + offsetY : 0
}

// 获取节点颜色
const getNodeColor = (node) => {
  if (node.isStart) return '#4CAF50'
  if (node.isEnd) return '#F44336'
  switch (node.status) {
    case 'completed': return '#4CAF50'
    case 'processing': return '#FFC107'
    case 'pending': return '#F44336'
    default: return '#2196F3'
  }
}

// 显示节点详情
const showNodeDetail = (node) => {
  currentNode.value = node
  dialogVisible.value = true
}

// 缩放操作
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.1, 2)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

// 鼠标滚轮缩放
const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.5, Math.min(2, scale.value + delta))
}

// 拖拽操作
const handleMouseDown = (event) => {
  isDragging = true
  startX = event.clientX
  startY = event.clientY
}

const handleMouseMove = (event) => {
  if (isDragging && container.value) {
    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY
    
    offsetX += deltaX
    offsetY += deltaY
    
    startX = event.clientX
    startY = event.clientY
  }
}

const handleMouseUp = () => {
  isDragging = false
}

const resetPosition = () => {
  scale.value = 1
  offsetX = 0
  offsetY = 0
}

const applyFilter = (area) => {
  filterArea.value = area
}

// 更新SVG变换
const updateSvgTransform = () => {
  if (svgRef.value) {
    svgRef.value.style.transform = `scale(${scale.value}) translate(${offsetX}px, ${offsetY}px)`
  }
}

// 监听缩放变化
const observer = new MutationObserver(updateSvgTransform)
onMounted(() => {
  observer.observe(svgRef.value, { attributes: true })
})

onUnmounted(() => {
  observer.disconnect()
})
</script>

<style scoped>
.custom-flow-chart {
  width: 100%;
  height: 700px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.chart-toolbar {
  padding: 10px 16px;
  background: white;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.zoom-info {
  margin-left: auto;
  color: #606266;
}

.chart-container {
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
  position: relative;
}

.flow-svg {
  background: white;
  cursor: grab;
  transition: transform 0.3s ease;
}

.flow-svg:active {
  cursor: grabbing;
}

.node-rect {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.node-rect:hover {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transform: scale(1.05);
}

.start-node {
  fill: #4CAF50;
  stroke: #388E3C;
}

.end-node {
  fill: #F44336;
  stroke: #D32F2F;
}

.relationship-stats {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  flex: 1;
  min-width: 150px;
  text-align: center;
  border: 1px solid #d9ecff;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.stat-card p {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-flow-chart {
    height: 500px;
  }
  
  .chart-toolbar {
    flex-wrap: wrap;
  }
  
  .relationship-stats {
    flex-direction: column;
  }
}
</style>