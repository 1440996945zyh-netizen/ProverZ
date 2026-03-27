<template>
	<div class="formData">
		<el-form ref="ruleForm" :model="formData" :rules="rules" label-position="top">
			<el-row :gutter="20" v-if="formData.id">
				<el-col :span="8">
					<el-form-item label="结算单号" prop="settlementNo">
						<el-input v-model="formData.settlementNo" disabled />
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="申请时间" prop="applyTime">
						<el-date-picker
							v-model="formData.applyTime"
							type="datetime"
							value-format="YYYY-MM-DD HH:mm:ss"
							disabled
							style="width: 100%"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="申请人" prop="applyUserName">
						<el-input v-model="formData.applyUserName" disabled />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="6">
					<el-form-item label="维修单位" prop="maintOrgId">
						<Select
							:selectData="maintOrgOptions"
							v-model:value="formData.maintOrgId"
							v-model:label="formData.maintOrgName"
							placeholder="请选择维修单位"
							:disabled="isViewMode"
							@change="handleMaintOrgChange"
						/>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="项目类型" prop="projectType">
						<el-select
							v-model="formData.projectType"
							placeholder="请选择项目类型"
							:disabled="isViewMode"
							@change="handleProjectTypeChange"
							style="width: 100%"
						>
							<el-option label="定额" value="定额" />
							<el-option label="非定额" value="非定额" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="预算金额合计(元)" prop="totalBudgetAmount">
						<el-input-number v-model="formData.totalBudgetAmount" :precision="4" :controls="false" disabled style="width: 100%" />
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="实际金额合计(元)" prop="totalActualAmount">
						<el-input-number v-model="formData.totalActualAmount" :precision="4" :controls="false" disabled style="width: 100%" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row :gutter="20">
				<el-col :span="24">
					<el-form-item label="备注" prop="remark">
						<el-input v-model="formData.remark" type="textarea" :rows="3" :disabled="isViewMode" placeholder="请输入备注" />
					</el-form-item>
				</el-col>
			</el-row>

			<div class="sub-table-wrapper">
				<div class="sub-table-header">
					<span class="sub-table-title">结算明细</span>
					<div v-if="!isViewMode" class="sub-table-btns">
						<el-button type="primary" size="small" @click="openWorkOrderDialog" :disabled="!formData.maintOrgId || !formData.projectType">选择工单</el-button>
					</div>
				</div>
				<el-table :data="formData.subList" border stripe style="width: 100%; margin-top: 10px">
					<el-table-column type="index" label="序号" width="60" align="center" />
					<el-table-column prop="workOrderNo" label="工单号" width="180" />
					<el-table-column prop="equipName" label="设备名称" min-width="180" show-overflow-tooltip />
					<el-table-column prop="mantAppNumber" label="申请单号" width="180" />
					<el-table-column prop="acceptanceTime" label="验收时间" width="170" align="center" />
					<el-table-column prop="budgetAmount" label="预算金额(元)" width="150" align="left">
						<template #default="{ row }">
							{{ formatNumberHelper(row.budgetAmount) }}
						</template>
					</el-table-column>
					<el-table-column prop="actualAmount" label="实际金额(元)" width="180" align="left">
						<template #default="{ row }">
							<el-input-number
								v-model="row.actualAmount"
								:precision="4"
								:min="0"
								:controls="false"
								:disabled="isViewMode"
								@change="calculateTotals"
								style="width: 100%"
							/>
						</template>
					</el-table-column>
					<el-table-column v-if="!isViewMode" label="操作" width="80" align="center" fixed="right">
						<template #default="{ $index }">
							<el-button type="danger" link @click="removeSubRow($index)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-form>

		<!-- 工单选择弹窗 -->
		<el-dialog v-model="workOrderVisible" title="工单列表" width="80%" append-to-body destroy-on-close>
			<BaseTable
				ref="workOrderTableRef"
				:showSearchHeader="true"
				:selectData="workOrderSearchData"
				:searchClick="loadWorkOrders"
				:tableColumns="workOrderColumns"
				:tableData="workOrderList"
				:loading="workOrderLoading"
				:checkbox-config="workOrderCheckboxConfig"
				:total="workOrderTotal"
				@checkbox-change="handleWorkOrderSelection"
				@checkbox-all="handleWorkOrderSelection"
				:row-config="{ keyField: 'id' }"
				:tableHeight="tableHeight"

			/>
			<template #footer>
				<div style="display: flex; justify-content: flex-end; gap: 10px">
					<el-button @click="workOrderVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmWorkOrderSelection">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup name="costSettlementApplyDetail">
import { ref, reactive, getCurrentInstance, onMounted, nextTick } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElInputNumber, ElTooltip, ElIcon } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Select from '@/components/Select/index.vue'
import api from '@/api/equipment/costSettlement/index'
import maintenancePersonnelApi from '@/api/equipment/maintenancePersonnel/index'
import publicApi from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'
const tableHeight = computed(() => tableParamsStore().dialogPageTableHeight)


const props = defineProps({
	isViewMode: {
		type: Boolean,
		default: false,
	},
})

const { proxy } = getCurrentInstance()
const ruleForm = ref()

const formData = reactive({
	id: null,
	settlementNo: '',
	maintOrgId: null,
	maintOrgName: '',
	projectType: '',
	totalBudgetAmount: 0,
	totalActualAmount: 0,
	applyUserId: null,
	applyUserName: '',
	applyTime: '',
	remark: '',
	subList: [],
})

const rules = reactive({
	maintOrgId: [{ required: true, message: '请选择维修单位', trigger: 'change' }],
	projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
})

const maintOrgOptions = ref([])

// 工单选择弹窗相关
const workOrderVisible = ref(false)
const workOrderLoading = ref(false)
const workOrderList = ref([])
const workOrderTotal = ref(0)
const workOrderTableRef = ref()
const tempSelectedWorkOrders = ref([])

// 记录变更前的值
const oldMaintOrgId = ref(null)
const oldMaintOrgName = ref('')
const oldProjectType = ref('')

const workOrderSearchData = reactive([
	{ name: '工单号', type: 'input', modelValue: 'workOrderNo', span: 12 },
	{ name: '设备名称', type: 'input', modelValue: 'equipName', span: 12 },
])

const workOrderColumns = [
	{ label: '', type: 'checkbox', width: 50, align: 'center' },
	{ label: '工单号', prop: 'workOrderNo', width: 180, align: 'center' },
	{ label: '设备名称', prop: 'equipName', width: 150 , align: 'center'},
	{ label: '申请单号', prop: 'mantAppNumber', align: 'center' },
	{ label: '项目类型', prop: 'dispatchTypeName', width: 120, align: 'center' },
	{ label: '验收时间', prop: 'acceptanceTime', align: 'center' },
	{ label: '预算金额', prop: 'budgetAmount', width: 120, align: 'center', formatter: ({ cellValue }) => formatNumberHelper(cellValue) },
]

const workOrderCheckboxConfig = {
	highlight: true,
	reserve: true,
	checkMethod: ({ row }) => {
		// 排除已经选中的工单
		return !formData.subList.some(item => item.workOrderNo === row.workOrderNo)
	},
}

const handleMaintOrgChange = (val, item) => {
	if (formData.subList && formData.subList.length > 0) {
		ElMessageBox.confirm('变更维修单位会清空已选择工单，是否继续？', '提示', {
			type: 'warning',
			confirmButtonText: '确定',
			cancelButtonText: '取消',
		}).then(() => {
			formData.subList = []
			calculateTotals()
			oldMaintOrgId.value = formData.maintOrgId
			oldMaintOrgName.value = formData.maintOrgName
		}).catch(() => {
			formData.maintOrgId = oldMaintOrgId.value
			formData.maintOrgName = oldMaintOrgName.value
		})
	} else {
		oldMaintOrgId.value = formData.maintOrgId
		oldMaintOrgName.value = formData.maintOrgName
	}
}

const handleProjectTypeChange = (val) => {
	if (formData.subList && formData.subList.length > 0) {
		ElMessageBox.confirm('变更项目类型会清空已选择工单，是否继续？', '提示', {
			type: 'warning',
			confirmButtonText: '确定',
			cancelButtonText: '取消',
		}).then(() => {
			formData.subList = []
			calculateTotals()
			oldProjectType.value = formData.projectType
		}).catch(() => {
			formData.projectType = oldProjectType.value
		})
	} else {
		oldProjectType.value = formData.projectType
	}
}

const openWorkOrderDialog = () => {
	workOrderVisible.value = true
	tempSelectedWorkOrders.value = []
	nextTick(() => {
		loadWorkOrders({ startPage: 1, pageSize: 20 })
	})
}

const loadWorkOrders = (params = {}) => {
	if (!formData.maintOrgId || !formData.projectType) return
	workOrderLoading.value = true
	const query = {
		...params,
		maintOrgId: formData.maintOrgId,
		projectType: formData.projectType,
		id: formData.id,
	}
	api.getAcceptedWorkOrders(query).then(res => {
		if (res.code === '0000') {
			workOrderList.value = res.data.pages || []
			workOrderTotal.value = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg || '加载工单数据失败')
		}
		workOrderLoading.value = false
	}).catch(() => {
		workOrderLoading.value = false
	})
}

const handleWorkOrderSelection = data => {
	if (Array.isArray(data)) {
		tempSelectedWorkOrders.value = data || []
	} else if (data && data.records) {
		tempSelectedWorkOrders.value = data.records || []
	}
}

const confirmWorkOrderSelection = () => {
	if (tempSelectedWorkOrders.value.length === 0) {
		proxy.$message.warning('请选择工单')
		return
	}

	const newItems = tempSelectedWorkOrders.value.map(item => ({
		workOrderNo: item.workOrderNo,
		equipId: item.equipId,
		equipName: item.equipName,
		mantAppNumber: item.mantAppNumber,
		acceptanceTime: item.acceptanceTime,
		budgetAmount: item.budgetAmount || 0,
		actualAmount: item.budgetAmount || 0,
	}))

	formData.subList.push(...newItems)
	calculateTotals()
	workOrderVisible.value = false
}

const removeSubRow = index => {
	formData.subList.splice(index, 1)
	calculateTotals()
}

const calculateTotals = () => {
	formData.totalBudgetAmount = formData.subList.reduce((sum, item) => sum + (Number(item.budgetAmount) || 0), 0)
	formData.totalActualAmount = formData.subList.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0)
}

const formatNumberHelper = (val) => {
	if (val === null || val === undefined || val === '') return '0.0000'
	return Number(val).toFixed(4)
}

const resetForm = () => {
	Object.assign(formData, {
		id: null,
		settlementNo: '',
		maintOrgId: null,
		maintOrgName: '',
		projectType: '',
		totalBudgetAmount: 0,
		totalActualAmount: 0,
		applyUserId: null,
		applyUserName: '',
		applyTime: '',
		remark: '',
		subList: [],
	})
	ruleForm.value?.clearValidate()
	oldMaintOrgId.value = null
	oldMaintOrgName.value = ''
	oldProjectType.value = ''
}

const setFormData = data => {
	Object.assign(formData, data)
	calculateTotals()
	oldMaintOrgId.value = formData.maintOrgId
	oldMaintOrgName.value = formData.maintOrgName
	oldProjectType.value = formData.projectType
}

const validate = async () => {
	if (!ruleForm.value) return false
	const valid = await ruleForm.value.validate().catch(() => false)
	if (!valid) return false

	if (formData.subList.length === 0) {
		proxy.$message.warning('请至少选择一个结算工单')
		return false
	}
	return true
}

const getMaintOrgList = () => {
	maintenancePersonnelApi.queryUnitName({ outType: '2' }).then(res => {
		if (res.code === '0000') {
			maintOrgOptions.value = res.data.map(item => ({
				label: item.unitName,
				value: item.externalCompanyId,
			}))
		}
	})
}

const getLoginUser = () => {
}

onMounted(() => {
	getMaintOrgList()
})

defineExpose({
	resetForm,
	setFormData,
	validate,
	formData,
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';

.sub-table-wrapper {
	margin-top: 24px;
	padding: 10px;
	background: #fff;
	border-radius: 4px;

	.sub-table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid #ebeef5;

		.sub-table-title {
			font-size: 15px;
			font-weight: bold;
			color: #333;
			position: relative;
			padding-left: 12px;

			&::before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 4px;
				height: 16px;
				background: #409eff;
				border-radius: 2px;
			}
		}
	}
}

:deep(.el-input-number .el-input__inner) {
	text-align: left !important;
}
</style>
