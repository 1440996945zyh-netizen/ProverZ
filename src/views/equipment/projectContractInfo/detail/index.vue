<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules" :disabled="isViewMode">
			<el-form-item label="所属单位" prop="useCompanyId">
				<el-select
					v-model="formData.useCompanyId"
					placeholder="请选择所属单位"
					clearable
					filterable
					:disabled="isViewMode || belongDeptDisabled"
					@change="handleBelongDeptChange"
					style="width: 100%"
				>
					<el-option v-for="item in belongDeptOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>

			<el-form-item label="合同名称" prop="contractName">
				<el-input v-model="formData.contractName" placeholder="请输入合同名称" maxlength="255" :disabled="isViewMode" />
			</el-form-item>

			<el-form-item label="合同编号" prop="contractCode">
				<el-input v-model="formData.contractCode" placeholder="请输入合同编号" maxlength="255" :disabled="isViewMode" />
			</el-form-item>
			<el-form-item label="维修单位" prop="externalCompanyId">
				<Select
					:selectData="maintenanceUnitOptions"
					v-model:value="formData.externalCompanyId"
					v-model:label="formData.unitName"
					placeholder="请选择维修单位"
					:disabled="isViewMode"
				/>
			</el-form-item>
			<el-form-item label="合同类型" prop="contractType">
				<Select
					:dataConfig="{ params: { type: 'DICT', dictType: 'CONTRACT_TYPE' } }"
					v-model:value="formData.contractType"
					v-model:label="formData.contractTypeLabel"
					:disabled="isViewMode"
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
import api from '@/api/equipment/projectContractInfo/index'
import budgetApi from '@/api/equipment/costBudgetManagement/index'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()

const props = defineProps({
	isViewMode: {
		type: Boolean,
		default: false,
	},
})

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const contractTypeOptions = ref([])
const belongDeptOptions = ref([])
const belongDeptDisabled = ref(false)

const data = reactive({
	formData: {
		id: null,
		useCompanyId: null,
		useCompanyName: '',
		contractName: '',
		contractCode: '',
		contractAmount: null,
		startDate: null,
		endDate: null,
		applyScope: '',
		status: '1',
		contractType: '',
		contractTypeLabel: '',
		externalCompanyId: null,
		unitName: '',
	},
})
const { formData } = toRefs(data)

const rules = reactive({
	useCompanyId: proxy.getRules({ required: true }),
	contractName: proxy.getRules({ required: true }),
	contractCode: proxy.getRules({ required: true }),
	contractType: proxy.getRules({ required: true }),
	contractAmount: proxy.getRules({ required: true }),
	startDate: proxy.getRules({ required: true }),
	endDate: proxy.getRules({ required: true }),
	applyScope: proxy.getRules({ required: true }),
	externalCompanyId: proxy.getRules({ required: true }),
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
	formData.value.useCompanyId = null
	formData.value.useCompanyName = ''
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
	belongDeptDisabled.value = false
	const userDeptId = userStore.deptId
	if (userDeptId && belongDeptOptions.value.length > 0) {
		const matched = belongDeptOptions.value.find(item => String(item.value) === String(userDeptId))
		if (matched) {
			formData.value.useCompanyId = matched.value
			formData.value.useCompanyName = matched.label
			belongDeptDisabled.value = true
		}
	}
}

const maintenanceUnitOptions = ref([])
const getMaintenanceUnitList = () => {
	api.queryUnitName({}).then(res => {
		if (res.code === '0000') {
			maintenanceUnitOptions.value = res.data.map(item => ({
				label: item.unitName,
				value: item.externalCompanyId,
			}))
		}
	})
}

const getBelongDeptList = async () => {
	try {
		const res = await budgetApi.getDeptListByLevel({ deptLevel: '1', inOutType: 'I' })
		if (res.code === '0000' && Array.isArray(res.data)) {
			belongDeptOptions.value = res.data.map(item => ({
				label: item.deptName,
				value: item.id,
			}))
			const userDeptId = userStore.deptId
			if (userDeptId) {
				const matched = belongDeptOptions.value.find(item => String(item.value) === String(userDeptId))
				if (matched) {
					formData.value.useCompanyId = matched.value
					formData.value.useCompanyName = matched.label
					belongDeptDisabled.value = true
				}
			}
		}
	} catch (error) {
		console.error('加载所属单位失败:', error)
	}
}

const handleBelongDeptChange = value => {
	const current = belongDeptOptions.value.find(item => String(item.value) === String(value))
	formData.value.useCompanyName = current?.label || ''
}

onMounted(() => {
	getBelongDeptList()
	getMaintenanceUnitList()
})

defineExpose({
	validate,
	resetForm,
	formData,
})
</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
