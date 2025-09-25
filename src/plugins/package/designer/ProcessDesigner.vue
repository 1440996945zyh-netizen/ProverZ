<template>
	<div class="my-process-designer">
		<div class="my-process-designer__header">
			<slot name="control-header"></slot>
			<template v-if="!$slots['control-header']">
				<el-button-group key="file-control">
					<el-button :size="headerButtonSize" :type="headerButtonType" @click="onSave">
						<el-icon>
							<Edit />
						</el-icon>
						保存流程
					</el-button>
					<el-button :size="headerButtonSize" :type="headerButtonType" @click="refFile.click()">
						<el-icon>
							<FolderOpened />
						</el-icon>
						打开文件
					</el-button>
					<el-tooltip effect="light">
						<template #content>
							<el-button :size="headerButtonSize" type="text" @click="downloadProcessAsXml()">下载为XML文件</el-button>
							<br />
							<el-button :size="headerButtonSize" type="text" @click="downloadProcessAsSvg()">下载为SVG文件</el-button>
							<br />
							<el-button :size="headerButtonSize" type="text" @click="downloadProcessAsBpmn()">下载为BPMN文件</el-button>
						</template>
						<el-button :size="headerButtonSize" :type="headerButtonType">
							<el-icon>
								<Download />
							</el-icon>
							下载文件
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light">
						<template #content>
							<el-button :size="headerButtonSize" type="text" @click="previewProcessXML">预览XML</el-button>
							<br />
							<el-button :size="headerButtonSize" type="text" @click="previewProcessJson">预览JSON</el-button>
						</template>
						<el-button :size="headerButtonSize" :type="headerButtonType">
							<el-icon>
								<View />
							</el-icon>
							预览
						</el-button>
					</el-tooltip>
					<el-tooltip v-if="simulation" effect="light" :content="simulationStatus ? '退出模拟' : '开启模拟'">
						<el-button :size="headerButtonSize" :type="headerButtonType" @click="processSimulation">
							<el-icon>
								<ScaleToOriginal />
							</el-icon>
							模拟
						</el-button>
					</el-tooltip>
				</el-button-group>

				<el-button-group key="align-control">
					<el-tooltip effect="light" content="向左对齐">
						<el-button :size="headerButtonSize" class="align align-left" @click="elementsAlign('left')">
							<SvgIcon iconClass="align-left" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="向右对齐">
						<el-button :size="headerButtonSize" class="align align-right" @click="elementsAlign('right')">
							<SvgIcon iconClass="align-right" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="向上对齐">
						<el-button :size="headerButtonSize" class="align align-top" @click="elementsAlign('top')">
							<SvgIcon iconClass="align-top" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="向下对齐">
						<el-button :size="headerButtonSize" class="align align-bottom" @click="elementsAlign('bottom')">
							<SvgIcon iconClass="align-bottom" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="水平居中">
						<el-button :size="headerButtonSize" class="align align-center" @click="elementsAlign('center')">
							<SvgIcon iconClass="align-center" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="垂直居中">
						<el-button :size="headerButtonSize" class="align align-middle" @click="elementsAlign('middle')">
							<SvgIcon iconClass="align-middle" style="height: 15px; width: 15px" :isHover="true" />
						</el-button>
					</el-tooltip>
				</el-button-group>
				<el-button-group key="scale-control">
					<el-tooltip effect="light" content="缩小视图">
						<el-button :size="headerButtonSize" :disabled="defaultZoom < 0.2" @click="processZoomOut()">
							<el-icon>
								<ZoomOut />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-button :size="headerButtonSize">{{ Math.floor(defaultZoom * 10 * 10) + '%' }}</el-button>
					<el-tooltip effect="light" content="放大视图">
						<el-button :size="headerButtonSize" :disabled="defaultZoom > 4" @click="processZoomIn()">
							<el-icon>
								<ZoomIn />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="重置视图并居中">
						<el-button :size="headerButtonSize" @click="processReZoom()">
							<el-icon>
								<ScaleToOriginal />
							</el-icon>
						</el-button>
					</el-tooltip>
				</el-button-group>
				<el-button-group key="stack-control">
					<el-tooltip effect="light" content="撤销">
						<el-button :size="headerButtonSize" :disabled="!revocable" @click="processUndo()">
							<el-icon>
								<RefreshLeft />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="恢复">
						<el-button :size="headerButtonSize" :disabled="!recoverable" @click="processRedo()">
							<el-icon>
								<RefreshRight />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="重新绘制">
						<el-button :size="headerButtonSize" @click="processRestart">
							<el-icon>
								<Refresh />
							</el-icon>
						</el-button>
					</el-tooltip>
				</el-button-group>
			</template>
			<!-- 用于打开本地文件-->
			<input type="file" id="files" ref="refFile" style="display: none" accept=".xml, .bpmn" @change="importLocalFile" />
		</div>
		<!-- 设计器容器 -->
		<div class="my-process-designer__container">
			<div class="my-process-designer__canvas" ref="bpmnCanvas"></div>
		</div>
		<!-- 预览弹窗 -->
		<Dialog title="预览" width="80%" v-model:visible="previewModelVisible" :showFooter="false">
			<highlightjs :language="previewType" :code="previewResult" />
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineProps, getCurrentInstance, defineEmits } from 'vue'
import SvgIcon from '@/components/SvgIcon'
import Dialog from '@/components/Dialog/index.vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import DefaultEmptyXML from './plugins/defaultEmpty'
// 翻译方法
import customTranslate from './plugins/translate/customTranslate'
import translationsCN from './plugins/translate/zh'
// 模拟流转流程
import tokenSimulation from 'bpmn-js-token-simulation'
// 标签解析 Moddle
import camundaModdleDescriptor from './plugins/descriptor/camundaDescriptor.json'
import activitiModdleDescriptor from './plugins/descriptor/activitiDescriptor.json'
import flowableModdleDescriptor from './plugins/descriptor/flowableDescriptor.json'
// 标签解析 Extension
import camundaModdleExtension from './plugins/extension-moddle/camunda'
import activitiModdleExtension from './plugins/extension-moddle/activiti'
import flowableModdleExtension from './plugins/extension-moddle/flowable'
// 引入json转换与高亮
import X2JS from 'x2js'
// 引入Element Plus组件 + 图标组件（核心新增）
import { ElMessage, ElMessageBox } from 'element-plus'
import {
	Edit,
	FolderOpened,
	Download,
	View,
	ScaleToOriginal,
	ZoomOut,
	ZoomIn,
	Tickets,
	RefreshLeft,
	RefreshRight,
	Refresh,
} from '@element-plus/icons-vue'

// 获取全局实例
const { proxy } = getCurrentInstance()

// 定义事件
const emit = defineEmits(() => {
	// 基础事件
	const baseEvents = ['save', 'init-finished', 'destroy', 'commandStack-changed', 'input', 'change', 'canvas-viewbox-changed']

	// 从props获取动态事件
	const props = defineProps({
		events: {
			type: Array,
			default: () => ['element.click'],
		},
	})

	// 动态事件（从props转换）
	const dynamicEvents = props.events.map(event => event.replace(/\./g, '-'))
	return [...baseEvents, ...dynamicEvents]
})

// 定义Props
const props = defineProps({
	value: String, // xml 字符串
	processId: String,
	processName: String,
	translations: Object, // 自定义的翻译文件
	options: {
		type: Object,
		default: () => ({}),
	}, // 自定义的翻译文件
	additionalModel: [Object, Array], // 自定义model
	moddleExtension: Object, // 自定义moddle
	onlyCustomizeAddi: {
		type: Boolean,
		default: false,
	},
	onlyCustomizeModdle: {
		type: Boolean,
		default: false,
	},
	simulation: {
		type: Boolean,
		default: false,
	},
	keyboard: {
		type: Boolean,
		default: true,
	},
	prefix: {
		type: String,
		default: 'flowable',
	},
	events: {
		type: Array,
		default: () => ['element.click'],
	},
	headerButtonSize: {
		type: String,
		default: 'default',
		validator: value => ['default', 'large', 'small'].includes(value),
	},
	headerButtonType: {
		type: String,
		default: 'primary',
		validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value),
	},
})

// 响应式变量
const defaultZoom = ref(1)
const previewModelVisible = ref(false)
const simulationStatus = ref(false)
const previewResult = ref('')
const previewType = ref('xml')
const recoverable = ref(false)
const revocable = ref(false)
const bpmnModeler = ref(null)
const refFile = ref(null)
const bpmnCanvas = ref(null)

// 计算属性
const additionalModules = computed(() => {
	const Modules = []
	// 仅保留用户自定义扩展模块
	if (props.onlyCustomizeAddi) {
		if (Array.isArray(props.additionalModel)) {
			return props.additionalModel || []
		}
		return [props.additionalModel]
	}

	// 插入用户自定义扩展模块
	if (Array.isArray(props.additionalModel)) {
		Modules.push(...props.additionalModel)
	} else if (props.additionalModel) {
		Modules.push(props.additionalModel)
	}

	// 翻译模块
	const TranslateModule = {
		translate: ['value', customTranslate(props.translations || translationsCN)],
	}
	Modules.push(TranslateModule)

	// 模拟流转模块
	if (props.simulation) {
		Modules.push(tokenSimulation)
	}

	// 根据需要的流程类型设置扩展元素构建模块
	if (props.prefix === 'camunda') {
		Modules.push(camundaModdleExtension)
	}
	if (props.prefix === 'flowable') {
		Modules.push(flowableModdleExtension)
	}
	if (props.prefix === 'activiti') {
		Modules.push(activitiModdleExtension)
	}

	return Modules
})

const moddleExtensions = computed(() => {
	const Extensions = {}
	// 仅使用用户自定义模块
	if (props.onlyCustomizeModdle) {
		return props.moddleExtension || null
	}

	// 插入用户自定义模块
	if (props.moddleExtension) {
		for (let key in props.moddleExtension) {
			Extensions[key] = props.moddleExtension[key]
		}
	}

	// 根据需要的 "流程类型" 设置 对应的解析文件
	if (props.prefix === 'activiti') {
		Extensions.activiti = activitiModdleDescriptor
	}
	if (props.prefix === 'flowable') {
		Extensions.flowable = flowableModdleDescriptor
	}
	if (props.prefix === 'camunda') {
		Extensions.camunda = camundaModdleDescriptor
	}

	return Extensions
})

// 初始化BPMN模型器
function initBpmnModeler() {
	if (bpmnModeler.value) return
	bpmnModeler.value = new BpmnModeler({
		container: bpmnCanvas.value,
		// 修复键盘配置错误 - 新版本bpmn-js已移除显式绑定
		keyboard: props.keyboard,
		additionalModules: additionalModules.value,
		moddleExtensions: moddleExtensions.value,
		...props.options,
	})
	emit('init-finished', bpmnModeler.value)
	initModelListeners()
}

// 初始化模型监听器
function initModelListeners() {
	const EventBus = bpmnModeler.value.get('eventBus')

	// 注册需要的监听事件, 将. 替换为 - , 避免解析异常
	props.events.forEach(event => {
		EventBus.on(event, function (eventObj) {
			let eventName = event.replace(/\./g, '-')
			let element = eventObj ? eventObj.element : null
			emit(eventName, element, eventObj)
		})
	})

	// 监听图形改变返回xml
	EventBus.on('commandStack.changed', async event => {
		try {
			recoverable.value = bpmnModeler.value.get('commandStack').canRedo()
			revocable.value = bpmnModeler.value.get('commandStack').canUndo()
			let { xml } = await bpmnModeler.value.saveXML({ format: true })
			emit('commandStack-changed', event)
			emit('input', xml)
			emit('change', xml)
		} catch (e) {
			console.error(`[Process Designer Warn]: ${e.message || e}`)
		}
	})

	// 监听视图缩放变化
	bpmnModeler.value.on('canvas.viewbox.changed', ({ viewbox }) => {
		emit('canvas-viewbox-changed', { viewbox })
		const { scale } = viewbox
		defaultZoom.value = Math.floor(scale * 100) / 100
	})
}

/* 创建新的流程图 */
async function createNewDiagram(xml) {
	// 将字符串转换成图显示出来
	let newId = props.processId || `Flow_${new Date().getTime()}`
	let newName = props.processName || `流程_${new Date().getTime()}`
	let xmlString = xml || DefaultEmptyXML(newId, newName, props.prefix)
	try {
		let { warnings } = await bpmnModeler.value.importXML(xmlString)
		if (warnings && warnings.length) {
			warnings.forEach(warn => console.warn(warn))
		}
	} catch (e) {
		console.error(`[Process Designer Warn]: ${e?.message || e}`)
	}
}

// 保存流程
async function onSave() {
	const process = getProcess()
	const xml = await saveXML()
	const svg = await saveImg()
	const result = { process, xml, svg }
	emit('save', result)
}

// 获取流程信息
function getProcess() {
	const element = getProcessElement()
	return {
		id: element.id,
		name: element.name,
		category: element.$attrs['flowable:processCategory'],
	}
}

// 获取流程元素
function getProcessElement() {
	const rootElements = bpmnModeler.value.getDefinitions().rootElements
	for (let i = 0; i < rootElements.length; i++) {
		if (rootElements[i].$type === 'bpmn:Process') return rootElements[i]
	}
}

// 保存XML
async function saveXML(download = false) {
	try {
		const { xml } = await bpmnModeler.value.saveXML({ format: true })
		if (download) {
			downloadFile(`${getProcessElement().name}.bpmn20.xml`, xml, 'application/xml')
		}
		return xml
	} catch (err) {
		console.log(err)
	}
}

// 保存图片
async function saveImg(type = 'svg', download = false) {
	try {
		const { svg } = await bpmnModeler.value.saveSVG({ format: true })
		if (download) {
			downloadFile(getProcessElement().name, svg, 'image/svg+xml')
		}
		return svg
	} catch (err) {
		console.log(err)
	}
}

// 下载文件
function downloadFile(filename, data, type) {
	var a = document.createElement('a')
	var url = window.URL.createObjectURL(new Blob([data], { type: type }))
	a.href = url
	a.download = filename
	a.click()
	window.URL.revokeObjectURL(url)
}

// 下载流程图到本地
async function downloadProcess(type, name) {
	try {
		// 按需要类型创建文件并下载
		if (type === 'xml' || type === 'bpmn') {
			const { err, xml } = await bpmnModeler.value.saveXML()
			// 读取异常时抛出异常
			if (err) {
				console.error(`[Process Designer Warn ]: ${err.message || err}`)
			}
			let { href, filename } = setEncoded(type.toUpperCase(), name, xml)
			downloadFunc(href, filename)
		} else {
			const { err, svg } = await bpmnModeler.value.saveSVG()
			// 读取异常时抛出异常
			if (err) {
				return console.error(err)
			}
			let { href, filename } = setEncoded('SVG', name, svg)
			downloadFunc(href, filename)
		}
	} catch (e) {
		console.error(`[Process Designer Warn ]: ${e.message || e}`)
	}

	// 文件下载方法
	function downloadFunc(href, filename) {
		if (href && filename) {
			let a = document.createElement('a')
			a.download = filename //指定下载的文件名
			a.href = href //  URL对象
			a.click() // 模拟点击
			URL.revokeObjectURL(a.href) // 释放URL 对象
		}
	}
}

// 根据所需类型进行转码并返回下载地址
function setEncoded(type, filename = 'diagram', data) {
	const encodedData = encodeURIComponent(data)
	return {
		filename: `${filename}.${type}`,
		href: `data:application/${type === 'svg' ? 'text/xml' : 'bpmn20-xml'};charset=UTF-8,${encodedData}`,
		data: data,
	}
}

// 加载本地文件
function importLocalFile() {
	const file = refFile.value.files[0]
	const reader = new FileReader()
	reader.readAsText(file)
	reader.onload = function () {
		let xmlStr = this.result
		createNewDiagram(xmlStr)
	}
}

// 下载为XML
function downloadProcessAsXml() {
	downloadProcess('xml')
}

// 下载为BPMN
function downloadProcessAsBpmn() {
	downloadProcess('bpmn')
}

// 下载为SVG
function downloadProcessAsSvg() {
	downloadProcess('svg')
}

// 流程模拟
function processSimulation() {
	simulationStatus.value = !simulationStatus.value
	if (props.simulation) {
		bpmnModeler.value.get('toggleMode').toggleMode()
	}
}

// 重做
function processRedo() {
	bpmnModeler.value.get('commandStack').redo()
}

// 撤销
function processUndo() {
	bpmnModeler.value.get('commandStack').undo()
}

// 放大
function processZoomIn(zoomStep = 0.1) {
	let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
	if (newZoom > 4) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
	}
	defaultZoom.value = newZoom
	bpmnModeler.value.get('canvas').zoom(defaultZoom.value)
}

// 缩小
function processZoomOut(zoomStep = 0.1) {
	let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
	if (newZoom < 0.2) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
	}
	defaultZoom.value = newZoom
	bpmnModeler.value.get('canvas').zoom(defaultZoom.value)
}

// 缩放至指定比例
function processZoomTo(newZoom = 1) {
	if (newZoom < 0.2) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
	}
	if (newZoom > 4) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
	}
	defaultZoom.value = newZoom
	bpmnModeler.value.get('canvas').zoom(newZoom)
}

// 重置缩放
function processReZoom() {
	defaultZoom.value = 1
	bpmnModeler.value.get('canvas').zoom('fit-viewport', 'auto')
}

// 重新开始
function processRestart() {
	recoverable.value = false
	revocable.value = false
	createNewDiagram(null)
}

// 元素对齐
function elementsAlign(align) {
	const Align = bpmnModeler.value.get('alignElements')
	const Selection = bpmnModeler.value.get('selection')
	const SelectedElements = Selection.get()
	if (!SelectedElements || SelectedElements.length <= 1) {
		ElMessage.warning('请按住 Ctrl 键选择多个元素对齐')
		return
	}

	ElMessageBox.confirm('自动对齐可能造成图形变形，是否继续？', '警告', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		Align.trigger(SelectedElements, align)
	})
}

// 预览XML
function previewProcessXML() {
	bpmnModeler.value.saveXML({ format: true }).then(({ xml }) => {
		console.log('预览XML数据：', xml) // 关键日志，确认是否有XML字符串
		previewResult.value = xml
		previewType.value = 'xml'
		previewModelVisible.value = true
	})
}

// 预览JSON
function previewProcessJson() {
	const newConvert = new X2JS()
	bpmnModeler.value.saveXML({ format: true }).then(({ xml }) => {
		console.log('预览XML数据：', xml) // 关键日志，确认是否有XML字符串
		const { definitions } = newConvert.xml2js(xml)
		if (definitions) {
			previewResult.value = JSON.stringify(definitions, null, 4)
		} else {
			previewResult.value = ''
		}

		previewType.value = 'json'
		previewModelVisible.value = true
	})
}

// 生命周期钩子
onMounted(() => {
	initBpmnModeler()
	createNewDiagram(props.value)
})

onBeforeUnmount(() => {
	if (bpmnModeler.value) {
		bpmnModeler.value.destroy()
	}
	emit('destroy', bpmnModeler.value)
	bpmnModeler.value = null
})

// 暴露方法给父组件
defineExpose({
	onSave,
	saveXML,
	saveImg,
	processZoomIn,
	processZoomOut,
	processReZoom,
	processUndo,
	processRedo,
	processSimulation,
	processRestart,
})
</script>