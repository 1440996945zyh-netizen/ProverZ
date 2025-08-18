<template>
	<div class="app-container">
		<SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

		<el-tabs v-model="mainTab" type="card" class="demo-tabs" @tab-click="handleMainClick">
			<el-tab-pane label="船舶计划" name="1">
				<EditTable
					class="tab_table"
					:tableColumns="shipTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="400"
					:cellClickEvent="batchFlag ? '' : workPlanCellClickEvent"
					:checkbox-config="checkboxConfig"
					:selectAllChangeEvent="selectAllChangeEventTmp"
					@checkbox-change="checkboxChangeEventTmp"
				/>
			</el-tab-pane>
			<el-tab-pane label="辅助计划" name="2">
				<EditTable
					class="tab_table"
					:tableColumns="jobTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="400"
					:cellClickEvent="batchFlag ? '' : workPlanCellClickEvent"
					:checkbox-config="checkboxConfig"
					:selectAllChangeEvent="selectAllChangeEventTmp"
					@checkbox-change="checkboxChangeEventTmp"
				/>
			</el-tab-pane>
			<el-tab-pane label="集疏港计划" name="3">
				<EditTable
					class="tab_table"
					:tableColumns="harborableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="400"
					:cellClickEvent="batchFlag ? '' : workPlanCellClickEvent"
					:checkbox-config="checkboxConfig"
					:selectAllChangeEvent="selectAllChangeEventTmp"
					@checkbox-change="checkboxChangeEventTmp"
				/>
			</el-tab-pane>
			<el-tab-pane label="转运计划" name="4">
				<EditTable
					class="tab_table"
					:tableColumns="transferTableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="400"
					:cellClickEvent="batchFlag ? '' : workPlanCellClickEvent"
					:checkbox-config="checkboxConfig"
					:selectAllChangeEvent="selectAllChangeEventTmp"
					@checkbox-change="checkboxChangeEventTmp"
				/>
			</el-tab-pane>
		</el-tabs>

		<el-tabs v-model="dispatchTab" type="card" class="done" @tab-click="handleDispatchClick">
			<el-tab-pane label="已派机械" name="1">
				<BaseTable
					class="tab_table"
					:tableColumns="dispatchedMachineColumns"
					:tableData="dispatchedTableData"
					:border="true"
					:tableHeight="tableHeight"
				/>
			</el-tab-pane>
			<el-tab-pane label="已派装卸队" name="2">
				<BaseTable
					class="tab_table"
					:tableColumns="dispatchedLaborColumns"
					:tableData="dispatchedTableData"
					:border="true"
					:tableHeight="tableHeight"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>

	<el-drawer v-model="laborDrawer" :title="'装卸队派工'" size="50%">
		<EditTable
			ref="laborDetailTableRef"
			:tableColumns="laborDetailColumns"
			:tableData="laborDetailTableData"
			:border="true"
			:tableHeight="'pageTableHeight'"
			:hasAdd="true"
			:editRules="editRules"
      @change="tableChange"
      @focus="tableFocus"
    />
		<template #footer>
			<div>
				<el-button @click="laborDrawer = false">取消</el-button>
				<el-button type="primary" @click="saveLabor">保存</el-button>
			</div>
		</template>
	</el-drawer>

	<el-drawer v-model="machineDetailDrawer" :title="'机械配工'" size="80%">
		<template #header="{}">
			<div style="display: flex">
				<div style="width: 100px"><span>机械配工</span></div>
				<div class="title">{{ firstWork }}</div>
			</div>
		</template>
		<machineDetail ref="machineDetailRef" />
		<template #footer>
			<div>
				<el-button @click="machineDetailDrawer = false">取消</el-button>
				<el-button type="primary" @click="saveMachineDispatch">保存</el-button>
			</div>
		</template>
	</el-drawer>
</template>

<script setup name="dispatchSecondary">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/dispatchSecondary/index.js'
import publicApi from '@/api/public/index'
import { ElTag } from 'element-plus'
import { ElButton } from 'element-plus'
import machineDetail from '@/views/produce/dispatchSecondary/machineDetail/index'
import { reactive, ref, toRaw, nextTick } from 'vue'

import BaseTable from '@/components/BaseTable/index.vue'
import EditTable from '@/components/EditTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 表格数据

const dispatchedTableData = ref([])
const laborDrawer = ref(false)
const machineDetailDrawer = ref(false)
const SearchHeaderRef = ref()
// 待选装卸队列数据
const laborDetailColumns = ref([
  {
    prop: 'deptParentId',
    label: '部门',
    editType: 'select',
    modelValue: 'deptParentId',
    editRender: {},
    selectData: [],
    selectLabel: 'deptParentName', // options绑定的值，默认为label，和默认一致则不用传。
    selectValue: 'deptParentId', // options绑定的值，默认为value，和默认一致则不用传。
    modelLabel: 'deptParentName', // 选中label绑定的字段
  },
  {
    prop: 'deptId',
    label: '班组',
    editType: 'select',
    modelValue: 'deptId',
    editRender: {},
    selectData: [],
    selectLabel: 'deptName', // options绑定的值，默认为label，和默认一致则不用传。
    selectValue: 'deptId', // options绑定的值，默认为value，和默认一致则不用传。
    modelLabel: 'deptName', // 选中label绑定的字段
    change: (e, row) => {
      laborDetailTableData.value.forEach(item => {
        if (row.index != item.index) {
          if (item.deptId != undefined && item.deptId != null && item.deptId != '') {
            if (item.deptId == row.deptId ) {
              proxy.$message.error("班组重复，无法选择")
              row.deptId = ''
              row.deptName = ''
              return;
            }
          }
        }
      })
    },
  },
  {
    prop: 'subProcessCode',
    label: '子过程',
    editType: 'select',
    modelLabel: 'subProcessName',
    modelvalue: 'subProcessCode',
    editRender: {},
    align: 'center',
    selectData: [],
  },
  {
    prop: 'workPositionCode',
    label: '位置',
    editType: 'select',
    editRender: {},
    modelLabel: 'workPositionName',
    modelvalue: 'workPositionCode',
    align: 'center',
    selectData: [],
  },
  { prop: 'numberCount', label: '录入人数', editType: 'input', editRender: {}, align: 'center' },
  {
    prop: '',
    label: '添加',
    width: 200,
    align: 'center',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              handleDelete(row)
            },
            type: 'danger',
            link: true,
            icon: 'Delete',
          },
          {
            default: () => '删除',
          }
        ),
      ]
    },
  },
])

// 计算表格高度
const tableParams = tableParamsStore()
const tableHeight = computed(() => {
	return tableParams.pageTableHeight - 370
})
/**************************** 工班计划信息 开始  ****************************/
const selectData = reactive([
	{
		type: 'date',
		modelValue: 'workDate',
		span: 10,
		name: '选择日期',
	},
	{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 7,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},
	{
		name: '包装',
		type: 'select',
		modelValue: 'packageCode',
		span: 7,
		dataConfig: { params: { type: 'DICT', dictType: 'PACKAGE_TYPE' } },
	},
/*  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 3,
    dataType: 'VOYAGE',
  },*/
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 3, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 3, // 占位，共24
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
    name: '主过程', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'processCode', // 绑定字段
    span: 3, // 占位，共24
    dataConfig: { params: { type: 'MAIN_WORK_PROCESS'} },
  },
	// {
	// 	name: '作业公司', // 搜索框name
	// 	type: 'select', // 搜索框类型
	// 	modelValue: 'deptCode', // 绑定字段
	// 	span: 6, // 占位，共24
	// 	dataConfig: {
	// 		params: {
	// 			type: 'DEPT_WORK_COMPANY_CODE',
	// 		},
	// 	},
	// },
])

const editRules = ref({
	numberCount: [
		// { required: false, message: '人数必填' },
		{
			pattern: /^\d{0,8}$/,
			message: '只能是8位以内的正数',
			trigger: 'blur',
		},
	],
	subProcessCode: proxy.getRules({
		required: true,
	}),
  deptParentId: proxy.getRules({
		required: true,
	}),
})

//主列表查询条件
const queryParams = ref({
	planType: '1',
	workDate: '',
	classCode: '',
})
// 列表数据
const getList = async e => {
	queryParams.value = Object.assign(queryParams.value, e)
	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		loading.value = false
		return
	}
	await api.getList(queryParams.value).then(res => {
		tableData.value = res.data
		;(dispatchedQueryParams.value.dispatchType = ''), (dispatchedQueryParams.value.workPlanId = '')
	})
}
// header按钮参数
const buttonList = reactive([
	{
		label: '机械配工', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => openMachine, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
	},
	{
		label: '装卸队配工', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => openLabor, // 回调函数
		permission: 'produce:dispatchSecondary:laborDispatch', // 权限
	},
	{
		label: '批量派工', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => batchSelectButton, // 回调函数
		permission: 'produce:dispatchSecondary:isBatch',
	},
])
const machineDetailRef = ref(null) // 明细组件ref

const batchFlag = ref(false)
const batchSelectButton = () => {
	//是否批量选中
	dispatchedTableData.value = []
	checkBoxListTmp.value = []
	if (batchFlag.value) {
		buttonList[2].label = '批量派工'
		batchFlag.value = false
		shipTableColumns.value.splice(0, 1)
		jobTableColumns.value.splice(0, 1)
		harborableColumns.value.splice(0, 1)
		transferTableColumns.value.splice(0, 1)
	} else {
		buttonList[2].label = '取消批量派工'
		batchFlag.value = true
		shipTableColumns.value.unshift({ prop: ' ', label: '', type: 'checkbox', width: 62 })
		jobTableColumns.value.unshift({ prop: ' ', label: '', type: 'checkbox', width: 62 })
		harborableColumns.value.unshift({ prop: ' ', label: '', type: 'checkbox', width: 62 })
		transferTableColumns.value.unshift({ prop: ' ', label: '', type: 'checkbox', width: 62 })
	}
}
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}

//多选数据
const checkBoxListTmp = ref([])
const checkBoxListTmpPCode = ref([]) // 主过程
const processCode = ref() // 主过程

// 全选事件
const selectAllChangeEventTmp = val => {
	checkBoxListTmp.value = []
	checkBoxListTmpPCode.value = []
	tableData.value.forEach(item => {
		checkBoxListTmp.value.push(item.id)
		checkBoxListTmpPCode.value.push(item.processCode)
	})
}

const checkboxChangeEventTmp = data => {
	checkBoxListTmp.value = []
	checkBoxListTmpPCode.value = []
	let tmpData = JSON.parse(JSON.stringify(data))
	tmpData.forEach(item => {
		checkBoxListTmp.value.push(item.id)
		checkBoxListTmpPCode.value.push(item.processCode)
	})
}

// 机械派工页面初始化
const openMachine = () => {
	if (batchFlag.value) {
		if (checkBoxListTmp.value == null || checkBoxListTmp.value.length == 0) {
			proxy.$message.warning('请选择一条数据！')
			return
		}

		const newLength = new Set(checkBoxListTmpPCode.value.map(item => item)).size
		if (newLength > 1) {
			proxy.$message.warning('请选择相同的作业过程数据！')
			return
		}

		processCode.value = checkBoxListTmpPCode.value[0]
	} else {
		if (dispatchedQueryParams.value.workPlanId == undefined || dispatchedQueryParams.value.workPlanId == '') {
			proxy.$message.warning('请选择一条数据！')
			return
		}
    dispatchedQueryParams.value.dispatchType = '1'
    getDispatchedList(dispatchedQueryParams.value)
	}
	machineDetailDrawer.value = true
	// 选中已派机械tab页
	dispatchTab.value = '1'
  nextTick(() => {
		machineDetailRef.value.processCode = processCode.value
		//清空
		machineDetailRef.value.dispatchedTableData = null
		//机械配工初始化
		machineDetailRef.value.init(dispatchedQueryParams.value, batchFlag.value)
	})
}
// 打开装卸队抽屉
const openLabor = async () => {
	if (batchFlag.value) {
		if (checkBoxListTmp.value == null || checkBoxListTmp.value.length == 0) {
			proxy.$message.warning('请选择一条数据！')
			return
		}

		const newLength = new Set(checkBoxListTmpPCode.value.map(item => item)).size
		if (newLength > 1) {
			proxy.$message.warning('请选择相同的作业过程数据！')
			return
		}

		processCode.value = checkBoxListTmpPCode.value[0]
	} else {
		if (dispatchedQueryParams.value.workPlanId == undefined || dispatchedQueryParams.value.workPlanId == '') {
			proxy.$message.warning('请选择一条数据！')
			return
		}
	}
	dispatchedTableData.value = []
  dispatchedQueryParams.value.dispatchType = '2'
  if(batchFlag.value){

  }else {
    getDispatchedList(dispatchedQueryParams.value)
  }
	getAllLabor()
	laborDrawer.value = true
	dispatchTab.value = '2' //点击转到对应的页签
	if (!batchFlag.value) {
		api.getSaveList(dispatchedQueryParams.value.workPlanId).then(res => {
			laborDetailTableData.value = res.data
		})
	} else {
		laborDetailTableData.value = []
	}
//位置下拉框
  publicApi.getDictList({ types: 'MACHINE_LOCATION' }).then(res => {
    // console.log('测试机械位置下拉框数据', res.data)
    proxy.setEditTableOptions(laborDetailColumns.value, { workPositionCode: res.data.MACHINE_LOCATION })
  })

}
// 获取全部装卸队
const getAllLabor = async () => {

  const res = await api.getLaborDeptList()
  laborDetailColumns.value[0].selectData = res.data

/*	const res = await api.getLaborList('')
	laborDetailColumns.value[1].selectData = res.data*/

	const resProcess = await publicApi.getLocalSelect({ type: 'SUB_WORK_PROCESS_NEW', parent: processCode.value })
	laborDetailColumns.value[2].selectData = resProcess.data
}
//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableData = ref([])
//船舶表格数据
const shipTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'trustNo', label: '通知单编号', width: 150, align: 'center' },
	{
		label: '流机队',
		prop: 'flowStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.flowStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.flowStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '固机队',
		prop: 'fixedStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.fixedStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.fixedStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '装卸队',
		prop: 'laborStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.laborStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.laborStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{ prop: 'processName', label: '作业过程', width: 120, align: 'center' },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'center' },
  { prop: 'cargoOwnerName', label: '货主', align: 'center', width: 180 },
  { prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	{ prop: 'hatch', label: '舱口', width: 80, align: 'center' },
	{ prop: 'cargoCategoryName', label: '货种', width: 150, align: 'center' },
	{ prop: 'customerName', label: '客户名称', width: 200, align: 'center' },
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'center' },
	{ prop: 'berthName', label: '泊位', width: 100, align: 'center' },
	{ prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left' },
	// { prop: 'massNamesSource', label: '库场区域', width: 180, align: 'center' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '装卸队', width: 180, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'dispatchByName', label: '调渡员', width: 100, align: 'center' },
	{ prop: 'quantityPlan', label: '计划量', width: 100, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 100, align: 'center' },
	{ prop: 'remark', label: '作业要求', width: 100, align: 'center' },
])

// 零工计划表格
const jobTableColumns = ref([
  { prop: 'planNo', label: '计划号', width: 150, align: 'center' },
  // { prop: 'companyName', label: '作业公司', align: 'center', width: 150 },
	{
		label: '流机队',
		prop: 'flowStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.flowStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.flowStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '固机队',
		prop: 'fixedStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.fixedStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.fixedStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '装卸队',
		prop: 'laborStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.laborStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.laborStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{ prop: 'processName', label: '作业过程', align: 'center', width: 120 },
	// { prop: 'remark', label: '作业内容', align: 'center', width: 150 },
	// { prop: 'equipmentNamesBack', label: '机械', width: 150, align: 'center' },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'center' },
	{ prop: 'cargoCategoryName', label: '货种', align: 'center' },
  { prop: 'cargoOwnerName', label: '货主', align: 'center', width: 180 },
  { prop: 'cargoName', label: '货名', width: 120, align: 'center' },
	/*{ prop: 'startTimePlan', label: '计划开工时间',width: 130,align: 'center' },
  { prop: 'endTimePlan', label: '计划完工时间',width: 130,align: 'center'  },*/
	{ prop: 'workDate', label: '申请时间', align: 'center' },
	{ prop: 'deptName', label: '申请部门', align: 'center' },
	{ prop: 'createByName', label: '申请人', align: 'center' },
])

// 集疏港表格数据
const harborableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'trustNo', label: '通知单编号', width: 150, align: 'center' },
	{ prop: 'processName', label: '作业过程', width: 150, align: 'center' },
	{ prop: 'shipNameVoyages', label: '船名航次', width: 150, align: 'left' },
	{ label: '货主', prop: 'cargoOwnerName', width: 180, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ prop: 'deptName', label: '申请部门', width: 'time', align: 'center' },
	{ prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left' },
	//{ prop: 'massNamesSource', label: '库场区域', width: 150, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '申请装卸队量', width: 110, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'quantityPlan', label: '计划量', width: 100, align: 'center' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'center' },
	// { prop: 'workDate', label: '日期', width: 160, align: 'center' },
	// { prop: 'className', label: '班次', width: 120, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'center' },
	{
		label: '流机队',
		prop: 'flowStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.flowStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.flowStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '固机队',
		prop: 'fixedStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.fixedStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.fixedStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '装卸队',
		prop: 'laborStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.laborStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.laborStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
])

// 转运计划表格数据
const transferTableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'trustNo', label: '通知单编号', width: 150, align: 'center' },
	{ prop: 'processName', label: '作业过程', width: 150, align: 'center' },
	{ prop: 'shipvoyageLabel', label: '船名航次', width: 150, align: 'center' },
	{ label: '货主', prop: 'cargoOwnerName', width: 180, align: 'center' },
	{ label: '货名', prop: 'cargoName', width: 120, align: 'center' },
	{ prop: 'hatchNum', label: '舱口', width: 80, align: 'center' },
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'left' },
	{ prop: 'berthName', label: '泊位', width: 80, align: 'left' },
	{ prop: 'massNamesSource', label: '起始位置', width: 150, align: 'left' },
	{ prop: 'massNamesTarget', label: '目标位置', width: 150, align: 'left' },
	//{ prop: 'massNamesSource', label: '库场区域', width: 150, align: 'left' },
	{ prop: 'equipmentNamesFront', label: '前沿', width: 180, align: 'center' },
	{ prop: 'equipmentNamesReshipment', label: '转运', width: 180, align: 'center' },
	{ prop: 'equipmentNamesBack', label: '后场', width: 180, align: 'center' },
	{ prop: 'equipmentNamesAssist', label: '辅助', width: 180, align: 'center' },
	{ prop: 'laborNum', label: '申请装卸队量', width: 110, align: 'center' },
	{ prop: 'frontTallyByName', label: '前沿理货员', width: 100, align: 'center' },
	{ prop: 'backTallyByName', label: '后场理货员', width: 100, align: 'center' },
	{ prop: 'dispatchByName', label: '调度员', width: 70, align: 'left' },
	{ prop: 'quantityPlan', label: '计划量', width: 100, align: 'center' },
	{ prop: 'tonPlan', label: '计划重量', width: 100, align: 'center' },
	{ prop: 'startTimePlan', label: '计划开工时间', width: 150, align: 'center' },
	{ prop: 'endTimePlan', label: '计划完工时间', width: 150, align: 'center' },
	{ prop: 'remark', label: '作业要求', width: 150, align: 'center' },
	{
		label: '流机队',
		prop: 'flowStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.flowStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.flowStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '固机队',
		prop: 'fixedStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.fixedStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.fixedStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
	},
	{
		label: '装卸队',
		prop: 'laborStatus',
		fixed: 'right',
		width: 'status',
		align: 'center',
		render: row => {
			let typeFlag = ''
			typeFlag = row.laborStatus == 1 ? 'success' : 'danger'
			return [
				h(
					ElTag,
					{
						type: typeFlag,
					},
					{
						default: () => (row.laborStatus == '1' ? '已配工' : '未配工'),
					}
				),
			]
		},
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

//工班计划行点击事件
const firstWork = ref('')
const clickRow = ref({})
const workPlanCellClickEvent = ({ row }) => {
	console.log(row)
  clickRow.value = row
	firstWork.value =
		`${row.shipvoyageLabel ? ' ' + row.shipvoyageLabel : ''}` +
		`${row.cargoName ? ' ' + row.cargoName : ''}` +
		`${row.massNamesSource ? ' 起始：' + row.massNamesSource : ''}` +
		`${row.massNamesTarget ? ' 目的：' + row.massNamesTarget : ''}` +
		'一次派工：' +
		`${row.equipmentNamesFront ? ' 前沿：' + row.equipmentNamesFront : ''}` +
		`${row.equipmentNamesBack ? ' 后场：' + row.equipmentNamesBack : ''}` +
		`${row.equipmentNamesReshipment ? ' 转运：' + row.equipmentNamesReshipment : ''}` +
		`${row.equipmentNamesAssist ? ' 辅助：' +row.equipmentNamesAssist : ''}`
	nextTick(() => {
		dispatchedQueryParams.value.workPlanId = row.id
		processCode.value = row.processCode
		// 选中的已派工Tab页查询，机械
		if (dispatchTab.value == '1') {
			dispatchedQueryParams.value.dispatchType = '1'
			// 装卸队选中
		} else {
			dispatchedQueryParams.value.dispatchType = '2'
		}
		getDispatchedList(dispatchedQueryParams.value)
	})
}

/**************************** 工班计划信息 结束  ****************************/

/**************************** 已派工信息  开始  ****************************/

//已派工tab页
const dispatchTab = ref('1') //默认第一个

// 已派装卸队表格
const dispatchedLaborColumns = ref([
	{ prop: 'companyName', label: '装卸公司', align: 'center' },
	{ prop: 'deptName', label: '班组', align: 'center' },
	{ prop: 'subProcessName', label: '子过程', align: 'center' },
  { prop: 'workPositionName', label: '装卸队位置', align: 'center' },
	{ prop: 'numberCount', label: '录入人数', align: 'center' },
	{ prop: 'createByName', label: '创建人', width: 250, align: 'center' },
	{ prop: 'createTime', label: '创建时间', width: 'time', align: 'center' },
])

// 已派机械表格
const dispatchedMachineColumns = ref([
	{ prop: 'equipmentTypeName', label: '机械类型', align: 'center' },
	{ prop: 'equipmentNo', label: '机械编号', align: 'center' },
	{ prop: 'workPositionName', label: '机械位置', align: 'center' },
	{ prop: 'subProcessName', label: '子过程', align: 'center' },
	{ prop: 'deptName', label: '部门', align: 'center' },
	{ prop: 'operatorsName', label: '司机', align: 'center' },
	{ prop: 'createByName', label: '创建人', align: 'center' },
	{ prop: 'createTime', label: '创建时间', width: 'time', align: 'center' },
])

// 已派页签更变
const handleDispatchClick = tab => {
	if (tab.index === '0') {
		dispatchedQueryParams.value.dispatchType = '1'
		dispatchedTableData.value = []
	} else if (tab.index === '1') {
		dispatchedQueryParams.value.dispatchType = '2'
		dispatchedTableData.value = []
	}
	if (dispatchedQueryParams.value.workPlanId != null && dispatchedQueryParams.value.workPlanId != '') {
		getDispatchedList(dispatchedQueryParams.value)
	}
}

/**************************** 已派工信息结束 结束  ****************************/

/**************************** 待派工 开始  ****************************/


const tableChange = (val, rowData, title) => {
  if (title == '部门') {
    rowData.deptId = ''
    rowData.deptName = ''
  }
}
const tableFocus = (val, rowData, title) => {
  if (title == '班组') {
    if (val.deptParentId) {
      api.getLaborGroupList(val.deptParentId).then(res => {
        proxy.setEditTableOptions(laborDetailColumns.value, { deptId: res.data })
      })
    } else {
      proxy.setEditTableOptions(laborDetailColumns.value, { deptId: [] })
    }
  }
}
// 列表删除按钮回调
const handleDelete = row => {
	proxy.$modal
		.confirm('是否删除')
		.then(res => {
			laborDetailTableData.value.splice(row.index, 1)
		})
		.catch(err => {})
}
const laborDetailTableRef = ref()
const laborDetailTableData = ref([])
const workplanIds = ref([])

const validate = async () => {
	let flag = await laborDetailTableRef.value.validAllEvent()
	return flag
}

//保存装卸队配工
const saveLabor = async () => {
	if (
		(checkBoxListTmp.value == null || checkBoxListTmp.value.length == 0) &&
		(dispatchedQueryParams.value.workPlanId == undefined || dispatchedQueryParams.value.workPlanId == '')
	) {
		proxy.$message.warning('请选择一条数据！')
		return
	}
  if(queryParams.value.planType!=4){
    for(let index in laborDetailTableData.value){
      let item = laborDetailTableData.value[index]
      if(item.numberCount==null || item.numberCount==undefined || item.numberCount==''){
        proxy.$message.warning('请填写人数！')
        return;
      }
    }
  }

	workplanIds.value = []
	if (batchFlag.value) {
		workplanIds.value = checkBoxListTmp.value
	} else {
		workplanIds.value.push(dispatchedQueryParams.value.workPlanId)
	}
	if (await validate()) {
		proxy.$modal.confirm('确定保存？').then(res => {
			api.addLabor({
				dispatchSecondaryList: laborDetailTableData.value,
				workPlanIds: workplanIds.value,
				dispatchType: '2',
        laborStatus:clickRow.value.laborStatus
			}).then(res => {
				proxy.$message.success(res.msg)
				getList(queryParams.value)
				laborDrawer.value = false
				getDispatchedList(dispatchedQueryParams.value)
			})
		})
	}
}

// 保存机械配工
const saveMachineDispatch = async () => {
	if (await machineDetailRef.value.validate()) {
		workplanIds.value = []
		if (batchFlag.value) {
			workplanIds.value = checkBoxListTmp.value
		} else {
			workplanIds.value.push(dispatchedQueryParams.value.workPlanId)
		}
		proxy.$modal.confirm('确定保存?').then(res => {
			api.addBatch({
				dispatchSecondaryList: machineDetailRef.value.dispatchedTableData,
				workPlanIds: workplanIds.value,
				dispatchType: '1',
			}).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess(res.msg)
					machineDetailDrawer.value = false
					getDispatchedList(dispatchedQueryParams.value)
				}
			})
		})
	}
}

//主列表查询条件
const dispatchedQueryParams = ref({
	dispatchType: '',
	workPlanId: '',
})

//获取已经派好的机械数据
const getDispatchedList = async e => {
	await api.getDispatchAllList(dispatchedQueryParams.value).then(res => {
		dispatchedTableData.value = res.data
	})
}

// 获取默认当前时间班次
const init = async () => {
	await publicApi.getNowDate().then(res => {
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
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
