<template>
	<div class="equipment-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Monitor /></el-icon>
						</div>
						<h3 class="panel-title">站队设备统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="team-tabs">
							<span
								class="team-tab"
								v-for="team in teams"
								:key="team"
								:class="{ active: activeTeam === team }"
								@click="activeTeam = team"
							>
								{{ team }}
							</span>
						</div>
						<div class="equipment-type-stats">
							<div class="type-item" v-for="item in equipmentTypes" :key="item.name">
								<div class="type-icon" :style="{ background: item.gradient }">
									<el-icon :size="24"><component :is="item.icon" /></el-icon>
								</div>
								<div class="type-info">
									<div class="type-value">{{ item.value }}</div>
									<div class="type-label">{{ item.name }}</div>
								</div>
								<div class="type-trend" :class="item.trend > 0 ? 'up' : 'down'">
									<el-icon><component :is="item.trend > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
									{{ Math.abs(item.trend) }}%
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
						<h3 class="panel-title">设备档案统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="archive-stats">
							<div class="archive-item" v-for="item in archiveStats" :key="item.label">
								<div class="archive-icon" :style="{ background: item.gradient }">
									<el-icon :size="20"><component :is="item.icon" /></el-icon>
								</div>
								<div class="archive-info">
									<div class="archive-value">{{ formatNumber(item.value) }}</div>
									<div class="archive-label">{{ item.label }}</div>
								</div>
							</div>
						</div>
						<div class="archive-chart-wrapper">
							<div ref="archiveChartRef" class="archive-chart"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card center-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><DataAnalysis /></el-icon>
						</div>
						<h3 class="panel-title">核心KPI指标</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="kpi-container">
							<div class="kpi-item" v-for="(kpi, index) in kpiStats" :key="kpi.label">
								<div class="kpi-header">
									<span class="kpi-label">{{ kpi.label }}</span>
									<span class="kpi-change" :class="kpi.change > 0 ? 'up' : 'down'">
										{{ kpi.change > 0 ? '+' : '' }}{{ kpi.change }}%
										<span class="change-label">同比</span>
									</span>
								</div>
								<div class="kpi-chart-wrapper">
									<div :ref="el => (kpiChartRefs[index] = el)" class="kpi-chart"></div>
								</div>
								<div class="kpi-value">{{ kpi.value }}%</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><TrendCharts /></el-icon>
						</div>
						<h3 class="panel-title">设备状态趋势</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeType === 'week' }" @click="timeType = 'week'">周</span>
							<span class="time-tab" :class="{ active: timeType === 'month' }" @click="timeType = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeType === 'year' }" @click="timeType = 'year'">年</span>
						</div>
					</div>
					<div class="panel-body">
						<div ref="trendChartRef" class="trend-chart"></div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Collection /></el-icon>
						</div>
						<h3 class="panel-title">知识库统计</h3>
						<div class="header-line"></div>
						<div class="header-badge">
							<span class="badge-num">541</span>
							<span class="badge-label">篇</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="knowledge-stats">
							<div class="knowledge-item">
								<div class="knowledge-icon">
									<el-icon :size="28"><Document /></el-icon>
								</div>
								<div class="knowledge-info">
									<div class="knowledge-value">541</div>
									<div class="knowledge-label">知识库总数</div>
								</div>
							</div>
							<div class="knowledge-item warning">
								<div class="knowledge-icon">
									<el-icon :size="28"><Clock /></el-icon>
								</div>
								<div class="knowledge-info">
									<div class="knowledge-value">3</div>
									<div class="knowledge-label">待审核</div>
								</div>
							</div>
						</div>
						<div class="knowledge-list">
							<div class="knowledge-list-item" v-for="(item, index) in knowledgeList" :key="item.name">
								<div class="knowledge-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
								<div class="knowledge-name">{{ item.name }}</div>
								<div class="knowledge-count">{{ item.count }}篇</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Histogram /></el-icon>
						</div>
						<h3 class="panel-title">站队故障率与完好率</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="rate-list">
							<div class="rate-item" v-for="item in rateList" :key="item.name">
								<div class="rate-name">{{ item.name }}</div>
								<div class="rate-bars">
									<div class="rate-bar-item">
										<span class="bar-label">故障率</span>
										<div class="bar-track">
											<div class="bar-fill danger" :style="{ width: item.faultRate + '%' }"></div>
										</div>
										<span class="bar-value">{{ item.faultRate }}%</span>
									</div>
									<div class="rate-bar-item">
										<span class="bar-label">完好率</span>
										<div class="bar-track">
											<div class="bar-fill success" :style="{ width: item.availRate + '%' }"></div>
										</div>
										<span class="bar-value">{{ item.availRate }}%</span>
									</div>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
	Document,
	Warning,
	Monitor,
	Tools,
	DataAnalysis,
	TrendCharts,
	Collection,
	Clock,
	CaretTop,
	CaretBottom,
	Histogram,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const activeTeam = ref('  港务公司')
const timeType = ref('month')
const kpiChartRefs = ref([])
const archiveChartRef = ref(null)
const trendChartRef = ref(null)
let kpiCharts = []
let archiveChart = null
let trendChart = null

const teams = ref(['  港务公司', '煤炭港区公司', '矿石港区公司', '集装箱港区公司', '综合保税区公司'])

const equipmentTypes = ref([
	{ name: '门机', value: 13, icon: 'Monitor', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', trend: 5.2 },
	{ name: '铲车', value: 7, icon: 'Tools', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', trend: 12.8 },
	{ name: '其他', value: 267, icon: 'Document', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', trend: -3.5 },
])

const archiveStats = ref([
	{ label: '维修记录', value: 153537, icon: 'Document', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '点检记录', value: 169423, icon: 'Warning', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
	{ label: '润滑保养', value: 169423, icon: 'Tools', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
])

const kpiStats = ref([
	{ label: '故障率', value: 0.5, change: -34.0, color: '#ef4444' },
	{ label: '完好率', value: 97.17, change: 0.67, color: '#10b981' },
	{ label: '利用率', value: 26.33, change: 10.67, color: '#3b82f6' },
])

const knowledgeList = ref([
	{ name: '港务公司', count: 189 },
	{ name: '煤炭港区公司', count: 166 },
	{ name: '矿石港区公司', count: 131 },
	{ name: '集装箱港区公司', count: 105 },
	{ name: '综合保税区公司', count: 69 },
])

const rateList = ref([
	{ name: '港务公司', faultRate: 0.0, availRate: 99.34 },
	{ name: '煤炭港区公司', faultRate: 0.0, availRate: 99.04 },
	{ name: '矿石港区公司', faultRate: 0.0, availRate: 99.79 },
	{ name: '集装箱港区公司', faultRate: 0.0, availRate: 99.51 },
	{ name: '综合保税区公司', faultRate: 0.0, availRate: 53.13 },
])

const formatNumber = num => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const initKpiCharts = () => {
	kpiCharts = kpiChartRefs.value.map((el, index) => {
		if (!el) return null
		const chart = echarts.init(el)
		const kpi = kpiStats.value[index]
		const option = {
			series: [
				{
					type: 'pie',
					radius: ['60%', '80%'],
					center: ['50%', '50%'],
					startAngle: 90,
					clockwise: false,
					silent: true,
					label: { show: false },
					labelLine: { show: false },
					data: [
						{
							value: kpi.value,
							name: kpi.label,
							itemStyle: {
								color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
									{ offset: 0, color: kpi.color },
									{ offset: 1, color: kpi.color + '99' },
								]),
								shadowColor: kpi.color,
								shadowBlur: 10,
							},
						},
						{
							value: 100 - kpi.value,
							name: '剩余',
							itemStyle: {
								color: 'rgba(255, 255, 255, 0.08)',
							},
						},
					],
				},
				{
					type: 'pie',
					radius: ['50%', '52%'],
					center: ['50%', '50%'],
					silent: true,
					label: { show: false },
					labelLine: { show: false },
					data: [
						{
							value: 1,
							itemStyle: {
								color: 'rgba(255, 255, 255, 0.1)',
							},
						},
					],
				},
			],
		}
		chart.setOption(option)
		return chart
	})
}

const initArchiveChart = () => {
	if (!archiveChartRef.value) return
	archiveChart = echarts.init(archiveChartRef.value)
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
				radius: ['45%', '75%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: archiveStats.value.map((item, index) => ({
					value: item.value,
					name: item.label,
					itemStyle: {
						color: ['#667eea', '#f5576c', '#4facfe'][index],
					},
				})),
				emphasis: {
					itemStyle: {
						shadowBlur: 20,
						shadowColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
			},
		],
	}
	archiveChart.setOption(option)
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
			data: ['在用设备', '在修设备', '停用设备'],
			textStyle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '15%',
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
			axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 },
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				name: '在用设备',
				type: 'line',
				smooth: true,
				data: [4200, 4350, 4480, 4521, 4460, 4521],
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
				name: '在修设备',
				type: 'line',
				smooth: true,
				data: [280, 310, 295, 328, 340, 328],
				lineStyle: { color: '#f59e0b', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
						{ offset: 1, color: 'rgba(245, 158, 11, 0)' },
					]),
				},
				itemStyle: { color: '#f59e0b' },
			},
			{
				name: '停用设备',
				type: 'line',
				smooth: true,
				data: [1500, 1480, 1520, 1562, 1580, 1562],
				lineStyle: { color: '#6b7280', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(107, 114, 128, 0.3)' },
						{ offset: 1, color: 'rgba(107, 114, 128, 0)' },
					]),
				},
				itemStyle: { color: '#6b7280' },
			},
		],
	}
	trendChart.setOption(option)
}

const handleResize = () => {
	kpiCharts.forEach(chart => chart?.resize())
	archiveChart?.resize()
	trendChart?.resize()
}

onMounted(() => {
	setTimeout(() => {
		initKpiCharts()
		initArchiveChart()
		initTrendChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	kpiCharts.forEach(chart => chart?.dispose())
	archiveChart?.dispose()
	trendChart?.dispose()
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

.equipment-panel {
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

		.header-badge {
			display: flex;
			align-items: baseline;
			gap: 3px;

			.badge-num {
				font-size: 16px;
				font-weight: 700;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
			}

			.badge-label {
				font-size: 10px;
				color: $text-muted;
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

.team-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 10px;

	.team-tab {
		padding: 4px 10px;
		font-size: 10px;
		color: $text-secondary;
		cursor: pointer;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(0, 212, 255, 0.2);
		transition: all 0.3s ease;

		&:hover {
			color: $primary-color;
			border-color: rgba(0, 212, 255, 0.4);
		}

		&.active {
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			color: $primary-color;
			border-color: rgba(0, 212, 255, 0.6);
			font-weight: 600;
		}
	}
}

.equipment-type-stats {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.type-item {
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

		.type-icon {
			width: 40px;
			height: 40px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.type-info {
			flex: 1;

			.type-value {
				font-size: 20px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.type-label {
				font-size: 11px;
				color: $text-muted;
			}
		}

		.type-trend {
			display: flex;
			align-items: center;
			gap: 3px;
			font-size: 10px;
			font-weight: 600;
			padding: 3px 6px;
			border-radius: 8px;

			&.up {
				color: #10b981;
				background: rgba(16, 185, 129, 0.15);
			}

			&.down {
				color: #ef4444;
				background: rgba(239, 68, 68, 0.15);
			}
		}
	}
}

.archive-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8px;
	margin-bottom: 10px;

	.archive-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px 6px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateY(-2px);
		}

		.archive-icon {
			width: 32px;
			height: 32px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
		}

		.archive-info {
			text-align: center;

			.archive-value {
				font-size: 12px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.archive-label {
				font-size: 9px;
				color: $text-muted;
				margin-top: 1px;
			}
		}
	}
}

.archive-chart-wrapper {
	height: 140px;

	.archive-chart {
		width: 100%;
		height: 100%;
	}
}

.center-card {
	flex: 1.2;
}

.kpi-container {
	display: flex;
	justify-content: space-around;
	gap: 20px;
	height: 100%;
	align-items: center;

	.kpi-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;

		.kpi-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			margin-bottom: 6px;

			.kpi-label {
				font-size: 12px;
				font-weight: 600;
				color: $text-primary;
			}

			.kpi-change {
				font-size: 10px;
				font-weight: 600;
				padding: 2px 6px;
				border-radius: 8px;
				display: flex;
				align-items: center;
				gap: 2px;

				.change-label {
					font-weight: normal;
					opacity: 0.8;
				}

				&.up {
					color: #10b981;
					background: rgba(16, 185, 129, 0.15);
				}

				&.down {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.15);
				}
			}
		}

		.kpi-chart-wrapper {
			width: 100%;
			height: 70px;
		}

		.kpi-chart {
			width: 100%;
			height: 100%;
		}

		.kpi-value {
			font-size: 18px;
			font-weight: 700;
			color: $text-primary;
			font-family: 'Orbitron', monospace;
			margin-top: 6px;
		}
	}
}

.trend-chart {
	width: 100%;
	height: 120px;
}

.knowledge-stats {
	display: flex;
	gap: 10px;
	margin-bottom: 10px;

	.knowledge-item {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;

		.knowledge-icon {
			width: 40px;
			height: 40px;
			border-radius: 10px;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			display: flex;
			align-items: center;
			justify-content: center;
			color: $primary-color;
		}

		&.warning .knowledge-icon {
			background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3));
			color: #f59e0b;
		}

		.knowledge-info {
			.knowledge-value {
				font-size: 20px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.knowledge-label {
				font-size: 10px;
				color: $text-muted;
			}
		}
	}
}

.knowledge-list {
	display: flex;
	flex-direction: column;
	gap: 6px;

	.knowledge-list-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 5px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		.knowledge-rank {
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

		.knowledge-name {
			flex: 1;
			color: $text-primary;
			font-size: 11px;
		}

		.knowledge-count {
			color: $primary-color;
			font-size: 11px;
			font-weight: 600;
		}
	}
}

.rate-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.rate-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		.rate-name {
			color: $text-primary;
			font-size: 11px;
			font-weight: 500;
			margin-bottom: 8px;
		}

		.rate-bars {
			display: flex;
			flex-direction: column;
			gap: 6px;

			.rate-bar-item {
				display: flex;
				align-items: center;
				gap: 6px;

				.bar-label {
					font-size: 9px;
					color: $text-muted;
					min-width: 35px;
				}

				.bar-track {
					flex: 1;
					height: 5px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 3px;
					overflow: hidden;

					.bar-fill {
						height: 100%;
						border-radius: 3px;
						transition: width 1s ease;

						&.danger {
							background: linear-gradient(90deg, #ef4444, #f97316);
						}

						&.success {
							background: linear-gradient(90deg, #10b981, #34d399);
						}
					}
				}

				.bar-value {
					font-size: 10px;
					color: $primary-color;
					min-width: 40px;
					text-align: right;
					font-family: 'Orbitron', monospace;
				}
			}
		}
	}
}
</style>
