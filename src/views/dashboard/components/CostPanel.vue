<template>
	<div class="cost-panel">
		<div class="screen-body">
			<div class="left-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队成本统计</h3>
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
						<div class="cost-summary">
							<div class="cost-total">
								<div class="cost-icon">
									<el-icon :size="32"><Wallet /></el-icon>
								</div>
								<div class="cost-info">
									<div class="cost-value">{{ formatNumber(costSummary.total) }}</div>
									<div class="cost-label">总成本 (元)</div>
								</div>
							</div>
							<div class="cost-breakdown">
								<div class="breakdown-item">
									<div class="breakdown-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
										<el-icon :size="18"><Tools /></el-icon>
									</div>
									<div class="breakdown-info">
										<div class="breakdown-value">{{ formatNumber(costSummary.repair) }}</div>
										<div class="breakdown-label">维修成本</div>
									</div>
								</div>
								<div class="breakdown-item">
									<div class="breakdown-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
										<el-icon :size="18"><Operation /></el-icon>
									</div>
									<div class="breakdown-info">
										<div class="breakdown-value">{{ formatNumber(costSummary.maintenance) }}</div>
										<div class="breakdown-label">保养成本</div>
									</div>
								</div>
								<div class="breakdown-item">
									<div class="breakdown-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
										<el-icon :size="18"><Box /></el-icon>
									</div>
									<div class="breakdown-info">
										<div class="breakdown-value">{{ formatNumber(costSummary.parts) }}</div>
										<div class="breakdown-label">配件成本</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">成本趋势分析</h3>
						<div class="header-line"></div>
						<div class="time-tabs">
							<span class="time-tab" :class="{ active: timeType === 'month' }" @click="timeType = 'month'">月</span>
							<span class="time-tab" :class="{ active: timeType === 'quarter' }" @click="timeType = 'quarter'">季</span>
							<span class="time-tab" :class="{ active: timeType === 'year' }" @click="timeType = 'year'">年</span>
						</div>
					</div>
					<div class="card-body">
						<div ref="trendChartRef" class="trend-chart"></div>
					</div>
				</div>
			</div>

			<div class="center-column">
				<div class="panel-card center-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">成本结构分析</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="cost-structure-wrapper">
							<div class="structure-chart-container">
								<div ref="structureChartRef" class="structure-chart"></div>
								<div class="chart-center-info">
									<div class="center-value">{{ formatNumber(costSummary.total) }}</div>
									<div class="center-label">总成本 (元)</div>
								</div>
							</div>
							<div class="structure-legend">
								<div class="legend-item" v-for="item in costStructure" :key="item.name">
									<div class="legend-dot" :style="{ background: item.color }"></div>
									<span class="legend-name">{{ item.name }}</span>
									<span class="legend-value">{{ formatNumber(item.value) }}元</span>
									<span class="legend-percent">{{ item.percent }}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">站队成本排名</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="cost-rank-list">
							<div class="cost-rank-item" v-for="(item, index) in costRankList" :key="item.name">
								<div class="rank-badge" :class="'rank-' + (index + 1)">
									<span class="rank-number">{{ index + 1 }}</span>
								</div>
								<div class="rank-content">
									<div class="rank-name">{{ item.name }}</div>
									<div class="rank-bar">
										<div class="rank-track">
											<div class="rank-fill" :style="{ width: item.percent + '%' }"></div>
										</div>
									</div>
								</div>
								<div class="rank-value">{{ formatNumber(item.value) }}元</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="right-column">
				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">配件消耗统计</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="parts-stats">
							<div class="parts-stat-item">
								<div class="parts-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
									<el-icon :size="24"><Box /></el-icon>
								</div>
								<div class="parts-info">
									<div class="parts-value">{{ partsStats.total }}</div>
									<div class="parts-label">配件消耗总数</div>
								</div>
							</div>
							<div class="parts-stat-item">
								<div class="parts-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
									<el-icon :size="24"><Wallet /></el-icon>
								</div>
								<div class="parts-info">
									<div class="parts-value">{{ formatNumber(partsStats.cost) }}</div>
									<div class="parts-label">配件总成本 (元)</div>
								</div>
							</div>
						</div>
						<div class="parts-list">
							<div class="parts-list-item" v-for="item in partsList" :key="item.name">
								<div class="parts-name">{{ item.name }}</div>
								<div class="parts-detail">
									<span>消耗数量: {{ item.count }}</span>
									<span>消耗金额: {{ formatNumber(item.cost) }}元</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<div class="header-icon"></div>
						<h3 class="card-title">成本预警</h3>
						<div class="header-line"></div>
					</div>
					<div class="card-body">
						<div class="warning-list">
							<div class="warning-item" v-for="item in warningList" :key="item.id">
								<div class="warning-icon" :class="item.level">
									<el-icon :size="18"><Warning /></el-icon>
								</div>
								<div class="warning-content">
									<div class="warning-title">{{ item.title }}</div>
									<div class="warning-desc">{{ item.description }}</div>
									<div class="warning-time">{{ item.time }}</div>
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
import { Wallet, Tools, Operation, Box, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const activeTeam = ref('南区维修中心')
const timeType = ref('month')
const trendChartRef = ref(null)
const structureChartRef = ref(null)
let trendChart = null
let structureChart = null

const teams = ref(['南区维修中心', '东区维修中心', '西区维修中心', '岚中维修中心', '岚南维修中心'])

const costSummary = ref({
	total: 1258460,
	repair: 456780,
	maintenance: 321450,
	parts: 480230,
})

const costStructure = ref([
	{ name: '维修成本', value: 456780, percent: 36.3, color: '#667eea' },
	{ name: '保养成本', value: 321450, percent: 25.5, color: '#4facfe' },
	{ name: '配件成本', value: 480230, percent: 38.2, color: '#43e97b' },
])

const costRankList = ref([
	{ name: '东区维修中心', value: 356780, percent: 100 },
	{ name: '南区维修中心', value: 298450, percent: 83.7 },
	{ name: '西区维修中心', value: 267890, percent: 75.1 },
	{ name: '岚南维修中心', value: 198560, percent: 55.7 },
	{ name: '岚中维修中心', value: 136780, percent: 38.3 },
])

const partsStats = ref({
	total: 1568,
	cost: 480230,
})

const partsList = ref([
	{ name: '轴承', count: 156, cost: 89650 },
	{ name: '密封件', count: 234, cost: 45680 },
	{ name: '电气元件', count: 89, cost: 123450 },
	{ name: '液压件', count: 45, cost: 156780 },
	{ name: '其他', count: 1044, cost: 64670 },
])

const warningList = ref([
	{ id: 1, title: '东区维修中心成本超预算', description: '本月成本已超出预算15%', time: '2024-03-15', level: 'danger' },
	{ id: 2, title: '配件库存预警', description: '轴承库存低于安全库存', time: '2024-03-14', level: 'warning' },
	{ id: 3, title: '保养成本异常', description: '南区保养成本环比增长25%', time: '2024-03-13', level: 'info' },
])

const formatNumber = num => {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
			data: ['维修成本', '保养成本', '配件成本'],
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
				name: '维修成本',
				type: 'line',
				smooth: true,
				data: [320000, 280000, 350000, 420000, 380000, 456780],
				lineStyle: { color: '#667eea', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
						{ offset: 1, color: 'rgba(102, 126, 234, 0)' },
					]),
				},
				itemStyle: { color: '#667eea' },
			},
			{
				name: '保养成本',
				type: 'line',
				smooth: true,
				data: [250000, 230000, 280000, 300000, 290000, 321450],
				lineStyle: { color: '#4facfe', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
						{ offset: 1, color: 'rgba(79, 172, 254, 0)' },
					]),
				},
				itemStyle: { color: '#4facfe' },
			},
			{
				name: '配件成本',
				type: 'line',
				smooth: true,
				data: [380000, 350000, 420000, 450000, 460000, 480230],
				lineStyle: { color: '#43e97b', width: 2 },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
						{ offset: 1, color: 'rgba(67, 233, 123, 0)' },
					]),
				},
				itemStyle: { color: '#43e97b' },
			},
		],
	}

	trendChart.setOption(option)
}

const initStructureChart = () => {
	if (!structureChartRef.value) return
	structureChart = echarts.init(structureChartRef.value)

	const option = {
		series: [
			{
				type: 'pie',
				radius: ['50%', '70%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: false,
				label: { show: false },
				labelLine: { show: false },
				data: costStructure.value.map(item => ({
					value: item.value,
					name: item.name,
					itemStyle: { color: item.color },
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

	structureChart.setOption(option)
}

const handleResize = () => {
	trendChart?.resize()
	structureChart?.resize()
}

onMounted(() => {
	setTimeout(() => {
		initTrendChart()
		initStructureChart()
	}, 100)
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', handleResize)
	trendChart?.dispose()
	structureChart?.dispose()
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.cost-panel {
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

.cost-summary {
	.cost-total {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 15px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		margin-bottom: 12px;

		.cost-icon {
			width: 55px;
			height: 55px;
			border-radius: 12px;
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			display: flex;
			align-items: center;
			justify-content: center;
			color: #00d4ff;
		}

		.cost-info {
			.cost-value {
				font-size: 28px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.cost-label {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}

	.cost-breakdown {
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
				background: rgba(255, 255, 255, 0.08);
				transform: translateX(3px);
			}

			.breakdown-icon {
				width: 36px;
				height: 36px;
				border-radius: 8px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #fff;
				flex-shrink: 0;
			}

			.breakdown-info {
				.breakdown-value {
					font-size: 16px;
					font-weight: 700;
					color: #fff;
					font-family: 'Orbitron', monospace;
				}

				.breakdown-label {
					font-size: 11px;
					color: rgba(255, 255, 255, 0.6);
				}
			}
		}
	}
}

.trend-chart {
	width: 100%;
	height: 200px;
}

.center-card {
	flex: 1.2;
}

.cost-structure-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 30px;

	.structure-chart-container {
		position: relative;
		width: 220px;
		height: 220px;
		flex-shrink: 0;

		.structure-chart {
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
				font-size: 22px;
				font-weight: 700;
				color: #00d4ff;
				font-family: 'Orbitron', monospace;
			}

			.center-label {
				font-size: 11px;
				color: rgba(255, 255, 255, 0.7);
				margin-top: 3px;
			}
		}
	}

	.structure-legend {
		display: flex;
		flex-direction: column;
		gap: 12px;

		.legend-item {
			display: flex;
			align-items: center;
			gap: 10px;

			.legend-dot {
				width: 12px;
				height: 12px;
				border-radius: 3px;
				flex-shrink: 0;
			}

			.legend-name {
				color: rgba(255, 255, 255, 0.8);
				font-size: 12px;
				min-width: 70px;
			}

			.legend-value {
				color: #fff;
				font-size: 12px;
				font-weight: 600;
				font-family: 'Orbitron', monospace;
			}

			.legend-percent {
				color: #00d4ff;
				font-size: 12px;
				font-weight: 600;
				min-width: 40px;
				text-align: right;
			}
		}
	}
}

.cost-rank-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.cost-rank-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.rank-badge {
			width: 36px;
			height: 36px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.rank-number {
				font-size: 16px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			&.rank-1 {
				background: linear-gradient(135deg, #fbbf24, #f59e0b);
				box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
			}

			&.rank-2 {
				background: linear-gradient(135deg, #9ca3af, #6b7280);
				box-shadow: 0 0 15px rgba(156, 163, 175, 0.4);
			}

			&.rank-3 {
				background: linear-gradient(135deg, #cd7f32, #b5651d);
				box-shadow: 0 0 15px rgba(205, 127, 50, 0.4);
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
				font-size: 12px;
				font-weight: 500;
				margin-bottom: 6px;
			}

			.rank-bar {
				.rank-track {
					height: 6px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 3px;
					overflow: hidden;

					.rank-fill {
						height: 100%;
						background: linear-gradient(90deg, #00d4ff, #0096ff);
						border-radius: 3px;
						transition: width 1s ease;
					}
				}
			}
		}

		.rank-value {
			color: #00d4ff;
			font-size: 12px;
			font-weight: 600;
			font-family: 'Orbitron', monospace;
			min-width: 80px;
			text-align: right;
		}
	}
}

.parts-stats {
	display: flex;
	gap: 15px;
	margin-bottom: 15px;

	.parts-stat-item {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;

		.parts-icon {
			width: 45px;
			height: 45px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;
		}

		.parts-info {
			.parts-value {
				font-size: 20px;
				font-weight: 700;
				color: #fff;
				font-family: 'Orbitron', monospace;
			}

			.parts-label {
				font-size: 11px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

.parts-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.parts-list-item {
		padding: 10px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.parts-name {
			color: #fff;
			font-size: 12px;
			font-weight: 500;
			margin-bottom: 6px;
		}

		.parts-detail {
			display: flex;
			gap: 15px;

			span {
				font-size: 10px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

.warning-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.warning-item {
		display: flex;
		gap: 12px;
		padding: 12px;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 6px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			transform: translateX(3px);
		}

		.warning-icon {
			width: 36px;
			height: 36px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #fff;
			flex-shrink: 0;

			&.danger {
				background: linear-gradient(135deg, #ef4444, #dc2626);
			}

			&.warning {
				background: linear-gradient(135deg, #f59e0b, #d97706);
			}

			&.info {
				background: linear-gradient(135deg, #3b82f6, #2563eb);
			}
		}

		.warning-content {
			flex: 1;

			.warning-title {
				color: #fff;
				font-size: 12px;
				font-weight: 500;
				margin-bottom: 4px;
			}

			.warning-desc {
				color: rgba(255, 255, 255, 0.6);
				font-size: 11px;
				margin-bottom: 4px;
			}

			.warning-time {
				color: rgba(255, 255, 255, 0.4);
				font-size: 10px;
			}
		}
	}
}
</style>
