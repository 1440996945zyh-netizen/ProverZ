<template>
	<div class="big-screen-container">
		<div class="bg-pattern"></div>
		<div class="bg-overlay"></div>
		<div class="corner-decoration corner-tl"></div>
		<div class="corner-decoration corner-tr"></div>
		<div class="corner-decoration corner-bl"></div>
		<div class="corner-decoration corner-br"></div>

		<div class="screen-header">
			<div class="header-left">
				<div class="logo-box">
					<img src="@/assets/logo/logo-h-white2.png" class="logo" />
				</div>
			</div>
			<div class="header-center">
				<div class="title-wrapper">
					<div class="title-decoration left"></div>
					<h1 class="main-title">智慧设备管理平台</h1>
					<div class="title-decoration right"></div>
				</div>
				<div class="subtitle">数据可视化大屏</div>
			</div>
			<div class="header-right">
				<div class="time-box">
					<div class="time">{{ currentTime }}</div>
					<div class="date">{{ currentDate }} {{ currentWeek }}</div>
				</div>
				<div class="more-btn" @click="goToMore">
					<span>查看更多</span>
					<el-icon><ArrowRight /></el-icon>
				</div>
			</div>
		</div>

		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card device-status-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">设备状态监测情况</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="device-status-chart">
							<div ref="deviceStatusChartRef" class="chart-container"></div>
							<div class="chart-center">
								<div class="center-value">{{ deviceStats.total }}</div>
								<div class="center-label">监测设备总数</div>
							</div>
						</div>
						<div class="status-legend">
							<div class="legend-item" v-for="item in deviceStats.list" :key="item.label">
								<div class="legend-dot" :style="{ background: item.color }"></div>
								<span class="legend-label">{{ item.label }}</span>
								<span class="legend-value">{{ item.value }}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card workorder-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">维修工单统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="workorder-grid">
							<div class="workorder-item" v-for="item in workOrderStats" :key="item.label">
								<div class="workorder-icon" :style="{ background: item.color }">
									<el-icon :size="24"><component :is="item.icon" /></el-icon>
								</div>
								<div class="workorder-info">
									<div class="workorder-value">{{ item.value }}</div>
									<div class="workorder-label">{{ item.label }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card cost-progress-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">公司维保成本使用进度</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="cost-progress-list" :class="{ 'auto-scroll': costProgressList.length > 4 }">
							<div class="scroll-content" ref="costScrollRef" @mouseenter="pauseCostScroll" @mouseleave="resumeCostScroll">
								<div class="cost-progress-item" v-for="(item, index) in costProgressList" :key="'original-' + index">
									<div class="cost-header">
										<span class="cost-name">{{ item.name }}</span>
										<span class="cost-total">总费用: {{ item.total }}万元</span>
									</div>
									<div class="progress-bar-wrapper">
										<div class="progress-track">
											<div class="progress-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
										</div>
										<span class="progress-percent">{{ item.percent }}%</span>
									</div>
								</div>
								<template v-if="costProgressList.length > 4">
									<div class="cost-progress-item" v-for="(item, index) in costProgressList" :key="'clone-' + index">
										<div class="cost-header">
											<span class="cost-name">{{ item.name }}</span>
											<span class="cost-total">总费用: {{ item.total }}万元</span>
										</div>
										<div class="progress-bar-wrapper">
											<div class="progress-track">
												<div
													class="progress-fill"
													:style="{ width: item.percent + '%', background: item.color }"
												></div>
											</div>
											<span class="progress-percent">{{ item.percent }}%</span>
										</div>
									</div>
								</template>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="center-top">
					<div class="stat-panel">
						<div class="stat-item" v-for="(stat, index) in topStats" :key="index">
							<div class="stat-bg"></div>
							<div class="stat-glow"></div>
							<div class="stat-icon-wrapper">
								<div class="stat-icon" :style="{ background: stat.gradient }">
									<el-icon :size="28"><component :is="stat.icon" /></el-icon>
								</div>
								<div class="icon-ring"></div>
							</div>
							<div class="stat-content">
								<div class="stat-label">{{ stat.label }}</div>
								<div class="stat-value">{{ stat.value.toLocaleString() }}</div>
								<div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
									<el-icon><component :is="stat.trend > 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
									{{ Math.abs(stat.trend) }}%
								</div>
							</div>
							<div class="stat-decoration">
								<div class="deco-line"></div>
								<div class="deco-dot"></div>
							</div>
						</div>
					</div>
				</div>

				<div class="center-map">
					<div class="panel-card map-card">
						<div class="card-header">
							<div class="header-icon"></div>
							<h3 class="card-title">技术创新中心 - 设备分布</h3>
							<div class="header-line"></div>
						</div>
						<div class="card-body">
							<div ref="centerMapChartRef" class="map-chart"></div>
						</div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card company-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">内部公司统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="company-list">
							<div class="company-item" v-for="item in companyList" :key="item.name">
								<div class="company-icon" :style="{ background: item.gradient }">
									<el-icon><OfficeBuilding /></el-icon>
								</div>
								<div class="company-info">
									<div class="company-name">{{ item.name }}</div>
									<div class="company-stats">
										<span>设备: {{ item.equipment }}台</span>
										<span>人员: {{ item.personnel }}人</span>
									</div>
								</div>
								<div class="company-badge">{{ item.status }}</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card warning-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">物资预警统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="warning-container">
							<div class="warning-item" v-for="item in materialWarning" :key="item.name">
								<div class="warning-header">
									<span class="warning-name">{{ item.name }}</span>
									<span class="warning-level" :class="item.level">
										<el-icon><Warning /></el-icon>
										{{ item.levelText }}
									</span>
								</div>
								<div class="warning-progress">
									<div class="warning-bar">
										<div
											class="warning-fill"
											:style="{
												width: (item.stock / item.threshold) * 100 + '%',
												background: item.level === 'danger' ? '#ef4444' : '#f59e0b',
											}"
										></div>
									</div>
									<div class="warning-stats">
										<span>库存: {{ item.stock }}</span>
										<span>预警线: {{ item.threshold }}</span>
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
import { useRouter } from 'vue-router'
import {
	Monitor,
	Warning,
	User,
	Document,
	Clock,
	Operation,
	CircleCheck,
	ArrowUp,
	ArrowDown,
	ArrowRight,
	DataAnalysis,
	OfficeBuilding,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()

const currentTime = ref('')
const currentDate = ref('')
const currentWeek = ref('')
let timer = null

const deviceStatusChartRef = ref(null)
const centerMapChartRef = ref(null)
const costScrollRef = ref(null)
let deviceStatusChart = null
let centerMapChart = null
let costScrollAnimation = null
let isCostScrollPaused = false

const pauseCostScroll = () => {
	isCostScrollPaused = true
	if (costScrollRef.value) {
		costScrollRef.value.style.animationPlayState = 'paused'
	}
}

const resumeCostScroll = () => {
	isCostScrollPaused = false
	if (costScrollRef.value) {
		costScrollRef.value.style.animationPlayState = 'running'
	}
}

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
		icon: 'Monitor',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		trend: 5.2,
	},
	{
		label: '监测设备数',
		value: 287,
		icon: 'Warning',
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		trend: 12.8,
	},
	{
		label: '维保人员',
		value: 357,
		icon: 'User',
		gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		trend: 3.5,
	},
	{
		label: '本月工单',
		value: 348,
		icon: 'Document',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
		trend: -2.1,
	},
])

const deviceStats = ref({
	total: 287,
	list: [
		{ label: '运行', value: 115, color: '#10b981' },
		{ label: '待机', value: 0, color: '#f59e0b' },
		{ label: '故障', value: 0, color: '#ef4444' },
		{ label: '停机', value: 122, color: '#6b7280' },
	],
})

const workOrderStats = ref([
	{ label: '工单总数', value: 240, icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '待处理', value: 0, icon: 'Clock', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
	{ label: '进行中', value: 233, icon: 'Operation', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{ label: '已完成', value: 3, icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
])

const costProgressList = ref([
	{ name: '一公司', total: '156.8', percent: 78, color: '#667eea' },
	{ name: '二公司', total: '132.5', percent: 65, color: '#f093fb' },
	{ name: '三公司', total: '98.6', percent: 82, color: '#4facfe' },
	{ name: '集装箱公司', total: '185.2', percent: 92, color: '#43e97b' },
	{ name: '岚山公司', total: '76.4', percent: 54, color: '#f59e0b' },
])

const materialWarning = ref([
	{ name: '润滑油', stock: 15, threshold: 50, level: 'danger', levelText: '紧急' },
	{ name: '密封圈', stock: 28, threshold: 40, level: 'warning', levelText: '预警' },
	{ name: '轴承', stock: 35, threshold: 50, level: 'warning', levelText: '预警' },
	{ name: '皮带', stock: 20, threshold: 30, level: 'danger', levelText: '紧急' },
	{ name: '滤芯', stock: 45, threshold: 60, level: 'warning', levelText: '预警' },
])

const companyList = ref([
	{ name: '一公司', equipment: 1256, personnel: 186, status: '运行中', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ name: '二公司', equipment: 1089, personnel: 152, status: '运行中', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
	{ name: '三公司', equipment: 945, personnel: 128, status: '运行中', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{
		name: '集装箱公司',
		equipment: 1567,
		personnel: 203,
		status: '运行中',
		gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
	},
	{ name: '岚山公司', equipment: 882, personnel: 115, status: '运行中', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
])

const goToMore = () => {
	router.push('/dashboard/more')
}

const initDeviceStatusChart = () => {
	if (!deviceStatusChartRef.value) return
	deviceStatusChart = echarts.init(deviceStatusChartRef.value)
	const option = {
		series: [
			{
				type: 'pie',
				radius: ['65%', '85%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: deviceStats.value.list.map(item => ({
					value: item.value,
					name: item.label,
					itemStyle: {
						color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
							{ offset: 0, color: item.color },
							{ offset: 1, color: item.color + '80' },
						]),
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
	deviceStatusChart.setOption(option)
}

const initCenterMapChart = () => {
	if (!centerMapChartRef.value) return
	centerMapChart = echarts.init(centerMapChartRef.value)

	const centers = [
		{ name: '东区维修中心', value: [119.46, 35.12, 80] },
		{ name: '西区维修中心', value: [119.38, 35.08, 96] },
		{ name: '南区维修中心', value: [119.42, 35.05, 104] },
		{ name: '岚南维修中心', value: [119.35, 35.1, 54] },
		{ name: '岚中维修中心', value: [119.4, 35.15, 12] },
	]

	const option = {
		backgroundColor: 'transparent',
		geo: {
			map: 'china',
			roam: false,
			zoom: 1.2,
			center: [119.42, 35.1],
			label: { show: false },
			itemStyle: {
				areaColor: 'rgba(59, 130, 246, 0.1)',
				borderColor: 'rgba(59, 130, 246, 0.3)',
				borderWidth: 1,
			},
			emphasis: {
				itemStyle: {
					areaColor: 'rgba(59, 130, 246, 0.3)',
				},
			},
		},
		series: [
			{
				type: 'scatter',
				coordinateSystem: 'geo',
				data: centers.map((item, index) => ({
					name: item.name,
					value: item.value,
					symbolSize: item.value[2] / 5,
					itemStyle: {
						color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
							{ offset: 0, color: '#60a5fa' },
							{ offset: 1, color: '#3b82f6' },
						]),
						shadowBlur: 20,
						shadowColor: 'rgba(59, 130, 246, 0.8)',
					},
					label: {
						show: true,
						formatter: '{b}',
						position: 'bottom',
						color: '#fff',
						fontSize: 11,
						fontWeight: 'bold',
					},
				})),
			},
			{
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: centers.slice(0, 3).map(item => ({
					name: item.name,
					value: item.value,
					symbolSize: 6,
					itemStyle: {
						color: '#60a5fa',
						shadowBlur: 10,
						shadowColor: '#3b82f6',
					},
				})),
				rippleEffect: {
					brushType: 'stroke',
					scale: 3,
					period: 4,
				},
			},
		],
	}

	centerMapChart.setOption(option)
}

const handleResize = () => {
	deviceStatusChart?.resize()
	centerMapChart?.resize()
}

onMounted(() => {
	updateTime()
	timer = setInterval(updateTime, 1000)

	setTimeout(() => {
		initDeviceStatusChart()
		initCenterMapChart()
	}, 200)

	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	if (timer) clearInterval(timer)
	window.removeEventListener('resize', handleResize)
	deviceStatusChart?.dispose()
	centerMapChart?.dispose()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.big-screen-container {
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
	font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
	background: #050d19;

	.bg-pattern {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(90deg, rgba(0, 150, 255, 0.03) 1px, transparent 1px),
			linear-gradient(rgba(0, 150, 255, 0.03) 1px, transparent 1px),
			radial-gradient(circle at 20% 30%, rgba(0, 150, 255, 0.1) 0%, transparent 40%),
			radial-gradient(circle at 80% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 40%);
		background-size:
			50px 50px,
			50px 50px,
			100% 100%,
			100% 100%;
		animation: bgMove 30s linear infinite;
		z-index: 0;
	}

	.bg-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background:
			linear-gradient(180deg, rgba(5, 13, 25, 0.4) 0%, rgba(5, 13, 25, 0.2) 50%, rgba(5, 13, 25, 0.4) 100%),
			radial-gradient(ellipse at center, transparent 0%, rgba(5, 13, 25, 0.8) 100%);
		z-index: 1;
	}

	@keyframes bgMove {
		0% {
			background-position:
				0 0,
				0 0,
				0 0,
				0 0;
		}
		100% {
			background-position:
				50px 50px,
				50px 50px,
				0 0,
				0 0;
		}
	}
}

.corner-decoration {
	position: absolute;
	width: 120px;
	height: 120px;
	z-index: 5;

	&::before,
	&::after {
		content: '';
		position: absolute;
		background: linear-gradient(135deg, #00d4ff, #0096ff);
	}

	&.corner-tl {
		top: 10px;
		left: 10px;
		&::before {
			top: 0;
			left: 0;
			width: 3px;
			height: 40px;
		}
		&::after {
			top: 0;
			left: 0;
			width: 40px;
			height: 3px;
		}
	}

	&.corner-tr {
		top: 10px;
		right: 10px;
		&::before {
			top: 0;
			right: 0;
			width: 3px;
			height: 40px;
		}
		&::after {
			top: 0;
			right: 0;
			width: 40px;
			height: 3px;
		}
	}

	&.corner-bl {
		bottom: 10px;
		left: 10px;
		&::before {
			bottom: 0;
			left: 0;
			width: 3px;
			height: 40px;
		}
		&::after {
			bottom: 0;
			left: 0;
			width: 40px;
			height: 3px;
		}
	}

	&.corner-br {
		bottom: 10px;
		right: 10px;
		&::before {
			bottom: 0;
			right: 0;
			width: 3px;
			height: 40px;
		}
		&::after {
			bottom: 0;
			right: 0;
			width: 40px;
			height: 3px;
		}
	}
}

.screen-header {
	height: 80px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 40px;
	position: relative;
	z-index: 10;

	.header-left,
	.header-right {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.header-left {
		justify-content: flex-start;
	}

	.header-center {
		flex: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header-right {
		justify-content: flex-end;
		gap: 20px;
	}

	.logo-box {
		display: flex;
		align-items: center;

		.logo {
			height: 50px;
			object-fit: contain;
		}
	}

	.title-wrapper {
		display: flex;
		align-items: center;
		gap: 20px;

		.title-decoration {
			width: 120px;
			height: 2px;
			background: linear-gradient(90deg, transparent, #00d4ff, #0096ff, transparent);

			&.left {
				background: linear-gradient(90deg, transparent, #00d4ff, #0096ff);
			}

			&.right {
				background: linear-gradient(90deg, #0096ff, #00d4ff, transparent);
			}
		}
	}

	.main-title {
		font-size: 32px;
		font-weight: 900;
		margin: 0;
		background: linear-gradient(135deg, #00d4ff 0%, #0096ff 50%, #8a2be2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: 4px;
		font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
		text-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
	}

	.subtitle {
		font-size: 14px;
		color: rgba(0, 212, 255, 0.7);
		letter-spacing: 4px;
		margin-top: 5px;
	}

	.time-box {
		text-align: right;

		.time {
			font-size: 36px;
			font-weight: 700;
			color: #00d4ff;
			font-family: 'Orbitron', monospace;
			letter-spacing: 3px;
			text-shadow: 0 0 30px rgba(0, 212, 255, 0.6);
		}

		.date {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.7);
			margin-top: 3px;
		}
	}

	.more-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 24px;
		background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(138, 43, 226, 0.25));
		border: 2px solid rgba(0, 212, 255, 0.5);
		border-radius: 25px;
		color: #00d4ff;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);

		&:hover {
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(138, 43, 226, 0.4));
			border-color: rgba(0, 212, 255, 0.8);
			transform: translateY(-3px);
			box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4);
		}
	}
}

.screen-body {
	padding: 12px 15px;
	height: calc(100vh - 80px);
	display: grid;
	grid-template-columns: 0.8fr 1.5fr 0.8fr;
	gap: 12px;
	position: relative;
	z-index: 2;
}

.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.center-column {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.panel-card {
	background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 50, 100, 0.08) 100%);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 8px;
	overflow: hidden;
	backdrop-filter: blur(10px);
	display: flex;
	flex-direction: column;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, #00d4ff, #0096ff, transparent);
	}

	.card-header {
		padding: 6px 10px;
		background: linear-gradient(90deg, rgba(0, 150, 255, 0.1), transparent);
		border-bottom: 1px solid rgba(0, 212, 255, 0.15);
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;

		.header-icon {
			width: 3px;
			height: 12px;
			background: linear-gradient(180deg, #00d4ff, #0096ff);
			border-radius: 2px;
		}

		.card-title {
			flex: 1;
			font-size: 12px;
			font-weight: 600;
			color: #00d4ff;
			margin: 0;
			letter-spacing: 1px;
		}

		.header-line {
			flex: 1;
			height: 1px;
			background: linear-gradient(90deg, rgba(0, 212, 255, 0.3), transparent);
		}
	}

	.card-body {
		flex: 1;
		padding: 8px;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0;

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

			&:hover {
				background: rgba(0, 212, 255, 0.5);
			}
		}
	}

	&.compact-card {
		flex: 0.7;

		.card-header {
			padding: 8px 12px;

			.card-title {
				font-size: 13px;
			}
		}

		.compact-body {
			padding: 10px;

			.org-item,
			.rank-item {
				padding: 6px 8px;
			}

			.org-icon,
			.rank-number {
				width: 32px;
				height: 32px;
			}

			.org-name,
			.rank-name {
				font-size: 11px;
			}

			.org-stats span,
			.rank-detail span {
				font-size: 9px;
			}
		}
	}

	&.device-status-card {
		flex: 0 0 auto;
		max-height: 35%;
		min-height: 180px;
	}

	&.workorder-card {
		flex: 0 0 auto;
		max-height: 25%;
		min-height: 120px;
	}

	&.cost-progress-card {
		flex: 1;
		min-height: 150px;
	}

	&.company-card {
		flex: 0 0 auto;
		max-height: 40%;
		min-height: 200px;
	}

	&.warning-card {
		flex: 1;
		min-height: 150px;
	}

	&.map-card {
		flex: 1;
		min-height: 0;
	}
}

.device-status-chart {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;

	.chart-container {
		width: 100px;
		height: 100px;
		position: relative;
	}

	.chart-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;

		.center-value {
			font-size: 20px;
			font-weight: 700;
			color: #00d4ff;
			font-family: 'Orbitron', monospace;
		}

		.center-label {
			font-size: 9px;
			color: rgba(255, 255, 255, 0.6);
			margin-top: 1px;
		}
	}
}

.status-legend {
	display: flex;
	flex-direction: column;
	gap: 3px;
	width: 100%;

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 4px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.legend-dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			flex-shrink: 0;
		}

		.legend-label {
			flex: 1;
			color: rgba(255, 255, 255, 0.7);
			font-size: 10px;
		}

		.legend-value {
			color: #fff;
			font-weight: 600;
			font-size: 12px;
			font-family: 'Orbitron', monospace;
		}
	}
}

.workorder-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 6px;

	.workorder-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 5px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: scale(1.02);
		}

		.workorder-icon {
			width: 28px;
			height: 28px;
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.workorder-info {
			.workorder-value {
				font-size: 14px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.workorder-label {
				font-size: 9px;
				color: rgba(255, 255, 255, 0.6);
				margin-top: 1px;
			}
		}
	}
}

.cost-progress-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-height: 100%;
	overflow: hidden;
	padding-right: 4px;
	position: relative;

	&.auto-scroll {
		overflow: hidden;

		.scroll-content {
			animation: costScrollUp 12s linear infinite;
		}
	}

	.scroll-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.cost-progress-item {
		padding: 6px 8px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 5px;
		transition: all 0.3s ease;
		flex-shrink: 0;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.cost-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 4px;

			.cost-name {
				color: #fff;
				font-size: 10px;
				font-weight: 500;
			}

			.cost-total {
				color: #00d4ff;
				font-size: 9px;
			}
		}

		.progress-bar-wrapper {
			display: flex;
			align-items: center;
			gap: 8px;

			.progress-track {
				flex: 1;
				height: 5px;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 3px;
				overflow: hidden;

				.progress-fill {
					height: 100%;
					border-radius: 3px;
					transition: width 1s ease;
				}
			}

			.progress-percent {
				color: #fff;
				font-size: 11px;
				font-weight: 600;
				min-width: 35px;
				text-align: right;
				font-family: 'Orbitron', monospace;
			}
		}
	}
}

@keyframes costScrollUp {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(-50%);
	}
}

.center-top {
	flex-shrink: 0;
	padding: 15px 0;

	.stat-panel {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15px;

		.stat-item {
			height: 100px;
			border-radius: 12px;
			padding: 15px 18px;
			display: flex;
			align-items: center;
			gap: 15px;
			transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
			position: relative;
			overflow: hidden;
			cursor: pointer;

			.stat-bg {
				position: absolute;
				inset: 0;
				background: linear-gradient(135deg, rgba(0, 150, 255, 0.12) 0%, rgba(0, 50, 100, 0.08) 100%);
				border: 1px solid rgba(0, 212, 255, 0.25);
				border-radius: 12px;
				transition: all 0.5s ease;
			}

			.stat-glow {
				position: absolute;
				inset: -2px;
				background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), transparent, rgba(0, 150, 255, 0.15));
				border-radius: 14px;
				opacity: 0;
				transition: opacity 0.5s ease;
				filter: blur(8px);
			}

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 2px;
				background: linear-gradient(90deg, transparent, #00d4ff, #0096ff, transparent);
				animation: headerGlow 2s ease-in-out infinite;
			}

			&::after {
				content: '';
				position: absolute;
				top: -50%;
				left: -50%;
				width: 200%;
				height: 200%;
				background: conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.1), transparent 30%);
				animation: rotate 4s linear infinite;
				opacity: 0;
				transition: opacity 0.5s ease;
			}

			&:hover {
				transform: translateY(-8px) scale(1.02);

				.stat-bg {
					border-color: rgba(0, 212, 255, 0.5);
					background: linear-gradient(135deg, rgba(0, 150, 255, 0.2) 0%, rgba(0, 50, 100, 0.15) 100%);
				}

				.stat-glow {
					opacity: 1;
				}

				&::after {
					opacity: 1;
				}

				.stat-icon-wrapper {
					.icon-ring {
						transform: scale(1.3);
						opacity: 1;
					}

					.stat-icon {
						transform: scale(1.1);
						box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
					}
				}

				.stat-value {
					transform: scale(1.05);
					text-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
				}

				.stat-decoration {
					.deco-line {
						width: 100%;
					}

					.deco-dot {
						animation: dotPulse 1s ease-in-out infinite;
					}
				}
			}

			.stat-icon-wrapper {
				position: relative;
				width: 50px;
				height: 50px;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				z-index: 1;

				.stat-icon {
					width: 46px;
					height: 46px;
					border-radius: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #fff;
					transition: all 0.5s ease;
					position: relative;
					z-index: 2;
					box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
				}

				.icon-ring {
					position: absolute;
					inset: -4px;
					border: 2px solid rgba(0, 212, 255, 0.3);
					border-radius: 16px;
					opacity: 0;
					transition: all 0.5s ease;
					animation: ringPulse 2s ease-in-out infinite;
				}
			}

			.stat-content {
				flex: 1;
				position: relative;
				z-index: 1;
				display: flex;
				flex-direction: column;
				gap: 4px;

				.stat-label {
					font-size: 12px;
					color: rgba(255, 255, 255, 0.65);
					letter-spacing: 1px;
					text-transform: uppercase;
					font-weight: 500;
				}

				.stat-value {
					font-size: 26px;
					font-weight: 700;
					color: #fff;
					font-family: 'Orbitron', monospace;
					letter-spacing: 1px;
					transition: all 0.5s ease;
					line-height: 1;
				}

				.stat-trend {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					font-size: 11px;
					font-weight: 600;
					padding: 3px 8px;
					border-radius: 10px;
					width: fit-content;
					margin-top: 2px;
					transition: all 0.3s ease;

					&.up {
						color: #10b981;
						background: rgba(16, 185, 129, 0.15);
						border: 1px solid rgba(16, 185, 129, 0.3);
					}

					&.down {
						color: #ef4444;
						background: rgba(239, 68, 68, 0.15);
						border: 1px solid rgba(239, 68, 68, 0.3);
					}
				}
			}

			.stat-decoration {
				position: absolute;
				right: 15px;
				bottom: 10px;
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 4px;
				z-index: 1;
				opacity: 0.6;

				.deco-line {
					width: 30px;
					height: 2px;
					background: linear-gradient(90deg, rgba(0, 212, 255, 0.5), transparent);
					transition: width 0.5s ease;
				}

				.deco-dot {
					width: 4px;
					height: 4px;
					background: #00d4ff;
					border-radius: 50%;
					box-shadow: 0 0 6px #00d4ff;
				}
			}
		}
	}
}

@keyframes headerGlow {
	0%,
	100% {
		opacity: 0.5;
	}
	50% {
		opacity: 1;
	}
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes ringPulse {
	0%,
	100% {
		opacity: 0.3;
		transform: scale(1);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.1);
	}
}

@keyframes dotPulse {
	0%,
	100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.5);
		opacity: 0.5;
	}
}

.center-map {
	flex: 1;
	min-height: 0;

	.map-card {
		height: 100%;

		.card-body {
			padding: 0;
		}

		.map-chart {
			width: 100%;
			height: 100%;
			min-height: 200px;
		}
	}
}

.warning-container {
	display: flex;
	flex-direction: column;
	gap: 5px;
	max-height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	padding-right: 4px;

	&::-webkit-scrollbar {
		width: 3px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(0, 212, 255, 0.1);
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
		border-radius: 2px;

		&:hover {
			background: rgba(0, 212, 255, 0.5);
		}
	}

	.warning-item {
		padding: 6px 8px;
		background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 50, 100, 0.05) 100%);
		border: 1px solid rgba(0, 212, 255, 0.15);
		border-radius: 6px;
		transition: all 0.3s ease;
		flex-shrink: 0;

		&:hover {
			background: linear-gradient(135deg, rgba(0, 150, 255, 0.15) 0%, rgba(0, 50, 100, 0.1) 100%);
			border-color: rgba(0, 212, 255, 0.3);
		}

		.warning-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 5px;

			.warning-name {
				font-size: 11px;
				font-weight: 600;
				color: #fff;
			}

			.warning-level {
				display: flex;
				align-items: center;
				gap: 3px;
				padding: 2px 8px;
				border-radius: 8px;
				font-size: 10px;
				font-weight: 600;

				&.danger {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.15);
					border: 1px solid rgba(239, 68, 68, 0.3);
				}

				&.warning {
					color: #f59e0b;
					background: rgba(245, 158, 11, 0.15);
					border: 1px solid rgba(245, 158, 11, 0.3);
				}
			}
		}

		.warning-progress {
			.warning-bar {
				height: 6px;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 3px;
				overflow: hidden;
				margin-bottom: 4px;

				.warning-fill {
					height: 100%;
					border-radius: 3px;
					transition: width 1s ease;
				}
			}

			.warning-stats {
				display: flex;
				justify-content: space-between;

				span {
					font-size: 10px;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}
	}
}

.company-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	padding-right: 4px;

	&::-webkit-scrollbar {
		width: 3px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(0, 212, 255, 0.1);
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 212, 255, 0.3);
		border-radius: 2px;

		&:hover {
			background: rgba(0, 212, 255, 0.5);
		}
	}

	.company-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 50, 100, 0.05) 100%);
		border: 1px solid rgba(0, 212, 255, 0.15);
		border-radius: 6px;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		flex-shrink: 0;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 3px;
			background: linear-gradient(180deg, #00d4ff, #0096ff);
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		&:hover {
			background: linear-gradient(135deg, rgba(0, 150, 255, 0.15) 0%, rgba(0, 50, 100, 0.1) 100%);
			border-color: rgba(0, 212, 255, 0.3);
			transform: translateX(5px);

			&::before {
				opacity: 1;
			}
		}

		.company-icon {
			width: 32px;
			height: 32px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

			.el-icon {
				font-size: 16px;
			}
		}

		.company-info {
			flex: 1;

			.company-name {
				color: #fff;
				font-size: 11px;
				font-weight: 600;
				margin-bottom: 2px;
				letter-spacing: 1px;
			}

			.company-stats {
				display: flex;
				gap: 12px;

				span {
					font-size: 10px;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}

		.company-badge {
			padding: 3px 8px;
			background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
			border: 1px solid rgba(16, 185, 129, 0.3);
			border-radius: 10px;
			font-size: 9px;
			color: #10b981;
			font-weight: 500;
		}
	}
}

@keyframes pulse {
	0%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

@media screen and (max-width: 1600px) {
	.screen-header {
		height: 70px;
		padding: 0 25px;

		.main-title {
			font-size: 26px;
			letter-spacing: 2px;
		}

		.subtitle {
			font-size: 12px;
		}

		.time-box {
			.time {
				font-size: 28px;
			}

			.date {
				font-size: 12px;
			}
		}

		.more-btn {
			padding: 10px 18px;
			font-size: 13px;
		}

		.logo-box .logo {
			height: 40px;
		}
	}

	.screen-body {
		padding: 8px 12px;
		height: calc(100vh - 70px);
		gap: 8px;
		grid-template-columns: 0.75fr 1.4fr 0.75fr;
	}

	.panel-card {
		.card-header {
			padding: 10px 12px;

			.card-title {
				font-size: 13px;
			}
		}

		.card-body {
			padding: 10px;
		}
	}

	.center-top .stat-panel {
		gap: 10px;

		.stat-item {
			padding: 12px;

			.stat-icon {
				width: 48px;
				height: 48px;
			}

			.stat-content {
				.stat-value {
					font-size: 22px;
				}

				.stat-label {
					font-size: 11px;
				}
			}

			.stat-trend {
				font-size: 11px;
				padding: 4px 8px;
			}
		}
	}

	.device-status-chart {
		.chart-container {
			width: 130px;
			height: 130px;
		}

		.chart-center .center-value {
			font-size: 26px;
		}
	}

	.workorder-grid .workorder-item {
		padding: 10px;

		.workorder-icon {
			width: 36px;
			height: 36px;
		}

		.workorder-info {
			.workorder-value {
				font-size: 18px;
			}

			.workorder-label {
				font-size: 10px;
			}
		}
	}

	.more-entrance-card {
		padding: 15px;

		.more-entrance-content {
			gap: 15px;

			.more-entrance-icon {
				width: 70px;
				height: 70px;
			}

			.more-entrance-text {
				.more-entrance-title {
					font-size: 22px;
				}

				.more-entrance-desc {
					font-size: 11px;
				}
			}
		}
	}

	.center-map .map-card .map-chart {
		min-height: 220px;
	}
}

@media screen and (max-width: 1366px) {
	.screen-header {
		height: 60px;
		padding: 0 20px;

		.title-wrapper {
			gap: 15px;

			.title-decoration {
				width: 80px;
			}
		}

		.main-title {
			font-size: 22px;
		}

		.subtitle {
			font-size: 11px;
		}

		.time-box {
			.time {
				font-size: 24px;
			}

			.date {
				font-size: 11px;
			}
		}

		.more-btn {
			padding: 8px 14px;
			font-size: 12px;
		}

		.logo-box .logo {
			height: 35px;
		}
	}

	.screen-body {
		padding: 6px 10px;
		height: calc(100vh - 60px);
		gap: 6px;
		grid-template-columns: 0.7fr 1.3fr 0.7fr;
	}

	.left-column,
	.right-column {
		gap: 6px;
	}

	.center-column {
		gap: 6px;
	}

	.panel-card {
		.card-header {
			padding: 8px 10px;

			.header-icon {
				width: 3px;
				height: 14px;
			}

			.card-title {
				font-size: 12px;
				letter-spacing: 1px;
			}
		}

		.card-body {
			padding: 8px;
		}
	}

	.center-top .stat-panel {
		gap: 8px;

		.stat-item {
			padding: 10px;
			gap: 10px;

			.stat-icon {
				width: 40px;
				height: 40px;

				.el-icon {
					font-size: 24px;
				}
			}

			.stat-content {
				.stat-value {
					font-size: 18px;
				}

				.stat-label {
					font-size: 10px;
				}
			}

			.stat-trend {
				font-size: 10px;
				padding: 3px 6px;
			}
		}
	}

	.device-status-chart {
		gap: 10px;

		.chart-container {
			width: 110px;
			height: 110px;
		}

		.chart-center .center-value {
			font-size: 22px;
		}

		.chart-center .center-label {
			font-size: 10px;
		}
	}

	.status-legend .legend-item {
		padding: 6px 10px;

		.legend-label {
			font-size: 11px;
		}

		.legend-value {
			font-size: 14px;
		}
	}

	.workorder-grid {
		gap: 8px;

		.workorder-item {
			padding: 8px;
			gap: 8px;

			.workorder-icon {
				width: 32px;
				height: 32px;

				.el-icon {
					font-size: 18px;
				}
			}

			.workorder-info {
				.workorder-value {
					font-size: 16px;
				}

				.workorder-label {
					font-size: 9px;
				}
			}
		}
	}

	.cost-progress-list {
		gap: 8px;

		.cost-progress-item {
			padding: 8px;

			.cost-header {
				.cost-name {
					font-size: 11px;
				}

				.cost-total {
					font-size: 10px;
				}
			}

			.progress-bar-wrapper .progress-percent {
				font-size: 10px;
			}
		}
	}

	.center-map .map-card .map-chart {
		min-height: 180px;
	}
}

@media screen and (max-width: 1200px) {
	.screen-header {
		height: 55px;
		padding: 0 15px;

		.title-wrapper {
			gap: 10px;

			.title-decoration {
				width: 60px;
			}
		}

		.main-title {
			font-size: 18px;
		}

		.subtitle {
			font-size: 10px;
		}

		.time-box {
			.time {
				font-size: 20px;
			}

			.date {
				font-size: 10px;
			}
		}

		.more-btn {
			padding: 6px 12px;
			font-size: 11px;
			gap: 5px;
		}

		.logo-box .logo {
			height: 30px;
		}
	}

	.screen-body {
		padding: 5px 8px;
		height: calc(100vh - 55px);
		gap: 5px;
		grid-template-columns: 0.65fr 1.2fr 0.65fr;
	}

	.left-column,
	.right-column {
		gap: 5px;
	}

	.center-column {
		gap: 5px;
	}

	.panel-card {
		border-radius: 6px;

		.card-header {
			padding: 6px 8px;

			.header-icon {
				width: 3px;
				height: 12px;
			}

			.card-title {
				font-size: 11px;
			}
		}

		.card-body {
			padding: 6px;
		}
	}

	.center-top .stat-panel {
		gap: 6px;

		.stat-item {
			padding: 8px;
			gap: 8px;

			.stat-icon {
				width: 36px;
				height: 36px;

				.el-icon {
					font-size: 20px;
				}
			}

			.stat-content {
				.stat-value {
					font-size: 16px;
				}

				.stat-label {
					font-size: 9px;
				}
			}

			.stat-trend {
				font-size: 9px;
				padding: 2px 5px;
			}
		}
	}

	.device-status-chart {
		gap: 8px;

		.chart-container {
			width: 90px;
			height: 90px;
		}

		.chart-center .center-value {
			font-size: 18px;
		}

		.chart-center .center-label {
			font-size: 9px;
		}
	}

	.status-legend .legend-item {
		padding: 5px 8px;

		.legend-dot {
			width: 8px;
			height: 8px;
		}

		.legend-label {
			font-size: 10px;
		}

		.legend-value {
			font-size: 12px;
		}
	}

	.workorder-grid {
		gap: 6px;

		.workorder-item {
			padding: 6px;
			gap: 6px;

			.workorder-icon {
				width: 28px;
				height: 28px;

				.el-icon {
					font-size: 16px;
				}
			}

			.workorder-info {
				.workorder-value {
					font-size: 14px;
				}

				.workorder-label {
					font-size: 8px;
				}
			}
		}
	}

	.cost-progress-list {
		gap: 6px;

		.cost-progress-item {
			padding: 6px;

			.cost-header {
				margin-bottom: 5px;

				.cost-name {
					font-size: 10px;
				}

				.cost-total {
					font-size: 9px;
				}
			}

			.progress-bar-wrapper {
				gap: 8px;

				.progress-track {
					height: 5px;
				}

				.progress-percent {
					font-size: 9px;
					min-width: 35px;
				}
			}
		}
	}

	.center-map .map-card .map-chart {
		min-height: 150px;
	}

	.corner-decoration {
		width: 80px;
		height: 80px;

		&.corner-tl::before,
		&.corner-tr::before,
		&.corner-bl::before,
		&.corner-br::before {
			height: 30px;
		}

		&.corner-tl::after,
		&.corner-tr::after,
		&.corner-bl::after,
		&.corner-br::after {
			width: 30px;
		}
	}
}

@media screen and (max-width: 992px) {
	.screen-header {
		height: 50px;
		padding: 0 10px;

		.header-left {
			display: none;
		}

		.header-center {
			flex: 1;
		}

		.title-wrapper {
			gap: 8px;

			.title-decoration {
				width: 40px;
			}
		}

		.main-title {
			font-size: 16px;
		}

		.subtitle {
			font-size: 9px;
		}

		.time-box {
			.time {
				font-size: 18px;
			}

			.date {
				font-size: 9px;
			}
		}

		.more-btn {
			padding: 5px 10px;
			font-size: 10px;
		}
	}

	.screen-body {
		padding: 5px 8px;
		height: calc(100vh - 50px);
		gap: 5px;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto 1fr;
	}

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
		gap: 8px;

		.panel-card {
			flex: 1;
		}
	}

	.center-top .stat-panel {
		grid-template-columns: repeat(2, 1fr);
	}

	.more-entrance-card {
		flex: 1;
		min-height: 80px;
	}

	.corner-decoration {
		display: none;
	}
}

@media screen and (max-width: 768px) {
	.screen-header {
		height: 45px;
		padding: 0 8px;

		.title-wrapper {
			gap: 5px;

			.title-decoration {
				width: 25px;
			}
		}

		.main-title {
			font-size: 14px;
			letter-spacing: 1px;
		}

		.subtitle {
			display: none;
		}

		.time-box {
			.time {
				font-size: 16px;
			}

			.date {
				font-size: 8px;
			}
		}

		.more-btn {
			padding: 4px 8px;
			font-size: 9px;
			border-radius: 15px;

			.el-icon {
				font-size: 12px;
			}
		}
	}

	.screen-body {
		padding: 4px 6px;
		height: calc(100vh - 45px);
		gap: 4px;
		grid-template-columns: 1fr;
		grid-template-rows: auto auto auto auto;
	}

	.left-column {
		grid-column: 1;
		grid-row: 1;
		flex-direction: row;
		gap: 6px;

		.panel-card {
			flex: 1;
		}
	}

	.center-column {
		grid-column: 1;
		grid-row: 2;
	}

	.right-column {
		grid-column: 1;
		grid-row: 3;
		flex-direction: column;
	}

	.center-top .stat-panel {
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;

		.stat-item {
			padding: 6px;
			gap: 6px;

			.stat-icon {
				width: 30px;
				height: 30px;

				.el-icon {
					font-size: 16px;
				}
			}

			.stat-content {
				.stat-value {
					font-size: 14px;
				}

				.stat-label {
					font-size: 8px;
				}
			}

			.stat-trend {
				font-size: 8px;
				padding: 2px 4px;
			}
		}
	}

	.panel-card {
		.card-header {
			padding: 5px 6px;

			.header-icon {
				width: 2px;
				height: 10px;
			}

			.card-title {
				font-size: 10px;
			}
		}

		.card-body {
			padding: 5px;
		}
	}

	.device-status-chart {
		flex-direction: row;
		gap: 10px;

		.chart-container {
			width: 70px;
			height: 70px;
		}

		.chart-center .center-value {
			font-size: 14px;
		}
	}

	.status-legend {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 4px;

		.legend-item {
			padding: 3px 6px;

			.legend-label {
				font-size: 9px;
			}

			.legend-value {
				font-size: 10px;
			}
		}
	}

	.workorder-grid {
		grid-template-columns: repeat(4, 1fr);
		gap: 4px;

		.workorder-item {
			padding: 4px;
			flex-direction: column;
			gap: 2px;
			align-items: center;
			text-align: center;

			.workorder-icon {
				width: 24px;
				height: 24px;

				.el-icon {
					font-size: 12px;
				}
			}

			.workorder-info {
				.workorder-value {
					font-size: 12px;
				}

				.workorder-label {
					font-size: 7px;
				}
			}
		}
	}

	.cost-progress-list {
		gap: 4px;

		.cost-progress-item {
			padding: 4px;

			.cost-header {
				margin-bottom: 3px;

				.cost-name {
					font-size: 9px;
				}

				.cost-total {
					font-size: 8px;
				}
			}

			.progress-bar-wrapper {
				gap: 5px;

				.progress-track {
					height: 4px;
				}

				.progress-percent {
					font-size: 8px;
					min-width: 30px;
				}
			}
		}
	}

	.center-map .map-card .map-chart {
		min-height: 120px;
	}
}
</style>
