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
		<el-drawer v-model="assignFleetVisible" title="指派物流车队" size="80%">
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

<script setup name="assignFleet">
import BaseTable from '@/components/BaseTable/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/assignFleet/index'
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
	},
	{
		prop: 'tbtProcessName',
		label: '作业过程',
	},
	{
		prop: 'tbtCompanyName',
		label: '作业公司',
	},
	{
		prop: 'shipNameVoyage',
		label: '船名_航次',
	},
	{
		prop: 'tbtcCargoOwnerName',
		label: '货主',
		width: 110,
	},

	{
		prop: 'tbtcCargoAgentName',
		label: '货代',
	},
	{
		prop: 'tbtcCargoName',
		label: '货名',
	},
	{
		prop: 'customerNames',
		label: '车队名称',
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
						permission: 'business:assignFleet:update', // 权限
					},
					{
						default: () => '指派物流车队',
					}
				),
				// h(
				// 	ElButton,
				// 	{
				// 		onClick: () => {
				// 			handleDelete(row)
				// 		},
				// 		type: 'danger',
				// 		link: true,
				// 		icon: 'Delete',
				// 	},
				// 	{
				// 		default: () => '删除',
				// 	}
				// ),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '通知单编号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'trustNo', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '作业过程', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'processCode', // 绑定字段
		span: 4, // 占位，共24
		dataConfig: {
			params: {
				type: 'MAIN_WORK_PROCESS',
			},
		},
	},
	{
		name: '作业公司', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'companyId', // 绑定字段
		span: 4, // 占位，共24
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
	{
		name: '货主', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoOwnerId', // 绑定字段
		span: 4, // 占位，共24
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '货代', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoAgentId', // 绑定字段
		span: 4, // 占位，共24
		dataType: 'CUSTOMER_CARGO_AGENT',
	},
	{
		name: '货名', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoCode', // 绑定字段
		span: 4, // 占位，共24
		dataType: 'CARGO_INFO',
	},
	{
		name: '车队', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'customerId', // 绑定字段
		span: 2, // 占位，共24
		dataType: 'CUSTOMER_FLEET',
	},
	{
		name: '航次', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'shipvoyageItemId', // 绑定字段
		span: 2, // 占位，共24
		dataType: 'VOYAGE',
	},
])
const buttonList = reactive([])
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
// 编辑事件
const edit = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	assignFleetVisible.value = true
	title.value = '编辑'
	clickRow.value = editRow
	console.log(editRow.assignFleets)
	editRow.assignFleets.forEach(item => {
		if (item.tbttrIds.length) {
			item.tbttrId = true
		} else {
			item.tbttrId = false
		}
	})
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		proxy.setFormData(detailRef.value.formData, editRow)
	})
}
//保存事件
const save = async () => {
	let allTon = ''
	let allQuantity = ''

	detailRef.value.formData.assignFleets.forEach(item => {
		item.trustId = clickRow.value.tbtcTrustId
		allTon = Number(allTon) + Number(item.ton)
		allQuantity = Number(allQuantity) + Number(item.quantity)
	})
	if (Number(clickRow.value.tbtcQuantity) < Number(allQuantity) || Number(clickRow.value.tbtcTon) < Number(allTon)) {
		proxy.$message.error('车队信息的总重量和总件数不能大于票货信息的量和件')
		return
	}
	let params = {
		trustCargoId: clickRow.value.tbtcId,
		assignFleets: detailRef.value.formData.assignFleets,
	}
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			api.update(params).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				assignFleetVisible.value = false
			})
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
