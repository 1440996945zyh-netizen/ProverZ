<template>
	<div class="menuList">
		<div class="title">
			<div class="title_text">{{ menuList[0]?.meta?.title || '菜单列表' }}</div>
			<div class="title_icon" @click="closeMask">
				<Close />
			</div>
		</div>
		<!-- 新增菜单容器，用于统一管理展开状态 -->
		<div class="menu-container">
			<NavigationItem
				v-for="(route, index) in filteredMenuList"
				:key="route.id || (route.path + index)"
				:item="route"
				:base-path="route.path"
				:level="1"
				@toggle-submenu="handleToggleSubmenu"
			/>
		</div>
	</div>
</template>
<script setup name="menuItemList">
import { ref, computed, watch } from 'vue'
import usePermissionStore from '@/store/modules/permission'
import NavigationItem from './NavigationItem'
import { Close } from '@element-plus/icons-vue'
const permissionStore = usePermissionStore()

const props = defineProps({
	menuList: {
		type: Array,
		default: () => [],
	},
})

const emit = defineEmits(['closeMask'])

// 过滤隐藏的菜单
const filteredMenuList = computed(() => {
	return props.menuList.filter(item => !item.hidden)
})
console.log("filteredMenuList.value=================>",filteredMenuList.value)

// 管理子菜单展开状态（键: 菜单ID, 值: 是否展开）
const expandedMenus = ref({})

// 处理子菜单展开/折叠
const handleToggleSubmenu = (menuId, isOpen) => {
	expandedMenus.value[menuId] = isOpen
}

// 关闭遮罩
const closeMask = () => {
	emit('closeMask')
}

// 监听菜单数据变化，重置展开状态
watch(() => props.menuList, () => {
	expandedMenus.value = {}
})
</script>
<style lang="scss" scoped>
.menuList {
	padding: 20px;
	height: 100%;
	border-bottom: none;
	overflow: auto;
	border-left: 1px solid #ddd;
	border-top-right-radius: 10px;
	border-bottom-right-radius: 10px;

	.title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 36px;
		font-size: 18px;
		font-weight: 700;
		color: #1c1c1c;
		padding-bottom: 10px;
		border-bottom: 1px solid #ddd;

		.title_icon {
			width: 16px;
			height: 16px;
			cursor: pointer;
			transition: transform 0.2s;

			&:hover {
				transform: rotate(90deg);
			}
		}
	}

	.menu-container {
		padding-top: 15px;
		//添加距离底部50px
		padding-bottom:50px;
	}
}
</style>
