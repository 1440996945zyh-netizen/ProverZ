<template>
	<div class="menu-item" :class="['level-' + level]">
		<!-- 单节点菜单（叶子节点） -->
		<div
			v-if="hasOneShowingChild && (!onlyOneChild.children || !hasValidChildrenForOneChild) && !item.alwaysShow"
			class="menu-node single-node"
			:style="onlyOneChild.meta.title === '首页' ? { display: 'none' } : ''"
		>
			<app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
				<span class="menu-label" :title="hasTitle(onlyOneChild.meta.title)">
					{{ onlyOneChild.meta.title }}
				</span>
			</app-link>
		</div>

		<!-- 多节点菜单（父节点） -->
		<div v-else class="menu-node multi-node">
			<div class="parent-header">
				<!-- 一级菜单和有三级菜单的二级菜单不可点击 -->
				<app-link
					v-if="item.meta && !(level === 1 || (level === 2 && hasValidChildren))"
					:to="resolvePath(item.path, item.query)"
					:class="{ clickable: !(level === 1 || (level === 2 && hasValidChildren)) }"
				>
					<span class="menu-label">{{ item.meta.title }}</span>
				</app-link>
				<!-- 一级菜单和有三级菜单的二级菜单不使用链接 -->
				<span v-else-if="item.meta && (level === 1 || (level === 2 && hasValidChildren))" class="menu-label non-clickable">
					{{ item.meta.title }}
				</span>
			</div>

			<!-- 仅当有有效子菜单时，才渲染子容器 -->
			<div class="children-container" v-if="hasValidChildren">
				<navigation-item
					v-for="(child, index) in filteredChildren"
					:key="child.path"
					:is-nest="true"
					:item="child"
					:base-path="child.children ? resolvePath(child.path) : resolvePath('')"
					:level="level + 1"
					:is-last-sibling="index === filteredChildren.length - 1"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import AppLink from '@/layout/components/Sidebar/Link'
import { isExternal } from '@/utils/verify/validate'
import { getNormalPath } from '@/utils/common/common'
import { computed, ref } from 'vue'

const props = defineProps({
	item: { type: Object, required: true },
	isNest: { type: Boolean, default: false },
	basePath: { type: String, default: '' },
	level: { type: Number, default: 1 },
	isLastSibling: { type: Boolean, default: false },
})

const onlyOneChild = ref({})
const hasOneShowingChild = computed(() => {
	const children = props.item.children || []
	const showingChildren = children.filter(item => !item.hidden)
	if (showingChildren.length === 1) {
		onlyOneChild.value = showingChildren[0]
		return true
	}
	return false
})
// 增强：过滤冗余子菜单
const filteredChildren = computed(() => {
	const parentPath = props.item.path || '' // 父菜单path
	const children = props.item.children || []

	return children.filter(child => {
		// 条件1：不隐藏
		const isVisible = !child.hidden
		// 条件2：子菜单path与父菜单path不同（排除复制体）
		const isDifferentPath = child.path !== parentPath
		// 条件3：是有效页面（有标题或组件，避免空节点）
		const isValidPage = child.meta?.title || child.component

		return isVisible && isDifferentPath && isValidPage
	})
})
// 新增：判断是否有有效子菜单（用于控制是否渲染子菜单容器）
const hasValidChildren = computed(() => {
	return filteredChildren.value.length > 0
})
const hasChildren = computed(() => {
	const children = props.item.children || []
	return children.some(child => !child.hidden)
})

function resolvePath(routePath, routeQuery) {
	if (isExternal(routePath)) {
		return routePath
	}

	if (routePath.startsWith('/')) {
		const fullPath = getNormalPath(routePath)
		return fullPath
	}

	const base = props.basePath || ''
	let fullPath = base ? `${base}/${routePath}` : routePath
	fullPath = getNormalPath(fullPath)

	return fullPath
}

function hasTitle(title) {
	return title && title.length > 5 ? title : ''
}
</script>
<style lang="scss" scoped>
// 颜色变量
$primary-color: #409eff;
$border-color: #d3d3d3;
$hover-bg: #f5f7fa;
$level-1-bg: #ffffff;
$level-2-bg: #fafafa;
$level-3-bg: #f5f5f5;
$level-4-bg: #f0f0f0;

// 菜单颜色区分
$level-1-color: #333333;
$level-2-color: #333333;
$level-3-color: #666666;

$arrow-size: 6px;
$border-radius: 4px;
$transition: all 0.2s ease;

.menu-item {
	display: inline-flex;
	position: relative;
	margin-right: 12px;

	&:last-child {
		margin-right: 0;
	}
}

.menu-node {
	display: inline-block;
	vertical-align: top;
}

/* 单节点菜单 */
.single-node {
	.menu-label {
		display: inline-block;
		padding: 6px 14px;
		border: 1px dashed $border-color;
		white-space: nowrap;
		cursor: pointer;
		transition: $transition;

		&:hover {
			background-color: $hover-bg;
			border-color: $primary-color;
		}
	}
}

/* 多节点菜单 */
.multi-node {
	.parent-header {
		margin-bottom: 12px;
	}

	.menu-label {
		display: inline-block;
		min-width: 100px;
		height: 30px;
		text-align: center;
		line-height: 30px;
		border: 1px dashed $border-color;
		white-space: nowrap;
		transition: $transition;

		&:hover {
			background-color: $hover-bg;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
			transform: translateY(-1px);
		}
	}

	.children-container {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		padding-top: 6px;
	}
}

/* 箭头样式 */
.arrow {
	position: absolute;
	z-index: 10;
}

.right-arrow {
	top: 50%;
	right: -8px;
	transform: translateY(-50%);
	border-top: $arrow-size solid transparent;
	border-bottom: $arrow-size solid transparent;
	border-left: $arrow-size solid $primary-color;
}

.down-arrow {
	left: 50%;
	bottom: -8px;
	transform: translateX(-50%);
	border-left: $arrow-size solid transparent;
	border-right: $arrow-size solid transparent;
	border-top: $arrow-size solid $primary-color;
}

/* 层级样式 */
.level-1 {
	border: 1px dashed rgba($color: #409eff, $alpha: 0.5);
	padding: 5px;

	.menu-label {
		background-color: $level-1-bg;
		border-width: 1.5px;
		font-size: 16px;
		font-weight: bold;
		color: $level-1-color;
	}

	.multi-node .children-container {
		margin-top: 12px;
	}

	/* 一级菜单不可点击样式 */
	.non-clickable {
		cursor: default; /* 默认鼠标样式 */

		&:hover {
			/* 移除悬停效果 */
			background-color: $level-1-bg;
			box-shadow: none;
			transform: none;
			border-color: $border-color;
		}
	}
}

// 二级菜单样式 - 有/无三级菜单的区分
.level-2 {
	.menu-label {
		/* 二级菜单基础样式 */
		font-size: 15px; /* 二级菜单字体稍大 */
		color: $level-2-color; /* 二级菜单颜色 */
		background-color: $level-2-bg;
	}

	/* 有三级菜单的二级菜单 - 不可点击 */
	.non-clickable {
		cursor: default; /* 默认鼠标样式 */
		opacity: 0.9;

		&:hover {
			/* 移除悬停效果 */
			background-color: $level-2-bg;
			box-shadow: none;
			transform: none;
			border-color: $border-color;
		}
	}

	/* 无三级菜单的二级菜单 - 可点击 */
	.clickable .menu-label {
		cursor: pointer; /* 小手鼠标样式 */
		font-weight: bold;

		&:hover {
			border-color: $primary-color;
		}
	}

	.multi-node .children-container {
		margin-top: 6px;
		padding-left: 12px;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			height: calc(100% - 6px);
			width: 1px;
			background-color: $border-color;
		}
	}
}

// 三级菜单样式
.level-3 {
	margin-left: 12px;

	.menu-label {
		font-size: 13px; /* 三级菜单字体稍小 */
		color: $level-3-color; /* 三级菜单颜色 */
		background-color: $level-3-bg;
		cursor: pointer; /* 三级菜单可点击 */
	}
}

.level-4 {
	margin-left: 6px;

	.menu-label {
		background-color: $level-4-bg;
		opacity: 0.9;
	}
}
</style>
