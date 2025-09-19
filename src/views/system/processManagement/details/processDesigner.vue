<!--
 * @Author: zhangsd
 * @Date: 2025-09-16 16:59:36
 * @LastEditTime: 2025-09-18 08:57:26
 * @LastEditors: zhangsd
 * @Description: 流程模版设计
 * @FilePath: \view\src\views\system\processManagement\details\processDesigner.vue
-->
<template>
	<div class="app-container">
		<BpmnProcessDesigner
			:key="designerOpen"
			style="border: 1px solid rgba(0, 0, 0, 0.1)"
			ref="modelDesigner"
			v-loading="designerData.loading"
			:bpmnXml="designerData.bpmnXml"
			:designerForm="designerData.form"
			@save="save"
		/>
	</div>
</template>
<script setup>
import BpmnProcessDesigner from '@/components/ProcessDesigner'
import { ElMessage, ElMessageBox } from 'element-plus'
const designerOpen = ref(true)
const modelDesigner = ref(null)
const designerData = reactive({
	loading: false,
	bpmnXml: '',
	title: '',
	form: {
		users: [],
		groups: [],
		categorys: [],
		processName: null,
		processKey: null,
	},
})
const save = async data => {
	console.log('保存的数据:', data)
	designerData.loading = true
	ElMessageBox.confirm('是否保存当前流程？', '提示', {
		confirmButtonText: '保存',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		modelDesigner.value.save().then(res => {
			if (res.code === 200) {
				ElMessage.success('保存成功')
				designerData.bpmnXml = res.data.bpmnXml
				designerData.form = res.data.form
				designerOpen.value = false
			}
		})
	})
}
</script>

<style>
</style>