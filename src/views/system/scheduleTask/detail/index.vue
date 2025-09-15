<template>
	<el-form ref="ruleForm" :model="formData" :rules="rules" label-width="100px">
		<!-- 基本信息 -->
		<el-row :gutter="20" style="margin-left: 0px">
			<el-col :span="20">
				<el-form-item prop="name" label="任务名称">
					<el-input v-model="formData.name" placeholder="请输入任务名称" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="任务分组" prop="group">
					<el-input v-model="formData.group" placeholder="请输入任务分组" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求类型" prop="type">
					<el-input v-model="formData.type" placeholder="请输入角色类别" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求URL" prop="url">
					<el-input v-model="formData.url" placeholder="请输入请求URL" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="请求参数" prop="params">
					<el-input v-model="formData.params" placeholder="请输入请求参数" />
				</el-form-item>
			</el-col>
			<el-col :span="20">
				<el-form-item label="Cron表达式" prop="cron">
					<el-input v-model="formData.cron" placeholder="填写正确的Cron表达式" />
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item label="任务描述" prop="remark">
					<el-input
						v-model="formData.remark"
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

const { proxy } = getCurrentInstance()
const ruleForm = ref(null)
const formData = reactive({
	id: null,
	name: '',
	group: '',
	type: '',
	url: '',
	params: '',
	cron: '',
	remark: '',
})
const resetForm = () => {
	proxy.clearObjectValues(formData)
	ruleForm.value.clearValidate()
}
// 验证
const rules = reactive({
	name: proxy.getRules({
		required: true,
	}),
	group: proxy.getRules({
		required: true,
	}),
	type: proxy.getRules({
		required: true,
	}),
	url: proxy.getRules({
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
