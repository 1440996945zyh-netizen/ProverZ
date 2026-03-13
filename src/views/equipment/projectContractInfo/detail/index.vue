<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="150px" :rules="rules">
			<el-form-item label="合同名称" prop="contractName">
				<el-input v-model="formData.contractName" placeholder="请输入合同名称" maxlength="255" />
			</el-form-item>

			<el-form-item label="合同编号" prop="contractCode">
				<el-input v-model="formData.contractCode" placeholder="请输入合同编号" maxlength="255" />
			</el-form-item>

			<el-form-item label="合同金额" prop="contractAmount">
				<el-input v-model="formData.contractAmount" placeholder="请输入合同金额" type="number" />
			</el-form-item>

			<el-form-item label="合同开始日期" prop="startDate">
				<el-date-picker
					v-model="formData.startDate"
					type="date"
					placeholder="请选择开始日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="合同截止日期" prop="endDate">
				<el-date-picker
					v-model="formData.endDate"
					type="date"
					placeholder="请选择结束日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="适用范围" prop="applyScope">
				<el-input v-model="formData.applyScope" type="textarea" :rows="3" placeholder="请输入适用范围" maxlength="255" />
			</el-form-item>

			<el-form-item label="合同状态" prop="status">
				<el-radio-group v-model="formData.status">
					<el-radio label="1">有效</el-radio>
					<el-radio label="2">无效</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="projectContractInfoDetail">
import { ref, reactive, watch, getCurrentInstance, toRefs, onMounted } from 'vue'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		contractName: '',
		contractCode: '',
		contractAmount: null,
		startDate: null,
		endDate: null,
		applyScope: '',
		status: '1',
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	contractName: proxy.getRules({ required: true }),
	contractCode: proxy.getRules({ required: true }),
	contractAmount: proxy.getRules({ required: true }),
	startDate: proxy.getRules({ required: true }),
	endDate: proxy.getRules({ required: true }),
	applyScope: proxy.getRules({ required: true }),
	status: proxy.getRules({ required: true }),
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

const reset = () => {
	formData.value.id = null
	formData.value.contractName = ''
	formData.value.contractCode = ''
	formData.value.contractAmount = null
	formData.value.startDate = null
	formData.value.endDate = null
	formData.value.applyScope = ''
	formData.value.status = '1'
	ruleForm.value.resetFields()
}

const setForm = row => {
	formData.value.id = row.id
	formData.value.contractName = row.contractName
	formData.value.contractCode = row.contractCode
	formData.value.contractAmount = row.contractAmount
	formData.value.startDate = row.startDate
	formData.value.endDate = row.endDate
	formData.value.applyScope = row.applyScope
	formData.value.status = row.status
}

defineExpose({
	reset,
	setForm,
	validate,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
