<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="100px">
		<!-- 基本信息 -->
		<el-row :gutter="20" style="margin-left: 0px">
			<el-col :span="20">
				<el-form-item prop="jobName" label="任务名称">
					<el-input v-model="formData.jobName" placeholder="请输入任务名称" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="任务分组" prop="jobGroup">
					<el-input v-model="formData.jobGroup" placeholder="请输入任务分组" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求类型" prop="requestType">
					<Select
						v-model:value="formData.requestType"
						:selectData="[
							{
								value: 'POST_JSON',
								label: 'POST_JSON',
							},
							{
								value: 'POST_FORM_DATA',
								label: 'POST_FORM_DATA',
							},
							{
								value: 'GET',
								label: 'GET',
							},
						]"
						placeholder="请选择请求类型"
					/>
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求URL" prop="httpUrl">
					<el-input v-model="formData.httpUrl" placeholder="请输入请求URL" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求参数" prop="httpParams">
					<el-input v-model="formData.httpParams" placeholder="请输入请求参数" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="Cron表达式" prop="cronExpression">
					<el-input v-model="formData.cronExpression" placeholder="填写正确的Cron表达式" />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="任务描述" prop="description">
					<el-input
						v-model="formData.description"
						type="textarea"
						placeholder="请输入任务描述"
						:autosize="{ minRows: 2, maxRows: 4 }"
					></el-input>
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
	requestType: proxy.getRules({
		required: true,
	}),
	httpUrl: proxy.getRules({
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
