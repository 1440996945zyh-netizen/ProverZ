<template>
	<div class="formData">
		<el-form :model="formData" ref="ruleForm" :rules="rules" label-position="top">
			<div class="section-title">
				<span class="title-text">申请信息</span>
			</div>
			<el-row :gutter="20" class="section-content">
				<el-col :xs="24" :sm="12" :md="12" :lg="8">
					<el-form-item label="申请单号" prop="appNumber">
						<el-input v-model="formData.appNumber" placeholder="系统自动生成" disabled />
					</el-form-item>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="8">
					<el-form-item label="维修单位" prop="maintenanceUnitName">
						<Select
							:selectData="maintenanceUnitOptions"
							v-model:value="formData.maintenanceUnitId"
							v-model:label="formData.maintenanceUnitName"
							placeholder="请选择维修单位"
						/>
					</el-form-item>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="8">
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
				<el-col :xs="24" :sm="12" :md="12" :lg="24">
					<el-form-item label="申请事项" prop="appContent">
						<el-input v-model="formData.appContent" type="textarea" :rows="4" placeholder="请输入申请事项" maxlength="1000" />
					</el-form-item>
				</el-col>
			</el-row>

			<div class="section-title">
				<span class="title-text">维修项目信息</span>
			</div>
			<el-row :gutter="20" class="section-content">
				<el-col :xs="24" :sm="12" :md="12" :lg="12">
					<el-form-item label="维修项目类型" prop="appType">
						<el-radio-group v-model="formData.appType" @change="handleProjectTypeChange">
							<el-radio v-for="item in projectTypeOptions" :key="item.id" :label="item.id">
								{{ item.name }}
							</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>

			<div v-if="isQuotaProject" class="quota-section">
				<div class="quota-header">
					<span class="quota-title">维修项目定额表</span>
					<el-button type="primary" @click="openQuotaDialog" size="default">选择维修项目定额</el-button>
				</div>
				<el-table :data="quotaTableData" border style="width: 100%" class="quota-table">
					<el-table-column prop="quotaCode" label="定额编号" width="180" />
					<el-table-column prop="projectName" label="维修项目名称" width="200" />
					<el-table-column prop="projectContent" label="维修项目内容" min-width="200" show-overflow-tooltip />
					<el-table-column prop="unit" label="计量单位" width="120" />
					<el-table-column prop="amountExcludingTax" label="不含税金额" width="150" align="right"></el-table-column>

					<el-table-column prop="taxRate" label="税率(%)" width="150">
						<template #default="scope">
							<Select
								:selectData="taxRateOptions"
								v-model:value="scope.row.taxRate"
								v-model:label="scope.row.taxRate"
								placeholder="请选择税率"
								@change="handleTaxRateChange(scope.row)"
							/>
						</template>
					</el-table-column>
					<el-table-column prop="amountIncludingTax" label="含税金额" width="150" align="right"></el-table-column>
					<el-table-column label="操作" width="120" align="center">
						<template #default="scope">
							<el-button type="danger" link @click="deleteRow(scope.$index)">
								<el-icon><Delete /></el-icon>
								删除
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<el-row :gutter="20" class="section-content">
				<el-col :xs="24" :sm="12" :md="12" :lg="12">
					<el-form-item label="预算金额" prop="budgetAmount">
						<el-input-number
							v-model="formData.budgetAmount"
							:precision="4"
							:min="0"
							:disabled="isQuotaProject"
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<Dialog v-model:visible="quotaDialogVisible" title="选择维修项目定额" width="70%" class="quota-dialog">
			<BaseTable
				ref="quotaTableRef"
				:showSearchHeader="true"
				:selectData="quotaSelectData"
				:searchClick="getQuotaList"
				:tableColumns="quotaTableColumns"
				:tableData="quotaList"
				:loading="quotaLoading"
				:checkbox-config="quotaCheckboxConfig"
				:total="quotaTotal"
				:show-pagination="true"
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
import { ref, reactive, getCurrentInstance, toRefs, watch, h, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import Select from '@/components/Select/index.vue'
import quotaApi from '@/api/equipment/maintenanceProjectQuota/index'
import maintenancePersonnelApi from '@/api/equipment/maintenancePersonnel/index'
import publicApi from '@/api/public/index.js'

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
		list: [],
	},
})
const { formData } = toRefs(data)

// 下拉选项（实际项目中应从接口获取）
const equipmentTypeOptions = ref([
	{ id: 1, name: '设备类型1' },
	{ id: 2, name: '设备类型2' },
	{ id: 3, name: '设备类型3' },
])

const projectTypeOptions = ref([
	{ id: 1, name: '定额' },
	{ id: 2, name: '非定额' },
])

const maintenanceUnitOptions = ref([])
const taxRateOptions = ref([])

const isQuotaProject = ref(false)

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

	{ label: '定额编号', prop: 'quotaCode', align: 'center', width: 180 },
	{ label: '维修项目名称', prop: 'projectName', align: 'left', width: 200, showOverFlow: true },
	{ label: '维修项目内容', prop: 'projectContent', align: 'left', minWidth: 300, showOverFlow: true },
	{ label: '计量单位', prop: 'unit', align: 'center', width: 100 },
	{
		label: '不含税金额',
		prop: 'amountExcludingTax',
		align: 'right',
		width: 120,
	},
])

// 定额搜索条件
const quotaSelectData = reactive([
	{
		name: '维修项目名称',
		type: 'input',
		modelValue: 'projectName',
		span: 12,
	},
	{
		name: '定额编号',
		type: 'input',
		modelValue: 'quotaCode',
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
		projectName: params.projectName,
		quotaCode: params.quotaCode,
	}
	quotaApi
		.getList(queryParams)
		.then(res => {
			if (res.code === '0000') {
				quotaList.value = res.data.pages || []
				quotaTotal.value = res.data.totalNum || 0
			} else {
				proxy.$message.error(res.msg || '获取定额列表失败')
				quotaList.value = []
				quotaTotal.value = 0
			}
		})
		.catch(() => {
			proxy.$message.error('获取定额列表失败')
			quotaList.value = []
			quotaTotal.value = 0
		})
		.finally(() => {
			quotaLoading.value = false
		})
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
			const defaultTaxRate = taxRateOptions.value.length > 0 ? taxRateOptions.value[0].value : 0
			const amountExcludingTaxNum = Number(quota.amountExcludingTax)
			const amountExcludingTax = !isNaN(amountExcludingTaxNum) ? amountExcludingTaxNum.toFixed(4) : '0.0000'
			const taxRate = Number(defaultTaxRate) / 100
			const amountIncludingTaxNum = Number(amountExcludingTax) * (1 + taxRate)
			const amountIncludingTax = !isNaN(amountIncludingTaxNum) ? amountIncludingTaxNum.toFixed(4) : '0.0000'
			quotaTableData.value.push({
				id: quota.id,
				quotaCode: quota.quotaCode,
				projectName: quota.projectName,
				projectContent: quota.projectContent,
				unit: quota.unit,
				amountExcludingTax: amountExcludingTax,
				taxRate: defaultTaxRate,
				amountIncludingTax: amountIncludingTax,
			})
		}
	})

	calculateBudgetAmount()
	quotaDialogVisible.value = false
}

// 计算含税金额
const calculateTaxAmount = row => {
	const amountExcludingTaxNum = Number(row.amountExcludingTax)
	if (!isNaN(amountExcludingTaxNum) && row.taxRate !== undefined) {
		const taxRate = Number(row.taxRate) / 100
		row.amountIncludingTax = Number((amountExcludingTaxNum * (1 + taxRate)).toFixed(4))
	} else {
		row.amountIncludingTax = !isNaN(amountExcludingTaxNum) ? amountExcludingTaxNum : 0
	}
}

// 计算预算金额
const calculateBudgetAmount = () => {
	formData.value.budgetAmount = quotaTableData.value.reduce((sum, row) => {
		return sum + (row.amountIncludingTax || 0)
	}, 0)
	formData.value.list = quotaTableData.value
}

// 税率变化处理
const handleTaxRateChange = row => {
	console.log(row, 'row')
	calculateTaxAmount(row)
	calculateBudgetAmount()
}

// 维修项目类型变化时处理
const handleProjectTypeChange = value => {
	isQuotaProject.value = value === 1
	if (!isQuotaProject.value) {
		quotaTableData.value = []
		formData.value.budgetAmount = 0
		formData.value.list = []
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

const getMaintenanceUnitList = () => {
	maintenancePersonnelApi.queryUnitName({}).then(res => {
		if (res.code === '0000') {
			maintenanceUnitOptions.value = res.data.map(item => ({
				label: item.unitName || item.repairContarctName || item.name,
				value: item.id || item.unitId || item.repairContarctId,
			}))
		}
	})
}

const getTaxRateList = () => {
	publicApi.getLocalSelect({ type: 'DICT', dictType: 'TAX_RATE' }).then(res => {
		if (res.code === '0000') {
			taxRateOptions.value = res.data
		}
	})
}

onMounted(() => {
	getMaintenanceUnitList()
	getTaxRateList()
})

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

.section-title {
	position: relative;
	padding: 12px 0;
	margin: 24px 0 16px 0;
	border-bottom: 2px solid #e8ecf1;

	.title-text {
		color: #333333;
		font-size: 16px;
		font-weight: 600;
		letter-spacing: 0.5px;
		display: inline-block;
		padding-bottom: 8px;

		margin-bottom: -10px;
	}

	&:first-child {
		margin-top: 0;
	}
}

.section-content {
	padding: 16px 0;
	margin-bottom: 8px;
}

.quota-table {
	:deep(.el-table__body) {
		tr:hover {
			background-color: #f5f7fa;
		}
	}
}

.quota-section {
	margin-bottom: 20px;
}

.quota-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid #e8ecf1;

	.quota-title {
		font-size: 14px;
		font-weight: 600;
		color: #333333;
	}

	.el-button {
		display: flex;
		align-items: center;
		gap: 4px;
	}
}

:deep(.el-form-item) {
	margin-bottom: 20px;

	.el-form-item__label {
		color: #333333;
		font-weight: 500;
		font-size: 14px;
		padding-bottom: 8px;
	}
}
</style>
