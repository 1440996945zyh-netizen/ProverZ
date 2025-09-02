<template>
	<div class="quick-menu-container flex flex-wrap gap-3 p-3">
		<div class="quick-menu-card" v-for="(item, index) in menuList" :key="index" :style="{ backgroundColor: getBgColor(item.color) }">
			<app-link :to="item.path ? item.path : '/'" class="w-full h-full flex flex-col items-center justify-center p-3 applink">
				<div style="display: flex; flex-direction: column; align-items: center; justify-content: center">
					<div class="menu-icon-wrapper rounded-lg w-14 h-14 flex items-center justify-center mb-2">
						<i :class="getIcon(item.icon)" :style="{ color: item.color || '#fff', fontSize: '50px' }"></i>
					</div>
					<div class="menu-text text-sm text-center mt-1" :title="item.menuName || ''">
						{{ item.menuName || '' }}
					</div>
				</div>
			</app-link>
		</div>
	</div>
</template>

<script setup name="QuickMenu">
import AppLink from '@/layout/components/Sidebar/Link'
import useUserStore from '@/store/modules/user'
import { onMounted, getCurrentInstance, ref, computed, nextTick } from 'vue'
import { isExternal } from '@/utils/verify/validate'
import { getNormalPath } from '@/utils/commonFunc/yangyi'
import api from '@/api/system/user'
import usePermissionStore from '@/store/modules/permission'

const { proxy } = getCurrentInstance()
const permissionStore = usePermissionStore()
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))
const emit = defineEmits(['getMenuList'])
// const sideRoutes = JSON.parse(JSON.stringify(sidebarRouters.value))
let arr = []
sidebarRouters.value.forEach(v => {
	// 去掉 children 属性，避免循环引用
	const { children, ...routeWithoutChildren } = v
	arr.push(routeWithoutChildren)
})
const sideRoutes = arr
const menuList = ref([])

// 服务图标列表
const serviceList = ref([
	{
		icon: 'iconfont icon-tubiao-01',
		id: '',
		text: '',
		color: '#F75E5E',
		radio: 1,
	},
	{
		icon: 'iconfont icon-tongyongtubiao1',
		id: '',
		text: '',
		radio: 2,
		color: '#5a59a6',
	},
	{
		icon: 'iconfont icon-zongheguanli',
		id: '',
		text: '',
		color: '#edb01b',
	},
	{
		icon: 'iconfont icon-tongyongtubiao2',
		id: '',
		text: '',
		color: '#45b6e4',
	},
	{
		icon: 'iconfont icon-danzhengzhongxin',
		id: '',
		text: '',
		color: '#80DA22',
	},
	{
		icon: 'iconfont icon-zuoye',
		id: '',
		text: '',
		color: '#F7B500',
	},
	{
		icon: 'iconfont icon-kuchangguanli',
		id: '',
		text: '',
		color: '#F75E5E',
	},
	{
		icon: 'iconfont icon-shangcaiyitihua',
		id: '',
		text: '',
		color: '#45b6e4',
	},
])

// 获取随机图标
const getQuickIcon = index => {
	if (index < serviceList.value.length) {
		return serviceList.value[index].icon
	}
	// 默认返回第一个图标
	return 'iconfont icon-shangcaiyitihua'
}

// 获取图标颜色
const getIconColor = index => {
	if (index < serviceList.value.length) {
		return serviceList.value[index].color
	}
	return '#409EFF'
}

const getMenuList = async () => {
	const res = await api.getCustomRegionList()
	menuList.value = res.data.slice(0, 8)

	nextTick(() => {
		// 为菜单项分配图标和颜色
		menuList.value.forEach((item, index) => {
			item.icon = getQuickIcon(index)
			item.color = getIconColor(index)
		})
	})
}

const getRoutes = async () => {
	addParentPath(sideRoutes)
	await getMenuList()
	menuList.value.forEach(i => {
		delete i.id
		i.path = getMenuPath(i.menuId).path
		i.icon = getMenuPath(i.menuId).icon || getQuickIcon(menuList.value.indexOf(i))
	})

	emit('getMenuList', menuList.value)
}

getRoutes()

function getMenuPath(menuId) {
	const route = findRouteById(sideRoutes, menuId)
	if (route) {
		const parentPaths = getParentPaths(route)
		return { path: parentPaths.join('/') + '/' + route.path, icon: route.icon }
	}
	return ''
}

function findRouteById(routes, id) {
	for (const route of routes) {
		if (route.id === id) {
			return route
		}
		if (route.children) {
			const found = findRouteById(route.children, id)
			if (found) {
				return found
			}
		}
	}
	return null
}

function getParentPaths(route, paths = []) {
	if (route.parentPath) {
		paths.unshift(route.parentPath)
		getParentPaths(route.parent, paths)
	}
	return paths
}

function addParentPath(routes) {
	routes.forEach(route => {
		if (route.children) {
			route.children.forEach(child => {
				child.parent = route
				child.parentPath = route.path
			})
			addParentPath(route.children)
		}
	})
}

onMounted(() => {
	proxy.$bus.on('changeQuick', () => {
		getRoutes()
	})
})

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

// 辅助方法 - 获取图标类
const getIcon = icon => {
	return icon || 'iconfont icon-danzhengzhongxin'
}

// 辅助方法 - 获取背景色
const getBgColor = color => {
	if (!color) return '#f5f7fa'
	// 创建较淡的背景色
	return `${color}1A` // 1A 表示 10% 的透明度
}
</script>

<style scoped lang="scss">
.quick-menu-container {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem; // 3px
	padding: 0.75rem; // 3px
	width: 100%;
	background-color: #ffffff;
	border-radius: 10px;
	.quick-menu-card {
		flex: 0 0 calc(12.5% - 0.65625rem); // 100% / 8 - gap
		max-width: calc(12.5% - 0.65625rem);
		height: 8rem;
		border-radius: 0.5rem;
		background-color: white;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
		cursor: pointer;
		border: 1px solid #ebeef5;
		display: flex;
		justify-content: center;
		align-items: center;
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
			border-color: #dcdfe6;
		}

		.menu-icon-wrapper {
			width: 3.5rem;
			height: 3.5rem;
			margin-bottom: 0.5rem;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.menu-text {
			font-size: 0.875rem;
			color: #606266;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}

		a {
			text-decoration: none;
			color: inherit;
		}
	}
	.applink {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	// 响应式布局
	@media (max-width: 1440px) {
		.quick-menu-card {
			flex: 0 0 calc(20% - 0.6rem); // 5个一行
			max-width: calc(20% - 0.6rem);
		}
	}

	@media (max-width: 1024px) {
		.quick-menu-card {
			flex: 0 0 calc(25% - 0.5625rem); // 4个一行
			max-width: calc(25% - 0.5625rem);
		}
	}

	@media (max-width: 768px) {
		.quick-menu-card {
			flex: 0 0 calc(33.333% - 0.5rem); // 3个一行
			max-width: calc(33.333% - 0.5rem);
		}
	}

	@media (max-width: 480px) {
		.quick-menu-card {
			flex: 0 0 calc(50% - 0.375rem); // 2个一行
			max-width: calc(50% - 0.375rem);
		}
	}
}
</style>
