<template>
	<div class="home-container">
		<div class="top-section">
			<div class="approval-center">
				<div class="section-header">
					<div class="header-title">
						<el-icon class="title-icon"><Document /></el-icon>
						<span>审批中心</span>
					</div>
					<el-badge :value="approvalData.todo" :max="99" class="todo-badge" />
				</div>
				<div class="approval-stats">
					<div class="approval-item highlight">
						<span class="approval-num">{{ approvalData.todo }}</span>
						<span class="approval-label">待办任务</span>
					</div>
					<div class="approval-item">
						<span class="approval-num">{{ approvalData.handled }}</span>
						<span class="approval-label">已完成</span>
					</div>
					<div class="approval-item">
						<span class="approval-num">{{ approvalData.created }}</span>
						<span class="approval-label">我发起</span>
					</div>
				</div>
			</div>
			<div class="message-center">
				<div class="section-header">
					<div class="header-title">
						<el-icon class="title-icon"><Bell /></el-icon>
						<span>信息中心</span>
					</div>
					<el-badge :value="messageTotal" :max="99" class="todo-badge" />
				</div>
				<div class="message-list">
					<div class="message-item" v-for="(item, index) in messageList.slice(0, 3)" :key="index" :class="{ unread: !item.read }">
						<div class="message-dot" :class="item.type"></div>
						<div class="message-text">{{ item.title }}</div>
						<div class="message-time">{{ item.time }}</div>
					</div>
				</div>
			</div>
			<div class="quick-stats">
				<div class="stat-item">
					<div class="stat-icon blue">
						<el-icon><Tickets /></el-icon>
					</div>
					<div class="stat-content">
						<span class="stat-num">{{ totalWorkOrders }}</span>
						<span class="stat-label">工单总数</span>
					</div>
				</div>
				<div class="stat-item">
					<div class="stat-icon green">
						<el-icon><Cpu /></el-icon>
					</div>
					<div class="stat-content">
						<span class="stat-num">{{ equipmentStatus.total }}</span>
						<span class="stat-label">设备总数</span>
					</div>
				</div>
				<div class="stat-item">
					<div class="stat-icon orange">
						<el-icon><Tools /></el-icon>
					</div>
					<div class="stat-content">
						<span class="stat-num">{{ equipmentStatus.inRepair }}</span>
						<span class="stat-label">在修设备</span>
					</div>
				</div>
			</div>
		</div>

		<div class="main-content">
			<div class="left-section">
				<div class="chart-card work-order-chart">
					<div class="card-header">
						<h3>工单趋势分析</h3>
						<el-radio-group v-model="chartPeriod" size="small">
							<el-radio-button label="week">本周</el-radio-button>
							<el-radio-button label="month">本月</el-radio-button>
						</el-radio-group>
					</div>
					<div ref="workOrderChartRef" class="chart-container"></div>
				</div>

				<div class="bottom-row">
					<div class="chart-card distribution-card">
						<div class="card-header">
							<h3>工单分布</h3>
						</div>
						<div class="distribution-content">
							<div ref="distributionChartRef" class="chart-container-pie"></div>
							<div class="distribution-legend">
								<div class="legend-item" v-for="(item, index) in workOrderDistribution" :key="index">
									<div class="legend-dot" :style="{ background: item.color }"></div>
									<span class="legend-name">{{ item.name }}</span>
									<span class="legend-value">{{ item.value }}</span>
								</div>
							</div>
						</div>
					</div>

					<div class="chart-card equipment-card">
						<div class="card-header">
							<h3>设备状态</h3>
						</div>
						<div class="equipment-content">
							<div ref="equipmentChartRef" class="chart-container-pie"></div>
							<div class="equipment-legend">
								<div class="eq-item">
									<span class="eq-dot green"></span>
									<span class="eq-label">在用</span>
									<span class="eq-value">{{ equipmentStatus.inUse }}</span>
								</div>
								<div class="eq-item">
									<span class="eq-dot orange"></span>
									<span class="eq-label">在修</span>
									<span class="eq-value">{{ equipmentStatus.inRepair }}</span>
								</div>
								<div class="eq-item">
									<span class="eq-dot red"></span>
									<span class="eq-label">报废</span>
									<span class="eq-value">{{ equipmentStatus.scrapped }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="right-section">
				<div class="chart-card quick-actions-card">
					<div class="card-header">
						<h3>快捷入口</h3>
						<el-button type="primary" link size="small" @click="handleCustomizeModule">
							<el-icon><Setting /></el-icon>
							自定义
						</el-button>
					</div>
					<div class="actions-grid">
						<div
							class="action-item"
							v-for="(module, index) in customModules.slice(0, 8)"
							:key="index"
							@click="handleModuleClick(module)"
						>
							<div class="action-icon" :class="module.colorType">
								<el-icon><component :is="module.icon" /></el-icon>
							</div>
							<span class="action-name">{{ module.name }}</span>
						</div>
					</div>
				</div>

				<div class="chart-card material-card">
					<div class="card-header">
						<h3>物资使用TOP5</h3>
					</div>
					<div ref="materialChartRef" class="chart-container-bar"></div>
				</div>
			</div>
		</div>

		<el-dialog v-model="customizeDialogVisible" title="自定义功能模块" width="600px">
			<div class="customize-content">
				<div class="module-pool">
					<h4>可选功能模块</h4>
					<div class="module-pool-grid">
						<div
							class="module-pool-item"
							v-for="module in allModules"
							:key="module.id"
							:class="{ selected: isModuleSelected(module.id) }"
							@click="toggleModuleSelection(module)"
						>
							<div class="module-icon" :class="module.colorType">
								<el-icon><component :is="module.icon" /></el-icon>
							</div>
							<span class="module-name">{{ module.name }}</span>
							<el-icon v-if="isModuleSelected(module.id)" class="check-icon"><Check /></el-icon>
						</div>
					</div>
				</div>
			</div>
			<template #footer>
				<el-button @click="customizeDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="saveCustomModules">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="Index">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
	Setting,
	Check,
	Document,
	Bell,
	Tickets,
	Cpu,
	Tools,
	FolderOpened,
	Operation,
	FirstAidKit,
	Search,
	Files,
	Calendar,
	Wallet,
	Setting as SettingIcon,
	TrendCharts,
	DataAnalysis,
	Warning,
	InfoFilled,
	Finished,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

const approvalData = ref({
	todo: 12,
	created: 8,
	handled: 45,
	copied: 6,
})

const equipmentStatus = ref({
	inUse: 486,
	inRepair: 32,
	scrapped: 18,
	total: 536,
})

const materialTop5 = ref([
	{ name: '润滑油', usage: 2580 },
	{ name: '螺栓', usage: 890 },
	{ name: '电缆', usage: 450 },
	{ name: '密封圈', usage: 320 },
	{ name: '轴承', usage: 156 },
])

const messageList = ref([
	{ title: '设备维修工单已审批通过', time: '10分钟前', type: 'success', read: false },
	{ title: '您有新的待办任务需要处理', time: '30分钟前', type: 'warning', read: false },
	{ title: '系统将于今晚进行维护升级', time: '2小时前', type: 'info', read: true },
	{ title: '月度设备巡检报告已生成', time: '1天前', type: 'success', read: true },
])

const workOrderDistribution = ref([
	{ name: '定额工单', value: 128, color: '#3b82f6' },
	{ name: '非定额工单', value: 85, color: '#10b981' },
	{ name: '大包工单', value: 56, color: '#f59e0b' },
	{ name: '内修工单', value: 92, color: '#8b5cf6' },
])

const chartPeriod = ref('week')

const totalWorkOrders = computed(() => {
	return workOrderDistribution.value.reduce((sum, item) => sum + item.value, 0)
})

const messageTotal = computed(() => {
	return messageList.value.filter(item => !item.read).length
})

const customizeDialogVisible = ref(false)

const allModules = ref([
	{ id: 1, name: '设备台账', icon: 'FolderOpened', colorType: 'blue', route: '/equipment/equipmentInfo' },
	{ id: 2, name: '维修委托', icon: 'Operation', colorType: 'orange', route: '/equipment/maintInfo' },
	{ id: 3, name: '维保委托', icon: 'FirstAidKit', colorType: 'green', route: '/equipment/maintainTask' },
	{ id: 4, name: '点巡检记录', icon: 'Search', colorType: 'blue', route: '/equipment/inspectionTask' },
	{ id: 5, name: '委外维修项目申请', icon: 'Files', colorType: 'purple', route: '/equipment/maintenanceProjectApply' },
	{ id: 6, name: '年度维保计划', icon: 'Calendar', colorType: 'blue', route: '/equipment/maintainPlan' },
	{ id: 7, name: '预算指标', icon: 'Wallet', colorType: 'green', route: '/equipment/budget' },
	{ id: 8, name: '设备模型', icon: 'SettingIcon', colorType: 'blue', route: '/equipment/equipmentModel' },
	{ id: 9, name: '三率填报管理', icon: 'TrendCharts', colorType: 'orange', route: '/equipment/threeRate' },
	{ id: 10, name: '设备三率分析', icon: 'DataAnalysis', colorType: 'blue', route: '/equipment/threeRateAnalysis' },
])

const customModules = ref([])
const selectedModuleIds = ref([])

const workOrderChartRef = ref(null)
const distributionChartRef = ref(null)
const equipmentChartRef = ref(null)
const materialChartRef = ref(null)

let workOrderChart = null
let distributionChart = null
let equipmentChart = null
let materialChart = null

const initWorkOrderChart = () => {
	if (!workOrderChartRef.value) return
	workOrderChart = echarts.init(workOrderChartRef.value)
	const option = {
		grid: {
			top: 30,
			right: 20,
			bottom: 30,
			left: 50,
		},
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e5e7eb',
			borderWidth: 1,
			textStyle: { color: '#374151' },
		},
		legend: {
			data: ['新增工单', '完成工单'],
			right: 20,
			top: 0,
			textStyle: { color: '#6b7280', fontSize: 12 },
		},
		xAxis: {
			type: 'category',
			data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			axisLine: { lineStyle: { color: '#e5e7eb' } },
			axisLabel: { color: '#6b7280' },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: '#6b7280' },
			splitLine: { lineStyle: { color: '#f3f4f6' } },
		},
		series: [
			{
				name: '新增工单',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				data: [23, 18, 32, 28, 35, 15, 22],
				lineStyle: { width: 2, color: '#3b82f6' },
				itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(59, 130, 246, 0.15)' },
						{ offset: 1, color: 'rgba(59, 130, 246, 0)' },
					]),
				},
			},
			{
				name: '完成工单',
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				data: [20, 15, 28, 30, 32, 18, 25],
				lineStyle: { width: 2, color: '#10b981' },
				itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(16, 185, 129, 0.15)' },
						{ offset: 1, color: 'rgba(16, 185, 129, 0)' },
					]),
				},
			},
		],
	}
	workOrderChart.setOption(option)
}

const initDistributionChart = () => {
	if (!distributionChartRef.value) return
	distributionChart = echarts.init(distributionChartRef.value)
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['50%', '75%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: workOrderDistribution.value.map(item => ({
					value: item.value,
					name: item.name,
					itemStyle: { color: item.color },
				})),
			},
		],
	}
	distributionChart.setOption(option)
}

const initEquipmentChart = () => {
	if (!equipmentChartRef.value) return
	equipmentChart = echarts.init(equipmentChartRef.value)
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['50%', '75%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: equipmentStatus.value.inUse, name: '在用', itemStyle: { color: '#10b981' } },
					{ value: equipmentStatus.value.inRepair, name: '在修', itemStyle: { color: '#f59e0b' } },
					{ value: equipmentStatus.value.scrapped, name: '报废', itemStyle: { color: '#ef4444' } },
				],
			},
		],
	}
	equipmentChart.setOption(option)
}

const initMaterialChart = () => {
	if (!materialChartRef.value) return
	materialChart = echarts.init(materialChartRef.value)
	const option = {
		grid: {
			top: 10,
			right: 50,
			bottom: 20,
			left: 70,
		},
		xAxis: {
			type: 'value',
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { show: false },
			splitLine: { show: false },
		},
		yAxis: {
			type: 'category',
			data: materialTop5.value.map(item => item.name).reverse(),
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: '#374151', fontSize: 12 },
		},
		series: [
			{
				type: 'bar',
				data: materialTop5.value.map(item => item.usage).reverse(),
				barWidth: 10,
				itemStyle: {
					borderRadius: [0, 5, 5, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
						{ offset: 0, color: '#3b82f6' },
						{ offset: 1, color: '#60a5fa' },
					]),
				},
				label: {
					show: true,
					position: 'right',
					color: '#6b7280',
					fontSize: 11,
					formatter: '{c}',
				},
			},
		],
	}
	materialChart.setOption(option)
}

const handleResize = () => {
	workOrderChart?.resize()
	distributionChart?.resize()
	equipmentChart?.resize()
	materialChart?.resize()
}

const handleCustomizeModule = () => {
	customizeDialogVisible.value = true
}

const isModuleSelected = id => {
	return selectedModuleIds.value.includes(id)
}

const toggleModuleSelection = module => {
	const index = selectedModuleIds.value.indexOf(module.id)
	if (index > -1) {
		selectedModuleIds.value.splice(index, 1)
	} else {
		selectedModuleIds.value.push(module.id)
	}
}

const saveCustomModules = () => {
	if (selectedModuleIds.value.length === 0) {
		ElMessage.warning('请至少选择一个功能模块')
		return
	}
	customModules.value = allModules.value.filter(m => selectedModuleIds.value.includes(m.id))
	localStorage.setItem('customModules', JSON.stringify(customModules.value))
	customizeDialogVisible.value = false
	ElMessage.success('保存成功')
}

const handleModuleClick = module => {
	if (module.route) {
		router.push(module.route)
	}
}

const loadCustomModules = () => {
	const savedModules = localStorage.getItem('customModules')
	if (savedModules) {
		customModules.value = JSON.parse(savedModules)
		selectedModuleIds.value = customModules.value.map(m => m.id)
	} else {
		customModules.value = [...allModules.value]
		selectedModuleIds.value = allModules.value.map(m => m.id)
	}
}

onMounted(() => {
	loadCustomModules()
	setTimeout(() => {
		initWorkOrderChart()
		initDistributionChart()
		initEquipmentChart()
		initMaterialChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
	window.removeEventListener('resize', handleResize)
	workOrderChart?.dispose()
	distributionChart?.dispose()
	equipmentChart?.dispose()
	materialChart?.dispose()
})
</script>

<style scoped lang="scss">
.home-container {
	padding: 20px;
	background: #f5f7fa;
	min-height: calc(100vh - 40px);
}

.top-section {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 16px;
	margin-bottom: 16px;
}

.approval-center,
.message-center {
	background: white;
	border-radius: 12px;
	padding: 16px 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
	padding-bottom: 12px;
	border-bottom: 1px solid #f0f0f0;
}

.header-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 600;
	color: #1f2937;

	.title-icon {
		font-size: 18px;
		color: #3b82f6;
	}
}

.approval-stats {
	display: flex;
	justify-content: space-around;
}

.approval-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 12px 20px;
	border-radius: 8px;
	transition: all 0.2s;

	&:hover {
		background: #f9fafb;
	}

	&.highlight {
		background: linear-gradient(135deg, #eff6ff, #dbeafe);

		.approval-num {
			color: #3b82f6;
		}
	}

	.approval-num {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		line-height: 1;
	}

	.approval-label {
		font-size: 12px;
		color: #6b7280;
	}
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.message-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: 6px;
	transition: all 0.2s;
	cursor: pointer;

	&:hover {
		background: #f9fafb;
	}

	&.unread {
		.message-text {
			font-weight: 500;
			color: #1f2937;
		}
	}

	.message-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;

		&.success {
			background: #10b981;
		}
		&.warning {
			background: #f59e0b;
		}
		&.info {
			background: #3b82f6;
		}
	}

	.message-text {
		flex: 1;
		font-size: 13px;
		color: #6b7280;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.message-time {
		font-size: 11px;
		color: #9ca3af;
		white-space: nowrap;
	}
}

.quick-stats {
	background: white;
	border-radius: 12px;
	padding: 16px 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 0;
}

.stat-icon {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;

	&.blue {
		background: linear-gradient(135deg, #eff6ff, #dbeafe);
		color: #3b82f6;
	}

	&.green {
		background: linear-gradient(135deg, #ecfdf5, #d1fae5);
		color: #10b981;
	}

	&.orange {
		background: linear-gradient(135deg, #fff7ed, #ffedd5);
		color: #f59e0b;
	}
}

.stat-content {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.stat-num {
	font-size: 22px;
	font-weight: 700;
	color: #1f2937;
	line-height: 1;
}

.stat-label {
	font-size: 12px;
	color: #6b7280;
}

.main-content {
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 16px;
}

.left-section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.right-section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.chart-card {
	background: white;
	border-radius: 12px;
	padding: 16px 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;

	h3 {
		font-size: 14px;
		font-weight: 600;
		color: #1f2937;
		position: relative;
		padding-left: 10px;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 3px;
			height: 14px;
			background: #3b82f6;
			border-radius: 2px;
		}
	}
}

.work-order-chart {
	flex: 1;
	min-height: 260px;

	.chart-container {
		height: 220px;
	}
}

.bottom-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
}

.distribution-card,
.equipment-card {
	.distribution-content,
	.equipment-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.chart-container-pie {
		width: 120px;
		height: 120px;
		flex-shrink: 0;
	}
}

.distribution-legend {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	background: #f9fafb;
	border-radius: 6px;

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.legend-name {
		flex: 1;
		font-size: 12px;
		color: #6b7280;
	}

	.legend-value {
		font-size: 14px;
		font-weight: 600;
		color: #1f2937;
	}
}

.equipment-legend {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.eq-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	background: #f9fafb;
	border-radius: 6px;

	.eq-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;

		&.green {
			background: #10b981;
		}
		&.orange {
			background: #f59e0b;
		}
		&.red {
			background: #ef4444;
		}
	}

	.eq-label {
		flex: 1;
		font-size: 12px;
		color: #6b7280;
	}

	.eq-value {
		font-size: 14px;
		font-weight: 600;
		color: #1f2937;
	}
}

.quick-actions-card {
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 12px 8px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #f9fafb;
			transform: translateY(-2px);
		}
	}

	.action-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;

		&.blue {
			background: linear-gradient(135deg, #eff6ff, #dbeafe);
			color: #3b82f6;
		}

		&.orange {
			background: linear-gradient(135deg, #fff7ed, #ffedd5);
			color: #f59e0b;
		}

		&.green {
			background: linear-gradient(135deg, #ecfdf5, #d1fae5);
			color: #10b981;
		}

		&.purple {
			background: linear-gradient(135deg, #f5f3ff, #ede9fe);
			color: #8b5cf6;
		}
	}

	.action-name {
		font-size: 11px;
		color: #6b7280;
		text-align: center;
		line-height: 1.3;
	}
}

.material-card {
	flex: 1;

	.chart-container-bar {
		height: 180px;
	}
}

.customize-content {
	.module-pool {
		h4 {
			font-size: 14px;
			color: #374151;
			margin-bottom: 12px;
		}

		.module-pool-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}

		.module-pool-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;
			padding: 16px 12px;
			border: 2px solid #e5e7eb;
			border-radius: 10px;
			cursor: pointer;
			transition: all 0.2s;
			position: relative;

			&:hover {
				border-color: #93c5fd;
				background: #f0f7ff;
			}

			&.selected {
				border-color: #3b82f6;
				background: #eff6ff;
			}

			.module-icon {
				width: 36px;
				height: 36px;
				border-radius: 8px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;

				&.blue {
					background: linear-gradient(135deg, #eff6ff, #dbeafe);
					color: #3b82f6;
				}

				&.orange {
					background: linear-gradient(135deg, #fff7ed, #ffedd5);
					color: #f59e0b;
				}

				&.green {
					background: linear-gradient(135deg, #ecfdf5, #d1fae5);
					color: #10b981;
				}

				&.purple {
					background: linear-gradient(135deg, #f5f3ff, #ede9fe);
					color: #8b5cf6;
				}
			}

			.module-name {
				font-size: 12px;
				color: #374151;
				text-align: center;
			}

			.check-icon {
				position: absolute;
				top: 6px;
				right: 6px;
				color: #3b82f6;
				font-size: 16px;
			}
		}
	}
}
</style>
