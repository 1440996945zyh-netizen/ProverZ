<template>
	<div>
		<div class="app-container">
			<BaseTable
				ref="baseTable"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:total="total"
			/>
		</div>
		<el-drawer v-model="assignFleetVisible" :title="title" size="80%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="assignFleetVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="portReservation">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/portReservation/index'
import { ref, reactive, nextTick, onMounted, h, watch, getCurrentInstance } from 'vue'
import { ElButton } from 'element-plus'
import { ElTag } from 'element-plus'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const total = ref('') // 数据总数
const title = ref('')
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{
		prop: 'tbtTrustNo',
		label: '通知单编号',
		width: 160,
	},
	{
		prop: 'tbtProcessName',
		label: '作业过程',
		width: 110,
	},
	{
		prop: 'tbtCompanyName',
		label: '作业公司',
		width: 110,
	},
	{
		prop: 'shipNameVoyage',
		label: '船名航次',
		width: 160,
	},
	{
		prop: 'tbtcCargoOwnerName',
		label: '货主',
		width: 120,
	},
	{
		prop: 'tbtcCargoAgentName',
		label: '货代',
		width: 110,
	},
	{
		prop: 'tbtcCargoName',
		label: '货名',
		width: 110,
	},
	{
		prop: 'customerName',
		label: '车队名称',
		width: 110,
	},
	{
		prop: 'startTime',
		label: '开始时间',
		width: 'time',
	},
	{
		prop: 'endTime',
		label: '结束时间',
		width: 'time',
	},
	{
		prop: 'quantity',
		label: '预约件数',
		width: 160,
	},
	{
		prop: 'ton',
		label: '预约重量',
		width: 160,
	},
	{
		label: '状态',
		prop: 'status',
		fixed: 'right',
		width: 'status',
		render: row => {
			let typeFlag = ''
			typeFlag = row.status == 10 ? 'success' : row.status == 20 ? 'danger' : 'info'
			let textFlag = ''
			textFlag = row.status == 10 ? '已审核' : row.status == 20 ? '核销' : '待审核'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => textFlag,
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 'operate',
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:portReservation:update', // 权限
					},
					{
						default: () => '编辑',
					}
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
						permission: 'business:portReservation:delete', // 权限
					},
					{
						default: () => '删除',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '船名航次', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'shipvoyageItemId', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'VOYAGE',
	},
	{
		name: '货主', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoOwnerId', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '货代', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoAgentId', // 绑定字段
		span: 8, // 占位，共24
		dataType: 'CUSTOMER_CARGO_AGENT',
	},
	{
		name: '货名', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoCode', // 绑定字段
		span: 2, // 占位，共24
		dataType: 'CARGO_INFO',
	},
])
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'business:portReservation:add', // 权限
	},
])
const assignFleetVisible = ref(false)

const clickRow = reactive({})
// 点击查询的事件
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
		clickRow.value = {}
	})
}
// 新增事件
const add = () => {
	assignFleetVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		detailRef.value.availableData.trustTradeReservationId = ''
		proxy.$bus.emit('resetFileList')
	})
}

// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	assignFleetVisible.value = true
	title.value = '编辑'
	clickRow.value = editRow
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		api.getotherList(editRow.trustCargoId).then(res => {
			detailRef.value.formData.id = editRow.id
			detailRef.value.formData.trustCargoId = res.data[0].tbtcId
			detailRef.value.formData.tbtTrustNo = res.data[0].tbtTrustNo
			detailRef.value.formData.trustId = res.data[0].tbtcTrustId
			detailRef.value.formData.tbtProcessName = res.data[0].tbtProcessName
			detailRef.value.formData.tbtCompanyName = res.data[0].tbtCompanyName
			detailRef.value.formData.shipNameVoyage = res.data[0].shipNameVoyage
			detailRef.value.formData.tbtcCargoOwnerName = res.data[0].tbtcCargoOwnerName
			detailRef.value.formData.tbtcCargoAgentName = res.data[0].tbtcCargoAgentName
			detailRef.value.formData.tbtcCargoName = res.data[0].tbtcCargoName
			detailRef.value.formData.tbtcQuantity = res.data[0].tbtPlanQuantity
			detailRef.value.formData.tbtcTon = res.data[0].tbtPlanTon
			detailRef.value.formData.tbtTradeType = res.data[0].tbtTradeType
			detailRef.value.formData.assignFleets = res.data[0].assignFleets
			detailRef.value.formData.customerId = editRow.customerId
			detailRef.value.formData.customerName = editRow.customerName
			detailRef.value.formData.ton = editRow.ton
			detailRef.value.formData.quantity = editRow.quantity
			detailRef.value.formData.cars = editRow.cars
			detailRef.value.formData.times = [editRow.startTime, editRow.endTime]
			// 预约赋值
			if (res.data[0].assignFleets.length > 0) {
				detailRef.value.availableData.assignFleetId = res.data[0].assignFleets.filter(
					item => item.customerId == editRow.customerId
				)[0].id
				detailRef.value.availableData.trustTradeReservationId = editRow.id
			}
			detailRef.value.getAvailable()
		})
	})
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	proxy.$modal
		.confirm('确定删除？')
		.then(res => {
			api.delete(deleteRow.id).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
			})
		})
		.catch(err => {})
}
//保存事件
const save = async () => {
	if (await detailRef.value.validate()) {
		if (detailRef.value.formData.times.length > 0) {
			detailRef.value.formData.startTime = detailRef.value.formData.times[0]
			detailRef.value.formData.endTime = detailRef.value.formData.times[1]
		}
		if (detailRef.value.formData.cars.length == 0) {
			proxy.$message.warning('车辆信息至少有一条数据！')
			return
		}
		console.log(detailRef.value.formData.cars)
		proxy.$modal.confirm('确定保存？').then(res => {
			if (title.value == '编辑') {
				api.update(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					assignFleetVisible.value = false
				})
			} else if (title.value == '新增') {
				delete detailRef.value.formData.id
				api.insert(detailRef.value.formData).then(res => {
					proxy.$message.success(res.msg)
					getList(queryParams.value)
					assignFleetVisible.value = false
				})
			}
		})
	}
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 监听
watch(assignFleetVisible, newVal => {
	if (newVal == false) {
		getList(queryParams.value)
	}
})
getList(queryParams.value)
</script>
