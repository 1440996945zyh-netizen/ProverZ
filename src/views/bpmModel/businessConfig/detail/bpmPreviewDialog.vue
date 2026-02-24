<!--
 * @Author: zhangsd
 * @Date: 2026-02-11 10:05:57
 * @LastEditTime: 2026-02-11 10:46:26
 * @LastEditors: zhangsd
 * @Description: 业务关联显示流程图弹窗
 * @FilePath: \view\src\views\bpmModel\businessConfig\detail\bpmPreviewDialog.vue
-->

<template>
	<div class="box-card">
		<MyProcessViewer key="designer" :xml="view.bpmnXml" :view="view" class="process-viewer" />
	</div>
</template>

<script  setup>
import { ref, watch } from 'vue'
import { MyProcessViewer } from '@/components/bpmnProcessDesigner/package'
import ModelApi from '@/api/system/bpm/model/index'
defineOptions({ name: 'BpmProcessInstanceBpmnViewer' })

const props = defineProps({
	loading: {
		type: Boolean,
		default: false, // 是否加载中
	},
	modelId: {
		type: String, // 流程模型ID
	},
})

// BPMN 流程图数据，无需TS类型标注
const view = ref({
	bpmnXml: '',
})

watch(
	() => props.modelId,
	async newModelView => {
		console.log('props.modelId', props.modelId)
		// 加载最新流程模型视图
		if (newModelView) {
			let modelId = props.modelId
			const res = await ModelApi.getModel(modelId)
			view.value.bpmnXml = res.data.bpmnXml
		}
	},
	{ immediate: true }
)


</script>

<style lang="css" scoped>
/* 移除SCSS，改为标准CSS，无简写样式需要替换，保持原样式逻辑 */
.box-card {
	height: 500px;
	width: 100%;
	margin-bottom: 0;
}

.box-card :deep(.el-card__body) {
	height: 100%;
	padding: 0;
}

.box-card :deep(.process-viewer) {
	height: 100% !important;
	min-height: 100%;
	width: 100%;
	overflow: auto;
}
</style>
