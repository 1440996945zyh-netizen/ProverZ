<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" label-width="120px" :rules="rules">
			<el-form-item label="年份" prop="year">
				<el-date-picker
					v-model="formData.year"
					type="year"
					value-format="YYYY"
					format="YYYY"
					placeholder="请选择年份"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="单位" prop="maintenanceUnitId">
				<el-select
					v-model="formData.maintenanceUnitId"
					placeholder="请选择单位"
					clearable
					filterable
					style="width: 100%"
					@change="handleMaintenanceUnitChange"
				>
					<el-option v-for="item in maintenanceUnitOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>

			<el-form-item label="费用类型" prop="costType">
				<el-select v-model="formData.costType" placeholder="请选择费用类型" clearable filterable style="width: 100%">
					<el-option v-for="item in costTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>

			<el-form-item label="预算金额" prop="amount">
				<el-input-number
					v-model="formData.amount"
					:precision="2"
					:min="0"
					:max="999999999.99"
					placeholder="请输入预算金额"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="预警金额" prop="warningAmount">
				<el-input-number
					v-model="formData.warningAmount"
					:precision="2"
					:min="0"
					:max="999999999.99"
					placeholder="请输入预警金额"
					style="width: 100%"
				/>
			</el-form-item>

			<el-form-item label="预警人" prop="warningUserId">
				<el-select
					v-model="formData.warningUserId"
					placeholder="请选择预警人"
					clearable
					filterable
					multiple
					collapse-tags
					collapse-tags-tooltip
					style="width: 100%"
					@change="handleWarningUserChange"
				>
					<el-option v-for="item in warningUserOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup name="costBudgetManagementDetail">
import { ref, reactive, getCurrentInstance, toRefs, onMounted, watch } from 'vue'
import api from '@/api/equipment/costBudgetManagement/index'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance()

const ruleForm = ref()

const data = reactive({
	formData: {
		id: null,
		year: '',
		maintenanceUnitId: null,
		maintenanceUnitName: '',
		costType: '',
		amount: null,
		warningAmount: null,
		warningUserId: [],
		warningUserName: '',
	},
	costTypeOptions: [],
	maintenanceUnitOptions: [],
	warningUserOptions: [],
})

const { formData, costTypeOptions, maintenanceUnitOptions, warningUserOptions } = toRefs(data)

const rules = reactive({
	year: proxy.getRules({ required: true }),
	maintenanceUnitId: proxy.getRules({ required: true }),
	costType: proxy.getRules({ required: true }),
	amount: proxy.getRules({ required: true }),
	warningUserId: proxy.getRules({ required: true }),
	warningAmount: proxy.getRules({ required: true }),
})

const loadCostTypeOptions = async () => {
	try {
		const res = await publicApi.getLocalSelect({ type: 'DICT', dictType: 'EXPENSE_TYPE' })
		if (res.code === '0000' && Array.isArray(res.data)) {
			costTypeOptions.value = res.data.map(item => ({
				label: item.label ?? item.dictLabel ?? item.name ?? '',
				value: item.value ?? item.dictValue ?? item.id ?? '',
			}))
			return
		}
		costTypeOptions.value = []
		proxy.$message.error(res.msg || '加载费用类型失败')
	} catch (error) {
		costTypeOptions.value = []
		console.error('加载费用类型字典失败:', error)
		proxy.$message.error('加载费用类型失败')
	}
}

const loadMaintenanceUnitOptions = async () => {
	try {
		const params = { deptLevel: '1', inOutType: 'I' }
		api.getDeptListByLevel(params).then(res => {
			if (res.code == '0000') {
				maintenanceUnitOptions.value = res.data.map(item => ({
					label: item.deptName,
					value: item.id,
				}))
			}
		})
	} catch (error) {
		maintenanceUnitOptions.value = []
		console.error('加载单位失败:', error)
		proxy.$message.error('加载单位失败')
	}
}

const loadWarningUserOptions = async unitId => {
	if (!unitId) {
		warningUserOptions.value = []
		return
	}
	try {
		const res = await api.getWarningUser({ useCompanyId: unitId, roleCode: 'WARNING' })
		if (res.code === '0000' && Array.isArray(res.data)) {
			warningUserOptions.value = res.data.map(item => ({
				label: item.userName ?? item.label ?? '',
				value: item.userId ?? item.value ?? item.id ?? '',
			}))
			return
		}
		warningUserOptions.value = []
	} catch (error) {
		warningUserOptions.value = []
		console.error('加载预警人员失败:', error)
	}
}

const handleMaintenanceUnitChange = value => {
	const current = maintenanceUnitOptions.value.find(item => String(item.value) === String(value))
	formData.value.maintenanceUnitName = current?.label || ''
	formData.value.warningUserId = []
	formData.value.warningUserName = ''
	loadWarningUserOptions(value)
}

const handleWarningUserChange = values => {
	const names = values
		.map(id => {
			const user = warningUserOptions.value.find(item => String(item.value) === String(id))
			return user?.label || ''
		})
		.filter(Boolean)
	formData.value.warningUserName = names.join(',')
}

const getSubmitData = () => {
	const data = { ...formData.value }
	data.warningUserId = Array.isArray(data.warningUserId) ? data.warningUserId.join(',') : data.warningUserId || ''
	return data
}

const validate = async () => {
	let flag = false
	await ruleForm.value.validate(valid => {
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
	formData.value.year = ''
	formData.value.maintenanceUnitId = null
	formData.value.maintenanceUnitName = ''
	formData.value.costType = ''
	formData.value.amount = null
	formData.value.warningAmount = null
	formData.value.warningUserId = []
	formData.value.warningUserName = ''
	warningUserOptions.value = []
	ruleForm.value?.clearValidate()
}

onMounted(() => {
	loadCostTypeOptions()
	loadMaintenanceUnitOptions()
})

defineExpose({
	validate,
	resetForm,
	formData,
	loadWarningUserOptions,
	getSubmitData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
