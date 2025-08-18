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
	<!-- 签票 -->
	<el-drawer v-model="detailVisible" size="65%">
		<template #title>
			<div>
				<span>签票</span>
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
</template>

<script setup name="workTicketNew">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/workTicketTwo/index.js'
import detail from './detail/index'
import Select from '@/components/Select'
import { ElTag } from 'element-plus'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const detailRef = ref(null) // 明细组件ref
const detailVisible = ref(false)
const bulkCargoTallyVisible = ref(false)
const collectHtml = ref('')

// 表格数据
const SearchHeaderRef = ref()

const selectData = reactive([
	{
		type: 'date',
		modelValue: 'workDate',
		span: 8,
		name: '选择日期',
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 8,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
	{
    name: '审核状态',
    type: 'select',
    modelValue: 'workTicketStatus',
    span: 8,
    selectData: [
			{value: '10',label: '待签票'},
			{value: '20',label: '已审核'}
		],
	},
  {
    name: '船名_航次',
    type: 'input',
    modelValue: 'shipvoyageName',
    span: 2,
  },
	{
		name: '货名', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'cargoCode', // 绑定字段
		span: 2, // 占位，共24
		dataType: 'CARGO_INFO',
	},
])

//主列表查询条件
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	type: '1',
	workDate: '',
	classCode: '',
	workTicketStatus: '',
	shipvoyageName: '',
	cargoCode: '',
})

// header按钮参数
const buttonList = reactive([
	{
		label: '签票', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => singTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
	},
	{
		label: '编辑', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => updateTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
	},
	{
		label: '删除', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => deleteTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
	},
	{
		label: '撤销', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => dispatchRepeal, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		// disabled: true,
	},
])
// 列表数据
const getList = async e => {
	queryParams.value = Object.assign(queryParams.value, e)
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}
  await api.listWorkTicket(queryParams.value).then(res => {
    tableData.value = res.data
		clickRow.value = null
  })
  
}

//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableData = ref([])
//船舶表格数据
const shipTableColumns = ref([
  { label: '序号', type: 'seq', minWidth: 50,align: 'center' },
  {
		prop: 'workTicketStatus',
		label: '审核状态',
		minWidth: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTicketStatus === '10' ? 'info' : 'success',
					},
					{
						default: () => row.workTicketStatusName,
					}
				),
			]
		},
	},
  { prop: 'workDate', label: '日期', minWidth: 120, align: 'left' },
  { prop: 'className', label: '班次', minWidth: 100, align: 'left' },
  { prop: 'shipvoyageName', label: '船名航次', minWidth: 140, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', minWidth: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		minWidth: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', minWidth: 150, align: 'center' },
	{ prop: 'ton', label: '吨数', minWidth: 100, align: 'center' },
	{ prop: 'sourceLabel', label: '起始位置', minWidth: 180, align: 'center' },
	{ prop: 'targetLabel', label: '目的位置', minWidth: 180, align: 'center' },
  {
    prop: 'createByName',
    label: '签票人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'createTime',
    label: '签票时间',
    minWidth: 150,
    align: 'center',
  },
	{
    prop: 'examineByName',
    label: '审核人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'examineTime',
    label: '审核时间',
    minWidth: 150,
    align: 'center',
  }
])

// 零工计划表格
const jobTableColumns = ref([
  { label: '序号', type: 'seq', minWidth: 50,align: 'center' },
  {
		prop: 'workTicketStatus',
		label: '审核状态',
		minWidth: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTicketStatus === '10' ? 'info' : 'success',
					},
					{
						default: () => row.workTicketStatusName,
					}
				),
			]
		},
	},
  { prop: 'workDate', label: '日期', minWidth: 120, align: 'left' },
  { prop: 'className', label: '班次', minWidth: 100, align: 'left' },
  { prop: 'shipvoyageName', label: '船名航次', minWidth: 140, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		minWidth: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', minWidth: 150, align: 'center' },
	{ prop: 'ton', label: '吨数', minWidth: 100, align: 'center' },
	{ prop: 'sourceLabel', label: '起始位置', minWidth: 180, align: 'center' },
	{ prop: 'targetLabel', label: '目的位置', minWidth: 180, align: 'center' },
  {
    prop: 'createByName',
    label: '签票人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'createTime',
    label: '签票时间',
    minWidth: 150,
    align: 'center',
  },
	{
    prop: 'examineByName',
    label: '审核人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'examineTime',
    label: '审核时间',
    minWidth: 150,
    align: 'center',
  }
])

// 集疏港表格数据
const harborableColumns = ref([
  { label: '序号', type: 'seq', minWidth: 50,align: 'center' },
  {
		prop: 'workTicketStatus',
		label: '审核状态',
		minWidth: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTicketStatus === '10' ? 'info' : 'success',
					},
					{
						default: () => row.workTicketStatusName,
					}
				),
			]
		},
	},
  { prop: 'workDate', label: '日期', minWidth: 120, align: 'left' },
  { prop: 'className', label: '班次', minWidth: 100, align: 'left' },
  { prop: 'shipvoyageName', label: '船名航次', minWidth: 140, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', minWidth: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		minWidth: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', minWidth: 150, align: 'center' },
	{ prop: 'ton', label: '吨数', minWidth: 100, align: 'center' },
	{ prop: 'sourceLabel', label: '起始位置', minWidth: 180, align: 'center' },
	{ prop: 'targetLabel', label: '目的位置', minWidth: 180, align: 'center' },
	{ prop: 'sourceLabel', label: '起始位置', minWidth: 180, align: 'center' },
	{ prop: 'targetLabel', label: '目的位置', minWidth: 180, align: 'center' },
  {
    prop: 'createByName',
    label: '签票人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'createTime',
    label: '签票时间',
    minWidth: 150,
    align: 'center',
  },
	{
    prop: 'examineByName',
    label: '审核人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'examineTime',
    label: '审核时间',
    minWidth: 150,
    align: 'center',
  }
])

// 转运计划表格数据
const transferTableColumns = ref([
  { label: '序号', type: 'seq', minWidth: 50,align: 'center' },
  {
		prop: 'workTicketStatus',
		label: '审核状态',
		minWidth: 130,
		align: 'left',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTicketStatus === '10' ? 'info' : 'success',
					},
					{
						default: () => row.workTicketStatusName,
					}
				),
			]
		},
	},
  { prop: 'workDate', label: '日期', minWidth: 120, align: 'left' },
  { prop: 'className', label: '班次', minWidth: 100, align: 'left' },
  { prop: 'shipvoyageName', label: '船名航次', minWidth: 140, align: 'left' },
	{ prop: 'cargoInfoNo', label: '票货号', minWidth: 250, align: 'left' },
	{
		prop: 'processName',
		label: '作业过程',
		minWidth: 150,
		align: 'left',
	},
	{ prop: 'cargoName', label: '货名', minWidth: 150, align: 'center' },
	{ prop: 'ton', label: '吨数', minWidth: 100, align: 'center' },
	{ prop: 'sourceLabel', label: '起始位置', minWidth: 180, align: 'center' },
	{ prop: 'targetLabel', label: '目的位置', minWidth: 180, align: 'center' },
  {
    prop: 'createByName',
    label: '签票人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'createTime',
    label: '签票时间',
    minWidth: 150,
    align: 'center',
  },
	{
    prop: 'examineByName',
    label: '审核人',
    minWidth: 120,
    align: 'center',
  },
  {
    prop: 'examineTime',
    label: '审核时间',
    minWidth: 150,
    align: 'center',
  }
])

// 主页面页签更变
const handleMainClick = tab => {
	if (tab.index === '0') {
		//更改对应的参数  进行查询
		queryParams.value.type = '1'
	} else if (tab.index === '1') {
		queryParams.value.type = '4'
	} else if (tab.index === '2') {
		queryParams.value.type = '2'
	} else if (tab.index === '3') {
		queryParams.value.type = '3'
	}
	getList(queryParams.value)
}
const clickRow = ref()
//行点击事件
const cellClickEvent = ({ row }) => {
	clickRow.value = JSON.parse(JSON.stringify(row))
	console.log('行点击事件', clickRow.value)
}
// 签票
const singTicket = () => {
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.clearForm()
	})
}
// 编辑
const updateTicket  = () => {
	if (clickRow.value == null) {
		return proxy.$message.warning("请选择一条数据")
	}
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.queryDetail(clickRow.value)
	})
}
// 删除作业票
const deleteTicket = () => {
	if (!clickRow.value) {
		proxy.$message.warning('请先选择需要删除的作业票信息！')
		return
	}
	proxy.$modal.confirm('确定删除？').then(() => {
		api.deleteWorkTicke({id: clickRow.value.id,workTicketDetailId: clickRow.value.workTicketDetailId}).then(res => {
			console.log(res)
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('删除成功')
				getList(queryParams.value)
			}
		})
	})
}

// 保存
const save = async () => {
	if (await detailRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			let data = JSON.parse(JSON.stringify(detailRef.value.formData))
    	let machineTableData = detailRef.value.machineTableData
    	let labourTableData = detailRef.value.labourTableData
			let params = {
				...data,
				detail: data,
				machines: machineTableData,
				labors: labourTableData
			}
			if (data.id) {
				api.updateWorkTicket(params).then(res => {
					proxy.$message.success(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			} else {
				api.insertWorkTicket(params).then(res => {
					proxy.$message.success(res.msg)
					detailVisible.value = false
					getList(queryParams.value)
				})
			}
		})
		
	}
}
// 获取默认当前时间班次
const init = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			// proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode,isTicket:'待签票' })
      SearchHeaderRef.value.searchData.workDate =  res.data.workDate
      SearchHeaderRef.value.searchData.classCode=res.data.classCode
      SearchHeaderRef.value.searchData.isTicket='待签票'

      queryParams.value.workDate = res.data.workDate
			queryParams.value.classCode = res.data.classCode
		})
	})
	getList(queryParams.value)
}

init()
</script>

<style lang="scss" scoped>
.done {
	margin-top: 10px;
}
</style>
