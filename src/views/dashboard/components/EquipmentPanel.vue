<template>
	<div class="equipment-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队设备统计</h3>
						<div class="header-line"></div>
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
						<div class="equipment-type-stats">
							<div class="type-item" v-for="item in equipmentTypes" :key="item.name">
								<div class="type-icon" :style="{ background: item.color }">
									<el-icon :size="24"><component :is="item.icon" /></el-icon>
								</div>
								<div class="type-info">
									<div class="type-value">{{ item.value }}</div>
									<div class="type-label">{{ item.name }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">设备档案统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="archive-stats">
							<div class="archive-item" v-for="item in archiveStats" :key="item.label">
								<div class="archive-icon" :style="{ background: item.color }">
									<el-icon :size="20"><component :is="item.icon" /></el-icon>
								</div>
								<div class="archive-info">
									<div class="archive-value">{{ item.value }}</div>
									<div class="archive-label">{{ item.label }}</div>
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
						<h3 class="card-title">核心KPI指标</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
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
									<div ref="kpiChartRefs[index]" class="kpi-chart"></div>
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
						<h3 class="card-title">知识库统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
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
							<div class="knowledge-item">
								<div class="knowledge-icon warning">
									<el-icon :size="28"><Warning /></el-icon>
								</div>
								<div class="knowledge-info">
									<div class="knowledge-value">3</div>
									<div class="knowledge-label">待审核</div>
								</div>
							</div>
						</div>
						<div class="knowledge-list">
							<div class="knowledge-list-item" v-for="item in knowledgeList" :key="item.name">
								<div class="knowledge-name">{{ item.name }}</div>
								<div class="knowledge-count">{{ item.count }}篇</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队故障率与完好率</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
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
import { Document, Warning, Monitor, Tools } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const activeTeam = ref('南区维修中心')
const kpiChartRefs = ref([])
let kpiCharts = []

const teams = ref(['南区维修中心', '东区维修中心', '西区维修中心', '岚中维修中心', '岚南维修中心'])

const equipmentTypes = ref([
	{ name: '门机', value: 13, icon: 'Monitor', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ name: '铲车', value: 7, icon: 'Tools', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
	{ name: '其他', value: 267, icon: 'Document', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
])

const archiveStats = ref([
	{ label: '维修记录', value: 153537, icon: 'Document', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
	{ label: '点检记录', value: 169423, icon: 'Warning', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
	{ label: '润滑保养', value: 169423, icon: 'Tools', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
])

const kpiStats = ref([
	{ label: '故障率', value: 0.5, change: -34.0, color: '#ef4444' },
	{ label: '完好率', value: 97.17, change: 0.67, color: '#10b981' },
	{ label: '利用率', value: 26.33, change: 10.67, color: '#3b82f6' },
])

const knowledgeList = ref([
	{ name: '南区维修中心', count: 189 },
	{ name: '东区维修中心', count: 166 },
	{ name: '岚南维修中心', count: 131 },
	{ name: '西区维修中心', count: 105 },
	{ name: '岚中维修中心', count: 69 },
])

const rateList = ref([
	{ name: '南区维修中心', faultRate: 0.0, availRate: 99.34 },
	{ name: '东区维修中心', faultRate: 0.0, availRate: 99.04 },
	{ name: '岚南维修中心', faultRate: 0.0, availRate: 99.79 },
	{ name: '西区维修中心', faultRate: 0.0, availRate: 99.51 },
	{ name: '岚中维修中心', faultRate: 0.0, availRate: 53.13 },
])

const initKpiCharts = () => {
	kpiCharts = kpiChartRefs.value.map((el, index) => {
		if (!el) return null
		const chart = echarts.init(el)
		const kpi = kpiStats.value[index]
		const option = {
			series: [
				{
					type: 'gauge',
					startAngle: 180,
					endAngle: 0,
					min: 0,
					max: 100,
					splitNumber: 5,
					itemStyle: {
						color: kpi.color,
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
						valueAnimation: true,
						formatter: '{value}%',
						offsetCenter: [0, '20%'],
						fontSize: 20,
						fontWeight: 'bold',
						color: '#fff',
					},
					data: [
						{
							value: kpi.value,
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
	kpiCharts.forEach(chart => chart?.resize())
}

onMounted(() => {
	setTimeout(() => {
		initKpiCharts()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	kpiCharts.forEach(chart => chart?.dispose())
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.equipment-panel {
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
	}

	.card-body {
		flex: 1;
		padding: 15px;
		overflow: hidden;
		min-height: 0;
	}
}

.team-tabs {
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

.equipment-type-stats {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.type-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.type-icon {
			width: 50px;
			height: 50px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.type-info {
			.type-value {
				font-size: 24px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.type-label {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

.archive-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;

	.archive-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 15px 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateY(-3px);
		}

		.archive-icon {
			width: 45px;
			height: 45px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
		}

		.archive-info {
			text-align: center;

			.archive-value {
				font-size: 18px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.archive-label {
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);
				margin-top: 3px;
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

.kpi-container {
	display: flex;
	justify-content: space-around;
	gap: 30px;
	width: 100%;

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
			margin-bottom: 10px;

			.kpi-label {
				font-size: 14px;
				font-weight: 600;
				color: #fff;
			}

			.kpi-change {
				font-size: 12px;
				font-weight: 600;
				padding: 3px 8px;
				border-radius: 10px;
				display: flex;
				align-items: center;
				gap: 3px;

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
			height: 120px;
		}

		.kpi-chart {
			width: 100%;
			height: 100%;
		}
	}
}

.knowledge-stats {
	display: flex;
	gap: 15px;
	margin-bottom: 15px;

	.knowledge-item {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;

		.knowledge-icon {
			width: 55px;
			height: 55px;
			border-radius: 12px;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			display: flex;
			align-items: center;
			justify-content: center;
			color: #00d4ff;

			&.warning {
				background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3));
				color: #f59e0b;
			}
		}

		.knowledge-info {
			.knowledge-value {
				font-size: 28px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.knowledge-label {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

.knowledge-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.knowledge-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.knowledge-name {
			color: #fff;
			font-size: 12px;
		}

		.knowledge-count {
			color: #00d4ff;
			font-size: 12px;
			font-weight: 600;
		}
	}
}

.rate-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.rate-item {
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.rate-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 10px;
		}

		.rate-bars {
			display: flex;
			flex-direction: column;
			gap: 8px;

			.rate-bar-item {
				display: flex;
				align-items: center;
				gap: 8px;

				.bar-label {
					font-size: 10px;
					color: rgba(255, 255, 255, 0.6);
					min-width: 40px;
				}

				.bar-track {
					flex: 1;
					height: 6px;
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
					font-size: 11px;
					color: #00d4ff;
					min-width: 45px;
					text-align: right;
					font-family: 'Orbitron', monospace;
				}
			}
		}
	}
}
</style>
