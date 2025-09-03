<template>
	<div class="topmenu-wrapper" :style="{ width: computedWidth }">
		<!-- 左滚动按钮 - 无法滑动时隐藏 -->
		<button class="scroll-btn left-btn" @click="scrollLeft" :disabled="!canScrollLeft" v-if="canScrollLeft">
			<ArrowLeftBold />
		</button>

		<!-- 菜单容器 -->
		<div class="menu-container" ref="menuContainer" @wheel="handleWheel">
			<el-menu class="topmenu-container" :default-active="activeMenu" mode="horizontal" @select="handleSelect" :ellipsis="false">
				<template v-for="(item, index) in topMenus" :key="index">
					<el-menu-item
						name="menuitem"
						:style="{ '--theme': theme }"
						:index="item.path"
						@mouseenter="handleMouseenter(item)"
						@mouseleave="handleMouseleave(item)"
					>
						{{ item.meta.title }}
						<div style="width: 20px; height: 12px; padding-left: 8px; display: flex" v-if="item.meta.title != '首页'">
							<img
								v-show="item.meta.hover || item.path == route.path"
								@click.stop="handleRemove(item, index)"
								class="close"
								src="@/assets/icons/close.png"
								alt="关闭"
								width="12"
								height="12"
							/>
						</div>
					</el-menu-item>
				</template>
			</el-menu>
		</div>

		<!-- 右滚动按钮 - 无法滑动时隐藏 -->
		<button class="scroll-btn right-btn" @click="scrollRight" :disabled="!canScrollRight" v-if="canScrollRight">
			<ArrowRightBold />
		</button>

		<!-- 关闭操作下拉菜单 -->
		<el-tooltip content="更多菜单" effect="dark" placement="bottom" offset="10">
			<el-dropdown placement="bottom-end" trigger="click" class="close-operations">
				<el-icon style="color: #c1c1c1; font-size: 22px; cursor: pointer"><Menu /></el-icon>
				<template #dropdown>
					<el-dropdown-menu style="width: 200px; padding: 0">
						<div class="dropdown-content">
							<!-- 搜索框容器 - 使用独立容器避免样式冲突 -->
							<div class="search-wrapper" @click.stop>
								<el-input
									v-model="searchQuery"
									placeholder="搜索页面..."
									clearable
									size="default"
									@input="handleSearch"
									@clear="handleClear"
									@keydown.delete="handleDeleteKey"
									@keydown.backspace="handleDeleteKey"
								>
									<template #prefix>
										<el-icon size="14"><Search /></el-icon>
									</template>
								</el-input>
							</div>

							<el-dropdown-item @click="removeNow">关闭当前</el-dropdown-item>
							<el-dropdown-item @click="removeOther">关闭其他</el-dropdown-item>
							<el-dropdown-item @click="removeAll">关闭所有</el-dropdown-item>
							<el-divider style="margin: 0" />

							<div class="dropdown-items">
								<template v-for="(item, index) in filteredMenus" :key="index">
									<el-dropdown-item @click="handleMenuSelect(item)">{{ item.meta.title }}</el-dropdown-item>
								</template>
								<el-dropdown-item v-if="filteredMenus.length === 0 && searchQuery" disabled>无匹配结果</el-dropdown-item>
							</div>
						</div>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</el-tooltip>
	</div>
</template>

<script setup>
import { getCurrentInstance, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ArrowLeftBold, ArrowRightBold, Menu, Search } from '@element-plus/icons-vue'
import { constantRoutes } from '@/router'
import { isHttp } from '@/utils/verify/validate'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { useRoute, useRouter } from 'vue-router'
import useTagsViewStore from '@/store/modules/tagsView'

const { proxy } = getCurrentInstance()
const menuContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const searchQuery = ref('') // 搜索关键词
const scrollTimer = ref(null) // 用于清理定时器
const isComponentMounted = ref(true) // 组件挂载状态
const props = defineProps({
	searchVisible: {
		type: Boolean,
		default: false,
	},
})

// 计算屏幕宽度的响应式变量
const screenWidth = ref(window.innerWidth)
// 动态计算宽度
const computedWidth = computed(() => {
	// 基础宽度 = 屏幕宽度 - 370px
	const baseWidth = screenWidth.value - 375
	const otherWidth = screenWidth.value - 600
	// 根据searchVisible状态调整最终宽度
	return props.searchVisible ? `${otherWidth}px` : `${baseWidth}px`
})
// 隐藏侧边栏路由
const hideList = ['/index', '/user/profile']

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

// 主题颜色
const theme = computed(() => settingsStore.theme)
// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters)

// 设置子路由
const childrenMenus = computed(() => {
	let childrenMenus = []
	routers.value.map(router => {
		for (let item in router.children) {
			if (router.children[item].parentPath === undefined) {
				if (router.path === '/') {
					router.children[item].path = '/' + router.children[item].path
				} else {
					if (!isHttp(router.children[item].path)) {
						router.children[item].path = router.path + '/' + router.children[item].path
					}
				}
				router.children[item].parentPath = router.path
			}
			childrenMenus.push(router.children[item])
		}
	})
	return constantRoutes.concat(childrenMenus)
})

// 默认激活的菜单
const activeMenu = computed(() => {
	const path = route.path
	let activePath = path
	if (path !== undefined && path.lastIndexOf('/') > 0 && hideList.indexOf(path) === -1) {
		const tmpPath = path.substring(1, path.length)
		activePath = '/' + tmpPath
		if (!route.meta.link) {
			appStore.toggleSideBarHide(false)
		}
	} else if (!route.children) {
		activePath = path
	}
	return activePath
})

function handleSelect(key, keyPath) {
	if (isHttp(key)) {
		window.open(key, '_blank')
	} else {
		router
			.push({ path: key })
			.then(() => {
				// 直接调用滚动函数，内部已经处理了时序
				scrollToActiveItem()
			})
			.catch(err => {
				console.error('路由跳转失败:', err)
			})
	}
	proxy.$bus.emit('closeMask')
}

function activeRoutes(key) {
	let routes = []
	if (childrenMenus.value && childrenMenus.value.length > 0) {
		childrenMenus.value.map(item => {
			if (key == item.parentPath || (key == 'index' && '' == item.path)) {
				routes.push(item)
			}
		})
	}
	if (routes.length > 0) {
		permissionStore.setSidebarRouters(routes)
	} else {
		appStore.toggleSideBarHide(true)
	}
	return routes
}

// 顶部显示菜单
const topMenus = computed(() => useTagsViewStore().visitedViews)

// 筛选后的菜单
const filteredMenus = computed(() => {
	if (!searchQuery.value) {
		return topMenus.value
	}
	const query = searchQuery.value.toLowerCase()
	return topMenus.value.filter(item => item.meta.title.toLowerCase().includes(query))
})

// 处理搜索
const handleSearch = () => {
	// 确保输入框获得焦点
}

// 处理清除搜索内容
const handleClear = () => {
	searchQuery.value = ''
}

// 处理删除键和退格键
const handleDeleteKey = e => {
	// 允许事件正常传播
	e.stopPropagation()
	// 手动更新搜索查询
	nextTick(() => {
		// 这里不需要额外操作，v-model会自动更新
	})
}

function addTags() {
	const { name } = route
	if (name) {
		useTagsViewStore().addView(route)
		if (route.meta.link) {
			useTagsViewStore().addIframeView(route)
		}
	}
	return false
}

const handleMouseenter = item => {
	item.meta.hover = true
}

const handleMouseleave = item => {
	item.meta.hover = false
}

const handleRemove = (item, index) => {
	const delRoute = item
	useTagsViewStore().delView(delRoute)
	useTagsViewStore().delCachedView(delRoute)

	if (delRoute.path === route.path && index > 0) {
		router.push(topMenus.value[index - 1].path)
	}

	if (topMenus.value.length === 0) {
		if (item.path === '/index') {
			addTags()
		} else {
			router.push('/index')
		}
	}
}

const removeNow = () => {
	const delRoute = topMenus.value.find(i => i.path === route.path)
	if (!delRoute) return

	const index = topMenus.value.indexOf(delRoute)
	useTagsViewStore().delView(delRoute)
	useTagsViewStore().delCachedView(delRoute)

	if (delRoute.path === route.path && index > 0 && topMenus.value.length > 0) {
		router.push(topMenus.value[index - 1].path)
	}

	if (topMenus.value.length === 0) {
		router.push('/index')
	}
}

// 关闭其他
const removeOther = () => {
	const currentRoute = topMenus.value.find(i => i.path === route.path)
	if (!currentRoute) return

	useTagsViewStore().delOthersViews(currentRoute)
}

// 关闭所有
const removeAll = () => {
	useTagsViewStore().delAllViews()
	router.push('/index')
}

// 滚动功能
const scrollLeft = () => {
	if (menuContainer.value) {
		menuContainer.value.scrollBy({ left: -300, behavior: 'smooth' })
	}
}

const scrollRight = () => {
	if (menuContainer.value) {
		menuContainer.value.scrollBy({ left: 300, behavior: 'smooth' })
	}
}

// 检查滚动状态
const checkScrollStatus = () => {
	if (!menuContainer.value) return

	const { scrollLeft, scrollWidth, clientWidth } = menuContainer.value
	canScrollLeft.value = scrollLeft > 10
	canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10
}

// 优化滚动到当前激活项的逻辑
const scrollToActiveItem = () => {
	// 检查组件是否已卸载
	if (!isComponentMounted.value) {
		return
	}

	// 清理之前的定时器
	if (scrollTimer.value) {
		clearTimeout(scrollTimer.value)
	}

	// 使用多重延迟确保DOM完全更新
	scrollTimer.value = setTimeout(() => {
		// 再次检查组件是否仍然挂载
		if (!isComponentMounted.value || !menuContainer.value) {
			return
		}

		// 使用 MutationObserver 监听DOM变化
		const observer = new MutationObserver(mutations => {
			observer.disconnect()

			// 在DOM变化完成后执行滚动
			setTimeout(() => {
				try {
					// 最终检查组件状态和所有元素是否存在
					if (!isComponentMounted.value || !menuContainer.value || !document.contains(menuContainer.value)) {
						return
					}

					const activeItem = menuContainer.value.querySelector('.el-menu-item.is-active')
					if (!activeItem || !document.contains(activeItem)) {
						return
					}

					const container = menuContainer.value
					const containerRect = container.getBoundingClientRect()
					const itemRect = activeItem.getBoundingClientRect()

					// 检查元素是否仍然在文档中且有有效尺寸
					if (containerRect.width === 0 || itemRect.width === 0) {
						return
					}

					const itemLeftInContainer = itemRect.left - containerRect.left
					const itemRightInContainer = itemRect.right - containerRect.left

					if (itemLeftInContainer < 0) {
						container.scrollTo({
							left: container.scrollLeft + itemLeftInContainer,
							behavior: 'smooth',
						})
					} else if (itemRightInContainer > containerRect.width) {
						container.scrollTo({
							left: container.scrollLeft + (itemRightInContainer - containerRect.width),
							behavior: 'smooth',
						})
					}
				} catch (error) {
					console.warn('scrollToActiveItem error:', error)
				}
			}, 50)
		})

		// 开始监听DOM变化
		if (menuContainer.value) {
			observer.observe(menuContainer.value, {
				childList: true,
				subtree: true,
				attributes: true,
			})
		}

		// 设置超时，防止无限等待
		setTimeout(() => {
			observer.disconnect()
		}, 1000)
	}, 200)
}

// 鼠标滚轮处理函数
const handleWheel = e => {
	e.preventDefault()
	if (menuContainer.value) {
		menuContainer.value.scrollBy({
			left: e.deltaY,
			behavior: 'smooth',
		})
	}
}

// 下拉菜单点击页面项的处理逻辑
const handleMenuSelect = item => {
	if (isHttp(item.path)) {
		window.open(item.path, '_blank')
	} else {
		router
			.push({ path: item.path })
			.then(() => {
				// 直接调用滚动函数，内部已经处理了时序
				scrollToActiveItem()
			})
			.catch(err => {
				console.error('路由跳转失败:', err)
			})
	}
	proxy.$bus.emit('closeMask')
}

watch(
	route,
	() => {
		addTags()
		// 直接调用滚动函数，内部已经处理了时序
		scrollToActiveItem()
	},
	{
		immediate: true,
	}
)

watch(
	() => topMenus.value.length,
	() => {
		nextTick(checkScrollStatus)
	}
)

// 监听搜索框输入变化
watch(searchQuery, newVal => {
	// 确保输入变化能正常触发
})

onMounted(() => {
	if (menuContainer.value) {
		menuContainer.value.addEventListener('scroll', checkScrollStatus)
	}
	window.addEventListener('resize', checkScrollStatus)
	checkScrollStatus()
})

onBeforeUnmount(() => {
	// 标记组件已卸载
	isComponentMounted.value = false

	// 清理定时器
	if (scrollTimer.value) {
		clearTimeout(scrollTimer.value)
	}

	if (menuContainer.value) {
		menuContainer.value.removeEventListener('scroll', checkScrollStatus)
	}
	window.removeEventListener('resize', checkScrollStatus)
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.module.scss';

.topmenu-wrapper {
	display: flex;
	align-items: center;
	height: 50px;
	position: relative;
	overflow: hidden;
	background-color: $top-navColor;
}

.menu-container {
	flex: 1;
	height: 100%;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.scroll-btn {
	width: 36px;
	height: 70px;
	background-color: $top-navColor;
	color: #ffffff;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	z-index: 10;
	transform: scale(0.7);

	&:hover {
		background-color: $top-hover-color;
		color: #fff;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;

		&:hover {
			background-color: $top-navColor;
			color: #c1c1c1;
		}
	}
}

.left-btn {
	border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.right-btn {
	border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.close-operations {
	margin-left: 5px;
	margin-right: 10px;
	z-index: 10;
	height: 100%;
	width: 35px;
	display: flex;
	justify-content: center;
	align-items: center;

	&:hover {
		background-color: $top-hover-color;
		color: #fff;
		cursor: pointer;
	}
}

.el-menu {
	background-color: $top-navColor;
	height: 50px;
	width: max-content;
}

.el-menu--horizontal {
	border-bottom: none;
}

.topmenu-container.el-menu--horizontal > .el-menu-item {
	float: left;
	height: 50px !important;
	line-height: 50px !important;
	color: #c1c1c1;
	border-bottom: none;
	padding: 0 20px;
	white-space: nowrap;

	&:hover {
		background-color: $top-hover-color !important;
	}
}

.topmenu-container.el-menu--horizontal .el-menu-item:not(.is-disabled):focus {
	background-color: $top-navColor !important;
}

:deep(.el-menu--popup) {
	width: 170px;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active {
	color: #ffffff !important;
	background-color: $top-active-color;
}

.close {
	padding: 2px;
	border-radius: 12px;
	transition: all 0.5s ease;
	cursor: pointer;

	&:hover {
		background: #8b8b8b;
	}
}

.el-divider {
	margin: 0.75rem 0;
}

/* 下拉菜单优化样式 */
:deep(.el-dropdown-menu) {
	padding: 0 !important;
}

.dropdown-content {
	max-height: 300px;
	display: flex;
	flex-direction: column;
}

/* 搜索框样式优化 - 解决无法删除问题 */
.search-wrapper {
	padding: 8px;
	border-bottom: 1px solid #eee;
	/* 确保输入框不受父元素事件影响 */
	pointer-events: auto;

	:deep(.el-input) {
		width: 100%;
		--el-input-bg-color: #f5f5f5;

		&:hover {
			--el-input-hover-border-color: $top-active-color;
		}
	}

	:deep(.el-input__inner) {
		background-color: #f5f5f5;
		border-radius: 4px;
		/* 确保输入框可以获得焦点并响应键盘事件 */
		pointer-events: auto;
		user-select: text;
	}

	/* 确保清除按钮可以点击 */
	:deep(.el-input__clear) {
		pointer-events: auto;
	}
}

.dropdown-items {
	flex: 1;
	overflow-y: auto;
	scrollbar-width: thin;
	scrollbar-color: rgba(150, 150, 150, 0.5) transparent;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: rgba(150, 150, 150, 0.5);
		border-radius: 2px;
	}
}

:deep(.el-dropdown-item) {
	padding: 10px 15px;
	margin: 0;
	transition: all 0.2s ease;

	&:hover {
		background-color: $top-hover-color;
		color: #fff;
	}

	&.is-disabled {
		color: #999;
		background-color: transparent;
		cursor: default;
	}
}

.dropdown-footer {
	display: flex;
	width: 100%;
	justify-content: space-between;
	height: 40px;
	color: #8b8b8b;
	align-items: center;
	background-color: #f5f5f5;
	padding: 0 10px;
	border-top: 1px solid #eee;
}

.dropdown-btn {
	flex: 1;
	text-align: center;
	height: 100%;
	line-height: 40px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		color: #ffffff !important;
		background-color: $top-active-color;
	}
}
</style>
