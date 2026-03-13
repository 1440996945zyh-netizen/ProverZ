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
				:showNum="6"
				:defaultWidth="60"
			/>
		</div>
		<Drawer v-model="dialogVisible" :title="title" size="40%">
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

<script setup name="projectContractInfo">
import { ref, reactive, computed, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/projectContractInfo/index'

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
		contractName: undefined,
		contractCode: undefined,
		contractAmount: undefined,
		startDate: undefined,
		endDate: undefined,
		applyScope: undefined,
		status: undefined,
	},
})
const { queryParams } = toRefs(data)

const selectData = reactive([
	{
		name: '合同名称',
		type: 'input',
		modelValue: 'contractName',
		span: 4,
	},
	{
		name: '合同编号',
		type: 'input',
		modelValue: 'contractCode',
		span: 4,
	},

	{
		name: '合同状态',
		type: 'select',
		modelValue: 'status',
		span: 4,
		dataConfig: {
			params: { type: 'DICT', dictType: 'CONTRACT_STATUS' },
		},
	},
	{
		name: '合同开始日期',
		type: 'date',
		modelValue: 'startDate',
		span: 6,
	},

	{
		name: '合同截止日期',
		type: 'date',
		modelValue: 'endDate',
		span: 6,
	},
])

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '合同名称', prop: 'contractName', align: 'left', width: 200, showOverFlow: true },
	{ label: '合同编号', prop: 'contractCode', align: 'center', width: 150 },
	{ label: '合同金额', prop: 'contractAmount', align: 'center', width: 120 },
	{ label: '合同开始日期', prop: 'startDate', align: 'center', width: 150 },
	{ label: '合同截止日期', prop: 'endDate', align: 'center', width: 150 },
	{ label: '适用范围', prop: 'applyScope', align: 'left', minWidth: 200, showOverFlow: true },
	{
		prop: 'status',
		label: '合同状态',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status === '1' ? 'success' : 'danger',
						size: 'default',
					},
					{
						default: () => {
							return row.status === '1' ? '有效' : '无效'
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
						permission: 'equipment:econtractinfocontract:update',
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
						permission: 'equipment:econtractinfocontract:delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])

const getList = e => {
	loading.value = true
	queryParams.value = { ...queryParams.value, ...e }
	api.getList(queryParams.value)
		.then(response => {
			tableData.value = response.rows
			total.value = response.total
			loading.value = false
		})
		.catch(() => {
			loading.value = false
		})
}

const handleAdd = () => {
	title.value = '新增项目合同'
	dialogVisible.value = true
	detailRef.value.reset()
}

const handleUpdate = row => {
	title.value = '编辑项目合同'
	dialogVisible.value = true
	detailRef.value.setForm(row)
}

const handleDelete = row => {
	proxy.$modal.confirm('是否确认删除该项目合同？').then(() => {
		api.delete(row.id).then(() => {
			proxy.$modal.msgSuccess('删除成功')
			getList()
		})
	})
}

const buttonList = ref([
	{
		label: '新增',
		icon: 'Plus',
		type: 'primary',
		click: handleAdd,
		permission: 'equipment:econtractinfocontract:add',
	},
])

const submitForm = () => {
	detailRef.value.validate().then(() => {
		api.save(detailRef.value.formData).then(() => {
			proxy.$modal.msgSuccess('操作成功')
			dialogVisible.value = false
			getList()
		})
	})
}

const cancel = () => {
	dialogVisible.value = false
}
</script>

<style scoped>
.table-wrapper {
	margin-top: 20px;
}
</style>
