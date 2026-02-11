<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 14:38:40
 * @LastEditTime: 2026-02-10 15:30:19
 * @LastEditors: zhangsd
 * @Description: 流程设计器
 * @FilePath: \view\src\views\bpmModel\processManagement\editor\index.vue
-->
<template>
	<div class="app-container" style="height: calc(100vh - 110px)">
		<!-- 流程设计器，负责绘制流程等 -->
		<MyProcessDesigner
			key="designer"
			v-model="xmlString"
			:value="xmlString"
			v-bind="controlForm"
			keyboard
			ref="processDesigner"
			@init-finished="initModeler"
			:additionalModel="controlForm.additionalModel"
			:model="model"
			@save="save"
			:process-id="modelKey"
			:process-name="modelName"
		/>
		<!-- 流程属性器，负责编辑每个流程节点的属性 -->
		<MyProcessPenal
			v-if="modeler"
			key="penal"
			:bpmnModeler="modeler"
			:prefix="controlForm.prefix"
			class="process-panel"
			:model="model"
		/>
	</div>
</template>

<script setup>
import { ref, inject, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useMessage } from '@/plugins/useMessage' // 补充引入useMessage
import { MyProcessDesigner, MyProcessPenal } from '@/components/bpmnProcessDesigner/package'
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/content-pad'
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/palette'
import * as ModelApi from '@/api/system/bpm/model'
import { BpmModelFormType } from '@/utils/bpm/constantEnumeration'
import { getDetail } from '@/api/system/bpm/form'

// 定义组件名称
defineOptions({ name: 'BpmModelEditor' })

// 定义组件属性
const props = defineProps({
	/**
	 * 流程模型ID
	 */
	modelId: {
		type: String,
		required: false,
	},
	/**
	 * 流程模型Key
	 */
	modelKey: {
		type: String,
		required: true,
	},
	/**
	 * 流程模型名称
	 */
	modelName: {
		type: String,
		required: true,
	},
	/**
	 * 流程模型XML字符串
	 */
	value: {
		type: String,
		required: false,
	},
})

// 定义组件事件
const emit = defineEmits(['success', 'init-finished'])

// 引入消息提示
const message = useMessage()

// 表单信息
const formFields = ref([])
// 表单类型，暂仅限流程表单
const formType = ref(BpmModelFormType.NORMAL)
provide('formFields', formFields)
provide('formType', formType)

// 注入流程数据（移除TS类型断言）
const xmlString = inject('processData')
// 注入模型数据（移除TS类型断言）
const modelData = inject('modelData')

// BPMN Modeler 实例
const modeler = shallowRef()
const processDesigner = ref()

// 流程设计器配置
const controlForm = ref({
	simulation: true,
	labelEditing: false,
	labelVisible: false,
	prefix: 'flowable',
	headerButtonSize: 'mini',
	additionalModel: [CustomContentPadProvider, CustomPaletteProvider],
})

// 流程模型的信息
const model = ref()

/** 初始化 modeler */
const initModeler = async item => {
	// 先初始化模型数据
	model.value = modelData.value
	modeler.value = item
}

/** 添加/修改模型 */
const save = async bpmnXml => {
	try {
		xmlString.value = bpmnXml
		emit('success', bpmnXml)
	} catch (error) {
		console.error('保存失败:', error)
		message.error('保存失败')
	}
}

/** 监听表单 ID 变化，加载表单数据 */
watch(
	() => modelData.value.formId,
	async newFormId => {
		if (newFormId && modelData.value.formType === BpmModelFormType.NORMAL) {
			const { data } = await getDetail(newFormId)

			formFields.value = data.fields
		} else {
			formFields.value = []
		}
	},
	{ immediate: true },
)

// 组件卸载时清理资源
onBeforeUnmount(() => {
	modeler.value = null
	// 清理全局BPMN实例
	const w = window
	if (w.bpmnInstances) {
		w.bpmnInstances = null
	}
})
</script>

<style lang="scss" scoped>

.app-container{
	background-color: #ffffff;
}
// 流程属性面板样式（
.process-panel {
	&__container {
		position: absolute;
		top: 172px;
		right: 70px;
		background-color: var(--el-bg-color);
		border-radius: var(--el-border-radius-base);
		box-shadow: var(--el-box-shadow-light);
		padding: var(--el-padding-md);
	}
}
</style>
