<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:06:46
 * @LastEditTime: 2026-02-04 09:36:19
 * @LastEditors: zhangsd
 * @Description: 流程设计器
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\designer\ProcessDesigner.vue
-->
<template>
	<div class="my-process-designer">
		<div class="my-process-designer__header" style="z-index: 999; display: table-row-group">
			<slot name="control-header"></slot>
			<!-- 操作按钮 -->
			<template v-if="!$slots['control-header']">
				<el-button-group key="file-control">
					<el-button icon="FolderOpened" @click="refFile.click()">打开文件</el-button>
					<el-tooltip effect="light" placement="bottom">
						<template #content>
							<div style="color: #409eff">
								<el-button :size="headerButtonSize" type="primary" link @click="downloadProcessAsXml()">
									下载为XML文件
								</el-button>
								<br />
								<el-button :size="headerButtonSize" type="primary" link @click="downloadProcessAsSvg()">
									下载为SVG文件
								</el-button>
								<br />
								<el-button :size="headerButtonSize" type="primary" link @click="downloadProcessAsBpmn()">
									下载为BPMN文件
								</el-button>
							</div>
						</template>
						<el-button icon="Download" title="下载文件">下载文件</el-button>
					</el-tooltip>
					<el-tooltip effect="light">
						<el-button icon="View" title="浏览">浏览</el-button>
						<template #content>
							<el-button :size="headerButtonSize" type="primary" link @click="previewProcessXML">预览XML</el-button>
							<br />
							<el-button :size="headerButtonSize" type="primary" link @click="previewProcessJson">预览JSON</el-button>
						</template>
					</el-tooltip>
					<el-tooltip v-if="props.simulation" effect="light" :content="simulationStatus ? '退出模拟' : '开启模拟'">
						<el-button icon="Cpu" title="模拟" @click="processSimulation">模拟</el-button>
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
						<el-button icon="ZoomOut" @click="processZoomOut()" :disabled="defaultZoom < 0.2"></el-button>
					</el-tooltip>
					<el-button>{{ Math.floor(defaultZoom * 10 * 10) + '%' }}</el-button>
					<el-tooltip effect="light" content="放大视图">
						<el-button icon="ZoomIn" @click="processZoomIn()" :disabled="defaultZoom > 4"></el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="重置视图并居中">
						<el-button icon="ScaleToOriginal" @click="processReZoom()"></el-button>
					</el-tooltip>
				</el-button-group>

				<el-button-group key="stack-control">
					<el-tooltip effect="light" content="撤销">
						<el-button icon="RefreshLeft" @click="processUndo()" :disabled="!revocable"></el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="恢复">
						<el-button icon="RefreshRight" @click="processRedo()" :disabled="!recoverable"></el-button>
					</el-tooltip>
					<el-tooltip effect="light" content="重新绘制">
						<el-button icon="Refresh" @click="processRestart()"></el-button>
					</el-tooltip>
				</el-button-group>
			</template>

			<!-- 用于打开本地文件 -->
			<input type="file" id="files" ref="refFile" style="display: none" accept=".xml, .bpmn" @change="importLocalFile" />
		</div>
		<!-- 流程设计器容器 -->
		<div class="my-process-designer__container">
			<div class="my-process-designer__canvas" ref="bpmnCanvas" id="bpmnCanvas"></div>
		</div>
		<!-- 预览弹窗 -->
		<Dialog title="预览" v-model:visible="previewModelVisible" width="80%" :showFooter="false">
			<!-- <div>
				<pre><code v-dompurify-html="highlightedCode(previewResult)" class="hljs"></code></pre>
			</div> -->
			<Highlightjs :language="previewType" :code="previewResult" />
		</Dialog>
	</div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed, provide,  defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SvgIcon from '@/components/SvgIcon'
import Dialog from '@/components/Dialog'
// 引入高亮组件（关键）
import Highlightjs from '@/components/Highlight'
// BPMN核心依赖
import BpmnModeler from 'bpmn-js/lib/Modeler'
import DefaultEmptyXML from '@/components/bpmnProcessDesigner/package/designer/plugins/defaultEmpty'
// 翻译相关
import createCustomTranslate from '@/components/bpmnProcessDesigner/package/designer/plugins/translate/customTranslate'
import translationsCN from '@/components/bpmnProcessDesigner/package/designer/plugins/translate/zh'
// 流程模拟
import tokenSimulation from 'bpmn-js-token-simulation'
// 流程解析器
import camundaModdleDescriptor from '@/components/bpmnProcessDesigner/package/designer/plugins/descriptor/camundaDescriptor.json'
import activitiModdleDescriptor from '@/components/bpmnProcessDesigner/package/designer/plugins/descriptor/activitiDescriptor.json'
import flowableModdleDescriptor from '@/components/bpmnProcessDesigner/package/designer/plugins/descriptor/flowableDescriptor.json'
// 流程扩展
import camundaModdleExtension from '@/components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/camunda'
import activitiModdleExtension from '@/components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/activiti'
import flowableModdleExtension from '@/components/bpmnProcessDesigner/package/designer/plugins/extension-moddle/flowable'
// XML转JSON
import X2JS from 'x2js'

// 组件名称定义
defineOptions({ name: 'MyProcessDesigner' })

// 定义Ref
const bpmnCanvas = ref(null)
const refFile = ref(null)

// 定义事件
const emit = defineEmits([
	'destroy',
	'init-finished',
	'save',
	'commandStack-changed',
	'input',
	'change',
	'canvas-viewbox-changed',
	'element-click',
])

// 定义Props
const props = defineProps({
	/**
	 * 流程 XML 字符串
	 */
	value: String, // xml 字符串
	/**
	 * 流程 key 标识
	 */
	processId: String, // 流程 key 标识
	/**
	 * 流程 name 名字
	 */
	processName: String, // 流程 name 名字
	/**
	 * 流程 form 表单编号
	 */
	formId: Number, // 流程 form 表单编号
	/**
	 * 自定义翻译
	 */
	translations: {
		type: Object,
		default: () => ({}),
	},
	/**
	 * 自定义选项
	 */
	options: {
		type: Object,
		default: () => ({}),
	},
	/**
	 * 自定义添加模型
	 */
	additionalModel: [Object, Array], // 自定义model
	/**
	 * 自定义mmdle扩展
	 */
	moddleExtension: {
		type: Object,
		default: () => ({}),
	},
	/**
	 * 是否仅自定义添加模型
	 */
	onlyCustomizeAddi: {
		type: Boolean,
		default: false,
	},
	/**
	 * 是否仅自定义mmdle扩展
	 */
	onlyCustomizeModdle: {
		type: Boolean,
		default: false,
	},
	/**
	 * 是否启用流程模拟
	 */
	simulation: {
		type: Boolean,
		default: true,
	},
	/**
	 * 是否启用键盘操作
	 */
	keyboard: {
		type: Boolean,
		default: true,
	},
	/**
	 * 前缀
	 */
	prefix: {
		type: String,
		default: 'camunda',
	},
	/**
	 * 事件列表
	 */
	events: {
		type: Array,
		default: () => ['element.click'],
	},
	/**
	 * 头部按钮大小
	 */
	headerButtonSize: {
		type: String,
		default: 'small',
		validator: value => ['default', 'medium', 'small', 'mini'].indexOf(value) !== -1,
	},
	/**
	 * 头部按钮类型
	 */
	headerButtonType: {
		type: String,
		default: 'primary',
		validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info'].indexOf(value) !== -1,
	},
})

/**
 * 代码高亮处理
 */
const highlightedCode = code => {
	if (previewType.value === 'json') {
		code = JSON.stringify(code, null, 2)
	}
	const result = hljs.highlight(code, { language: previewType.value, ignoreIllegals: true })
	return result.value || '&nbsp;'
}

// 提供全局配置
provide('configGlobal', props)

// 核心变量定义
let bpmnModeler = null
const defaultZoom = ref(1)
const previewModelVisible = ref(false)
const simulationStatus = ref(false)
const previewResult = ref('')
const previewType = ref('xml')
const recoverable = ref(false)
const revocable = ref(false)

/**
 * 计算属性：额外模块
 */
const additionalModules = computed(() => {
	const Modules = []
	// 仅保留用户自定义扩展模块
	if (props.onlyCustomizeAddi) {
		if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
			return props.additionalModel || []
		}
		return [props.additionalModel]
	}

	// 插入用户自定义扩展模块
	if (Object.prototype.toString.call(props.additionalModel) == '[object Array]') {
		Modules.push(...props.additionalModel)
	} else {
		props.additionalModel && Modules.push(props.additionalModel)
	}

	// 翻译模块
	const TranslateModule = {
		translate: ['value', createCustomTranslate(props.translations || translationsCN)],
	}
	Modules.push(TranslateModule)

	// 模拟流转模块
	if (props.simulation) {
		Modules.push(tokenSimulation)
	}

	// 根据流程类型设置扩展元素构建模块
	console.log(props.prefix, 'props.prefix ')
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

/**
 * 计算属性：解析扩展
 */
const moddleExtensions = computed(() => {
	console.log(props.onlyCustomizeModdle, 'props.onlyCustomizeModdle')
	console.log(props.moddleExtension, 'props.moddleExtension')
	console.log(props.prefix, 'props.prefix')
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

	// 根据流程类型设置解析文件
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

console.log(additionalModules, 'additionalModules()')
console.log(moddleExtensions, 'moddleExtensions()')

/**
 * 初始化BPMN设计器
 */
const initBpmnModeler = () => {
	if (bpmnModeler) return
	const data = document.getElementById('bpmnCanvas')
	console.log(data, 'data')
	console.log(props.keyboard, 'props.keyboard')
	console.log(additionalModules, 'additionalModules()')
	console.log(moddleExtensions, 'moddleExtensions()')

	bpmnModeler = new BpmnModeler({
		container: data,
		keyboard: props.keyboard ? { bindTo: document } : null,
		additionalModules: additionalModules.value,
		moddleExtensions: moddleExtensions.value,
		...props.options,
	})

	emit('init-finished', bpmnModeler)
	initModelListeners()
}

/**
 * 初始化模型监听
 */
const initModelListeners = () => {
	const EventBus = bpmnModeler.get('eventBus')
	console.log(EventBus, 'EventBus')
	// 注册监听事件
	props.events.forEach(event => {
		EventBus.on(event, function (eventObj) {
			const eventName = event.replace(/\./g, '-')
			const element = eventObj ? eventObj.element : null
			console.log(eventName, 'eventName')
			console.log(element, 'element')
			emit('element-click', element, eventObj)
		})
	})

	// 监听图形改变返回xml
	EventBus.on('commandStack.changed', async event => {
		try {
			recoverable.value = bpmnModeler.get('commandStack').canRedo()
			revocable.value = bpmnModeler.get('commandStack').canUndo()
			const { xml } = await bpmnModeler.saveXML({ format: true })
			emit('commandStack-changed', event)
			emit('input', xml)
			emit('change', xml)
			emit('save', xml)
		} catch (e) {
			console.error(`[Process Designer Warn]: ${e.message || e}`)
		}
	})

	// 监听视图缩放变化
	bpmnModeler.on('canvas.viewbox.changed', ({ viewbox }) => {
		emit('canvas-viewbox-changed', { viewbox })
		const { scale } = viewbox
		defaultZoom.value = Math.floor(scale * 100) / 100
	})
}

/**
 * 创建新流程图
 */
const createNewDiagram = async xml => {
	console.log(xml, 'xml')
	const newId = props.processId || `Process_${new Date().getTime()}`
	const newName = props.processName || `业务流程_${new Date().getTime()}`
	const xmlString = xml || DefaultEmptyXML(newId, newName, props.prefix)
	try {
		const { warnings } = await bpmnModeler.importXML(xmlString)
		console.log(warnings, 'warnings')
		if (warnings && warnings.length) {
			warnings.forEach(warn => console.warn(warn))
		}
	} catch (e) {
		console.error(`[Process Designer Warn]: ${e.message || e}`)
	}
}

/**
 * 下载流程图
 */
const downloadProcess = async type => {
	try {
		// 按需要类型创建文件并下载
		if (type === 'xml' || type === 'bpmn') {
			const { err, xml } = await bpmnModeler.saveXML()
			// 读取异常时抛出异常
			if (err) {
				console.error(`[Process Designer Warn ]: ${err.message || err}`)
			}
			const { href, filename } = setEncoded(type.toUpperCase(), xml)
			downloadFunc(href, filename)
		} else {
			const { err, svg } = await bpmnModeler.saveSVG()
			// 读取异常时抛出异常
			if (err) {
				return console.error(err)
			}
			const { href, filename } = setEncoded('SVG', svg)
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

/**
 * 转码并返回下载地址
 */
const setEncoded = (type, data) => {
	const filename = 'diagram'
	const encodedData = encodeURIComponent(data)
	return {
		filename: `${filename}.${type.toLowerCase()}`,
		href: `data:application/${type === 'svg' ? 'text/xml' : 'bpmn20-xml'};charset=UTF-8,${encodedData}`,
		data: data,
	}
}

/**
 * 加载本地文件
 */
const importLocalFile = () => {
	const file = refFile.value.files[0]
	const reader = new FileReader()
	reader.readAsText(file)
	reader.onload = function () {
		const xmlStr = this.result
		createNewDiagram(xmlStr)
		emit('save', xmlStr)
	}
}

// 下载方法封装
const downloadProcessAsXml = () => downloadProcess('xml')
const downloadProcessAsBpmn = () => downloadProcess('bpmn')
const downloadProcessAsSvg = () => downloadProcess('svg')

/**
 * 流程模拟
 */
const processSimulation = () => {
	simulationStatus.value = !simulationStatus.value
	console.log(bpmnModeler.get('toggleMode'), "bpmnModeler.get('toggleMode')")
	props.simulation && bpmnModeler.get('toggleMode').toggleMode()
}

/**
 * 撤销
 */
const processRedo = () => {
	bpmnModeler.get('commandStack').redo()
}

/**
 * 恢复
 */
const processUndo = () => {
	bpmnModeler.get('commandStack').undo()
}

/**
 * 放大视图
 */
const processZoomIn = (zoomStep = 0.1) => {
	let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
	if (newZoom > 4) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
	}
	defaultZoom.value = newZoom
	bpmnModeler.get('canvas').zoom(defaultZoom.value)
}

/**
 * 缩小视图
 */
const processZoomOut = (zoomStep = 0.1) => {
	let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
	if (newZoom < 0.2) {
		throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
	}
	defaultZoom.value = newZoom
	bpmnModeler.get('canvas').zoom(defaultZoom.value)
}

/**
 * 重置视图
 */
const processReZoom = () => {
	defaultZoom.value = 1
	bpmnModeler.get('canvas').zoom('fit-viewport', 'auto')
}

/**
 * 重新绘制
 */
const processRestart = () => {
	recoverable.value = false
	revocable.value = false
	createNewDiagram(null)
}

/**
 * 元素对齐
 */
const elementsAlign = align => {
	const Align = bpmnModeler.get('alignElements')
	const Selection = bpmnModeler.get('selection')
	const SelectedElements = Selection.get()
	if (!SelectedElements || SelectedElements.length <= 1) {
		ElMessage.warning('请按住 Shift 键选择多个元素对齐')
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

/**
 * 预览XML
 */
const previewProcessXML = () => {
	// console.log(bpmnModeler.saveXML, 'bpmnModeler')
	bpmnModeler.saveXML({ format: true }).then(async ({ xml }) => {
		previewResult.value = xml
		previewType.value = 'xml'
		await nextTick() // 等待数据更新到DOM
		previewModelVisible.value = true
	})
}

/**
 * 预览JSON
 */
const previewProcessJson = () => {
	const newConvert = new X2JS()
	bpmnModeler.saveXML({ format: true }).then(async ({ xml }) => {
		console.log('预览XML数据：', xml) // 关键日志，确认是否有XML字符串
		const { definitions } = newConvert.xml2js(xml)
		if (definitions) {
			previewResult.value = JSON.stringify(definitions, null, 4)
		} else {
			previewResult.value = ''
		}

		previewType.value = 'json'

		await nextTick() // 等待数据更新到DOM
		previewModelVisible.value = true
	})
}

// 生命周期：挂载
onMounted(() => {
	initBpmnModeler()
	createNewDiagram(props.value)
})

// 生命周期：卸载
onBeforeUnmount(() => {
	if (bpmnModeler) bpmnModeler.destroy()
	emit('destroy', bpmnModeler)
	bpmnModeler = null
})
</script>