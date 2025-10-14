<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="120px">
		<!-- 基本信息 -->
		<el-row :gutter="20" style="margin-left: 0px">
			<el-col :span="24">
				<el-form-item prop="jobName" label="任务名称">
					<el-input v-model="formData.jobName" placeholder="请输入任务名称" disabled />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="任务分组" prop="jobGroup">
					<el-input v-model="formData.jobGroup" placeholder="请输入任务分组" disabled />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="Cron表达式" prop="cronExpression">
					<template #label>
						<span>
							<el-tooltip content="合法的Cron表达式，例如(每天十点执行)：0 0 10 * * ?" placement="top">
								<el-icon><question-filled /></el-icon>
							</el-tooltip>
							Cron表达式
						</span>
					</template>
					<el-input v-model="formData.cronExpression" placeholder="填写正确的Cron表达式" />
				</el-form-item>
			</el-col>
		</el-row>
	</el-form>
</template>

<script setup>
import { reactive, ref, getCurrentInstance } from 'vue'
import Select from '@/components/Select'

const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const formData = reactive({
	id: null,
	jobName: '',
	jobGroup: '',
	requestType: '',
	httpUrl: '',
	httpParams: '',
	cronExpression: '',
	description: '',
})
const resetForm = () => {
	proxy.clearObjectValues(formData)
	ruleForm.value.clearValidate()
}
// 验证
const rules = reactive({
	jobName: proxy.getRules({
		required: true,
	}),
	jobGroup: proxy.getRules({
		required: true,
	}),
	cronExpression: proxy.getRules({
		required: true,
	}),
})
const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$modal.msgWarning('请完善表单信息！')
		}
	})
	return flag
}
defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped></style>
