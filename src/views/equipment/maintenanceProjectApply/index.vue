<template>
	<div class="app-container">
		<div class="table-wrapper">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:loading="tableLoading"
				:total="total"
				:show-pagination="true"
				:tableHeight="storeHight"
			/>
		</div>
		<Drawer v-model="dialogVisible" :title="title" size="70%">
			<detail ref="detailRef" :is-view-mode="isViewMode" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm" v-if="!isViewMode">确定</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="maintenanceProjectApply">
import { ref, reactive, getCurrentInstance, toRefs, h, computed, nextTick } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { Edit, View, CircleClose, Promotion } from '@element-plus/icons-vue'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceProjectApply/index'
import tableParamsStore from '@/store/modules/tableParams'
import { useRoute, useRouter } from 'vue-router'
import { useProcessStarter } from '@/utils/bpm/useProcessStarter'

const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const { startProcess, loading } = useProcessStarter()

const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const tableLoading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)
const isViewMode = ref(false)

const storeHight = computed(() => tableParamsStore().pageTableHeight)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		projectName: undefined,
		quotaNo: undefined,
	},
})
const { queryParams } = toRefs(data)

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '申请单号', prop: 'appNumber', align: 'center', width: 180 },
	{ label: '设备名称', prop: 'equipName', align: 'left', width: 200, showOverFlow: true },
	{ label: '维修单位', prop: 'maintenanceUnitName', align: 'left', width: 180, showOverFlow: true },
	// { label: '使用部门', prop: 'usingDeptName', align: 'left', width: 150, showOverFlow: true },
	// { label: '设备类型', prop: 'equipTypeId', align: 'left', width: 150, showOverFlow: true },

	{
		label: '维修项目类型',
		prop: 'appType',
		align: 'center',
		width: 120,
		render: row => h(ElTag, { type: row.appType === '1' ? '' : 'warning' }, row.appType === '1' ? '定额' : '非定额'),
	},

	{ label: '申请事项', prop: 'appContent', align: 'left', minWidth: 300, showOverFlow: true },
	{
		label: '预算金额',
		prop: 'budgetAmount',
		align: 'right',
		width: 120,
		render: row => {
			const value = Number(row.budgetAmount)
			const formattedValue = !isNaN(value)
				? value.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
				: '0.0000'
			return h('span', { style: { color: '#f56c6c', fontWeight: 'bold' } }, `¥${formattedValue}`)
		},
	},
	{
		label: '状态',
		prop: 'processStatusLable',
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
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			const dropDownList = []

			dropDownList.push(
				{
					name: '详情',
					command: '详情',
					click: () => handleView(row),
					permission: 'equipment:emaintprojapply:getById',
					icon: View,
				},
				{
					name: '编辑',
					command: '编辑',
					click: () => handleEdit(row),
					permission: 'equipment:emequiprepaircontract:update',
					icon: Edit,
				},
				{
					name: '发起',
					command: '发起',
					click: () => handleSubmit(row),
					permission: 'equipment:emaintprojapply:submit',
					icon: Promotion,
				},
				{
					name: '审批历史',
					command: '审批历史',
					click: () => handleHistory(row),
					icon: 'Histogram',
					type: 'primary',
				},
				{
					name: '删除',
					command: '删除',
					click: () => handleDelete(row),
					type: 'danger',
					permission: 'equipment:emaintprojapply:deleteProJect',
					icon: 'Delete',
				},
				{
					name: '作废',
					command: '作废',
					click: () => handleVoid(row),
					type: 'danger',
					permission: 'equipment:emaintprojapply:void',
					icon: CircleClose,
				},
			)

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
					},
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '申请单号',
		type: 'input',
		modelValue: 'appNumber',
		span: 12,
	},
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 12,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'equipment:emaintprojapply:add',
	},
])

const getList = e => {
	tableLoading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		tableLoading.value = false
		if (res.code == '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

const cancel = () => {
	dialogVisible.value = false
	reset()
}

const reset = () => {
	detailRef.value?.resetForm()
}

const handleAdd = () => {
	reset()
	title.value = '新增维修项目申请'
	isViewMode.value = false
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleView = row => {
	title.value = '维修项目申请详情'
	isViewMode.value = true
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.usingDeptId = resData.usingDeptId
			detailRef.value.formData.usingDeptName = resData.usingDeptName
			detailRef.value.formData.equipTypeId = resData.equipTypeId
			detailRef.value.formData.equipId = resData.equipId
			detailRef.value.formData.equipName = resData.equipName
			detailRef.value.formData.appNumber = resData.appNumber
			detailRef.value.formData.appContent = resData.appContent
			detailRef.value.formData.maintenanceUnitId = resData.maintenanceUnitId
			detailRef.value.formData.maintenanceUnitName = resData.maintenanceUnitName
			detailRef.value.formData.budgetAmount = resData.budgetAmount
			detailRef.value.formData.remark = resData.remark
			detailRef.value.formData.appType = resData.appType
			detailRef.value.formData.list = resData.list || []
			if (resData.list && resData.list.length > 0) {
				detailRef.value.initQuotaTableData(resData.list)
			}
		})
	})
}

const handleEdit = row => {
	title.value = '编辑维修项目申请'
	isViewMode.value = false
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.usingDeptId = resData.usingDeptId
			detailRef.value.formData.usingDeptName = resData.usingDeptName
			detailRef.value.formData.equipTypeId = resData.equipTypeId
			detailRef.value.formData.equipId = resData.equipId
			detailRef.value.formData.equipName = resData.equipName
			detailRef.value.formData.appNumber = resData.appNumber
			detailRef.value.formData.appContent = resData.appContent
			detailRef.value.formData.maintenanceUnitId = resData.maintenanceUnitId
			detailRef.value.formData.maintenanceUnitName = resData.maintenanceUnitName
			detailRef.value.formData.budgetAmount = resData.budgetAmount
			detailRef.value.formData.remark = resData.remark
			detailRef.value.formData.appType = resData.appType
			detailRef.value.formData.list = resData.list || []
			if (resData.list && resData.list.length > 0) {
				detailRef.value.initQuotaTableData(resData.list)
			}
		})
	})
}

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		const params = detailRef.value.formData
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				dialogVisible.value = false
				getList()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				dialogVisible.value = false
				getList()
			})
		}
	}
}

const submitMaintenanceProjectApply = ({ rowData, processDefinitionId, variables, startUserSelectAssignees, businessId }) => {
	console.log('submitMaintenanceProjectApply:', processDefinitionId, variables, startUserSelectAssignees)
	let params = {
		businessDataId: rowData.id,
		variables: variables,
		startUserSelectAssignees: startUserSelectAssignees,
		processDefinitionId: processDefinitionId,
		businessId: businessId,
	}
	return api.projectApplyStart(params)
}

const handleSubmit = row => {
	api.getById(row.id)
		.then(res => {
			if (res && res.data) {
				startProcess({
					rowData: res.data,
					businessId: route.meta?.menuId,
					businessTypeCode: 'bpm:equipment:controller:projectApplyStart',
					businessSubmit: submitMaintenanceProjectApply,
					onSuccess() {
						proxy.$modal.msgSuccess('发起成功')
						getList(queryParams.value)
					},
					onError(err) {
						proxy.$modal.msgError(err.message)
					},
				})
			}
		})
		.catch(error => {
			console.error('获取详情失败:', error)
			proxy.$modal.msgError('获取详情失败')
		})
}
//审批历史
const handleHistory = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.procInstId,
		},
	})
}
const handleDelete = row => {
	proxy.$modal
		.confirm('确定删除？')
		.then(function () {
			return api.delete(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => {})
}

const handleVoid = row => {
	proxy.$modal
		.confirm('确定作废？')
		.then(function () {
			return api.void(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('作废成功')
		})
		.catch(() => {})
}

getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
