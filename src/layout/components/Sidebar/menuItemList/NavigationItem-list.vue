<template>
	<div
		v-if="!Array.isArray(onlyOneChild)"
		class="navigation_one"
		:style="onlyOneChild.meta.title == '首页' ? { display: 'none' } : ''"
		@click="selectMenu"
		@mouseenter="handleMouseenter"
		@mouseleave="handleMouseleave"
	>
		<app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)" class="menu-box">
			<span class="menu-title" :class="{ 'submenu-title-noDropdown': !isNest }" :title="hasTitle(onlyOneChild.meta.title)">
				{{ onlyOneChild.meta.title }}
			</span>
		</app-link>
		<img
			@click.stop="collectMenu"
			style="margin-top: -2px"
			v-show="onlyOneChild.meta.hover || onlyOneChild.isQuickEnter == 1 || onlyOneChild.meta.collect"
			:src="onlyOneChild.meta.collect ? FullStar : Star"
			alt=""
			width="14"
			height="14"
		/>
	</div>
	<div v-else class="navigation_more">
		<div class="navigation_item_title" v-if="!item.path.includes('/')">{{ item.meta.title }}</div>
		<div class="navigation_item" :class="!item.path.includes('/') ? 'erji' : 'df'">
			<NavigationItem
				v-for="(child, index) in item.children"
				:key="index + Math.random() * 10 + Math.random() * 10"
				:is-nest="true"
				:item="child"
				:base-path="resolvePath(child.path)"
			/>
		</div>
	</div>
</template>
<script setup>
import AppLink from '@/layout/components/Sidebar/Link'
import { isExternal } from '@/utils/verify/validate'
import { getNormalPath } from '@/utils/common/common'
import useAppStore from '@/store/modules/app'
import { getCurrentInstance } from 'vue'
import Star from '../../../../assets/icons/star.png'
import FullStar from '../../../../assets/icons/full-star.png'
import request from '@/utils/auth/request'
import usePermissionStore from '@/store/modules/permission'
const permissionStore = usePermissionStore()
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))

const { proxy } = getCurrentInstance()
const props = defineProps({
	// route object
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
const onlyOneChild = ref({ meta: { title: '' } }) // 只有一个children的
// 获取onlyOneChild
const childrenArr = props.item.children || []
childrenArr.forEach(item => {
	item.meta.collect = item.isQuickEnter == 1
})
onlyOneChild.value = childrenArr.filter(item => !item.hidden)
if (onlyOneChild.value.length == 0) {
	onlyOneChild.value = { ...props.item, path: '', noShowingChildren: true }
}
// 判断是否只有一个children
function hasOneShowingChild(children = [], parent) {
	if (!children) {
		children = []
	}
	const showingChildren = children.filter(item => {
		if (item.hidden) {
			return false
		} else {
			// Temp set(will be used if only has one showing child)
			item.meta.collect = item.isQuickEnter == 1
			onlyOneChild.value = item
			return true
		}
	})
	// When there is only one child router, the child router is displayed by default
	if (showingChildren.length === 1) {
		return true
	}

	// Show parent if there are no child router to display
	if (showingChildren.length === 0) {
		onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
		// console.log('123ab', onlyOneChild.value)
		return true
	}
	console.log(onlyOneChild.value, 'onlyOneChild.value111aaaaa')
	return false
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
function hasTitle(title) {
	if (title.length > 5) {
		return title
	} else {
		return ''
	}
}
// 选择菜单
const selectMenu = () => {
	console.log(onlyOneChild.value, 'onlyOneChildonlyOneChild')
	proxy.$bus.emit('closeMask')
}
// 收藏菜单
const collectMenu = () => {
	const addCollect = data => {
		return request({
			url: '/api/v1/internal/sysCustomRegion/add',
			method: 'post',
			data,
			loading: false,
		})
	}
	const params = {
		menuId: onlyOneChild.value.id,
		menuName: onlyOneChild.value.meta.title,
		isQuickEnter: onlyOneChild.value.meta.collect ? '0' : '1',
	}
	onlyOneChild.value.meta.collect = !onlyOneChild.value.meta.collect
	addCollect(params).then(res => {
		console.log(onlyOneChild.value, 'onlyOneChild.value')
		proxy.$bus.emit('changeQuick')
		usePermissionStore().generateRoutes()
	})
}
const handleMouseenter = () => {
	onlyOneChild.value.meta.hover = true
}
const handleMouseleave = () => {
	onlyOneChild.value.meta.hover = false
}

onMounted(() => {})
</script>
<style lang="scss" scoped>
.navigation_one {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: calc(33.3333% - 5px);
	height: 55px;
	line-height: 55px;
	padding-right: 16px;
	white-space: nowrap; /* 不换行 */
	overflow: hidden; /* 内容超出容器大小则隐藏 */
	text-overflow: ellipsis; /* 显示省略号 */
	font-size: 14px;
	font-weight: 700;
	cursor: pointer;
	color: #1c1c1c;
	&:hover {
		color: #366bfc;
		transition: 0.28s all;
	}
}
.navigation_item {
	color: #666;
	width: 100%;
	flex-wrap: wrap;
}
.navigation_item .navigation_more {
	width: calc(33.3333% - 5px);
}
.navigation_item_title {
	width: 120px;
	height: 50px;
	color: #1c1c1c;
	font-size: 14px;
	font-weight: 700;
	white-space: nowrap; /* 不换行 */
	overflow: hidden; /* 内容超出容器大小则隐藏 */
	text-overflow: ellipsis; /* 显示省略号 */
	display: flex;
	align-items: center;
}
.df {
	display: flex;
}
.erji .navigation_one {
	width: 100%;
	color: #666;
	font-size: 12px;
	font-weight: 500;
	padding-left: 10px;
	height: 35px;
	line-height: 35px;
}
.menu-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 0 15px 0 0;
}
</style>
