<template>
	<div class="big-screen-container">
		<div class="bg-layer">
			<div class="bg-grid"></div>
			<div class="bg-glow"></div>
			<div class="bg-particles" ref="particlesRef"></div>
		</div>

		<div class="corner-deco corner-tl">
			<div class="corner-line-h"></div>
			<div class="corner-line-v"></div>
			<div class="corner-dot"></div>
		</div>
		<div class="corner-deco corner-tr">
			<div class="corner-line-h"></div>
			<div class="corner-line-v"></div>
			<div class="corner-dot"></div>
		</div>
		<div class="corner-deco corner-bl">
			<div class="corner-line-h"></div>
			<div class="corner-line-v"></div>
			<div class="corner-dot"></div>
		</div>
		<div class="corner-deco corner-br">
			<div class="corner-line-h"></div>
			<div class="corner-line-v"></div>
			<div class="corner-dot"></div>
		</div>

		<div class="screen-header">
			<div class="header-left">
				<div class="logo-container">
					<div class="logo-ring"></div>
					<div class="logo-inner">
						<el-icon :size="28"><Monitor /></el-icon>
					</div>
				</div>
				<div class="system-name">
					<div class="name-main">智慧设备物资管理平台</div>
					<div class="name-sub">Smart Equipment & Material Management</div>
				</div>
			</div>
			<div class="header-center">
				<div class="title-box">
					<div class="title-deco left">
						<div class="deco-line"></div>
						<div class="deco-diamond"></div>
					</div>
					<h1 class="main-title">设备物资数据可视化中心</h1>
					<div class="title-deco right">
						<div class="deco-diamond"></div>
						<div class="deco-line"></div>
					</div>
				</div>
			</div>
			<div class="header-right">
				<!-- <div class="time-box">
					<div class="time">{{ currentTime }}</div>
					<div class="date">{{ currentDate }} {{ currentWeek }}</div>
				</div>
				<div class="more-btn" @click="goToMore">
					<span>查看更多</span>
					<el-icon><ArrowRight /></el-icon>
				</div> -->
				<div class="datetime-box">
					<div class="time-display">
						<span class="time-num">{{ currentTime.split(':')[0] }}</span>
						<span class="time-sep">:</span>
						<span class="time-num">{{ currentTime.split(':')[1] }}</span>
						<span class="time-sep">:</span>
						<span class="time-num">{{ currentTime.split(':')[2] }}</span>
					</div>
					<div class="date-display">
						<span class="date-text">{{ currentDate }}</span>
						<span class="week-text">{{ currentWeek }}</span>
					</div>
				</div>
				<div class="action-btn" @click="goToMore">
					<el-icon><DataAnalysis /></el-icon>
					<span>查看更多</span>
				</div>
			</div>
		</div>

		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card equipment-overview">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Monitor /></el-icon>
						</div>
						<h3 class="panel-title">设备总览</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="equipment-chart-box">
							<div ref="equipmentChartRef" class="chart-ring"></div>
							<div class="chart-center-info">
								<div class="center-num">{{ equipmentStats.total }}</div>
								<div class="center-label">设备总数</div>
							</div>
						</div>
						<div class="equipment-legend">
							<div class="legend-item" v-for="item in equipmentStats.list" :key="item.label">
								<div class="legend-color" :style="{ background: item.color }"></div>
								<span class="legend-name">{{ item.label }}</span>
								<span class="legend-value">{{ item.value }}</span>
								<span class="legend-percent">{{ item.percent }}%</span>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card workorder-stats">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Tickets /></el-icon>
						</div>
						<h3 class="panel-title">维修工单统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="workorder-grid">
							<div class="workorder-item" v-for="item in workOrderStats" :key="item.label">
								<div class="item-icon" :style="{ background: item.gradient }">
									<el-icon><component :is="item.icon" /></el-icon>
								</div>
								<div class="item-content">
									<div class="item-value">{{ item.value }}</div>
									<div class="item-label">{{ item.label }}</div>
								</div>
							</div>
						</div>
						<div class="workorder-trend">
							<div class="trend-header">
								<span class="trend-title">近7日工单趋势</span>
							</div>
							<div ref="workorderTrendRef" class="trend-chart"></div>
						</div>
					</div>
				</div>

				<div class="panel-card inspection-stats">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Search /></el-icon>
						</div>
						<h3 class="panel-title">巡检保养任务</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="inspection-grid">
							<div class="inspection-row" v-for="(row, rowIndex) in inspectionRows" :key="rowIndex">
								<div class="inspection-item" v-for="item in row" :key="item.label" :class="item.status">
									<div class="item-header">
										<span class="item-name">{{ item.label }}</span>
										<span class="item-badge" :class="item.status">{{ item.statusText }}</span>
									</div>
									<div class="item-value">{{ item.value }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="top-stats">
					<div class="stat-card" v-for="(stat, index) in topStats" :key="index">
						<div class="stat-bg"></div>
						<div class="stat-glow"></div>
						<div class="stat-icon" :style="{ background: stat.gradient }">
							<el-icon><component :is="stat.icon" /></el-icon>
						</div>
						<div class="stat-info">
							<div class="stat-label">{{ stat.label }}</div>
							<div class="stat-value">
								<span class="value-num">{{ stat.value.toLocaleString() }}</span>
								<span class="value-unit">{{ stat.unit }}</span>
							</div>
							<div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
								<el-icon><component :is="stat.trend > 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
								<span>{{ Math.abs(stat.trend) }}%</span>
							</div>
						</div>
						<div class="stat-decoration">
							<div class="deco-ring"></div>
						</div>
					</div>
				</div>

				<div class="center-map-panel">
					<div class="panel-card map-card">
						<div class="panel-header">
							<div class="header-icon-box">
								<el-icon><Location /></el-icon>
							</div>
							<h3 class="panel-title">设备分布地图</h3>
							<div class="header-line"></div>
							<div class="map-legend">
								<span class="legend-dot active"></span>
								<span class="legend-text">维修中心</span>
							</div>
						</div>
						<div class="panel-body">
							<div ref="mapChartRef" class="map-container"></div>
						</div>
					</div>
				</div>

				<div class="bottom-charts">
					<div class="panel-card cost-chart-card">
						<div class="panel-header">
							<div class="header-icon-box">
								<el-icon><Wallet /></el-icon>
							</div>
							<h3 class="panel-title">维保成本分析</h3>
							<div class="header-line"></div>
						</div>
						<div class="panel-body">
							<div ref="costChartRef" class="cost-chart"></div>
						</div>
					</div>
					<div class="panel-card material-chart-card">
						<div class="panel-header">
							<div class="header-icon-box">
								<el-icon><Box /></el-icon>
							</div>
							<h3 class="panel-title">物资消耗TOP5</h3>
							<div class="header-line"></div>
						</div>
						<div class="panel-body">
							<div ref="materialChartRef" class="material-chart"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card company-stats">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><OfficeBuilding /></el-icon>
						</div>
						<h3 class="panel-title">公司设备统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="panel-body">
						<div class="company-list">
							<div class="company-item" v-for="(item, index) in companyList" :key="item.name">
								<div class="company-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
								<div class="company-info">
									<div class="company-name">{{ item.name }}</div>
									<div class="company-data">
										<span>设备: {{ item.equipment }}台</span>
										<span>人员: {{ item.personnel }}人</span>
									</div>
								</div>
								<div class="company-progress">
									<div class="progress-bar">
										<div class="progress-fill" :style="{ width: item.percent + '%' }"></div>
									</div>
									<span class="progress-value">{{ item.percent }}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card warning-panel">
					<div class="panel-header">
						<div class="header-icon-box warning">
							<el-icon><WarningFilled /></el-icon>
						</div>
						<h3 class="panel-title">物资预警</h3>
						<div class="header-line"></div>
						<div class="warning-count">
							<span class="count-num">{{ materialWarning.length }}</span>
							<span class="count-label">项预警</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="warning-list">
							<div class="warning-item" v-for="item in materialWarning" :key="item.name" :class="item.level">
								<div class="warning-icon">
									<el-icon><Warning /></el-icon>
								</div>
								<div class="warning-content">
									<div class="warning-name">{{ item.name }}</div>
									<div class="warning-bar">
										<div class="bar-track">
											<div class="bar-fill" :style="{ width: (item.stock / item.threshold) * 100 + '%' }"></div>
										</div>
									</div>
									<div class="warning-info">
										<span>库存: {{ item.stock }}</span>
										<span>预警: {{ item.threshold }}</span>
									</div>
								</div>
								<div class="warning-level" :class="item.level">{{ item.levelText }}</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card realtime-panel">
					<div class="panel-header">
						<div class="header-icon-box">
							<el-icon><Bell /></el-icon>
						</div>
						<h3 class="panel-title">实时动态</h3>
						<div class="header-line"></div>
						<div class="live-indicator">
							<span class="live-dot"></span>
							<span class="live-text">LIVE</span>
						</div>
					</div>
					<div class="panel-body">
						<div class="realtime-list" ref="realtimeListRef">
							<div class="realtime-item" v-for="(item, index) in realtimeList" :key="index" :class="item.type">
								<div class="item-time">{{ item.time }}</div>
								<div class="item-content">
									<div class="item-title">{{ item.title }}</div>
									<div class="item-desc">{{ item.desc }}</div>
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
import { useRouter } from 'vue-router'
import {
	Monitor,
	Tickets,
	Search,
	Location,
	Wallet,
	Box,
	OfficeBuilding,
	WarningFilled,
	Warning,
	Bell,
	DataAnalysis,
	Document,
	Clock,
	Operation,
	CircleCheck,
	CaretTop,
	CaretBottom,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

const currentTime = ref('00:00:00')
const currentDate = ref('')
const currentWeek = ref('')
let timer = null

const equipmentChartRef = ref(null)
const workorderTrendRef = ref(null)
const mapChartRef = ref(null)
const costChartRef = ref(null)
const materialChartRef = ref(null)
const particlesRef = ref(null)
const realtimeListRef = ref(null)

let equipmentChart = null
let workorderTrendChart = null
let mapChart = null
let costChart = null
let materialChart = null

const updateTime = () => {
	const now = new Date()
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	currentTime.value = `${hours}:${minutes}:${seconds}`

	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	currentDate.value = `${year}年${month}月${day}日`

	const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
	currentWeek.value = weeks[now.getDay()]
}

const topStats = ref([
	{
		label: '设备总数',
		value: 6739,
		unit: '台',
		icon: 'Monitor',
		gradient: 'linear-gradient(135deg, #00d4ff 0%, #0096ff 100%)',
		trend: 5.2,
	},
	{
		label: '监测设备',
		value: 287,
		unit: '台',
		icon: 'Warning',
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		trend: 12.8,
	},
	{ label: '维保人员', value: 357, unit: '人', icon: 'User', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', trend: 3.5 },
	{
		label: '本月工单',
		value: 348,
		unit: '个',
		icon: 'Document',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		trend: -2.1,
	},
])

const equipmentStats = ref({
	total: 6739,
	list: [
		{ label: '在用', value: 4521, color: '#00d4ff', percent: 67 },
		{ label: '在修', value: 328, color: '#f59e0b', percent: 5 },
		{ label: '停用', value: 1562, color: '#6b7280', percent: 23 },
		{ label: '报废', value: 328, color: '#ef4444', percent: 5 },
	],
})

const workOrderStats = ref([
	{ label: '工单总数', value: 240, icon: 'Document', gradient: 'linear-gradient(135deg, #00d4ff 0%, #0096ff 100%)' },
	{ label: '待处理', value: 45, icon: 'Clock', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
	{ label: '进行中', value: 128, icon: 'Operation', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{ label: '已完成', value: 67, icon: 'CircleCheck', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
])

const inspectionRows = ref([
	[
		{ label: '待巡检', value: 12, status: 'pending', statusText: '待处理' },
		{ label: '已巡检', value: 89, status: 'done', statusText: '已完成' },
	],
	[
		{ label: '待点检', value: 8, status: 'pending', statusText: '待处理' },
		{ label: '已点检', value: 56, status: 'done', statusText: '已完成' },
	],
	[
		{ label: '待润滑', value: 5, status: 'pending', statusText: '待处理' },
		{ label: '已润滑', value: 34, status: 'done', statusText: '已完成' },
	],
	[
		{ label: '待保养', value: 15, status: 'pending', statusText: '待处理' },
		{ label: '已保养', value: 78, status: 'done', statusText: '已完成' },
	],
])

const companyList = ref([
	{ name: '一公司', equipment: 1256, personnel: 186, percent: 78 },
	{ name: '二公司', equipment: 1089, personnel: 152, percent: 65 },
	{ name: '三公司', equipment: 945, personnel: 128, percent: 82 },
	{ name: '集装箱公司', equipment: 1567, personnel: 203, percent: 92 },
	{ name: '岚山公司', equipment: 882, personnel: 115, percent: 54 },
])

const materialWarning = ref([
	{ name: '润滑油', stock: 15, threshold: 50, level: 'danger', levelText: '紧急' },
	{ name: '密封圈', stock: 28, threshold: 40, level: 'warning', levelText: '预警' },
	{ name: '轴承', stock: 35, threshold: 50, level: 'warning', levelText: '预警' },
	{ name: '皮带', stock: 20, threshold: 30, level: 'danger', levelText: '紧急' },
	{ name: '滤芯', stock: 45, threshold: 60, level: 'warning', levelText: '预警' },
])

const realtimeList = ref([
	{ time: '10:25', title: '设备维修工单完成', desc: '叉车设备维修已完成验收', type: 'success' },
	{ time: '10:18', title: '物资出库审批通过', desc: '润滑油领用申请已审批', type: 'info' },
	{ time: '10:12', title: '巡检任务超时预警', desc: '东区巡检任务已超时', type: 'warning' },
	{ time: '10:05', title: '新设备入库登记', desc: '新增电动叉车3台', type: 'info' },
	{ time: '09:58', title: '保养计划生成', desc: '本周保养计划已自动生成', type: 'success' },
])

const goToMore = () => {
	router.push('/dashboard/more')
}

const initEquipmentChart = () => {
	if (!equipmentChartRef.value) return
	equipmentChart = echarts.init(equipmentChartRef.value)
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['70%', '90%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: equipmentStats.value.list.map(item => ({
					value: item.value,
					name: item.label,
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
							{ offset: 0, color: item.color },
							{ offset: 1, color: item.color + '99' },
						]),
					},
				})),
				emphasis: {
					scale: true,
					scaleSize: 8,
				},
			},
		],
	}
	equipmentChart.setOption(option)
}

const initWorkorderTrendChart = () => {
	if (!workorderTrendRef.value) return
	workorderTrendChart = echarts.init(workorderTrendRef.value)
	const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
	const option = {
		grid: { top: 10, right: 10, bottom: 20, left: 30 },
		xAxis: {
			type: 'category',
			data: days,
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
			axisTick: { show: false },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				data: [32, 45, 38, 52, 48, 35, 42],
				type: 'line',
				smooth: true,
				symbol: 'circle',
				symbolSize: 6,
				lineStyle: { color: '#00d4ff', width: 2 },
				itemStyle: { color: '#00d4ff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
						{ offset: 1, color: 'rgba(0, 212, 255, 0)' },
					]),
				},
			},
		],
	}
	workorderTrendChart.setOption(option)
}

const initMapChart = () => {
	if (!mapChartRef.value) return
	mapChart = echarts.init(mapChartRef.value)

	const areaData = [
		{ name: '黄骅港东区', value: 186, color: '#00d4ff' },
		{ name: '黄骅港西区', value: 142, color: '#0096ff' },
		{ name: '煤炭港区', value: 210, color: '#667eea' },
		{ name: '矿石港区', value: 168, color: '#764ba2' },
		{ name: '集装箱港区', value: 134, color: '#4facfe' },
		{ name: '综合保税区', value: 156, color: '#43e97b' },
		{ name: '黄骅港南区', value: 98, color: '#38f9d7' },
		{ name: '物流园区', value: 78, color: '#fa709a' },
	]

	const maxValue = Math.max(...areaData.map(d => d.value))

	const option = {
		backgroundColor: 'transparent',
		title: {
			text: '设备物资区域分布',
			left: 'center',
			top: 15,
			textStyle: {
				color: 'rgba(255, 255, 255, 0.9)',
				fontSize: 16,
				fontWeight: 'bold',
				letterSpacing: 2,
			},
		},
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 20, 40, 0.95)',
			borderColor: '#00d4ff',
			borderWidth: 1,
			textStyle: { color: '#fff', fontSize: 12 },
			axisPointer: {
				type: 'shadow',
				shadowStyle: {
					color: 'rgba(0, 212, 255, 0.1)',
				},
			},
			formatter: params => {
				const data = params[0]
				return `<div style="padding: 8px;">
					<div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${data.name}</div>
					<div style="display: flex; align-items: center; gap: 8px;">
						<span style="display: inline-block; width: 10px; height: 10px; background: ${data.color}; border-radius: 50%;"></span>
						<span>设备数量: <span style="color: #00d4ff; font-weight: bold; font-size: 16px;">${data.value}</span> 台</span>
					</div>
					<div style="margin-top: 5px; color: rgba(255,255,255,0.6); font-size: 11px;">
						占比: ${((data.value / 1172) * 100).toFixed(1)}%
					</div>
				</div>`
			},
		},
		grid: {
			left: '5%',
			right: '5%',
			bottom: '15%',
			top: '20%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: areaData.map(d => d.name),
			axisLine: {
				show: true,
				lineStyle: {
					color: 'rgba(0, 212, 255, 0.3)',
					width: 2,
				},
			},
			axisTick: { show: false },
			axisLabel: {
				color: 'rgba(255, 255, 255, 0.8)',
				fontSize: 11,
				interval: 0,
				rotate: 25,
				margin: 15,
			},
			splitLine: { show: false },
		},
		yAxis: {
			type: 'value',
			name: '设备数量',
			nameTextStyle: {
				color: 'rgba(255, 255, 255, 0.6)',
				fontSize: 11,
				padding: [0, 0, 5, 0],
			},
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: {
				color: 'rgba(255, 255, 255, 0.6)',
				fontSize: 10,
			},
			splitLine: {
				lineStyle: {
					color: 'rgba(0, 212, 255, 0.1)',
					type: 'dashed',
				},
			},
		},
		series: [
			{
				name: '设备数量',
				type: 'bar',
				data: areaData.map((d, i) => ({
					value: d.value,
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: d.color },
							{ offset: 0.5, color: d.color },
							{ offset: 1, color: 'rgba(0, 20, 40, 0.3)' },
						]),
						shadowColor: d.color,
						shadowBlur: 20,
						shadowOffsetY: 5,
					},
				})),
				barWidth: '45%',
				barMaxWidth: 50,
				itemStyle: {
					borderRadius: [8, 8, 0, 0],
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 30,
						shadowColor: 'rgba(0, 212, 255, 0.8)',
					},
				},
				label: {
					show: true,
					position: 'top',
					color: '#fff',
					fontSize: 12,
					fontWeight: 'bold',
					formatter: '{c}',
					textShadowColor: 'rgba(0, 212, 255, 0.8)',
					textShadowBlur: 10,
				},
				animationDelay: idx => idx * 100,
				animationEasing: 'elasticOut',
			},
			{
				name: '底部光效',
				type: 'bar',
				data: areaData.map(d => ({
					value: 5,
					itemStyle: {
						color: new echarts.graphic.RadialGradient(0.5, 1, 0.5, [
							{ offset: 0, color: d.color },
							{ offset: 1, color: 'transparent' },
						]),
					},
				})),
				barWidth: '60%',
				barMaxWidth: 60,
				barGap: '-110%',
				z: -1,
				silent: true,
			},
			{
				name: '顶部发光点',
				type: 'scatter',
				data: areaData.map((d, i) => [i, d.value]),
				symbolSize: 12,
				itemStyle: {
					color: '#fff',
					shadowColor: 'rgba(0, 212, 255, 1)',
					shadowBlur: 15,
				},
				z: 10,
			},
			{
				name: '装饰线',
				type: 'line',
				data: areaData.map(d => d.value),
				symbol: 'none',
				lineStyle: {
					color: 'rgba(0, 212, 255, 0.3)',
					width: 2,
					type: 'dashed',
				},
				smooth: true,
				z: 1,
			},
		],
		graphic: [
			{
				type: 'group',
				left: 'center',
				bottom: 10,
				children: [
					{
						type: 'text',
						style: {
							text: '总计: 1,172 台设备',
							fill: 'rgba(255, 255, 255, 0.7)',
							font: '12px Microsoft YaHei',
						},
					},
				],
			},
		],
	}

	mapChart.setOption(option)
}

const initCostChart = () => {
	if (!costChartRef.value) return
	costChart = echarts.init(costChartRef.value)
	const option = {
		tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
		grid: { top: 30, right: 15, bottom: 25, left: 50 },
		xAxis: {
			type: 'category',
			data: ['维修费', '材料费', '人工费', '外协费', '其他'],
			axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
			axisLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
			axisTick: { show: false },
		},
		yAxis: {
			type: 'value',
			axisLine: { show: false },
			axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
			splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
		},
		series: [
			{
				name: '预算',
				type: 'bar',
				barWidth: 12,
				data: [85, 62, 45, 28, 15],
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#00d4ff' },
						{ offset: 1, color: '#0096ff' },
					]),
				},
			},
			{
				name: '实际',
				type: 'bar',
				barWidth: 12,
				data: [78, 58, 42, 31, 12],
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#43e97b' },
						{ offset: 1, color: '#38f9d7' },
					]),
				},
			},
		],
	}
	costChart.setOption(option)
}

const initMaterialChart = () => {
	if (!materialChartRef.value) return
	materialChart = echarts.init(materialChartRef.value)
	const data = [
		{ name: '润滑油', value: 2580 },
		{ name: '螺栓', value: 1890 },
		{ name: '电缆', value: 1450 },
		{ name: '密封圈', value: 1320 },
		{ name: '轴承', value: 1156 },
	]
	const option = {
		grid: { top: 5, right: 50, bottom: 5, left: 60 },
		xAxis: { type: 'value', show: false },
		yAxis: {
			type: 'category',
			data: data.map(d => d.name).reverse(),
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
		},
		series: [
			{
				type: 'bar',
				data: data.map(d => d.value).reverse(),
				barWidth: 12,
				itemStyle: {
					borderRadius: [0, 6, 6, 0],
					color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
						{ offset: 0, color: '#00d4ff' },
						{ offset: 1, color: '#0096ff' },
					]),
				},
				label: {
					show: true,
					position: 'right',
					color: '#00d4ff',
					fontSize: 11,
					formatter: '{c}',
				},
			},
		],
	}
	materialChart.setOption(option)
}

const handleResize = () => {
	equipmentChart?.resize()
	workorderTrendChart?.resize()
	mapChart?.resize()
	costChart?.resize()
	materialChart?.resize()
}

onMounted(() => {
	updateTime()
	timer = setInterval(updateTime, 1000)

	setTimeout(() => {
		initEquipmentChart()
		initWorkorderTrendChart()
		initMapChart()
		initCostChart()
		initMaterialChart()
	}, 200)

	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	if (timer) clearInterval(timer)
	window.removeEventListener('resize', handleResize)
	equipmentChart?.dispose()
	workorderTrendChart?.dispose()
	mapChart?.dispose()
	costChart?.dispose()
	materialChart?.dispose()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');

$primary-color: #00d4ff;
$primary-dark: #0096ff;
$bg-dark: #030810;
$bg-card: rgba(0, 20, 40, 0.6);
$border-color: rgba(0, 212, 255, 0.2);
$text-primary: #ffffff;
$text-secondary: rgba(255, 255, 255, 0.7);
$text-muted: rgba(255, 255, 255, 0.5);

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

.big-screen-container {
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
	font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
	background: $bg-dark;
	color: $text-primary;
}

.bg-layer {
	position: absolute;
	inset: 0;
	z-index: 0;

	.bg-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
		background-size: 60px 60px;
		animation: gridMove 20s linear infinite;
	}

	.bg-glow {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 150, 255, 0.15) 0%, transparent 50%),
			radial-gradient(ellipse 60% 40% at 20% 100%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
			radial-gradient(ellipse 60% 40% at 80% 100%, rgba(138, 43, 226, 0.1) 0%, transparent 50%);
	}

	.bg-particles {
		position: absolute;
		inset: 0;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			width: 2px;
			height: 2px;
			background: $primary-color;
			border-radius: 50%;
			box-shadow:
				100px 50px $primary-color,
				200px 150px $primary-color,
				300px 100px $primary-color,
				400px 200px $primary-color,
				500px 50px $primary-color,
				600px 180px $primary-color,
				700px 120px $primary-color,
				800px 220px $primary-color,
				900px 80px $primary-color,
				1000px 160px $primary-color;
			animation: particleFloat 15s linear infinite;
			opacity: 0.6;
		}
	}
}

@keyframes gridMove {
	0% {
		background-position: 0 0;
	}
	100% {
		background-position: 60px 60px;
	}
}

@keyframes particleFloat {
	0% {
		transform: translateY(0);
		opacity: 0;
	}
	10% {
		opacity: 0.6;
	}
	90% {
		opacity: 0.6;
	}
	100% {
		transform: translateY(-100vh);
		opacity: 0;
	}
}

.corner-deco {
	position: absolute;
	width: 100px;
	height: 100px;
	z-index: 10;

	.corner-line-h,
	.corner-line-v {
		position: absolute;
		background: linear-gradient(135deg, $primary-color, $primary-dark);
	}

	.corner-line-h {
		width: 50px;
		height: 2px;
	}

	.corner-line-v {
		width: 2px;
		height: 50px;
	}

	.corner-dot {
		position: absolute;
		width: 6px;
		height: 6px;
		background: $primary-color;
		border-radius: 50%;
		box-shadow: 0 0 10px $primary-color;
	}

	&.corner-tl {
		top: 15px;
		left: 15px;
		.corner-line-h {
			top: 0;
			left: 0;
		}
		.corner-line-v {
			top: 0;
			left: 0;
		}
		.corner-dot {
			top: -2px;
			left: -2px;
		}
	}

	&.corner-tr {
		top: 15px;
		right: 15px;
		.corner-line-h {
			top: 0;
			right: 0;
		}
		.corner-line-v {
			top: 0;
			right: 0;
		}
		.corner-dot {
			top: -2px;
			right: -2px;
		}
	}

	&.corner-bl {
		bottom: 15px;
		left: 15px;
		.corner-line-h {
			bottom: 0;
			left: 0;
		}
		.corner-line-v {
			bottom: 0;
			left: 0;
		}
		.corner-dot {
			bottom: -2px;
			left: -2px;
		}
	}

	&.corner-br {
		bottom: 15px;
		right: 15px;
		.corner-line-h {
			bottom: 0;
			right: 0;
		}
		.corner-line-v {
			bottom: 0;
			right: 0;
		}
		.corner-dot {
			bottom: -2px;
			right: -2px;
		}
	}
}

.screen-header {
	height: 90px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30px;
	position: relative;
	z-index: 20;
	background: linear-gradient(180deg, rgba(0, 20, 40, 0.8) 0%, transparent 100%);
	border-bottom: 1px solid $border-color;

	.header-left {
		display: flex;
		align-items: center;
		gap: 15px;

		.logo-container {
			position: relative;
			width: 50px;
			height: 50px;

			.logo-ring {
				position: absolute;
				inset: 0;
				border: 2px solid $primary-color;
				border-radius: 50%;
				animation: ringRotate 10s linear infinite;
				opacity: 0.5;

				&::before {
					content: '';
					position: absolute;
					top: -4px;
					left: 50%;
					transform: translateX(-50%);
					width: 8px;
					height: 8px;
					background: $primary-color;
					border-radius: 50%;
				}
			}

			.logo-inner {
				position: absolute;
				inset: 6px;
				background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 150, 255, 0.2));
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: $primary-color;
			}
		}

		.system-name {
			.name-main {
				font-size: 18px;
				font-weight: 700;
				color: $text-primary;
				letter-spacing: 2px;
			}

			.name-sub {
				font-size: 10px;
				color: $text-muted;
				letter-spacing: 1px;
				margin-top: 2px;
			}
		}
	}

	.header-center {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);

		.title-box {
			display: flex;
			align-items: center;
			gap: 20px;

			.title-deco {
				display: flex;
				align-items: center;
				gap: 8px;

				.deco-line {
					width: 80px;
					height: 2px;
					background: linear-gradient(90deg, transparent, $primary-color);
				}

				.deco-diamond {
					width: 8px;
					height: 8px;
					background: $primary-color;
					transform: rotate(45deg);
					box-shadow: 0 0 10px $primary-color;
				}

				&.right {
					.deco-line {
						background: linear-gradient(90deg, $primary-color, transparent);
					}
				}
			}

			.main-title {
				font-size: 32px;
				font-weight: 900;
				background: linear-gradient(135deg, $primary-color 0%, $primary-dark 50%, #8a2be2 100%);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
				letter-spacing: 6px;
				font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
				text-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
				white-space: nowrap;
			}
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 25px;

		.datetime-box {
			text-align: right;

			.time-display {
				display: flex;
				align-items: center;
				gap: 2px;

				.time-num {
					font-size: 32px;
					font-weight: 700;
					color: $primary-color;
					font-family: 'Orbitron', monospace;
					text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
					min-width: 45px;
					text-align: center;
				}

				.time-sep {
					font-size: 28px;
					font-weight: 700;
					color: $primary-color;
					animation: timeSepBlink 1s ease-in-out infinite;
				}
			}

			.date-display {
				display: flex;
				justify-content: flex-end;
				gap: 10px;
				margin-top: 4px;

				.date-text,
				.week-text {
					font-size: 12px;
					color: $text-secondary;
				}
			}
		}

		.action-btn {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 20px;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 150, 255, 0.1));
			border: 1px solid rgba(0, 212, 255, 0.4);
			border-radius: 20px;
			color: $primary-color;
			font-size: 13px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(0, 150, 255, 0.2));
				border-color: $primary-color;
				transform: translateY(-2px);
				box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3);
			}
		}
	}
}

@keyframes ringRotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes timeSepBlink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.3;
	}
}

.screen-body {
	display: grid;
	grid-template-columns: 1fr 1.8fr 1fr;
	gap: 15px;
	height: calc(100vh - 90px);
	padding: 15px 20px;
	position: relative;
	z-index: 10;
}

.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.center-column {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.panel-card {
	background: $bg-card;
	border: 1px solid $border-color;
	border-radius: 12px;
	overflow: hidden;
	backdrop-filter: blur(10px);
	display: flex;
	flex-direction: column;

	.panel-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 15px;
		background: linear-gradient(90deg, rgba(0, 212, 255, 0.08), transparent);
		border-bottom: 1px solid $border-color;
		position: relative;

		.header-icon-box {
			width: 28px;
			height: 28px;
			background: linear-gradient(135deg, $primary-color, $primary-dark);
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 14px;

			&.warning {
				background: linear-gradient(135deg, #f59e0b, #ef4444);
			}
		}

		.panel-title {
			font-size: 14px;
			font-weight: 600;
			color: $text-primary;
			letter-spacing: 1px;
		}

		.header-line {
			flex: 1;
			height: 1px;
			background: linear-gradient(90deg, $border-color, transparent);
		}

		.map-legend {
			display: flex;
			align-items: center;
			gap: 6px;

			.legend-dot {
				width: 8px;
				height: 8px;
				background: $primary-color;
				border-radius: 50%;
				animation: legendPulse 2s ease-in-out infinite;

				&.active {
					box-shadow: 0 0 10px $primary-color;
				}
			}

			.legend-text {
				font-size: 11px;
				color: $text-secondary;
			}
		}

		.warning-count {
			display: flex;
			align-items: baseline;
			gap: 4px;

			.count-num {
				font-size: 20px;
				font-weight: 700;
				color: #ef4444;
				font-family: 'Orbitron', monospace;
			}

			.count-label {
				font-size: 11px;
				color: $text-muted;
			}
		}

		.live-indicator {
			display: flex;
			align-items: center;
			gap: 6px;

			.live-dot {
				width: 8px;
				height: 8px;
				background: #ef4444;
				border-radius: 50%;
				animation: livePulse 1.5s ease-in-out infinite;
			}

			.live-text {
				font-size: 11px;
				font-weight: 700;
				color: #ef4444;
				letter-spacing: 1px;
			}
		}
	}

	.panel-body {
		flex: 1;
		padding: 12px;
		overflow: hidden;
	}
}

@keyframes legendPulse {
	0%,
	100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.2);
		opacity: 0.7;
	}
}

@keyframes livePulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.3;
	}
}

.equipment-overview {
	flex: 1.2;

	.panel-body {
		display: flex;
		gap: 15px;
	}

	.equipment-chart-box {
		position: relative;
		width: 140px;
		height: 140px;
		flex-shrink: 0;

		.chart-ring {
			width: 100%;
			height: 100%;
		}

		.chart-center-info {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;

			.center-num {
				font-size: 28px;
				font-weight: 900;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
				text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
			}

			.center-label {
				font-size: 10px;
				color: $text-muted;
				margin-top: 2px;
			}
		}
	}

	.equipment-legend {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;

		.legend-item {
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

			.legend-color {
				width: 10px;
				height: 10px;
				border-radius: 3px;
			}

			.legend-name {
				flex: 1;
				font-size: 12px;
				color: $text-secondary;
			}

			.legend-value {
				font-size: 14px;
				font-weight: 600;
				color: $text-primary;
				font-family: 'Orbitron', monospace;
			}

			.legend-percent {
				font-size: 11px;
				color: $text-muted;
				min-width: 35px;
				text-align: right;
			}
		}
	}
}

.workorder-stats {
	flex: 1.5;

	.workorder-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		margin-bottom: 15px;

		.workorder-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 12px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 8px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				transform: translateY(-2px);
			}

			.item-icon {
				width: 40px;
				height: 40px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				font-size: 18px;
			}

			.item-content {
				.item-value {
					font-size: 22px;
					font-weight: 700;
					color: $text-primary;
					font-family: 'Orbitron', monospace;
				}

				.item-label {
					font-size: 11px;
					color: $text-muted;
					margin-top: 2px;
				}
			}
		}
	}

	.workorder-trend {
		.trend-header {
			margin-bottom: 8px;

			.trend-title {
				font-size: 11px;
				color: $text-muted;
			}
		}

		.trend-chart {
			height: 80px;
		}
	}
}

.inspection-stats {
	flex: 1;

	.inspection-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.inspection-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;

			.inspection-item {
				padding: 10px 12px;
				background: rgba(255, 255, 255, 0.03);
				border-radius: 8px;
				border-left: 3px solid transparent;
				transition: all 0.3s ease;

				&.pending {
					border-left-color: #f59e0b;
					background: rgba(245, 158, 11, 0.05);
				}

				&.done {
					border-left-color: #10b981;
					background: rgba(16, 185, 129, 0.05);
				}

				&:hover {
					transform: translateX(3px);
				}

				.item-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 6px;

					.item-name {
						font-size: 11px;
						color: $text-secondary;
					}

					.item-badge {
						font-size: 9px;
						padding: 2px 6px;
						border-radius: 8px;

						&.pending {
							color: #f59e0b;
							background: rgba(245, 158, 11, 0.15);
						}

						&.done {
							color: #10b981;
							background: rgba(16, 185, 129, 0.15);
						}
					}
				}

				.item-value {
					font-size: 20px;
					font-weight: 700;
					color: $text-primary;
					font-family: 'Orbitron', monospace;
				}
			}
		}
	}
}

.top-stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 15px;
	flex-shrink: 0;

	.stat-card {
		position: relative;
		padding: 18px 20px;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.4s ease;

		.stat-bg {
			position: absolute;
			inset: 0;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 50, 100, 0.05) 100%);
			border: 1px solid $border-color;
			border-radius: 12px;
			transition: all 0.4s ease;
		}

		.stat-glow {
			position: absolute;
			inset: -2px;
			background: radial-gradient(circle at center, rgba(0, 212, 255, 0.2), transparent 70%);
			border-radius: 14px;
			opacity: 0;
			transition: opacity 0.4s ease;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 2px;
			background: linear-gradient(90deg, transparent, $primary-color, transparent);
		}

		&:hover {
			transform: translateY(-5px);

			.stat-bg {
				border-color: $primary-color;
				background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 50, 100, 0.1) 100%);
			}

			.stat-glow {
				opacity: 1;
			}

			.stat-icon {
				transform: scale(1.1) rotate(5deg);
				box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
			}

			.stat-value .value-num {
				text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
			}

			.stat-decoration .deco-ring {
				transform: scale(1.2);
				opacity: 1;
			}
		}

		.stat-icon {
			position: relative;
			width: 48px;
			height: 48px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			font-size: 22px;
			margin-bottom: 12px;
			transition: all 0.4s ease;
			z-index: 1;
		}

		.stat-info {
			position: relative;
			z-index: 1;

			.stat-label {
				font-size: 12px;
				color: $text-muted;
				letter-spacing: 1px;
				margin-bottom: 6px;
			}

			.stat-value {
				display: flex;
				align-items: baseline;
				gap: 4px;
				margin-bottom: 8px;

				.value-num {
					font-size: 28px;
					font-weight: 900;
					color: $text-primary;
					font-family: 'Orbitron', monospace;
					transition: all 0.4s ease;
				}

				.value-unit {
					font-size: 12px;
					color: $text-muted;
				}
			}

			.stat-trend {
				display: inline-flex;
				align-items: center;
				gap: 4px;
				font-size: 11px;
				font-weight: 600;
				padding: 3px 8px;
				border-radius: 10px;

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

		.stat-decoration {
			position: absolute;
			right: 15px;
			bottom: 15px;
			z-index: 1;

			.deco-ring {
				width: 40px;
				height: 40px;
				border: 2px solid rgba(0, 212, 255, 0.2);
				border-radius: 50%;
				opacity: 0.5;
				transition: all 0.4s ease;
			}
		}
	}
}

.center-map-panel {
	flex: 1;
	min-height: 0;

	.map-card {
		height: 100%;

		.panel-body {
			padding: 0;
			height: calc(100% - 45px);
		}

		.map-container {
			width: 100%;
			height: 100%;
			min-height: 200px;
		}
	}
}

.bottom-charts {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 15px;
	flex-shrink: 0;

	.cost-chart-card,
	.material-chart-card {
		.cost-chart,
		.material-chart {
			height: 150px;
		}
	}
}

.company-stats {
	flex: 1;

	.company-list {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.company-item {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 10px 12px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 8px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				transform: translateX(5px);
			}

			.company-rank {
				width: 24px;
				height: 24px;
				border-radius: 6px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 12px;
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

			.company-info {
				flex: 1;

				.company-name {
					font-size: 12px;
					font-weight: 600;
					color: $text-primary;
					margin-bottom: 4px;
				}

				.company-data {
					display: flex;
					gap: 12px;

					span {
						font-size: 10px;
						color: $text-muted;
					}
				}
			}

			.company-progress {
				display: flex;
				align-items: center;
				gap: 8px;
				width: 100px;

				.progress-bar {
					flex: 1;
					height: 6px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 3px;
					overflow: hidden;

					.progress-fill {
						height: 100%;
						background: linear-gradient(90deg, $primary-color, $primary-dark);
						border-radius: 3px;
						transition: width 1s ease;
					}
				}

				.progress-value {
					font-size: 11px;
					font-weight: 600;
					color: $primary-color;
					font-family: 'Orbitron', monospace;
				}
			}
		}
	}
}

.warning-panel {
	flex: 1.2;

	.warning-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 100%;
		overflow-y: auto;

		&::-webkit-scrollbar {
			width: 4px;
		}

		&::-webkit-scrollbar-track {
			background: rgba(0, 212, 255, 0.1);
			border-radius: 2px;
		}

		&::-webkit-scrollbar-thumb {
			background: rgba(0, 212, 255, 0.3);
			border-radius: 2px;
		}

		.warning-item {
			display: flex;
			align-items: flex-start;
			gap: 10px;
			padding: 10px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 8px;
			border-left: 3px solid transparent;
			transition: all 0.3s ease;

			&.danger {
				border-left-color: #ef4444;
				background: rgba(239, 68, 68, 0.05);
			}

			&.warning {
				border-left-color: #f59e0b;
				background: rgba(245, 158, 11, 0.05);
			}

			&:hover {
				transform: translateX(3px);
			}

			.warning-icon {
				width: 28px;
				height: 28px;
				border-radius: 6px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 14px;
				background: rgba(255, 255, 255, 0.1);
				color: $text-secondary;
			}

			.warning-content {
				flex: 1;

				.warning-name {
					font-size: 12px;
					font-weight: 600;
					color: $text-primary;
					margin-bottom: 6px;
				}

				.warning-bar {
					margin-bottom: 4px;

					.bar-track {
						height: 4px;
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

				.warning-info {
					display: flex;
					justify-content: space-between;

					span {
						font-size: 10px;
						color: $text-muted;
					}
				}
			}

			.warning-level {
				font-size: 10px;
				font-weight: 600;
				padding: 3px 8px;
				border-radius: 8px;

				&.danger {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.15);
				}

				&.warning {
					color: #f59e0b;
					background: rgba(245, 158, 11, 0.15);
				}
			}
		}
	}
}

.realtime-panel {
	flex: 0.8;

	.realtime-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 100%;
		overflow-y: auto;

		&::-webkit-scrollbar {
			width: 4px;
		}

		&::-webkit-scrollbar-track {
			background: rgba(0, 212, 255, 0.1);
			border-radius: 2px;
		}

		&::-webkit-scrollbar-thumb {
			background: rgba(0, 212, 255, 0.3);
			border-radius: 2px;
		}

		.realtime-item {
			display: flex;
			gap: 10px;
			padding: 8px 10px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 6px;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
			}

			.item-time {
				font-size: 11px;
				font-weight: 600;
				color: $primary-color;
				font-family: 'Orbitron', monospace;
				min-width: 40px;
			}

			.item-content {
				flex: 1;

				.item-title {
					font-size: 11px;
					font-weight: 600;
					color: $text-primary;
					margin-bottom: 2px;
				}

				.item-desc {
					font-size: 10px;
					color: $text-muted;
				}
			}

			&.success {
				border-left: 2px solid #10b981;
			}

			&.warning {
				border-left: 2px solid #f59e0b;
			}

			&.info {
				border-left: 2px solid $primary-color;
			}
		}
	}
}

@media screen and (max-width: 1600px) {
	.screen-header {
		height: 75px;
		padding: 0 20px;

		.header-center .title-box {
			.main-title {
				font-size: 26px;
				letter-spacing: 4px;
			}

			.title-deco .deco-line {
				width: 60px;
			}
		}

		.header-right {
			.datetime-box .time-display .time-num {
				font-size: 26px;
				min-width: 38px;
			}

			.action-btn {
				padding: 8px 16px;
				font-size: 12px;
			}
		}

		.header-left {
			.logo-container {
				width: 42px;
				height: 42px;
			}

			.system-name .name-main {
				font-size: 15px;
			}
		}
	}

	.screen-body {
		padding: 10px 15px;
		gap: 12px;
	}

	.top-stats .stat-card {
		padding: 14px 16px;

		.stat-icon {
			width: 42px;
			height: 42px;
			font-size: 18px;
		}

		.stat-info .stat-value .value-num {
			font-size: 24px;
		}
	}
}

@media screen and (max-width: 1366px) {
	.screen-header {
		height: 65px;

		.header-center .title-box {
			gap: 15px;

			.main-title {
				font-size: 22px;
				letter-spacing: 3px;
			}

			.title-deco .deco-line {
				width: 50px;
			}
		}

		.header-right {
			gap: 15px;

			.datetime-box .time-display {
				.time-num {
					font-size: 22px;
					min-width: 32px;
				}

				.time-sep {
					font-size: 20px;
				}
			}
		}

		.header-left {
			.logo-container {
				width: 36px;
				height: 36px;

				.logo-inner {
					inset: 4px;
				}
			}

			.system-name {
				.name-main {
					font-size: 13px;
				}

				.name-sub {
					font-size: 9px;
				}
			}
		}
	}

	.screen-body {
		grid-template-columns: 1fr 1.6fr 1fr;
		gap: 10px;
		padding: 10px 12px;
	}

	.panel-card .panel-header {
		padding: 10px 12px;

		.panel-title {
			font-size: 13px;
		}

		.header-icon-box {
			width: 24px;
			height: 24px;
			font-size: 12px;
		}
	}

	.top-stats {
		gap: 10px;

		.stat-card {
			padding: 12px;

			.stat-icon {
				width: 36px;
				height: 36px;
				font-size: 16px;
				margin-bottom: 8px;
			}

			.stat-info {
				.stat-label {
					font-size: 11px;
				}

				.stat-value .value-num {
					font-size: 20px;
				}
			}
		}
	}

	.bottom-charts {
		gap: 10px;

		.cost-chart-card,
		.material-chart-card {
			.cost-chart,
			.material-chart {
				height: 120px;
			}
		}
	}
}

@media screen and (max-width: 1200px) {
	.screen-body {
		grid-template-columns: 1fr 1.4fr 1fr;
	}

	.corner-deco {
		display: none;
	}
}

@media screen and (max-width: 992px) {
	.screen-header {
		.header-left {
			display: none;
		}

		.header-center {
			position: static;
			transform: none;
		}

		.header-right {
			.datetime-box .date-display {
				display: none;
			}
		}
	}

	.screen-body {
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto 1fr;

		.left-column {
			grid-column: 1;
			grid-row: 1 / 3;
		}

		.center-column {
			grid-column: 2;
			grid-row: 1 / 3;
		}

		.right-column {
			grid-column: 1 / -1;
			grid-row: 3;
			flex-direction: row;

			.panel-card {
				flex: 1;
			}
		}
	}

	.top-stats {
		grid-template-columns: repeat(2, 1fr);
	}

	.bottom-charts {
		grid-template-columns: 1fr;
	}
}

@media screen and (max-width: 768px) {
	.screen-header {
		height: 55px;
		padding: 0 15px;

		.header-center .title-box {
			gap: 10px;

			.main-title {
				font-size: 16px;
				letter-spacing: 2px;
			}

			.title-deco {
				display: none;
			}
		}

		.header-right {
			gap: 10px;

			.datetime-box .time-display {
				.time-num {
					font-size: 18px;
					min-width: 26px;
				}

				.time-sep {
					font-size: 16px;
				}
			}

			.action-btn {
				padding: 6px 12px;
				font-size: 11px;

				span {
					display: none;
				}
			}
		}
	}

	.screen-body {
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		gap: 8px;
		padding: 8px 10px;

		.left-column,
		.center-column,
		.right-column {
			grid-column: 1;
			grid-row: auto;
		}

		.right-column {
			flex-direction: column;
		}
	}

	.top-stats {
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;

		.stat-card {
			padding: 10px;

			.stat-icon {
				width: 32px;
				height: 32px;
				font-size: 14px;
				margin-bottom: 6px;
			}

			.stat-info {
				.stat-label {
					font-size: 10px;
				}

				.stat-value .value-num {
					font-size: 18px;
				}

				.stat-trend {
					font-size: 10px;
				}
			}

			.stat-decoration {
				display: none;
			}
		}
	}

	.panel-card {
		.panel-header {
			padding: 8px 10px;

			.panel-title {
				font-size: 12px;
			}

			.header-icon-box {
				width: 22px;
				height: 22px;
				font-size: 11px;
			}
		}

		.panel-body {
			padding: 10px;
		}
	}

	.equipment-overview .panel-body {
		flex-direction: column;
		align-items: center;

		.equipment-chart-box {
			width: 120px;
			height: 120px;

			.chart-center-info .center-num {
				font-size: 22px;
			}
		}

		.equipment-legend {
			width: 100%;
		}
	}

	.workorder-stats .workorder-grid {
		grid-template-columns: 1fr 1fr;
		gap: 8px;

		.workorder-item {
			padding: 10px;

			.item-icon {
				width: 32px;
				height: 32px;
				font-size: 14px;
			}

			.item-content .item-value {
				font-size: 18px;
			}
		}
	}

	.center-map-panel {
		min-height: 250px;
	}

	.bottom-charts {
		.cost-chart-card,
		.material-chart-card {
			.cost-chart,
			.material-chart {
				height: 100px;
			}
		}
	}
}

@media screen and (max-width: 480px) {
	.screen-header {
		.header-center .title-box .main-title {
			font-size: 14px;
			letter-spacing: 1px;
		}

		.header-right {
			.datetime-box .time-display {
				.time-num {
					font-size: 16px;
					min-width: 22px;
				}
			}

			.action-btn {
				display: none;
			}
		}
	}

	.top-stats {
		grid-template-columns: 1fr 1fr;
		gap: 6px;

		.stat-card {
			padding: 8px;

			.stat-icon {
				width: 28px;
				height: 28px;
				font-size: 12px;
				margin-bottom: 4px;
			}

			.stat-info {
				.stat-label {
					font-size: 9px;
				}

				.stat-value {
					.value-num {
						font-size: 16px;
					}

					.value-unit {
						font-size: 10px;
					}
				}
			}
		}
	}

	.panel-card {
		.panel-header {
			padding: 6px 8px;

			.panel-title {
				font-size: 11px;
			}
		}

		.panel-body {
			padding: 8px;
		}
	}

	.workorder-stats .workorder-grid {
		.workorder-item {
			padding: 8px;

			.item-icon {
				width: 28px;
				height: 28px;
				font-size: 12px;
			}

			.item-content .item-value {
				font-size: 16px;
			}
		}
	}

	.inspection-stats .inspection-grid .inspection-row .inspection-item {
		padding: 8px;

		.item-value {
			font-size: 16px;
		}
	}

	.company-stats .company-list .company-item {
		padding: 8px;

		.company-rank {
			width: 20px;
			height: 20px;
			font-size: 10px;
		}

		.company-info {
			.company-name {
				font-size: 11px;
			}

			.company-data span {
				font-size: 9px;
			}
		}

		.company-progress {
			width: 80px;

			.progress-value {
				font-size: 10px;
			}
		}
	}

	.warning-panel .warning-list .warning-item {
		padding: 8px;

		.warning-icon {
			width: 24px;
			height: 24px;
			font-size: 12px;
		}

		.warning-content {
			.warning-name {
				font-size: 11px;
			}

			.warning-info span {
				font-size: 9px;
			}
		}

		.warning-level {
			font-size: 9px;
			padding: 2px 6px;
		}
	}

	.realtime-panel .realtime-list .realtime-item {
		padding: 6px 8px;

		.item-time {
			font-size: 10px;
			min-width: 35px;
		}

		.item-content {
			.item-title {
				font-size: 10px;
			}

			.item-desc {
				font-size: 9px;
			}
		}
	}
}
</style>
