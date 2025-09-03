<template>
	<!-- 使用v-show替代v-if，减少DOM频繁销毁创建 -->
	<div v-show="!item.hidden" class="menu-item-wrapper">
		<el-menu-item :index="resolvedPath" :class="{ 'submenu-title-noDropdown': !isNest }" @click="handleMenuClick">
			<!-- 简化图标显示条件，移除冗余判断 -->
			<svg-icon v-if="hasIcon" :icon-class="item.meta.icon" :color="item.menuIconColor" class="custom-color-icon" />
			<template #title>
				<div class="menu-title-container">
					<span class="menu-title" :title="shouldShowTitle ? item.meta.title : ''">
						{{ item.meta.title }}
					</span>
					<img src="@/assets/icons/right.png" alt="导航箭头" class="menu-arrow" />
				</div>
			</template>
		</el-menu-item>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { isExternal } from '@/utils/verify/validate'
import AppLink from './Link'
import { getNormalPath } from '@/utils/common/common'

// 定义清晰的props类型和默认值
const props = defineProps({
	item: {
		type: Object,
		required: true,
		default: () => ({}),
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

// 定义事件
const emit = defineEmits(['checkMenu'])

// 缓存计算结果，避免重复计算
const resolvedPath = computed(() => {
	const { path, query } = props.item
	if (isExternal(path)) {
		return path
	}
	if (isExternal(props.basePath)) {
		return props.basePath
	}

	const fullPath = getNormalPath(`${props.basePath}/${path}`)
	return query ? { path: fullPath, query: JSON.parse(query) } : fullPath
})

// 计算属性判断是否显示图标
const hasIcon = computed(() => {
	return props.item.meta?.icon // 使用可选链操作符更安全
})

// 计算属性判断是否显示标题提示
const shouldShowTitle = computed(() => {
	return props.item.meta?.title?.length > 5
})

// 子菜单处理相关逻辑
const onlyOneChild = ref({})

/**
 * 检查是否只有一个可见子菜单
 * @param {Array} children - 子菜单列表
 * @param {Object} parent - 父菜单
 * @returns {boolean} 是否只有一个可见子菜单
 */
function hasOneShowingChild(children = [], parent) {
	const showingChildren = children.filter(item => {
		if (item.hidden) return false
		// 存储唯一可见子项
		onlyOneChild.value = item
		return true
	})

	// 只有一个可见子项时返回true
	if (showingChildren.length === 1) return true

	// 没有可见子项时返回true
	if (showingChildren.length === 0) {
		onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
		return true
	}

	return false
}

/**
 * 处理菜单点击事件
 */
function handleMenuClick() {
	emit('checkMenu', props.item)
}
</script>

<style scoped lang="scss">
.menu-item-wrapper {
	transition: opacity 0.2s ease;
}

.menu-title-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
}

.menu-title {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.menu-arrow {
	width: 12px;
	height: 12px;
	opacity: 0.7;
	transition: opacity 0.2s ease;
}

/* 优化鼠标悬停效果 */
:deep(.el-menu-item:hover) .menu-arrow {
	opacity: 1;
}

/* 优化选中状态样式 */
:deep(.el-menu-item.is-active) {
	font-weight: 500;
}
svg-icon {
	width: 1.25em;
	height: 1.25em;
}
</style>
