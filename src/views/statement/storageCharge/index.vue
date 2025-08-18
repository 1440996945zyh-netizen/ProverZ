<!-- 堆存费 -->
<template>
	<div class="app-container">
		<BaseTable
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:cellClickEvent="cellClickEvent"
			:tableHeight="'tabTableHeightTwo'"
		/>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title=" 历史结算信息" name="1">
				<BaseTable ref="baseTableRef" :tableColumns="historyColumns" :tableData="historyData" :tableHeight="300" />
			</el-collapse-item>
		</el-collapse>
	</div>
	<!-- 新增，修改抽屉组件 -->
	<el-drawer v-model="clientVisible" :title="title" size="70%">
		<Drawer ref="drawerRef" @childrenEmit="childrenEmit" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="clientVisible = false">取 消</el-button>
				<el-button type="primary" @click="save" :disabled="isDisabled">保 存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="storageCharge">
import Drawer from './drawer/index.vue'
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import api from '@/api/statement/storageCharge/index'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()
const clientVisible = ref(false) //抽屉
const collapseOpen = ['1'] // 打开的面板
const title = ref('堆存费结算')
const drawerRef = ref(null)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const total = ref(0)
//顶部 搜索表单
const selectData = reactive([
	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 12,
		dataType: 'VOYAGE',
	},
	{
		name: '客户',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 12,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
])

const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '作业公司', prop: 'companyName' },
	{ label: '船名航次', prop: 'shipVoyageName' },
	{ label: '货主', prop: 'cargoOwnerName' },
	{ label: '货代', prop: 'cargoAgentName' },
	{ label: '装卸', prop: 'loadUnload' },
	{ label: '件杂', prop: 'workType',align:'center',width:'100'},
	{ label: '货物', prop: 'cargoName' },
	{ label: '件数', prop: 'quantity', align: 'right' },
	{ label: '重量', prop: 'ton', align: 'right' },
	{
		label: '是否完货',
		prop: 'isClear',
		align: 'right',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isClear === '1' ? '' : 'info',
					},
					{
						default: () => (row.isClear == 1 ? '是' : '否'),
					}
				),
			]
		},
	},
	// { label: '状态', prop: 'status' },
])

const tableData = ref([])
const isDisabled = ref(false)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '堆存费结算', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addMiscBilling, // 回调函数
		permission: 'business:customer:add', // 权限
	},
])
// 历史结算信息表格数据
const baseTableRef = ref(null)
const historyData = ref([])
const historyColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
		prop: 'startDate',
		label: '开始日期',
		align: 'center',
	},
	{
		prop: 'endDate',
		label: '结束日期',
		align: 'center',
	},
	{
		prop: 'amount',
		label: '结算金额',
		align: 'right',
	},
	{
		prop: 'totalEntry',
		label: '进',
		align: 'right',
	},
	{
		prop: 'totalAppearance',
		label: '出',
		align: 'right',
	},
	{
		prop: 'settlementDays',
		label: '结算天数',
		align: 'right',
	},
	{
		prop: 'createByNm',
		label: '创建人',
	},
	{
		prop: 'createTime',
		label: '创建时间',
	},
	{
		prop: 'status',
		label: '状态',
		align: 'center',
		render: row => {
			return [h('div', {}, row.status == '1' ? '已生成' : '未生成')]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 260,
		// fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							getSettlement(row)
						},
						type: row.status == '1' ? 'danger' : 'primary',
						// type: 'primary',
						link: true,
						icon: 'Edit',
						// disabled: row.status == '1',
						permission: 'business:customer:update', // 权限
					},
					{
						// default: () => '计费审核',
						default: () => (row.status == '1' ? '取消计费审核' : '计费审核'),
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							// console.log(row)
							businessAffirm(row)
						},
						type: row.statementStatus == '31' ? 'danger' : 'primary',
						link: true,
						icon: 'Edit',
						disabled: row.status == '0',
						permission: 'business:customer:update', // 权限
					},
					{
						default: () => (row.statementStatus == '31' ? '取消商务确认' : '商务确认'),
					}
				),
			]
		},
	},
])
// 生成结算清单
const getSettlement = val => {
	if (val.status == '1') {
		proxy.$modal.confirm('是否确定取消计费审核？').then(() => {
			api.cancelstatement(val.id).then(res => {
				// console.log('取消计费审核', res)
				proxy.$modal.msgSuccess(res.msg)
				getHistoryData()
			})
		})
	} else {
		proxy.$modal.confirm('是否确定计费审核？').then(() => {
			let data = {
				historyGid: val.id,
				cargoInfoId: val.cargoInfoId,
			}
			api.generatestatement(data).then(res => {
				// console.log('结算清单', res)
				proxy.$modal.msgSuccess(res.msg)
				getHistoryData()
			})
		})
	}
}
// 商务确认
const businessAffirm = val => {
	if (val.statementStatus == '30') {
		proxy.$modal.confirm('是否确定商务确认？').then(() => {
			api.confirm(val.id).then(res => {
				getList(queryParams.value)
				getHistoryData()
				proxy.$modal.msgSuccess(res.msg)
			})
		})
	} else {
		proxy.$modal.confirm('是否确定取消商务确认？').then(() => {
			api.cancelConfirm(val.id).then(res => {
				getList(queryParams.value)
				getHistoryData()
				proxy.$modal.msgSuccess(res.msg)
			})
		})
	}
}
const clickRow = ref(null)
// 行点击事件
const cellClickEvent = ({ row }) => {
	// console.log(row)
	clickRow.value = row
	getHistoryData()
}
// 获取历史结算数据
const getHistoryData = () => {
	// console.log('再次刷新')
	let data = {
		customerId: clickRow.value.cargoAgentId, //货主
		companyId: clickRow.value.companyId, //作业公司
		cargoInfoId: clickRow.value.cargoInfoId,
	}
	api.getInitstoragecharge(data).then(res => {
		// console.log('历史结算信息', res)
		historyData.value = res.data.hisList //历史结算信息
	})
}
// 堆存费结算
const addMiscBilling = () => {
	if (!clickRow.value) {
		proxy.$modal.msgWarning('请选择需要结算的数据')
		return
	}
	isDisabled.value = false
	clientVisible.value = true
	let data = {
		customerId: clickRow.value.cargoAgentId, //货主
		companyId: clickRow.value.companyId, //作业公司
		cargoInfoId: clickRow.value.cargoInfoId,
	}
	nextTick(() => {
		drawerRef.value.resetForm() // 清空事件
		api.getInitstoragecharge(data).then(res => {
			// console.log('获取合同信息', res)
			drawerRef.value.storageTableData = res.data.storageDetailList //场存信息
			drawerRef.value.contractDataList = res.data.contractList //合同
			drawerRef.value.formData.startDate = res.data.lastDate //开始时间
			drawerRef.value.formData.isFinal = '0' //是否最终结算
			drawerRef.value.historyData = res.data.hisList //历史结算信息
			drawerRef.value.cargoInfoId = clickRow.value.cargoInfoId //票货gid
			drawerRef.value.cargoCode = clickRow.value.cargoCode //货物code
		})
	})
}
// 触发自定义事件判断弹出框是否禁用
const childrenEmit = val => {
	switch (val) {
		case 'disabled': {
			isDisabled.value = true
			break
		}
		case 'refresh': {
			addMiscBilling()
			getHistoryData()
			break
		}
		default: {
			break
		}
	}
}
const getList = e => {
	queryParams.value = e
	api.getHandoverList(e).then(res => {
		if (res.code === '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}
// 保存事件
const save = async () => {
	if (await drawerRef.value.validate()) {
		if (drawerRef.value.storageFeeDetailData.length == 0) {
			proxy.$modal.msgWarning('未查到堆存费！')
			return
		}
		proxy.$modal.confirm('确定保存？').then(res => {
			api.getSavestoragefeesdata(drawerRef.value.saveData).then(res => {
				// console.log('数据保存', res)
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				getHistoryData()
				clientVisible.value = false
			})
		})
	}
}
onMounted(() => {
	getList()
})
</script>

<style scoped></style>
