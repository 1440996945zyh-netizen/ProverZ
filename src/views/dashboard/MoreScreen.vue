<template>
	<div class="more-screen-container">
		<div class="bg-pattern"></div>
		<div class="bg-overlay"></div>
		<div class="corner-decoration corner-tl"></div>
		<div class="corner-decoration corner-tr"></div>
		<div class="corner-decoration corner-bl"></div>
		<div class="corner-decoration corner-br"></div>

		<div class="screen-header">
			<div class="header-left">
				<div class="back-btn" @click="handleBack">
					<el-icon><ArrowLeft /></el-icon>
					<span>返回</span>
				</div>
				<div class="logo-box">
					<img src="@/assets/logo/logo-h-white2.png" class="logo" />
				</div>
			</div>
			<div class="header-center">
				<div class="tab-nav">
					<div
						class="tab-item"
						v-for="tab in tabs"
						:key="tab.key"
						:class="{ active: activeTab === tab.key }"
						@click="activeTab = tab.key"
					>
						<el-icon><component :is="tab.icon" /></el-icon>
						<span>{{ tab.label }}</span>
					</div>
				</div>
			</div>
			<div class="header-right">
				<div class="time-box">
					<div class="time">{{ currentTime }}</div>
					<div class="date">{{ currentDate }} {{ currentWeek }}</div>
				</div>
			</div>
		</div>

		<div class="screen-content">
			<Transition name="fade" mode="out-in">
				<MonitorPanel v-if="activeTab === 'monitor'" />
				<EquipmentPanel v-else-if="activeTab === 'equipment'" />
				<MaintenancePanel v-else-if="activeTab === 'maintenance'" />
				<CostPanel v-else-if="activeTab === 'cost'" />
			</Transition>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Warning, Monitor, Tools, Wallet } from '@element-plus/icons-vue'
import MonitorPanel from './components/MonitorPanel.vue'
import EquipmentPanel from './components/EquipmentPanel.vue'
import MaintenancePanel from './components/MaintenancePanel.vue'
import CostPanel from './components/CostPanel.vue'

const router = useRouter()

const currentTime = ref('')
const currentDate = ref('')
const currentWeek = ref('')
let timer = null

const activeTab = ref('monitor')

const tabs = ref([
	{ key: 'monitor', label: '状态监测', icon: 'Warning' },
	{ key: 'equipment', label: '设备管理', icon: 'Monitor' },
	{ key: 'maintenance', label: '维保管理', icon: 'Tools' },
	{ key: 'cost', label: '成本管理', icon: 'Wallet' },
])

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

const handleBack = () => {
	router.push('/dashboard/BigScreenDashboard')
}

onMounted(() => {
	updateTime()
	timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
	if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.more-screen-container {
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
	height: 70px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 30px;
	position: relative;
	z-index: 10;
	background: linear-gradient(180deg, rgba(5, 13, 25, 0.95) 0%, rgba(5, 13, 25, 0.8) 100%);
	border-bottom: 1px solid rgba(0, 212, 255, 0.2);

	.header-left,
	.header-right {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-left {
		justify-content: flex-start;
	}

	.header-center {
		flex: 2;
		display: flex;
		justify-content: center;
	}

	.header-right {
		justify-content: flex-end;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 18px;
		background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 150, 255, 0.2));
		border: 1px solid rgba(0, 212, 255, 0.4);
		border-radius: 20px;
		color: #00d4ff;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover {
			background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
			border-color: rgba(0, 212, 255, 0.6);
			transform: translateY(-2px);
			box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3);
		}
	}

	.logo-box {
		.logo {
			height: 40px;
			object-fit: contain;
		}
	}

	.tab-nav {
		display: flex;
		gap: 10px;

		.tab-item {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 25px;
			background: rgba(255, 255, 255, 0.05);
			border: 1px solid rgba(0, 212, 255, 0.2);
			border-radius: 20px;
			color: rgba(255, 255, 255, 0.7);
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(0, 212, 255, 0.1);
				color: #00d4ff;
				border-color: rgba(0, 212, 255, 0.4);
			}

			&.active {
				background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 150, 255, 0.3));
				border-color: rgba(0, 212, 255, 0.6);
				color: #00d4ff;
				font-weight: 600;
				box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
			}
		}
	}

	.time-box {
		text-align: right;

		.time {
			font-size: 28px;
			font-weight: 700;
			color: #00d4ff;
			font-family: 'Orbitron', monospace;
			letter-spacing: 2px;
			text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
		}

		.date {
			font-size: 13px;
			color: rgba(255, 255, 255, 0.7);
			margin-top: 2px;
		}
	}
}

.screen-content {
	height: calc(100vh - 70px);
	position: relative;
	z-index: 2;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
