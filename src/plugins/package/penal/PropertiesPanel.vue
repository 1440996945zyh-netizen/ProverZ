<!--
 * @Author: zhangsd
 * @Date: 2025-09-19 09:17:50
 * @LastEditTime: 2025-12-09 17:01:27
 * @LastEditors: zhangsd
 * @Description: 
 * @FilePath: \view\src\plugins\package\penal\PropertiesPanel.vue
-->

<template>
	<!-- 主容器：控制属性面板宽度，适配外部传入的 width -->
	<div class="process-panel__container" :style="{ width: `${width}px` }">
		<!-- Element Plus 折叠面板：v-model 双向绑定当前激活的 tab 名称 -->
		<el-collapse v-model="activeTab">
			<!-- ==================== 常规配置 ==================== -->
			<el-collapse-item name="base">
				<template #title>
					<!-- 使用 Element Plus 图标 + 文字组合标题 -->
					<div class="panel-tab__title">
						<el-icon><InfoFilled /></el-icon>
						常规
					</div>
				</template>
				<!-- 传递当前选中元素的基本信息给子组件 -->
				<element-base-info
					:id-edit-disabled="idEditDisabled"
					:business-object="elementBusinessObject"
					:categorys="categorys"
					:type="elementType"
				/>
			</el-collapse-item>

			<!-- ==================== 消息与信号（仅对 Process 生效）==================== -->
			<el-collapse-item name="condition" v-if="elementType === 'Process'" key="message">
				<template #title>
					<div class="panel-tab__title">
            <el-icon><Comment /></el-icon>
						消息与信号
					</div>
				</template>
				<!-- 此组件用于配置 BPMN 流程定义中的消息/信号边界事件 -->
				<signal-and-massage />
			</el-collapse-item>

			<!-- ==================== 流转条件（仅对 SequenceFlow 且非 StartEvent 出发时显示）==================== -->
			<el-collapse-item name="condition" v-if="conditionFormVisible" key="condition">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Promotion /></el-icon>
						流转条件
					</div>
				</template>
				<!-- 流转条件配置组件，依赖 elementBusinessObject 和 elementType -->
				<flow-condition :business-object="elementBusinessObject" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 表单配置（仅对 UserTask 和 StartEvent 显示）==================== -->
			<el-collapse-item name="form" v-if="formVisible" key="form">
				<template #title>
					<div class="panel-tab__title">
            <el-icon><List /></el-icon>
						表单
					</div>
				</template>
				<!-- 表单配置组件，通过 id 和 type 获取表单元数据 -->
				<element-form :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 任务配置（所有 Task 类型均显示）==================== -->
			<el-collapse-item name="task" v-if="elementType.indexOf('Task') !== -1" key="task">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Checked /></el-icon>
						任务
					</div>
				</template>
				<!-- 任务配置：用户分配、脚本、优先级等 -->
				<element-task :id="elementId" :type="elementType" :users="users" :groups="groups" />
			</el-collapse-item>

			<!-- ==================== 中间捕获事件（定时器/消息/信号）==================== -->
			<el-collapse-item name="catchEvent" v-if="elementType.indexOf('IntermediateCatchEvent') !== -1" key="catchEvent">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Help /></el-icon>
						定时捕获事件
					</div>
				</template>
				<!-- 配置中间捕获事件的定时器、消息、信号等触发条件 -->
				<catch-event :business-object="elementBusinessObject" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 边界事件（定时器/错误/信号等）==================== -->
			<el-collapse-item name="boundaryEvent" v-if="elementType.indexOf('BoundaryEvent') !== -1" key="boundaryEvent">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><HelpFilled /></el-icon>
						定时边界事件
					</div>
				</template>
				<!-- 配置边界事件的定时器、错误码、取消活动等行为 -->
				<boundary-event :business-object="elementBusinessObject" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 执行监听器（适用于所有节点）==================== -->
			<el-collapse-item name="listeners" key="listeners">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><VideoCameraFilled /></el-icon>
						执行监听器
					</div>
				</template>
				<!-- 配置流程节点在 start/end/exception 等事件触发时的监听器 -->
				<element-listeners :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 任务监听器（仅 UserTask 支持）==================== -->
			<el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" key="taskListeners">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><VideoCameraFilled /></el-icon>
						任务监听器
					</div>
				</template>
				<!-- 针对用户任务的特定监听器：任务创建、完成、分配等 -->
				<user-task-listeners :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 扩展属性（自定义属性，如 Flowable 的 extension）==================== -->
			<el-collapse-item name="extensions" key="extensions">
				<template #title>
					<div class="panel-tab__title">
            <el-icon><CirclePlusFilled /></el-icon>
						扩展属性
					</div>
				</template>
				<!-- 允许添加任意键值对属性到 BPMN 元素的 extensionElements 中 -->
				<element-properties :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 其他配置（通用设置）==================== -->
			<el-collapse-item name="other" key="other">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Promotion /></el-icon>
						其他
					</div>
				</template>
				<!-- 如：自定义属性、备注、版本号等 -->
				<element-other-config :id="elementId" />
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, provide } from 'vue'
import Log from '../Log' // 日志工具，用于调试 BPMN 元素变更

// 导入子组件 —— 按功能模块组织
import ElementBaseInfo from './base/ElementBaseInfo' // 常规信息：ID、名称、描述、分类
import ElementOtherConfig from './other/ElementOtherConfig' // 其他配置：备注、标签等
import ElementTask from './task/ElementTask' // 任务配置：assignee、candidateUsers、priority
import FlowCondition from './flow-condition/FlowCondition' // 流转条件：表达式、脚本、默认路径
import SignalAndMassage from './signal-message/SignalAndMessage' // 消息/信号事件配置
import ElementListeners from './listeners/ElementListeners' // 执行监听器（start/end/exception）
import ElementProperties from './properties/ElementProperties' // 自定义扩展属性（key-value）
import ElementForm from './form/ElementForm' // 表单绑定（formKey、formRef）
import UserTaskListeners from './listeners/UserTaskListeners' // 任务监听器（create/complete/assign）
import BoundaryEvent from './boundary-events/BoundaryEvent' // 边界事件（timer/error/message）
import CatchEvent from './catch-events/CatchEvent' // 中间捕获事件（timer/message/error）

// 导入 Element Plus 组件和图标
import { ElCollapse, ElCollapseItem, ElIcon } from 'element-plus'
import {
	InfoFilled,
	Comment,
	Promotion,
	Document,
	Operation,
	Help,
	HelpFilled,
	VideoCameraFilled,
	CirclePlusFilled,
	Checked,
  List
} from '@element-plus/icons-vue'

// ========== Props 定义 ==========
const props = defineProps({
	bpmnModeler: {
		type: Object,
		required: true, // 必须传入 bpmn-js 实例
		description: 'bpmn-js 模型器实例，用于获取 modeling、moddle、elementRegistry 等服务',
	},
	prefix: {
		type: String,
		default: 'flowable', // 默认使用 Flowable 扩展命名空间
		description: 'BPMN 扩展元素的命名空间前缀，如 flowable:taskListener',
	},
	users: {
		type: Array,
		required: true,
		description: '可用用户列表，用于任务分配下拉选择',
	},
	groups: {
		type: Array,
		required: true,
		description: '可用用户组列表，用于任务候选组配置',
	},
	categorys: {
		type: Array,
		default: () => [], // 可选，用于流程分类筛选
		description: '流程分类数组，如 ["审批流程", "报销流程"]',
	},
	width: {
		type: Number,
		default: 480, // 默认宽度 480px，适配右侧属性面板
		description: '属性面板的宽度，单位 px',
	},
	idEditDisabled: {
		type: Boolean,
		default: false,
		description: '是否禁用 ID 编辑功能（如只读模式）',
	},
})

// ========== 提供依赖给子组件 ==========
// 将 prefix 和 width 注入到所有子组件中，避免重复传递 props
provide('prefix', props.prefix)
provide('width', props.width)

// ========== 响应式状态（Vue 3 Composition API）==========
const activeTab = ref('base') // 当前激活的折叠面板项，默认为 "base"

const elementId = ref('') // 当前选中元素的 ID（如 "StartEvent_1"）
const elementType = ref('') // 当前选中元素的类型（如 "UserTask"、"SequenceFlow"）
const elementBusinessObject = ref({}) // 当前元素的 BPMN businessObject 深拷贝，用于子组件判断

const conditionFormVisible = ref(false) // 是否显示"流转条件"面板（仅 SequenceFlow 且非 StartEvent 出发时）
const formVisible = ref(false) // 是否显示"表单"面板（UserTask 或 StartEvent）

// ========== 非响应式引用（用于存储全局对象或定时器）==========
let bpmnModeler = null // 存储传入的 bpmnModeler 实例（避免重复调用 props）
let timer = null // 防抖定时器，用于等待模型加载完成
let bpmnElement = null // 当前选中的 BPMN 元素实例（来自 elementRegistry）
let currentSelectedElementId = null
// ========== 初始化 bpmn-js 实例 ==========
const initModels = () => {
	// 如果未传入 bpmnModeler，延迟重试（防止流程图尚未初始化）
	if (!props.bpmnModeler) {
		timer = setTimeout(initModels, 10) // 10ms 后重试
		return
	}

	// 清除旧的定时器，避免内存泄漏
	if (timer) clearTimeout(timer)

	// ✅ 核心：将 bpmn-js 实例挂载到全局 window 对象，供所有子组件访问
	// 所有子组件（如 FlowCondition、ElementListeners）都依赖此全局对象
	window.bpmnInstances = {
		modeler: props.bpmnModeler, // 整个模型器
		modeling: props.bpmnModeler.get('modeling'), // 修改模型的 API（updateProperties）
		moddle: props.bpmnModeler.get('moddle'), // 创建 BPMN 元素的工厂（create("bpmn:FormalExpression")）
		eventBus: props.bpmnModeler.get('eventBus'), // 事件总线（用于监听全局事件）
		bpmnFactory: props.bpmnModeler.get('bpmnFactory'), // 创建原始 BPMN 元素的工厂
		elementFactory: props.bpmnModeler.get('elementFactory'), // 创建视图元素（SVG 节点）
		elementRegistry: props.bpmnModeler.get('elementRegistry'), // 所有元素注册表（查找元素）
		replace: props.bpmnModeler.get('replace'), // 替换元素（如转换类型）
		selection: props.bpmnModeler.get('selection'), // 当前选中元素集合
	}

	// 初始化当前选中元素
	getActiveElement()
}

// ========== 监听选中元素变化并更新面板 ==========
const getActiveElement = () => {
	// 初始时，若无选中元素，则自动选中第一个 Process 或 Collaboration
	initFormOnChanged(null)

	// ✅ 监听流程导入完成事件（首次加载或重新导入）
	window.bpmnInstances.modeler.on('import.done', () => {
		initFormOnChanged(null) // 重置面板
	})

	// ✅ 监听元素选择变化（用户点击了某个节点）
	window.bpmnInstances.modeler.on('selection.changed', ({ newSelection }) => {
		const selectedElement = newSelection[0] || null // 可能为空（取消选择）
		initFormOnChanged(selectedElement)
	})

	// ✅ 监听元素属性变更（如修改了默认流、条件表达式等）
	// 注意：当用户修改"默认流转路径"时，会触发多个元素变更，需判断是否是当前元素
	window.bpmnInstances.modeler.on('element.changed', ({ element }) => {
		if (element && element.id === elementId.value) {
			// 只有当前被编辑的元素变更才刷新面板
			initFormOnChanged(element)
		}
	})
}

// ========== 根据选中元素更新所有 UI 状态 ==========
const initFormOnChanged = element => {
	let activatedElement = element

	// 若未传入元素，则尝试从注册表中查找默认流程（Process 或 Collaboration）
	if (!activatedElement) {
		const registry = window.bpmnInstances.elementRegistry
		activatedElement = registry.find(el => el.type === 'bpmn:Process') ?? registry.find(el => el.type === 'bpmn:Collaboration')
	}

	// 如果仍未找到有效元素，直接返回
	if (!activatedElement) return
	const isElementSwitch = activatedElement.id !== currentSelectedElementId
	currentSelectedElementId = activatedElement.id
	// ✅ 日志输出：便于调试当前选中的是哪个元素
	Log.printBack(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`)
	Log.prettyInfo('businessObject', activatedElement.businessObject)

	// ✅ 将当前选中元素写入全局共享对象，供子组件使用
	window.bpmnInstances.bpmnElement = activatedElement
	bpmnElement = activatedElement

	// ✅ 更新响应式状态
	elementId.value = activatedElement.id
	elementType.value = activatedElement.type.split(':')[1] || '' // 如 "bpmn:UserTask" → "UserTask"

	// 深拷贝 businessObject，避免子组件修改原对象导致不可控副作用
	elementBusinessObject.value = JSON.parse(JSON.stringify(activatedElement.businessObject))

	// ✅ 控制"流转条件"面板是否显示：
	// 仅当是 SequenceFlow 且起点不是 StartEvent 时才显示
	conditionFormVisible.value =
		elementType.value === 'SequenceFlow' && activatedElement.source && activatedElement.source.type.indexOf('StartEvent') === -1

	// ✅ 控制"表单"面板是否显示：
	// UserTask 和 StartEvent 都支持绑定表单
	formVisible.value = elementType.value === 'UserTask' || elementType.value === 'StartEvent'

	// ✅ 每次切换元素后，自动展开"常规"面板
	if (isElementSwitch) {
		activeTab.value = 'base'
	}
}

// ========== 监听 elementId 变化，确保每次切换元素都回到基础面板 ==========
// watch(
//   () => elementId.value, // 监听元素 ID 变化
//   () => {
//     // 每次切换元素，强制重置为 base 标签，提升用户体验
//     activeTab.value = 'base'
//   }
// )

// ========== 组件挂载时初始化模型 ==========
onMounted(() => {
	initModels() // 初始化 bpmn-js 实例和监听器
})

// ========== 组件销毁时清理资源 ==========
onBeforeUnmount(() => {
	// 清除定时器，避免内存泄漏
	if (timer) clearTimeout(timer)

	// ✅ 关键：释放全局引用，防止与其他流程图实例冲突
	// 例如：多页签切换时，旧的 window.bpmnInstances 应被清除
	window.bpmnInstances = null
})
</script>

<style scoped lang="scss">
/* 主容器：高度占满，允许纵向滚动 */
.process-panel__container {
	height: 100%;
	overflow-y: auto;
	// padding: 8px;
	box-sizing: border-box;
  border-radius: 10px;
}

/* 标题样式：图标与文字居中对齐，加粗 */
.panel-tab__title {
	display: flex;
	align-items: center;
	font-weight: 500;
	color: #303133;
	gap: 6px; /* 图标与文字间距 */
}
</style>