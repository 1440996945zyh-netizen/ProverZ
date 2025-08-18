<template>
	<div class="app-container">
		<SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

		<el-tabs v-model="mainTab" type="card" class="demo-tabs" @tab-click="handleMainClick">
			<el-tab-pane label="船舶计划" name="1">
				<BaseTable
					class="tab_table"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:cellClickEvent="cellClickEvent"
					:checkbox-config="checkboxConfig"
					@checkbox-change="checkboxChangeEvent"
					:selectAllChangeEvent="allChangeEvent"
					:span-method="mergeRowMethod"
					:scroll-y = "scroll-y"
				/>
			</el-tab-pane>
			<el-tab-pane label="零工计划" name="2">
				<BaseTable
					class="tab_table"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:checkbox-config="checkboxConfig"
					:cellClickEvent="cellClickEvent"
					@checkbox-change="checkboxChangeEvent"
					:span-method="mergeRowMethod"
					:selectAllChangeEvent="allChangeEvent"
					:scroll-y = "scroll-y"
				/>
			</el-tab-pane>
			<el-tab-pane label="集疏港计划" name="3">
				<BaseTable
					class="tab_table"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:checkbox-config="checkboxConfig"
					:cellClickEvent="cellClickEvent"
					@checkbox-change="checkboxChangeEvent"
					:span-method="mergeRowMethod"
					:selectAllChangeEvent="allChangeEvent"
					:scroll-y = "scroll-y"
				/>
			</el-tab-pane>
			<el-tab-pane label="转运计划" name="4">
				<BaseTable
					class="tab_table"
					:tableColumns="tableColumns"
					:tableData="tableData"
					:border="true"
					:tableHeight="'tabTableHeight'"
					:checkbox-config="checkboxConfig"
					:cellClickEvent="cellClickEvent"
					@checkbox-change="checkboxChangeEvent"
					:span-method="mergeRowMethod"
					:selectAllChangeEvent="allChangeEvent"
					:scroll-y = "scroll-y"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup name="auditTicket">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/auditTicket/index.js'
import { ElTag } from 'element-plus'
// import detail from './detail/index'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const scrollY = {
  enabled: TRUE, // 表示垂直滚动功能关闭。
}
// 通用行合并函数（将相同多列数据合并为一行）
const mergeRowMethod = ({ rowIndex, columnIndex, row, column }) => {
	let list = tableData.value
	// 自定义合并规则
	if (columnIndex == 0 || columnIndex == 1 || columnIndex == 2 || columnIndex == 3 || columnIndex == 4) {
		// 第一列合并逻辑示例
		// 判断当前行和上一行的数据是否相同，相同则合并
		if (rowIndex > 0 && list[rowIndex - 1].workPlanId === row.workPlanId && list[rowIndex - 1].id === row.id) {
			return {
				rowspan: 0,
				colspan: 0,
			}
		}
		// 计算合并的行数
		let rowspan = 1
		for (let i = rowIndex + 1; i < list.length; i++) {
			if (list[i].workPlanId == row.workPlanId && list[i].id == row.id) {
				rowspan++
			} else {
				break
			}
		}
		return {
			rowspan: rowspan,
			colspan: 1,
		}
	}
}
// 表格数据
const SearchHeaderRef = ref()
// 复选事件
const checkboxList = ref([])
const checkboxChangeEvent = data => {
	checkboxList.value = data
	if (checkboxList.value.length !== 0) {
		buttonList[0].disabled = false
		buttonList[1].disabled = false
	} else {
		buttonList[0].disabled = true
		buttonList[1].disabled = true
	}
}
// 全选事件
const allChangeEvent = ({ checked }) => {
	checkboxList.value = []
	if (checked) {
		checkboxList.value = JSON.parse(JSON.stringify(tableData.value))
		buttonList[0].disabled = false
		buttonList[1].disabled = false
	} else {
		checkboxList.value = []
		buttonList[0].disabled = true
		buttonList[1].disabled = true
	}
}

// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: true, // 	开启复选框范围选择功能
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
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
		modelValue: 'cargoType',
		span: 3,
		selectData: [
			{
				label: '件',
				value: '1',
			},
			{
				label: '散',
				value: '2',
			},
		],
	},
])

//主列表查询条件
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	planType: '1',
	workDate: '',
	classCode: '',
	shipvoyageItemId: '',
	portCode: '',
})
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
	await api.getWorkTicketList(queryParams.value).then(res => {
		tableData.value = res.data
	})
}

import { useRouter,onBeforeRouteUpdate } from 'vue-router';
import { TRUE } from 'ol/functions'
let router = useRouter()
const isRouter = ref(false)
watch(() =>router.currentRoute.value.path,(newValue,oldValue)=> {
  let routerQuery = router.currentRoute.value.query;
  if(JSON.stringify(routerQuery) != "{}"){
    isRouter.value = true;
    nextTick(()=>{
      // SearchHeaderRef.searchData.workDate = routerQuery.workDate;
      // SearchHeaderRef.value.SearchHeaderRef.searchData.workDate = routerQuery.workDate;
      proxy.$bus.emit('setInitSearchData', { workDate: routerQuery.workDate, classCode: '01' })
      queryParams.value.workDate = routerQuery.workDate
      queryParams.value.classCode = '01'
      // SearchHeaderRef.value.SearchHeaderRef.searchData.deptName = routerQuery.deptName;
      // baseTable.value.SearchHeaderRef.searchData.date = [routerQuery.startTime,routerQuery.endTime];
      // queryParams.value.date = [routerQuery.startTime,routerQuery.endTime]
      // queryParams.value.deptName = routerQuery.deptName
      // queryParams.value.deptId = routerQuery.deptId
      getList()
    })
  }
},{ immediate: true })

// header按钮参数
const buttonList = reactive([
	{
		label: '审核作业票', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => auditTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		disabled: true,
	},
	{
		label: '销审作业票', // 按钮名称
		type: 'primary', // 按钮类型
		click: () => cancelTicket, // 回调函数
		permission: 'produce:dispatchSecondary:machineryDispatch', // 权限
		disabled: true,
	},
])
// 审核作业票
const auditTicket = () => {
	if (!checkboxList.value) {
		proxy.$message.warning('请先选择需要审核的作业票信息！')
		return
	}
	if (queryParams.value.planType == 2) {
		let checkArr = checkboxList.value.map(item => {
			return item.workPlanId
		})
		let checkedData = tableData.value.filter(obj => checkArr.includes(obj.workPlanId))
		const result = checkedData.reduce((obj, item) => {
			if (!obj[item.workPlanId]) {
				obj[item.workPlanId] = []
			}
			obj[item.workPlanId].push(item)
			return obj
		}, {})
		let newArr = []
		for (let item in result) {
			newArr.push({ planId: item, infoDTOList: result[item] })
		}
		let param = {
			workPlanList: newArr,
		}
		proxy.$modal.confirm('确定审核？').then(() => {
			api.getAuditTicketJsg(param).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('审核成功')
					getList(queryParams.value)
				}
			})
		})
	} else {
		let auditId = checkboxList.value.map(item => {
			return { workPlanId: item.workPlanId, ticketType: item.ticketType }
		})
		let map = new Map()
		for (let item of auditId) {
			if (!map.has(item.workPlanId + item.ticketType)) {
				map.set(item.workPlanId + item.ticketType, item)
			}
		}
		let newArr = [...map.values()]
		let data = {
			workPlanIdList: newArr,
		}
		proxy.$modal.confirm('确定审核？').then(() => {
			api.getAuditTicket(data).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('审核成功')
					getList(queryParams.value)
				}
			})
		})
	}
}
// 销审作业票
const cancelTicket = () => {
	if (!checkboxList.value) {
		proxy.$message.warning('请先选择需要销审的作业票信息！')
		return
	}

	let auditId = checkboxList.value.map(item => {
		return { workPlanId: item.workPlanId, ticketType: item.ticketType }
	})
	let map = new Map()
	for (let item of auditId) {
		if (!map.has(item.workPlanId)) {
			map.set(item.workPlanId, item)
		}
	}
	let newArr = [...map.values()]
	let data = {
		workPlanIdList: queryParams.value.planType == 2 ? newArr : auditId,
	}
	proxy.$modal.confirm('确定销审？').then(() => {
		api.getCancelTicket(data).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('销审成功')
				getList(queryParams.value)
			}
		})
	})
}
//工班计划tab页
const mainTab = ref('1') //默认第一个
const tableData = ref([])
//船舶表格数据
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50, fixed: 'left' },
	{ prop: 'trustNo', label: '通知单编号', width: 120, align: 'center' },
	{ prop: 'createByName', label: '签票人', width: 100, align: 'center' },
	{ prop: 'createTime', label: '签票时间', width: 150, align: 'center' },
	{
		prop: 'workTicketStatusName',
		label: '审核状态',
		width: 100,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.workTicketStatusName === '待审核' ? 'info' : row.workTicketStatusName === '已审核' ? 'success' : '',
					},
					{
						default: () => row.workTicketStatusName,
					}
				),
			]
		},
	},
	{ prop: 'examineByName', label: '审核人', width: 100, align: 'center' },
	{ prop: 'examineTime', label: '审核时间', width: 150, align: 'center' },
	{ prop: 'className', label: '班次时间', width: 150, align: 'center' },
	{ prop: 'shipNameVoyage', label: '船名', width: 130, align: 'left' },
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'center' },
	{ prop: 'deptName', label: '部门', align: 'center', width: 100 },
	{ prop: 'cargoNameLabel', label: '货物信息', width: 500, align: 'left' },
	{ prop: 'deptItemName', label: '操作班组', width: 100, align: 'center' },
	{ prop: 'personNelName', label: '人员班组', width: 100 },
	{ label: '作业过程', prop: 'processDetailName', width: 140 },
	{ label: '舱口', prop: 'cabinNo', width: 140 },
	{
		prop: 'quantity',
		label: '件数',
		width: 100,
		align: 'right',
	},
	{
		prop: 'ton',
		label: '吨数',
		width: 100,
		align: 'right',
	},
	{ prop: 'equipmentTypeName', label: '机械类型', width: 100, align: 'left' },
	{ prop: 'equipmentNo', label: '机械编号', width: 160, align: 'left' },
	{ prop: 'startTime', label: '开始时间', width: 140, align: 'center' },
	{
		prop: 'endTime',
		label: '结束时间',
		width: 140,
		align: 'center',
	},

	{
		prop: 'storehouseNameSourceLabel',
		label: '起始区域',
		width: 250,
		align: 'canter',
	},
	{
		prop: 'storehouseNameTargetLabel',
		label: '终点区域',
		width: 250,
		align: 'canter',
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
// const cellClickEvent = ({ row }) => {
// 	groupObj.groupId = ''
// 	groupObj.groupName = ''
// 	buttonList[0].disabled = false
// 	buttonList[1].disabled = false
// 	clickRow.value = JSON.parse(JSON.stringify(row))
// 	api.getGroupSelect(row.processCode).then(res => {
// 		groupList.value = res.data
// 	})
// }

// 选择分组
const groupObj = reactive({
	groupId: '',
	groupName: '',
})
// 获取默认当前时间班次
const init = async () => {
  if(!isRouter.value){
    await api.getNowDate().then(res => {
      nextTick(() => {
        proxy.$bus.emit('setInitSearchData', { workDate: res.data.workDate, classCode: res.data.classCode })
        queryParams.value.workDate = res.data.workDate
        queryParams.value.classCode = res.data.classCode
      })
    })
    getList(queryParams.value)
  }
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
