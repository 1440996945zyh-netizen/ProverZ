<!--
 * @Author: zhangsd
 * @Date: 2026-02-02 16:21:51
 * @LastEditTime: 2026-02-02 17:50:46
 * @LastEditors: zhangsd
 * @Description: 流程监听器表单
 * @FilePath: \view\src\views\bpmModel\processListener\ProcessListenerForm.vue
-->
<template>
	<Dialog v-model:visible="dialogVisible" :title="dialogTitle" width="600px">
		<div class="form-container" v-loading="formLoading">
			<el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px" style="padding: 20px">
				<el-form-item label="名字" prop="name">
					<el-input v-model="formData.name" placeholder="请输入名字" />
				</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="formData.status">
						<el-radio v-for="dict in CommonStatusEnumLabel" :key="dict.value" :label="dict.value">
							{{ dict.label }}
						</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="类型" prop="type">
					<el-select v-model="formData.type" placeholder="请选择类型" @change="formData.event = undefined" style="width: 100%">
						<el-option
							v-for="dict in BPM_PROCESS_LISTENER_TYPE"
							:key="dict.value"
							:label="dict.label"
							:value="dict.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="事件" prop="event">
					<el-select v-model="formData.event" placeholder="请选择事件" style="width: 100%">
						<el-option
							v-for="event in formData.type == 'execution'
								? ['start', 'end', 'take']
								: ['create', 'assignment', 'complete', 'delete', 'update', 'timeout']"
							:label="event"
							:value="event"
							:key="event"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="值类型" prop="valueType">
					<el-select v-model="formData.valueType" placeholder="请选择值类型" style="width: 100%">
						<el-option
							v-for="dict in BPM_PROCESS_LISTENER_VALUE_TYPE"
							:key="dict.value"
							:label="dict.label"
							:value="dict.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item :label="formData.valueType == 'class' ? '类路径' : '表达式'" prop="value">
					<el-input v-model="formData.value" :placeholder="formData.valueType == 'class' ? '请输入类路径' : '请输入表达式'" />
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
import { BPM_PROCESS_LISTENER_TYPE, BPM_PROCESS_LISTENER_VALUE_TYPE, CommonStatusEnumLabel,CommonStatusEnum } from '@/utils/bpm/constantEnumeration'
import { ProcessListenerApi } from '@/api/system/bpm/processListener'
import Dialog from '@/components/Dialog/index.vue'
// 2. 组件实例
const { proxy } = getCurrentInstance()
const emit = defineEmits(['success'])

// 3. 响应式数据
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // create 或 update
const formRef = ref(null)

const formData = ref({
	id: undefined,
	name: undefined,
	type: undefined,
	status: undefined,
	event: undefined,
	valueType: undefined,
	value: undefined,
})

// 4. 表单校验规则
const formRules = reactive({
	name: [{ required: true, message: '名字不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
	status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
	event: [{ required: true, message: '监听事件不能为空', trigger: 'blur' }],
	valueType: [{ required: true, message: '值类型不能为空', trigger: 'change' }],
	value: [{ required: true, message: '值不能为空', trigger: 'blur' }],
})

/** 打开弹窗 */
const open = async (type, id) => {
      console.log("子组件接收到 open 指令", type, id)
    dialogVisible.value = true
    dialogTitle.value = type === 'create' ? '新增监听器' : '修改监听器'
    formType.value = type
    resetForm()
    
	// if (id) {
	// 	formLoading.value = true
	// 	try {
	// 		const res = await ProcessListenerApi.getProcessListener(id)
	// 		formData.value = res
	// 	} catch (error) {
	// 		proxy.$modal.msgError('获取详情失败')
	// 	} finally {
	// 		formLoading.value = false
	// 	}
	// }
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
			await ProcessListenerApi.createProcessListener(data)
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
		id: undefined,
		name: undefined,
		type: 'execution', // 默认执行监听器
		status: CommonStatusEnum.ENABLE,
		event: undefined,
		valueType: 'class', // 默认类
		value: undefined,
	}
	nextTick(() => {
		formRef.value?.clearValidate()
	})
}

// 暴露给父组件的方法
defineExpose({ open })
</script>

<style lang="scss" scoped>
.form-container {
	max-height: 60vh;
	overflow-y: auto;
}
</style>