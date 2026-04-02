<template>
	<div class="cost-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Wallet /></el-icon>
						</div>
						<h3 class="panel-title">成本概览</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="cost-overview">
							<div class="overview-main">
								<div class="overview-label">本月总成本</div>
								<div class="overview-value">
									<span class="currency">¥</span>
									<span class="amount">{{ formatNumber(costOverview.total) }}</span>
								</div>
								<div class="overview-change up">
									<el-icon><CaretTop /></el-icon>
									较上月增长 12.5%
								</div>
							</div>
							<div class="overview-breakdown">
								<div class="breakdown-item" v-for="item in costBreakdown" :key="item.label">
									<div class="breakdown-icon" :style="{ background: item.gradient }">
										<el-icon :size="16"><component :is="item.icon" /></el-icon>
									</div>
									<div class="breakdown-info">
										<div class="breakdown-value">¥{{ formatNumber(item.value) }}</div>
										<div class="breakdown-label">{{ item.label }}</div>
									</div>
									<div class="breakdown-percent">{{ item.percent }}%</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><PieChart /></el-icon>
						</div>
						<h3 class="panel-title">成本结构分析</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div ref="structureChartRef" class="structure-chart"></div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card trend-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><TrendCharts /></el-icon>
						</div>
						<h3 class="panel-title">成本趋势分析</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeRange === 'month' }" @click="timeRange = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeRange === 'quarter' }" @click="timeRange = 'quarter'">季</span>
							<span class="time-tab" :class="{ active: timeRange === 'year' }" @click="timeRange = 'year'">年</span>
						</div>
					</div>
					<div class="panel-body">
						<div ref="trendChartRef" class="trend-chart"></div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><DataAnalysis /></el-icon>
						</div>
						<h3 class="panel-title">站队成本对比</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div ref="teamCompareChartRef" class="team-compare-chart"></div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Odometer /></el-icon>
						</div>
						<h3 class="panel-title">关键指标</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="kpi-grid">
							<div class="kpi-item" v-for="kpi in kpiData" :key="kpi.label">
								<div class="kpi-header">
									<span class="kpi-label">{{ kpi.label }}</span>
									<span class="kpi-change" :class="kpi.change > 0 ? 'up' : 'down'">
										{{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
									</span>
								</div>
								<div class="kpi-value">
									{{ kpi.value }}
									<span class="kpi-unit">{{ kpi.unit }}</span>
								</div>
								<div class="kpi-bar">
									<div class="bar-fill" :style="{ width: kpi.percent + '%', background: kpi.color }"></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Box /></el-icon>
						</div>
						<h3 class="panel-title">物资消耗TOP5</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="material-list">
							<div class="material-item" v-for="(item, index) in materialTop5" :key="item.name">
								<div class="material-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
								<div class="material-info">
									<div class="material-name">{{ item.name }}</div>
									<div class="material-bar">
										<div class="bar-track">
											<div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
										</div>
									</div>
								</div>
								<div class="material-value">
									<div class="value-amount">¥{{ formatNumber(item.value) }}</div>
									<div class="value-unit">{{ item.count }}件</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Document /></el-icon>
						</div>
						<h3 class="panel-title">预算执行情况</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="budget-stats">
							<div class="budget-item">
								<div class="budget-label">年度预算</div>
								<div class="budget-value">¥{{ formatNumber(budgetData.annual) }}</div>
							</div>
							<div class="budget-item">
								<div class="budget-label">已使用</div>
								<div class="budget-value used">¥{{ formatNumber(budgetData.used) }}</div>
							</div>
							<div class="budget-item">
								<div class="budget-label">剩余预算</div>
								<div class="budget-value remaining">¥{{ formatNumber(budgetData.remaining) }}</div>
							</div>
						</div>
						<div class="budget-progress">
							<div class="progress-header">
								<span>执行进度</span>
								<span class="progress-percent">{{ budgetData.percent }}%</span>
							</div>
							<div class="progress-bar">
								<div class="progress-fill" :style="{ width: budgetData.percent + '%' }">
									<div class="progress-glow"></div>
								</div>
							</div>
							<div class="progress-status" :class="budgetData.percent > 80 ? 'warning' : 'normal'">
								{{ budgetData.percent > 80 ? '预算使用率较高，请注意控制' : '预算执行正常' }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
	Wallet,
	PieChart,
	TrendCharts,
	DataAnalysis,
	Odometer,
	Box,
	Document,
	CaretTop,
	CaretBottom,
	Tools,
	Setting,
	ShoppingCart,
	FirstAidKit,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const timeRange = ref('month')
const structureChartRef = ref(null)
const trendChartRef = ref(null)
const teamCompareChartRef = ref(null)
let structureChart = null
let trendChart = null
let teamCompareChart = null

const costOverview = ref({
	total: 2856430,
})

const costBreakdown = ref([
	{ label: '维修成本', value: 1256800, percent: 44, icon: 'Tools', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '采购成本', value: 856290, percent: 30, icon: 'ShoppingCart', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{ label: '人工成本', value: 542840, percent: 19, icon: 'FirstAidKit', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
	{ label: '其他成本', value: 200500, percent: 7, icon: 'Setting', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
])

const kpiData = ref([
	{ label: '单台设备成本', value: '5,712', unit: '元', change: -8.5, percent: 75, color: '#00d4ff' },
	{ label: '维修成本占比', value: '44.0', unit: '%', change: 2.3, percent: 44, color: '#667eea' },
	{ label: '成本节约率', value: '12.5', unit: '%', change: 5.2, percent: 62, color: '#10b981' },
	{ label: '预算执行率', value: '68.5', unit: '%', change: 15.3, percent: 68, color: '#f59e0b' },
])

const materialTop5 = ref([
	{ name: '液压油', value: 256800, count: 1250, percent: 100 },
	{ name: '轴承', value: 189500, count: 680, percent: 74 },
	{ name: '电机配件', value: 156200, count: 320, percent: 61 },
	{ name: '密封件', value: 98500, count: 2100, percent: 38 },
	{ name: '传动带', value: 76800, count: 156, percent: 30 },
])

const budgetData = ref({
	annual: 5000000,
	used: 3425000,
	remaining: 1575000,
	percent: 68.5,
})

const formatNumber = num => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const initStructureChart = () => {
	if (!structureChartRef.value) return
	structureChart = echarts.init(structureChartRef.value)
	const option = {
		tooltip: {
			trigger: 'item',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
			formatter: '{b}: ¥{c} ({d}%)',
		},
		legend: {
			orient: 'vertical',
			right: 10,
			top: 'center',
			textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
		},
		series: [
			{
				type: 'pie',
				radius: ['40%', '65%'],
				center: ['35%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: 1256800, name: '维修成本', itemStyle: { color: '#667eea' } },
					{ value: 856290, name: '采购成本', itemStyle: { color: '#4facfe' } },
					{ value: 542840, name: '人工成本', itemStyle: { color: '#43e97b' } },
					{ value: 200500, name: '其他成本', itemStyle: { color: '#fa709a' } },
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
	structureChart.setOption(option)
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
			formatter: params => {
				let result = params[0].axisValue + '<br/>'
				params.forEach(item => {
					result += `${item.marker} ${item.seriesName}: ¥${formatNumber(item.value)}<br/>`
				})
				return result
			},
		},
		legend: {
			data: ['实际成本', '预算成本', '节约成本'],
			textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '18%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: ['1月', '2月', '3月', '4月', '5月', '6月'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisLabel: {
				color: 'rgba(255, 255, 255, 0.7)',
				fontSize: 10,
				formatter: value => (value / 10000).toFixed(0) + '万',
			},
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				name: '实际成本',
				type: 'line',
				smooth: true,
				data: [420000, 380000, 450000, 520000, 480000, 525000],
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
				name: '预算成本',
				type: 'line',
				smooth: true,
				data: [450000, 450000, 450000, 500000, 500000, 550000],
				lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
				itemStyle: { color: '#f59e0b' },
			},
			{
				name: '节约成本',
				type: 'line',
				smooth: true,
				data: [30000, 70000, 0, -20000, 20000, 25000],
				lineStyle: { color: '#10b981', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
						{ offset: 1, color: 'rgba(16, 185, 129, 0)' },
					]),
				},
				itemStyle: { color: '#10b981' },
			},
		],
	}
	trendChart.setOption(option)
}

const initTeamCompareChart = () => {
	if (!teamCompareChartRef.value) return
	teamCompareChart = echarts.init(teamCompareChartRef.value)
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
			axisPointer: { type: 'shadow' },
			formatter: params => {
				let result = params[0].axisValue + '<br/>'
				params.forEach(item => {
					result += `${item.marker} ${item.seriesName}: ¥${formatNumber(item.value)}<br/>`
				})
				return result
			},
		},
		legend: {
			data: ['维修成本', '采购成本', '人工成本'],
			textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '18%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: ['南区', '东区', '岚南', '西区', '岚中'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisLabel: {
				color: 'rgba(255, 255, 255, 0.7)',
				fontSize: 10,
				formatter: value => (value / 10000).toFixed(0) + '万',
			},
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				name: '维修成本',
				type: 'bar',
				data: [285000, 256000, 245000, 268000, 202800],
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#667eea' },
						{ offset: 1, color: '#764ba2' },
					]),
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '25%',
			},
			{
				name: '采购成本',
				type: 'bar',
				data: [195000, 178000, 165000, 182000, 136290],
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#4facfe' },
						{ offset: 1, color: '#00f2fe' },
					]),
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '25%',
			},
			{
				name: '人工成本',
				type: 'bar',
				data: [125000, 112000, 108000, 118000, 79840],
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#43e97b' },
						{ offset: 1, color: '#38f9d7' },
					]),
					borderRadius: [4, 4, 0, 0],
				},
				barWidth: '25%',
			},
		],
	}
	teamCompareChart.setOption(option)
}

const handleResize = () => {
	structureChart?.resize()
	trendChart?.resize()
	teamCompareChart?.resize()
}

onMounted(() => {
	setTimeout(() => {
		initStructureChart()
		initTrendChart()
		initTeamCompareChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	structureChart?.dispose()
	trendChart?.dispose()
	teamCompareChart?.dispose()
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

.cost-panel {
	width: 100%;
	height: 100%;
}

.screen-body {
	padding: 12px 15px;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1.4fr 1fr;
	gap: 12px;
	box-sizing: border-box;
}

.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 12px;
	min-height: 0;
}

.center-column {
	display: flex;
	flex-direction: column;
	gap: 12px;
	min-height: 0;
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
			width: 24px;
			height: 24px;
			background: linear-gradient(135deg, $primary-color, $primary-dark);
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 12px;
		}

		.panel-title {
			font-size: 13px;
			font-weight: 600;
			color: $text-primary;
			letter-spacing: 1px;
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
	}

	.panel-body {
		flex: 1;
		padding: 10px 12px;
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

.cost-overview {
	.overview-main {
		text-align: center;
		padding: 15px;
		background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 150, 255, 0.05));
		border-radius: 10px;
		margin-bottom: 10px;

		.overview-label {
			font-size: 10px;
			color: $text-secondary;
		}

		.overview-value {
			margin: 6px 0;

			.currency {
				font-size: 16px;
				color: $primary-color;
				font-weight: 600;
			}

			.amount {
				font-size: 28px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}
		}

		.overview-change {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 10px;
			padding: 3px 10px;
			border-radius: 12px;

			&.up {
				background: rgba(239, 68, 68, 0.15);
				color: #ef4444;
			}

			&.down {
				background: rgba(16, 185, 129, 0.15);
				color: #10b981;
			}
		}
	}

	.overview-breakdown {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.breakdown-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 6px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				transform: translateX(3px);
			}

			.breakdown-icon {
				width: 30px;
				height: 30px;
				border-radius: 6px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
			}

			.breakdown-info {
				flex: 1;

				.breakdown-value {
					font-size: 14px;
					font-weight: 700;
					color: $text-primary;
					font-family: 'Orbitron', monospace;
				}

				.breakdown-label {
					font-size: 10px;
					color: $text-muted;
				}
			}

			.breakdown-percent {
				font-size: 12px;
				font-weight: 600;
				color: $primary-color;
			}
		}
	}
}

.structure-chart {
	height: 130px;
}

.trend-card {
	flex: 1.2;
}

.trend-chart {
	width: 100%;
	height: 100%;
	min-height: 120px;
}

.team-compare-chart {
	width: 100%;
	height: 130px;
}

.kpi-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 8px;

	.kpi-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateY(-2px);
		}

		.kpi-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 6px;

			.kpi-label {
				font-size: 10px;
				color: $text-secondary;
			}

			.kpi-change {
				font-size: 9px;
				font-weight: 600;

				&.up {
					color: #ef4444;
				}

				&.down {
					color: #10b981;
				}
			}
		}

		.kpi-value {
			font-size: 16px;
			font-weight: 700;
			color: $text-primary;
			font-family: 'Orbitron', monospace;
			margin-bottom: 6px;

			.kpi-unit {
				font-size: 10px;
				font-weight: normal;
				color: $text-muted;
				margin-left: 4px;
			}
		}

		.kpi-bar {
			height: 3px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 2px;
			overflow: hidden;

			.bar-fill {
				height: 100%;
				border-radius: 2px;
				transition: width 1s ease;
			}
		}
	}
}

.material-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.material-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		.material-rank {
			width: 18px;
			height: 18px;
			border-radius: 5px;
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

		.material-info {
			flex: 1;

			.material-name {
				font-size: 10px;
				color: $text-primary;
				margin-bottom: 4px;
			}

			.material-bar {
				.bar-track {
					height: 3px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 2px;
					overflow: hidden;

					.bar-fill {
						height: 100%;
						background: linear-gradient(90deg, $primary-color, #10b981);
						border-radius: 2px;
						transition: width 1s ease;
					}
				}
			}
		}

		.material-value {
			text-align: right;

			.value-amount {
				font-size: 10px;
				font-weight: 600;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
			}

			.value-unit {
				font-size: 9px;
				color: $text-muted;
			}
		}
	}
}

.budget-stats {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;

	.budget-item {
		text-align: center;

		.budget-label {
			font-size: 9px;
			color: $text-muted;
		}

		.budget-value {
			font-size: 12px;
			font-weight: 700;
			color: $text-primary;
			font-family: 'Orbitron', monospace;
			margin-top: 3px;

			&.used {
				color: #f59e0b;
			}

			&.remaining {
				color: #10b981;
			}
		}
	}
}

.budget-progress {
	.progress-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 6px;

		span {
			font-size: 10px;
			color: $text-secondary;
		}

		.progress-percent {
			font-weight: 600;
			color: $primary-color;
		}
	}

	.progress-bar {
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;

		.progress-fill {
			height: 100%;
			background: linear-gradient(90deg, $primary-color, #10b981);
			border-radius: 3px;
			position: relative;

			.progress-glow {
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 20px;
				background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
				animation: glow 2s infinite;
			}
		}
	}

	.progress-status {
		margin-top: 8px;
		font-size: 9px;
		text-align: center;
		padding: 5px 10px;
		border-radius: 8px;

		&.normal {
			background: rgba(16, 185, 129, 0.15);
			color: #10b981;
		}

		&.warning {
			background: rgba(245, 158, 11, 0.15);
			color: #f59e0b;
		}
	}
}

@keyframes glow {
	0%,
	100% {
		opacity: 0.5;
	}

	50% {
		opacity: 1;
	}
}
</style>
