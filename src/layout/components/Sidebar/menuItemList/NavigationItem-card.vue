<template>
	<!-- 处理一级菜单（包裹二级菜单） -->
	<div v-if="props.level === 1" class="level-1-container">
		<!-- 新增：水平对齐容器，让二级菜单同一行 -->
		<div class="level-2-align-row">
			<NavigationItem
				v-for="(child, index) in visibleChildren"
				:key="child.id || index"
				:item="child"
				:base-path="resolveBasePath()"
				:level="2"
				:is-nest="true"
			/>
		</div>
	</div>

	<!-- 处理二级菜单（Tab标签样式） -->
	<div v-else-if="props.level === 2" class="level-2-tab">
		<!-- 外层边框容器：统一包裹二级内容和三级菜单 -->
		<div class="level-2-border-container">
			<!-- 二级菜单标题区域 -->
			<div class="tab-content" @click="handleLevel2Click" :class="{ 'justify-center': !hasThirdLevel }">
				<span class="tab-title">
					{{ props.item.meta.title }}
					<!-- 有三级菜单显示下拉箭头 -->
					<el-icon v-if="hasThirdLevel" class="tab-icon" style="margin-left: 3px">
						<!-- <ArrowDownBold :class="{ rotate: showThirdLevel }" /> -->
						<CaretBottom />
					</el-icon>
					<!-- 无三级菜单显示向右箭头 -->
					<el-icon v-else class="tab-icon" size="14" style="margin-left: 3px">
						<CaretRight />
					</el-icon>
				</span>

				<!-- 无三级菜单显示收藏图标 -->
				<img
					v-if="!hasThirdLevel && showCollectIcon"
					@click.stop="collectMenu"
					style="margin-top: -2px"
					:src="props.item.meta?.collect ? FullStar : Star"
					alt="收藏"
					width="14"
					height="14"
					class="collect-icon"
				/>
			</div>

			<!-- 三级菜单容器：完全在边框内部 -->
			<div v-if="hasThirdLevel" class="level-3-container" :style="{ display: 'flex' }">
				<NavigationItem
					v-for="(child, index) in visibleChildren"
					:key="child.id || index"
					:item="child"
					:base-path="resolveBasePath()"
					:level="3"
					:is-nest="true"
				/>
			</div>
		</div>
	</div>

	<!-- 处理三级菜单 -->
	<div v-else-if="props.level === 3" class="level-3-item">
		<!-- 替换app-link为div并绑定点击事件 -->
		<div @click="handleLevel3Click" class="menu-link">
			<span class="menu-title" :title="hasTitle(props.item.meta.title)">
				{{ props.item.meta.title }}
			</span>
		</div>
		<img
			@click.stop="collectMenu"
			style="margin-top: -2px"
			v-show="showCollectIcon"
			:src="props.item.meta?.collect ? FullStar : Star"
			alt="收藏"
			width="14"
			height="14"
			class="collect-icon"
		/>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLink from '@/layout/components/Sidebar/Link'
import { isExternal } from '@/utils/verify/validate'
import { getNormalPath } from '@/utils/common/common'
import { getCurrentInstance } from 'vue'
import { ArrowDownBold, ArrowRightBold } from '@element-plus/icons-vue'
import Star from '../../../../assets/icons/star.png'
import FullStar from '../../../../assets/icons/full-star.png'
import request from '@/utils/auth/request'
import usePermissionStore from '@/store/modules/permission'

const permissionStore = usePermissionStore()
const { proxy } = getCurrentInstance()
const router = useRouter()

// 接收父组件参数
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
	level: {
		type: Number,
		default: 1,
	},
})

// 打印组件信息（初始化时）
onMounted(() => {
	// console.log(`%c[MenuDebug] 初始化 ${props.level}级菜单: ${props.item.meta?.title || '未命名'}`, 'color: #42b983')
	// console.log(`[MenuDebug] - 父级基础路径(basePath): "${props.basePath}"`)
	// console.log(`[MenuDebug] - 自身路径(item.path): "${props.item.path}"`)
})

// 可见子菜单（过滤隐藏项）
const visibleChildren = computed(() => {
	return (props.item.children || []).filter(item => !item.hidden)
})

// 是否有子菜单（用于判断是否需要传递路径给子组件）
const hasChildren = computed(() => {
	return visibleChildren.value.length > 0
})

// 是否有三级菜单（仅针对二级菜单）
const hasThirdLevel = computed(() => {
	return props.level === 2 && hasChildren.value
})

// 控制三级菜单显示/隐藏
const showThirdLevel = ref(false)

// 是否显示收藏图标
const showCollectIcon = computed(() => {
	if (props.level === 3) return true
	if (props.level === 2) return !hasThirdLevel.value
	return false
})

// 初始化收藏状态
onMounted(() => {
	if (props.item.isQuickEnter === 1) {
		props.item.meta = { ...props.item.meta, collect: true }
	}
})

// 解析传递给子组件的基础路径（核心修复）
function resolveBasePath() {
	// console.log(`%c[MenuDebug] 解析子组件基础路径 (${props.level}级菜单: ${props.item.meta?.title})`, 'color: #3498db')
	// console.log(`[MenuDebug] - 父级基础路径: "${props.basePath}"`)
	// console.log(`[MenuDebug] - 自身路径: "${props.item.path}"`)
	// console.log(`[MenuDebug] - 是否有子菜单: ${hasChildren.value}`)

	// 外部链接直接返回
	if (isExternal(props.item.path)) {
		// console.log(`[MenuDebug] - 是外部链接，直接返回: "${props.item.path}"`)
		return props.item.path
	}

	// 没有子菜单时，不需要传递路径给子组件（直接返回父级basePath）
	if (!hasChildren.value) {
		// console.log(`[MenuDebug] - 无子菜单，子组件基础路径保持父级: "${props.basePath}"`)
		return props.basePath
	}

	// 有子菜单时，计算传递给子组件的基础路径
	// 规则：父级basePath + 自身路径（仅当自身路径未包含在父级basePath中时）
	const parentBase = props.basePath.replace(/\/$/, '') // 移除父级路径末尾的斜杠
	const currentPath = props.item.path.replace(/^\//, '') // 移除自身路径开头的斜杠

	// 检查自身路径是否已包含在父级基础路径中（避免重复）
	const isPathIncluded = parentBase && parentBase.endsWith(currentPath)
	if (isPathIncluded) {
		// console.log(`[MenuDebug] - 自身路径已包含在父级基础路径中，无需重复添加`)
		return parentBase
	}

	// 拼接路径（父级basePath + 自身路径）
	const newBasePath = parentBase ? `${parentBase}/${currentPath}` : currentPath // 父级basePath为空时，直接使用自身路径
	const normalizedPath = getNormalPath(newBasePath)

	// console.log(`[MenuDebug] - 子组件基础路径: "${parentBase}" + "${currentPath}" = "${normalizedPath}"`)
	return normalizedPath
}

// 解析当前菜单的跳转路径（核心修复）
function resolvePath() {
	// console.log(`%c[MenuDebug] 解析跳转路径 (${props.level}级菜单: ${props.item.meta?.title})`, 'color: #e74c3c')
	// console.log(`[MenuDebug] - 父级基础路径: "${props.basePath}"`)
	// console.log(`[MenuDebug] - 自身路径: "${props.item.path}"`)

	// 外部链接直接返回
	if (isExternal(props.item.path)) {
		// console.log(`[MenuDebug] - 是外部链接，直接返回: "${props.item.path}"`)
		return props.item.path
	}

	// 绝对路径直接使用（不拼接父级basePath）
	if (props.item.path.startsWith('/')) {
		const fullPath = getNormalPath(props.item.path)
		// console.log(`[MenuDebug] - 是绝对路径，直接使用: "${fullPath}"`)
		return fullPath
	}

	// 相对路径：父级basePath + 自身路径（避免重复）
	const parentBase = props.basePath.replace(/\/$/, '')
	const currentPath = props.item.path.replace(/^\//, '')

	// 检查自身路径是否已包含在父级basePath中（避免重复）
	const isPathIncluded = parentBase && parentBase.endsWith(currentPath)
	if (isPathIncluded) {
		// console.log(`[MenuDebug] - 自身路径已包含在父级基础路径中，直接使用父级路径`)
		return parentBase
	}

	// 拼接路径
	const fullPath = parentBase ? `${parentBase}/${currentPath}` : currentPath
	const normalizedPath = getNormalPath(fullPath)

	// console.log(`[MenuDebug] - 最终跳转路径: "${parentBase}" + "${currentPath}" = "${normalizedPath}"`)
	return normalizedPath
}

function hasTitle(title) {
	return title.length > 5 ? title : ''
}

// 二级菜单点击处理
const handleLevel2Click = () => {
	// console.log(`%c[MenuDebug] 点击${props.level}级菜单: ${props.item.meta?.title}`, 'color: #f39c12')
	if (hasThirdLevel.value) {
		showThirdLevel.value = !showThirdLevel.value
		// console.log(`[MenuDebug] - 切换三级菜单显示状态: ${showThirdLevel.value}`)
	} else {
		// 无三级菜单则跳转路由并关闭遮罩
		const targetPath = resolvePath()
		// console.log(`[MenuDebug] - 准备跳转到:`, targetPath)
		router
			.push(targetPath)
			.then(() => {
				proxy.$bus.emit('closeMask')
				console.log(`[MenuDebug] - 跳转成功`)
			})
			.catch(err => {
				console.error(`[MenuDebug] - 跳转失败:`, err)
			})
	}
}
// 三级菜单点击处理
const handleLevel3Click = () => {
	const targetPath = resolvePath()
	// 跳转路由并在成功后关闭弹窗
	router
		.push(targetPath)
		.then(() => {
			proxy.$bus.emit('closeMask') // 触发关闭弹窗事件
			console.log(`[MenuDebug] - 三级菜单跳转成功，已关闭弹窗`)
		})
		.catch(err => {
			console.error(`[MenuDebug] - 三级菜单跳转失败:`, err)
		})
}
// 收藏菜单
const collectMenu = () => {
	const targetMenu = props.item

	const addCollect = data => {
		return request({
			url: '/api/v1/internal/sysCustomRegion/add',
			method: 'post',
			data,
			loading: false,
		})
	}

	const params = {
		menuId: targetMenu.id,
		menuName: targetMenu.meta?.title || '',
		isQuickEnter: targetMenu.meta?.collect ? '0' : '1',
	}

	targetMenu.meta = { ...targetMenu.meta, collect: !targetMenu.meta?.collect }

	addCollect(params)
		.then(res => {
			proxy.$bus.emit('changeQuick')
			permissionStore.generateRoutes()
		})
		.catch(err => {
			console.error(`[MenuDebug] - 收藏操作失败:`, err)
		})
}
</script>

<style lang="scss" scoped>
/* 一级菜单样式保持不变 */
.level-1-container {
	margin-bottom: 20px;
	position: relative;
}

/* 新增：二级菜单水平对齐容器 */
.level-2-align-row {
	display: flex; /* 关键：让二级菜单同一行 */
	align-items: flex-start; /* 顶部对齐（避免高度不同导致错位） */
	gap: 10px; /* 二级菜单之间的间距 */
	flex-wrap: wrap; /* 超出一行时自动换行（可选） */
}

/* 二级菜单容器：强制统一高度 + 边框 */
.level-2-tab {
	/* 关键：让每个二级菜单容器高度一致 */
	min-height: 40px;
	display: flex;
	flex-direction: column; /* 内部内容（标题+三级菜单）垂直排列 */

	border-radius: 5px;
	overflow: hidden; /* 防止三级菜单超出边框 */
	/* 宽度根据内容自适应，或固定宽度（按需调整） */
	width: auto;
	box-sizing: border-box; /* 边框不影响宽度计算 */
}

/* 二级菜单内容（标题区域） */
.tab-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 10px;
	height: 40px; /* 固定标题栏高度，保证对齐 */
	cursor: pointer;
	border-radius: 5px;
	transition: all 0.2s;
	border: 1px solid #e4e7ed; /* 统一边框 */
}

/* 三级菜单容器：放在二级菜单边框内 */
.level-3-container {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	padding: 10px; /* 与边框保持间距 */
	background-color: #fff; /* 背景色覆盖边框内区域 */
	/* 宽度继承父容器，确保在边框内 */
	width: 100%;
	box-sizing: border-box;
}

// 二级菜单容器（仅用于布局，不直接加边框）
.level-2-tab {
	position: relative;
	margin: 0 10px 10px 0; // 控制二级菜单之间的间距
	display: inline-block; // 确保多个二级菜单能在同一行显示
}

// 边框容器：核心容器，包含二级内容和三级菜单
.level-2-border-container {
	// border: 1px solid #e4e7ed; // 统一的边框
	border-radius: 5px; // 圆角美化
	min-width: 200px; // 最小宽度，避免过窄
	box-sizing: border-box; // 确保边框不影响整体尺寸计算
}
/* 新增：二级菜单水平对齐容器 */
.level-2-align-row {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	flex-wrap: wrap; /* 超出一行时自动换行，可根据需求决定是否保留 */
	justify-content: flex-start; /* 菜单从左到右排列，可按需调整为 space-around 等 */
	max-width: 1100px;
}
// 二级菜单标题区域
.tab-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 10px;
	height: 50px; // 固定高度，确保对齐
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background-color: #f0f2f5;
	}

	.tab-title {
		font-size: 14px;
		font-weight: 400;
		// color: rgb(88, 88, 88);
		color: #808080;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		display: flex;
		align-items: center;
		// gap: 8px;
	}

	.tab-icon {
		color: #666;
		font-size: 16px;
		transition: transform 0.2s;

		&.rotate {
			transform: rotate(180deg); // 点击时箭头旋转
			color: #366bfc;
		}
	}
}

// 三级菜单容器（完全在边框内部）
.level-3-container {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	padding: 10px; // 与边框保持间距，避免内容贴边
	background-color: #fff; // 与边框容器背景一致，视觉上是整体
	// border-top: 1px dashed #e4e7ed; // 与二级标题区域分隔（可选）

	// 三级菜单换行时保持在边框内
	width: 100%;
	box-sizing: border-box;
}

// 三级菜单项样式
.level-3-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 32px;
	min-width: 100px;
	padding: 0 12px;
	font-size: 12px;
	color: #555;
	background-color: #f1f1f1;
	border-radius: 5px;
	transition: all 0.2s;
	cursor: pointer;

	&:hover {
		background-color: #d0e8ff;
		color: #2c5cc5;
	}
}

// 收藏图标样式
.collect-icon {
	cursor: pointer;
	transition: transform 0.2s;
	margin-left: 5px;

	&:hover {
		transform: scale(1.1);
	}
}
.level-2-border-container {
	.tab-content {
		.tab-title {
			font-weight: normal !important;
		}
	}
}
.level-2-border-container .justify-center .tab-title {
	font-weight: bold !important;
}
</style>
