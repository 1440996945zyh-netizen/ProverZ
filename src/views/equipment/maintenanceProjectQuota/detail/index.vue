<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules">
			<el-form-item label="定额编号" prop="quotaNo">
				<el-input v-model="formData.quotaNo" placeholder="系统自动生成" disabled />
			</el-form-item>

			<el-form-item label="维修项目名称" prop="projectName">
				<el-input v-model="formData.projectName" placeholder="请输入维修项目名称" maxlength="200" />
			</el-form-item>

			<el-form-item label="维修项目内容" prop="projectContent">
				<el-input v-model="formData.projectContent" type="textarea" :rows="4" placeholder="请输入维修项目内容" maxlength="1000" />
			</el-form-item>

			<el-form-item label="计量单位" prop="unit">
				<el-input v-model="formData.unit" placeholder="请输入计量单位" maxlength="50" />
			</el-form-item>

			<el-form-item label="不含税金额" prop="amount">
				<el-input-number v-model="formData.amount" :precision="2" :min="0" :max="999999999.99" placeholder="请输入不含税金额" style="width: 100%" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="maintenanceProjectQuotaDetail">
import { ref, reactive, getCurrentInstance, toRefs } from 'vue'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		quotaNo: '',
		projectName: '',
		projectContent: '',
		unit: '',
		amount: null,
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	projectName: proxy.getRules({ required: true }),
	projectContent: proxy.getRules({ required: true }),
	unit: proxy.getRules({ required: true }),
	amount: proxy.getRules({ required: true }),
})

const validate = async () => {
	let flag = false
	await ruleForm.value.validate((valid, fields) => {
		if (valid) {
			flag = true
		} else {
			flag = false
			proxy.$message.warning('请完善表单信息！')
		}
	})
	return flag
}

const resetForm = () => {
	formData.value.id = null
	formData.value.quotaNo = ''
	formData.value.projectName = ''
	formData.value.projectContent = ''
	formData.value.unit = ''
	formData.value.amount = null
	ruleForm.value?.clearValidate()
}

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>