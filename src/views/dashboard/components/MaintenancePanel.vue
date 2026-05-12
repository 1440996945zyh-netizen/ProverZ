<template>
	<div class="maintenance-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card summary-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Tickets /></el-icon>
						</div>
						<h3 class="panel-title">工单统计概览</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="order-summary">
							<div class="summary-item" v-for="item in orderSummary" :key="item.label">
								<div class="summary-icon" :style="{ background: item.gradient }">
									<el-icon :size="20"><component :is="item.icon" /></el-icon>
								</div>
								<div class="summary-info">
									<div class="summary-value">{{ item.value }}</div>
									<div class="summary-label">{{ item.label }}</div>
								</div>
							</div>
						</div>
						<div ref="orderPieChartRef" class="order-pie-chart"></div>
					</div>
				</div>

				<div class="panel-card pending-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Clock /></el-icon>
						</div>
						<h3 class="panel-title">待处理工单</h3>
						<div class="header-line"></div>
						<div class="header-badge warning">
							<span class="badge-num">{{ pendingOrders.length }}</span>
							<span class="badge-label">条</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="pending-list">
							<div class="pending-item" v-for="order in pendingOrders" :key="order.id" :class="order.priority">
								<div class="order-header">
									<span class="order-id">{{ order.id }}</span>
									<span class="order-priority" :class="order.priority">{{ order.priorityText }}</span>
								</div>
								<div class="order-title">{{ order.title }}</div>
								<div class="order-meta">
									<span class="order-team">{{ order.team }}</span>
									<span class="order-time">{{ order.time }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card trend-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><TrendCharts /></el-icon>
						</div>
						<h3 class="panel-title">工单趋势分析</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeRange === 'week' }" @click="timeRange = 'week'">周</span>
							<span class="time-tab" :class="{ active: timeRange === 'month' }" @click="timeRange = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeRange === 'year' }" @click="timeRange = 'year'">年</span>
						</div>
					</div>
					<div class="panel-body">
						<div ref="trendChartRef" class="trend-chart"></div>
					</div>
				</div>

				<div class="panel-card team-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><DataAnalysis /></el-icon>
						</div>
						<h3 class="panel-title">站队工单完成情况</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div ref="teamBarChartRef" class="team-bar-chart"></div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card response-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Timer /></el-icon>
						</div>
						<h3 class="panel-title">响应时效统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="response-metrics">
							<div class="response-item" v-for="item in [activeResponseMetric]" :key="item.label">
								<div class="response-gauge">
									<div
										ref="gaugeChartRefs"
										class="gauge-chart"
										v-for="(_, index) in 4"
										:key="index"
										v-show="gaugeIndex === index"
									></div>
								</div>
								<div class="response-info">
									<div class="response-value">
										{{ activeResponseMetric.value }}
										<span class="unit">{{ activeResponseMetric.unit }}</span>
									</div>
									<div class="response-label">{{ activeResponseMetric.label }}</div>
									<div class="response-change" :class="activeResponseMetric.change > 0 ? 'up' : 'down'">
										<el-icon><component :is="activeResponseMetric.change > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
										{{ Math.abs(item.change) }}% 同比
									</div>
								</div>
							</div>
						</div>
						<div class="response-nav">
							<span
								class="nav-dot"
								v-for="(_, index) in 4"
								:key="index"
								:class="{ active: gaugeIndex === index }"
								@click="gaugeIndex = index"
							></span>
						</div>
					</div>
				</div>

				<div class="panel-card type-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Tools /></el-icon>
						</div>
						<h3 class="panel-title">维修类型分布</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div ref="typeChartRef" class="type-chart"></div>
					</div>
				</div>

				<div class="panel-card rank-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Rank /></el-icon>
						</div>
						<h3 class="panel-title">维修人员排行榜</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="rank-list">
							<div class="rank-item" v-for="(person, index) in rankList" :key="person.name">
								<div class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
								<div class="rank-avatar">{{ person.name.charAt(0) }}</div>
								<div class="rank-info">
									<div class="rank-name">{{ person.name }}</div>
									<div class="rank-team">{{ person.team }}</div>
								</div>
								<div class="rank-score">
									<span class="score-value">{{ person.score }}</span>
									<span class="score-label">工单</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
	Tickets,
	Clock,
	TrendCharts,
	DataAnalysis,
	Timer,
	Tools,
	Rank,
	CaretTop,
	CaretBottom,
	DocumentChecked,
	CircleCheck,
	Loading,
	Warning,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const timeRange = ref('month')
const gaugeIndex = ref(0)
const orderPieChartRef = ref(null)
const trendChartRef = ref(null)
const teamBarChartRef = ref(null)
const typeChartRef = ref(null)
const gaugeChartRefs = ref([])
let orderPieChart = null
let trendChart = null
let teamBarChart = null
let typeChart = null
let gaugeCharts = []

const orderSummary = ref([
	{ label: '本月工单', value: '1,256', icon: 'Tickets', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '已完成', value: '1,089', icon: 'CircleCheck', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
	{ label: '处理中', value: '128', icon: 'Loading', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{ label: '待处理', value: '39', icon: 'Warning', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
])

const pendingOrders = ref([
	{
		id: 'WO-2024-1256',
		title: '门机液压系统故障维修',
		team: 'xx 公司',
		time: '2 小时前',
		priority: 'critical',
		priorityText: '紧急',
	},
	{ id: 'WO-2024-1255', title: '铲车发动机定期保养', team: 'xx 公司', time: '3 小时前', priority: 'high', priorityText: '高优' },
	{ id: 'WO-2024-1254', title: '传送带轴承更换', team: 'xx 公司', time: '5 小时前', priority: 'normal', priorityText: '普通' },
	{ id: 'WO-2024-1253', title: '电机控制系统检修', team: 'xx 公司', time: '昨天', priority: 'normal', priorityText: '普通' },
])

const responseMetrics = ref([
	{ label: '平均响应时间', value: '2.5', unit: 'h', change: -15.3 },
	{ label: '平均完成时间', value: '8.2', unit: 'h', change: -8.5 },
	{ label: '准时完成率', value: '94.5', unit: '%', change: 5.2 },
	{ label: '客户满意度', value: '4.8', unit: '分', change: 3.1 },
])

const activeResponseMetric = computed(() => responseMetrics.value[gaugeIndex.value] || responseMetrics.value[0])

const rankList = ref([
	{ name: '张伟', team: 'xx 公司', score: 156 },
	{ name: '李强', team: 'xx 公司', score: 142 },
	{ name: '王磊', team: 'xx 公司', score: 138 },
	{ name: '刘洋', team: 'xx 公司', score: 125 },
	{ name: '陈明', team: 'xx 公司', score: 118 },
])

const initOrderPieChart = () => {
	if (!orderPieChartRef.value) return
	orderPieChart = echarts.init(orderPieChartRef.value)
	const option = {
		tooltip: {
			trigger: 'item',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
		},
		legend: {
			bottom: 0,
			left: 'center',
			itemWidth: 10,
			itemHeight: 10,
			textStyle: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 12 },
		},
		series: [
			{
				type: 'pie',
				radius: ['34%', '58%'],
				center: ['50%', '38%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: 1089, name: '已完成', itemStyle: { color: '#10b981' } },
					{ value: 128, name: '处理中', itemStyle: { color: '#3b82f6' } },
					{ value: 39, name: '待处理', itemStyle: { color: '#f59e0b' } },
				],
				emphasis: {
					itemStyle: {
						shadowBlur: 20,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
			},
		],
	}
	orderPieChart.setOption(option)
}

const initTrendChart = () => {
	if (!trendChartRef.value) return
	trendChart = echarts.init(trendChartRef.value)
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
		},
		legend: {
			data: ['新增工单', '完成工单', '累计工单'],
			textStyle: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 12 },
			top: 0,
		},
		grid: {
			left: '2%',
			right: '3%',
			bottom: '8%',
			top: '18%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: ['1月', '2月', '3月', '4月', '5月', '6月'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 11 },
		},
		yAxis: [
			{
				type: 'value',
				name: '数量',
				axisLine: { show: false },
				axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 11 },
				splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
			},
			{
				type: 'value',
				name: '累计',
				axisLine: { show: false },
				axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 11 },
				splitLine: { show: false },
			},
		],
		series: [
			{
				name: '新增工单',
				type: 'line',
				smooth: true,
				data: [180, 195, 210, 225, 240, 256],
				lineStyle: { color: '#00d4ff', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
						{ offset: 1, color: 'rgba(0, 212, 255, 0)' },
					]),
				},
				itemStyle: { color: '#00d4ff' },
			},
			{
				name: '完成工单',
				type: 'line',
				smooth: true,
				data: [165, 180, 195, 210, 225, 238],
				lineStyle: { color: '#10b981', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
						{ offset: 1, color: 'rgba(16, 185, 129, 0)' },
					]),
				},
				itemStyle: { color: '#10b981' },
			},
			{
				name: '累计工单',
				type: 'line',
				smooth: true,
				yAxisIndex: 1,
				data: [1200, 1395, 1605, 1830, 2070, 2326],
				lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
				itemStyle: { color: '#f59e0b' },
			},
		],
	}
	trendChart.setOption(option)
}

const initTeamBarChart = () => {
	if (!teamBarChartRef.value) return
	teamBarChart = echarts.init(teamBarChartRef.value)
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
			axisPointer: { type: 'shadow' },
		},
		legend: {
			data: ['已完成', '处理中', '待处理'],
			textStyle: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 12 },
			top: 0,
		},
		grid: {
			left: '2%',
			right: '3%',
			bottom: '12%',
			top: '18%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: ['南区', '东区', '岚南', '西区', '岚中'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 11 },
		},
		yAxis: {
			type: 'value',
			min: 0,
			axisLine: { show: false },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 11 },
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				name: '已完成',
				type: 'bar',
				stack: 'total',
				data: [245, 228, 212, 198, 186],
				itemStyle: { color: '#10b981', borderRadius: [0, 0, 0, 0] },
			},
			{
				name: '处理中',
				type: 'bar',
				stack: 'total',
				data: [28, 32, 25, 22, 21],
				itemStyle: { color: '#3b82f6', borderRadius: [0, 0, 0, 0] },
			},
			{
				name: '待处理',
				type: 'bar',
				stack: 'total',
				data: [8, 10, 6, 9, 6],
				itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] },
			},
		],
	}
	teamBarChart.setOption(option)
}

const initTypeChart = () => {
	if (!typeChartRef.value) return
	typeChart = echarts.init(typeChartRef.value)
	const option = {
		tooltip: {
			trigger: 'item',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
		},
		series: [
			{
				type: 'pie',
				radius: ['32%', '52%'],
				center: ['50%', '50%'],
				roseType: 'radius',
				itemStyle: {
					borderRadius: 5,
					borderColor: 'rgba(0, 20, 40, 0.8)',
					borderWidth: 2,
				},
				label: {
					show: true,
					color: 'rgba(255, 255, 255, 0.78)',
					fontSize: 11,
				},
				labelLine: {
					lineStyle: { color: 'rgba(255, 255, 255, 0.3)' },
				},
				data: [
					{ value: 420, name: '机械维修', itemStyle: { color: '#667eea' } },
					{ value: 310, name: '电气维修', itemStyle: { color: '#4facfe' } },
					{ value: 250, name: '液压维修', itemStyle: { color: '#43e97b' } },
					{ value: 180, name: '定期保养', itemStyle: { color: '#fa709a' } },
					{ value: 96, name: '其他', itemStyle: { color: '#f59e0b' } },
				],
			},
		],
	}
	typeChart.setOption(option)
}

const initGaugeCharts = () => {
	gaugeCharts = gaugeChartRefs.value.map((el, index) => {
		if (!el) return null
		const chart = echarts.init(el)
		const metric = responseMetrics.value[index]
		const colors = ['#00d4ff', '#10b981', '#f59e0b', '#667eea']
		const maxValues = [10, 24, 100, 5]
		const option = {
			series: [
				{
					type: 'gauge',
					startAngle: 200,
					endAngle: -20,
					min: 0,
					max: maxValues[index],
					splitNumber: 5,
					itemStyle: {
						color: colors[index],
					},
					progress: {
						show: true,
						width: 12,
					},
					pointer: {
						show: false,
					},
					axisLine: {
						lineStyle: {
							width: 12,
							color: [[1, 'rgba(255, 255, 255, 0.1)']],
						},
					},
					axisTick: {
						show: false,
					},
					splitLine: {
						show: false,
					},
					axisLabel: {
						show: false,
					},
					anchor: {
						show: false,
					},
					title: {
						show: false,
					},
					detail: {
						show: false,
					},
					data: [
						{
							value: metric.value,
						},
					],
				},
			],
		}
		chart.setOption(option)
		return chart
	})
}

const handleResize = () => {
	orderPieChart?.resize()
	trendChart?.resize()
	teamBarChart?.resize()
	typeChart?.resize()
	gaugeCharts.forEach(chart => chart?.resize())
}

onMounted(() => {
	setTimeout(() => {
		initOrderPieChart()
		initTrendChart()
		initTeamBarChart()
		initTypeChart()
		initGaugeCharts()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	orderPieChart?.dispose()
	trendChart?.dispose()
	teamBarChart?.dispose()
	typeChart?.dispose()
	gaugeCharts.forEach(chart => chart?.dispose())
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');

$primary-color: #00d4ff;
$primary-dark: #0096ff;
$bg-card: rgba(0, 20, 40, 0.6);
$border-color: rgba(0, 212, 255, 0.2);
$text-primary: #ffffff;
$text-secondary: rgba(255, 255, 255, 0.7);
$text-muted: rgba(255, 255, 255, 0.5);

.maintenance-panel {
	width: 100%;
	min-height: 100%;
	height: auto;
}

.screen-body {
	padding: 10px 14px;
	min-height: 100%;
	height: auto;
	display: grid;
	grid-template-columns: 0.98fr 1.2fr 0.94fr;
	gap: 10px;
	align-items: stretch;
	box-sizing: border-box;
}

.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 10px;
	min-height: 0;
}

.center-column {
	display: flex;
	flex-direction: column;
	gap: 10px;
	min-height: 0;
	justify-content: center;
}

.panel-card {
	background: $bg-card;
	border: 1px solid $border-color;
	border-radius: 10px;
	overflow: hidden;
	backdrop-filter: blur(10px);
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, $primary-color, $primary-dark, transparent);
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: linear-gradient(90deg, rgba(0, 212, 255, 0.08), transparent);
		border-bottom: 1px solid $border-color;
		flex-shrink: 0;

		.header-icon-box {
			width: 26px;
			height: 26px;
			background: linear-gradient(135deg, $primary-color, $primary-dark);
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 12px;
		}

		.panel-title {
			font-size: 17px;
			font-weight: 700;
			color: $text-primary;
			letter-spacing: 1.5px;
		}

		.header-line {
			flex: 1;
			height: 1px;
			background: linear-gradient(90deg, $border-color, transparent);
		}

		.time-tabs {
			display: flex;
			gap: 4px;

			.time-tab {
				padding: 3px 10px;
				font-size: 10px;
				color: $text-muted;
				cursor: pointer;
				border-radius: 8px;
				transition: all 0.3s ease;

				&:hover {
					color: $primary-color;
				}

				&.active {
					background: rgba(0, 212, 255, 0.2);
					color: $primary-color;
				}
			}
		}

		.header-badge {
			display: flex;
			align-items: baseline;
			gap: 4px;
			padding: 4px 10px;
			border-radius: 12px;
			background: rgba(0, 212, 255, 0.15);

			&.warning {
				background: rgba(245, 158, 11, 0.2);
			}

			.badge-num {
				font-size: 16px;
				font-weight: 700;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
			}

			&.warning .badge-num {
				color: #f59e0b;
			}

			.badge-label {
				font-size: 10px;
				color: $text-muted;
			}
		}
	}

	.panel-body {
		flex: 1;
		padding: 8px 10px;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0;

		&::-webkit-scrollbar {
			width: 4px;
		}

		&::-webkit-scrollbar-track {
			background: rgba(0, 212, 255, 0.05);
			border-radius: 2px;
		}

		&::-webkit-scrollbar-thumb {
			background: rgba(0, 212, 255, 0.3);
			border-radius: 2px;

			&:hover {
				background: rgba(0, 212, 255, 0.5);
			}
		}
	}
}

.summary-card {
	flex: 0.78;
}

.pending-card {
	flex: 1.22;
}

.team-card {
	flex: 1.08;

	.panel-body {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 14px;
		padding-bottom: 14px;
	}
}

.response-card {
	flex: 1.02;

	.panel-body {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 14px;
		padding-top: 14px;
		padding-bottom: 14px;
	}
}

.type-card {
	flex: 0.8;
}

.rank-card {
	flex: 0.98;
}

.order-summary {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 4px;
	margin-bottom: 2px;

	.summary-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		min-height: 0;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateY(-2px);
		}

		.summary-icon {
			width: 24px;
			height: 24px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
		}

		.summary-info {
			.summary-value {
				font-size: 12px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.summary-label {
				font-size: 8px;
				color: $text-muted;
				line-height: 1.2;
			}
		}
	}
}

.order-pie-chart {
	height: 148px;
	max-width: 270px;
	margin: 0 auto;
}

.pending-list {
	display: flex;
	flex-direction: column;
	gap: 5px;
	max-height: 100%;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
		border-radius: 2px;
	}

	.pending-item {
		padding: 7px 8px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;
		border-left: 3px solid transparent;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		&.critical {
			border-left-color: #ef4444;
		}

		&.high {
			border-left-color: #f59e0b;
		}

		&.normal {
			border-left-color: #3b82f6;
		}

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;

			.order-id {
				font-size: 10px;
				color: $text-muted;
				font-family: 'Orbitron', monospace;
			}

			.order-priority {
				font-size: 9px;
				padding: 2px 7px;
				border-radius: 10px;

				&.critical {
					background: rgba(239, 68, 68, 0.2);
					color: #ef4444;
				}

				&.high {
					background: rgba(245, 158, 11, 0.2);
					color: #f59e0b;
				}

				&.normal {
					background: rgba(59, 130, 246, 0.2);
					color: #3b82f6;
				}
			}
		}

		.order-title {
			font-size: 11px;
			color: $text-primary;
			margin-bottom: 4px;
		}

		.order-meta {
			display: flex;
			justify-content: space-between;

			.order-team,
			.order-time {
				font-size: 9px;
				color: $text-muted;
			}
		}
	}
}

.trend-card {
	flex: 0.84;
}

.trend-chart {
	width: 100%;
	height: 100%;
	min-height: 150px;
}

.team-bar-chart {
	width: 100%;
	height: 100%;
	min-height: 245px;
}

.response-metrics {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	max-width: 320px;
	min-height: 0;
	flex: 1;

	.response-item {
		display: flex;
		align-items: center;
		gap: 18px;
		width: 100%;
		padding: 18px 18px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;

			.response-gauge {
				width: 110px;
				height: 110px;

			.gauge-chart {
				width: 100%;
				height: 100%;
			}
		}

			.response-info {
				flex: 1;

				.response-value {
					font-size: 30px;
					font-weight: 700;
					color: $text-primary;
					font-family: 'Orbitron', monospace;

					.unit {
						font-size: 14px;
						font-weight: normal;
						color: $text-muted;
						margin-left: 4px;
					}
				}

				.response-label {
					font-size: 13px;
					color: $text-secondary;
					margin-top: 4px;
				}

				.response-change {
					display: flex;
					align-items: center;
					gap: 4px;
					font-size: 12px;
					margin-top: 8px;

				&.up {
					color: #10b981;
				}

				&.down {
					color: #10b981;
				}
			}
		}
	}
}

.response-nav {
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-top: 10px;

	.nav-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.5);
		}

		&.active {
			background: $primary-color;
			box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
		}
	}
}

.type-chart {
	height: 165px;
	max-width: 250px;
	margin: 0 auto;
}

.rank-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.rank-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		.rank-num {
			width: 20px;
			height: 20px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 10px;
			font-weight: 700;
			background: rgba(255, 255, 255, 0.1);
			color: $text-secondary;

			&.rank-1 {
				background: linear-gradient(135deg, #ffd700, #ffb800);
				color: #000;
			}

			&.rank-2 {
				background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
				color: #000;
			}

			&.rank-3 {
				background: linear-gradient(135deg, #cd7f32, #b87333);
				color: #fff;
			}
		}

		.rank-avatar {
			width: 28px;
			height: 28px;
			border-radius: 50%;
			background: linear-gradient(135deg, $primary-color, $primary-dark);
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 12px;
			font-weight: 600;
		}

		.rank-info {
			flex: 1;

			.rank-name {
				font-size: 11px;
				color: $text-primary;
				font-weight: 500;
			}

			.rank-team {
				font-size: 9px;
				color: $text-muted;
			}
		}

		.rank-score {
			text-align: right;

			.score-value {
				font-size: 16px;
				font-weight: 700;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
			}

			.score-label {
				display: block;
				font-size: 9px;
				color: $text-muted;
			}
		}
	}
}
</style>
