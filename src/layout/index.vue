<template>
	<!-- 当路由meta.noLayout为true、hideLayout为true或URL参数中有noLayout时，不显示layout -->
	<div
		v-if="!route.meta?.noLayout && !hideLayout && !hasNoLayoutParam"
		:class="classObj"
		class="app-wrapper"
		:style="{ '--current-color': theme }"
	>
		<navbar @setLayout="setLayout" />
		<el-scrollbar>
			<div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
			<sidebar
				class="sidebar-container"
				:style="{ zIndex: settingsStore.topNav ? '3002' : '1001' }"
				@checkMenu="checkMenu"
				@mouseLeave="mouseLeave"
			/>
			<div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
				<div :class="{ 'fixed-header': fixedHeader }" v-if="!settingsStore.topNav">
					<tags-view v-if="needTagsView" />
				</div>
				<app-main />
				<settings ref="settingRef" />
			</div>
		</el-scrollbar>
		<div class="menuItem" v-if="showMenuItemList" @mouseenter="handleMouseenter">
			<menuItemList :menuList="menuList" @closeMask="closeMask" />
		</div>
		<div class="mask" v-if="showMenuItemList" @click="closeMask"></div>
	</div>

	<!-- 当路由meta.noLayout为true时，只显示页面内容 -->
	<div v-else>
		<router-view />
	</div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { computed, watch, ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar/index.vue'
import { AppMain, Navbar, Settings, TagsView } from './components'
import defaultSettings from '@/settings'
import { isExternal } from '@/utils/common/form-validation'
import { getNormalPath } from '@/utils/common/core'
import menuItemList from './components/Sidebar/menuItemList'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

// 控制layout显示/隐藏的响应式变量
const hideLayout = ref(false)

// 检查URL参数中是否有noLayout标记
const hasNoLayoutParam = computed(() => {
	const urlParams = new URLSearchParams(window.location.search)
	return urlParams.get('noLayout') === 'true'
})

// 监听hideLayout事件
onMounted(() => {
	proxy.$bus.on('hideLayout', hide => {
		hideLayout.value = hide
		console.log('Layout隐藏状态:', hide)
	})
})

import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const theme = computed(() => settingsStore.theme)
const sideTheme = computed(() => settingsStore.sideTheme)
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
	hideSidebar: !sidebar.value.opened,
	openSidebar: sidebar.value.opened,
	withoutAnimation: sidebar.value.withoutAnimation,
	mobile: device.value === 'mobile',
}))

const { width, height } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watchEffect(() => {
	if (device.value === 'mobile' && sidebar.value.opened) {
		useAppStore().closeSideBar({ withoutAnimation: false })
	}
	if (width.value - 1 < WIDTH) {
		useAppStore().toggleDevice('mobile')
		useAppStore().closeSideBar({ withoutAnimation: true })
	} else {
		useAppStore().toggleDevice('desktop')
	}
})
function resolvePath(routePath, routeQuery) {
	console.log('props')
	console.log(props)
	if (isExternal(routePath)) {
		return routePath
	}
	// basePath 是外部链接
	if (props.basePath && isExternal(props.basePath)) {
		return props.basePath
	}

	if (routeQuery) {
		try {
			const query = typeof routeQuery === 'string' ? JSON.parse(routeQuery) : routeQuery
			return {
				path: getNormalPath(props.basePath + '/' + routePath),
				query: query,
			}
		} catch (e) {
			console.warn('routeQuery 解析失败:', e)
		}
	}
	return getNormalPath(props.basePath + '/' + routePath)
}
function handleClickOutside() {
	useAppStore().closeSideBar({ withoutAnimation: false })
}
const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
	isNest: {
		type: Boolean,
		default: false,
	},
	basePath: {
		type: String,
		default: '',
	},
})
const settingRef = ref(null)
function setLayout() {
	settingRef.value.openSetting()
}
// 点击一级菜单
const showMenuItemList = ref(false)
const menuList = ref([])
/**
 * 检查菜单是否需要展开子菜单
 * @param item 菜单项
 */
const checkMenu = item => {
	const { menuType, children, path } = item
	// 1. 判定弹窗逻辑 (Mega Menu)
	// 只有当类型是 M (目录) 且 确实有子项时，才显示弹出列表
	if (menuType === 'M' && children?.length > 0) {
		isInMenu.value = true
		menuList.value = [item]
		showMenuItemList.value = true
		return // 结束逻辑，不执行跳转
	}

	// 2. 处理跳转 (一级菜单 C 或 目录无子项)
	const targetIsFrame = item.meta?.isFrame || isFrame || '0'

	if (targetIsFrame == '0') {
		// 内部路由
		// 如果是一级菜单，我们刚才改成了嵌套路由，跳转路径应为 /path/index
		// const jumpPath = item.path.startsWith('/') ? item.path : '/' + item.path
		router.push(item.path)
	} else if (targetIsFrame == '1') {
		// 内部 Iframe
		handleIframeOpen(item.link || path, item)
	} else if (targetIsFrame == '2') {
		// 外部新窗口
		window.open(item.link || path, '_blank')
	}

	closeMask()
}

//  iframe 嵌入打开
const handleIframeOpen = (url, item) => {
	const iframeView = {
		...item,
		path: `/iframe/${item.id}`,
		meta: { ...item.meta, link: url },
	}
	tagsViewStore.addIframeView(iframeView)
	tagsViewStore.addVisitedView(iframeView)
	router.push(iframeView.path)
}

// 鼠标进入菜单详情
const isInMenu = ref(false) // 鼠标是否进入过菜单详情
const handleMouseenter = () => {
	isInMenu.value = true
}
// 离开sidebar
const mouseLeave = fn => {
	console.log(isInMenu.value, 'isInMenu.value')
	if (!isInMenu.value) {
		fn()
	}
}
// 关闭遮罩
const closeMask = () => {
	showMenuItemList.value = false
	isInMenu.value = false
	if (sidebar.value.opened) {
		useAppStore().toggleSideBar()
	}
}
onMounted(() => {
	proxy.$bus.on('closeMask', () => {
		closeMask()
	})
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/mixin.scss';
@import '@/assets/styles/variables.module.scss';

.app-wrapper {
	@include clearfix;
	position: relative;
	height: 100%;
	width: 100%;

	:deep(.el-scrollbar__view) {
		height: 100%;
	}
	.el-scrollbar {
		height: calc(100% - 50px);
	}

	:deep(.el-scrollbar__bar).is-vertical {
		z-index: 10;
	}

	:deep(.el-scrollbar__wrap) {
		overflow-x: hidden;
	}

	&.mobile.openSidebar {
		position: fixed;
		top: 0;
	}
}

.drawer-bg {
	background: #000;
	opacity: 0.3;
	width: 100%;
	top: 0;
	height: 100%;
	position: absolute;
	z-index: 999;
}

.fixed-header {
	position: fixed;
	top: 0;
	right: 0;
	z-index: 9;
	width: calc(100% - #{$base-sidebar-width});
	transition: width 0.28s;
}

.hideSidebar .fixed-header {
	width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
	width: 100%;
}

.mobile .fixed-header {
	width: 100%;
}
.menuItem {
	position: fixed;
	top: 50px;
	left: 217px;
	width: 800px;
	height: 100%;
	z-index: 3002;
	background-color: white;
}
.mask {
	position: absolute;
	top: 50px;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 3001;
	background-color: rgba(0, 0, 0, 0.2);
}
</style>
