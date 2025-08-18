<template>
	<div
		:style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }"
		@mouseenter="handleMouseenter"
		@mouseleave="handleMouseleave"
	>
		<el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
			<el-menu
				:default-active="activeMenu"
				:collapse="isCollapse"
				:background-color="sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground"
				:text-color="sideTheme === 'theme-dark' ? variables.menuColor : variables.menuLightColor"
				:unique-opened="true"
				:active-text-color="theme"
				:collapse-transition="false"
				mode="vertical"
			>
				<div v-if="settingsStore.topNav">
					
					<topNavSidebarItem
						v-for="(route, index) in sidebarRouters"
						:key="route.path + index"
						:item="route"
						:base-path="route.path"
						@checkMenu="checkMenu"
					/>
				</div>
				<div v-else>
					<sidebar-item
						v-for="(route, index) in sidebarRouters"
						:key="route.path + index"
						:item="route"
						:base-path="route.path"
					/>
				</div>
			</el-menu>
		</el-scrollbar>
	</div>
</template>

<script setup name="Sidebar">
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import topNavSidebarItem from './topNavSidebarItem'

import variables from '@/assets/styles/variables.module.scss'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
const emit = defineEmits(['checkMenu', 'mouseLeave'])

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter(i => i.hidden == false))
console.log(sidebarRouters.value, 'sidebarRouters')
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)
// 点击一级菜单
const checkMenu = item => {
	emit('checkMenu', item)
}
onMounted(() => {
	appStore.sidebar.opened = false
})
const activeMenu = computed(() => {
	const { meta, path } = route
	// if set path, the sidebar will highlight the path you set
	if (meta.activeMenu) {
		return meta.activeMenu
	}
	return path
})
const handleMouseenter = () => {
	if (settingsStore.topNav && isCollapse.value) {
		appStore.toggleSideBar()
	}
}
const handleMouseleave = () => {
	if (settingsStore.topNav && !isCollapse.value) {
		emit('mouseLeave', appStore.toggleSideBar)
	}
}
// 处理子菜单展开/折叠（侧边导航用）
const handleToggleSubmenu = (itemId, isOpen) => {
	// 可在这里添加全局展开状态管理逻辑
}

</script>

<style lang="scss" scoped>
.sidebar-container {
	height: 100vh;
	overflow: hidden;
}

:deep(.el-scrollbar__view) {
	height: 100%;
}
// 修复子菜单溢出问题
:deep(.el-menu) {
	height: 100%;
	overflow: hidden;
}
</style>
