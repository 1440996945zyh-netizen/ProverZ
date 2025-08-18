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
          :scroll-y = "scrollY"
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
          :scroll-y = "scrollY"
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
          :scroll-y = "scrollY"
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
          :scroll-y = "scrollY"
        />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup name="auditMonthTicket">
import SearchHeader from '@/components/SearchHeader/index.vue'
import api from '@/api/produce/auditTicket/index.js'
import { ElTag } from 'element-plus'
// import detail from './detail/index'
import { reactive, ref, toRaw, nextTick } from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
const scrollY = {
  enabled: true, // 表示垂直滚动功能关闭。
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
/*
const checkboxChangeEvent = data => {
	// console.log('选中数据：', data)
	checkboxList.value = data
	if (checkboxList.value.length !== 0) {
		buttonList[0].disabled = false
		buttonList[1].disabled = false
	} else {
		buttonList[0].disabled = true
		buttonList[1].disabled = true
	}
	// console.log('选中数据：', checkboxList.value)
}
// 全选事件
const allChangeEvent = ({ checked }) => {
	checkboxList.value = []
	// console.log('全选事件', checked)
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
*/

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
	// {
	// 	type: 'date',
	// 	modelValue: 'workDate',
	// 	span: 12,
	// 	name: '选择日期',
	// },
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 16,
    shortcuts: [
      {
        text: '上周',
        value: () => {
          const currentTimestamp = Date.now()
          const currentDate = new Date(currentTimestamp)
          // 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
          const currentDayOfWeek = currentDate.getDay()
          // 计算上周的起始日期和结束日期的时间戳
          const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
          const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
          const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
          const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
          return [lastWeekStartDate, lastWeekEndDate]
        },
      },
      {
        text: '本周',
        value: () => {
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取本周的起始日期和结束日期
          const thisWeekStartDate = new Date(currentDate)
          thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
          const thisWeekEndDate = new Date(currentDate)
          thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
          return [thisWeekStartDate, thisWeekEndDate]
        },
      },
      {
        text: '下周',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取下周的起始日期和结束日期
          const nextWeekStartDate = new Date(currentDate)
          nextWeekStartDate.setDate(currentDate.getDate() + (8 - currentDayOfWeek))
          const nextWeekEndDate = new Date(currentDate)
          nextWeekEndDate.setDate(currentDate.getDate() + (14 - currentDayOfWeek))
          return [nextWeekStartDate, nextWeekEndDate]
        },
      },
      {
        text: '上月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上个月的起始日期和结束日期
          const lastMonthStartDate = new Date(currentDate)
          lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

          const lastMonthEndDate = new Date(currentDate)
          lastMonthEndDate.setDate(0)
          return [lastMonthStartDate, lastMonthEndDate]
        },
      },
      {
        text: '本月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本月的起始日期和结束日期
          const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentMonthStartDate, currentMonthEndDate]
        },
      },
      {
        text: '下月',
        value: () => {
          const currentDate = new Date()
          // 获取下月的起始日期和结束日期
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const nextMonthEndDate = new Date(nextMonthStartDate.getFullYear(), nextMonthStartDate.getMonth() + 1, 0)
          return [nextMonthStartDate, nextMonthEndDate]
        },
      },
      {
        text: '上季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
          const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
          return [lastQuarterStartDate, lastQuarterEndDate]
        },
      },
      {
        text: '本季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
          const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentQuarterStartDate, currentQuarterEndDate]
        },
      },
      {
        text: '下季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取下季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const nextQuarter = currentQuarter === 3 ? 0 : currentQuarter + 1 // 下季度
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), nextQuarter * 3, 1)
          const nextQuarterEndDate = new Date(
            new Date(nextQuarterStartDate.getFullYear(), nextQuarterStartDate.getMonth() + 3, 1) - 1
          )
          return [nextQuarterStartDate, nextQuarterEndDate]
        },
      },
      {
        text: '去年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算去年的起始日期和结束日期
          const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
          const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
          return [lastYearStartDate, lastYearEndDate]
        },
      },
      {
        text: '今年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算今年的起始日期和结束日期
          const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
          const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
          return [currentYearStartDate, currentYearEndDate]
        },
      },
      {
        text: '明年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算明年的起始日期和结束日期
          const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1)
          const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31)
          return [nextYearStartDate, nextYearEndDate]
        },
      },
    ],
  },
	/*{
		name: '班次',
		type: 'select',
		modelValue: 'classCode',
		span: 12,
		dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
	},*/

	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 8,
		dataType: 'VOYAGE',
	},
  {
      name: '',
      type: '', //空的站格子
      modelValue: '', //
      span: 0,
      dataType: '',
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
		name: '部门类型', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'ticketType', // 绑定字段
		span: 3, // 占位，共24
		selectData: [
			{ label: '调度', value: '1' },
			{ label: '库场', value: '2' },
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
  {
    name: '班次',
    type: 'select',
    modelValue: 'classCode',
    span: 3,
    dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
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
	/*buttonList[0].disabled = true
	buttonList[1].disabled = true*/
	queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.startDay = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDay = queryParams.value.date ? queryParams.value.date[1] : ''
/*	if (queryParams.value.classCode == '' || queryParams.value.workDate == '') {
		proxy.$message.warning('请填写完整查询条件！')
		loading.value = false
		return
	}*/
	 console.log('查询条件', queryParams.value)
	await api.getMonthWorkTicketList(queryParams.value).then(res => {
		// console.log('表格数据', res)
		tableData.value = res.data
	})
}
// header按钮参数
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'produce:auditMonthTicket:export', // 权限
  },
	/*{
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
	},*/
])

const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '签票审核')
  })
}
// 审核作业票
const auditTicket = () => {
	if (!checkboxList.value) {
		proxy.$message.warning('请先选择需要审核的作业票信息！')
		return
	}
	// console.log('审销作业票类型', queryParams.value.planType)
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
		console.log('集疏港审核', newArr)
		let param = {
			workPlanList: newArr,
		}
		proxy.$modal.confirm('确定审核？').then(() => {
			api.getAuditTicketJsg(param).then(res => {
				console.log(res)
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
		// console.log('审核作业票newArr', newArr)
		let data = {
			workPlanIdList: newArr,
		}
		proxy.$modal.confirm('确定审核？').then(() => {
			api.getAuditTicket(data).then(res => {
				console.log(res)
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
			// console.log(res)
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
	{ prop: 'className', label: '班次时间', width: 150, align: 'center' },
	{ prop: 'shipNameVoyage', label: '船名', width: 130, align: 'left' },
	{ prop: 'loadUnload', label: '装卸', width: 80, align: 'center' },
	{ prop: 'deptName', label: '部门', align: 'center', width: 100 },
	{ prop: 'cargoNameLabel', label: '货物信息', width: 500, align: 'left' },
	{ prop: 'deptItemName', label: '操作班组', width: 100, align: 'center' },
	{ prop: 'personNelName', label: '人员班组', width: 100 },
	{ label: '作业过程', prop: 'processDetailName', width: 140 },
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

  await api.getCurrentShift().then(res => {
    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        // beginDate: res.data.workDate.slice(0, -2).concat('01'),
        // endDate: res.data.workDate,
        date: [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate],
      })
      queryParams.value.date = [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]
      getList(queryParams.value)
    })
  })

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
