<template>
  <div class="process-viewer">
    <!-- 流程画布容器 -->
    <div class="process-canvas" style="height: 100%;" ref="processCanvas" />

    <!-- 已完成节点悬浮弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      class="comment-dialog"
      :title="dlgTitle || '审批记录'"
      width="800px"
      append-to-body
    >
      <el-row>
        <el-table
          :data="taskCommentList"
          size="mini"
          border
          header-cell-class-name="table-header-gray"
        >
          <el-table-column label="序号" header-align="center" align="center" type="index" width="55px" />
          <el-table-column label="候选办理" prop="candidate" width="150px" align="center" />
          <el-table-column label="实际办理" prop="assigneeName" width="100px" align="center" />
          <el-table-column label="处理时间" prop="createTime" width="140px" align="center" />
          <el-table-column label="办结时间" prop="finishTime" width="140px" align="center" />
          <el-table-column label="耗时" prop="duration" width="100px" align="center" />
          <el-table-column label="审批意见" align="center">
            <template #default="{ row }">
              {{ row.commentList && row.commentList[0] ? row.commentList[0].fullMessage : '' }}
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-dialog>

    <!-- 缩放控制按钮组 -->
    <div style="position: absolute; top: 0px; left: 0px; width: 100%;">
      <el-row type="flex" justify="end">
        <el-button-group key="scale-control" size="medium">
          <el-button
            size="medium"
            type="default"
            :plain="true"
            :disabled="defaultZoom <= 0.3"
            icon="ZoomOut"
            @click="processZoomOut()"
          />
          <el-button
            size="medium"
            type="default"
            style="width: 90px;"
          >
            {{ Math.floor(defaultZoom * 10 * 10) + '%' }}
          </el-button>
          <el-button
            size="medium"
            type="default"
            :plain="true"
            :disabled="defaultZoom >= 3.9"
            icon="ZoomIn"
            @click="processZoomIn()"
          />
          <el-button
            size="medium"
            type="default"
            icon="ScaleToOriginal"
            @click="processReZoom()"
          />
          <slot />
        </el-button-group>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import BpmnViewer from 'bpmn-js/lib/Viewer'
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'

// 导入主题样式（保持原样）
import '@/plugins/package/theme/index.scss'

// Props
const props = defineProps({
  xml: {
    type: String,
    default: ''
  },
  finishedInfo: {
    type: Object,
    default: () => ({})
  },
  allCommentList: {
    type: Array,
    default: () => []
  }
})

// 响应式状态
const dialogVisible = ref(false)
const dlgTitle = ref(undefined)
const defaultZoom = ref(1)
const isLoading = ref(true) // 初始设为 true，等 XML 加载完再显示画布
const selectTaskId = ref(undefined)
const taskCommentList = ref([])
const hoverTimer = ref(null)

// 引用
const processCanvas = ref(null)

// 非响应式引用（BPMN 实例）
let bpmnViewer = null
let processNodeInfo = null

// 清空查看器
const clearViewer = () => {
  if (processCanvas.value) {
    processCanvas.value.innerHTML = ''
  }
  if (bpmnViewer) {
    bpmnViewer.destroy()
    bpmnViewer = null
  }
}

// ✅ 动态创建并插入 SVG <defs>（关键修复！）
const createCustomMarkers = () => {
  const canvas = bpmnViewer.get('canvas')
  const svg = canvas._svg

  // 创建 <defs> 元素（在 SVG 命名空间内）
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

  // ✅ 成功状态箭头
  const successMarker1 = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  successMarker1.id = 'sequenceflow-end-white-success'
  successMarker1.setAttribute('viewBox', '0 0 20 20')
  successMarker1.setAttribute('refX', '11')
  successMarker1.setAttribute('refY', '10')
  successMarker1.setAttribute('markerWidth', '10')
  successMarker1.setAttribute('markerHeight', '10')
  successMarker1.setAttribute('orient', 'auto')

  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path1.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
  path1.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; fill: #13ce66; stroke: #13ce66;')
  path1.classList.add('success-arrow')
  successMarker1.appendChild(path1)

  const successMarker2 = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  successMarker2.id = 'conditional-flow-marker-white-success'
  successMarker2.setAttribute('viewBox', '0 0 20 20')
  successMarker2.setAttribute('refX', '-1')
  successMarker2.setAttribute('refY', '10')
  successMarker2.setAttribute('markerWidth', '10')
  successMarker2.setAttribute('markerHeight', '10')
  successMarker2.setAttribute('orient', 'auto')

  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path2.setAttribute('d', 'M 0 10 L 8 6 L 16 10 L 8 14 Z')
  path2.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; fill: #13ce66; stroke: #13ce66;')
  path2.classList.add('success-conditional')
  successMarker2.appendChild(path2)

  // ✅ 失败状态箭头
  const failMarker1 = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  failMarker1.id = 'sequenceflow-end-white-fail'
  failMarker1.setAttribute('viewBox', '0 0 20 20')
  failMarker1.setAttribute('refX', '11')
  failMarker1.setAttribute('refY', '10')
  failMarker1.setAttribute('markerWidth', '10')
  failMarker1.setAttribute('markerHeight', '10')
  failMarker1.setAttribute('orient', 'auto')

  const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path3.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
  path3.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; fill: #ff4949; stroke: #ff4949;')
  path3.classList.add('fail-arrow')
  failMarker1.appendChild(path3)

  const failMarker2 = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  failMarker2.id = 'conditional-flow-marker-white-fail'
  failMarker2.setAttribute('viewBox', '0 0 20 20')
  failMarker2.setAttribute('refX', '-1')
  failMarker2.setAttribute('refY', '10')
  failMarker2.setAttribute('markerWidth', '10')
  failMarker2.setAttribute('markerHeight', '10')
  failMarker2.setAttribute('orient', 'auto')

  const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path4.setAttribute('d', 'M 0 10 L 8 6 L 16 10 L 8 14 Z')
  path4.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1; fill: #ff4949; stroke: #ff4949;')
  path4.classList.add('fail-conditional')
  failMarker2.appendChild(path4)

  // 将所有 marker 添加到 defs
  defs.appendChild(successMarker1)
  defs.appendChild(successMarker2)
  defs.appendChild(failMarker1)
  defs.appendChild(failMarker2)

  // 将 defs 插入 SVG 根节点（必须在 importXML 前或之后立即执行）
  svg.appendChild(defs)
}

// 处理元素点击事件（任务悬浮）
const onSelectElement = (element) => {
  selectTaskId.value = undefined
  dlgTitle.value = undefined

  if (!processNodeInfo || !processNodeInfo.finishedTaskSet) return

  if (!element || !processNodeInfo.finishedTaskSet.includes(element.id)) return

  selectTaskId.value = element.id
  dlgTitle.value = element.businessObject?.name

  // 过滤当前任务的审批记录
  taskCommentList.value = (props.allCommentList || []).filter(item => item.taskDefKey === selectTaskId.value)
  dialogVisible.value = true
}

// 导入 BPMN XML
const importXML = async (xml) => {
  clearViewer()

  if (!xml || xml.trim() === '') {
    isLoading.value = false
    return
  }

  try {
    // 创建 Viewer 实例
    bpmnViewer = new BpmnViewer({
      additionalModules: [MoveCanvasModule],
      container: processCanvas.value,
    })

    // 绑定点击事件
    bpmnViewer.on('element.click', ({ element }) => {
      onSelectElement(element)
    })

    isLoading.value = true

    // ✅ 先创建自定义箭头标记
    createCustomMarkers()

    // 再导入 XML
    await bpmnViewer.importXML(xml)

    // 设置流程状态（高亮节点）
    setProcessStatus(processNodeInfo)

  } catch (e) {
    console.error('BPMN XML 加载失败:', e)
    ElMessage.error('流程图加载失败，请检查 XML 格式是否正确')
    clearViewer()
  } finally {
    isLoading.value = false
  }
}

// 设置流程图元素状态（成功/失败/未完成等）
const setProcessStatus = (info) => {
  processNodeInfo = info

  if (!processNodeInfo || !bpmnViewer) return

  const { finishedTaskSet, rejectedTaskSet, unfinishedTaskSet, finishedSequenceFlowSet } = processNodeInfo
  const canvas = bpmnViewer.get('canvas')
  const elementRegistry = bpmnViewer.get('elementRegistry')

  // 标记已完成的连线
  if (Array.isArray(finishedSequenceFlowSet)) {
    finishedSequenceFlowSet.forEach(item => {
      if (item) {
        canvas.addMarker(item, 'success')
        const element = elementRegistry.get(item)
        const conditionExpression = element?.businessObject?.conditionExpression
        if (conditionExpression) {
          canvas.addMarker(item, 'condition-expression')
        }
      }
    })
  }

  // 标记已完成的任务
  if (Array.isArray(finishedTaskSet)) {
    finishedTaskSet.forEach(item => canvas.addMarker(item, 'success'))
  }

  // 标记未完成的任务
  if (Array.isArray(unfinishedTaskSet)) {
    unfinishedTaskSet.forEach(item => canvas.addMarker(item, 'primary'))
  }

  // 标记被拒绝的任务
  if (Array.isArray(rejectedTaskSet)) {
    rejectedTaskSet.forEach(item => {
      if (item) {
        const element = elementRegistry.get(item)
        if (element?.type.includes('Task')) {
          canvas.addMarker(item, 'danger')
        } else {
          canvas.addMarker(item, 'warning')
        }
      }
    })
  }
}

// 缩放操作
const processReZoom = () => {
  defaultZoom.value = 1
  bpmnViewer?.get('canvas').zoom('fit-viewport', 'auto')
}

const processZoomIn = (zoomStep = 0.1) => {
  const newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
  if (newZoom > 4) {
    throw new Error('[Process Viewer Warn]: The zoom ratio cannot be greater than 4')
  }
  defaultZoom.value = newZoom
  bpmnViewer?.get('canvas').zoom(defaultZoom.value)
}

const processZoomOut = (zoomStep = 0.1) => {
  const newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
  if (newZoom < 0.2) {
    throw new Error('[Process Viewer Warn]: The zoom ratio cannot be less than 0.2')
  }
  defaultZoom.value = newZoom
  bpmnViewer?.get('canvas').zoom(defaultZoom.value)
}

// 监听 xml 变化
watch(
  () => props.xml,
  (newXml) => {
    if (newXml) {
      importXML(newXml)
    }
  },
  { immediate: true }
)

// 监听 finishedInfo 变化
watch(
  () => props.finishedInfo,
  (newInfo) => {
    setProcessStatus(newInfo)
  },
  { immediate: true }
)

// 组件挂载后居中缩放（延时确保渲染完成）
onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      processReZoom()
    }, 10)
  })
})

// 组件销毁前清理
onBeforeUnmount(() => {
  clearViewer()
})
</script>

<style scoped>
.process-viewer {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.process-canvas {
  height: 100%;
}
.comment-dialog .el-dialog__body {
  max-height: 500px;
  overflow-y: auto;
}
.table-header-gray {
  background-color: #f5f5f5 !important;
}
</style>