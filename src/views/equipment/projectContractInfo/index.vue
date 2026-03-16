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
				:show-pagination="true"
				:tableHeight="storeHight"
				:showNum="5"
				defaultWidth="60"
			/>
		</div>
		<Drawer v-model="dialogVisible" :title="title" size="30%">
			<detail ref="detailRef" :is-view-mode="isViewMode" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
					<el-button type="primary" @click="submitForm" v-if="title !== '查看详情'">确定</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="projectContractInfo">
import { ref, reactive, getCurrentInstance, toRefs, h, computed, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/projectContractInfo/index'
import publicApi from '@/api/public/index'
import tableParamsStore from '@/store/modules/tableParams'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref(0)
const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const title = ref('')
const detailRef = ref(null)
const isViewMode = ref(false)
const contractTypeOptions = ref([])

const storeHight = computed(() => tableParamsStore().pageTableHeight)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		contractName: undefined,
		contractCode: undefined,
		contractType: undefined,
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
		span: 6,
	},
	{
		name: '合同编号',
		type: 'input',
		modelValue: 'contractCode',
		span: 6,
	},
	{
		name: '合同开始日期',
		type: 'date',
		modelValue: 'startDate',
		span: 6,
	},
	{
		name: '合同结束日期',
		type: 'date',
		modelValue: 'endDate',
		span: 6,
	},
])

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '合同名称', prop: 'contractName', align: 'left', width: 200, showOverFlow: true },
	{ label: '合同编号', prop: 'contractCode', align: 'center', width: 150 },
	{ label: '合同类型', prop: 'contractType', align: 'center', width: 120 },
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
		width: 200,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleView(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
					},
					{
						default: () => '详情',
					},
				),
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

const handleAdd = () => {
	reset()
	title.value = '新增项目合同'
	isViewMode.value = false
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleEditOrView = (row, isView = false) => {
	reset()
	title.value = isView ? '查看详情' : '编辑项目合同'
	isViewMode.value = isView
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.contractName = resData.contractName
			detailRef.value.formData.contractCode = resData.contractCode
			detailRef.value.formData.contractType = resData.contractType
			detailRef.value.formData.contractAmount = resData.contractAmount
			detailRef.value.formData.startDate = resData.startDate
			detailRef.value.formData.endDate = resData.endDate
			detailRef.value.formData.applyScope = resData.applyScope
			detailRef.value.formData.status = resData.status
		})
	})
}

const handleView = row => handleEditOrView(row, true)

const handleUpdate = row => handleEditOrView(row, false)

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

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'equipment:econtractinfocontract:add',
	},
])

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

const cancel = () => {
	dialogVisible.value = false
	reset()
}

const reset = () => {
	detailRef.value?.resetForm()
}

const loadContractTypeOptions = async () => {
	try {
		const res = await publicApi.getLocalSelect({ type: 'DICT', dictType: 'CONTRACT_TYPE' })
		if (res.code === '0000' && Array.isArray(res.data)) {
			contractTypeOptions.value = res.data.map(item => ({
				label: item.label ?? item.dictLabel ?? item.name ?? '',
				value: item.value ?? item.dictValue ?? item.id ?? '',
			}))
			return
		}
		contractTypeOptions.value = []
		proxy.$message.error(res.msg || '加载合同类型失败')
	} catch (error) {
		contractTypeOptions.value = []
		console.error('加载合同类型字典失败:', error)
		proxy.$message.error('加载合同类型失败')
	}
}

onMounted(() => {
	loadContractTypeOptions()
})

getList(queryParams.value)
</script>

<style lang="scss" scoped></style>
