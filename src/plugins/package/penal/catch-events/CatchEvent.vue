<template>
	<div class="panel-tab__content">
		<!-- 目前只处理定时边界事件 -->
		<el-form
			size="mini"
			label-width="90px"
			@submit.prevent
			v-if="businessObject?.eventDefinitions?.[0]?.$type?.includes('TimerEventDefinition')"
		>
			<el-form-item label="事件类型">
				<el-select v-model="timeDefinitionType" @change="changeTimerType">
					<!-- bpmn:TimerEventDefinition -->
					<el-option label="指定时间" value="timeDate" />
					<el-option label="持续时间" value="timeDuration" />
					<el-option label="周期执行" value="timeCycle" />
				</el-select>
			</el-form-item>
			
			<template v-if="timeDefinitionType">
				<el-form-item label="时间设置" required>
					<el-tooltip>
						<template #content>
							<div>
								事件类型配置说明
								<br />
								1. 指定时间(timeDate): 触发事件的时间,如:2022-12-16T11:12:16
								<br />
								2. 持续时间(timeDuration): 指定时器之前需等待多长时间,使用ISO 8601规定的格式
								<br />(由BPMN 2.0规定),如PT5M(等待5分钟),也支持表达式${duration},
								<br />这样你就可以通过流程变量来影响定时器定义
								<br />
								3. 周期执行(timeCycle): 指定重复执行的间隔,可以用来定期启动流程实例,
								<br />或为超时时间发送多个提醒。timeCycle元素可以使用两种格式。
								<br />第一种是 ISO 8601 标准的格式。示例值(R3/PT5M)(重复3次,
								<br />每次间隔5分钟),或也可以用cron表达式指定timeCycle,如从整点开始,
								<br />每10分钟执行一次(0 0/10 * * * ?)
							</div>
						</template>
						<el-input 
							size="mini" 
							type="string" 
							v-model="formalExpression" 
							@change="updateTimeValue"
						/>
					</el-tooltip>
				</el-form-item>
			</template>
		</el-form>
	</div>
</template>

<script setup>
import { ref, watch, inject, onUnmounted } from 'vue'

// 定义组件属性
const props = defineProps({
	businessObject: Object,
	type: String,
})

// 注入依赖
const prefix = inject('prefix')

// 响应式状态
const timeDefinitionType = ref('')
const formalExpression = ref('')
const bpmnElement = ref(null)

// 监听businessObject变化
watch(
	() => props.businessObject,
	(val) => {
		if (val) {
			bpmnElement.value = window.bpmnInstances.bpmnElement
			getElementLoop(val)
		}
	},
	{ immediate: true }
)

// 获取元素的定时配置
const getElementLoop = (businessObject) => {
	// 获取定时边界事件原有值
	if (businessObject?.eventDefinitions?.length) {
		const eventDef = businessObject.eventDefinitions[0]
		if (eventDef.$type === 'bpmn:TimerEventDefinition') {
			if (eventDef.timeDuration) {
				timeDefinitionType.value = 'timeDuration'
				formalExpression.value = eventDef.timeDuration.body
			} else if (eventDef.timeDate) {
				timeDefinitionType.value = 'timeDate'
				formalExpression.value = eventDef.timeDate.body || ''
			} else if (eventDef.timeCycle) {
				timeDefinitionType.value = 'timeCycle'
				formalExpression.value = eventDef.timeCycle.body || ''
			}
		}
	}
}

// 改变定时器类型
const changeTimerType = (type) => {
	timeDefinitionType.value = type
}

// 更新时间值
const updateTimeValue = (value) => {
	updateTime(timeDefinitionType.value, value)
}

// 时间事件定义类型修改
const updateTime = (type, value) => {
	// 获取节点的子节点 timerEventDefinition
	const timerEventDef = bpmnElement.value?.businessObject?.eventDefinitions?.[0]
	if (!timerEventDef) return
	
	// 创建不同类型的时间表达式
	const timeCycle = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: value })
	const timeDate = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: value })
	const timeDuration = window.bpmnInstances.moddle.create('bpmn:FormalExpression', { body: value })
	
	// 根据类型更新属性
	if (type === 'timeCycle') {
		window.bpmnInstances.modeling.updateModdleProperties(bpmnElement.value, timerEventDef, { 
			timeDate: null,
			timeDuration: null,
			timeCycle
		})
	} else if (type === 'timeDate') {
		window.bpmnInstances.modeling.updateModdleProperties(bpmnElement.value, timerEventDef, { 
			timeCycle: null,
			timeDuration: null,
			timeDate
		})
	} else if (type === 'timeDuration') {
		window.bpmnInstances.modeling.updateModdleProperties(bpmnElement.value, timerEventDef, { 
			timeDate: null,
			timeCycle: null,
			timeDuration
		})
	}
}

// 组件卸载时清理
onUnmounted(() => {
  bpmnElement.value = null;
});
</script>
