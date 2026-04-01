<template>
	<div class="maintenance-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">维修工单统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="workorder-header">
							<div class="workorder-total">
								<div class="total-icon">
									<el-icon :size="32"><Document /></el-icon>
								</div>
								<div class="total-info">
									<div class="total-value">240</div>
									<div class="total-label">工单总数</div>
								</div>
							</div>
							<div class="workorder-status">
								<div class="status-item">
									<div class="status-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
										<el-icon :size="20"><Clock /></el-icon>
									</div>
									<div class="status-info">
										<div class="status-value">0</div>
										<div class="status-label">待处理</div>
									</div>
								</div>
								<div class="status-item">
									<div class="status-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
										<el-icon :size="20"><Operation /></el-icon>
									</div>
									<div class="status-info">
										<div class="status-value">234</div>
										<div class="status-label">进行中</div>
									</div>
								</div>
								<div class="status-item">
									<div class="status-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
										<el-icon :size="20"><CircleCheck /></el-icon>
									</div>
									<div class="status-info">
										<div class="status-value">3</div>
										<div class="status-label">已完成</div>
									</div>
								</div>
							</div>
						</div>
						<div class="workorder-list">
							<div class="workorder-list-item" v-for="item in workorderList" :key="item.name">
								<div class="workorder-name">{{ item.name }}</div>
								<div class="workorder-counts">
									<span>工单数: {{ item.total }}</span>
									<span>待处理: {{ item.pending }}</span>
									<span>进行中: {{ item.ongoing }}</span>
									<span>已完成: {{ item.completed }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队月度人均工时排名</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="rank-list">
							<div class="rank-item" v-for="(item, index) in workHourRank" :key="item.center">
								<div class="rank-badge" :class="'rank-' + (index + 1)">
									<span class="rank-number">{{ index + 1 }}</span>
								</div>
								<div class="rank-content">
									<div class="rank-name">{{ item.center }}</div>
									<div class="rank-detail">
										<span>维修中心: {{ item.personnel }}人</span>
										<span>总工时: {{ item.totalHours }}h</span>
									</div>
									<div class="rank-avg">
										<span>人均工时: {{ item.avgHours }}h/人/月</span>
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
						<h3 class="card-title">中心维修工单统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="center-workorder-wrapper">
							<div class="workorder-chart-container">
								<div ref="workorderChartRef" class="workorder-chart"></div>
								<div class="chart-center-info">
									<div class="center-value">{{ workorderStats.total }}</div>
									<div class="center-label">维保事项总数</div>
								</div>
							</div>
							<div class="workorder-side-stats">
								<div class="side-stat left">
									<div class="stat-icon pending">
										<el-icon :size="24"><Clock /></el-icon>
									</div>
									<div class="stat-info">
										<div class="stat-value">{{ workorderStats.pending }}</div>
										<div class="stat-label">待处理</div>
									</div>
								</div>
								<div class="side-stat right">
									<div class="stat-icon ongoing">
										<el-icon :size="24"><Operation /></el-icon>
									</div>
									<div class="stat-info">
										<div class="stat-value">{{ workorderStats.ongoing }}</div>
										<div class="stat-label">进行中</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">包机组工时排名</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeType === 'day' }" @click="timeType = 'day'">日</span>
							<span class="time-tab" :class="{ active: timeType === 'month' }" @click="timeType = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeType === 'year' }" @click="timeType = 'year'">年</span>
						</div>
					</div>
					<div class="card-body">
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
						<div class="team-hour-list">
							<div class="team-hour-item" v-for="item in teamHourList" :key="item.name">
								<div class="team-hour-name">{{ item.name }}</div>
								<div class="team-hour-detail">
									<span>总工时: {{ item.totalHours }}h</span>
									<span>巡检人数: {{ item.personnel }}人</span>
									<span>设备总数: {{ item.equipment }}台套</span>
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
						<h3 class="card-title">站队月度计划兑现率</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="fulfill-list">
							<div class="fulfill-item" v-for="item in fulfillList" :key="item.name">
								<div class="fulfill-name">{{ item.name }}</div>
								<div class="fulfill-bar">
									<div class="fulfill-track">
										<div class="fulfill-fill" :style="{ width: item.rate + '%' }"></div>
									</div>
									<span class="fulfill-rate">{{ item.rate }}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队月度计划进展统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="plan-stats">
							<div class="plan-stat-item">
								<div class="plan-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
									<el-icon :size="28"><Document /></el-icon>
								</div>
								<div class="plan-info">
									<div class="plan-value">169423</div>
									<div class="plan-label">年度计划总数</div>
								</div>
							</div>
							<div class="plan-stat-item">
								<div class="plan-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
									<el-icon :size="28"><Operation /></el-icon>
								</div>
								<div class="plan-info">
									<div class="plan-value">1291</div>
									<div class="plan-label">进行中</div>
								</div>
							</div>
							<div class="plan-stat-item">
								<div class="plan-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
									<el-icon :size="28"><CircleCheck /></el-icon>
								</div>
								<div class="plan-info">
									<div class="plan-value">168107</div>
									<div class="plan-label">按期完成</div>
								</div>
							</div>
							<div class="plan-stat-item">
								<div class="plan-icon" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)">
									<el-icon :size="28"><Clock /></el-icon>
								</div>
								<div class="plan-info">
									<div class="plan-value">25</div>
									<div class="plan-label">已逾期</div>
								</div>
							</div>
						</div>
						<div class="plan-list">
							<div class="plan-list-item" v-for="item in planList" :key="item.name">
								<div class="plan-list-name">{{ item.name }}</div>
								<div class="plan-list-counts">
									<span>年度计划: {{ item.yearly }}</span>
									<span>进行中: {{ item.ongoing }}</span>
									<span>按期完成: {{ item.completed }}</span>
									<span>已逾期: {{ item.overdue }}</span>
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
	Clock,
	Operation,
	CircleCheck,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const timeType = ref('month')
const activeTeam = ref('南区维修中心')
const workorderChartRef = ref(null)
let workorderChart = null

const teams = ref(['南区维修中心', '东区维修中心', '西区维修中心', '岚南维修中心', '岚中维修中心'])

const workorderStats = ref({
	total: 153537,
	pending: 544,
	ongoing: 3991,
})

const workorderList = ref([
	{ name: '维修中心', total: 59, pending: 0, ongoing: 59, completed: 0 },
	{ name: '东区维修中心', total: 62, pending: 0, ongoing: 62, completed: 0 },
	{ name: '西区维修中心', total: 43, pending: 0, ongoing: 42, completed: 1 },
	{ name: '南区维修中心', total: 42, pending: 0, ongoing: 41, completed: 1 },
	{ name: '岚南维修中心', total: 40, pending: 0, ongoing: 40, completed: 0 },
])

const workHourRank = ref([
	{ center: '东区维修中心', personnel: '59331.52', totalHours: '59331.52', avgHours: '3318.63' },
	{ center: '岚南维修中心', personnel: '28693.36', totalHours: '28693.36', avgHours: '1.50' },
	{ center: '西区维修中心', personnel: '27083.43', totalHours: '27083.43', avgHours: '0.93' },
	{ center: '南区维修中心', personnel: '27835.49', totalHours: '27835.49', avgHours: '0.00' },
	{ center: '岚中维修中心', personnel: '6931.32', totalHours: '6931.32', avgHours: '0.00' },
])

const teamHourList = ref([
	{ name: '第一包机组', totalHours: '1.37', personnel: '4', equipment: '111' },
	{ name: '第六包机组', totalHours: '0.35', personnel: '0', equipment: '59' },
	{ name: '第五包机组', totalHours: '0.45', personnel: '0', equipment: '258' },
])

const fulfillList = ref([
	{ name: '西区维修中心', rate: 99.51 },
	{ name: '东区维修中心', rate: 99.04 },
	{ name: '岚南维修中心', rate: 99.79 },
	{ name: '南区维修中心', rate: 99.34 },
	{ name: '岚中维修中心', rate: 53.13 },
])

const planList = ref([
	{ name: '东区维修中心', yearly: '57284', ongoing: '528', completed: '56532', overdue: '1' },
	{ name: '西区维修中心', yearly: '49503', ongoing: '477', completed: '49026', overdue: '6' },
	{ name: '岚南维修中心', yearly: '32650', ongoing: '176', completed: '32471', overdue: '1' },
	{ name: '南区维修中心', yearly: '27051', ongoing: '110', completed: '27035', overdue: '20' },
	{ name: '岚中维修中心', yearly: '2935', ongoing: '0', completed: '2934', overdue: '0' },
])

const initWorkorderChart = () => {
	if (!workorderChartRef.value) return
	workorderChart = echarts.init(workorderChartRef.value)

	const option = {
		series: [
			{
				type: 'pie',
				radius: ['55%', '75%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: [
					{ value: workorderStats.value.pending, name: '待处理', itemStyle: { color: '#f59e0b' } },
					{ value: workorderStats.value.ongoing, name: '进行中', itemStyle: { color: '#3b82f6' } },
					{ value: workorderStats.value.total - workorderStats.value.pending - workorderStats.value.ongoing, name: '已完成', itemStyle: { color: '#10b981' } },
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
	workorderChart.setOption(option)
}

const handleResize = () => {
	workorderChart?.resize()
}

onMounted(() => {
	setTimeout(() => {
		initWorkorderChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	workorderChart?.dispose()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.maintenance-panel {
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
	gap: 15px;
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

.workorder-header {
	margin-bottom: 15px;

	.workorder-total {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		margin-bottom: 12px;

		.total-icon {
			width: 55px;
			height: 55px;
			border-radius: 12px;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			display: flex;
			align-items: center;
			justify-content: center;
			color: #00d4ff;
		}

		.total-info {
			.total-value {
				font-size: 32px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.total-label {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}

	.workorder-status {
		display: flex;
		justify-content: space-around;
		gap: 10px;

		.status-item {
			display: flex;
			align-items: center;
			gap: 10px;
			flex: 1;
			padding: 10px;
			background: rgba(255, 255, 255, 0.03);
			border-radius: 6px;

			.status-icon {
				width: 40px;
				height: 40px;
				border-radius: 8px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				flex-shrink: 0;
			}

			.status-info {
				.status-value {
					font-size: 20px;
					font-weight: 700;
					color: #fff;
					font-family: 'Orbitron', monospace;
				}

				.status-label {
					font-size: 11px;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}
	}
}

.workorder-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.workorder-list-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.workorder-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 6px;
		}

		.workorder-counts {
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

.rank-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.rank-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.rank-badge {
			width: 60px;
			height: 60px;
			border-radius: 10px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.rank-number {
				font-size: 22px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			&.rank-1 {
				background: linear-gradient(135deg, #fbbf24, #f59e0b);
				box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
			}

			&.rank-2 {
				background: linear-gradient(135deg, #9ca3af, #6b7280);
				box-shadow: 0 0 20px rgba(156, 163, 175, 0.4);
			}

			&.rank-3 {
				background: linear-gradient(135deg, #cd7f32, #b5651d);
				box-shadow: 0 0 20px rgba(205, 127, 50, 0.4);
			}

			&.rank-4,
			&.rank-5 {
				background: rgba(0, 212, 255, 0.2);
				border: 1px solid rgba(0, 212, 255, 0.4);
			}
		}

		.rank-content {
			flex: 1;

			.rank-name {
				color: #fff;
				font-size: 14px;
				font-weight: 600;
				margin-bottom: 6px;
			}

			.rank-detail {
				display: flex;
				gap: 15px;
				margin-bottom: 4px;

				span {
					font-size: 11px;
					color: rgba(255, 255, 255, 0.6);
				}
			}

			.rank-avg {
				span {
					font-size: 12px;
					color: #00d4ff;
					font-weight: 500;
				}
			}
		}
	}
}

.center-card {
	flex: 1.2;
}

.center-workorder-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	position: relative;

	.workorder-chart-container {
		position: relative;
		width: 280px;
		height: 280px;

		.workorder-chart {
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

	.workorder-side-stats {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;

		.side-stat {
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

			.stat-icon {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);

				&.pending {
					background: linear-gradient(135deg, #f59e0b, #d97706);
					box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
				}

				&.ongoing {
					background: linear-gradient(135deg, #3b82f6, #2563eb);
					box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
				}
			}

			.stat-info {
				.stat-value {
					font-size: 24px;
					font-weight: 700;
					color: #fff;
					font-family: 'Orbitron', monospace;
				}

				.stat-label {
					font-size: 12px;
					color: rgba(255, 255, 255, 0.7);
				}
			}
		}
	}
}

.team-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 12px;

	.team-tab {
		padding: 6px 12px;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		border-radius: 15px;
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

.team-hour-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.team-hour-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.team-hour-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 6px;
		}

		.team-hour-detail {
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

.fulfill-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.fulfill-item {
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.fulfill-name {
			color: #fff;
			font-size: 13px;
			font-weight: 500;
			margin-bottom: 10px;
		}

		.fulfill-bar {
			display: flex;
			align-items: center;
			gap: 10px;

			.fulfill-track {
				flex: 1;
				height: 8px;
				background: rgba(255, 255, 255, 0.1);
				border-radius: 4px;
				overflow: hidden;

				.fulfill-fill {
					height: 100%;
					background: linear-gradient(90deg, #43e97b, #38f9d7);
					border-radius: 4px;
					transition: width 1s ease;
				}
			}

			.fulfill-rate {
				color: #00d4ff;
				font-size: 16px;
				font-weight: 700;
				min-width: 55px;
				text-align: right;
				font-family: 'Orbitron', monospace;
			}
		}
	}
}

.plan-stats {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 10px;
	margin-bottom: 15px;

	.plan-stat-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateY(-3px);
		}

		.plan-icon {
			width: 50px;
			height: 50px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.plan-info {
			.plan-value {
				font-size: 20px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.plan-label {
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);
				margin-top: 3px;
			}
		}
	}
}

.plan-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.plan-list-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.plan-list-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 6px;
		}

		.plan-list-counts {
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
</style>
