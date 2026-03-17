<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:showNum="4"
			:defaultWidth="60"
			:selectData="selectData"
			:searchClick="handleSearch"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:loading="loading"
			:total="total"
			:tableHeight="tableHeight"
		/>

		<!-- 详情抽屉 -->
		<el-drawer v-model="open" :title="title" size="85%" @closed="handleDrawerClosed" destroy-on-close>
			<detail ref="detailRef" :isViewMode="isViewMode" @saved="handleSaved" />
			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="open = false">取消</el-button>
					<el-button v-if="!isViewMode" type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="costSettlementApply">
import { ref, reactive, getCurrentInstance, onMounted, computed, h, nextTick } from 'vue'
import { ElButton, ElMessageBox, ElTag } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import DropDown from '@/components/DropDown/newIndex'
import api from '@/api/equipment/costSettlement/index'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const { startProcess, loading: processLoading } = useProcessStarter()

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const open = ref(false)
const title = ref('')
const isViewMode = ref(false)
const detailRef = ref(null)
const selectedRows = ref([])

const queryParams = reactive({
	startPage: 1,
	pageSize: 20,
	settlementNo: '',
	maintOrgName: '',
	projectType: '',
	workOrderNo: '',
})

const tableHeight = computed(() => window.innerHeight - 200)

const selectData = reactive([
	{
		name: '结算单号',
		type: 'input',
		modelValue: 'settlementNo',
		span: 6,
	},
	{
		name: '工单号',
		type: 'input',
		modelValue: 'workOrderNo',
		span: 6,
	},
	{
		name: '维修单位',
		type: 'input',
		modelValue: 'maintOrgName',
		span: 6,
	},
	{
		name: '项目类型',
		type: 'select',
		modelValue: 'projectType',
		span: 6,
		selectData: [
			{ label: '定额', value: '定额' },
			{ label: '非定额', value: '非定额' },
		],
	},
])

const formatNumber = value => {
	if (value == null || value === '') return '0.00'
	const num = Number(value)
	if (Number.isNaN(num)) return value
	return num.toFixed(2)
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '结算单号', prop: 'settlementNo', align: 'center', width: 180, fixed: 'left' },
	{ label: '工单号', prop: 'workOrderNos', align: 'center', width: 250, showOverFlow: true },
	{ label: '维修单位', prop: 'maintOrgName', align: 'center', width: 220, showOverFlow: true },
	{
		label: '项目类型',
		prop: 'projectType',
		align: 'center',
		width: 100,
	},
	{
		label: '预算金额合计',
		prop: 'totalBudgetAmount',
		align: 'center',
		width: 140,
		formatter: ({ cellValue }) => formatNumber(cellValue)
	},
	{
		label: '实际金额合计',
		prop: 'totalActualAmount',
		align: 'center',
		width: 140,
		formatter: ({ cellValue }) => formatNumber(cellValue)
	},
	{ label: '申请人', prop: 'applyUserName', align: 'center', width: 120 },
	{ label: '申请时间', prop: 'applyTime', align: 'center', width: 160 },
	{ label: '备注', prop: 'remark', align: 'center', minWidth: 200, showOverFlow: true },
		{
		label: '状态',
		prop: 'processStatusLabel',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			const statusMap = {
				0: { label: '未发起', type: 'info' },
				1: { label: '审批中', type: 'warning' },
				2: { label: '审批通过', type: 'success' },
				3: { label: '审批不通过', type: 'danger' },
				4: { label: '已办结', type: 'success' },
				5: { label: '作废', type: 'danger' },
			}
			const status = statusMap[row.processStatus] || { label: '未知', type: 'info' }
			return [
				h(
					ElTag,
					{
						type: status.type,
					},
					{
						default: () => {
							return status.label
						},
					},
				),
			]
		},
	},
	{
		label: '操作',
		width: 100,
		fixed: 'right',
		align: 'center',
		render: row => {
			const dropDownList = [
				{
					name: '查看',
					command: '查看',
					type: 'primary',
					icon: 'View',
					click: () => handleView(row),
					permission: 'equipment:costSettlement:view',
					vif: true
				},
				{
					name: '修改',
					command: '修改',
					type: 'primary',
					icon: 'Edit',
					click: () => handleUpdate(row),
					permission: 'equipment:costSettlement:edit',
					vif: row.processStatus == 0  || row.processStatus == null
				},
				{
					name: '发起',
					command: '发起',
					type: 'primary',
					icon: 'Promotion',
					click: () => handleInitiate(row),
					permission: 'bpm:equipment:controller:submitSettlementApply',
					vif: row.processStatus == 0 || row.processStatus == null
				},
				{
					name: '审批历史',
					command: '审批历史',
					type: 'primary',
					icon: 'Histogram',
					permission: 'equipment:costSettlement:history',
					click: () => handleHistory(row),
					vif: row.processStatus != 0 && row.processStatus != null
				},
				{
					name: '删除',
					command: '删除',
					type: 'danger',
					icon: 'Delete',
					click: () => handleDelete(row),
					permission: 'equipment:costSettlement:remove',
					vif: row.processStatus == 0  || row.processStatus == null
				},
			]
			return [
				h(DropDown, {
					dropDownList,
				}),
			]
		},
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd(),
		permission: 'equipment:costSettlement:add',
	},
])


const handleSearch = params => {
	Object.assign(queryParams, params)
	queryParams.startPage = 1
	getList()
}

const getList = () => {
	loading.value = true
	api.getList(queryParams).then(res => {
		if (res.code === '0000') {
			tableData.value = res.data.pages || []
			total.value = res.data.totalNum || 0
		} else {
			proxy.$message.error(res.msg || '获取列表失败')
		}
		loading.value = false
	}).catch(() => {
		loading.value = false
	})
}

const handleAdd = () => {
	isViewMode.value = false
	title.value = '新增结算申请'
	open.value = true
	nextTick(() => {
		detailRef.value?.resetForm()
	})
}

const handleUpdate = row => {
	isViewMode.value = false
	title.value = '修改结算申请'
	open.value = true
	nextTick(() => {
		detailRef.value?.resetForm()
		api.getById(row.id).then(res => {
			if (res.code === '0000') {
				detailRef.value?.setFormData(res.data)
			} else {
				proxy.$message.error(res.msg || '获取详情失败')
			}
		})
	})
}

const handleView = row => {
	isViewMode.value = true
	title.value = '查看结算申请'
	open.value = true
	nextTick(() => {
		detailRef.value?.resetForm()
		api.getById(row.id).then(res => {
			if (res.code === '0000') {
				detailRef.value?.setFormData(res.data)
			} else {
				proxy.$message.error(res.msg || '获取详情失败')
			}
		})
	})
}

const handleDelete = row => {
	ElMessageBox.confirm('是否确定删除该条结算申请数据？', '提示', {
		type: 'warning',
	}).then(() => {
		api.delete(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$message.success('删除成功')
				getList()
			} else {
				proxy.$message.error(res.msg || '删除失败')
			}
		})
	}).catch(() => {})
}

const handleBatchDelete = () => {
	if (selectedRows.value.length === 0) {
		proxy.$message.warning('请选择要删除的数据')
		return
	}
	const ids = selectedRows.value.map(item => item.id)
	ElMessageBox.confirm(`是否确定删除选中的 ${ids.length} 条结算申请数据？`, '提示', {
		type: 'warning',
	}).then(() => {
		api.deleteBatch(ids).then(res => {
			if (res.code === '0000') {
				proxy.$message.success('删除成功')
				getList()
			} else {
				proxy.$message.error(res.msg || '删除失败')
			}
		})
	}).catch(() => {})
}

/** 发起审批回调 */
const submitSettlementApplyCallback = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.submitSettlementApply(params)
}

/** 发起审批 */
const handleInitiate = row => {
	api.getById(row.id).then(res => {
		if (res.code === '0000' && res.data) {
			startProcess({
				rowData: res.data,
				businessId: route.meta?.menuId,
				businessTypeCode: 'bpm:equipment:controller:submitSettlementApply',
				businessSubmit: submitSettlementApplyCallback,
				onSuccess() {
					proxy.$modal.msgSuccess('发起成功')
					getList()
				},
				onError(err) {
					proxy.$modal.msgError(err.message || '发起失败')
				}
			})
		}
	})
}

/** 审批历史 */
const handleHistory = row => {
	if (!row.procInstId) {
		proxy.$message.warning('暂无审批历史')
		return
	}
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}


const save = async () => {
	const valid = await detailRef.value?.validate()
	if (!valid) return

	const submitData = detailRef.value?.formData
	const method = submitData.id ? 'update' : 'add'

	api[method](submitData).then(res => {
		if (res.code === '0000') {
			proxy.$message.success('保存成功')
			open.value = false
			getList()
		} else {
			proxy.$message.error(res.msg || '保存失败')
		}
	})
}

const handleSaved = () => {
	open.value = false
	getList()
}

const handleDrawerClosed = () => {
	// 抽屉关闭后的清理工作
}

onMounted(() => {
	getList()
})
</script>

<style lang="scss" scoped>
.app-container {
	padding: 20px;
}
</style>
