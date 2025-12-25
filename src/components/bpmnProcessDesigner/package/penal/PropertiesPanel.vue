<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 15:47:56
 * @LastEditTime: 2025-12-25 15:47:15
 * @LastEditors: zhangsd
 * @Description: 属性面板
 * @FilePath: \view\src\components\bpmnProcessDesigner\package\penal\PropertiesPanel.vue
-->

<template>
	<div class="process-panel__container" :style="{ width: `${width}px`, borderRadius: '10px', maxHeight: '600px' }">
		<!-- 属性面板 -->
		<el-collapse v-model="activeTab" v-if="isReady">
			<!-- ==================== 常规配置 ==================== -->
			<el-collapse-item name="base">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><InfoFilled /></el-icon>
						常规
					</div>
				</template>
				<!-- 传递当前选中元素的基本信息给子组件 -->
				<ElementBaseInfo
					:id-edit-disabled="idEditDisabled"
					:business-object="elementBusinessObject"
					:type="elementType"
					:model="model"
				/>
			</el-collapse-item>

			<!-- ==================== 消息与信号（仅对 Process 生效）==================== -->
			<el-collapse-item name="condition" v-if="elementType === 'Process'" key="message">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><ChatLineRound /></el-icon>
						消息与信号
					</div>
				</template>
				<!-- 此组件用于配置 BPMN 流程定义中的消息/信号边界事件 -->
				<SignalAndMassage />
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
				<FlowCondition :business-object="elementBusinessObject" :type="elementType" />
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
				<ElementForm :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 任务配置（所有 Task 类型均显示）==================== -->
			<el-collapse-item name="task" v-if="isTaskCollapseItemShow(elementType)" key="task">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Checked /></el-icon>
						<!-- <el-icon><CircleCheck /></el-icon> -->
						{{ getTaskCollapseItemName(elementType) }}
					</div>
				</template>
				<!-- 任务配置：用户分配、脚本、优先级等 -->
				<ElementTask :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 多人审批方式（仅对 UserTask 显示）==================== -->
			<el-collapse-item name="multiInstance" v-if="elementType.indexOf('Task') !== -1" key="multiInstance">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><HelpFilled /></el-icon>
						多人审批方式
					</div>
				</template>
				<!-- 多人审批方式配置组件，依赖 elementId、elementBusinessObject 和 elementType -->
				<ElementMultiInstance :id="elementId" :business-object="elementBusinessObject" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 执行监听器（所有元素类型均显示）==================== -->
			<el-collapse-item name="listeners" key="listeners">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><BellFilled /></el-icon>
						执行监听器
					</div>
				</template>
				<!-- 执行监听器配置组件，依赖 elementId 和 elementType -->
				<ElementListeners :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 任务监听器（仅对 UserTask 显示）==================== -->
			<el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" key="taskListeners">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><BellFilled /></el-icon>
						任务监听器
					</div>
				</template>
				<!-- 任务监听器配置组件，依赖 elementId 和 elementType -->
				<UserTaskListeners :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 扩展属性（所有元素类型均显示）====================   -->
			<el-collapse-item name="extensions" key="extensions">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><CirclePlusFilled /></el-icon>
						扩展属性
					</div>
				</template>
				<!-- 扩展属性配置组件，依赖 elementId 和 elementType -->
				<ElementProperties :id="elementId" :type="elementType" />
			</el-collapse-item>

			<!-- ==================== 其他配置（所有元素类型均显示）==================== -->
			<el-collapse-item name="other" key="other">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Promotion /></el-icon>
						其他
					</div>
				</template>
				<!-- 其他配置组件，依赖 elementId -->
				<ElementOtherConfig :id="elementId" />
			</el-collapse-item>

			<!-- ==================== 自定义配置（所有元素类型均显示）==================== -->
			<el-collapse-item name="customConfig" key="customConfig">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Tools /></el-icon>
						自定义配置
					</div>
				</template>
				<!-- 自定义配置组件，依赖 elementId、elementType 和 elementBusinessObject -->
				<ElementCustomConfig :id="elementId" :type="elementType" :business-object="elementBusinessObject" />
			</el-collapse-item>

			<!-- ==================== 时间事件配置（仅对 IntermediateCatchEvent 显示）==================== -->
			<el-collapse-item v-if="elementType === 'IntermediateCatchEvent'" name="timeEvent">
				<template #title>
					<div class="panel-tab__title">
						<el-icon><Timer /></el-icon>
						时间事件
					</div>
				</template>
				<!-- 时间事件配置组件，依赖 elementBusinessObject 和 elementId -->
				<TimeEventConfig :businessObject="elementBusinessObject" :key="elementId" />
			</el-collapse-item>
		</el-collapse>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, provide } from 'vue'

// 导入组件
import ElementBaseInfo from './base/ElementBaseInfo.vue'
import ElementOtherConfig from './other/ElementOtherConfig.vue'
import ElementTask from './task/ElementTask.vue'
import ElementMultiInstance from './multi-instance/ElementMultiInstance.vue'
import FlowCondition from './flow-condition/FlowCondition.vue'
import SignalAndMassage from './signal-message/SignalAndMessage.vue'
import ElementListeners from './listeners/ElementListeners.vue'
import ElementProperties from './properties/ElementProperties.vue'
import ElementForm from './form/ElementForm.vue'
import UserTaskListeners from './listeners/UserTaskListeners.vue'
import TimeEventConfig from './time-event-config/TimeEventConfig.vue'
import ElementCustomConfig from './custom-config/ElementCustomConfig.vue'
import { getTaskCollapseItemName, isTaskCollapseItemShow } from './task/data'

defineOptions({ name: 'MyPropertiesPanel' })

const props = defineProps({
	/**
	 * BPMN 模型器实例
	 */
	bpmnModeler: {
		type: Object,
		default: () => {},
		description: 'bpmn-js 模型器实例，用于获取 modeling、moddle、elementRegistry 等服务',
	},
	/**
	 * 自定义属性前缀
	 */
	prefix: {
		type: String,
		default: 'camunda',
		description: '自定义属性前缀，默认值为 camunda',
	},
	/**
	 * 属性面板宽度
	 */
	width: {
		type: Number,
		default: 480,
		description: '属性面板宽度，默认值为 480',
	},
	/**
	 * 是否禁用元素 ID 编辑
	 */
	idEditDisabled: {
		type: Boolean,
		default: false,
		description: '是否禁用元素 ID 编辑，默认值为 false',
	},
	/**
	 * 流程模型数据
	 */
	model: Object, // 流程模型的数据
	description: '流程模型数据，包含 BPMN 模型的 XML 字符串和 JSON 数据',
})

// 响应式数据
const activeTab = ref('base')
const elementId = ref('')
const elementType = ref('')
const elementBusinessObject = ref({}) // 元素 businessObject 镜像，提供给需要做判断的组件使用
const conditionFormVisible = ref(false) // 流转条件设置
const formVisible = ref(false) // 表单配置
const bpmnElement = ref()
const isReady = ref(false)

// 时间事件相关
const type = ref('time')
const condition = ref('')

provide('prefix', props.prefix)
provide('width', props.width)

/**
 * @description 初始化 BPMN 实例
 * @returns {boolean} 是否初始化成功
 */
const initBpmnInstances = () => {
	if (!props.bpmnModeler) return false
	try {
		const instances = {
			modeler: props.bpmnModeler,
			modeling: props.bpmnModeler.get('modeling'),
			moddle: props.bpmnModeler.get('moddle'),
			eventBus: props.bpmnModeler.get('eventBus'),
			bpmnFactory: props.bpmnModeler.get('bpmnFactory'),
			elementFactory: props.bpmnModeler.get('elementFactory'),
			elementRegistry: props.bpmnModeler.get('elementRegistry'),
			replace: props.bpmnModeler.get('replace'),
			selection: props.bpmnModeler.get('selection'),
		}

		// 检查所有实例是否都存在
		const allInstancesExist = Object.values(instances).every(instance => instance)
		if (allInstancesExist) {
			window.bpmnInstances = instances
			return true
		}
		return false
	} catch (error) {
		console.error('初始化 bpmnInstances 失败:', error)
		return false
	}
}

/**
 * @description 获取 BPMN 实例对象
 * @returns {Object} BPMN 实例
 */
const bpmnInstances = () => window?.bpmnInstances

// 监听 props.bpmnModeler 然后 initModels
const unwatchBpmn = watch(
	() => props.bpmnModeler,
	async () => {
		// 避免加载时 流程图 并未加载完成
		if (!props.bpmnModeler) {
			console.log('缺少props.bpmnModeler')
			return
		}

		try {
			// 等待 modeler 初始化完成
			await nextTick()
			if (initBpmnInstances()) {
				isReady.value = true
				await nextTick()
				getActiveElement()
			} else {
				console.error('modeler 实例未完全初始化')
			}
		} catch (error) {
			console.error('初始化失败:', error)
		}
	},
	{
		immediate: true,
	}
)

/**
 * @description 获取活动元素
 */
const getActiveElement = () => {
	if (!isReady.value || !props.bpmnModeler) return

	// 初始第一个选中元素 bpmn:Process
	initFormOnChanged(null)
	props.bpmnModeler.on('import.done', e => {
		console.log(e, 'eeeee')
		initFormOnChanged(null)
	})
	// 监听选择事件，修改当前激活的元素以及表单
	props.bpmnModeler.on('selection.changed', ({ newSelection }) => {
		initFormOnChanged(newSelection[0] || null)
	})
	props.bpmnModeler.on('element.changed', ({ element }) => {
		// 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
		if (element && element.id === elementId.value) {
			initFormOnChanged(element)
		}
	})
}

/**
 * @description 初始化数据
 * @param {Object} element 元素对象
 */
const initFormOnChanged = element => {
	if (!isReady.value || !bpmnInstances()) return

	let activatedElement = element
	if (!activatedElement) {
		activatedElement =
			bpmnInstances().elementRegistry.find(el => el.type === 'bpmn:Process') ??
			bpmnInstances().elementRegistry.find(el => el.type === 'bpmn:Collaboration')
	}
	if (!activatedElement) return

	try {
		console.log(`
                ----------
        select element changed:
                  id:  ${activatedElement.id}
                type:  ${activatedElement.businessObject.$type}
                ----------
                `)
		console.log('businessObject: ', activatedElement.businessObject)
		bpmnInstances().bpmnElement = activatedElement
		bpmnElement.value = activatedElement
		elementId.value = activatedElement.id
		elementType.value = activatedElement.type.split(':')[1] || ''
		elementBusinessObject.value = JSON.parse(JSON.stringify(activatedElement.businessObject))
		conditionFormVisible.value = !!(
			elementType.value === 'SequenceFlow' &&
			activatedElement.source &&
			activatedElement.source.type.indexOf('StartEvent') === -1
		)
		formVisible.value = elementType.value === 'UserTask' || elementType.value === 'StartEvent'
	} catch (error) {
		console.error('初始化表单数据失败:', error)
	}
}

// 组件卸载前清理
onBeforeUnmount(() => {
	window.bpmnInstances = null
	isReady.value = false
})

// 监听元素 ID 变化
watch(
	() => elementId.value,
	() => {
		activeTab.value = 'base'
	}
)

/**
 * @description 更新节点
 */
function updateNode() {
	const moddle = window.bpmnInstances?.moddle
	const modeling = window.bpmnInstances?.modeling
	const elementRegistry = window.bpmnInstances?.elementRegistry
	if (!moddle || !modeling || !elementRegistry) return

	const element = elementRegistry.get(props.businessObject.id)
	if (!element) return

	let timerDef = moddle.create('bpmn:TimerEventDefinition', {})
	if (type.value === 'time') {
		timerDef.timeDate = moddle.create('bpmn:FormalExpression', { body: condition.value })
	} else if (type.value === 'duration') {
		timerDef.timeDuration = moddle.create('bpmn:FormalExpression', { body: condition.value })
	} else if (type.value === 'cycle') {
		timerDef.timeCycle = moddle.create('bpmn:FormalExpression', { body: condition.value })
	}

	modeling.updateModdleProperties(element, element.businessObject, {
		eventDefinitions: [timerDef],
	})
}

/**
 * @description 从业务对象同步数据
 */
function syncFromBusinessObject() {
	if (props.businessObject) {
		const timerDef = (props.businessObject.eventDefinitions || [])[0]
		if (timerDef) {
			if (timerDef.timeDate) {
				type.value = 'time'
				condition.value = timerDef.timeDate.body
			} else if (timerDef.timeDuration) {
				type.value = 'duration'
				condition.value = timerDef.timeDuration.body
			} else if (timerDef.timeCycle) {
				type.value = 'cycle'
				condition.value = timerDef.timeCycle.body
			}
		}
	}
}

onMounted(syncFromBusinessObject)
watch(() => props.businessObject, syncFromBusinessObject, { deep: true })
</script>

<style scoped lang="scss">
// 主容器：高度占满，允许纵向滚动
::deep(.process-panel__container) {
	overflow-y: auto !important;
	padding: 0px 8px !important;
	box-sizing: border-box !important;
	border-radius: 10px !important;
	max-height: 600px;
}
// 标题样式：图标与文字居中对齐，加粗
.panel-tab__title {
	display: flex;
	align-items: center;
	font-weight: 500;
	color: #303133;
	gap: 6px; /* 图标与文字间距 */
}
</style>