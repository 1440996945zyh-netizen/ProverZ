<template>
	<div class="monitor-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Warning /></el-icon>
						</div>
						<h3 class="panel-title">告警统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="alert-summary">
							<div class="alert-total">
								<div class="total-value">{{ alertStats.total }}</div>
								<div class="total-label">今日告警总数</div>
							</div>
							<div class="alert-breakdown">
								<div class="breakdown-item critical">
									<div class="breakdown-dot"></div>
									<span class="breakdown-label">紧急</span>
									<span class="breakdown-value">{{ alertStats.critical }}</span>
								</div>
								<div class="breakdown-item major">
									<div class="breakdown-dot"></div>
									<span class="breakdown-label">重要</span>
									<span class="breakdown-value">{{ alertStats.major }}</span>
								</div>
								<div class="breakdown-item minor">
									<div class="breakdown-dot"></div>
									<span class="breakdown-label">次要</span>
									<span class="breakdown-value">{{ alertStats.minor }}</span>
								</div>
								<div class="breakdown-item warning">
									<div class="breakdown-dot"></div>
									<span class="breakdown-label">警告</span>
									<span class="breakdown-value">{{ alertStats.warning }}</span>
								</div>
							</div>
						</div>
						<div ref="alertChartRef" class="alert-chart"></div>
					</div>
				</div>

				<div class="panel-card response-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Bell /></el-icon>
						</div>
						<h3 class="panel-title">实时告警列表</h3>
						<div class="header-line"></div>
						<div class="header-badge danger">
							<span class="badge-num">{{ realtimeAlerts.length }}</span>
							<span class="badge-label">条</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="alert-list">
							<div class="alert-item" v-for="(alert, index) in realtimeAlerts" :key="index" :class="alert.level">
								<div class="alert-level-icon">
									<el-icon><component :is="getAlertIcon(alert.level)" /></el-icon>
								</div>
								<div class="alert-content">
									<div class="alert-title">{{ alert.title }}</div>
									<div class="alert-meta">
										<span class="alert-source">{{ alert.source }}</span>
										<span class="alert-time">{{ alert.time }}</span>
									</div>
								</div>
								<div class="alert-status" :class="{ resolved: alert.resolved }">
									{{ alert.resolved ? '已处理' : '待处理' }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card map-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Location /></el-icon>
						</div>
						<h3 class="panel-title">设备监控地图</h3>
						<div class="header-line"></div>
						<div class="map-legend">
							<div class="legend-item">
								<span class="legend-dot online"></span>
								<span>在线</span>
							</div>
							<div class="legend-item">
								<span class="legend-dot offline"></span>
								<span>离线</span>
							</div>
							<div class="legend-item">
								<span class="legend-dot alert"></span>
								<span>告警</span>
							</div>
						</div>
					</div>
					<div class="panel-body">
						<div class="map-container">
							<div ref="mapChartRef" class="map-chart"></div>
						</div>
						<div class="map-stats">
							<div class="map-stat-item">
								<div class="stat-icon online">
									<el-icon><CircleCheck /></el-icon>
								</div>
								<div class="stat-info">
									<div class="stat-value">{{ deviceStats.online }}</div>
									<div class="stat-label">在线设备</div>
								</div>
							</div>
							<div class="map-stat-item">
								<div class="stat-icon offline">
									<el-icon><CircleClose /></el-icon>
								</div>
								<div class="stat-info">
									<div class="stat-value">{{ deviceStats.offline }}</div>
									<div class="stat-label">离线设备</div>
								</div>
							</div>
							<div class="map-stat-item">
								<div class="stat-icon alert">
									<el-icon><Warning /></el-icon>
								</div>
								<div class="stat-info">
									<div class="stat-value">{{ deviceStats.alert }}</div>
									<div class="stat-label">告警设备</div>
								</div>
							</div>
							<div class="map-stat-item">
								<div class="stat-icon total">
									<el-icon><Monitor /></el-icon>
								</div>
								<div class="stat-info">
									<div class="stat-value">{{ deviceStats.total }}</div>
									<div class="stat-label">设备总数</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><TrendCharts /></el-icon>
						</div>
						<h3 class="panel-title">监测趋势分析</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeRange === 'day' }" @click="timeRange = 'day'">日</span>
							<span class="time-tab" :class="{ active: timeRange === 'week' }" @click="timeRange = 'week'">周</span>
							<span class="time-tab" :class="{ active: timeRange === 'month' }" @click="timeRange = 'month'">月</span>
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
							<el-icon><DataAnalysis /></el-icon>
						</div>
						<h3 class="panel-title">监测指标概览</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="metrics-grid">
							<div class="metric-item" v-for="metric in metrics" :key="metric.label">
								<div class="metric-icon" :style="{ background: metric.gradient }">
									<el-icon :size="20"><component :is="metric.icon" /></el-icon>
								</div>
								<div class="metric-info">
									<div class="metric-value">
										{{ metric.value }}
										<span class="metric-unit">{{ metric.unit }}</span>
									</div>
									<div class="metric-label">{{ metric.label }}</div>
								</div>
								<div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
									<el-icon><component :is="metric.trend > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
									{{ Math.abs(metric.trend) }}%
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Histogram /></el-icon>
						</div>
						<h3 class="panel-title">站队监测状态</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="team-monitor-list">
							<div class="team-monitor-item" v-for="team in teamMonitorData" :key="team.name">
								<div class="team-header">
									<span class="team-name">{{ team.name }}</span>
									<span class="team-status" :class="team.status">{{ team.statusText }}</span>
								</div>
								<div class="team-metrics">
									<div class="team-metric">
										<span class="metric-label">在线率</span>
										<div class="metric-bar">
											<div class="bar-fill" :style="{ width: team.onlineRate + '%' }"></div>
										</div>
										<span class="metric-value">{{ team.onlineRate }}%</span>
									</div>
									<div class="team-metric">
										<span class="metric-label">告警数</span>
										<span class="metric-num" :class="{ danger: team.alertCount > 0 }">{{ team.alertCount }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Timer /></el-icon>
						</div>
						<h3 class="panel-title">响应时间统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div ref="responseChartRef" class="response-chart"></div>
						<div class="response-stats">
							<div class="response-stat">
								<div class="stat-label">平均响应</div>
								<div class="stat-value">
									2.3
									<span class="unit">s</span>
								</div>
							</div>
							<div class="response-stat">
								<div class="stat-label">最快响应</div>
								<div class="stat-value">
									0.5
									<span class="unit">s</span>
								</div>
							</div>
							<div class="response-stat">
								<div class="stat-label">最慢响应</div>
								<div class="stat-value">
									8.7
									<span class="unit">s</span>
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
	Warning,
	Bell,
	Location,
	TrendCharts,
	DataAnalysis,
	Histogram,
	Timer,
	Monitor,
	CircleCheck,
	CircleClose,
	CaretTop,
	CaretBottom,
	SuccessFilled,
	WarningFilled,
	InfoFilled,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const timeRange = ref('week')
const alertChartRef = ref(null)
const mapChartRef = ref(null)
const trendChartRef = ref(null)
const responseChartRef = ref(null)
let alertChart = null
let mapChart = null
let trendChart = null
let responseChart = null

const alertStats = ref({
	total: 156,
	critical: 12,
	major: 35,
	minor: 68,
	warning: 41,
})

const deviceStats = ref({
	online: 4521,
	offline: 328,
	alert: 156,
	total: 5005,
})

const realtimeAlerts = ref([
	{ title: '门机设备温度异常', source: 'xx 公司', time: '10:23:45', level: 'critical', resolved: false },
	{ title: '铲车液压系统压力过低', source: 'xx 公司', time: '10:18:32', level: 'major', resolved: false },
	{ title: '传送带运行速度波动', source: 'xx 公司', time: '10:15:21', level: 'minor', resolved: true },
	{ title: '电机振动数据异常', source: 'xx 公司', time: '10:12:08', level: 'warning', resolved: false },
	{ title: '润滑系统油位偏低', source: 'xx 公司', time: '10:08:55', level: 'warning', resolved: true },
])

const metrics = ref([
	{
		label: '监测点位',
		value: '12,458',
		unit: '个',
		icon: 'Location',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		trend: 5.2,
	},
	{
		label: '数据采集量',
		value: '1.2M',
		unit: '条/h',
		icon: 'DataAnalysis',
		gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		trend: 12.8,
	},
	{
		label: '实时在线率',
		value: '93.4',
		unit: '%',
		icon: 'CircleCheck',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		trend: 2.1,
	},
	{
		label: '告警处理率',
		value: '87.6',
		unit: '%',
		icon: 'Warning',
		gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
		trend: -3.5,
	},
])

const teamMonitorData = ref([
	{ name: 'xx 公司', onlineRate: 98.5, alertCount: 3, status: 'normal', statusText: '正常' },
	{ name: 'xx 公司', onlineRate: 95.2, alertCount: 5, status: 'warning', statusText: '告警' },
	{ name: 'xx 公司', onlineRate: 99.1, alertCount: 0, status: 'normal', statusText: '正常' },
	{ name: 'xx 公司', onlineRate: 92.8, alertCount: 8, status: 'danger', statusText: '异常' },
	{ name: 'xx 公司', onlineRate: 88.5, alertCount: 12, status: 'danger', statusText: '异常' },
])

const responseTimeData = ref([
	{ label: '鍗楀尯', value: 1.8, percent: 44, color: 'linear-gradient(180deg, #22d3ee 0%, #0ea5e9 100%)' },
	{ label: '涓滃尯', value: 2.5, percent: 58, color: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)' },
	{ label: '宀氬崡', value: 1.5, percent: 36, color: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)' },
	{ label: '瑗垮尯', value: 3.2, percent: 74, color: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)' },
	{ label: '宀氫腑', value: 4.1, percent: 96, color: 'linear-gradient(180deg, #fb7185 0%, #ef4444 100%)' },
])

const getAlertIcon = level => {
	const icons = {
		critical: 'SuccessFilled',
		major: 'WarningFilled',
		minor: 'InfoFilled',
		warning: 'WarningFilled',
	}
	return icons[level] || 'InfoFilled'
}

const initAlertChart = () => {
	if (!alertChartRef.value) return
	alertChart = echarts.init(alertChartRef.value)
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
				radius: ['42%', '74%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: alertStats.value.critical, name: '紧急', itemStyle: { color: '#ef4444' } },
					{ value: alertStats.value.major, name: '重要', itemStyle: { color: '#f97316' } },
					{ value: alertStats.value.minor, name: '次要', itemStyle: { color: '#eab308' } },
					{ value: alertStats.value.warning, name: '警告', itemStyle: { color: '#3b82f6' } },
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
	alertChart.setOption(option)
}

const initMapChart = () => {
	if (!mapChartRef.value) return
	mapChart = echarts.init(mapChartRef.value)
	const option = {
		geo: {
			map: 'china',
			roam: false,
			zoom: 1.2,
			center: [118.5, 35.2],
			label: { show: false },
			itemStyle: {
				areaColor: 'rgba(0, 40, 80, 0.3)',
				borderColor: 'rgba(0, 212, 255, 0.3)',
			},
			emphasis: {
				itemStyle: {
					areaColor: 'rgba(0, 212, 255, 0.2)',
				},
			},
		},
		series: [
			{
				type: 'scatter',
				coordinateSystem: 'geo',
				data: [
					{ name: 'xx 公司', value: [119.2, 35.1], symbolSize: 20, itemStyle: { color: '#10b981' } },
					{ name: 'xx 公司', value: [119.8, 35.5], symbolSize: 18, itemStyle: { color: '#f59e0b' } },
					{ name: 'xx 公司', value: [119.0, 34.8], symbolSize: 15, itemStyle: { color: '#10b981' } },
					{ name: 'xx 公司', value: [118.5, 35.3], symbolSize: 22, itemStyle: { color: '#ef4444' } },
					{ name: 'xx 公司', value: [118.8, 35.6], symbolSize: 16, itemStyle: { color: '#ef4444' } },
				],
				symbol: 'circle',
				symbolSize: 15,
				label: {
					show: true,
					formatter: '{b}',
					position: 'right',
					color: 'rgba(255, 255, 255, 0.8)',
					fontSize: 13,
				},
			},
			{
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: [
					{ name: '告警点', value: [118.5, 35.3], symbolSize: 12, itemStyle: { color: '#ef4444' } },
					{ name: '告警点', value: [118.8, 35.6], symbolSize: 10, itemStyle: { color: '#f59e0b' } },
				],
				rippleEffect: {
					brushType: 'stroke',
					scale: 4,
				},
			},
		],
	}
	mapChart.setOption(option)
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
			data: ['告警数量', '处理数量', '响应时间'],
			textStyle: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
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
			data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
		},
		yAxis: [
			{
				type: 'value',
				name: '数量',
				axisLine: { show: false },
				axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
				splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
			},
			{
				type: 'value',
				name: '时间(s)',
				axisLine: { show: false },
				axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
				splitLine: { show: false },
			},
		],
		series: [
			{
				name: '告警数量',
				type: 'line',
				smooth: true,
				data: [12, 8, 25, 35, 28, 18, 15],
				lineStyle: { color: '#ef4444', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
						{ offset: 1, color: 'rgba(239, 68, 68, 0)' },
					]),
				},
				itemStyle: { color: '#ef4444' },
			},
			{
				name: '处理数量',
				type: 'line',
				smooth: true,
				data: [10, 7, 22, 32, 26, 16, 14],
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
				name: '响应时间',
				type: 'line',
				smooth: true,
				yAxisIndex: 1,
				data: [2.1, 1.8, 3.2, 2.8, 2.5, 2.0, 1.9],
				lineStyle: { color: '#3b82f6', width: 2, type: 'dashed' },
				itemStyle: { color: '#3b82f6' },
			},
		],
	}
	trendChart.setOption(option)
}

const initResponseChart = () => {
	if (!responseChartRef.value) return
	responseChart = echarts.init(responseChartRef.value)
	const option = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: '#00d4ff',
			textStyle: { color: '#fff' },
		},
		grid: {
			left: '6%',
			right: '6%',
			bottom: '8%',
			top: '14%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: ['南区', '东区', '岚南', '西区', '岚中'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
		},
		yAxis: {
			type: 'value',
			min: 0,
			max: 5,
			axisLine: { show: false },
			axisLabel: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 13 },
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				type: 'bar',
				data: [
					{
						value: 1.8,
						itemStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: '#00d4ff' },
								{ offset: 1, color: '#0096ff' },
							]),
						},
					},
					{
						value: 2.5,
						itemStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: '#00d4ff' },
								{ offset: 1, color: '#0096ff' },
							]),
						},
					},
					{
						value: 1.5,
						itemStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: '#00d4ff' },
								{ offset: 1, color: '#0096ff' },
							]),
						},
					},
					{
						value: 3.2,
						itemStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: '#f59e0b' },
								{ offset: 1, color: '#d97706' },
							]),
						},
					},
					{
						value: 4.1,
						itemStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: '#ef4444' },
								{ offset: 1, color: '#dc2626' },
							]),
						},
					},
				],
				barWidth: '42%',
				label: {
					show: true,
					position: 'top',
					color: 'rgba(255, 255, 255, 0.82)',
					fontSize: 12,
				},
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
				},
			},
		],
	}
	responseChart.setOption(option)
}

const handleResize = () => {
	alertChart?.resize()
	mapChart?.resize()
	trendChart?.resize()
	responseChart?.resize()
}

onMounted(() => {
	nextTick(() => {
		requestAnimationFrame(() => {
			setTimeout(() => {
				initAlertChart()
				initMapChart()
				initTrendChart()
				initResponseChart()
				handleResize()
			}, 120)
		})
	})
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	alertChart?.dispose()
	mapChart?.dispose()
	trendChart?.dispose()
	responseChart?.dispose()
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

.monitor-panel {
	width: 100%;
	min-height: 100%;
	height: auto;
}

.screen-body {
	padding: 12px 15px;
	min-height: 100%;
	height: auto;
	display: grid;
	grid-template-columns: 1fr 1.62fr 1fr;
	gap: 12px;
	align-items: stretch;
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
	justify-content: stretch;
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

			&.danger {
				background: rgba(239, 68, 68, 0.2);
			}

			.badge-num {
				font-size: 16px;
				font-weight: 700;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
			}

			&.danger .badge-num {
				color: #ef4444;
			}

			.badge-label {
				font-size: 10px;
				color: $text-muted;
			}
		}

		.map-legend {
			display: flex;
			gap: 12px;

			.legend-item {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 10px;
				color: $text-secondary;

				.legend-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;

					&.online {
						background: #10b981;
					}

					&.offline {
						background: #6b7280;
					}

					&.alert {
						background: #ef4444;
						animation: pulse 2s infinite;
					}
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

.response-card {
	.panel-body {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 16px;
		padding-bottom: 16px;
	}
}

.alert-summary {
	display: flex;
	gap: 12px;
	margin-bottom: 12px;

	.alert-total {
		flex: 0 0 100px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 10px;
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
		border-radius: 10px;
		border: 1px solid rgba(239, 68, 68, 0.3);

		.total-value {
			font-size: 32px;
			font-weight: 700;
			color: #ef4444;
			font-family: 'Orbitron', monospace;
			text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
		}

		.total-label {
			font-size: 10px;
			color: $text-muted;
			margin-top: 4px;
		}
	}

	.alert-breakdown {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;

		.breakdown-item {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 12px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 8px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				transform: translateX(3px);
			}

			.breakdown-dot {
				width: 12px;
				height: 12px;
				border-radius: 50%;
			}

			&.critical .breakdown-dot {
				background: #ef4444;
				box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
			}

			&.major .breakdown-dot {
				background: #f97316;
				box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
			}

			&.minor .breakdown-dot {
				background: #eab308;
				box-shadow: 0 0 8px rgba(234, 179, 8, 0.6);
			}

			&.warning .breakdown-dot {
				background: #3b82f6;
				box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
			}

			.breakdown-label {
				font-size: 11px;
				color: $text-secondary;
			}

			.breakdown-value {
				margin-left: auto;
				font-size: 16px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}
		}
	}
}

.alert-chart {
	height: 190px;
	margin: 6px auto 0;
}

.alert-list {
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

	.alert-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 5px;
		transition: all 0.3s ease;
		border-left: 3px solid transparent;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateX(3px);
		}

		&.critical {
			border-left-color: #ef4444;

			.alert-level-icon {
				color: #ef4444;
			}
		}

		&.major {
			border-left-color: #f97316;

			.alert-level-icon {
				color: #f97316;
			}
		}

		&.minor {
			border-left-color: #eab308;

			.alert-level-icon {
				color: #eab308;
			}
		}

		&.warning {
			border-left-color: #3b82f6;

			.alert-level-icon {
				color: #3b82f6;
			}
		}

		.alert-level-icon {
			font-size: 12px;
		}

		.alert-content {
			flex: 1;
			min-width: 0;

			.alert-title {
				font-size: 10px;
				color: $text-primary;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.alert-meta {
				display: flex;
				gap: 6px;
				margin-top: 1px;

				.alert-source,
				.alert-time {
					font-size: 8px;
					color: $text-muted;
				}
			}
		}

		.alert-status {
			font-size: 8px;
			padding: 2px 5px;
			border-radius: 6px;
			background: rgba(239, 68, 68, 0.2);
			color: #ef4444;

			&.resolved {
				background: rgba(16, 185, 129, 0.2);
				color: #10b981;
			}
		}
	}
}

.map-card {
	flex: 1.42;
}

.map-container {
	flex: 1;
	min-height: 0;
	display: flex;
	align-items: center;
	justify-content: center;

	.map-chart {
		width: 100%;
		height: 100%;
		min-height: 360px;
	}
}

.map-stats {
	display: flex;
	justify-content: space-around;
	padding: 12px 0;
	border-top: 1px solid $border-color;
	margin-top: 8px;

	.map-stat-item {
		display: flex;
		align-items: center;
		gap: 10px;

		.stat-icon {
			width: 36px;
			height: 36px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;

			&.online {
				background: rgba(16, 185, 129, 0.2);
				color: #10b981;
			}

			&.offline {
				background: rgba(107, 114, 128, 0.2);
				color: #6b7280;
			}

			&.alert {
				background: rgba(239, 68, 68, 0.2);
				color: #ef4444;
			}

			&.total {
				background: rgba(0, 212, 255, 0.2);
				color: $primary-color;
			}
		}

		.stat-info {
			.stat-value {
				font-size: 18px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.stat-label {
				font-size: 10px;
				color: $text-muted;
			}
		}
	}
}

.trend-chart {
	width: 100%;
	height: 220px;
}

.metrics-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 8px;

	.metric-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
			transform: translateY(-2px);
		}

		.metric-icon {
			width: 32px;
			height: 32px;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.metric-info {
			flex: 1;
			min-width: 0;

			.metric-value {
				font-size: 14px;
				font-weight: 700;
				color: $text-primary;
				font-family: 'Orbitron', monospace;

				.metric-unit {
					font-size: 9px;
					font-weight: normal;
					color: $text-muted;
					margin-left: 2px;
				}
			}

			.metric-label {
				font-size: 9px;
				color: $text-muted;
			}
		}

		.metric-trend {
			display: flex;
			align-items: center;
			gap: 2px;
			font-size: 9px;
			font-weight: 600;
			flex-shrink: 0;

			&.up {
				color: #10b981;
			}

			&.down {
				color: #ef4444;
			}
		}
	}
}

.team-monitor-list {
	display: flex;
	flex-direction: column;
	gap: 5px;

	.team-monitor-item {
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 5px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(0, 212, 255, 0.1);
		}

		.team-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;

			.team-name {
				font-size: 10px;
				color: $text-primary;
				font-weight: 500;
			}

			.team-status {
				font-size: 8px;
				padding: 2px 5px;
				border-radius: 6px;

				&.normal {
					background: rgba(16, 185, 129, 0.2);
					color: #10b981;
				}

				&.warning {
					background: rgba(245, 158, 11, 0.2);
					color: #f59e0b;
				}

				&.danger {
					background: rgba(239, 68, 68, 0.2);
					color: #ef4444;
				}
			}
		}

		.team-metrics {
			display: flex;
			gap: 8px;

			.team-metric {
				display: flex;
				align-items: center;
				gap: 3px;
				flex: 1;

				.metric-label {
					font-size: 8px;
					color: $text-muted;
					min-width: 28px;
				}

				.metric-bar {
					flex: 1;
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

				.metric-value {
					font-size: 9px;
					color: $primary-color;
					min-width: 28px;
					text-align: right;
				}

				.metric-num {
					font-size: 10px;
					color: $text-primary;
					font-weight: 600;

					&.danger {
						color: #ef4444;
					}
				}
			}
		}
	}
}

.response-chart {
	width: 100%;
	max-width: 300px;
	height: 180px;
	margin: 0 auto 10px;
}

.response-stats {
	display: flex;
	justify-content: space-around;
	margin-top: 14px;
	padding-top: 12px;
	border-top: 1px solid $border-color;

	.response-stat {
		text-align: center;

		.stat-label {
			font-size: 8px;
			color: $text-muted;
		}

		.stat-value {
			font-size: 14px;
			font-weight: 700;
			color: $text-primary;
			font-family: 'Orbitron', monospace;
			margin-top: 2px;

			.unit {
				font-size: 9px;
				font-weight: normal;
				color: $text-muted;
			}
		}
	}
}

@keyframes pulse {
	0% {
		opacity: 1;
		transform: scale(1);
	}

	50% {
		opacity: 0.5;
		transform: scale(1.2);
	}

	100% {
		opacity: 1;
		transform: scale(1);
	}
}
</style>
