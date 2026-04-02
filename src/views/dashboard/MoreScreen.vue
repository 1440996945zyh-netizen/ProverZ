<template>
	<div class="more-screen-container">
		<div class="bg-layer">
			<div class="bg-grid"></div>
			<div class="bg-glow"></div>
			<div class="bg-particles"></div>
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
				<div class="back-btn" @click="handleBack">
					<el-icon><ArrowLeft /></el-icon>
					<span>返回大屏</span>
				</div>
				<div class="logo-container">
					<div class="logo-ring"></div>
					<div class="logo-inner">
						<el-icon :size="24"><Monitor /></el-icon>
					</div>
				</div>
				<div class="system-name">
					<div class="name-main">数智设备物资管理平台</div>
					<div class="name-sub">Smart Equipment & Material Management</div>
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
						<div class="tab-icon">
							<el-icon><component :is="tab.icon" /></el-icon>
						</div>
						<span class="tab-label">{{ tab.label }}</span>
						<div class="tab-indicator"></div>
					</div>
				</div>
			</div>
			<div class="header-right">
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
			</div>
		</div>

		<div class="screen-content">
			<Transition name="fade-slide" mode="out-in">
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

const currentTime = ref('00:00:00')
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
	router.push('/dashboard/dashboard1')
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

.more-screen-container {
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
	height: 80px;
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

		.back-btn {
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

		.logo-container {
			position: relative;
			width: 45px;
			height: 45px;

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
				font-size: 16px;
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

		.tab-nav {
			display: flex;
			gap: 8px;

			.tab-item {
				position: relative;
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 12px 24px;
				background: rgba(255, 255, 255, 0.03);
				border: 1px solid rgba(0, 212, 255, 0.2);
				border-radius: 25px;
				color: $text-secondary;
				font-size: 14px;
				font-weight: 500;
				cursor: pointer;
				transition: all 0.3s ease;
				overflow: hidden;

				&::before {
					content: '';
					position: absolute;
					inset: 0;
					background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 150, 255, 0.05));
					opacity: 0;
					transition: opacity 0.3s ease;
				}

				&:hover {
					color: $primary-color;
					border-color: rgba(0, 212, 255, 0.4);
					transform: translateY(-2px);

					&::before {
						opacity: 1;
					}
				}

				&.active {
					background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 150, 255, 0.15));
					border-color: rgba(0, 212, 255, 0.6);
					color: $primary-color;
					font-weight: 600;
					box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);

					.tab-indicator {
						transform: scaleX(1);
					}

					.tab-icon {
						background: linear-gradient(135deg, $primary-color, $primary-dark);
						color: #fff;
					}
				}

				.tab-icon {
					width: 28px;
					height: 28px;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(0, 212, 255, 0.1);
					transition: all 0.3s ease;
					position: relative;
					z-index: 1;
				}

				.tab-label {
					position: relative;
					z-index: 1;
				}

				.tab-indicator {
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%) scaleX(0);
					width: 60%;
					height: 2px;
					background: linear-gradient(90deg, transparent, $primary-color, transparent);
					transition: transform 0.3s ease;
				}
			}
		}
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 20px;

		.datetime-box {
			text-align: right;

			.time-display {
				display: flex;
				align-items: center;
				gap: 2px;

				.time-num {
					font-size: 28px;
					font-weight: 700;
					color: $primary-color;
					font-family: 'Orbitron', monospace;
					text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
					min-width: 40px;
					text-align: center;
				}

				.time-sep {
					font-size: 24px;
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

.screen-content {
	height: calc(100vh - 80px);
	position: relative;
	z-index: 2;
	overflow: hidden;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.4s ease;
}

.fade-slide-enter-from {
	opacity: 0;
	transform: translateX(20px);
}

.fade-slide-leave-to {
	opacity: 0;
	transform: translateX(-20px);
}

@media screen and (max-width: 1600px) {
	.screen-header {
		height: 70px;
		padding: 0 20px;

		.header-left {
			.logo-container {
				width: 38px;
				height: 38px;
			}

			.system-name .name-main {
				font-size: 14px;
			}
		}

		.header-center .tab-nav .tab-item {
			padding: 10px 20px;
			font-size: 13px;

			.tab-icon {
				width: 24px;
				height: 24px;
			}
		}

		.header-right .datetime-box .time-display .time-num {
			font-size: 24px;
			min-width: 35px;
		}
	}
}

@media screen and (max-width: 1366px) {
	.screen-header {
		height: 60px;

		.header-left {
			.system-name {
				display: none;
			}
		}

		.header-center .tab-nav .tab-item {
			padding: 8px 16px;
			font-size: 12px;

			.tab-icon {
				width: 22px;
				height: 22px;
			}
		}

		.header-right .datetime-box {
			.time-display .time-num {
				font-size: 20px;
				min-width: 28px;
			}

			.date-display {
				display: none;
			}
		}
	}

	.corner-deco {
		display: none;
	}
}

@media screen and (max-width: 992px) {
	.screen-header {
		.header-left {
			.logo-container {
				display: none;
			}
		}

		.header-center .tab-nav .tab-item {
			padding: 8px 12px;
			font-size: 11px;

			.tab-label {
				display: none;
			}

			.tab-icon {
				width: 32px;
				height: 32px;
			}
		}
	}
}
</style>
