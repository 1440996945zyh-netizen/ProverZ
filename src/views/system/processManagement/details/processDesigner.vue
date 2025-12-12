<!--
 * @Author: zhangsd
 * @Date: 2025-09-16 16:59:36
 * @LastEditTime: 2025-12-12 10:10:42
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
import publicApi from '@/api/public'
import flowableApi from '@/api/system/processManagement'
// 接收父组件传递的参数
const props = defineProps({
	editor: {
		type: Object,
		default: () => ({}),
		required: false,
	},
	enableLeaveGuard: {
		type: Boolean,
		default: true,
	},
})

// 组件内部状态
const designerOpen = ref(false)
const modelDesigner = ref(null)
const hasUnsavedChanges = ref(false)
const initialXml = ref('')
const users = ref([])
const groups = ref([]) // 若有加载逻辑，后续可补充到initDesignerData
const categorys = ref([])
const xmlFrame = ref({ width: '' })
const emit = defineEmits(['save'])
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
	processId: '',
	deploymentId: '',
	description: '',
	category: '',
})

// 将editor数据赋值给designerData（依赖初始化完成的数据）
const assignEditorToDesignerData = () => {
	designerOpen.value = true
	console.log('开始执行assignEditorToDesignerData =>')

	// 1. 初始化表单基础数据（使用已加载的users、groups、categorys）
	designerData.form = {
		users: users.value,
		groups: groups.value,
		categorys: categorys.value,
		processName: null,
		processKey: null,
	}

	// 2. 通过editor是否有值判断新增/编辑
	if (props.editor && Object.keys(props.editor).length > 0) {
				designerData.bpmnXml = props.editor.bpmnXml || '' // 核心：加载已有XML
		designerData.title = `编辑流程图 - ${props.editor.name || ''}`
		designerData.processId = props.editor.id || ''
		designerData.deploymentId = props.editor.deploymentId || ''
		designerData.category = props.editor.category || ''
		// 补充流程名称/Key
		designerData.form.processName = props.editor.name || ''
		designerData.form.processKey = props.editor.key || ''
		// 标记初始XML（用于对比是否修改）
		initialXml.value = designerData.bpmnXml
		hasUnsavedChanges.value = false
	} else {
		// 新增状态：重置数据
		designerData.bpmnXml = ''
		designerData.title = '新增流程图'
		designerData.processId = ''
		designerData.deploymentId = ''
		designerData.description = ''
		// designerData.category = ''
		designerData.loading = false

		initialXml.value = ''
		hasUnsavedChanges.value = false
	}

	// 设置宽度
	xmlFrame.value.width = '90%'
	console.log('designerData初始化完成 =>', designerData)
}

// 初始化数据（返回Promise，确保所有异步请求完成）
const initDesignerData = () => {
	// 封装获取用户的请求为Promise
	const getUserPromise = publicApi
		.getLocalSelect({
			type: 'USER',
			types: 'roles',
		})
		.then(res => {
			if (res.code === '0000') {
				users.value = res.data || []
			} else {
				ElMessage.warning('用户数据加载失败')
				users.value = []
			}
		})
		.catch(err => {
			console.error('用户数据请求失败:', err)
			users.value = []
		})

	// 封装获取流程类型的请求为Promise
	const getCategoryPromise = publicApi
		.getLocalSelect({
			type: 'DICT',
			dictType: 'PROCESS_TYPE',
		})
		.then(res => {
			if (res.code === '0000') {
				categorys.value = res.data || []
				console.log('流程类型数据加载完成:', res.data)
			} else {
				ElMessage.warning('流程类型数据加载失败')
				categorys.value = []
			}
		})
		.catch(err => {
			console.error('流程类型数据请求失败:', err)
			categorys.value = []
		})

	// 等待所有异步请求完成后返回
	return Promise.all([getUserPromise, getCategoryPromise])
}

// 监听编辑事件 - 元素变更
const handleElementChanged = element => {
	console.log('元素发生变更:', element)
	hasUnsavedChanges.value = true
}

// 监听编辑事件 - XML变更
const handleXmlChanged = xml => {
	console.log('XML发生变更')
	designerData.bpmnXml = xml
	hasUnsavedChanges.value = true
}

// 保存流程设计
const save = async data => {
	if (!data || !data.xml) {
		ElMessage.warning('流程XML不能为空')
		return
	}
	designerData.loading = true
	console.log('designerData =>', designerData)
	ElMessageBox.confirm('是否保存当前流程？', '提示', {
		confirmButtonText: '保存',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			try {
				const saveData = {
					processId: designerData.processId,
					deploymentId: designerData.deploymentId,// 编辑时传递部署ID
					//xml: 对应流程XML
					xml: data.xml,
					// name: 对应流程名称
					name: data?.process?.name || '默认流程名称',
					description: designerData.description,
					// category: 对应流程类型
					category: data?.process?.category,
					processCategory: data?.process?.category,
				}

				const res = await flowableApi.doSaveFlowable(saveData)

				if (res.code === '0000') {
					designerData.bpmnXml = saveData.bpmnXml
					designerData.processId = saveData.processId
					designerData.deploymentId = saveData.deploymentId
					designerData.title = saveData.title
					designerData.description = saveData.description     
					designerData.category = saveData.category

					// 更新表单数据
					designerData.form.processName = saveData.processName
					designerData.form.processKey = saveData.processKey
					// 重置未保存状态
					initialXml.value = designerData.bpmnXml
					hasUnsavedChanges.value = false
							// 刷新父组件列表（通过父组件重新调用getList）
			emit('save', res.data)
				} else {
					ElMessage.error('保存失败: ' + (res.msg || '未知错误'))
				}
			} catch (error) {
				console.error('保存过程出错:', error)
				ElMessage.error('保存过程发生错误')
			} finally {
				designerData.loading = false
			}
		})
		.catch(() => {
			designerData.loading = false
			ElMessage.info('已取消保存')
		})
}

// 检测未保存更改
const checkUnsavedChanges = async () => {
	if (hasUnsavedChanges.value && props.enableLeaveGuard) {
		return await ElMessageBox.confirm('您有未保存的修改，是否确认离开？', '未保存提示', {
			confirmButtonText: '离开',
			cancelButtonText: '继续编辑',
			type: 'warning',
		})
			.then(() => true)
			.catch(() => false)
	}
	return true
}

// 组件卸载前检查
onBeforeUnmount(async () => {
	const canLeave = await checkUnsavedChanges()
	if (!canLeave) {
		console.log('用户选择继续编辑')
	}
})

// 监听editor变化：先初始化数据，完成后再同步到designerData
watch(
	() => props.editor,
	async newVal => {
		console.log('editor发生变化，开始初始化数据...')
		// 等待初始化完成后再执行赋值
		await initDesignerData()
		assignEditorToDesignerData()
	},
	{ deep: true, immediate: true }
)

// 组件挂载时：初始化数据并执行赋值
onMounted(async () => {
	console.log('组件挂载，初始化数据...')
	await initDesignerData()
	assignEditorToDesignerData()
})

// 补充：假设存在的加载图片方法（如果需要）
const handleReadImage = async deploymentId => {
	console.log('加载图片，deploymentId:', deploymentId)
	try {
		const res = await flowableApi.readFlowableXml(deploymentId)
		if (res.code == '0000') {
			designerData.bpmnXml = res.data
			designerData.loading = false
		} else {
			ElMessage.error('获取流程图失败')
			return
		}
	} catch (error) {
		console.error('获取流程图失败:', error)
		ElMessage.error('获取流程图失败，请重试')
	}
}
</script>

<style lang="scss" scoped>
.app-container {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>