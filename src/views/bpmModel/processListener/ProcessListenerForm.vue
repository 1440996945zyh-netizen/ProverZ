<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:21:51
 * @LastEditTime: 2026-02-03 14:58:34
 * @LastEditors: zhangsd
 * @Description: 流程监听器表单
 * @FilePath: \view\src\views\bpmModel\processListener\ProcessListenerForm.vue
-->
<template>
	<Dialog v-model:visible="dialogVisible" :title="dialogTitle" width="700px">
		<div class="form-container" v-loading="formLoading">
			<el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px" style="padding: 20px">
				<el-form-item label="名字" prop="listenerName">
					<el-input v-model="formData.listenerName" placeholder="请输入名字" />
				</el-form-item>
				<el-form-item label="状态" prop="listenerStatus">
					<el-radio-group v-model="formData.listenerStatus">
						<el-radio v-for="dict in CommonStatusEnumLabel" :key="dict.value" :label="dict.value">
							{{ dict.label }}
						</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="类型" prop="listenerTypeCode">
					<Select
						:selectData="BPM_PROCESS_LISTENER_TYPE"
						v-model:value="formData.listenerTypeCode"
						v-model:label="formData.listenerTypeName"
						placeholder="请选择类型"
					/>
				</el-form-item>
				<el-form-item label="事件" prop="listenerEventCode">
					<Select
						v-model:value="formData.listenerEventCode"
						v-model:label="formData.listenerEventName"
						placeholder="请先选择类型"
						:key="formData.listenerTypeCode"
						:dataConfig="eventSelectConfig"
						:disabled="!formData.listenerTypeCode"	
					/>
				</el-form-item>
				<el-form-item label="值类型" prop="listenerValueTypeCode">
					<Select
						:selectData="BPM_PROCESS_LISTENER_VALUE_TYPE"
						v-model:value="formData.listenerValueTypeCode"
						v-model:label="formData.listenerValueTypeName"
						placeholder="请先选择值类型"
					/>
				</el-form-item>
				<el-form-item :label="formData.listenerValueTypeCode == 'class' ? '类路径' : '表达式'" prop="listenerValue">
					<el-input
						v-model="formData.listenerValue"
						:placeholder="formData.listenerValueTypeCode == 'class' ? '请输入类路径' : '请输入表达式'"
					/>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="submitForm" :loading="formLoading">确 定</el-button>
			</span>
		</template>
	</Dialog>
</template>

<script setup>
defineOptions({ name: 'ProcessListenerForm' })

// 1. 基础依赖导入
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import {
	BPM_PROCESS_LISTENER_TYPE,
	BPM_PROCESS_LISTENER_VALUE_TYPE,
	CommonStatusEnumLabel,
	CommonStatusEnum,
} from '@/utils/bpm/constantEnumeration'
import { ProcessListenerApi } from '@/api/system/bpm/processListener'
import Dialog from '@/components/Dialog/index.vue'
import Select from '@/components/Select/index.vue'
// 2. 组件实例
const { proxy } = getCurrentInstance()
const emit = defineEmits(['success'])

// 3. 响应式数据
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // create 或 update
const formRef = ref(null)

// 动态计算事件下拉框的配置
const eventSelectConfig = computed(() => {
	if (!formData.value.listenerTypeCode) return {}
	// 根据类型映射不同的字典类型
	const dictTypeMap = {
		execution: 'BPM_LISTENER_EXECUTION_EVENT',
		task: 'BPM_LISTENER_TASK_EVENT',
	}
	return {
		params: {
			type: 'DICT',
			dictType: dictTypeMap[formData.value.listenerTypeCode] || '',
		},
	}
})
const formData = ref({
	id: undefined,
	listenerName: undefined,
	listenerStatus: undefined,
	listenerTypeCode: undefined,
	listenerTypeName: undefined,
	listenerEventCode: undefined,
	listenerEventName: undefined,
	listenerValueTypeCode: undefined,
	listenerValueTypeName: undefined,
	listenerValue: undefined,
})

// 4. 表单校验规则
const formRules = reactive({
	listenerName: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
	listenerTypeCode: [{ required: true, message: '类型不能为空', trigger: 'change' }],
	listenerStatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
	listenerEventCode: [{ required: true, message: '监听事件不能为空', trigger: 'blur' }],
	listenerValueTypeCode: [{ required: true, message: '值类型不能为空', trigger: 'change' }],
	listenerValue: [{ required: true, message: '值不能为空', trigger: 'blur' }],
})

/** 打开弹窗 */
const open = async (type, id) => {
	console.log('子组件接收到 open 指令', type, id)
	dialogVisible.value = true
	dialogTitle.value = type === 'create' ? '新增监听器' : '修改监听器'
	formType.value = type
	resetForm()

	if (id) {
		formLoading.value = true
		try {
			const res = await ProcessListenerApi.getProcessListener(id)
			formData.value = res.data || {}
		} catch (error) {
			proxy.$modal.msgError('获取详情失败')
		} finally {
			formLoading.value = false
		}
	}
}

/** 提交表单 */
const submitForm = async () => {
	if (!formRef.value) return

	// 校验表单
	const valid = await formRef.value.validate()
	if (!valid) return

	formLoading.value = true
	try {
		const data = { ...formData.value }
		if (formType.value === 'create') {
			await ProcessListenerApi.insertProcessListener(data)
			proxy.$modal.msgSuccess('新增成功')
		} else {
			await ProcessListenerApi.updateProcessListener(data)
			proxy.$modal.msgSuccess('修改成功')
		}
		dialogVisible.value = false
		emit('success')
	} catch (error) {
		console.error(error)
	} finally {
		formLoading.value = false
	}
}

/** 重置表单 */
const resetForm = () => {
	formData.value = {
		listenerName: undefined,
		listenerStatus: CommonStatusEnum.ENABLE,
		listenerTypeCode: undefined,
		listenerTypeName: undefined,
		listenerEventCode: undefined,
		listenerEventName: undefined,
		listenerValueTypeCode: undefined,
		listenerValueTypeName: undefined,
		listenerValue: undefined,
	}
	nextTick(() => {
		formRef.value?.clearValidate()
	})
}
watch(
	() => formData.value.listenerTypeCode,
	(newVal, oldVal) => {
		if (oldVal !== undefined) {
			// 仅在手动切换时清空，初始化时不触发
			formData.value.listenerEventCode = undefined
			formData.value.listenerEventName = undefined
		}
	}
)

// 暴露给父组件的方法
defineExpose({ open })
</script>

<style lang="scss" scoped>
.form-container {
	max-height: 60vh;
	overflow-y: auto;
}
</style>