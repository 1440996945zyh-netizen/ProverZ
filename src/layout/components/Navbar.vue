<template>
	<div
		class="navbar"
		:style="{
			backgroundColor: settingsStore.topNav ? variables.topNavColor : variables.navColor,
			zIndex: settingsStore.topNav ? '1' : '',
		}"
	>
		<div class="left">
			<logo v-if="showLogo" :collapse="isCollapse" :style="logoStyle" />
			<hamburger
				v-if="!settingsStore.topNav"
				id="hamburger-container"
				:is-active="appStore.sidebar.opened"
				class="hamburger-container"
				@toggleClick="toggleSideBar"
			/>

			<breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />

			<!-- 为 top-nav 添加一个包裹 div，用于设置 flex 属性 -->
			<div class="topnav-wrapper">
				<top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" :search-visible="isSearchVisible" />
			</div>
		</div>

		<div class="right-menu">
			<template v-if="appStore.device !== 'mobile'">
						<!-- 新增：更多菜单 -->
				<MoreMenuDropdown class="right-menu-item hover-effect" />

				<el-tooltip content="A-Port智能体" effect="dark" placement="bottom">
					<div class="right-menu-item hover-effect">
						<img src="/src/assets/icons/ai.png" @click="aPortClick" style="width: 22px" />
					</div>
				</el-tooltip>
				<el-tooltip content="菜单搜索" effect="dark" placement="bottom">
					<header-search
						id="header-search"
						ref="headerSearchRef"
						class="right-menu-item"
						:style="{ color: settingsStore.topNav ? '#c1c1c1' : '#5a5e66' }"
						@update:visible="handleSearchVisible"
					/>
				</el-tooltip>
				<el-tooltip content="站内导航" effect="dark" placement="bottom">
					<div class="right-menu-item df" @click="toNavigation">
						<el-icon :size="24" :color="settingsStore.topNav ? '#c1c1c1' : '#5a5e66'">
							<Promotion />
						</el-icon>
					</div>
				</el-tooltip>

				<screenfull
					id="screenfull"
					class="right-menu-item hover-effect"
					:style="{ color: settingsStore.topNav ? '#c1c1c1' : '#5a5e66' }"
				/>

				<!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
					<size-select id="size-select" class="right-menu-item hover-effect" :style="{color:settingsStore.topNav? '#c1c1c1': '#5a5e66'}"/>
				</el-tooltip> -->
			</template>
			<div class="avatar-container">
				<el-dropdown
					@command="handleCommand"
					class="right-menu-item hover-effect"
					trigger="click"
					:style="{ color: settingsStore.topNav ? '#c1c1c1' : '#5a5e66' }"
				>
					<div class="avatar-wrapper">
						{{ userName }}
						<el-icon><caret-bottom /></el-icon>
					</div>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="user">个人中心</el-dropdown-item>
							<el-dropdown-item command="clear">清除缓存</el-dropdown-item>
							<!-- <el-dropdown-item command="setLayout">
								<span>布局设置</span>
							</el-dropdown-item> -->
							<el-dropdown-item divided command="logout">
								<span>退出登录</span>
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</div>
		<Drawer v-model="userVisible" title="个人中心" size="50%" append-to-body>
			<User />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="userVisible = false">关闭</el-button>
				</div>
			</template>
		</Drawer>
	</div>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import Logo from './Sidebar/Logo.vue'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import HeaderSearch from '@/components/HeaderSearch'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import User from './userProfile/index.vue'
import { Promotion } from '@element-plus/icons-vue'
import Drawer from '@/components/Drawer/index.vue'
// 新增：导入 MoreMenuDropdown 组件
import MoreMenuDropdown from '@/components/MoreMenuDropdown/index.vue' // 路径根据您的文件结构调整

import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

import { useRouter } from 'vue-router'
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const userName = computed(() => userStore.name)

const showLogo = computed(() => settingsStore.sidebarLogo)
const isCollapse = computed(() => !appStore.sidebar.opened)
function toggleSideBar() {
	appStore.toggleSideBar()
}
const logoStyle = computed(() => {
	if (settingsStore.topNav) {
		return { width: '250px', minWidth: '250px' }
	}
	return { width: isCollapse ? '54px' : variables.sideBarWidth }
})
// 新增：定义搜索框显示状态变量
const isSearchVisible = ref(false)

// 新增：接收搜索框的显示状态
const handleSearchVisible = visible => {
	isSearchVisible.value = visible
}
function handleCommand(command) {
	switch (command) {
		case 'user':
			setUser()
			break
		case 'clear':
			clear()
			break
		case 'setLayout':
			setLayout()
			break
		case 'logout':
			logout()
			break
		default:
			break
	}
}
const userVisible = ref(false)
const setUser = () => {
	userVisible.value = true
}
const clear = () => {
	localStorage.clear()
	location.reload()
}
function logout() {
	ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			userStore.logOut().then(() => {
				location.href = '/index'
			})
		})
		.catch(() => {})
}

const emits = defineEmits(['setLayout'])
function setLayout() {
	emits('setLayout')
}
// 跳转站内导航
const toNavigation = () => {
	router.push({ name: 'Navigation' })
}
// 跳转A-Port智能体页面
const aPortClick = () => {
	router.push({ name: 'chatAgent' })
}
</script>


<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';
.navbar {
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 50px;
	overflow: hidden;
	box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

	.left {
		// 保持 flex: 1 1 auto; 允许拉伸和收缩
		flex: 1 1 auto;
		display: flex; // 保持内部 flex 布局
		align-items: center; // 垂直居中
		min-width: 0; // 防止 flex item 内容溢出其 flex 基础大小

		// 设置一个最小宽度，确保 logo, hamburger, breadcrumb 始终可见
		// 这个值需要根据您的 logo 和其他元素的实际宽度调整
		min-width: 250px; // 示例值，根据实际情况调整

		.hamburger-container {
			line-height: 46px;
			height: 100%;
			cursor: pointer;
			transition: background 0.3s;
			-webkit-tap-highlight-color: transparent;

			&:hover {
				background: rgba(0, 0, 0, 0.025);
			}
		}
	}

	// 为 TopNav 添加包裹 div 的样式
	.topnav-wrapper {
		flex: 1; // 占据 left 内部的剩余空间
		min-width: 0; // 防止内容溢出
		overflow: hidden; // 防止 TopNav 内容溢出此容器
	}

	// .breadcrumb-container {
	// 	float: left;
	// }

	.topmenu-container { // 这是 TopNav 组件的 id
		// 移除或覆盖 TopNav 内部可能设置的固定宽度
		// width: auto !important; // 如果 TopNav 内部有计算宽度，可能需要覆盖
		// 或者，让其宽度由父级 .topnav-wrapper 决定
		// 通常 TopNav 的计算宽度是基于屏幕宽度的，这里我们用 flex 来覆盖它
		width: 100%; // 宽度由父级 .topnav-wrapper 决定
	}

	.errLog-container {
		display: inline-block;
		vertical-align: top;
	}

	.right-menu {
		// 保持 flex: 0 1 auto; 不拉伸基础大小，但允许收缩/扩展
		flex: 0 1 auto;
		height: 100%;
		line-height: 50px;
		display: flex;
		align-items: center;
		&:focus {
			outline: none;
		}

		.right-menu-item {
			display: flex;
			align-items: center;
			padding: 0 8px;
			height: 100%;
			font-size: 18px;
			color: #5a5e66;
			&:hover {
				background-color: $top-hover-color;
				color: #fff;
				cursor: pointer;
			}
			&.hover-effect {
				cursor: pointer;
				transition: background 0.3s;

				&:hover {
					background: rgba(0, 0, 0, 0.025);
				}
			}
		}

		.avatar-container {
			margin-right: 10px;

			.avatar-wrapper {
				// margin-top: 17px;
				position: relative;
				font-size: 14px;

				.user-avatar {
					cursor: pointer;
					width: 40px;
					height: 40px;
					border-radius: 10px;
				}

				i {
					cursor: pointer;
					position: absolute;
					right: -10px;
					// top: 10px;
					font-size: 12px;
				}
			}
		}
	}
}
.df {
	display: flex !important;
	align-items: center;
	cursor: pointer;
}
</style>
