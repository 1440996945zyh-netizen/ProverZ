<!-- 商务指令 -->
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
      :html-content="collectHtml"
      :cellClickEvent="cellClickEvent"
      ref="baseTable"
		/>

	</div>
</template>

<script setup name="FinanceSharePlatform">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/finance/FinanceSharePlatform/index'
const { proxy } = getCurrentInstance()
const baseTable = ref() // table的ref
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  startTime:null,
  endTime:null,
})
const clickRow = ref({})
const invoiceAddRef = ref(null)
const editOrAdd =ref(false) // 是否显示保存按钮
//发票新增
const invoiceAddDrawer = ref(false)
const title = ref('新增作业指令')
//顶部 搜索表单
const selectData = reactive([
  {
    // name: '起止日期',
    type: 'daterange',
    clearable: false,
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
  {
    name: '业务类型',
    type: 'select',//远程下拉框
    modelValue: 'businessType',//对应字段
    span: 8,
    selectData: [
      { label: '货物发票', value: '10' },
      { label: '船舶发票', value: '30' },
      { label: '杂项发票', value: '40' },
      { label: '堆存费', value: '50' },
    ],
  }
])
import { useRouter,onBeforeRouteUpdate } from 'vue-router';
let router = useRouter()
const isRouter = ref(false)
watch(() =>router.currentRoute.value.path,(newValue,oldValue)=> {
  let routerQuery = router.currentRoute.value.query;
  if(JSON.stringify(routerQuery) != "{}"){
    isRouter.value = true;
    nextTick(()=>{
      baseTable.value.SearchHeaderRef.searchData.date = [routerQuery.startTime,routerQuery.endTime];
      queryParams.value.date = [routerQuery.startTime,routerQuery.endTime]
      queryParams.value.startTime = routerQuery.startTime
      queryParams.value.endTime = routerQuery.endTime
      getList(queryParams.value)
    })
  }
},{ immediate: true })

//数据总条数
const total = ref(0)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: "重新传输", // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => reSend, // 回调函数
		permission: 'finance:platform:reSend', // 权限
	},
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '发票编号', prop: 'sysInvoiceCode',width:110 },
	{ label: '作业公司', prop: 'companyName',width:190,align: 'center', },
	{ label: '客户名称', prop: 'customerName',width:220,align: 'center', },
	{ label: '金额', prop: 'invoiceAmount',align:'right', isThousandth: 'true',width:80 },
	{ label: '操作时间', prop: 'operTime' ,width:100},
	{ label: '操作人', prop: 'operUserName',width:110 },
	// {
	// 	prop: '',
	// 	label: '操作',
	// 	width: 150,
	// 	align: 'center',
  //   fixed:'right',
	// 	render: row => {
	// 		return [
	// 			h(
	// 				ElButton,
	// 				{
	// 					onClick: () => {
	// 						check(row)
	// 					},
	// 					type: 'primary',
	// 					link: true,
	// 					icon: 'Edit',
	// 					permission: 'finance:invoice:check', // 权限
	// 				},
	// 				{
	// 					default: () => '查看',
	// 				}
	// 			),
	// 			h(
	// 				ElButton,
	// 				{
	// 					onClick: () => {
	// 						handle(row)
	// 					},
	// 					type: 'danger',
	// 					link: true,
	// 					icon: 'Delete',
	// 					permission: 'finance:invoice:handle', // 权限
	// 				},
	// 				{
	// 					default: () => '作废',
	// 				}
	// 			)
	// 		]
	// 	},
	// },
])
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
//查询
const getList = async e => {
  Object.assign(queryParams.value,e)
  if(e.date !=undefined && e.date.length>0){
    queryParams.value.startTime = e.date[0]
    queryParams.value.endTime = e.date[1]
  }else{
    queryParams.value.startTime = null
    queryParams.value.endTime = null
  }
	await api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
  })
}

const reSend =()=>{
  console.log(clickRow);
  let tmpParams ={
    operId : clickRow.value.operId
  }
  api.reSend(tmpParams).then(res => {
    proxy.$message.info(res.msg);
  })
}

const init=()=>{
  if(!isRouter.value){
    getList(queryParams.value)
  }
}
init();
</script>

<style scoped></style>
