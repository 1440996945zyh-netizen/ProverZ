<template>
	<div class="app-container">
		<div class="statistics-container">
			<div class="statistics-card total-card">
				<div class="card-content">
					<div class="card-title">单位总数</div>
					<div class="card-value">{{ statistics.total }}</div>
				</div>
			</div>
			<div class="statistics-card internal-card">
				<div class="card-content">
					<div class="card-title">内部单位数</div>
					<div class="card-value">{{ statistics.internal }}</div>
				</div>
			</div>
			<div class="statistics-card external-card">
				<div class="card-content">
					<div class="card-title">外部单位数</div>
					<div class="card-value">{{ statistics.external }}</div>
				</div>
			</div>
		</div>
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

<script setup name="maintenanceUnit">
import { ref, reactive, computed, getCurrentInstance, toRefs, h } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from '@/components/Drawer/index.vue'
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

const statistics = ref({
	total: 0,
	internal: 0,
	external: 0,
})

const data = reactive({
	queryParams: {
		startPage: 1,
		pageSize: 20,
		unitName: undefined,
		externalCompanyCode: undefined,
	},
})
const { queryParams } = toRefs(data)

// const getServiceUnitNames = serviceUnits => {
// 	console.log(serviceUnits, 'serviceUnits')
// 	if (!serviceUnits) return ''
// 	let units = []
// 	if (typeof serviceUnits === 'string') {
// 		units = serviceUnits.split(',').filter(item => item && item.trim() !== '')
// 	} else if (Array.isArray(serviceUnits)) {
// 		units = serviceUnits
// 	} else {
// 		return ''
// 	}
// 	if (units.length === 0) return ''
// 	const serviceUnitMap = {
// 		1: '设备维修',
// 		2: '设备保养',
// 		3: '设备检测',
// 		4: '设备安装',
// 		5: '设备改造',
// 	}
// 	console.log(units, 'units')
// 	console.log(units.map(item => serviceUnitMap[item] || item).join(','), 'units.map(item => serviceUnitMap[item] || item).join(', ')')
// 	return units.map(item => serviceUnitMap[item] || item).join(',')
// }

const tableColumns = ref([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{
		prop: 'entityType',
		label: '类型',
		align: 'center',
		width: 80,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.entityType === '1' ? 'primary' : 'success',
						size: 'default',
					},
					{
						default: () => {
							return row.entityType === '1' ? '企业' : '个人'
						},
					},
				),
			]
		},
	},
	{
		prop: 'outType',
		label: '内外部',
		align: 'center',
		width: 80,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.outType === '1' ? 'info' : 'warning',
						size: 'default',
					},
					{
						default: () => {
							return row.outType === '1' ? '内部' : '外部'
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
	{
		prop: 'contractDateRange',
		label: '委外合同期限',
		align: 'center',
		width: 200,
		render: row => {
			if (row.outType === '2' && row.contractDateStart && row.contractDateEnd) {
				return h('span', `${row.contractDateStart} 至 ${row.contractDateEnd}`)
			}
			return h('span', '')
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
			getStatistics()
		} else {
			proxy.$message.error(res.msg)
		}
	})
}

const getStatistics = () => {
	api.getList({ startPage: 1, pageSize: 9999 }).then(res => {
		if (res.code == '0000') {
			const allData = res.data.pages || []
			statistics.value.total = allData.length
			statistics.value.internal = allData.filter(item => item.outType === '1').length
			statistics.value.external = allData.filter(item => item.outType === '2').length
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
			detailRef.value.formData.entityType = resData.entityType || '1'
			detailRef.value.formData.outType = resData.outType || '1'
			detailRef.value.formData.unitName = resData.unitName
			detailRef.value.formData.externalCompanyId = resData.externalCompanyId
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
				getStatistics()
			})
		} else {
			api.add(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				dialogVisible.value = false
				getList()
				getStatistics()
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
			getStatistics()
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

.statistics-container {
	margin-bottom: 16px;
	display: flex;
	gap: 12px;
	width: fit-content;
	flex-shrink: 0;
}

.table-wrapper {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.statistics-card {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px 28px;
	border-radius: 8px;
	background: #fff;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	border: 1px solid #e8eaed;
	min-width: 200px;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
		pointer-events: none;
		z-index: 0;
	}

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}
}

.card-content {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	position: relative;
	z-index: 1;
	min-width: 0;
	gap: 24px;
}

.card-title {
	font-size: 16px;
	color: #606266;
	margin: 0;
	font-weight: 600;
	letter-spacing: 0.1px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-value {
	font-size: 32px;
	font-weight: 700;
	color: #303133;
	line-height: 1;
	letter-spacing: -0.5px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.total-card {
	background: linear-gradient(135deg, rgba(82, 106, 214, 1) 0%, rgba(98, 55, 142, 1) 100%);

	.card-value {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
}

.internal-card {
	background: linear-gradient(135deg, rgba(59, 152, 234, 1) 0%, rgba(0, 222, 234, 1) 100%);

	.card-value {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
}

.external-card {
	background: linear-gradient(135deg, rgb(230, 136, 92) 0%, rgba(234, 205, 44, 1) 100%);

	.card-value {
		background: linear-gradient(135deg, #fa9070 0%, #fee140 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
}
</style>
