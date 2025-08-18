<template>
	<div
		class="navbar"
		:style="{
			backgroundColor: settingsStore.topNav ? variables.topNavColor : variables.navColor,
			zIndex: settingsStore.topNav ? '1' : '',
		}"
	>
		<div class="left" >
			<logo
				v-if="showLogo"
				:collapse="isCollapse"
				:style="logoStyle"
			/>
			<hamburger
				v-if="!settingsStore.topNav"
				id="hamburger-container"
				:is-active="appStore.sidebar.opened"
				class="hamburger-container"
				@toggleClick="toggleSideBar"
			/>
			<breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
			<top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" :search-visible="isSearchVisible" />
		</div>

		<div class="right-menu" >
			<template v-if="appStore.device !== 'mobile'">
				<el-tooltip content="菜单搜索" effect="dark" placement="bottom">
					<header-search
						id="header-search"
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
		<el-drawer v-model="userVisible" title="个人中心" size="50%" append-to-body>
			<User />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="userVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
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
    return { width: '150px' }
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
		display: flex;
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
	// .breadcrumb-container {
	// 	float: left;
	// }

	// .topmenu-container {
	// 	position: absolute;
	// 	left: 50px;
	// }
	.errLog-container {
		display: inline-block;
		vertical-align: top;
	}

	.right-menu {
		height: 100%;
		line-height: 50px;
		display: flex;
		&:focus {
			outline: none;
		}

		.right-menu-item {
			display: inline-block;
			padding: 0 8px;
			height: 100%;
			font-size: 18px;
			color: #5a5e66;
			vertical-align: text-bottom;
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
			margin-right: 20px;

			.avatar-wrapper {
				margin-top: 17px;
				position: relative;
				font-size: 16px;

				.user-avatar {
					cursor: pointer;
					width: 40px;
					height: 40px;
					border-radius: 10px;
				}

				i {
					cursor: pointer;
					position: absolute;
					right: -20px;
					top: 10px;
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
