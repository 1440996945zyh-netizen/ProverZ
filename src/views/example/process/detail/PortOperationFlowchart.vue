<template>
	<div class="flowchart-container">
		<div class="controls">
			<el-button type="primary" @click="resetView" :icon="Refresh">重置视图</el-button>
			<el-button @click="zoomIn" :icon="ZoomIn">放大</el-button>
			<el-button @click="zoomOut" :icon="ZoomOut">缩小</el-button>
			<el-button @click="toggleAutoLayout" :icon="Position">
				{{ autoLayoutEnabled ? '禁用自动布局' : '启用自动布局' }}
			</el-button>
			<el-button @click="toggleGrid" :icon="Grid">
				{{ showGrid ? '隐藏网格' : '显示网格' }}
			</el-button>
			<el-button @click="toggleFullscreen" :icon="FullScreen">
				{{ isFullscreen ? '退出全屏' : '全屏查看' }}
			</el-button>
			<el-button @click="exportAsImage" :icon="Picture">导出图片</el-button>
		</div>

		<div class="flowchart-wrapper" ref="wrapperRef">
			<svg
				ref="svgRef"
				:width="svgWidth"
				:height="svgHeight"
				@click="deselectAll"
				@mousedown="startPan"
				@mousemove="pan"
				@mouseup="stopPan"
				@mouseleave="stopPan"
				@wheel="handleZoom"
				:style="{ cursor: isPanning ? 'grabbing' : 'grab', overflow: 'visible' }"
			>
				<!-- 定义箭头标记、渐变和网格背景 -->
				<defs>
					<!-- 网格背景图案 -->
					<pattern v-if="showGrid" id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ebeef5" stroke-width="1" />
					</pattern>

					<!-- 箭头标记 - 选中/悬停状态 -->
					<marker
						id="arrowhead-hover"
						markerWidth="8"
						markerHeight="5"
						refX="4"
						refY="2.5"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<polygon points="0 0, 8 2.5, 0 5" fill="#409eff" />
					</marker>

					<!-- 箭头标记 - 普通状态 -->
					<marker
						id="arrowhead-normal"
						markerWidth="8"
						markerHeight="5"
						refX="4"
						refY="2.5"
						orient="auto"
						markerUnits="strokeWidth"
					>
						<polygon points="0 0, 8 2.5, 0 5" fill="#4e5969" />
					</marker>

					<!-- 节点渐变效果 -->
					<linearGradient id="start-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#f0f9eb" />
						<stop offset="100%" stop-color="#d6e9c6" />
					</linearGradient>

					<linearGradient id="end-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#f4f4f5" />
						<stop offset="100%" stop-color="#d3d4d6" />
					</linearGradient>

					<linearGradient id="normal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#ecf5ff" />
						<stop offset="100%" stop-color="#b3d8ff" />
					</linearGradient>
				</defs>

				<!-- 网格背景填充 -->
				<rect v-if="showGrid" width="100%" height="100%" fill="url(#grid)" pointer-events="none" />

				<!-- 连接线（始终显示箭头） -->
				<g
					v-for="(link, index) in links"
					:key="'link-' + index"
					@click.stop="selectLink(link)"
					@mouseenter="hoveredLink = link"
					@mouseleave="hoveredLink = null"
				>
					<path
						:d="calculateLinkPath(link)"
						fill="none"
						:stroke="link === selectedLink ? '#409eff' : link === hoveredLink ? '#409eff' : '#606266'"
						:stroke-width="link === selectedLink ? 3 : link === hoveredLink ? 2.5 : 2.5"
						:marker-end="link === selectedLink || link === hoveredLink ? 'url(#arrowhead-hover)' : 'url(#arrowhead-normal)'"
						class="link"
					/>
					<text
						:x="getLinkLabelPosition(link).x"
						:y="getLinkLabelPosition(link).y"
						text-anchor="middle"
						class="link-label"
						:fill="link === selectedLink ? '#409eff' : '#606266'"
					>
						{{ getLinkLabel(link) }}
					</text>
				</g>

				<!-- 节点 -->
				<g
					v-for="node in nodes"
					:key="`node-${node.id}`"
					:transform="`translate(${node.x}, ${node.y})`"
					@click.stop="selectNode(node)"
					@mousedown.stop="preventPanOnNode"
					@mouseenter="showNodeTooltip(node, $event)"
					@mouseleave="hideNodeTooltip"
				>
					<!-- 1. 矩形节点（默认，非圆形状态） -->
					<rect
						v-if="!isCircleNode(node)"
						:width="nodeWidth"
						:height="nodeHeight"
						:rx="10"
						:class="['node', node.type, { selected: selectedNode === node.id, hover: hoveredNode === node }]"
						:fill="getNodeGradient(node)"
					/>
					<!-- 2. 圆形节点（指定状态） -->
					<circle
						v-else
						:cx="nodeWidth / 2"
						:cy="nodeHeight / 2"
						:r="NODE_CONFIG.radius"
						:class="['node', node.type, { selected: selectedNode === node.id, hover: hoveredNode === node }]"
						:fill="getNodeGradient(node)"
					/>
					<svg v-if="!isCircleNode(node)" :x="10" :y="10" width="24" height="24" viewBox="0 0 24 24" v-html="getNodeIcon(node)"></svg>
					<text :x="nodeWidth / 2" :y="30" text-anchor="middle" class="node-label">
						{{ node.label }}
					</text>
					<text :x="nodeWidth / 2" :y="50" text-anchor="middle" class="node-info">{{ node.cargo }} | {{ node.pieces }}件</text>
					<text :x="nodeWidth / 2" :y="70" text-anchor="middle" class="node-info">
						{{ node.weight }}吨 | {{ formatTime(node.plannedTime) }}
					</text>
					<circle v-if="!isCircleNode(node)" :cx="nodeWidth - 15" :cy="15" r="5" :class="'status-indicator ' + node.status" />
				</g>
			</svg>
		</div>

		<!-- 节点悬停提示框 -->
		<div v-if="nodeTooltipVisible && nodeTooltip" :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }" class="node-tooltip">
			<div class="tooltip-title">{{ nodeTooltip.label }}</div>
			<div class="tooltip-content">状态: {{ formatStatus(nodeTooltip.status) }}</div>
			<div class="tooltip-content">计划时间: {{ nodeTooltip.plannedTime }}</div>
			<div v-if="nodeTooltip.actualTime" class="tooltip-content">实际时间: {{ nodeTooltip.actualTime }}</div>
		</div>

		<!-- 节点详情弹窗 -->
		<Dialog
			:title="selectedNodeDetails?.label || '节点详情'"
			 v-model:visible="detailDialogVisible"
			width="60%"
			:close-on-click-modal="false"
		>
			<node-detail-panel
				v-if="selectedNodeDetails"
				:node="selectedNodeDetails"
				:relatedNodes="getRelatedNodes(selectedNodeDetails.id)"
				@nodeClick="handleRelatedNodeClick"
			/>
		</Dialog>

		<!-- 连接线详情弹窗 -->
		<el-dialog title="连接详情" v-model="linkDialogVisible" width="50%" :close-on-click-modal="false">
			<link-detail-panel
				v-if="selectedLink && nodeMap[selectedLink.source] && nodeMap[selectedLink.target]"
				:link="selectedLink"
				:sourceNode="nodeMap[selectedLink.source]"
				:targetNode="nodeMap[selectedLink.target]"
			/>
		</el-dialog>
	</div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import { Refresh, ZoomIn, ZoomOut, Position, Picture, Grid, FullScreen } from '@element-plus/icons-vue'
import NodeDetailPanel from './NodeDetailPanel.vue'
import LinkDetailPanel from './LinkDetailPanel.vue'
import { dagreLayout } from './dagreLayout'
import Dialog from '@/components/Dialog'
// 节点图标SVG
const NODE_ICONS = {
	// 开始节点图标
	start: '<path fill="#67c23a" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
	// 结束节点图标
	end: '<path fill="#909399" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
	// 普通节点图标
	normal: '<path fill="#409eff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
	// 开始节点图标
	start: '<path fill="#67c23a" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
	// 集合节点图标
	collection:
		'<path fill="#67c23a" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
	// 存储节点图标
	storage:
		'<path fill="#e6a23c" d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z"/>',
	// 加载节点图标
	loading:
		'<path fill="#409eff" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
	// 卸载节点图标
	unloading:
		'<path fill="#f56c6c" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
	// 转换节点图标
	transfer:
		'<path fill="#909399" d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12zM12 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"/>',
}

// 状态格式化映射
const STATUS_MAP = {
	completed: '已完成',
	processing: '处理中',
	pending: '待处理',
	cancelled: '已取消',
}

export default {
	name: 'PortOperationFlowchart',
	components: { NodeDetailPanel, LinkDetailPanel },
	props: {
		treeData: {
			type: Array,
			required: false,
			default: () => [],
		},
		config: {
			type: Object,
			default: () => ({
				nodeWidth: 200,
				nodeHeight: 90,
				margin: { x: 50, y: 80 },
				showGrid: true,
			}),
		},
	},
	setup(props) {
		// 配置常量
		const NODE_CONFIG = {
			width: props.config.nodeWidth || 200,
			height: props.config.nodeHeight || 90,
			radius: props.config.nodeHeight ? props.config.nodeHeight / 2 : 45, // 圆形半径=矩形高度的1/2（保证视觉协调）
			circleStatuses: [ 'collection'], // 规则：这些状态用圆形节点
			margin: props.config.margin || { x: 50, y: 80 },
			showGrid: props.config.showGrid !== undefined ? props.config.showGrid : true,
		}

		const SVG_DEFAULT_SIZE = { width: 1200, height: 800 }
		const ZOOM_CONFIG = { min: 0.3, max: 3, step: 0.1 }

		// DOM引用
		const wrapperRef = ref(null)
		const svgRef = ref(null)

		// 状态管理
		const { width: nodeWidth, height: nodeHeight } = NODE_CONFIG
		const svgWidth = ref(SVG_DEFAULT_SIZE.width)
		const svgHeight = ref(SVG_DEFAULT_SIZE.height)
		const scale = ref(1)
		const translateX = ref(0)
		const translateY = ref(0)
		const isPanning = ref(false)
		const startPanX = ref(0)
		const startPanY = ref(0)
		const startTranslateX = ref(0)
		const startTranslateY = ref(0)
		const lastMousePos = ref({ x: 0, y: 0 })
		const selectedNode = ref(null)
		const hoveredNode = ref(null)
		const selectedLink = ref(null)
		const hoveredLink = ref(null)
		const detailDialogVisible = ref(false)
		const linkDialogVisible = ref(false)
		const autoLayoutEnabled = ref(true)
		const showGrid = ref(NODE_CONFIG.showGrid)
		const isFullscreen = ref(false)

		// 悬停提示相关状态
		const nodeTooltipVisible = ref(false)
		const nodeTooltip = ref({})
		const tooltipX = ref(0)
		const tooltipY = ref(0)

		// 节点数据
		const nodes = ref([])
		const links = ref([])
		const nodeMap = computed(() => nodes.value.reduce((map, node) => ({ ...map, [node.id]: node }), {}))

		// 树转扁平节点
		const flattenTree = (treeNodes, parentId = null, level = 0) => {
			let result = []
			treeNodes.forEach(node => {
				const flatNode = { ...node, parentId, level, x: 0, y: 0 }
				result.push(flatNode)
				if (node.children && node.children.length > 0) {
					result = result.concat(flattenTree(node.children, node.id, level + 1))
				}
			})
			return result
		}

		// 默认数据
		const getDefaultTreeData = () => [
			{
				id: 1,
				label: '集港作业(钢材)',
				type: 'collection',
				cargo: '螺纹钢',
				pieces: 500,
				weight: 2500,
				plannedTime: '2024-05-01 08:00',
				actualTime: '2024-05-01 08:30',
				status: 'completed',
				operator: '张三',
				notes: '提前30分钟完成，无异常',
				area: '码头入口',
				children: [
					{
						id: 2,
						label: '进入货区A',
						type: 'normal',
						cargo: '螺纹钢',
						pieces: 500,
						weight: 2500,
						plannedTime: '2024-05-01 09:00',
						actualTime: '2024-05-01 09:15',
						status: 'completed',
						operator: '李四',
						notes: '货区A-12号仓位',
						area: '货区A',
						children: [
							{
								id: 3,
								label: '装船作业(泊位1)',
								type: 'loading',
								cargo: '螺纹钢',
								pieces: 300,
								weight: 1500,
								plannedTime: '2024-05-01 10:00',
								actualTime: '2024-05-01 12:30',
								status: 'completed',
								operator: '王五',
								notes: '使用门机3#，效率达标',
								area: '泊位1',
								children: [
									{
										id: 4,
										label: '疏港作业(外运)',
										type: 'end',
										cargo: '螺纹钢',
										pieces: 300,
										weight: 1500,
										plannedTime: '2024-05-01 13:00',
										actualTime: '2024-05-01 14:00',
										status: 'completed',
										operator: '赵六',
										notes: '外运船「渤海号」',
										area: '出港通道',
									},
								],
							},
							{
								id: 5,
								label: '转栈作业(货区A→C)',
								type: 'transfer',
								cargo: '螺纹钢',
								pieces: 200,
								weight: 1000,
								plannedTime: '2024-05-01 10:30',
								actualTime: '2024-05-01 11:30',
								status: 'completed',
								operator: '孙七',
								notes: '叉车2台协同，无损耗',
								area: '中转区',
								children: [
									{
										id: 6,
										label: '疏港作业(内运)',
										type: 'end',
										cargo: '螺纹钢',
										pieces: 150,
										weight: 750,
										plannedTime: '2024-05-01 12:00',
										actualTime: '2024-05-01 12:45',
										status: 'completed',
										operator: '周八',
										notes: '内运车队#12',
										area: '内运通道',
									},
									{
										id: 7,
										label: '二次转栈(货区C→D)',
										type: 'normal',
										cargo: '螺纹钢',
										pieces: 50,
										weight: 250,
										plannedTime: '2024-05-01 13:00',
										status: 'processing',
										operator: '吴九',
										notes: '待入库，等待货区D空闲',
										area: '中转区',
										children: [
											{
												id: 8,
												label: '长期存储(货区D)',
												type: 'end',
												cargo: '螺纹钢',
												pieces: 50,
												weight: 250,
												plannedTime: '2024-05-01 14:30',
												status: 'pending',
												operator: '郑十',
												notes: '存储周期30天',
												area: '货区D',
											},
										],
									},
								],
							},
						],
					},
					{
						id: 9,
						label: '进入货区B',
						type: 'normal',
						cargo: '螺纹钢',
						pieces: null,
						weight: null,
						plannedTime: '2024-05-01 09:00',
						status: 'cancelled',
						operator: '钱十一',
						notes: '货区B临时占用，取消分配',
						area: '货区B',
					},
				],
			},
			{
				id: 10,
				label: '卸船作业(散货)',
				type: 'unloading',
				cargo: '煤炭',
				pieces: 1000,
				weight: 8000,
				plannedTime: '2024-05-01 09:00',
				actualTime: '2024-05-01 11:00',
				status: 'completed',
				operator: '冯十二',
				notes: '「黄海号」卸船，效率1200t/h',
				area: '泊位2',
				children: [
					{
						id: 11,
						label: '进入货区C',
						type: 'normal',
						cargo: '煤炭',
						pieces: 1000,
						weight: 8000,
						plannedTime: '2024-05-01 11:30',
						actualTime: '2024-05-01 12:00',
						status: 'completed',
						operator: '陈十三',
						notes: '货区C-08号堆场',
						area: '货区C',
						children: [
							{
								id: 12,
								label: '入库作业(筒仓3)',
								type: 'normal',
								cargo: '煤炭',
								pieces: 800,
								weight: 6400,
								plannedTime: '2024-05-01 12:30',
								status: 'processing',
								operator: '褚十四',
								notes: '正在入库，预计14:00完成',
								area: '筒仓区',
							},
							{
								id: 13,
								label: '抽样盘点',
								type: 'normal',
								cargo: '煤炭',
								pieces: 200,
								weight: 1600,
								plannedTime: '2024-05-01 13:00',
								status: 'pending',
								operator: '卫十五',
								notes: '待入库后抽样，检验热值',
								area: '质检区',
								children: [
									{
										id: 14,
										label: '盘点报告生成',
										type: 'end',
										cargo: '煤炭',
										pieces: 200,
										weight: 1600,
										plannedTime: '2024-05-01 15:00',
										status: 'pending',
										operator: '蒋十六',
										notes: '电子版报告同步至系统',
										area: '办公室',
									},
								],
							},
						],
					},
				],
			},
		]
		// 新增：判断节点是否需要显示为圆形
		const isCircleNode = node => {
			// 若节点状态在 circleStatuses 中，返回true（圆形），否则false（矩形）
			return NODE_CONFIG.circleStatuses.includes(node.type)
		}
		// 计算属性
		const selectedNodeDetails = computed(() => nodeMap.value[selectedNode.value] || null)

		const calculateLinkPath = link => {
			const sourceNode = nodeMap.value[link.source]
			const targetNode = nodeMap.value[link.target]
			if (!sourceNode || !targetNode) return ''

			// 关键修改：根据节点形状计算“源节点右侧连接点”
			let startX
			const startY = sourceNode.y + nodeHeight / 2 // 垂直中点不变
			if (isCircleNode(sourceNode)) {
				// 圆形节点：右侧连接点 = 节点X + 矩形宽度的1/2（圆心X） + 半径
				startX = sourceNode.x + nodeWidth / 2 + NODE_CONFIG.radius
			} else {
				// 矩形节点：右侧连接点 = 节点X + 宽度
				startX = sourceNode.x + nodeWidth
			}

			// 关键修改：根据节点形状计算“目标节点左侧连接点”
			let endX
			const endY = targetNode.y + nodeHeight / 2 // 垂直中点不变
			if (isCircleNode(targetNode)) {
				// 圆形节点：左侧连接点 = 节点X + 矩形宽度的1/2（圆心X） - 半径 - 5（预留间隙）
				endX = targetNode.x + nodeWidth / 2 - NODE_CONFIG.radius - 5
			} else {
				// 矩形节点：左侧连接点 = 节点X - 5（预留间隙）
				endX = targetNode.x - 5
			}

			const dx = endX - startX
			const dy = endY - startY

			// 如果距离较近，直接使用直线
			if (Math.abs(dx) < 80 && Math.abs(dy) < 30) {
				return `M ${startX} ${startY} L ${endX} ${endY}`
			}

			// 如果距离较远，使用曲线但确保末端对齐
			if (Math.abs(dx) > 100 || Math.abs(dy) > 50) {
				// 计算曲线控制点
				if (Math.abs(dy) > 50) {
					// 垂直方向较远的连接
					const controlOffset = Math.min(Math.abs(dy) * 0.3, 100)
					const controlX1 = startX + controlOffset
					const controlX2 = endX - controlOffset

					// 为了让箭头对齐，我们计算一个更精确的终点
					// 在曲线的最后几个像素处转为直线
					const curveEndX = endX - 10 // 最后10像素改为直线
					const curveEndY = endY

					return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${curveEndX} ${curveEndY} L ${endX} ${endY}`
				} else {
					// 水平方向较远的连接
					const controlX = startX + dx * 0.5
					const curveEndX = endX - 30 // 最后10像素改为直线
					const curveEndY = endY

					return `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${curveEndX} ${curveEndY} L ${endX} ${endY}`
				}
			} else {
				// 中等距离使用直线
				return `M ${startX} ${startY} L ${endX} ${endY}`
			}
		}
		const getLinkLabelPosition = link => {
			const sourceNode = nodeMap.value[link.source]
			const targetNode = nodeMap.value[link.target]
			if (!sourceNode || !targetNode) return { x: 0, y: 0 }
			const startX = sourceNode.x + nodeWidth
			const startY = sourceNode.y + nodeHeight / 2
			const endX = targetNode.x - 5
			const endY = targetNode.y + nodeHeight / 2
			return { x: (startX + endX) / 2, y: (startY + endY) / 2 - 10 }
		}

		const getLinkLabel = link => link.label || `${nodeMap.value[link.source]?.label} → ${nodeMap.value[link.target]?.label}`
		const selectNode = node => {
			selectedNode.value = node.id
			selectedLink.value = null
			detailDialogVisible.value = true
		}
		const selectLink = link => {
			selectedLink.value = link
			selectedNode.value = null
			linkDialogVisible.value = true
		}
		const handleRelatedNodeClick = nodeId => {
			selectedNode.value = nodeId
			const node = nodes.value.find(n => n.id === nodeId)
			if (node) centerViewOnNode(node)
		}
		const deselectAll = () => {
			selectedNode.value = null
			selectedLink.value = null
		}
		const preventPanOnNode = e => e.stopPropagation()
		const hasRelatedNodes = nodeId => links.value.some(link => link.source === nodeId || link.target === nodeId)
		const getRelatedNodes = nodeId => {
			const relatedIds = new Set()
			links.value.forEach(link => {
				if (link.source === nodeId) relatedIds.add(link.target)
				if (link.target === nodeId) relatedIds.add(link.source)
			})
			return Array.from(relatedIds)
				.map(id => nodeMap.value[id])
				.filter(Boolean)
		}

		const getNodeGradient = node => {
			switch (node.type) {
				case 'start':
				case 'collection':
					return 'url(#start-gradient)'
				case 'end':
					return 'url(#end-gradient)'
				default:
					return 'url(#normal-gradient)'
			}
		}

		const getNodeIcon = node => NODE_ICONS[node.type] || NODE_ICONS.normal
		const formatTime = timeStr => (timeStr ? timeStr.split(' ')[1].substring(0, 5) : '')
		const formatStatus = status => STATUS_MAP[status] || status

		// 悬停提示方法
		const showNodeTooltip = (node, e) => {
			// 校验节点有效性
			if (!node || typeof node !== 'object') return

			nodeTooltip.value = { ...node } // 浅拷贝节点数据（无需深拷贝）
			nodeTooltipVisible.value = true
			// 计算节点在 SVG 中的位置
			const nodeX = node.x
			const nodeY = node.y
			// 转换为视口坐标（考虑当前的缩放和平移）
			const actualX = (nodeX + nodeWidth + 10) * scale.value + translateX.value
			const actualY = (nodeY + nodeHeight / 2) * scale.value + translateY.value

			// 设置 Tooltip 位置（相对于节点右侧）
			tooltipX.value = actualX + 10
			tooltipY.value = actualY + 30 // 垂直居中偏上

			// 动态边界检查
			nextTick(() => {
				const tooltipEl = document.querySelector('.node-tooltip')
				if (!tooltipEl) return

				const tooltipWidth = tooltipEl.offsetWidth
				const tooltipHeight = tooltipEl.offsetHeight
				const viewportWidth = window.innerWidth
				const viewportHeight = window.innerHeight

				// 右侧超出视口 → 显示在节点左侧
				if (tooltipX.value + tooltipWidth > viewportWidth) {
					tooltipX.value = (nodeX - 10) * scale.value + translateX.value - tooltipWidth
				}

				// 底部超出视口 → 向上调整
				if (tooltipY.value + tooltipHeight > viewportHeight) {
					tooltipY.value = viewportHeight - tooltipHeight - 10
				}

				// 顶部超出视口 → 向下调整
				if (tooltipY.value < 0) {
					tooltipY.value = 10
				}
			})
		}
		const hideNodeTooltip = () => {
			// 添加延迟隐藏，避免快速移动时闪烁
			setTimeout(() => {
				if (!nodeTooltipVisible.value) {
					// 确保没有被重新触发
					nodeTooltip.value = null
				}
			}, 100)
			nodeTooltipVisible.value = false
		}

		// 视图控制方法
		const applyTransform = () => {
			if (!svgRef.value) return
			svgRef.value.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
			svgRef.value.style.transformOrigin = '0 0'
		}

		const resetView = () => {
			scale.value = 1
			translateX.value = 0
			translateY.value = 0
			applyTransform()
		}
		const centerViewOnNode = node => {
			if (!wrapperRef.value || !svgRef.value) return
			const wrapperRect = wrapperRef.value.getBoundingClientRect()
			const wrapperCenterX = wrapperRect.width / 2
			const wrapperCenterY = wrapperRect.height / 2
			const nodeCenterX = node.x + nodeWidth / 2
			const nodeCenterY = node.y + nodeHeight / 2
			translateX.value = wrapperCenterX - nodeCenterX * scale.value
			translateY.value = wrapperCenterY - nodeCenterY * scale.value
			applyTransform()
		}

		const zoomIn = () => {
			if (scale.value < ZOOM_CONFIG.max) {
				scale.value = Number((scale.value + ZOOM_CONFIG.step).toFixed(1))
				applyTransform()
			}
		}
		const zoomOut = () => {
			if (scale.value > ZOOM_CONFIG.min) {
				scale.value = Number((scale.value - ZOOM_CONFIG.step).toFixed(1))
				applyTransform()
			}
		}
		const handleZoom = e => {
			e.preventDefault()
			if (!svgRef.value) return
			const rect = svgRef.value.getBoundingClientRect()
			lastMousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
			const delta = e.deltaY > 0 ? -ZOOM_CONFIG.step : ZOOM_CONFIG.step
			const newScale = Math.max(ZOOM_CONFIG.min, Math.min(scale.value + delta, ZOOM_CONFIG.max))
			translateX.value = lastMousePos.value.x - (lastMousePos.value.x * newScale) / scale.value + translateX.value
			translateY.value = lastMousePos.value.y - (lastMousePos.value.y * newScale) / scale.value + translateY.value
			scale.value = Number(newScale.toFixed(1))
			applyTransform()
		}

		const startPan = e => {
			if (e.button !== 0) return
			isPanning.value = true
			startPanX.value = e.clientX
			startPanY.value = e.clientY
			startTranslateX.value = translateX.value
			startTranslateY.value = translateY.value
		}
		const pan = e => {
			if (!isPanning.value) return
			const moveX = (e.clientX - startPanX.value) / scale.value
			const moveY = (e.clientY - startPanY.value) / scale.value
			translateX.value = startTranslateX.value + moveX
			translateY.value = startTranslateY.value + moveY
			applyTransform()
		}
		const stopPan = () => {
			isPanning.value = false
		}

		// 自动布局方法
		const toggleAutoLayout = () => {
			autoLayoutEnabled.value = !autoLayoutEnabled.value
			if (autoLayoutEnabled.value) applyAutoLayout()
		}
		const applyAutoLayout = () => {
			const { nodes: layoutNodes, links: layoutLinks } = dagreLayout(nodes.value, links.value, NODE_CONFIG)
			nodes.value = layoutNodes
			links.value = layoutLinks
			const maxX = Math.max(...layoutNodes.map(node => node.x)) + nodeWidth + 50
			const maxY = Math.max(...layoutNodes.map(node => node.y)) + nodeHeight + 50
			svgWidth.value = Math.max(maxX, SVG_DEFAULT_SIZE.width)
			svgHeight.value = Math.max(maxY, SVG_DEFAULT_SIZE.height)
			nextTick(resetView)
		}

		// 导出方法
		const exportAsImage = () => {
			if (!svgRef.value) return
			const tempContainer = document.createElement('div')
			tempContainer.style.position = 'absolute'
			tempContainer.style.top = '-9999px'
			tempContainer.style.left = '-9999px'
			document.body.appendChild(tempContainer)
			const svgClone = svgRef.value.cloneNode(true)
			svgClone.style.transform = 'none'
			svgClone.style.width = `${svgWidth.value}px`
			svgClone.style.height = `${svgHeight.value}px`
			tempContainer.appendChild(svgClone)
			html2canvas(tempContainer, { scale: 2, useCORS: true, logging: false })
				.then(canvas => {
					const link = document.createElement('a')
					link.download = `港口作业流程图_${new Date().getTime()}.png`
					link.href = canvas.toDataURL('image/png')
					link.click()
					ElMessage.success('导出成功')
				})
				.catch(err => {
					console.error('导出失败:', err)
					ElMessage.error('导出失败，请重试')
				})
				.finally(() => document.body.removeChild(tempContainer))
		}

		// 网格切换方法
		const toggleGrid = () => {
			showGrid.value = !showGrid.value
		}

		// 全屏功能
		const toggleFullscreen = () => {
			const wrapper = wrapperRef.value
			if (!document.fullscreenElement) {
				if (wrapper.requestFullscreen) {
					wrapper.requestFullscreen().catch(err => {
						ElMessage.warning(`全屏失败: ${err.message}`)
					})
				} else if (wrapper.webkitRequestFullscreen) {
					// Safari
					wrapper.webkitRequestFullscreen()
				} else if (wrapper.msRequestFullscreen) {
					// IE11
					wrapper.msRequestFullscreen()
				}
				isFullscreen.value = true
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen()
				} else if (document.webkitExitFullscreen) {
					// Safari
					document.webkitExitFullscreen()
				} else if (document.msExitFullscreen) {
					// IE11
					document.msExitFullscreen()
				}
				isFullscreen.value = false
			}
		}

		// 监听全屏状态变化
		const handleFullscreenChange = () => {
			isFullscreen.value = !!document.fullscreenElement
			// 关键：全屏/退出全屏后，重新计算 wrapper 尺寸并更新 SVG
			nextTick(handleResize)
		}

		// 初始化数据
		const initNodesAndLinks = () => {
			const treeData = props.treeData.length > 0 ? props.treeData : getDefaultTreeData()
			const flatNodes = flattenTree(treeData)
			nodes.value = flatNodes
			links.value = flatNodes
				.filter(node => node.parentId !== null)
				.map(node => ({
					source: node.parentId,
					target: node.id,
					label: `${node.parentId}-${node.id}流程`,
				}))
		}

		// 响应式处理
		const handleResize = () => {
			if (!wrapperRef.value) return
			const wrapper = wrapperRef.value
			// 全屏时使用 wrapper 实际尺寸（全屏后 wrapper 会占满屏幕）
			const wrapperWidth = wrapper.clientWidth
			const wrapperHeight = wrapper.clientHeight
			// SVG 尺寸至少为默认值，最大为 wrapper 尺寸
			svgWidth.value = Math.max(wrapperWidth, SVG_DEFAULT_SIZE.width)
			svgHeight.value = Math.max(wrapperHeight, SVG_DEFAULT_SIZE.height)
			nextTick(applyTransform)
		}

		// 生命周期
		onMounted(() => {
			initNodesAndLinks()
			handleResize()
			if (autoLayoutEnabled.value) applyAutoLayout()
			else applyTransform()
			window.addEventListener('resize', handleResize)
			document.addEventListener('fullscreenchange', handleFullscreenChange)
			document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
			document.addEventListener('msfullscreenchange', handleFullscreenChange)
		})

		onUnmounted(() => {
			window.removeEventListener('resize', handleResize)
			document.removeEventListener('fullscreenchange', handleFullscreenChange)
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
			document.removeEventListener('msfullscreenchange', handleFullscreenChange)
			// 新增：清理悬停状态
			hideNodeTooltip()
			nodeTooltip.value = null
			nodeTooltipVisible.value = false
		})

		watch(
			() => props.treeData,
			() => {
				initNodesAndLinks()
				if (autoLayoutEnabled.value) applyAutoLayout()
			},
			{ deep: true }
		)
		watch(
			() => props.config,
			newConfig => {
				Object.assign(NODE_CONFIG, newConfig)
				showGrid.value = NODE_CONFIG.showGrid
				applyAutoLayout()
			},
			{ deep: true }
		)
		watch(selectedNode, newVal => {
			if (!newVal) detailDialogVisible.value = false
		})
		watch(selectedLink, newVal => {
			if (!newVal) linkDialogVisible.value = false
		})

		return {
			Refresh,
			ZoomIn,
			ZoomOut,
			Position,
			Picture,
			Grid,
			FullScreen,
			wrapperRef,
			svgRef,
			nodes,
			links,
			nodeWidth,
			nodeHeight,
			svgWidth,
			svgHeight,
			selectedNode,
			hoveredNode,
			selectedLink,
			hoveredLink,
			detailDialogVisible,
			linkDialogVisible,
			selectedNodeDetails,
			isPanning,
			autoLayoutEnabled,
			showGrid,
			isFullscreen,
			NODE_CONFIG, // 新增：传递配置到模板
			isCircleNode, // 新增：传递判断函数到模板
			nodeTooltipVisible,
			nodeTooltip,
			tooltipX,
			tooltipY,
			calculateLinkPath,
			getLinkLabelPosition,
			getLinkLabel,
			selectNode,
			selectLink,
			handleRelatedNodeClick,
			deselectAll,
			preventPanOnNode,
			hasRelatedNodes,
			getRelatedNodes,
			getNodeGradient,
			getNodeIcon,
			formatTime,
			formatStatus,
			showNodeTooltip,
			hideNodeTooltip,
			resetView,
			zoomIn,
			zoomOut,
			handleZoom,
			startPan,
			pan,
			stopPan,
			toggleAutoLayout,
			toggleGrid,
			exportAsImage,
			toggleFullscreen,
		}
	},
}
</script>

<style scoped>
.flowchart-container {
	width: 100%;
	height: 100%;
	min-height: 600px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.controls {
	padding: 12px 20px;
	background: #f5f7fa;
	border-bottom: 1px solid #e4e7ed;
	display: flex;
	gap: 12px;
	align-items: center;
	flex-wrap: wrap;
}

.flowchart-wrapper {
	flex: 1;
	overflow: auto;
	position: relative;
	padding: 20px;
	background: #fff;
}

svg {
	background-color: #f9fafc;
	border-radius: 8px;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	overflow: visible !important;
	transition: transform 0.1s ease;
}

.link {
	cursor: pointer;
	transition: all 0.2s ease;
	stroke-width: 2.5px;
	stroke-linecap: round;
	stroke-linejoin: round;
}

.link:hover {
	stroke: #409eff;
	stroke-width: 2.5px;
}

.link-label {
	font-size: 11px;
	font-weight: 500;
	pointer-events: none;
	user-select: none;
}

.node {
	stroke-width: 2px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.node.start,
.node.collection {
	stroke: #67c23a;
}
.node.normal,
.node.storage,
.node.loading,
.node.unloading,
.node.transfer {
	stroke: #409eff;
}
.node.end {
	stroke: #909399;
}

.node.selected {
	stroke: #409eff;
	stroke-width: 3px;
	filter: drop-shadow(0 0 8px rgba(64, 158, 255, 0.8));
}

.node.hover {
	stroke-width: 2.5px;
	filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.4));
}

.node-label {
	font-weight: 600;
	font-size: 14px;
	fill: #303133;
	pointer-events: none;
}

.node-info {
	font-size: 11px;
	fill: #606266;
	pointer-events: none;
	white-space: nowrap;
}

.node.hover {
  stroke-width: 2.5px;
  filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.4));
}
.node.selected {
  stroke: #409eff;
  stroke-width: 3px;
  filter: drop-shadow(0 0 8px rgba(64, 158, 255, 0.8));
}
/* 圆形节点的状态指示器位置无需修改（原位置在右上角，与矩形一致） */
.status-indicator {
	stroke: #fff;
	stroke-width: 1.5;
}
/* 状态颜色过渡 */
.status-indicator {
	transition: fill 0.5s ease;
}

/* 节点背景过渡 */
.node {
	transition: fill 0.5s ease, stroke 0.3s ease;
}
.status-indicator.completed {
	fill: #67c23a;
}
.status-indicator.processing {
	fill: #e6a23c;
}
.status-indicator.pending {
	fill: #909399;
}
.status-indicator.cancelled {
	fill: #f56c6c;
}

.node-tooltip {
	position: absolute;
	background: rgba(0, 0, 0, 0.85);
	color: white;
	padding: 10px 14px;
	border-radius: 6px;
	font-size: 12px;
	pointer-events: none;
	z-index: 9999;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	min-width: 220px;
	backdrop-filter: blur(4px);
	transition: opacity 0.2s ease, transform 0.2s ease;
	transform: translateZ(0);
}

/* 默认箭头（向右） */
.node-tooltip::before {
	content: '';
	position: absolute;
	top: 50%;
	left: -6px;
	transform: translateY(-50%);
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	border-right: 6px solid rgba(0, 0, 0, 0.85);
}

/* 向左箭头 */
.node-tooltip[data-arrow='left']::before {
	left: auto;
	right: -6px;
	border-right: none;
	border-left: 6px solid rgba(0, 0, 0, 0.85);
}

/* 向上箭头 */
.node-tooltip[data-arrow='top']::before {
	top: -6px;
	left: 50%;
	right: auto;
	transform: translateX(-50%);
	border-right: none;
	border-bottom: 6px solid rgba(0, 0, 0, 0.85);
	border-top: none;
}

/* 向下箭头 */
.node-tooltip[data-arrow='bottom']::before {
	bottom: -6px;
	top: auto;
	left: 50%;
	right: auto;
	transform: translateX(-50%);
	border-right: none;
	border-top: 6px solid rgba(0, 0, 0, 0.85);
	border-bottom: none;
}

.tooltip-title {
	font-weight: bold;
	margin-bottom: 4px;
	padding-bottom: 4px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.tooltip-content {
	margin: 3px 0;
}

@media (max-width: 768px) {
	.controls {
		padding: 8px 12px;
	}
	.flowchart-wrapper {
		padding: 10px;
	}
}
</style>