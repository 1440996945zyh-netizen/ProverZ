<template>
	<div class="app-container">
		<SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

		<el-tabs v-model="mainTab" type="card" class="demo-tabs" @tab-click="handleMainClick">
			<el-tab-pane label="船舶计划" name="1">
				<BaseTable
					class="tab_table"
					:tableColumns="shipTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="零工计划" name="2">
				<BaseTable
					class="tab_table"
					:tableColumns="jobTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="集疏港计划" name="3">
				<BaseTable
					class="tab_table"
					:tableColumns="harborableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
			<el-tab-pane label="转运计划" name="4">
				<BaseTable
					class="tab_table"
					:tableColumns="transferTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:cellClickEvent="cellClickEvent"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>
	<el-drawer v-model="detailVisible" size="89%">
		<template #title>
			<div>
				<span>签票</span>
				<span style="margin-left: 20px" v-if="queryParams.planType !== '4'">
					配工情况:流机队:
					{{ statusList.flowStatus == '1' ? '已配工' : '未配工' }}&nbsp;&nbsp;固机队:{{
						statusList.fixedStatus == '1' ? '已配工' : '未配工'
					}}&nbsp;&nbsp;装卸队:{{ statusList.laborStatus == '1' ? '已配工' : '未配工' }}
				</span>
			</div>
		</template>
		<detail ref="detailRef" />
		<template #footer>
			<div>
				<el-button @click="detailVisible = false">取消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</template>
	</el-drawer>
	<el-drawer v-model="bulkCargoTallyVisible" title="散货理货" size="89%">
		<bulkCargoTally ref="bulkCargoTallyRef" />
	</el-drawer>
	<el-drawer v-model="tallyVisible" title="理货记录" size="89%">
		<el-form :inline="true" :model="queryPage" class="demo-form-inline" style="margin: 10px 0 0 10px">
			<el-form-item label="作业机械">
				<el-input v-model="queryPage.equipmentNo" placeholder="作业机械" clearable />
			</el-form-item>
			<el-form-item label="车号">
				<el-input v-model="queryPage.transportEquipmentNo" placeholder="车号" clearable />
			</el-form-item>
			<el-form-item label="作业过程">
				<Select
					style="display: inline-block"
					:selectData="processData"
					selectValue="processCode"
					selectLabel="processName"
					v-model:value="queryPage.processCode"
					placeholder="作业过程"
				/>
			</el-form-item>
			<el-form-item label="货名">
				<el-input v-model="queryPage.cargoName" placeholder="货名" clearable />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="gettableList">查询</el-button>
			</el-form-item>
		</el-form>
		<BaseTable class="tab_table" :tableColumns="tallyTableColumns" :tableData="tallytableData" :tableHeight="450" />
		<div class="pagination-container">
			<el-pagination
				background
				v-model:current-page="queryPage.startPage"
				v-model:page-size="pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 30, 50]"
				:total="queryPage.total"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>
		<template #footer>
			<div>
				<el-button @click="tallyVisible = false">取消</el-button>
				<!-- <el-button type="primary" @click="save">保存</el-button> -->
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="workTicket">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/workTicket/index.js'
import Select from '@/components/Select'
import { ElTag } from 'element-plus'
import detail from './detail/index'
import bulkCargoTally from './bulkCargoTally/index'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const detailRef = ref(null) // 明细组件ref
const detailVisible = ref(false)
const bulkCargoTallyVisible = ref(false)
// 表格数据
const SearchHeaderRef = ref()
// 抽屉列表状态
const statusList = ref({
	flowStatus: '',
	fixedStatus: '',
	laborStatus: '',
})
const selectData = reactive([
	{
		type: 'date',
		modelValue: 'workDate',
		span: 12,
		name: '选择日期',
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
	{
		name: '',
		type: '', //空的站格子
		modelValue: '', //
		span: 0,
		dataType: '',
	},
	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 3,
		dataType: 'VOYAGE',
	},
	{
	  name: '通知单号',
	  type: 'input',
	  modelValue: 'trustNo',
	  span: 3,
	},
	{
		name: '货主', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoOwnerId', // 绑定字段
		span: 3, // 占位，共24
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	{
		name: '货名', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoCode', // 绑定字段
		span: 3, // 占位，共24
		dataType: 'CARGO_INFO',
	},
	{
		name: '作业区', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'portCode', // 绑定字段
		span: 3, // 占位，共24
		selectData: [
			{ label: '东港', value: '01' },
			{ label: '中港', value: '02' },
			{ label: '西港', value: '03' },
		],
	},
	{
		name: '包装',
		type: 'select',
		modelValue: 'packageCode',
		span: 2,
		dataConfig: { params: { type: 'DICT', dictType: 'PACKAGE_TYPE' } },
	},
])

//主列表查询条件
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	planType: '1',
	workDate: '',
	classCode: '',
	packageCode: '',
	portCode: '',
	cargoCode: '',
	cargoOwnerId: '',
	shipvoyageItemId: '',
})

// header按钮参数
const buttonList = reactive([
	{
		label: '调度签票', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => getDispatchTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		disabled: true,
	},
	{
		label: '理货签票', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => getTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		disabled: true,
	},
	// {
	// 	label: '取消签票', // 按钮名称
	// 	type: 'primary', // 按钮类型
	// 	click: () => delTicket, // 回调函数
	// 	permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
	// 	// disabled: true,
	// },
	{
		label: '理货记录', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => tallyRecord, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		// disabled: true,
	},
	{
		label: '散货理货', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => bulkCargoTally2, // 回调函数
		permission: 'machine:tMacTerminal:query', // 权限
		// disabled: true,
	},
	{
		label: '调度撤销', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => dispatchRepeal, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		// disabled: true,
	},
	{
		label: '库场撤销', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => storageRepeal, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		// disabled: true,
	},
])

// 列表数据
const getList = async e => {
	buttonList[0].disabled = true
	buttonList[1].disabled = true
	queryParams.value = Object.assign(queryParams.value, e)
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		loading.value = false
		return
	}
	// console.log('查询条件', queryParams.value)
	await api.listWorkPlan(queryParams.value).then(res => {
		// console.log('表格数据', res)
		tableData.value = res.data
	})
}

// 调度撤销
const dispatchRepeal = () => {
	if (!clickRow.value) {
		proxy.$modal.msgError('请选择一条数据')
		return
	}
	let data = {
		workPlanId: clickRow.value.id,
		type: 1,
	}
	getDelete(data)
}
const getDelete = data => {
	proxy.$modal.confirm('确定撤销？').then(() => {
		api.getDeleteTicket(data).then(res => {
			console.log(res)
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('撤销成功')
				getList(queryParams.value)
			}
		})
	})
}
// 库场撤销
const storageRepeal = () => {
	if (!clickRow.value) {
		proxy.$modal.msgError('请选择一条数据')
		return
	}
	let data = {
		workPlanId: clickRow.value.id,
		type: 2,
	}
	getDelete(data)
}
// 删除作业票
// const delTicket = () => {
// 	// console.log('删除作业票', clickRow.value)
// 	if (!clickRow.value) {
// 		proxy.$message.warning('请先选择需要删除的作业票信息！')
// 		return
// 	}
// 	const delId = clickRow.value.id
// 	// console.log('删除id', delId)
// 	proxy.$modal.confirm('确定删除？').then(() => {
// 		api.getDeleteTicket(delId).then(res => {
// 			console.log(res)
// 			if (res.code === '0000') {
// 				proxy.$modal.msgSuccess('删除成功')
// 				getList(queryParams.value)
// 			}
// 		})
// 	})
// }
// 调度签票
const getDispatchTicket = () => {
	getJurisdiction(1)
}
// 获取权限进行编辑回显
const getJurisdiction = val => {
	detailVisible.value = true
	groupObj.groupId = ''
	groupObj.groupName = ''
	setStartEndTime(clickRow.value)
	proxy.setFormData(statusList.value, clickRow.value)
	// console.log('statusList.value', statusList.value)
	nextTick(() => {
		detailRef.value.resetTableData()
		detailRef.value.signType = val //签票类型
		console.log('detailRef.value.signType', detailRef.value.signType)
		// console.log('clickRow.value', clickRow.value)
		detailRef.value.groupFlag = ''
		detailRef.value.date.startTime = clickRow.value.startWorkTime
		detailRef.value.date.endTime = clickRow.value.endWorkTime
		// console.log(33, detailRef.value.date)
		detailRef.value.planType = queryParams.value.planType

		detailRef.value.getTrustCargo(clickRow.value.id, val, clickRow.value.cargoCode, clickRow.value.processCode)
		detailRef.value.getProcess(clickRow.value.processCode, clickRow.value.cargoCode, clickRow.value.id)
		detailRef.value.getHatchData(clickRow.value.hatchNum)
		detailRef.value.selectInit()
		detailRef.value.getLoginUser() //获取当前登录人信息
		detailRef.value.processCode = clickRow.value.processCode //主作业过程

		// 零工计划时可编辑列表展示字段不同
		if (queryParams.value.planType == '4') {
			detailRef.value.tableColumns = detailRef.value.jobTableColumns
		} else {
			detailRef.value.tableColumns = detailRef.value.elseTableColumns
		}
	})
}
// 打开签票抽屉
const getTicket = () => {
	getJurisdiction(2)
}
const setStartEndTime = row => {
	// let row = JSON.parse(JSON.stringify(row))
	// console.log('判断时间', row)
	if (row.classCode == '01') {
		//白班
		row.startWorkTime = row.workDate + ' 08:30'
		row.endWorkTime = row.workDate + ' 19:30'
	} else {
		//夜班
		let date = new Date(row.workDate + ' 08:30') // 创建一个特定的日期对象
		date.setDate(date.getDate() + 1) // 将日期加一天
		row.startWorkTime = row.workDate + ' 19:30'
		// console.log('date', date)
		row.endWorkTime = formatDateTime(date)
	}
}
const formatDateTime = date => {
	var y = date.getFullYear()
	var m = date.getMonth() + 1
	m = m < 10 ? '0' + m : m
	var d = date.getDate()
	d = d < 10 ? '0' + d : d
	var hh = date.getHours()
	hh = hh < 10 ? '0' + hh : hh
	var minute = date.getMinutes()
	minute = minute < 10 ? '0' + minute : minute
	var second = date.getSeconds()
	second = second < 10 ? '0' + second : second
	return y + '-' + m + '-' + d + ' ' + hh + ':' + minute
}
//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableData = ref([])
//船舶表格数据
const shipTableColumns = ref([
	{
		prop: 'isSigned',
		label: '调度签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSigned === '待签票' ? 'info' : row.isSigned === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSigned,
					}
				),
			]
		},
	},
	{
		prop: 'isSignedKc',
		label: '库场签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSignedKc === '待签票' ? 'info' : row.isSignedKc === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSignedKc,
					}
				),
			]
		},
	},
	// {
	// 	prop: 'workTicketStatusName',
	// 	label: '签票状态',
	// 	width: 100,
	// 	align: 'left',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElTag,
	// 				{
	// 					type: row.workTicketStatusName === '待审核' ? 'info' : row.workTicketStatusName === '已审核' ? 'success' : '',
	// 				},
	// 				{
	// 					default: () => row.workTicketStatusName,
	// 				}
	// 			),
	// 		]
	// 	},
	// },

	{ prop: 'trustNo', label: '通知单编号', width: 120, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', width: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		width: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 220 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
	{ prop: 'scn', label: 'SCN', width: 120, align: 'left' },
	{
		label: '舱口',
		prop: 'hatch',
		width: 80,
	},
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'left' },
	{ prop: 'berthName', label: '泊位', width: 80, align: 'left' },
	{ prop: 'massNamesSource', label: '起始位置', width: 220, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 220, align: 'left' },
	{
		prop: 'equipmentNamesFront',
		label: '前沿',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesReshipment',
		label: '转运',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesAssist',
		label: '辅助',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		width: 100,
		align: 'center',
	},
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 100,
		align: 'left',
	},
	{ prop: 'dispatchByName', label: '调度员', width: 100, align: 'left' },
	{
		prop: 'quantityPlan',
		label: '计划件数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		width: 100,
		align: 'right',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		width: 160,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		width: 160,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		width: 160,
		align: 'center',
	},
])

// 零工计划表格
const jobTableColumns = ref([
	{
		prop: 'isSigned',
		label: '调度签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSigned === '待签票' ? 'info' : row.isSigned === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSigned,
					}
				),
			]
		},
	},
	{
		prop: 'isSignedKc',
		label: '库场签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSignedKc === '待签票' ? 'info' : row.isSignedKc === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSignedKc,
					}
				),
			]
		},
	},
	{ prop: 'trustNo', label: '通知单编号', width: 120, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', width: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		width: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 220 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
	{ prop: 'workContent', label: '作业内容', width: 100, align: 'left' },
	{
		prop: 'equipmentNamesFront',
		label: '前沿',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesReshipment',
		label: '转运',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesAssist',
		label: '辅助',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		width: 100,
		align: 'center',
	},
	{ prop: 'deptName', label: '申请单位', width: 140, align: 'left' },
	{ prop: 'remark', label: '备注', width: 140, align: 'left' },
])

// 集疏港表格数据
const harborableColumns = ref([
	{
		prop: 'isSigned',
		label: '调度签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSigned === '待签票' ? 'info' : row.isSigned === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSigned,
					}
				),
			]
		},
	},
	{
		prop: 'isSignedKc',
		label: '库场签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSignedKc === '待签票' ? 'info' : row.isSignedKc === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSignedKc,
					}
				),
			]
		},
	},
	{ prop: 'trustNo', label: '通知单编号', width: 120, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', width: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		width: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 220 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
	{ prop: 'scn', label: 'SCN', width: 150, align: 'left' },
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 120,
		align: 'left',
		render: row => {
			let text1 = row.frontTallyByName ? row.frontTallyByName : ''
			let text2 = row.backTallyByName ? row.backTallyByName : ''
			let text = ''
			if (text1) {
				text = text1 + '/' + text2
			} else {
				text = text2
			}
			return [h('div', {}, text)]
		},
	},
	{ prop: 'massNamesSource', label: '起始位置', width: 220, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 220, align: 'left' },
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'quantityPlan',
		label: '计划件数',
		width: 100,
		align: 'center',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		width: 100,
		align: 'center',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		width: 180,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		width: 180,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		width: 180,
		align: 'center',
	},
])

// 转运计划表格数据
const transferTableColumns = ref([
	{
		prop: 'isSigned',
		label: '调度签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSigned === '待签票' ? 'info' : row.isSigned === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSigned,
					}
				),
			]
		},
	},
	{
		prop: 'isSignedKc',
		label: '库场签票状态',
		width: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isSignedKc === '待签票' ? 'info' : row.isSignedKc === '已签票' ? 'success' : 'warning',
					},
					{
						default: () => row.isSignedKc,
					}
				),
			]
		},
	},
	{ prop: 'trustNo', label: '通知单编号', width: 120, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', width: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		width: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 220 },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
	{ prop: 'scn', label: 'SCN', width: 150, align: 'left' },
	{
		label: '舱口',
		prop: 'hatchNum',
		width: 80,
	},
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'left' },
	{ prop: 'berthName', label: '泊位', width: 80, align: 'left' },
	{ prop: 'massNamesSource', label: '库场区域', width: 150, align: 'left' },
	{
		prop: 'equipmentNamesFront',
		label: '前沿',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesReshipment',
		label: '转运',
		modelLabel: 'moveInBerthName',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesBack',
		label: '后场',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'equipmentNamesAssist',
		label: '辅助',
		width: 180,
		align: 'canter',
	},
	{
		prop: 'laborNum',
		label: '装卸队',
		width: 100,
		align: 'center',
	},
	{
		prop: 'backTallyByName',
		label: '理货员',
		width: 70,
		align: 'left',
		render: row => {
			let text1 = row.frontTallyByName ? row.frontTallyByName : ''
			let text2 = row.backTallyByName ? row.backTallyByName : ''
			let text = ''
			if (text1) {
				text = text1 + '/' + text2
			} else {
				text = text2
			}
			return [h('div', {}, text)]
		},
	},
	{ prop: 'dispatchByName', label: '调度员', width: 70, align: 'left' },
	{
		prop: 'quantityPlan',
		label: '计划件数',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'tonPlan',
		label: '计划重量',
		editType: 'input',
		editRender: {},
		width: 100,
		align: 'center',
	},
	{
		prop: 'startTimePlan',
		label: '计划开工时间',
		editType: 'datetime',
		editRender: {},
		width: 160,
		align: 'center',
	},
	{
		prop: 'endTimePlan',
		label: '计划完工时间',
		editType: 'datetime',
		editRender: {},
		width: 160,
		align: 'center',
	},
	{
		prop: 'remark',
		label: '作业要求',
		editType: 'input',
		editRender: {},
		width: 160,
		align: 'center',
	},
])

// 主页面页签更变
const handleMainClick = tab => {
	if (tab.index === '0') {
		//更改对应的参数  进行查询
		queryParams.value.planType = '1'
	} else if (tab.index === '1') {
		queryParams.value.planType = '4'
	} else if (tab.index === '2') {
		queryParams.value.planType = '2'
	} else if (tab.index === '3') {
		queryParams.value.planType = '3'
	}
	getList(queryParams.value)
}
//分组数据
const groupList = ref([])
const clickRow = ref()
//行点击事件
const cellClickEvent = ({ row }) => {
	groupObj.groupId = ''
	groupObj.groupName = ''
	buttonList[0].disabled = false
	buttonList[1].disabled = false
	clickRow.value = JSON.parse(JSON.stringify(row))
	console.log('行点击事件', clickRow.value)
	// api.getGroupSelect(row.processCode).then(res => {
	// 	groupList.value = res.data
	// })
}

// 保存
const save = async () => {
	if (await detailRef.value.validate()) {
		let data = JSON.parse(JSON.stringify(detailRef.value.formInline))
		const params = {
			workPlanId: clickRow.value.id,
			details: [],
			labors: [],
			deptId: data.deptId,
			deptName: data.deptName,
			quantity: data.quantity,
			ton: data.ton,
			ticketType: data.ticketType,
      soure:"PC"
		}
		let dataList = []
		console.log('detailRef.value.groupTableList', detailRef.value.groupTableList)
		dataList = JSON.parse(JSON.stringify(detailRef.value.groupTableList)).map(item => {
			if (item.equipments) {
				let equipmentIds = !Array.isArray(item.equipmentId) ? item.equipmentId.split(',') : item.equipmentId
				let equipmentNos = !Array.isArray(item.equipmentNo) ? item.equipmentNo.split(',') : item.equipmentNo
				item.equipments = []
				for (let i = 0; i < equipmentIds.length; i++) {
					item.equipments.push({
						equipmentId: equipmentIds[i],
						equipmentNo: equipmentNos[i],
						equipmentTypeCode: item.equipmentTypeCode,
						equipmentTypeName: item.equipmentTypeName,
					})
				}
			}
			// console.log('item.equipments', item.equipments)
			item.equipmentId = Array.isArray(item.equipmentId) ? item.equipmentId.join(',') : item.equipmentId
			item.equipmentNo = Array.isArray(item.equipmentNo) ? item.equipmentNo.join(',') : item.equipmentNo
			item.regionIdSource = item.regionSourceId ? item.regionSourceId : '' //起点位置
			item.regionIdTarget = item.regionTargetId ? item.regionTargetId : '' //终点位置
			delete item.regionSourceId
			delete item.regionTargetId
			return item
		})
		console.log('dataList', dataList)
		// detailRef.value.groupTableList.forEach(item => {
		// 	item.details.forEach(data => {
		// 		data.groupId = item.groupId
		// 		data.groupName = item.groupName
		// 	})
		// 	dataList = dataList.concat(item.details)
		// })

		if (detailRef.value.planType != '4') {
			params.details = dataList
		} else {
			params.details = detailRef.value.tableDatatop
			params.details.map(item => {
				console.log('item.equipmentId', item.equipmentId)
				item.equipmentId = Array.isArray(item.equipmentId) ? item.equipmentId.join(',') : item.equipmentId
				item.equipmentNo = Array.isArray(item.equipmentNo) ? item.equipmentNo.join(',') : item.equipmentNo
				return item
			})
		}

		// const labourData = detailRef.value.labourData.filter(item => {
		// 	if (item.deptId) {
		// 		return item
		// 	}
		// })
		// params.labors = labourData
		// if (detailRef.value.groupFlag == '1') {
		// 	let dataList = groupList.value.filter(item => item.id == groupObj.groupId)[0].detailPOList
		// 	params.details.forEach(item => {
		// 		item.hatch = item.hatch ? item.hatch.join() : ''
		// 	})
		// } else {
		// 	params.details.forEach(item => {
		// 		item.hatch = item.hatch ? item.hatch.join() : ''
		// 	})
		// }
		api.getUserRole(params.ticketType).then(res => {
			if (res.data == 0) {
				proxy.$message.warning('暂无权限签票！')
				return
			} else {
				proxy.$modal.confirm('确定保存?').then(() => {
          params.details.forEach(item => {
            if(item.cabinNoList){
              let cabinNo = item.cabinNoList.join(',')
              item.cabinNo = cabinNo
            }
          })
					if (!detailRef.value.hasWork) {
						// 新增签票
						// return
						api.insertWorkTicket(params).then(res => {
							if (res.code === '0000') {
								proxy.$modal.msgSuccess(res.msg)
								detailVisible.value = false
								getList(queryParams.value)
							}
						})
					} else {
						// 修改签票
						console.log('修改？', params)
						api.updateWorkTicket(params).then(res => {
							if (res.code === '0000') {
								proxy.$modal.msgSuccess(res.msg)
								detailVisible.value = false
								getList(queryParams.value)
							}
						})
					}
				})
			}
		})
	}
}
// 判断分组不重复
const flagGroup = ref(true)
// 添加分组
// const addGroup = () => {
// 	if (!groupObj.groupId) {
// 		proxy.$modal.msgError('请选择分组')
// 		return
// 	}
// 	if (detailRef.value.groupTableList.filter(item => item.groupId == groupObj.groupId).length == 0) {
// 		flagGroup.value = true
// 	}
// 	if (flagGroup.value) {
// 		nextTick(() => {
// 			detailRef.value.addGroupData(groupObj, clickRow.value)
// 			flagGroup.value = false
// 		})
// 	} else {
// 		proxy.$modal.msgError('不能选择同一分组')
// 		return
// 	}
// }
// 选择分组
const groupObj = reactive({
	groupId: '',
	groupName: '',
})
// 获取默认当前时间班次
const init = async () => {
	await api.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
			queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value)
}
// --------------------------理货记录--------------------------------------------------
const tallyTableColumns = ref([
	{ prop: 'equipmentNo', label: '作业机械', align: 'center' },
	{ prop: 'transportEquipmentNo', label: '车号', align: 'center' },
	{ prop: 'processName', label: '作业过程', align: 'center' },
	{ prop: 'quantity', label: '件数', align: 'center' },
	{ prop: 'ton', label: '吨数', align: 'center' },
	{ prop: 'cargoName', label: '货名', align: 'center', width: 200 },
	{ prop: 'storehouseName', label: '场/区/垛位', align: 'center', width: 200 },
	{ prop: 'createByName', label: '理货人', align: 'center' },
	{ prop: 'createTime', label: '理货时间', align: 'center' },
])
const queryPage = ref({
	startPage: 1,
	pageSize: 10,
	total: 0,
	planId: '',
	equipmentNo: '',
	transportEquipmentNo: '',
	processCode: '',
	cargoName: '',
})
const tallytableData = ref([])
const tallyVisible = ref(false)
const processData = ref([])
const tallyRecord = () => {
	if (!clickRow.value) {
		proxy.$modal.msgError('请选择一条数据')
		return
	}
	api.getSelectData({ processCd: clickRow.value.processCode }).then(res => {
		processData.value = res.data
	})
	queryPage.value.startPage = 1
	queryPage.value.pageSize = 10
	queryPage.value.total = 0
	queryPage.value.planId = ''
	queryPage.value.equipmentNo = ''
	queryPage.value.transportEquipmentNo = ''
	queryPage.value.processCd = ''
	queryPage.value.cargoName = ''
	gettableList()
}
const bulkCargoTally2 = () => {
	bulkCargoTallyVisible.value = true
}
// 获取table数据
const gettableList = () => {
	queryPage.value.planId = clickRow.value.id
	api.getTallyRecord(queryPage.value).then(res => {
		tallytableData.value = res.data.pages
		queryPage.value.startPage = res.data.pageNum
		queryPage.value.pageSize = res.data.pageSize
		queryPage.value.total = res.data.totalNum
		tallyVisible.value = true
	})
}
// 分页
const handleSizeChange = val => {
	queryPage.value.pageSize = val
	gettableList()
}
const handleCurrentChange = val => {
	queryPage.value.startPage = val
	gettableList()
}
init()
watch(
	() => groupObj.groupId,
	(newVal, oldVal) => {
		if (newVal != oldVal) {
			flagGroup.value = true
		} else {
			flagGroup.value = false
		}
	}
)
</script>

<style lang="scss" scoped>
.done {
	margin-top: 10px;
}
</style>
