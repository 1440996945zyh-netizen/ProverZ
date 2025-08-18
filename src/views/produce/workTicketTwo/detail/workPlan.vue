<template>
	<div class="app-container">
		<SearchHeader ref="SearchHeaderRef" class="tab_header" show-num="3" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />
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
			<el-tab-pane label="辅助计划" name="2">
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
</template>

<script setup name="workTicketNew">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/workTicketTwo/index.js'
import Select from '@/components/Select'
import { ElTag } from 'element-plus'
import { reactive, ref, toRaw, nextTick } from 'vue'
import publicApi from '@/api/public/index'
import BaseTable from '@/components/BaseTable/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this

// 表格数据
const SearchHeaderRef = ref()
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

  },
	{
    name: '是否签票',
    type: 'select',
    modelValue: 'isTicket',
    span: 3,
    selectData: [{value: '待签票',label: '待签票'},{value: '已签票',label: '已签票'}],
	},
  //
	// {
	// 	name: '船名航次',
	// 	type: 'remoteSelect', //远程下拉框
	// 	modelValue: 'shipvoyageItemId', //对应字段
	// 	span: 3,
	// 	dataType: 'VOYAGE',
	// },
  {
    name: '船名',
    type: 'input',
    modelValue: 'shipName',
    span: 3,
  },
  {
    name: '航次',
    type: 'input',
    modelValue: 'voyage',
    span: 3,
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
		span: 3,
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

// 列表数据
const getList = async e => {
	queryParams.value = Object.assign(queryParams.value, e)
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}
  await api.listWorkPlan(queryParams.value).then(res => {
    tableData.value = res.data
		clickRow.value = null
  })
  
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
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
  { prop: 'scn', label: 'SCN', width: 120, align: 'left' },
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
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
  { prop: 'planNo', label: '计划号', width: 120, align: 'left' },
	// { prop: 'cargoInfoNo', label: '票货号', width: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		width: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'cargoOwnerName', label: '货主', align: 'center', width: 220 },
	// { prop: 'workContent', label: '作业内容', width: 100, align: 'left' },
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
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
  { prop: 'scn', label: 'SCN', width: 120, align: 'left' },
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
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'shipvoyageLabel', label: '船名航次', width: 120, align: 'left' },
  { prop: 'scn', label: 'SCN', width: 150, align: 'left' },
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
const clickRow = ref(null)
//行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = JSON.parse(JSON.stringify(row))
	console.log('行点击事件', clickRow.value)
}
// 获取默认当前时间班次
const init = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			// proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode,isTicket:'待签票' })
      SearchHeaderRef.value.searchData.workDate =  res.data.workDate
      SearchHeaderRef.value.searchData.classCode=res.data.classCode

      queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value)
}
defineExpose({
  init,
	clickRow
})
</script>

<style lang="scss" scoped>
.done {
	margin-top: 10px;
}
</style>
