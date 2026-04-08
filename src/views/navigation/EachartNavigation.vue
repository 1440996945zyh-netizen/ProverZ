<template>
	<div class="menu-tree-container">
		<div ref="chartRef" class="chart-container"></div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, defineEmits, nextTick, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import { isExternal } from '@/utils/common/form-validation'
import { getNormalPath } from '@/utils/common/core'
import router from '@/router'
// 定义要向父组件发射的事件
const emit = defineEmits(['menuClick', 'labelClick'])

const { proxy } = getCurrentInstance()
// 从父组件接收的菜单数据
const props = defineProps({
	menuData: {
		type: Array,
		required: true,
		default: () => [],
	},
	chartConfig: {
		type: Object,
		default: () => ({
			height: '80vh',
			layerPadding: 10,
			distance: 10,
		}),
	},
})

// 图表相关引用和实例
const chartRef = ref(null)
let chartInstance = null
// 缩放控制变量
const minScale = 0.5 // 最小缩放比例（可根据需求调整）
const currentScale = ref(1) // 当前缩放比例

// 在绑定图表事件时添加缩放监听
const bindChartEvents = () => {
	if (!chartInstance) return

	// 移除已有事件（避免重复绑定）
	chartInstance.off('click')
	chartInstance.off('mousemove')
	chartInstance.off('zoom') // 新增：移除旧的缩放事件

	// 绑定点击事件
	chartInstance.on('click', handleChartClick)

	// 绑定鼠标悬停效果
	chartInstance.on('mousemove', params => {
		if (
			params.data &&
			(params.event.target.type === 'text' ||
				params.event.target.type === 'circle' ||
				params.event.target.type === 'path' ||
				params.event.target.type === 'rect')
		) {
			chartRef.value.style.cursor = 'pointer'
		} else {
			chartRef.value.style.cursor = ''
		}
	})

	// 新增：绑定缩放事件
	chartInstance.on('zoom', handleZoom)
}
// 处理缩放事件
const handleZoom = params => {
	console.log('params =>', params)
	// 获取当前缩放比例（兼容不同ECharts版本的参数格式）
	let scale = params.scale || currentScale.value

	// 限制最小缩放比例
	if (scale < minScale) {
		scale = minScale
		// 强制设置为最小缩放
		chartInstance.dispatchAction({
			type: 'zoom',
			scale: scale,
			center: chartInstance.getOption().series[0].center || [50, 50], // 保持中心不变
		})
	}
	currentScale.value = scale

	// 根据缩放比例计算背景透明度（缩放越小，透明度越高）
	let alpha = 1
	if (scale <= 0.8) alpha = 0.7
	if (scale <= 0.6) alpha = 0.5
	if (scale <= minScale) alpha = 0.3 // 最小缩放时透明度最低

	// 动态更新标签背景色（带透明度）
	chartInstance.setOption({
		series: [
			{
				label: {
					normal: {
						backgroundColor: `rgba(255, 255, 255, ${alpha})`, // 普通标签背景
					},
					emphasis: {
						backgroundColor: `rgba(239, 246, 255, ${alpha})`, // 悬停标签背景（对应原#eff6ff）
					},
				},
				leaves: {
					label: {
						normal: {
							backgroundColor: `rgba(255, 255, 255, ${alpha})`, // 叶子节点标签背景
						},
						emphasis: {
							backgroundColor: `rgba(240, 249, 255, ${alpha})`, // 叶子节点悬停背景（对应原#f0f9ff）
						},
					},
				},
			},
		],
	})
}

// 转换菜单数据为ECharts所需格式
const transformMenuData = rawData => {
	// 先创建基础根节点，不包含children
	const treeData = {
		name: import.meta.env.VITE_APP_TITLE,
		id: 'root', // 根节点ID
		path: '/', // 根节点路径
		level: 0, // 根节点层级
		isRoot: true, // 标记为根节点，用于样式区分
		children: [], // 先空数组
	}

	// 根节点初始化完成后再处理子节点，避免循环引用问题
	treeData.children = rawData.map(menu =>
		// 传递空数组作为祖先链，根节点是顶级
		transformMenu(menu, 1, treeData, [])
	)

	console.log('treeData', treeData)
	return treeData
}

// 递归转换单个菜单 - 增加ancestors参数保存所有祖先
const transformMenu = (menu, level, parent, ancestors) => {
	// 提取首字母用于节点显示
	const firstChar = menu.meta?.title?.charAt(0) || menu.name?.charAt(0) || 'M'

	// 构建当前节点的祖先链（包含直接父级）
	// 新数组 = 父级的祖先链 + 父级本身
	const currentAncestors = [
		...ancestors,
		{
			id: parent.id,
			name: parent.name,
			path: parent.path,
			level: parent.level,
			uniqueId: parent.uniqueId,
		},
	]

	const transformed = {
		name: menu.meta?.title || menu.name,
		id: menu.id,
		path: menu.path,
		level: level,
		// 保存直接父级信息
		parent: {
			id: parent.id,
			name: parent.name,
			path: parent.path,
			level: parent.level,
			uniqueId: parent.uniqueId,
		},
		// 保存所有祖先节点信息（父级、祖父级等）
		ancestors: currentAncestors,
		itemStyle: {
			backgroundColor: 'transparent',
			borderWidth: 0,
			borderColor: 'transparent',
			borderRadius: 10,
		},
		// 节点上显示的文本
		symbolText: firstChar,
		rawData: menu,
		uniqueId: `node-${menu.id}-level-${level}`,
	}
	// 判断是否是我们包装过的一级菜单：
	// 条件：是第1级，且类型是'C'（菜单），且有子级
	const isWrappedTopMenu = level === 1 && menu.menuType === 'C' && menu.children && menu.children.length > 0
	if (menu.children && menu.children.length > 0 && !isWrappedTopMenu) {
		// 只有非包装菜单才去处理子级
		transformed.children = menu.children.map(child => transformMenu(child, level + 1, transformed, currentAncestors))
	}
	// 如果是包装的一级菜单，transformed.children 将为空，ECharts 就不会画出那一根多余的线和节点
	return transformed
}

// 初始化图表
const initChart = () => {
	if (!chartRef.value) return
	if (chartInstance) {
		chartInstance.dispose()
	}
	chartInstance = echarts.init(chartRef.value)
	const option = getChartOption()
	chartInstance.setOption(option)
	nextTick(() => {
		bindChartEvents()
	})
}

// 处理图表点击事件 - 确保所有标签都能触发
const handleChartClick = params => {
	if (!params.data) return

	console.log('点击事件:', params.event.target.type, params.data.name)

	// 所有与节点相关的点击都视为有效点击
	if (params.componentType === 'series' && params.seriesType === 'tree') {
		// 触发点击事件
		handleLabelClick(params)
	}
}
// 处理标签点击事件
const handleLabelClick = labelInfo => {
	const nodeData = labelInfo.data
	if (!nodeData || nodeData.id === 'root') return
	console.log(`点击了 ${nodeData.level} 级菜单: ${nodeData.name}`)
	// 2. 核心逻辑：如果是菜单（C类型），无论哪一级都要执行跳转
	// 判断依据：rawData 里的 menuType 为 'C'
	const isMenu = nodeData.rawData?.menuType === 'C'

	if (isMenu) {
		handleMenuSelect(nodeData)
	} else {
		// 如果是目录（M类型），ECharts 默认会处理展开收起，这里可以不写逻辑
		console.log('此节点为目录，仅执行展开/折叠')
	}
}

// 选择菜单处理方法
const handleMenuSelect = menuItem => {
	const target = resolvePathFromAncestors(menuItem)
	if (target) {
		console.log('最终跳转目标:', target)
		router.push(target)

		// 如果是在弹窗里，记得触发关闭
		// proxy.$bus.emit('closeMask');
	}
}

// 从祖先数组拼接完整路径
const resolvePathFromAncestors = menuItem => {
	const { level, path, rawData } = menuItem

	// 1. 处理外链 (如果 isFrame 为 0 或按照你定义的逻辑是外链)
	// 注意：请确认你的系统中 0 和 1 哪个代表外链
	if (rawData.isFrame === '0' && isExternal(path)) {
		window.open(path, '_blank')
		return null
	}

	// 2. 处理一级菜单 (Level 1)
	if (level === 1) {
		// 对应我们之前在 permission.js 里的逻辑：
		// 一级菜单 C 会被包装成 Layout，路径重定向到 /path/index
		// 直接跳转 /path，Vue Router 会根据 redirect 自动处理
		return getNormalPath(path.startsWith('/') ? path : `/${path}`)
	}

	// 3. 处理多级菜单 (Level 2, 3...)
	// 过滤掉 root，提取所有祖先的 path
	const ancestorPaths = menuItem.ancestors.filter(ancestor => ancestor.id !== 'root').map(ancestor => ancestor.path || '')

	// 合并路径：[祖先1, 祖先2, 自己]
	const allPaths = [...ancestorPaths, path || '']

	// 拼接并规范化路径 (如: /system + /user -> /system/user)
	const fullPath = allPaths.filter(p => p).join('/')
	const finalPath = getNormalPath(fullPath.startsWith('/') ? fullPath : `/${fullPath}`)

	// 4. 处理 Query 参数
	if (rawData?.query) {
		try {
			const query = JSON.parse(rawData.query)
			return { path: finalPath, query: query }
		} catch (e) {
			console.error('Query解析失败', e)
		}
	}

	return finalPath
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
const getChartOption = () => {
	const treeData = transformMenuData(props.menuData)

	return {
		// 新增：ECharts自带的工具栏配置
		toolbox: {
			show: true, // 显示工具栏
			feature: {
				// 保存图片功能
				saveAsImage: {
					show: true,
					title: '保存为图片', // 鼠标悬停提示文字
					type: 'png', // 默认保存格式
					// 图片保存参数
					option: {
						pixelRatio: 10, // 图片像素比例，越大越清晰
						backgroundColor: '#ffffff', // 图片背景色
					},
					// 保存的文件名
					name: import.meta.env.VITE_APP_TITLE,
				},
			},
			// 工具栏位置
			top: 10,
			right: 10,
			// 工具栏样式
			itemSize: 18, // 工具按钮大小
			itemGap: 15, // 工具按钮间距
			textStyle: {
				fontSize: 12,
			},
		},
		tooltip: {
			// 保持原有配置不变
			trigger: 'item',
			triggerOn: 'mousemove',
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#e2e8f0',
			borderWidth: 1,
			borderRadius: 8,
			padding: 12,
			shadowColor: 'rgba(0, 0, 0, 0.05)',
			shadowBlur: 10,
			formatter: function (params) {
				let content = `<div style="font-weight:600; color:#1e293b; margin-bottom:4px">${params.data.name}</div>`
				if (params.data.id) content += `<div style="font-size:12px; color:#64748b; margin:2px 0">ID: ${params.data.id}</div>`
				if (params.data.path) content += `<div style="font-size:12px; color:#64748b; margin:2px 0">路径: ${params.data.path}</div>`
				if (params.data.children)
					content += `<div style="font-size:12px; color:#64748b; margin:2px 0">子菜单: ${params.data.children.length} 个</div>`
				return content
			},
		},

		series: [
			{
				type: 'tree',
				data: [treeData],
				edgeShape: 'polyline',
				layout: 'orthogonal',
				orient: 'LR',
				layerPadding: props.chartConfig.layerPadding || 10,
				top: 10,
				left: '8%',
				bottom: 0,
				right: '10%',
				// 关键：允许内容超出label边界（5.2.1支持）
				overflow: 'none', // 不裁剪超出内容
				// 保留原有symbol配置不变
				symbolSize: [180, 40],
				symbol: 'rect',
				symbolLabel: {
					position: 'inside',
					backgroundColor: 'transparent',
					lineHeight: 40,
					height: 40,
					textAlign: 'center',
					fontSize: 14,
					color: '#475569',
				},
				itemStyle: {
					color: 'transparent',
					borderColor: 'transparent',
					borderWidth: 0,
				},
				// 标签样式 - 优化后（边框外添加圆点）
				label: {
					normal: {
						position: 'inside',
						verticalAlign: 'middle',
						align: 'center',
						backgroundColor: '#f9fafb',
						borderRadius: 6,
						width: 180,
						height: 30,
						lineHeight: 30,
						textAlign: 'center',
						lineOverflow: 'truncate',
						overflow: 'truncate',
						triggerEvent: true,
						distance: props.chartConfig.distance || 10,
						shadowColor: 'rgba(0, 0, 0, 0.03)',
						borderWidth: 1,
						borderColor: '#d4dce6',
						shadowBlur: 2,
						rich: {
							// 层级色彩区分（保持原有）
							level0: { fontSize: 22, fontWeight: 'bold', color: '#2563eb', align: 'center' },
							level1: { fontSize: 18, fontWeight: '700', color: '#222', align: 'center' },
							level2: { fontSize: 14, fontWeight: '500', color: 'rgb(102 107 114)', align: 'center' },
							level3: { fontSize: 12, color: '#555', align: 'center' },
							level4: { fontSize: 12, color: '#475569', align: 'center' },
							level5: { fontSize: 12, color: '#64748b', align: 'center' },
						},
						// 格式化器：文本
						formatter: function (params) {
							let level = params.data.level
							if (level === undefined || level === null) {
								level = 5
							}
							const useLevel = Math.min(level, 5)
							// 文本
							return `{level${useLevel}|${params.data.name}}`
						},
					},
					// 悬停状态样式
					emphasis: {
						triggerEvent: true,
						cursor: 'pointer',
						backgroundColor: '#eff6ff',
						borderColor: '#dbeafe',
						borderWidth: 1,
						color: '#1d4ed8',
					},
				},

				// 叶子节点标签样式（同步添加外部圆点）
				leaves: {
					label: {
						normal: {
							position: 'inside',
							verticalAlign: 'middle',
							align: 'center',
							backgroundColor: '#f9fafb',
							borderRadius: 6,
							width: 180,
							height: 30,
							lineHeight: 30,
							textAlign: 'center',
							fontSize: 13,
							color: '#475569',
							distance: props.chartConfig.distance || 10,
							lineOverflow: 'truncate',
							borderWidth: 1,
							borderColor: '#d4dce6',
							overflow: 'truncate',
							triggerEvent: true,
							shadowColor: 'rgba(0, 0, 0, 0.03)',
							shadowBlur: 2,
							// 叶子节点格式化器
							formatter: function (params) {
								return `${params.data.name}`
							},
						},
						emphasis: {
							triggerEvent: true,
							cursor: 'pointer',
							backgroundColor: 'rgba(240, 249, 255, 1)',
							borderColor: '#bae6fd',
							borderWidth: 1,
							color: '#0284c7',
						},
					},
				},

				// 连接线样式优化
				lineStyle: {
					color: '#cbd5e1',
					width: 1.5,
					curveness: 0.5,
				},

				initialTreeDepth: 5, // 默认只展开五级菜单
				expandAndCollapse: true,
				animationDuration: 550,
				animationDurationUpdate: 750,
				animationEasing: 'cubicOut',
			},
		],
	}
}
// 监听窗口大小变化
const handleResize = () => {
	if (chartInstance) {
		chartInstance.resize()
	}
}
onUnmounted(() => {
	window.removeEventListener('resize', handleResize)
	if (chartInstance) {
		chartInstance.off('zoom', handleZoom) // 新增：移除缩放事件
		chartInstance.dispose()
		chartInstance = null
	}
})
// 组件挂载时初始化
onMounted(() => {
	initChart()
	window.addEventListener('resize', handleResize)
})

// 监听数据变化
watch(
	() => props.menuData,
	() => {
		if (chartInstance) {
			chartInstance.setOption(getChartOption())
			bindChartEvents()
		}
	},
	{ deep: true }
)

// 监听配置变化
watch(
	() => props.chartConfig,
	() => {
		if (chartInstance) {
			chartInstance.setOption(getChartOption())
			bindChartEvents()
		}
	},
	{ deep: true }
)
</script>

<style scoped lang="scss">
.menu-tree-container {
	width: 100%;
	padding: 16px;
	box-sizing: border-box;
}

.chart-container {
	width: 100%;
	background-color: #f9fafb;
	border-radius: 12px;
	transition: all 0.3s ease;
}

:deep(.chart-container) {
	height: v-bind('chartConfig.height');
}

/* 确保ECharts元素能正确响应事件 */
:deep(.ec-extension) {
	pointer-events: auto !important;
}

/* 确保文本元素可以响应点击 */
:deep(.echarts-text) {
	pointer-events: auto !important;
}

/* 优化滚动条样式 */
:deep(.echarts-container ::-webkit-scrollbar) {
	width: 6px;
	height: 6px;
}

:deep(.echarts-container ::-webkit-scrollbar-thumb) {
	background-color: #d1d5db;
	border-radius: 3px;
}

:deep(.echarts-container ::-webkit-scrollbar-track) {
	background-color: #f3f4f6;
}
</style>
