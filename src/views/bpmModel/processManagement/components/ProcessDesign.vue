<!--
 * @Author: zhangsd
 * @Date: 2025-12-16 14:26:24
 * @LastEditTime: 2025-12-16 16:36:50
 * @LastEditors: zhangsd
 * @Description: 流程设计
 * @FilePath: \view\src\views\system\processManagement\components\ProcessDesign.vue
-->
 
<template>
	<div class="">
		<!-- BPMN设计器 -->
		<template v-if="modelData.type == BpmModelType.BPMN">
			<BpmModelEditor
				v-if="showDesigner"
				:model-id="modelData.id"
				:model-key="modelData.key"
				:model-name="modelData.name"
				@success="handleDesignSuccess"
			/>
		</template>
	</div>
</template>

<script setup>
defineOptions({
	name: 'ProcessDesign',
})
import { computed, inject, nextTick } from 'vue'
import { BpmModelType } from '@/utils/bpm/constantEnumeration'
import BpmModelEditor from '../editor/index.vue'

// 双向绑定模型数据
const modelData = defineModel({})

// 注入流程数据（来自父组件）
const processData = inject('processData')

/** 表单校验：验证流程设计是否完成 */
const validate = async () => {
	try {
		// 校验流程数据是否存在
		if (!processData.value) {
			throw new Error('请设计流程')
		}
		return true
	} catch (error) {
		throw error
	}
}

/** 处理设计器保存成功的回调 */
const handleDesignSuccess = async data => {
	if (data) {
		// 创建新对象触发响应式更新，区分BPMN和Simple流程类型
		const newModelData = {
			...modelData.value,
			bpmnXml: modelData.value.type === BpmModelType.BPMN ? data : null,
			simpleModel: modelData.value.type === BpmModelType.BPMN ? null : data,
		}
		// 等待DOM更新后再赋值
		await nextTick()
		// 更新模型数据
		modelData.value = newModelData
	}
}

/** 计算属性：判断是否显示设计器（需流程标识和名称都存在） */
const showDesigner = computed(() => {
	return Boolean(modelData.value?.key && modelData.value?.name)
})

// 暴露校验方法给父组件
defineExpose({
	validate,
})
</script>

<style lang="scss" scoped>
:deep(.bpmn-editor-container),
:deep(.simple-model-design) {
	--el-component-background: var(--el-bg-color);
	--el-component-text-color: var(--el-text-color-primary);
	min-height: 600px;
	padding: 16px;
	background-color: var(--el-bg-color);
	border-radius: var(--el-border-radius-base);
	box-sizing: border-box;
}
</style>