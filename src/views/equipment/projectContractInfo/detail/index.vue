<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules" :disabled="isViewMode">
			<el-form-item label="合同名称" prop="contractName">
				<el-input v-model="formData.contractName" placeholder="请输入合同名称" maxlength="255" :disabled="isViewMode" />
			</el-form-item>

			<el-form-item label="合同编号" prop="contractCode">
				<el-input v-model="formData.contractCode" placeholder="请输入合同编号" maxlength="255" :disabled="isViewMode" />
			</el-form-item>

			<el-form-item label="合同类型" prop="contractType">
				<Select
					:dataConfig="{ params: { type: 'DICT', dictType: 'CONTRACT_TYPE' } }"
					v-model:value="formData.contractType"
					v-model:label="formData.contractTypeLabel"
				/>
			</el-form-item>

			<el-form-item label="合同金额" prop="contractAmount">
				<el-input v-model="formData.contractAmount" placeholder="请输入合同金额" type="number" :disabled="isViewMode" />
			</el-form-item>

			<el-form-item label="合同开始日期" prop="startDate">
				<el-date-picker
					v-model="formData.startDate"
					type="date"
					placeholder="请选择开始日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
					:disabled="isViewMode"
				/>
			</el-form-item>

			<el-form-item label="合同截止日期" prop="endDate">
				<el-date-picker
					v-model="formData.endDate"
					type="date"
					placeholder="请选择结束日期"
					value-format="YYYY-MM-DD"
					style="width: 100%"
					:disabled="isViewMode"
				/>
			</el-form-item>

			<el-form-item label="适用范围" prop="applyScope">
				<el-input
					v-model="formData.applyScope"
					type="textarea"
					:rows="3"
					placeholder="请输入适用范围"
					maxlength="255"
					:disabled="isViewMode"
				/>
			</el-form-item>

			<el-form-item label="合同状态" prop="status">
				<el-radio-group v-model="formData.status" :disabled="isViewMode">
					<el-radio label="1">有效</el-radio>
					<el-radio label="2">无效</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="projectContractInfoDetail">
import { ref, reactive, getCurrentInstance, toRefs, onMounted } from 'vue'
import Select from '@/components/Select'

const props = defineProps({
	isViewMode: {
		type: Boolean,
		default: false,
	},
})

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const contractTypeOptions = ref([])

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
		contractType: '',
		contractTypeLabel: '',
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	contractName: proxy.getRules({ required: true }),
	contractCode: proxy.getRules({ required: true }),
	contractType: proxy.getRules({ required: true }),
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

const resetForm = () => {
	formData.value.id = null
	formData.value.contractName = ''
	formData.value.contractCode = ''
	formData.value.contractType = ''
	formData.value.contractTypeLabel = ''
	formData.value.contractAmount = null
	formData.value.startDate = null
	formData.value.endDate = null
	formData.value.applyScope = ''
	formData.value.status = '1'
	ruleForm.value?.clearValidate()
}

onMounted(() => {})

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
