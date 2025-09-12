<template>
	<div class="flow-chart-container">
		<div class="container">
			<div class="header">
				<h1>复杂港口作业流程图</h1>
				<div class="controls">
					<el-button size="small" @click="resetView">重置视图</el-button>
					<el-button size="small" @click="toggleLabels" :type="showLabels ? 'primary' : ''">
						{{ showLabels ? '隐藏标签' : '显示标签' }}
					</el-button>
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
			</div>

			<div id="chart" class="chart-container"></div>

			<!-- 节点详情弹窗 -->
			<el-dialog v-model="dialogVisible" :title="currentNode?.name" width="600px" destroy-on-close>
				<div class="dialog-content">
					<el-descriptions :column="1" border>
						<el-descriptions-item label="节点名称">{{ currentNode?.name }}</el-descriptions-item>
						<el-descriptions-item label="节点类型">{{ currentNode?.type }}</el-descriptions-item>
						<el-descriptions-item label="货物信息">{{ currentNode?.goods }}</el-descriptions-item>
						<el-descriptions-item label="件数">{{ currentNode?.quantity }}</el-descriptions-item>
						<el-descriptions-item label="吨数">{{ currentNode?.weight }} 吨</el-descriptions-item>
						<el-descriptions-item label="开始时间">{{ currentNode?.startTime }}</el-descriptions-item>
						<el-descriptions-item label="结束时间">{{ currentNode?.endTime || '未完成' }}</el-descriptions-item>
						<el-descriptions-item label="操作员">{{ currentNode?.operator }}</el-descriptions-item>
						<el-descriptions-item label="备注">{{ currentNode?.remark || '无' }}</el-descriptions-item>
						<el-descriptions-item label="区域">{{ currentNode?.area }}</el-descriptions-item>
						<el-descriptions-item label="状态">
							<el-tag :type="getStatusTagType(currentNode?.status)">{{ getStatusText(currentNode?.status) }}</el-tag>
						</el-descriptions-item>
					</el-descriptions>
				</div>
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="dialogVisible = false">关闭</el-button>
					</span>
				</template>
			</el-dialog>

			<!-- 关系类型统计 -->
			<div class="stats-container">
				<div class="stat-card">
					<h3>一对一关系</h3>
					<p>{{ relationshipTypes.oneToOne.length }} 个</p>
				</div>
				<div class="stat-card">
					<h3>一对多关系</h3>
					<p>{{ relationshipTypes.oneToMany.length }} 个</p>
				</div>
				<div class="stat-card">
					<h3>多对一关系</h3>
					<p>{{ relationshipTypes.manyToOne.length }} 个</p>
				</div>
			</div>

			<div class="footer">
				<p>复杂港口作业流程图 · 基于 ECharts 实现</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 响应式数据
const chartInstance = ref(null)
const showLabels = ref(true)
const filterArea = ref('')
const dialogVisible = ref(false)
const currentNode = ref(null)

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
			area: 'A区',
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
			area: 'A区',
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
			area: 'B区',
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
			area: 'A区',
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
			area: '码头1',
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
			area: '码头2',
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
			area: '码头3',
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
			area: '码头',
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
			area: 'A区',
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
			area: 'C区',
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
			area: 'D区',
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
			area: '仓库',
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
			area: '办公室',
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
			area: '质检室',
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
			area: 'A区',
		},

		// 新增节点 - 仓储管理
		{
			id: 'node_14',
			name: '仓储管理',
			type: '仓储',
			goods: '钢材',
			quantity: 1300,
			weight: 650.0,
			startTime: '2024-01-15 21:00:00',
			endTime: '2024-01-15 22:00:00',
			operator: '吴十八',
			remark: '仓储管理',
			isStart: false,
			isEnd: false,
			x: 800,
			y: 450,
			status: 'pending',
			area: '仓库',
		},

		// 新增节点 - 财务结算
		{
			id: 'node_15',
			name: '财务结算',
			type: '财务',
			goods: '钢材',
			quantity: 1300,
			weight: 650.0,
			startTime: '2024-01-15 22:00:00',
			endTime: '2024-01-15 23:00:00',
			operator: '郑十九',
			remark: '财务结算',
			isStart: false,
			isEnd: false,
			x: 950,
			y: 450,
			status: 'pending',
			area: '财务部',
		},

		// 新增节点 - 安全检查
		{
			id: 'node_16',
			name: '安全检查',
			type: '安全',
			goods: '钢材',
			quantity: 1300,
			weight: 650.0,
			startTime: '2024-01-15 22:30:00',
			endTime: '2024-01-15 23:30:00',
			operator: '王二十',
			remark: '安全检查',
			isStart: false,
			isEnd: false,
			x: 950,
			y: 350,
			status: 'pending',
			area: '安全科',
		},

		// 新增节点 - 环保监测
		{
			id: 'node_17',
			name: '环保监测',
			type: '环保',
			goods: '钢材',
			quantity: 1300,
			weight: 650.0,
			startTime: '2024-01-15 23:00:00',
			endTime: '2024-01-15 23:30:00',
			operator: '李二十一',
			remark: '环保监测',
			isStart: false,
			isEnd: false,
			x: 1100,
			y: 350,
			status: 'pending',
			area: '环保部',
		},

		// 新增节点 - 质量追溯
		{
			id: 'node_18',
			name: '质量追溯',
			type: '追溯',
			goods: '钢材',
			quantity: 1300,
			weight: 650.0,
			startTime: '2024-01-15 23:30:00',
			endTime: '2024-01-15 23:50:00',
			operator: '赵二十二',
			remark: '质量追溯',
			isStart: false,
			isEnd: false,
			x: 1100,
			y: 450,
			status: 'pending',
			area: '质检部',
		},
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
		{ source: 'node_3', target: 'node_12', label: '质检→异常处理' },

		// 新增连接关系
		{ source: 'end_1', target: 'node_14', label: '报告→仓储' },
		{ source: 'node_14', target: 'node_15', label: '仓储→财务' },
		{ source: 'node_15', target: 'node_16', label: '财务→安全' },
		{ source: 'node_16', target: 'node_17', label: '安全→环保' },
		{ source: 'node_17', target: 'node_18', label: '环保→追溯' },
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
			{ from: 'node_10', to: 'node_11', description: '堆场D→库存盘点' },
		],
		oneToMany: [
			{ from: 'node_3', to: ['node_4', 'node_5', 'node_6'], description: '质检作业→多个装船作业' },
			{ from: 'node_1', to: ['node_3', 'node_12'], description: '堆场作业→质检和异常处理' },
		],
		manyToOne: [
			{ from: ['start_1'], to: 'node_1', description: '多个集港作业→堆场A' },
			{ from: ['start_1'], to: 'node_2', description: '多个集港作业→堆场B' },
			{ from: ['node_4', 'node_5', 'node_6'], to: 'node_7', description: '多个装船作业→疏港作业' },
			{ from: ['node_8'], to: ['node_9', 'node_10'], description: '转垛作业→多个堆场' },
			{ from: ['node_9', 'node_10'], to: 'node_11', description: '多个堆场→库存盘点' },
			{ from: ['node_11'], to: 'end_1', description: '多个盘点→最终报告' },
		],
	},
}

// 计算属性 - 筛选节点和边
const filteredNodes = computed(() => {
	if (!filterArea.value) return flowData.nodes
	return flowData.nodes.filter(node => node.area === filterArea.value)
})

const filteredEdges = computed(() => {
	if (!filterArea.value) return flowData.edges
	return flowData.edges.filter(edge => {
		const sourceNode = flowData.nodes.find(n => n.id === edge.source)
		const targetNode = flowData.nodes.find(n => n.id === edge.target)
		return sourceNode?.area === filterArea.value || targetNode?.area === filterArea.value
	})
})

const relationshipTypes = computed(() => flowData.relationshipTypes)

// 节点状态配置
const nodeStatusConfig = {
	completed: {
		color: '#f0f9eb',
		borderColor: '#4CAF50',
		textColor: '#388E3C',
		tagType: 'success',
		text: '已完成',
	},
	processing: {
		color: '#fff8e1',
		borderColor: '#FFC107',
		textColor: '#F57C00',
		tagType: 'warning',
		text: '进行中',
	},
	pending: {
		color: '#fff0f0',
		borderColor: '#F44336',
		textColor: '#D32F2F',
		tagType: 'danger',
		text: '待处理',
	},
}

// 辅助函数 - 获取状态标签类型
const getStatusTagType = status => {
	return nodeStatusConfig[status]?.tagType || 'default'
}

// 辅助函数 - 获取状态文本
const getStatusText = status => {
	return nodeStatusConfig[status]?.text || '未知状态'
}

// 初始化图表
const initChart = () => {
	const chartDom = document.getElementById('chart')
	if (!chartDom) return

	// 销毁已有实例
	if (chartInstance.value) {
		chartInstance.value.dispose()
	}

	chartInstance.value = echarts.init(chartDom)

	// 处理节点：改为圆角矩形+显示完整数据
	const nodes = filteredNodes.value.map(node => {
		let newX = node.x + 20
		let newY = node.y + 20
		// 基础状态样式
		const baseStyle = node.isStart
			? { color: '#e6f7ff', borderColor: '#1890ff', textColor: '#096dd9' } // 开始节点（蓝色）
			: node.isEnd
			? { color: '#fff2f0', borderColor: '#ff4d4f', textColor: '#c41d1d' } // 结束节点（红色）
			: nodeStatusConfig[node.status] // 普通节点（按状态）

		return {
			...node,
			x: newX,
			y: newY,
			symbol: 'roundRect', // 节点形状：圆角矩形
			symbolSize: [120, 80, 0], // 矩形尺寸：[宽度, 高度, 圆角半径]
			itemStyle: {
				color: baseStyle.color,
				borderColor: baseStyle.borderColor,
				borderWidth: 2,
				shadowBlur: 4,
				shadowColor: 'rgba(0,0,0,0.1)',
			},
			label: {
				show: true,
				position: 'inside',
				formatter: function (params) {
					return `{name|${params.data.name}}
{goods|货物：${params.data.goods}}
{num|件数：${params.data.quantity} | 吨数：${params.data.weight}}
{status|${getStatusText(params.data.status)}}`
				},
				rich: {
					name: {
						fontSize: 13,
						fontWeight: 'bold',
						color: baseStyle.textColor,
						lineHeight: 20,
						align: 'center',
					},
					type: {
						fontSize: 11,
						color: baseStyle.textColor,
						lineHeight: 18,
						align: 'center',
					},
					goods: {
						fontSize: 10,
						color: '#666',
						lineHeight: 18,
						align: 'center',
					},
					num: {
						fontSize: 10,
						color: '#666',
						lineHeight: 18,
						align: 'center',
					},
					status: {
						fontSize: 11,
						fontWeight: 'bold',
						color: baseStyle.textColor,
						lineHeight: 20,
						align: 'center',
						backgroundColor: baseStyle.color,
						padding: [0, 8],
					},
				},
			},
			emphasis: {
				focus: 'adjacency',
				itemStyle: {
					color: baseStyle.borderColor,
					borderColor: '#2196F3',
					borderWidth: 3,
				},
				label: {
					rich: {
						name: { color: '#fff' },
						type: { color: '#fff' },
						goods: { color: '#fff' },
						num: { color: '#fff' },
						status: {
							color: '#fff',
							backgroundColor: baseStyle.borderColor,
						},
					},
				},
			},
		}
	})

	// 处理边 - 修改连接线样式
	const edges = filteredEdges.value.map(edge => ({
		...edge,
		lineStyle: {
			color: '#409EFF',
			width: 3, // 加粗线条
			curveness: 0.3,
		},
		label: {
			show: showLabels.value,
			formatter: edge.label,
			position: 'middle',
			fontSize: 10,
			backgroundColor: 'rgba(255,255,255,0.8)',
			padding: [4, 16],
			borderRadius: 4,
		},
		edgeSymbol: ['none', 'arrow'], // 添加箭头
		edgeSymbolSize: [0, 25], // 箭头大小
	}))

	// ECharts配置项
	const option = {
		tooltip: {
			trigger: 'item',
			padding: 12,
			backgroundColor: 'rgba(255,255,255,0.95)',
			borderColor: '#e4e7ed',
			borderWidth: 1,
			borderRadius: 8,
			boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
			formatter: function (params) {
				if (params.dataType === 'node') {
					const node = params.data
					return `
            <div style="width: 220px;">
              <div style="font-size:14px;font-weight:bold;color:${
					node.isStart ? '#1890ff' : node.isEnd ? '#ff4d4f' : nodeStatusConfig[node.status]?.textColor
				}">
                ${node.name}
              </div>
              <div style="margin-top:8px;line-height:1.6;font-size:12px;color:#666;">
                <p>类型：${node.type}</p>
                <p>货物：${node.goods}</p>
                <p>件数：${node.quantity} | 吨数：${node.weight}吨</p>
                <p>区域：${node.area}</p>
                <p>状态：<span style="color:${nodeStatusConfig[node.status]?.textColor}">${getStatusText(node.status)}</span></p>
              </div>
            </div>
          `
				}
				return ''
			},
		},
		animation: true,
		animationDuration: 500,
		animationEasingUpdate: 'quinticInOut',
		series: [
			{
				type: 'graph',
				layout: 'none',
				roam: true,
				draggable: true,
				nodes: nodes,
				links: edges,
				emphasis: {
					lineStyle: {
						width: 3, // 加粗线条
						color: '#2196F3',
					},
				},
				itemStyle: {
					cursor: 'pointer',
				},
			},
		],
	}

	// 渲染图表
	chartInstance.value.setOption(option)

	// 节点点击事件
	chartInstance.value.on('click', function (params) {
		if (params.dataType === 'node') {
			currentNode.value = flowData.nodes.find(n => n.id === params.data.id)
			dialogVisible.value = true
		}
	})
}

// 重置视图
const resetView = () => {
	if (chartInstance.value) {
		chartInstance.value.dispatchAction({
			type: 'restore',
		})
		ElMessage.success('视图已重置')
	}
}

// 切换边标签显示
const toggleLabels = () => {
	showLabels.value = !showLabels.value
	initChart()
	ElMessage.success(`${showLabels.value ? '显示' : '隐藏'}边标签`)
}

// 应用区域筛选
const applyFilter = area => {
	filterArea.value = area
	initChart()
	ElMessage.success(`已筛选 ${area || '全部'} 区域节点`)
}

// 监听数据变化
watch(
	[filteredNodes, filteredEdges, showLabels],
	() => {
		initChart()
	},
	{ deep: true }
)

// 组件挂载后初始化图表
onMounted(() => {
	initChart()

	// 窗口 resize 时自适应
	window.addEventListener('resize', () => {
		if (chartInstance.value) {
			chartInstance.value.resize()
		}
	})
})
</script>

<style scoped>
.flow-chart-container {
	width: 100%;
	height: 700px;
	background: #f5f7fa;
	border-radius: 8px;
	padding: 16px;
	position: relative;
	box-sizing: border-box;
}

.chart-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	flex-wrap: wrap;
	gap: 10px;
}

.header-controls {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	align-items: center;
}

/* 图表容器：增加边框和阴影，提升视觉层次 */
.chart-wrapper {
	width: 100%;
	height: 600px;
	background: white;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	padding: 10px;
	box-sizing: border-box;
}

/* 关系统计卡片：优化样式 */
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
	transition: all 0.3s ease;
}

.stat-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

.stat-card h4 {
	margin: 0 0 10px 0;
	color: #409eff;
	font-size: 14px;
}

.stat-card p {
	margin: 0;
	font-size: 20px;
	font-weight: bold;
	color: #606266;
}

/* 弹窗样式优化 */
.el-dialog__body {
	padding: 20px;
}

.el-descriptions-item__content {
	word-break: break-all;
}

/* 响应式适配：小屏幕优化 */
@media (max-width: 768px) {
	.flow-chart-container {
		height: auto;
		min-height: 500px;
	}

	.chart-wrapper {
		height: 400px;
	}

	.relationship-stats {
		flex-direction: column;
	}

	.stat-card {
		min-width: auto;
	}
}
.container {
	max-width: 1200px;
	margin: 0 auto;
	background: white;
	border-radius: 10px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}
.header {
	background: linear-gradient(135deg, #1e3c72, #2a5298);
	color: white;
	padding: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 15px;
}
.header h1 {
	margin: 0;
	font-size: 24px;
}
.controls {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}
.chart-container {
	height: 600px;
	padding: 20px;
	background-color: #f8f9fa;
}
.stats-container {
	display: flex;
	justify-content: space-around;
	padding: 20px;
	background-color: #f0f9ff;
	border-top: 1px solid #e4e7ed;
	flex-wrap: wrap;
	gap: 15px;
}
.stat-card {
	background: white;
	border-radius: 8px;
	padding: 15px;
	text-align: center;
	min-width: 150px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	transition: transform 0.3s ease;
}
.stat-card:hover {
	transform: translateY(-5px);
}
.stat-card h3 {
	margin: 0 0 10px 0;
	color: #409eff;
}
.stat-card p {
	font-size: 24px;
	font-weight: bold;
	margin: 0;
	color: #606266;
}
.dialog-content {
	padding: 20px;
}
.dialog-footer {
	text-align: right;
}
.footer {
	text-align: center;
	padding: 20px;
	color: #909399;
	font-size: 14px;
	border-top: 1px solid #e4e7ed;
}
@media (max-width: 768px) {
	.header {
		flex-direction: column;
		text-align: center;
	}
	.controls {
		width: 100%;
		justify-content: center;
	}
	.stats-container {
		flex-direction: column;
		align-items: center;
	}
	.stat-card {
		width: 100%;
		max-width: 300px;
	}
}
</style>