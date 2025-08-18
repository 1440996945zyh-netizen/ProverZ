<template>
	<div class="navigation">
		<!-- 外层使用flex容器实现横向布局 -->
		<div class="navigation-container">
			<!-- <NavigationItem
				v-for="(route, index) in showMenuList"
				:key="route.path + index"
				:item="route"
				:base-path="route.path"
				:level="1"
			/> -->
			<EachartNavigation
				:menu-data="showMenuList"
				:chart-config="chartSettings"
			/>
		</div>
	</div>
</template>

<script setup>
import usePermissionStore from '@/store/modules/permission'
import NavigationItem from './NavigationItem'
import EachartNavigation from './EachartNavigation'
import { computed ,watchEffect,ref} from 'vue'

const permissionStore = usePermissionStore()
const showMenuList = computed(() => {
	return permissionStore.routes.filter(item => !item.hidden && item.path)
})

// 递归统计所有层级中显示的菜单（hidden: false）的总数量
const countAllMenus = (menus) => {
  if (!menus || !menus.length) return 0 // 非数组或空数组直接返回0
  let total = 0
  menus.forEach(item => {
    // 只统计显示的菜单（hidden: false）
    if (!item.hidden) {
      total += 1 // 当前菜单计数+1
      // 递归统计子菜单
      if (item.children && item.children.length) {
        total += countAllMenus(item.children)
      }
    }
  })
  return total
}

// 计算所有层级的菜单总数量
const totalMenuCount = computed(() => {
  return countAllMenus(showMenuList.value)
})

// 图表设置
const chartSettings = ref({
  height: '100vh', // 初始高度
  layerPadding: 0,
  distance: 0,
})

// 监听菜单总数变化，计算总高度
watchEffect(() => {
  // 总高度 = 总数量 × 单个菜单高度（40px）
  const totalHeight = totalMenuCount.value * 45 + 'px'
  chartSettings.value.height = totalHeight
})
</script>

<style lang="scss" scoped>
.navigation {
	margin: 20px 20px 0px;
	height: calc(100vh - 70px);
	overflow-x: auto;
	overflow-y: auto;
	padding-bottom: 10px;
}

/* 横向布局容器 */
.navigation-container {
	display: flex;
	//   align-items: center;
	flex-direction: column;
	gap: 10px; /* 同级菜单间距 */
	min-width: max-content; /* 确保内容不被压缩 */
}
</style>