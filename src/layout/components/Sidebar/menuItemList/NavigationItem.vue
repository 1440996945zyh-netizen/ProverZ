<template>
	<!-- 菜单容器 -->
	<div class="menu-wrapper">
		<!-- 遍历优化后的菜单列 -->
		<div class="menu-columns">
			<!-- 每列菜单 -->
			<div v-for="(column, colIndex) in optimizedColumns" :key="colIndex" class="menu-column">
				<!-- 列中的二级菜单 -->
				<div
					v-for="secondLevel in column"
					:key="secondLevel.id"
					class="second-level-container"
					@mouseenter="handleMouseEnter(secondLevel)"
					@mouseleave="handleMouseLeave(secondLevel)"
					@click="!hasThirdLevel(secondLevel) && handleMenuSelect(secondLevel)"
				>
					<!-- :class="{ 'has-third-level': hasThirdLevel(secondLevel) }"  颜色变化 -->
					<!-- 二级菜单标题 -->
					<div class="title-wrapper">
						<span class="second-level-title" :class="{ 'clickable-title': !hasThirdLevel(secondLevel) }">
							{{ secondLevel.meta.title }}
							<!-- 二级向右箭头 -->
							<span class="caret-right" v-show="!hasThirdLevel(secondLevel)">
								<el-icon color="#343a40" style="height: 0.6em; width: 0.6em"><arrow-right-bold /></el-icon>
							</span>
							<!-- 二级向下箭头 -->
							<span class="caret-bottom" v-show="hasThirdLevel(secondLevel)">
								<el-icon style="color: #808080; height: 0.6em; width: 0.6em"><arrow-down-bold /></el-icon>
							</span>
						</span>
						<!-- 只有没有三级菜单的二级菜单才显示星星图标 -->
						<img
							@click.stop="collectMenu(secondLevel.id, secondLevel.meta.collect, secondLevel.meta.title)"
							class="star-icon"
							v-show="shouldShowStar(secondLevel) && !hasThirdLevel(secondLevel)"
							:src="secondLevel.meta.collect ? FullStar : Star"
							alt="收藏"
						/>
					</div>

					<!-- 只有存在三级菜单时才显示三级菜单列表容器 -->
					<div v-if="hasThirdLevel(secondLevel)" class="third-level-list">
						<!-- 遍历三级菜单 -->
						<div
							v-for="thirdLevel in secondLevel.children"
							:key="thirdLevel.id"
							class="third-level-item"
							@click="handleMenuThirdSelect(secondLevel, thirdLevel)"
							@mouseenter="handleMouseEnter(thirdLevel)"
							@mouseleave="handleMouseLeave(thirdLevel)"
						>
							<span>{{ thirdLevel.meta.title }}</span>
							<img
								@click.stop="collectMenu(thirdLevel.id, thirdLevel.meta.collect, thirdLevel.meta.title)"
								class="star-icon"
								v-show="shouldShowStar(thirdLevel)"
								:src="thirdLevel.meta.collect ? FullStar : Star"
								alt="收藏"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// 脚本部分保持不变
import { ref, computed, onMounted } from 'vue'
import AppLink from '@/layout/components/Sidebar/Link'
import { isExternal } from '@/utils/common/form-validation'
import { getNormalPath } from '@/utils/common/core'
import useAppStore from '@/store/modules/app'
import { getCurrentInstance } from 'vue'
import request from '@/utils/auth/request'
import usePermissionStore from '@/store/modules/permission'
import Star from '@/assets/icons/star.png'
import FullStar from '@/assets/icons/full-star.png'

const permissionStore = usePermissionStore()
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))

const { proxy } = getCurrentInstance()
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

// 基础配置
const ITEM_BASE_HEIGHT = 50 // 基础高度(标题高度)
const ITEM_ROW_HEIGHT = 45 // 每个三级菜单项高度
const COLUMN_COUNT = 3 // 列数

// 二级菜单数据
const secondLevelMenus = ref([])

// 判断是否有三级菜单的工具函数
const hasThirdLevel = secondLevel => {
	return secondLevel.children && secondLevel.children.length > 0
}

// 计算单个二级菜单容器所需高度（用于布局优化）
const calculateMenuHeight = menu => {
	// 基础高度(标题) + 每个三级菜单的高度 + 内边距
	const thirdLevelCount = hasThirdLevel(menu) ? menu.children.length : 0
	return ITEM_BASE_HEIGHT + thirdLevelCount * ITEM_ROW_HEIGHT + 32
}

// 检查是否只有一个二级菜单有三级菜单
const hasSingleThirdLevelMenu = menus => {
	const hasThirdCount = menus.filter(menu => hasThirdLevel(menu)).length
	return hasThirdCount === 1
}

const optimizeColumnLayout = menus => {
	// 分离有三级菜单和没有三级菜单的菜单
	const hasThirdLevelMenus = menus.filter(menu => hasThirdLevel(menu))
	const normalMenus = menus.filter(menu => !hasThirdLevel(menu))

	// 只有一个有三级菜单的菜单时，将其放在最后
	let processedMenus
	if (hasThirdLevelMenus.length === 1) {
		processedMenus = [...normalMenus, ...hasThirdLevelMenus]
	} else {
		processedMenus = [...menus]
	}

	// 为每个菜单计算高度并添加到对象中
	const menusWithHeight = processedMenus.map(menu => ({
		...menu,
		calculatedHeight: calculateMenuHeight(menu),
		originalIndex: menus.indexOf(menu), // 保存原始索引
	}))

	// 初始化列数组
	const columns = Array.from({ length: COLUMN_COUNT }, () => ({
		items: [],
		totalHeight: 0,
	}))

	// 按原始顺序处理菜单，保持顺序的同时尽量均衡高度
	menusWithHeight.forEach(menu => {
		// 找到当前总高度最小的列
		const minColumn = columns.reduce((min, current) => {
			return current.totalHeight < min.totalHeight ? current : min
		}, columns[0])

		// 将菜单添加到该列
		minColumn.items.push(menu)
		minColumn.totalHeight += menu.calculatedHeight
	})
	// 返回仅包含菜单项的列数组
	return columns.map(column => column.items)
}
// 处理菜单数据
const processMenuData = () => {
	const childrenArr = props.item.children || []
	const visibleMenus = childrenArr.filter(item => !item.hidden)

	// 为每个菜单项添加收藏状态和hover状态
	visibleMenus.forEach(item => {
		item.meta = item.meta || {}
		item.meta.collect = item.isQuickEnter == 1
		item.meta.hover = false
		item.parent = props.item
		// 处理三级菜单
		if (item.children && item.children.length) {
			item.children.forEach(child => {
				child.meta = child.meta || {}
				child.meta.collect = child.isQuickEnter == 1
				child.meta.hover = false
			})
		}
	})

	secondLevelMenus.value = visibleMenus
}

// 优化后的菜单列
const optimizedColumns = computed(() => {
	return optimizeColumnLayout(secondLevelMenus.value)
})
// 判断是否应该显示星星图标
const shouldShowStar = menuItem => {
	return menuItem.meta.hover || menuItem.isQuickEnter == 1 || menuItem.meta.collect
}

// 鼠标进入显示星星
const handleMouseEnter = menuItem => {
	menuItem.meta.hover = true
}

// 鼠标离开隐藏星星（如果未收藏）
const handleMouseLeave = menuItem => {
	if (!menuItem.meta.collect) {
		menuItem.meta.hover = false
	}
}

// 选择菜单处理方法
const handleMenuSelect = menuItem => {
	console.log('选中的菜单:', menuItem)

	// 路由跳转逻辑
	const path = resolvePath(menuItem.path, menuItem.meta?.query)
	console.log(path)
	if (path) {
		if (menuItem.isFrame == 0) {
			// 构建完整的URL，包含noLayout参数
			const fullUrl = new URL(path, window.location.origin)
			fullUrl.searchParams.set('noLayout', 'true')

			// 在新标签页中打开
			const newWindow = window.open(fullUrl.toString(), '_blank')
			if (newWindow) {
				newWindow.focus()
				proxy.$bus.emit('closeMask')
			}
		} else {
			proxy.$router.push(path)
			proxy.$bus.emit('closeMask')
		}
	}
}
/**
 * 三级菜单点击事件
 * @param secondLevel 二级菜单
 * @param menuItem 三级菜单
 */
const handleMenuThirdSelect = (secondLevel, menuItem) => {
	const basePath = secondLevel.path + '/' + menuItem.path
	// 路由跳转逻辑
	const path = resolvePath(basePath, menuItem.meta?.query)
	if (path) {
		proxy.$router.push(path)
		proxy.$bus.emit('closeMask')
	}
}

// 跳转的路径
function resolvePath(routePath, routeQuery) {
	if (isExternal(routePath)) {
		return routePath
	}
	if (isExternal(props.basePath)) {
		return props.basePath
	}
	if (routeQuery) {
		let query = JSON.parse(routeQuery)
		return { path: getNormalPath(props.basePath + '/' + routePath), query: query }
	}
	return getNormalPath(props.basePath + '/' + routePath)
}

// 收藏菜单
const collectMenu = (menuId, collectStatus, title) => {
	const addCollect = data => {
		return request({
			url: '/api/v1/internal/sysCustomRegion/add',
			method: 'post',
			data,
			loading: false,
		})
	}
	const params = {
		menuId,
		menuName: title,
		isQuickEnter: collectStatus ? '0' : '1',
	}

	// 更新本地状态
	const updateCollectStatus = menus => {
		for (const menu of menus) {
			if (menu.id === menuId) {
				menu.meta.collect = !collectStatus
				return true
			}
			if (menu.children && menu.children.length) {
				if (updateCollectStatus(menu.children)) {
					return true
				}
			}
		}
		return false
	}

	updateCollectStatus(secondLevelMenus.value)

	// 提交到服务器
	addCollect(params).then(res => {
		proxy.$bus.emit('changeQuick')
		usePermissionStore().generateRoutes()
	})
}

onMounted(() => {
	processMenuData()
})
</script>

<style lang="scss" scoped>
.menu-wrapper {
	padding: 8px 0;
	overflow: hidden;
	overflow-y: auto;
}

// 菜单列容器
.menu-columns {
	display: flex;
	gap: 12px;
	width: 100%;
}

// 单列容器
.menu-column {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

/* 二级菜单容器 - 宽度100%，高度由内容撑开 */
.second-level-container {
	width: 100%;
	box-sizing: border-box;
	border-radius: 4px;
	padding: 7px;
	background-color: #e3f2fd; /* 默认背景色（没有三级菜单的） */
	transition: all 0.2s ease;
	position: relative;
	display: inline-block;
	border: solid 1px #cfe2ff;
}

/* 有三级菜单的二级菜单样式 - 更浅的背景色 */
.second-level-container.has-third-level {
	background-color: #edf7ff; /* 比默认色更浅 */
	border-color: #d9ecff; /* 边框色也相应调浅 */
}

.second-level-container:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 标题和星星容器 */
.title-wrapper {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10px;
	margin-bottom: 10px;
}

/* 二级菜单标题 */
.second-level-title {
	font-weight: normal;
	font-size: 16px;
	color: rgb(102 107 114);
	padding-bottom: 8px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

/* 没有三级菜单时的标题样式调整 */
.second-level-container:not(:has(.third-level-list)) .second-level-title {
	padding-bottom: 0;
	color: #343a40;
	font-weight: normal;
}

/* 可点击的二级标题样式 */
.clickable-title {
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		color: #096dd9;
	}
}

/* 星星图标样式 */
.star-icon {
	width: 14px;
	height: 14px;
	cursor: pointer;
	margin-left: 8px;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.1);
	}
}

/* 三级菜单列表 - 由内容决定高度 */
.third-level-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-top: 8px; /* 与标题保持适当距离 */
}

/* 三级菜单项 */
.third-level-item {
	padding: 6px 4px 6px 15px;
	color: #555;
	cursor: pointer;
	border-radius: 2px;
	transition: all 0.2s ease;
	font-size: 13px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-weight: normal;

	&:hover {
		background-color: #f5f7fa;
		color: #1890ff;
	}
}

/* 选中状态 */
.third-level-item.selected,
.clickable-title.selected {
	background-color: #e6f7ff;
	color: #1890ff;
	font-weight: 500;
}

.caret-bottom,
.caret-right {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 3px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
	.menu-columns {
		flex-wrap: wrap;
	}

	.menu-column {
		flex: 0 0 calc(50% - 6px);
	}
}

@media (max-width: 768px) {
	.menu-columns {
		flex-direction: column;
	}

	.menu-column {
		flex: 0 0 100%;
	}
}
</style>
