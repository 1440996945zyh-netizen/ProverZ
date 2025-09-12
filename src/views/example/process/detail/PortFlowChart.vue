<template>
  <div class="flowchart-container">
    <div class="controls">
      <el-button type="primary" @click="resetView">重置视图</el-button>
      <el-button @click="zoomIn">放大</el-button>
      <el-button @click="zoomOut">缩小</el-button>
      <el-button @click="fitToView">适应视图</el-button>
      <el-button @click="toggleGrid">网格显示</el-button>
      <el-button @click="autoLayout">重新布局</el-button>
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
        <!-- 网格背景 -->
        <defs v-if="showGrid">
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ebeef5" stroke-width="1"/>
          </pattern>
        </defs>
        
        <rect v-if="showGrid" width="100%" height="100%" fill="url(#grid)" />
        
        <!-- 箭头标记 & 阴影定义 -->
        <defs>
          <marker
            id="arrowhead-normal"
            markerWidth="12"
            markerHeight="8"
            refX="6"  
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 12 4, 0 8" fill="#606266" />
          </marker>
          
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.2"/>
          </filter>
        </defs>
        
        <!-- 连接线 -->
        <g v-for="(link, index) in links" :key="'link-' + index">
          <path
            :d="calculateLinkPath(link)"
            fill="none"
            :stroke="getLinkColor(link)"
            stroke-width="2"
            marker-end="url(#arrowhead-normal)" 
            class="link"
            @click.stop="handleLinkClick(link)"
          />
        </g>
        
        <!-- 节点 -->
        <g 
          v-for="node in nodes" 
          :key="`node-${node.id}`"
          @click.stop="selectNode(node)"
          @mousedown.stop="preventPanOnNode"
        >
          <rect
            :x="node.x"
            :y="node.y"
            :width="nodeWidth"
            :height="nodeHeight"
            :rx="nodeRadius"
            :class="[
              'node',
              node.type,
              { selected: selectedNode === node.id }
            ]"
            filter="url(#nodeShadow)"
          />
          
          <foreignObject
            :x="node.x"
            :y="node.y"
            :width="nodeWidth"
            :height="nodeHeight"
          >
            <div class="node-content" xmlns="http://www.w3.org/1999/xhtml">
              <div class="node-header">
                <span class="node-label">{{ node.label }}</span>
                <el-tag 
                  :type="getNodeTypeTag(node.type)" 
                  size="small"
                  class="node-type-tag"
                >
                  {{ getNodeTypeText(node.type) }}
                </el-tag>
              </div>
              <div class="node-body">
                <div class="node-field">
                  <span class="field-label">货物:</span>
                  <span class="field-value">{{ node.cargo }}</span>
                </div>
                <div class="node-field">
                  <span class="field-label">件数:</span>
                  <span class="field-value">{{ node.pieces }}</span>
                </div>
                <div class="node-field">
                  <span class="field-label">吨数:</span>
                  <span class="field-value">{{ node.weight }}t</span>
                </div>
                <div class="node-field">
                  <span class="field-label">区域:</span>
                  <span class="field-value">{{ node.area }}</span>
                </div>
              </div>
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
    
    <!-- 节点详情弹窗 -->
    <el-dialog
      :title="selectedNodeDetails?.label || '节点详情'"
      v-model="detailDialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedNodeDetails" class="node-detail-content">
        <el-descriptions :column="2" border :size="'small'">
          <el-descriptions-item label="节点类型">
            <el-tag :type="getNodeTypeTag(selectedNodeDetails.type)">
              {{ getNodeTypeText(selectedNodeDetails.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="作业区域">
            <el-tag type="info">{{ selectedNodeDetails.area }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="货物类型">
            {{ selectedNodeDetails.cargo }}
          </el-descriptions-item>
          <el-descriptions-item label="操作员">
            {{ selectedNodeDetails.operator }}
          </el-descriptions-item>
          <el-descriptions-item label="件数">
            {{ selectedNodeDetails.pieces }} 件
          </el-descriptions-item>
          <el-descriptions-item label="吨数">
            {{ selectedNodeDetails.weight }} 吨
          </el-descriptions-item>
          <el-descriptions-item label="计划时间">
            {{ formatTime(selectedNodeDetails.plannedTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="实际时间" v-if="selectedNodeDetails.actualTime">
            {{ formatTime(selectedNodeDetails.actualTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedNodeDetails.status)">
              {{ getStatusText(selectedNodeDetails.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2" v-if="selectedNodeDetails.notes">
            {{ selectedNodeDetails.notes }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="related-nodes" v-if="hasRelatedNodes(selectedNodeDetails.id)">
          <h4 class="related-title">关联节点</h4>
          <el-table 
            :data="getRelatedNodes(selectedNodeDetails.id)" 
            stripe 
            :size="'small'"
            :max-height="200"
          >
            <el-table-column prop="label" label="节点名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型">
              <template #default="scope">
                <el-tag :type="getNodeTypeTag(scope.row.type)" size="small">
                  {{ getNodeTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="无关联节点" class="no-related-nodes"></el-empty>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElEmpty, ElTag, ElDialog, ElDescriptions, ElDescriptionsItem, ElTable, ElTableColumn, ElButton } from 'element-plus'

export default {
  name: 'PortOperationFlowchart',
  components: { 
    ElEmpty, ElTag, ElDialog, ElDescriptions, ElDescriptionsItem,
    ElTable, ElTableColumn, ElButton
  },
  // 1. 动态接收父组件传参：treeData（流程树数据）、config（布局配置）
  props: {
    /**
     * 流程树数据（父组件传递）
     * 结构：[{ id, label, type, children: [], cargo, pieces, weight, ... }]
     */
    treeData: {
      type: Array,
      required: false,
      // 默认复杂流程数据（按用户需求设计）
      default: () => [
        
      ]
    },
    /**
     * 布局配置（父组件可自定义）
     */
    config: {
      type: Object,
      default: () => ({
        nodeWidth: 180,    // 节点宽度
        nodeHeight: 120,   // 节点高度
        nodeRadius: 10,    // 节点圆角
        horizontalSpacing: 280, // 水平间距（控制横向线长）
        verticalSpacing: 200,   // 垂直间距（控制纵向线长）
        flowSpacing: 400,       // 并行流程间距
        showGrid: true          // 是否显示网格
      })
    }
  },
  setup(props) {
    // 配置常量（从props.config读取，支持父组件自定义）
    const NODE_CONFIG = {
      width: props.config.nodeWidth || 180,
      height: props.config.nodeHeight || 120,
      radius: props.config.nodeRadius || 10,
      horizontalSpacing: props.config.horizontalSpacing || 280,
      verticalSpacing: props.config.verticalSpacing || 200,
      flowSpacing: props.config.flowSpacing || 400,
      showGrid: props.config.showGrid !== undefined ? props.config.showGrid : true
    }
    
    const SVG_DEFAULT_SIZE = { width: '100vw', height: '100vh' }
    const ZOOM_CONFIG = { min: 0.2, max: 3, step: 0.1 }

    // DOM引用
    const wrapperRef = ref(null)
    const svgRef = ref(null)

    // 状态管理
    const { width: nodeWidth, height: nodeHeight, radius: nodeRadius, 
            horizontalSpacing, verticalSpacing, flowSpacing } = NODE_CONFIG
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
    const detailDialogVisible = ref(false)
    const showGrid = ref(NODE_CONFIG.showGrid)

    // 核心数据：扁平化节点 + 连接线
    const nodes = ref([])
    const links = ref([])

    // 2. 树结构转扁平化节点（递归处理）
    const flattenTree = (treeNodes, parentId = null, level = 0) => {
      let result = []
      treeNodes.forEach(node => {
        const flatNode = {
          ...node,
          parentId: parentId,   // 父节点ID（用于构建连接线）
          level: level,        // 节点层级（用于布局）
          x: 0,                // 节点X坐标（动态计算）
          y: 0                 // 节点Y坐标（动态计算）
        }
        result.push(flatNode)
        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          result = result.concat(flattenTree(node.children, node.id, level + 1))
        }
      })
      return result
    }

    // 3. 初始化节点和连接线（核心逻辑）
    const initNodesAndLinks = () => {
      // 从父组件传的treeData生成扁平化节点
      const flatNodes = flattenTree(props.treeData)
      nodes.value = flatNodes
      
      // 构建连接线（父节点→子节点）
      links.value = flatNodes
        .filter(node => node.parentId !== null) // 过滤根节点（无父节点）
        .map(node => ({
          source: node.parentId,  // 连接线起点（父节点ID）
          target: node.id,        // 连接线终点（子节点ID）
          sourceNode: flatNodes.find(n => n.id === node.parentId), // 缓存起点节点
          targetNode: node // 缓存终点节点
        }))
    }

    // 4. 计算节点位置（横向主流程+垂直分支，解决重叠）
    const calculateNodePositions = () => {
      if (nodes.value.length === 0) return
      
      // 步骤1：按「流程根节点」分组（每个start节点是一个独立流程）
      const rootNodes = nodes.value.filter(node => node.type === 'start')
      let currentFlowY = 150 // 第一个流程的起始Y坐标

      rootNodes.forEach(rootNode => {
        // 步骤2：收集当前流程的所有节点（根节点+后代）
        const flowNodes = []
        const collectFlowNodes = (nodeId) => {
          const node = nodes.value.find(n => n.id === nodeId)
          if (!node) return
          flowNodes.push(node)
          // 递归收集子节点
          const children = nodes.value.filter(n => n.parentId === nodeId)
          children.forEach(child => collectFlowNodes(child.id))
        }
        collectFlowNodes(rootNode.id)

        // 步骤3：按层级分组（level相同的节点在同一列）
        const levelMap = {}
        flowNodes.forEach(node => {
          if (!levelMap[node.level]) levelMap[node.level] = []
          levelMap[node.level].push(node)
        })
        const levels = Object.keys(levelMap).sort((a, b) => parseInt(a) - parseInt(b))

        // 步骤4：计算每列节点的位置
        let currentX = 150 // 第一列的起始X坐标
        const mainLineY = currentFlowY // 主流程的基准Y坐标

        levels.forEach(level => {
          const levelNodes = levelMap[level]
          const mainNode = levelNodes[0] // 每列的主节点（第一个节点）

          // 主节点位置（横向排列）
          mainNode.x = currentX
          mainNode.y = mainLineY

          // 处理当前列的子节点（垂直分支，避免重叠）
          if (levelNodes.length > 1) {
            // 总高度需求 = 子节点数量 × 垂直间距
            const totalHeight = (levelNodes.length - 1) * verticalSpacing
            // 起始Y坐标（使子节点对称分布在主节点周围）
            const startY = mainLineY - (totalHeight / 2)

            // 逐个设置子节点位置
            levelNodes.forEach((node, index) => {
              if (index === 0) return // 跳过主节点
              node.x = currentX // 同一列X坐标相同
              node.y = startY + (index - 1) * verticalSpacing // 垂直分布
            })
          }

          // 下一列的X坐标（控制横向线长）
          currentX += horizontalSpacing
        })

        // 下一个流程的起始Y坐标（避免并行流程重叠）
        currentFlowY += flowSpacing
      })

      // 最终检查：修正可能的重叠节点
      fixNodeOverlaps()
    }

    // 5. 节点重叠检测与修正
    const fixNodeOverlaps = () => {
      for (let i = 0; i < nodes.value.length; i++) {
        for (let j = i + 1; j < nodes.value.length; j++) {
          const nodeA = nodes.value[i]
          const nodeB = nodes.value[j]

          // 矩形碰撞检测（判断是否重叠）
          if (
            nodeA.x < nodeB.x + nodeWidth &&
            nodeA.x + nodeWidth > nodeB.x &&
            nodeA.y < nodeB.y + nodeHeight &&
            nodeA.y + nodeHeight > nodeB.y
          ) {
            // 同一列节点：调整Y坐标（保证垂直间距）
            if (nodeA.x === nodeB.x) {
              const minDistance = verticalSpacing
              const currentDistance = Math.abs(nodeA.y - nodeB.y)
              if (currentDistance < minDistance) {
                const direction = nodeA.y < nodeB.y ? 1 : -1
                nodeB.y = nodeA.y + (minDistance * direction)
              }
            }
            // 同一行节点：调整X坐标（保证水平间距）
            else if (nodeA.y === nodeB.y) {
              const minDistance = horizontalSpacing / 2
              const currentDistance = Math.abs(nodeA.x - nodeB.x)
              if (currentDistance < minDistance) {
                const direction = nodeA.x < nodeB.x ? 1 : -1
                nodeB.x = nodeA.x + (minDistance * direction)
              }
            }
          }
        }
      }
    }

    // 6. 计算连接线路径（支持直线/折线，箭头指向正确）
    const calculateLinkPath = (link) => {
      const sourceNode = link.sourceNode || nodes.value.find(n => n.id === link.source)
      const targetNode = link.targetNode || nodes.value.find(n => n.id === link.target)
      
      if (!sourceNode || !targetNode) return ''

      // 起点：源节点右侧中点
      const startX = sourceNode.x + nodeWidth
      const startY = sourceNode.y + nodeHeight / 2
      // 终点：目标节点左侧中点
      const endX = targetNode.x
      const endY = targetNode.y + nodeHeight / 2

      // 情况1：同一列节点（垂直分支）→ 折线
      if (sourceNode.x === targetNode.x) {
        const midX = startX + 50 // 横向延伸段（避免连接线贴节点）
        return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
      }

      // 情况2：同一行节点（横向主流程）→ 直线
      if (sourceNode.y === targetNode.y) {
        return `M ${startX} ${startY} L ${endX} ${endY}`
      }

      // 情况3：混合方向（斜向）→ 折线
      const midX = (startX + endX) / 2
      return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`
    }

    // 7. 辅助函数：获取连接线颜色（按节点类型区分）
    const getLinkColor = (link) => {
      const sourceNode = link.sourceNode || nodes.value.find(n => n.id === link.source)
      const targetNode = link.targetNode || nodes.value.find(n => n.id === link.target)
      
      if (sourceNode?.type === 'start') return '#409eff' // 开始节点的连接线：蓝色
      if (targetNode?.type === 'end') return '#67c23a'   // 结束节点的连接线：绿色
      if (sourceNode?.status === 'cancelled') return '#909399' // 取消节点：灰色
      return '#606266' // 默认：深灰色
    }

    // 8. 节点状态相关辅助函数
    const getNodeTypeTag = (type) => {
      switch (type) {
        case 'start': return 'primary'
        case 'end': return 'success'
        default: return 'info'
      }
    }
    
    const getNodeTypeText = (type) => {
      switch (type) {
        case 'start': return '开始节点'
        case 'end': return '结束节点'
        default: return '普通节点'
      }
    }
    
    const getStatusType = (status) => {
      switch (status) {
        case 'completed': return 'success'
        case 'processing': return 'warning'
        case 'pending': return 'info'
        case 'cancelled': return 'danger'
        default: return 'default'
      }
    }
    
    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return '已完成'
        case 'processing': return '进行中'
        case 'pending': return '待处理'
        case 'cancelled': return '已取消'
        default: return '未知状态'
      }
    }

    // 9. 视图控制函数（重置、缩放、平移等）
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

    const fitToView = () => {
      if (!wrapperRef.value || !svgRef.value) return
      
      // 计算所有节点的边界
      let minX = Infinity, minY = Infinity
      let maxX = -Infinity, maxY = -Infinity
      
      nodes.value.forEach(node => {
        minX = Math.min(minX, node.x)
        minY = Math.min(minY, node.y)
        maxX = Math.max(maxX, node.x + nodeWidth)
        maxY = Math.max(maxY, node.y + nodeHeight)
      })
      
      const containerWidth = wrapperRef.value.clientWidth
      const containerHeight = wrapperRef.value.clientHeight
      
      const contentWidth = maxX - minX
      const contentHeight = maxY - minY
      
      // 计算适配缩放比例
      const scaleX = containerWidth / (contentWidth + 200)
      const scaleY = containerHeight / (contentHeight + 200)
      const newScale = Math.min(scaleX, scaleY, 1)
      
      // 居中显示
      translateX.value = (containerWidth - contentWidth * newScale) / 2 - minX * newScale + 50
      translateY.value = (containerHeight - contentHeight * newScale) / 2 - minY * newScale + 50
      scale.value = Number(newScale.toFixed(1))
      
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

    const toggleGrid = () => {
      showGrid.value = !showGrid.value
    }

    const handleZoom = (e) => {
      e.preventDefault()
      if (!svgRef.value) return

      const rect = svgRef.value.getBoundingClientRect()
      lastMousePos.value = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      const delta = e.deltaY > 0 ? -ZOOM_CONFIG.step : ZOOM_CONFIG.step
      const newScale = Math.max(ZOOM_CONFIG.min, Math.min(scale.value + delta, ZOOM_CONFIG.max))
      
      // 缩放时保持鼠标位置不变
      translateX.value = lastMousePos.value.x - (lastMousePos.value.x * newScale) / scale.value + translateX.value
      translateY.value = lastMousePos.value.y - (lastMousePos.value.y * newScale) / scale.value + translateY.value
      
      scale.value = Number(newScale.toFixed(1))
      applyTransform()
    }

    // 10. 拖拽平移相关函数
    const startPan = (e) => {
      if (e.button !== 0) return // 只响应左键
      isPanning.value = true
      startPanX.value = e.clientX
      startPanY.value = e.clientY
      startTranslateX.value = translateX.value
      startTranslateY.value = translateY.value
    }
    
    const pan = (e) => {
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

    // 11. 节点交互函数（选择、详情等）
    const selectNode = (node) => {
      selectedNode.value = node.id
      detailDialogVisible.value = true
    }

    const deselectAll = () => {
      selectedNode.value = null
      detailDialogVisible.value = false
    }

    const preventPanOnNode = (e) => {
      e.stopPropagation() // 点击节点时不触发画布平移
    }

    const handleLinkClick = (link) => {
      console.log('连接线点击:', {
        source: link.source,
        target: link.target,
        sourceLabel: nodes.value.find(n => n.id === link.source)?.label,
        targetLabel: nodes.value.find(n => n.id === link.target)?.label
      })
    }

    // 12. 关联节点查询（详情弹窗用）
    const hasRelatedNodes = (nodeId) => {
      return links.value.some(link => 
        link.source === nodeId || link.target === nodeId
      )
    }
    
    const getRelatedNodes = (nodeId) => {
      const relatedIds = new Set()
      links.value.forEach(link => {
        if (link.source === nodeId) relatedIds.add(link.target)
        if (link.target === nodeId) relatedIds.add(link.source)
      })
      return Array.from(relatedIds)
        .map(id => nodes.value.find(n => n.id === id))
        .filter(Boolean)
    }

    // 13. 辅助函数：时间格式化
    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      return timeStr.replace(' ', '<br/>') // 换行显示日期和时间
    }

    // 14. 响应式处理：窗口 resize + treeData 变化
    const handleResize = () => {
      if (!wrapperRef.value) return
      const wrapperWidth = wrapperRef.value.clientWidth * 0.9
      const wrapperHeight = wrapperRef.value.clientHeight * 0.9
      svgWidth.value = Math.max(wrapperWidth, 1200) // 最小宽度1200，适配复杂流程
      svgHeight.value = Math.max(wrapperHeight, 800)  // 最小高度800
      nextTick(applyTransform)
    }

    // 15. 重新布局函数
    const autoLayout = () => {
      initNodesAndLinks()
      calculateNodePositions()
      nextTick(applyTransform)
    }

    // 16. 计算属性：当前选中节点详情
    const selectedNodeDetails = computed(() => {
      return nodes.value.find(node => node.id === selectedNode.value) || null
    })

    // 17. 生命周期与监听
    onMounted(() => {
      // 初始化布局
      initNodesAndLinks()
      calculateNodePositions()
      handleResize()
      applyTransform()
      
      // 窗口resize监听
      window.addEventListener('resize', handleResize)
      
      // 键盘ESC取消选择
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') deselectAll()
      })
    })

    // 监听父组件treeData变化，自动更新布局
    watch(
      () => props.treeData,
      () => {
        autoLayout()
      },
      { deep: true } // 深度监听对象/数组变化
    )

    // 监听config变化，重新应用配置
    watch(
      () => props.config,
      (newConfig) => {
        // 更新配置常量
        Object.assign(NODE_CONFIG, newConfig)
        autoLayout()
      },
      { deep: true }
    )

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', (e) => e.key === 'Escape' && deselectAll())
    })

    return {
      wrapperRef,
      svgRef,
      nodes,
      links,
      nodeWidth,
      nodeHeight,
      nodeRadius,
      horizontalSpacing,
      verticalSpacing,
      flowSpacing,
      svgWidth,
      svgHeight,
      selectedNode,
      detailDialogVisible,
      selectedNodeDetails,
      isPanning,
      showGrid,
      calculateLinkPath,
      getLinkColor,
      selectNode,
      deselectAll,
      preventPanOnNode,
      handleLinkClick,
      hasRelatedNodes,
      getRelatedNodes,
      getNodeTypeTag,
      getNodeTypeText,
      getStatusType,
      getStatusText,
      resetView,
      zoomIn,
      zoomOut,
      fitToView,
      toggleGrid,
      autoLayout,
      handleZoom,
      startPan,
      pan,
      stopPan,
      formatTime
    }
  }
}
</script>

<style scoped>
.flowchart-container {
  width: 100%;
  height: 100%;
  min-height: 800px; /* 提高最小高度，适配复杂流程 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
  background-color: #ffffff;
  border-radius: 8px;
  overflow: visible !important;
  transition: transform 0.1s ease;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 节点样式：按状态区分背景色 */
.node {
  stroke-width: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.node.start {
  fill: #e6f7ff;
  stroke: #1890ff;
}

.node.end {
  fill: #f0f9eb;
  stroke: #4caf50;
}

.node.normal {
  fill: #f9fafc;
  stroke: #409eff;
}

.node.selected {
  stroke: #409eff;
  stroke-width: 3px;
  filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.6));
}

.node:hover {
  filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.4));
  stroke-width: 2.5px;
}

/* 节点内容样式优化 */
.node-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.node-label {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-type-tag {
  font-size: 12px;
}

.node-body {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.node-field {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.field-label {
  font-weight: 500;
  color: #909399;
  width: 40px;
  white-space: nowrap;
}

.field-value {
  color: #303133;
  text-align: right;
  flex: 1;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 连接线样式 */
.link {
  cursor: pointer;
  transition: all 0.2s ease;
}

.link:hover {
  stroke: #409eff;
  stroke-width: 2.5px;
}

/* 箭头样式 */
#arrowhead {
  fill: #606266;
  transition: fill 0.2s ease;
}

.link:hover #arrowhead {
  fill: #409eff;
}

/* 详情弹窗样式 */
.node-detail-content {
  padding: 8px 0;
}

.related-nodes {
  margin-top: 16px;
}

.related-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.no-related-nodes {
  margin-top: 16px;
  padding: 20px 0;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .flowchart-container {
    min-height: 600px;
  }
  
  .node-content {
    padding: 6px;
  }
  
  .node-label {
    font-size: 13px;
  }
  
  .node-field {
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .controls {
    flex-wrap: wrap;
    padding: 8px 12px;
  }
  
  .flowchart-wrapper {
    padding: 10px;
  }
  
  .node-content {
    padding: 4px;
  }
  
  .node-label {
    font-size: 12px;
  }
  
  .node-field {
    font-size: 10px;
  }
}
</style>