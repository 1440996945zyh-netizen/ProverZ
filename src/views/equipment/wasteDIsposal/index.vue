<template>
	<div class="app-container">
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
		<Drawer v-model="open" :title="title" size="70%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">{{ title === '查看详情' ? '关闭' : '取消' }}</el-button>
					<el-button type="primary" @click="submitForm" v-if="title !== '查看详情'">确定</el-button>
				</span>
			</template>
		</Drawer>
	</div>
</template>

<script setup name="maintenancePersonnel">
import { ref, reactive, getCurrentInstance, toRefs, h, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/wasteDIsposal/index'
import publicApi from '@/api/public/index.js'
import { init } from 'echarts'

const { proxy } = getCurrentInstance()

const baseTable = ref()
const total = ref('')
const tableData = ref([])
const loading = ref(false)
const open = ref(false)
const title = ref('')
const detailRef = ref(null)

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		disposalNum: undefined,
		disposalTitle: undefined,
	},
})
const { queryParams } = toRefs(data)

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '处置编号', prop: 'disposalNum', align: 'left', minWidth: 180, showOverFlow: true },
	{ label: '处置主题', prop: 'disposalTitle', align: 'center', minWidth: 100 },
	{ label: '处置类型', prop: 'dictLabel', align: 'center', minWidth: 180 },
	{ label: '处置金额合计', prop: 'disposalAmount', align: 'center', minWidth: 120 },
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
						permission: 'equipment:EMaterialWasteDisposal:update',
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
						permission: 'equipment:EMaterialWasteDisposal:delete',
					},
					{
						default: () => '删除',
					},
				),
			]
		},
	},
])
const unitOptions = ref([])

const selectData = reactive([
	// {
	// 	name: '单位',
	// 	type: 'select',
	// 	modelValue: 'repairContarctId',
	// 	modelLabel: 'repairContarctName',
	// 	span: 12,
	// 	selectData: unitOptions,
	// },
	{
		name: '处置编号',
		type: 'input',
		modelValue: 'disposalNum',
		span: 12,
	},
	{
		name: '处置主题',
		type: 'input',
		modelValue: 'disposalTitle',
		span: 12,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd,
		permission: 'system:user:add',
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
	open.value = false
	reset()
}

const reset = () => {
	detailRef.value?.resetForm()
}

const handleAdd = () => {
	reset()
	title.value = '新增维修人员'
	open.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.setFormDisabled(false)
	})
}

const handleEditOrView = (row, isView = false) => {
	reset()
	title.value = isView ? '查看详情' : '编辑废旧物资'
	open.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		detailRef.value.setFormDisabled(isView)
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.disposalTitle = resData.disposalTitle
			detailRef.value.formData.disposalType = resData.disposalType
			detailRef.value.formData.disposalAmount = resData.disposalAmount
			detailRef.value.list = resData.list || []
		})
	})
}

const handleView = row => handleEditOrView(row, true)

const handleUpdate = row => handleEditOrView(row, false)

const submitForm = async () => {
	if (await detailRef.value.validate()) {
		if( detailRef.value.list.length == 0){
			proxy.$modal.msgError('请添加废旧物资详情！')
			return
		}
		const params = {
			...detailRef.value.formData,
			list: detailRef.value.list,
		}
		if (params.id) {
			api.update(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
				getList()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				open.value = false
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

const getUnitList = () => {
	api.queryUnitName({}).then(res => {
		if (res.code === '0000') {
			unitOptions.value = res.data.map(item => ({
				label: item.unitName || item.repairContarctName || item.name,
				value: item.id || item.unitId || item.repairContarctId,
			}))
		}
	})
}

onMounted(() => {
	getUnitList()
	getList(queryParams.value)
})
</script>

<style lang="scss" scoped></style>
