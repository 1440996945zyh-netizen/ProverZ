<!--
 * @Author: zhangsd
 * @Date: 2025-09-16 16:59:36
 * @LastEditTime: 2025-09-24 17:33:17
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
			@element-changed="handleElementChanged"
			@xml-changed="handleXmlChanged"
		/>
	</div>
</template>
<script setup>
import { ref, reactive, onBeforeUnmount, watch, onMounted } from 'vue'
import BpmnProcessDesigner from '@/components/ProcessDesigner'
import { ElMessage, ElMessageBox } from 'element-plus'

// 接收父组件传递的参数
const props = defineProps({
	// 编辑器数据（选中的数据）
	editor: {
		type: Object,
		default: () => ({}),
		required: true // 标记为必填
	},
	// 是否允许离开时的未保存提示
	enableLeaveGuard: {
		type: Boolean,
		default: true
	}
})

// 组件内部状态
const designerOpen = ref(true)
const modelDesigner = ref(null)
const hasUnsavedChanges = ref(false) // 标记是否有未保存的修改
const initialXml = ref('') // 初始XML用于比较是否有修改

// 设计器核心数据对象
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
	// 新增字段存储editor中的其他核心信息
	processId: '',
	deploymentId: '',
	description: '',
	category: ''
})

// 将editor数据赋值给designerData
const assignEditorToDesignerData = () => {
	if (!props.editor) return
	
	// 1. 基础属性赋值
	designerData.bpmnXml = props.editor.bpmnXml || ''
	designerData.title = props.editor.title || props.editor.processName || ''
	designerData.processId = props.editor.processId || ''
	designerData.deploymentId = props.editor.deploymentId || ''
	designerData.description = props.editor.description || ''
	designerData.category = props.editor.category || ''
	
	// 2. 表单数据赋值（优先使用editor中的form对象）
	if (props.editor.form) {
		// 深拷贝避免直接修改props
		designerData.form = {
			users: [...(props.editor.form.users || [])],
			groups: [...(props.editor.form.groups || [])],
			categorys: [...(props.editor.form.categorys || [])],
			processName: props.editor.form.processName || props.editor.processName || '',
			processKey: props.editor.form.processKey || props.editor.processKey || ''
		}
	} else {
		// 从editor根节点提取表单字段
		designerData.form.processName = props.editor.processName || ''
		designerData.form.processKey = props.editor.processKey || ''
		designerData.form.users = props.editor.users || []
		designerData.form.groups = props.editor.groups || []
		designerData.form.categorys = props.editor.categorys || []
	}
	console.log('designerData =>', designerData);
	// 3. 初始化用于比较的基准XML
	initialXml.value = designerData.bpmnXml
	hasUnsavedChanges.value = false // 重置修改状态
}

// 监听编辑事件 - 元素变更
const handleElementChanged = (element) => {
	console.log('元素发生变更:', element)
	hasUnsavedChanges.value = true
}

// 监听编辑事件 - XML变更
const handleXmlChanged = (xml) => {
	console.log('XML发生变更')
	designerData.bpmnXml = xml // 实时同步XML到designerData
	hasUnsavedChanges.value = true
}

// 保存流程设计
const save = async data => {
	console.log('保存的数据:', data)
	designerData.loading = true
	
	ElMessageBox.confirm('是否保存当前流程？', '提示', {
		confirmButtonText: '保存',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		try {
			// 准备保存参数（结合designerData和编辑后的数据）
			const saveData = {
				processId: designerData.processId,
				deploymentId: designerData.deploymentId,
				bpmnXml: data.bpmnXml || designerData.bpmnXml,
				form: { ...designerData.form, ...data.form },
				title: designerData.title,
				description: designerData.description,
				category: designerData.category
			}
			
			// 调用设计器的保存方法
			const res = await modelDesigner.value.save(saveData)
			
			if (res.code === 200) {
				ElMessage.success('保存成功')
				// 更新本地数据为最新保存状态
				designerData.bpmnXml = res.data.bpmnXml
				designerData.form = res.data.form
				initialXml.value = res.data.bpmnXml
				hasUnsavedChanges.value = false
				designerOpen.value = false
			} else {
				ElMessage.error('保存失败: ' + (res.msg || '未知错误'))
			}
		} catch (error) {
			console.error('保存过程出错:', error)
			ElMessage.error('保存过程发生错误')
		} finally {
			designerData.loading = false
		}
	}).catch(() => {
		// 取消保存
		designerData.loading = false
		ElMessage.info('已取消保存')
	})
}

// 检测是否有未保存的更改并提示
const checkUnsavedChanges = async () => {
	if (hasUnsavedChanges.value && props.enableLeaveGuard) {
		return await ElMessageBox.confirm(
			'您有未保存的修改，是否确认离开？',
			'未保存提示',
			{
				confirmButtonText: '离开',
				cancelButtonText: '继续编辑',
				type: 'warning',
			}
		).then(() => true).catch(() => false)
	}
	return true
}

// 组件卸载前检查未保存更改
onBeforeUnmount(async () => {
	const canLeave = await checkUnsavedChanges()
	if (!canLeave) {
		console.log('用户选择继续编辑')
	}
})

// 监听editor数据变化，实时同步到designerData
watch(() => props.editor, (newVal) => {
	if (newVal) {
		assignEditorToDesignerData()
	}
}, { deep: true, immediate: true })

// 组件挂载时初始化数据
onMounted(() => {
	assignEditorToDesignerData()
})
</script>

<style>
.app-container {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
