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
				:loading="loading"
				:total="total"
			/>
		</div>
		<Drawer v-model="dialogVisible" :title="title" size="70%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="maintenanceProjectApply">
import { ref, reactive, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceProjectApply/index'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref('')
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)

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
	{ label: '使用部门', prop: 'usingDeptName', align: 'left', width: 150, showOverFlow: true },
	{ label: '设备类型', prop: 'equipTypeId', align: 'left', width: 150, showOverFlow: true },
	{ label: '设备名称', prop: 'equipName', align: 'left', width: 200, showOverFlow: true },
	{ label: '维修项目类型', prop: 'appType', align: 'center', width: 120 },
	{ label: '申请事项', prop: 'appContent', align: 'left', minWidth: 300, showOverFlow: true },
	{
		label: '预算金额',
		prop: 'budgetAmount',
		align: 'right',
		width: 120,
		render: row => {
			return h('span', row.budgetAmount ? row.budgetAmount.toFixed(2) : '0.00')
		},
	},
	{
		prop: 'operate',
		label: '操作',
		align: 'center',
		width: 150,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'equipment:emaintprojapply:update',
					},
					{
						default: () => '编辑',
					},
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleDelete(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'equipment:emaintprojapply:delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

const selectData = reactive([
	{
		name: '使用部门',
		type: 'input',
		modelValue: 'usingDeptName',
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
	loading.value = true
	queryParams.value = e
	api.getList(e).then(res => {
		loading.value = false
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
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleUpdate = row => {
	title.value = '编辑维修项目申请'
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
			detailRef.value.formData.appType = resData.appType
			detailRef.value.formData.appContent = resData.appContent
			detailRef.value.formData.maintenanceUnitId = resData.maintenanceUnitId
			detailRef.value.formData.maintenanceUnitName = resData.maintenanceUnitName
			detailRef.value.formData.budgetAmount = resData.budgetAmount
			detailRef.value.formData.remark = resData.remark
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

getList(queryParams.value)
</script>

<style lang="scss" scoped>
.app-container {
	padding: 24px;
	display: flex;
	flex-direction: column;
	height: calc(100vh - 48px);
	overflow: hidden;
}

.table-wrapper {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}
</style>
