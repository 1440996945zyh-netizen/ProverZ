<template>
	<div class="process-viewer">
		<div class="process-canvas" style="height: 100%" ref="processCanvas" v-show="!isLoading" />
		<!-- 已完成节点悬浮弹窗 -->
		<Dialog class="comment-dialog" :title="dlgTitle || '审批记录'" v-model:visible="dialogVisible">
			<el-row>
				<el-table
					:data="taskCommentList"
					size="mini"
					border
					header-cell-class-name="table-header-gray"
					:row-config="{ isCurrent: true }"
				>
					<el-table-column label="序号" header-align="center" align="center" type="index" width="55px" />
					<el-table-column label="候选办理" prop="candidate" width="150px" align="center" />
					<el-table-column label="实际办理" prop="assigneeName" width="100px" align="center" />
					<el-table-column label="处理时间" prop="createTime" width="140px" align="center" />
					<el-table-column label="办结时间" prop="finishTime" width="140px" align="center" />
					<el-table-column label="耗时" prop="duration" width="100px" align="center" />
					<el-table-column label="审批意见" align="center">
						<template #default="scope">
							{{ scope.row.commentList?.[0]?.fullMessage || '' }}
						</template>
					</el-table-column>
				</el-table>
			</el-row>
		</Dialog>
		<div style="position: absolute; top: 0px; left: 0px; width: 100%">
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
					<el-button size="medium" type="default" style="width: 90px">
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
					<el-button size="medium" type="default" icon="ScaleToOriginal" @click="processReZoom()" />
					<slot />
				</el-button-group>
			</el-row>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import '@/plugins/package/theme/index.scss'
import BpmnViewer from 'bpmn-js/lib/Viewer'
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'
import { ZoomIn, ZoomOut, ScaleToOriginal } from '@element-plus/icons-vue'
import 'bpmn-js/dist/assets/diagram-js.css' // 核心绘图样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css' // BPMN 字体样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css' // 特殊符号样式
import '@/plugins/package/theme/index.scss' // 保留你的自定义主题
import Dialog from '@/components/Dialog/index.vue'
// 定义Props
const props = defineProps({
	xml: {
		type: String,
	},
	finishedInfo: {
		type: Object,
	},
	// 所有节点审批记录
	allCommentList: {
		type: Array,
	},
})

// 响应式数据
const processCanvas = ref(null)
const customSuccessDefs = ref(null)
const customFailDefs = ref(null)
const dialogVisible = ref(false)
const dlgTitle = ref(undefined)
const defaultZoom = ref(1)
const isLoading = ref(false)
const bpmnViewer = ref(undefined)
const processNodeInfo = ref(undefined)
const selectTaskId = ref(undefined)
const taskCommentList = ref([])
const hoverTimer = ref(null)

// 方法定义
const processReZoom = () => {
	defaultZoom.value = 1
	bpmnViewer.value?.get('canvas').zoom('fit-viewport', 'auto')
}

const processZoomIn = (zoomStep = 0.1) => {
	let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
	if (newZoom > 4) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
	}
	defaultZoom.value = newZoom
	bpmnViewer.value?.get('canvas').zoom(defaultZoom.value)
}

const processZoomOut = (zoomStep = 0.1) => {
	let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
	if (newZoom < 0.2) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
	}
	defaultZoom.value = newZoom
	bpmnViewer.value?.get('canvas').zoom(defaultZoom.value)
}

const getOperationTagType = type => {
	return 'success'
	// 原注释代码可按需恢复
	// switch (type) {
	//   case this.SysFlowTaskOperationType.AGREE:
	//   case this.SysFlowTaskOperationType.MULTI_AGREE:
	//     return 'success';
	//   case this.SysFlowTaskOperationType.REFUSE:
	//   case this.SysFlowTaskOperationType.PARALLEL_REFUSE:
	//   case this.SysFlowTaskOperationType.MULTI_REFUSE:
	//     return 'warning';
	//   case this.SysFlowTaskOperationType.STOP:
	//     return 'danger'
	//   default:
	//     return 'primary';
	// }
}

// 流程图预览清空
const clearViewer = () => {
	if (processCanvas.value) {
		processCanvas.value.innerHTML = ''
	}
	if (bpmnViewer.value) {
		bpmnViewer.value.destroy()
	}
	bpmnViewer.value = null
}

// 添加自定义箭头
const addCustomDefs = () => {
	const canvas = bpmnViewer.value?.get('canvas')
	const svg = canvas?._svg

	if (!svg) return

	// 检查是否已添加，避免重复
	if (svg.querySelector('#sequenceflow-end-white-success')) return

	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

	// 成功箭头
	const successArrow = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
	successArrow.setAttribute('id', 'sequenceflow-end-white-success')
	successArrow.setAttribute('viewBox', '0 0 20 20')
	successArrow.setAttribute('refX', '11')
	successArrow.setAttribute('refY', '10')
	successArrow.setAttribute('markerWidth', '10')
	successArrow.setAttribute('markerHeight', '10')
	successArrow.setAttribute('orient', 'auto')
	const successPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	successPath.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
	successPath.setAttribute('class', 'success-arrow')
	successPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
	successArrow.appendChild(successPath)
	defs.appendChild(successArrow)

	// 失败箭头（类似添加）
	const failArrow = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
	failArrow.setAttribute('id', 'sequenceflow-end-white-fail')
	failArrow.setAttribute('viewBox', '0 0 20 20')
	failArrow.setAttribute('refX', '11')
	failArrow.setAttribute('refY', '10')
	failArrow.setAttribute('markerWidth', '10')
	failArrow.setAttribute('markerHeight', '10')
	failArrow.setAttribute('orient', 'auto')
	const failPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	failPath.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
	failPath.setAttribute('class', 'fail-arrow')
	failPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
	failArrow.appendChild(failPath)
	defs.appendChild(failArrow)

	// 插入 defs
	svg.insertBefore(defs, svg.firstChild)
}

// 任务点击弹窗
const onSelectElement = element => {
  console.log('element =>', element);
	selectTaskId.value = undefined
	dlgTitle.value = undefined

	if (!processNodeInfo.value || !processNodeInfo.value.finishedTaskSet) return

	if (!element || processNodeInfo.value.finishedTaskSet.indexOf(element.id) === -1) {
		return
	}

	selectTaskId.value = element.id
	dlgTitle.value = element.businessObject ? element.businessObject.name : undefined
	// 计算当前点击任务审批记录，如果记录为空不显示弹窗
	taskCommentList.value = (props.allCommentList || []).filter(item => {
		return item.taskDefKey === selectTaskId.value
	})
	dialogVisible.value = taskCommentList.value.length > 0
}

// 显示流程图
const importXML = async xml => {
	clearViewer()

	if (!xml || xml.trim() === '') {
		isLoading.value = false
		return
	}

	try {
		// 创建 Viewer 实例，并赋值给 bpmnViewer.value
		bpmnViewer.value = new BpmnViewer({
			additionalModules: [MoveCanvasModule],
			container: processCanvas.value,
		})

		// 绑定点击事件
		bpmnViewer.value.on('element.click', ({ element }) => {
			onSelectElement(element)
		})

		isLoading.value = true

		// 导入 XML
		const result = await bpmnViewer.value.importXML(xml)
		if (result.warnings.length > 0) {
			console.warn('BPMN XML 存在警告:', result.warnings)
		}

		// 添加自定义箭头标记
		setTimeout(() => {
			addCustomDefs() // 注意：原函数名为 createCustomMarkers，但实际应为 addCustomDefs
			processReZoom()
		}, 100)
	} catch (e) {
		console.error('BPMN 渲染失败:', e)
		ElMessage.error('流程图加载失败: ' + e.message)
	} finally {
		isLoading.value = false
	}
}

// 设置流程图元素状态
const setProcessStatus = processNodeInfoVal => {
	processNodeInfo.value = processNodeInfoVal
	if (isLoading.value || !processNodeInfo.value || !bpmnViewer.value) return

	const { finishedTaskSet, rejectedTaskSet, unfinishedTaskSet, finishedSequenceFlowSet } = processNodeInfo.value
	const canvas = bpmnViewer.value.get('canvas')
	const elementRegistry = bpmnViewer.value.get('elementRegistry')

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

	if (Array.isArray(finishedTaskSet)) {
		finishedTaskSet.forEach(item => canvas.addMarker(item, 'success'))
	}

	if (Array.isArray(unfinishedTaskSet)) {
		unfinishedTaskSet.forEach(item => canvas.addMarker(item, 'primary'))
	}

	if (Array.isArray(rejectedTaskSet)) {
		rejectedTaskSet.forEach(item => {
			if (item) {
				const element = elementRegistry.get(item)
				if (element?.type?.includes('Task')) {
					canvas.addMarker(item, 'danger')
				} else {
					canvas.addMarker(item, 'warning')
				}
			}
		})
	}
}

// 生命周期钩子
onMounted(() => {
	// 初始化流程图
	nextTick(async () => {
		await importXML(props.xml)
		setProcessStatus(props.finishedInfo)
		// 延时居中操作
		setTimeout(() => {
			processReZoom()
		}, 10)
	})
})

onUnmounted(() => {
	clearViewer()
})

// 监听Props变化
watch(
	() => props.xml,
	newXml => {
		importXML(newXml)
	},
	{ immediate: true }
)

watch(
	() => props.finishedInfo,
	newInfo => {
		setProcessStatus(newInfo)
	},
	{ immediate: true }
)
</script>

<style scoped>
</style>