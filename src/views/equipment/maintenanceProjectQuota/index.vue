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
		<Drawer v-model="dialogVisible" :title="title" size="30%">
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

<script setup name="maintenanceProjectQuota">
import { ref, reactive, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceProjectQuota/index'

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
	{ label: '定额编号', prop: 'quotaNo', align: 'center', width: 180 },
	{ label: '维修项目名称', prop: 'projectName', align: 'left', width: 200, showOverFlow: true },
	{ label: '维修项目内容', prop: 'projectContent', align: 'left', minWidth: 300, showOverFlow: true },
	{ label: '计量单位', prop: 'unit', align: 'center', width: 100 },
	{
		label: '不含税金额',
		prop: 'amount',
		align: 'right',
		width: 120,
		render: row => {
			return h('span', row.amount ? row.amount.toFixed(2) : '0.00')
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
						permission: 'equipment:emmaintenanceprojectquota:update',
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
						permission: 'equipment:emmaintenanceprojectquota:delete',
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
		name: '维修项目名称',
		type: 'input',
		modelValue: 'projectName',
		span: 12,
	},
	{
		name: '定额编号',
		type: 'input',
		modelValue: 'quotaNo',
		span: 12,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'equipment:emequiprepaircontract:add',
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
	title.value = '新增维修项目定额'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleUpdate = row => {
	title.value = '编辑维修项目定额'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.quotaNo = resData.quotaNo
			detailRef.value.formData.projectName = resData.projectName
			detailRef.value.formData.projectContent = resData.projectContent
			detailRef.value.formData.unit = resData.unit
			detailRef.value.formData.amount = resData.amount
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