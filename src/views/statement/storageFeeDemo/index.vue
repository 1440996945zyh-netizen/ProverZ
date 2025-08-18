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
		/>
	</div>
</template>

<script setup name="storageFeeDemo">

import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import api from '@/api/storageFeeDemo/index'
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

const defaultList = ([{label:'是',value:'1'},{label:'否',value:'0'}])

const total = ref(0)
//顶部 搜索表单
const selectData = reactive([
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 8,
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
		name: '船名航次',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span:8,
	},
	{
		name: '客户',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 8,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
  {
		name: '票货号码',
		type: 'input', //远程下拉框
		modelValue: 'cargoInfoNo', //对应字段
		span: 3,
	},
  {
		name: '货名',
		type: 'input', //远程下拉框
		modelValue: 'cargoName', //对应字段
		span: 3,
	},
  {
    name: '是否完货',
    type: 'select',
    modelValue: 'isClear',
    span: 3,
    selectData: [{label:'是',value:'1'},{label:'否',value:'0'}],
  },
  {
    name: '是否超期',
    type: 'select',
    modelValue: 'isOverTime',
    span: 3,
    selectData: [{label:'是',value:'1'},{label:'否',value:'0'}],
  }, {
    name: '作业模式',
    type: 'select',
    modelValue: 'workType',
    span: 3,
    selectData: [{label:'件',value:'件'},{label:'散',value:'散'}],
  },
  {
    name: '流向',
    type: 'input',
    modelValue: 'flowDirection',
    span: 3,
  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'settleStatus',
    span: 3,
    selectData: [{label:'未结算',value:'10'},{label:'部分结算',value:'20'}],
  },
])

const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '作业模式', prop:'workType',width: 100},
  { label: '货种', prop:'cargoCategoryName',width: 150},
  { label: '货类', prop:'cargoTypeName',width: 150},
  { label: '货名', prop:'cargoName',width: 150},
  { label: '来源', prop:'source',width: 100},
  { label: '流向', prop:'flowDirection',width: 100},
  { label: '内外贸', prop:'tradeType',width: 100},
  { label: '货主', prop:'cargoOwnerName',width: 200},
  { label: '票货编号', prop:'cargoInfoNo',width: 150},
  { label: '船名航次', prop:'shipName',width: 100},
  { label: 'SCN', prop:'scn',width: 100},

  { label: '计算开始时间', prop:'calStartTime',width: 180},
  { label: '计算结束时间', prop:'calEndTime',width: 180},
  { label: '免堆存期', prop:'freeDays',width: 100},
  { label: '超期日期', prop:'overDate',width: 180},
  { label: '超期天数', prop:'overTime',width: 180},
  { label: '票货创建时间', prop:'cargoInfoTime',width: 180},
  { label: '作业公司', prop:'companyName',width: 180},
  { label: '金额', prop:'amount',width: 100},
  { label: '备注', prop:'remark',width: 180,fixed:'right'},
  { label: '记录创建时间', prop:'createTime',width: 100},
  // { label: '结算状态', prop:'settleStatus',width: 100},
  {
    label: '结算状态',
    prop: 'settleStatus',
    align: 'right',fixed:'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.settleStatus === '10' ? '' : 'info',
          },
          {
            default: () => (row.settleStatus == 10 ? '未结算' :(row.settleStatus == 20 ? '部分结算':(row.settleStatus == 30 ? '最终结算':''))),
          }
        ),
      ]
    },
  },
	{
		label: '是否完货',
		prop: 'isClear',
		align: 'right',fixed:'right',
    width: 100,
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
	{
		label: '是否超期',
		prop: 'isOverTime',
		align: 'right',fixed:'right',
    width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isOverTime === '1' ? '' : 'info',
					},
					{
						default: () => (row.isOverTime == 1 ? '是' : '否'),
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
		label: '查询', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => getList, // 回调函数
		permission: 'storageFeeDemo:getList', // 权限
	},
])

const getList = e => {
	queryParams.value = e
  queryParams.value.beginDate = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
	api.getList(queryParams.value ).then(res => {
		if (res.code === '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
		}
	})
}
const init = async ()=>{
  await api.getCurrentShift().then(res => {
    console.log('默认时间日期', res)
    console.log()
    var date = new Date(new Date(res.data.workDate) - (30 * (24 * 60 * 60 * 1000)));

    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        // beginDate: res.data.workDate.slice(0, -2).concat('01'),
        // endDate: res.data.workDate,
        date: [ date.getFullYear()+"-"+date.getMonth().toString().padStart(2, '0')+"-"+date.getDate().toString().padStart(2, '0'), res.data.workDate],
      })
      queryParams.value.date = [date.getFullYear()+"-"+date.getMonth().toString().padStart(2, '0')+"-"+date.getDate().toString().padStart(2, '0'), res.data.workDate]

      getList(queryParams.value)
    })
  })
}
init()


</script>

<style scoped></style>
