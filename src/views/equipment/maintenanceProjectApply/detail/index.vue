<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" label-position="top">
			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="申请单号" prop="appNumber">
						<el-input v-model="formData.appNumber" placeholder="系统自动生成" disabled />
					</el-form-item>
				</el-col>
				<!-- <el-col :span="6">
					<el-form-item label="使用部门" prop="usingDeptName">
						<el-input v-model="formData.usingDeptName" placeholder="请输入使用部门" maxlength="200" />
					</el-form-item>
				</el-col> -->

				<el-col :span="6">
					<el-form-item label="设备名称" prop="equipName">
						<Select
							:dataConfig="{ params: { type: 'EQUIPMENT' } }"
							v-model:value="formData.equipId"
							v-model:label="formData.equipName"
							placeholder="请选择设备（可搜索）"
							@change="handleEquipmentChange"
						/>
					</el-form-item>
				</el-col>
				<!-- <el-col :span="6">
					<el-form-item label="设备类型" prop="equipTypeId">
						<el-select v-model="formData.equipTypeId" placeholder="请选择设备类型" style="width: 100%">
							<el-option v-for="item in equipmentTypeOptions" :key="item.id" :label="item.name" :value="item.id" />
						</el-select>
					</el-form-item>
				</el-col> -->
				<el-col :span="6">
					<el-form-item label="维修项目类型" prop="appType">
						<el-radio-group v-model="formData.appType" @change="handleProjectTypeChange">
							<el-radio v-for="item in projectTypeOptions" :key="item.id" :label="item.id">
								{{ item.name }}
							</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="预算金额" prop="budgetAmount">
						<el-input-number
							v-model="formData.budgetAmount"
							:precision="2"
							:min="0"
							:disabled="isQuotaProject"
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
			</el-row>

			<!-- <el-row :gutter="20"></el-row> -->

			<!-- 维修项目定额表 -->
			<el-form-item v-if="isQuotaProject" label="维修项目定额表">
				<el-button type="primary" @click="openQuotaDialog" style="margin-bottom: 10px">选择维修项目定额</el-button>
				<el-table :data="quotaTableData" border style="width: 100%">
					<el-table-column prop="quotaNo" label="定额编号" width="180" />
					<el-table-column prop="projName" label="维修项目名称" width="200" />
					<el-table-column prop="projContent" label="维修项目内容" min-width="200" show-overflow-tooltip />
					<el-table-column prop="unit" label="计量单位" width="120" />
					<el-table-column prop="unitPrice" label="不含税金额" width="150" align="right"></el-table-column>
					<el-table-column prop="taxRate" label="税率(%)" width="150">
						<template #default="scope">
							<el-select
								v-model="scope.row.taxRate"
								placeholder="请选择税率"
								style="width: 100%"
								@change="handleTaxRateChange(scope.row)"
							>
								<el-option v-for="item in taxRateOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="taxAmount" label="含税金额" width="150" align="right"></el-table-column>
					<el-table-column label="操作" width="120">
						<template #default="scope">
							<el-button type="text" @click="deleteRow(scope.$index)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-form-item>
			<el-form-item label="申请事项" prop="appContent">
				<el-input v-model="formData.appContent" type="textarea" :rows="4" placeholder="请输入申请事项" maxlength="1000" />
			</el-form-item>
		</el-form>

		<!-- 维修项目定额选择对话框 -->
		<Dialog v-model:visible="quotaDialogVisible" title="选择维修项目定额" width="70%">
			<BaseTable
				ref="quotaTableRef"
				:showSearchHeader="true"
				:selectData="quotaSelectData"
				:searchClick="getQuotaList"
				:tableColumns="quotaTableColumns"
				:tableData="quotaList"
				:loading="quotaLoading"
				:checkbox-config="quotaCheckboxConfig"
				@checkboxChange="quotaCheckboxChange"
			/>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="quotaDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmQuotaSelection">确定</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="maintenanceProjectApplyDetail">
import { ref, reactive, getCurrentInstance, toRefs, watch } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import Select from '@/components/Select/index.vue'

const { proxy } = getCurrentInstance()

const ruleForm = ref()
const data = reactive({
	formData: {
		id: null,
		usingDeptId: '',
		usingDeptName: '',
		equipTypeId: '',
		equipId: '',
		equipName: '',
		appNumber: '',
		appType: '',
		appContent: '',
		maintenanceUnitId: '',
		maintenanceUnitName: '',
		budgetAmount: 0,
		remark: '',
	},
})
const { formData } = toRefs(data)

// 下拉选项（实际项目中应从接口获取）
const equipmentTypeOptions = ref([
	{ id: 1, name: '设备类型1' },
	{ id: 2, name: '设备类型2' },
	{ id: 3, name: '设备类型3' },
])

const equipmentNameOptions = ref([
	{ id: 1, name: '设备名称1' },
	{ id: 2, name: '设备名称2' },
	{ id: 3, name: '设备名称3' },
])

const projectTypeOptions = ref([
	{ id: 1, name: '定额' },
	{ id: 2, name: '非定额' },
])

const isQuotaProject = ref(false)

// 税率选项（从字典获取）
const taxRateOptions = ref([
	{ label: '0%', value: 0 },
	{ label: '3%', value: 3 },
	{ label: '6%', value: 6 },
	{ label: '9%', value: 9 },
	{ label: '13%', value: 13 },
])

// 维修项目定额表数据
const quotaTableData = ref([])

// 定额选择对话框相关
const quotaDialogVisible = ref(false)
const quotaTableRef = ref()
const quotaList = ref([])
const quotaLoading = ref(false)
const quotaTotal = ref(0)
const selectedQuotas = ref([])

// 定额表格列配置
const quotaTableColumns = ref([
	{ label: '', type: 'checkbox', width: 50 },

	{ label: '定额编号', prop: 'quotaNo', align: 'center', width: 180 },
	{ label: '维修项目名称', prop: 'projName', align: 'left', width: 200, showOverFlow: true },
	{ label: '维修项目内容', prop: 'projContent', align: 'left', minWidth: 300, showOverFlow: true },
	{ label: '计量单位', prop: 'unit', align: 'center', width: 100 },
	{
		label: '不含税金额',
		prop: 'unitPrice',
		align: 'right',
		width: 120,
		render: row => {
			return row.unitPrice ? row.unitPrice.toFixed(2) : '0.00'
		},
	},
])

// 定额搜索条件
const quotaSelectData = reactive([
	{
		name: '维修项目名称',
		type: 'input',
		modelValue: 'projName',
		span: 12,
	},
	{
		name: '定额编号',
		type: 'input',
		modelValue: 'quotaNo',
		span: 12,
	},
])

// 复选框配置
const quotaCheckboxConfig = {
	highlight: true,
	strict: false,
	reserve: false,
	showHeader: true,
}

// 打开定额选择对话框
const openQuotaDialog = () => {
	quotaDialogVisible.value = true
	getQuotaList({ startPage: 1, pageSize: 20 })
}

// 获取定额列表
const getQuotaList = params => {
	quotaLoading.value = true
	const queryParams = {
		...params,
		projName: params.projName,
		quotaNo: params.quotaNo,
	}
	// 这里需要调用实际的API接口
	// api.getQuotaList(queryParams).then(res => {
	// 	quotaList.value = res.data.pages
	// 	quotaTotal.value = res.data.totalNum
	// }).finally(() => {
	// 	quotaLoading.value = false
	// })

	// 模拟数据
	setTimeout(() => {
		quotaList.value = [
			{ id: 1, quotaNo: 'QT001', projName: '维修项目1', projContent: '维修项目内容1', unit: '个', unitPrice: 100 },
			{ id: 2, quotaNo: 'QT002', projName: '维修项目2', projContent: '维修项目内容2', unit: '台', unitPrice: 200 },
			{ id: 3, quotaNo: 'QT003', projName: '维修项目3', projContent: '维修项目内容3', unit: '套', unitPrice: 300 },
		]
		quotaTotal.value = 3
		quotaLoading.value = false
	}, 500)
}

// 复选框变化事件
const quotaCheckboxChange = data => {
	console.log(data, 'data')
	selectedQuotas.value = data || []
}

// 确认选择定额
const confirmQuotaSelection = () => {
	if (selectedQuotas.value.length === 0) {
		proxy.$message.warning('请选择维修项目定额')
		return
	}

	selectedQuotas.value.forEach(quota => {
		const existingIndex = quotaTableData.value.findIndex(item => item.quotaId === quota.id)
		if (existingIndex === -1) {
			quotaTableData.value.push({
				quotaId: quota.id,
				quotaNo: quota.quotaNo,
				projName: quota.projName,
				projContent: quota.projContent,
				unit: quota.unit,
				unitPrice: quota.unitPrice,
				taxRate: 0,
				taxAmount: quota.unitPrice,
			})
		}
	})

	calculateBudgetAmount()
	quotaDialogVisible.value = false
}

// 计算含税金额
const calculateTaxAmount = row => {
	if (row.unitPrice && row.taxRate !== undefined) {
		const taxRate = row.taxRate / 100
		row.taxAmount = row.unitPrice * (1 + taxRate)
	} else {
		row.taxAmount = row.unitPrice || 0
	}
}

// 计算预算金额
const calculateBudgetAmount = () => {
	formData.value.budgetAmount = quotaTableData.value.reduce((sum, row) => {
		return sum + (row.taxAmount || 0)
	}, 0)
}

// 价格变化处理
const handlePriceChange = row => {
	calculateTaxAmount(row)
	calculateBudgetAmount()
}

// 税率变化处理
const handleTaxRateChange = row => {
	calculateTaxAmount(row)
	calculateBudgetAmount()
}

// 维修项目类型变化时处理
const handleProjectTypeChange = value => {
	isQuotaProject.value = value === 1
	if (!isQuotaProject.value) {
		quotaTableData.value = []
		formData.value.budgetAmount = 0
	}
}

// 删除行
const deleteRow = index => {
	quotaTableData.value.splice(index, 1)
	calculateBudgetAmount()
}

const rules = reactive({
	usingDeptName: proxy.getRules({ required: true }),
	equipTypeId: proxy.getRules({ required: true }),
	equipName: proxy.getRules({ required: true }),
	appType: proxy.getRules({ required: true }),
	appContent: proxy.getRules({ required: true }),
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
	formData.value.usingDeptId = ''
	formData.value.usingDeptName = ''
	formData.value.equipTypeId = ''
	formData.value.equipId = ''
	formData.value.equipName = ''
	formData.value.appNumber = ''
	formData.value.appType = ''
	formData.value.appContent = ''
	formData.value.maintenanceUnitId = ''
	formData.value.maintenanceUnitName = ''
	formData.value.budgetAmount = 0
	formData.value.remark = ''
	quotaTableData.value = []
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
