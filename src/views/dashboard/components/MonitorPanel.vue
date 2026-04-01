<template>
	<div class="monitor-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队维修短接统计</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeType === 'day' }" @click="timeType = 'day'">日</span>
							<span class="time-tab" :class="{ active: timeType === 'month' }" @click="timeType = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeType === 'year' }" @click="timeType = 'year'">年</span>
						</div>
					</div>
					<div class="card-body">
						<div class="short-stats">
							<div class="short-stat-item" v-for="item in shortStats" :key="item.label">
								<div class="short-icon" :style="{ background: item.color }">
									<el-icon :size="24"><component :is="item.icon" /></el-icon>
								</div>
								<div class="short-info">
									<div class="short-value">{{ item.value }}</div>
									<div class="short-label">{{ item.label }}</div>
								</div>
							</div>
						</div>
						<div class="short-list">
							<div class="short-list-item" v-for="item in shortList" :key="item.name">
								<div class="short-name">{{ item.name }}</div>
								<div class="short-counts">
									<span class="count-item">
										<span class="count-dot" style="background: #10b981"></span>
										{{ item.normal }}个
									</span>
									<span class="count-item">
										<span class="count-dot" style="background: #f59e0b"></span>
										{{ item.warning }}个
									</span>
									<span class="count-item">
										<span class="count-dot" style="background: #ef4444"></span>
										{{ item.danger }}个
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">东区维修中心</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="device-list">
							<div class="device-list-item" v-for="item in eastDeviceList" :key="item.name">
								<div class="device-info">
									<div class="device-name">{{ item.name }}</div>
									<div class="device-detail">
										<span>设备总数: {{ item.total }}</span>
										<span>短接总数: {{ item.short }}</span>
										<span>未短接数: {{ item.unshort }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card center-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">中心设备告警统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="center-chart-wrapper">
							<div ref="centerChartRef" class="center-chart"></div>
							<div class="chart-center-info">
								<div class="center-value">{{ centerStats.total }}</div>
								<div class="center-label">监测设备总数</div>
							</div>
						</div>
						<div class="status-indicators">
							<div class="status-item left">
								<div class="status-icon danger">
									<el-icon><Warning /></el-icon>
								</div>
								<div class="status-info">
									<div class="status-value">{{ centerStats.danger }}</div>
									<div class="status-label">故障</div>
								</div>
							</div>
							<div class="status-item right">
								<div class="status-icon warning">
									<el-icon><CircleClose /></el-icon>
								</div>
								<div class="status-info">
									<div class="status-value">{{ centerStats.stopped }}</div>
									<div class="status-label">急停</div>
								</div>
							</div>
							<div class="status-item left bottom">
								<div class="status-icon info">
									<el-icon><Clock /></el-icon>
								</div>
								<div class="status-info">
									<div class="status-value">{{ centerStats.standby }}</div>
									<div class="status-label">待机</div>
								</div>
							</div>
							<div class="status-item right bottom">
								<div class="status-icon success">
									<el-icon><CircleCheck /></el-icon>
								</div>
								<div class="status-info">
									<div class="status-value">{{ centerStats.running }}</div>
									<div class="status-label">运行</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队设备告警统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="team-alert-tabs">
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
						<div class="alert-summary">
							<div class="alert-item">
								<span class="alert-label">告警总数</span>
								<span class="alert-value">{{ alertStats.total }}次</span>
							</div>
							<div class="alert-levels">
								<div class="level-item">
									<div class="level-dot level-0"></div>
									<span>0级: {{ alertStats.level0 }}</span>
								</div>
								<div class="level-item">
									<div class="level-dot level-1"></div>
									<span>1级: {{ alertStats.level1 }}</span>
								</div>
								<div class="level-item">
									<div class="level-dot level-2"></div>
									<span>2级: {{ alertStats.level2 }}</span>
								</div>
								<div class="level-item">
									<div class="level-dot level-3"></div>
									<span>3级: {{ alertStats.level3 }}</span>
								</div>
							</div>
						</div>
						<div class="alert-table">
							<div class="table-header">
								<span>设备名称</span>
								<span>告警名称</span>
								<span>告警内容</span>
								<span>报警时间</span>
							</div>
							<div class="table-body">
								<div class="table-row" v-for="item in alertList" :key="item.id">
									<span>{{ item.deviceName }}</span>
									<span>{{ item.alertName }}</span>
									<span>{{ item.alertContent }}</span>
									<span>{{ item.alertTime }}</span>
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
import { Warning, CircleCheck, CircleClose, Clock, Document, Operation } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const timeType = ref('day')
const activeTeam = ref('南区维修中心')
const centerChartRef = ref(null)
let centerChart = null

const teams = ref(['南区维修中心', '东区维修中心', '西区维修中心', '岚中维修中心', '岚南维修中心'])

const shortStats = ref([
	{ label: '短接总数', value: 0, icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '已处理', value: 0, icon: 'CircleCheck', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
	{ label: '未处理', value: 0, icon: 'Clock', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
])

const shortList = ref([
	{ name: '南区维修中心', normal: 0, warning: 0, danger: 0 },
	{ name: '东区维修中心', normal: 0, warning: 0, danger: 0 },
	{ name: '西区维修中心', normal: 0, warning: 0, danger: 0 },
	{ name: '岚南维修中心', normal: 0, warning: 0, danger: 0 },
	{ name: '岚中维修中心', normal: 0, warning: 0, danger: 0 },
])

const eastDeviceList = ref([
	{ name: '第一包机组', total: 111, short: 0, unshort: 111, alert: 0, person: '张三' },
	{ name: '第六包机组', total: 59, short: 0, unshort: 59, alert: 0, person: '李四' },
	{ name: '第五包机组', total: 258, short: 0, unshort: 258, alert: 0, person: '王五' },
])

const centerStats = ref({
	total: 287,
	danger: 0,
	stopped: 0,
	standby: 0,
	running: 115,
})

const alertStats = ref({
	total: 0,
	level0: 0,
	level1: 0,
	level2: 0,
	level3: 0,
})

const alertList = ref([])

const initCenterChart = () => {
	if (!centerChartRef.value) return
	centerChart = echarts.init(centerChartRef.value)

	const option = {
		series: [
			{
				type: 'pie',
				radius: ['60%', '80%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: centerStats.value.running, name: '运行', itemStyle: { color: '#10b981' } },
					{ value: centerStats.value.standby, name: '待机', itemStyle: { color: '#f59e0b' } },
					{ value: centerStats.value.danger, name: '故障', itemStyle: { color: '#ef4444' } },
					{ value: centerStats.value.stopped, name: '急停', itemStyle: { color: '#6b7280' } },
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

	centerChart.setOption(option)
}

const handleResize = () => {
	centerChart?.resize()
}

onMounted(() => {
	setTimeout(() => {
		initCenterChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	centerChart?.dispose()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.monitor-panel {
	width: 100%;
	height: 100%;
}

.screen-body {
	padding: 15px 20px;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1.4fr 1fr;
	gap: 15px;
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
}

.panel-card {
	background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 50, 100, 0.08) 100%);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 8px;
	overflow: hidden;
	backdrop-filter: blur(10px);
	display: flex;
	flex-direction: column;
	flex: 1;
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
		padding: 12px 15px;
		background: linear-gradient(90deg, rgba(0, 150, 255, 0.1), transparent);
		border-bottom: 1px solid rgba(0, 212, 255, 0.15);
		display: flex;
		align-items: center;
		gap: 10px;

		.header-icon {
			width: 4px;
			height: 16px;
			background: linear-gradient(180deg, #00d4ff, #0096ff);
			border-radius: 2px;
		}

		.card-title {
			flex: 1;
			font-size: 14px;
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

		.time-tabs {
			display: flex;
			gap: 5px;

			.time-tab {
				padding: 3px 10px;
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);
				cursor: pointer;
				border-radius: 3px;
				transition: all 0.3s ease;

				&:hover {
					color: #00d4ff;
				}

				&.active {
					background: rgba(0, 212, 255, 0.2);
					color: #00d4ff;
				}
			}
		}
	}

	.card-body {
		flex: 1;
		padding: 15px;
		overflow: hidden;
		min-height: 0;
	}
}

.short-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
	margin-bottom: 15px;

	.short-stat-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;

		.short-icon {
			width: 40px;
			height: 40px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.short-info {
			.short-value {
				font-size: 20px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.short-label {
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

.short-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.short-list-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.short-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 6px;
		}

		.short-counts {
			display: flex;
			gap: 10px;

			.count-item {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);

				.count-dot {
					width: 6px;
					height: 6px;
					border-radius: 50%;
				}
			}
		}
	}
}

.device-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.device-list-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.device-info {
			.device-name {
				color: #fff;
				font-size: 12px;
				font-weight: 500;
				margin-bottom: 6px;
			}

			.device-detail {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;

				span {
					font-size: 10px;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}
	}
}

.center-card {
	.card-body {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

.center-chart-wrapper {
	position: relative;
	width: 280px;
	height: 280px;

	.center-chart {
		width: 100%;
		height: 100%;
	}

	.chart-center-info {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;

		.center-value {
			font-size: 36px;
			font-weight: 700;
			color: #00d4ff;
			font-family: 'Orbitron', monospace;
		}

		.center-label {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.7);
			margin-top: 5px;
		}
	}
}

.status-indicators {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;

	.status-item {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 12px;
		pointer-events: auto;

		&.left {
			left: 20px;
			top: 30%;
		}

		&.right {
			right: 20px;
			top: 30%;
		}

		&.left.bottom {
			left: 20px;
			bottom: 15%;
		}

		&.right.bottom {
			right: 20px;
			bottom: 15%;
		}

		.status-icon {
			width: 50px;
			height: 50px;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

			&.danger {
				background: linear-gradient(135deg, #ef4444, #dc2626);
				box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
			}

			&.warning {
				background: linear-gradient(135deg, #f59e0b, #d97706);
				box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
			}

			&.info {
				background: linear-gradient(135deg, #3b82f6, #2563eb);
				box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
			}

			&.success {
				background: linear-gradient(135deg, #10b981, #059669);
				box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
			}
		}

		.status-info {
			.status-value {
				font-size: 24px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.status-label {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.7);
			}
		}
	}
}

.team-alert-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 12px;

	.team-tab {
		padding: 5px 10px;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(0, 212, 255, 0.2);
		transition: all 0.3s ease;

		&:hover {
			color: #00d4ff;
			border-color: rgba(0, 212, 255, 0.4);
		}

		&.active {
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			color: #00d4ff;
			border-color: rgba(0, 212, 255, 0.6);
			font-weight: 600;
		}
	}
}

.alert-summary {
	padding: 12px;
	background: rgba(255, 255, 255, 0.03);
	border-radius: 6px;
	margin-bottom: 12px;

	.alert-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;

		.alert-label {
			color: rgba(255, 255, 255, 0.7);
			font-size: 12px;
		}

		.alert-value {
			color: #00d4ff;
			font-size: 18px;
			font-weight: 700;
			font-family: 'Orbitron', monospace;
		}
	}

	.alert-levels {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;

		.level-item {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 11px;
			color: rgba(255, 255, 255, 0.7);

			.level-dot {
				width: 10px;
				height: 10px;
				border-radius: 50%;

				&.level-0 {
					background: #10b981;
				}

				&.level-1 {
					background: #f59e0b;
				}

				&.level-2 {
					background: #f97316;
				}

				&.level-3 {
					background: #ef4444;
				}
			}
		}
	}
}

.alert-table {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;

	.table-header {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 5px;
		padding: 10px 8px;
		background: rgba(0, 212, 255, 0.1);
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		color: #00d4ff;
		margin-bottom: 8px;
	}

	.table-body {
		flex: 1;
		overflow-y: auto;

		.table-row {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr;
			gap: 5px;
			padding: 8px;
			margin-bottom: 5px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 4px;
			font-size: 10px;
			color: rgba(255, 255, 255, 0.8);
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				transform: translateX(3px);
			}
		}

		&::-webkit-scrollbar {
			width: 4px;
		}

		&::-webkit-scrollbar-track {
			background: rgba(255, 255, 255, 0.05);
		}

		&::-webkit-scrollbar-thumb {
			background: rgba(0, 212, 255, 0.3);
			border-radius: 2px;
		}
	}
}
</style>
