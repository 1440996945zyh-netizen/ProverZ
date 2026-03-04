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
		<Dialog v-model:visible="dialogVisible" :title="title" width="40%">
			<detail ref="detailRef" />
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="cancel">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</span>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="maintenanceUnit">
import { ref, reactive, computed, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import detail from './detail/index.vue'
import api from '@/api/equipment/maintenanceUnit/index'

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
		unitName: undefined,
		externalCompanyCode: undefined,
	},
})
const { queryParams } = toRefs(data)

const getServiceUnitNames = serviceUnits => {
	console.log(serviceUnits, 'serviceUnits')
	if (!serviceUnits) return ''
	let units = []
	if (typeof serviceUnits === 'string') {
		units = serviceUnits.split(',').filter(item => item && item.trim() !== '')
	} else if (Array.isArray(serviceUnits)) {
		units = serviceUnits
	} else {
		return ''
	}
	if (units.length === 0) return ''
	const serviceUnitMap = {
		1: '设备维修',
		2: '设备保养',
		3: '设备检测',
		4: '设备安装',
		5: '设备改造',
	}
	console.log(units, 'units')
	console.log(units.map(item => serviceUnitMap[item] || item).join(','), 'units.map(item => serviceUnitMap[item] || item).join(', ')')
	return units.map(item => serviceUnitMap[item] || item).join(',')
}

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{
		prop: 'type',
		label: '类型',
		align: 'center',
		width: 80,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.type === '1' ? 'primary' : 'success',
						size: 'default',
					},
					{
						default: () => {
							return row.type === '1' ? '企业' : '个人'
						},
					},
				),
			]
		},
	},
	{ label: '企业名称/个人姓名', prop: 'unitName', align: 'left', width: 180, showOverFlow: true },
	{ label: '社会信用代码/身份证号', prop: 'externalCompanyCode', align: 'left', width: 200, showOverFlow: true },
	{ label: '负责人', prop: 'principal', align: 'center', width: 100 },
	{ label: '联系方式', prop: 'phone', align: 'center', width: 120 },
	// {
	// 	prop: 'contractDateStart',
	// 	label: '委外合同开始期限',
	// 	align: 'center',
	// 	width: 180,
	// },
	// {
	// 	prop: 'contractDateEnd',
	// 	label: '委外合同结束期限',
	// 	align: 'center',
	// 	width: 180,
	// },
	{
		prop: 'contractDateRange',
		label: '委外合同期限',
		align: 'center',
		width: 200,
		render: row => {
			if (row.contractDateStart && row.contractDateEnd) {
				return h('span', `${row.contractDateStart} 至 ${row.contractDateEnd}`)
			}
			return h('span', '')
		},
	},
	{
		prop: 'serviceCompanies',
		label: '服务单位',
		align: 'left',
		minWidth: 200,
		showOverFlow: true,
		render: row => {
			return h('span', getServiceUnitNames(row.serviceCompanies))
		},
	},
	{ label: '维修范围', prop: 'repairType', align: 'left', minWidth: 200, showOverFlow: true },
	{ label: '备注', prop: 'remark', align: 'left', width: 200, showOverFlow: true },
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
						permission: 'equipment:emequiprepaircontract:update',
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
						permission: 'equipment:emequiprepaircontract:delete',
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
		name: '企业名称/个人姓名',
		type: 'input',
		modelValue: 'unitName',
		span: 12,
	},
	{
		name: '社会信用代码/身份证号',
		type: 'input',
		modelValue: 'externalCompanyCode',
		span: 12,
	},
])

const buttonList = reactive([
	{
		label: '新增',
		type: 'primary',
		icon: 'Plus',
		click: () => handleAdd(),
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
	title.value = '新增维修单位'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
	})
}

const handleUpdate = row => {
	title.value = '编辑维修单位'
	dialogVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm()
		api.getById(row.id).then(response => {
			const resData = JSON.parse(JSON.stringify(response.data))
			detailRef.value.formData.id = resData.id
			detailRef.value.formData.unitType = resData.unitType || '1'
			detailRef.value.formData.unitName = resData.unitName
			detailRef.value.formData.externalCompanyCode = resData.externalCompanyCode
			detailRef.value.formData.principal = resData.principal
			detailRef.value.formData.phone = resData.phone
			detailRef.value.formData.contractDateStart = resData.contractDateStart
			detailRef.value.formData.contractDateEnd = resData.contractDateEnd
			if (resData.serviceCompanies) {
				if (typeof resData.serviceCompanies === 'string') {
					detailRef.value.serviceCompaniesArray = resData.serviceCompanies.split(',').filter(item => item && item.trim() !== '')
				} else {
					detailRef.value.serviceCompaniesArray = resData.serviceCompanies || []
				}
			} else {
				detailRef.value.serviceCompaniesArray = []
			}
			detailRef.value.formData.repairType = resData.repairType
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
	padding: 20px;
}
</style>
