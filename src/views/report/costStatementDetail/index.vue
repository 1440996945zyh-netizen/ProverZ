<template>
  <div class="app-container">
    <BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:autoResize="true"
			:total="total"
      :html-content="collectHtml"
    />
  </div>
</template>
<script setup name="costStatementDetail">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted,h,getCurrentInstance, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/statement/costStatement/index'
import publicapi from '@/api/public/index'
import { ElButton, ElTag,ElMessage, ElMessageBox,ElLink } from 'element-plus'
import useUserStore from '@/store/modules/user'
import math from '@/utils/math.js'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const userName = computed(() => userStore.name)
const total = ref(0)
const clickRow = ref(null)
const showFile = ref(true)
const isAudit = ref(true)
const hzDialogVisible = ref(false)
const rotation = ref(0)
const baseTable = ref() // table的ref

const collectHtml = ref(`<p style="line-height:25px;margin-top:10px;"> 合计金额：0 元</p>`)
// 搜索框
const selectData = reactive([
  {
		name: '结算单号',
		type: 'input', //远程下拉框
		modelValue: 'statementNo', //对应字段
		span: 8,
	},
  {
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
	},
  {
    name: '客户',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '结算单类型',
    type: 'select', //远程下拉框
    modelValue: 'type', //对应字段
    span: 2,
    dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/HANDOVERLIST_TYPE',
			method: 'get',
		},
  },
  {
		name: '费目名称', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'rateItemCodes', // 绑定字段
		span: 4, // 占位，共24
    multiple:'multiple',
    maxCollapseTags:1,
		dataConfig: { params: { type: 'FEE_ITEM' } },
	},
  {
    name: '状态',
    type: 'select', //远程下拉框
    modelValue: 'status', //对应字段
    span: 2,
    dataConfig: {
			// 本地需要dataConfig获取数据，包括url、method，method默认get
			url: '/api/internal/public/getDictListByType/STATEMENT_STATUS',
			method: 'get',
		},
  },
  {
    name: '财务状态',
    type: 'select', //远程下拉框
    modelValue: 'financeStatus', //对应字段
    span: 2,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      url: '/api/internal/public/getDictListByType/STATEMENT_CW_STATUS',
      method: 'get',
    },
  },
  {
    name: '票货号',
    type: 'input', //远程下拉框
    modelValue: 'cargoInfoNo', //对应字段
    span: 2,
  },
  {
    name: '作业公司',
    type: 'select', //远程下拉框
    modelValue: 'companyId', //对应字段
    span: 2,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
  {
    name: '折扣',
    type: 'select', //远程下拉框
    modelValue: 'isDiscount', //对应字段
    span: 2,
    selectData:[
      {value:1,label:'是'},
      {value:2,label:'否'},
    ]
  },
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 4,
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
    ],
  },
])
// 按钮组
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'report:costStatementDetail:export', // 权限
  },
])
const billingRef = ref()
// 列表
const tableData = ref([])
const sumObj = ref({})
const tableColumns = reactive([
  {
    prop: 'statementNo',
    label: '结算单号',
    width: 120
  },
  {
    prop: 'companyName',
    label: '作业公司',
    width: 170
  },
  {
    prop: 'customerName',
    label: '结算单位',
    width: 260
  },
  {
    prop: 'type',
    label: '结算单类型',
    width: 140
  },
  {
    prop: 'rateItemName',
    label: '费目',
    width: 120
  },
  {
    prop: 'shipNameVoyage',
    label: '船名航次',
    width: 140
  },
  {
    prop: 'cargoInfoNo',
    label: '票货号',
    width: 140
  },
  {
    prop: 'cargoName',
    label: '货名',
    width: 140
  },
  {
    prop: 'tradeType',
    label: '贸别',
    width: 140
  },
  {
    prop: 'impExp',
    label: '进出口',
    width: 140
  },
  {
    prop: 'leaveBerthTime',
    label: '离泊日期',
    width: 140
  },

  {
    prop: 'settlementDate',
    label: '统计日期',
    width: 140
  },

  {
    prop: 'processName',
    label: '作业过程',
    width: 120
  },
  {
    prop: 'serviceContentName',
    label: '服务内容',
    width: 120
  },
  {
    prop: 'number',
    label: '数量1',
    width: 120
  },
  {
    prop: 'number2',
    label: '数量2',
    width: 120
  },
  {
    prop: 'rate',
    label: '费率',
    width: 120
  },
  {
    prop: 'unitName',
    label: '计费单位',
    width: 120
  },
  {
    prop: 'amountjf',
    label: '计费金额',
    width: 120
  },
  {
    prop: 'amountzk',
    label: '折扣金额',
    width: 120
  },
  {
    prop: 'amount',
    label: '结算单金额',
    width: 120
  },
  {
    prop: 'tax',
    label: '税率%',
    width: 120
  },
  {
    prop: 'taxAmount',
    label: '税额',
    width: 120
  },
  {
    prop: 'invoiceAmount',
    label: '开票金额',
    width: 140
  },
  {
    prop: 'invoiceAmountsy',
    label: '剩余开票金额',
    width: 140
  },
  {
    prop: 'utilizedAmount',
    label: '收款金额',
    width: 140
  },
  {
    prop: 'utilizedAmountsy',
    label: '剩余收款金额',
    width: 140
  },
  {
    prop: 'remark',
    label: '备注',
    width: 120
  },
  {
    prop: 'statusLabel',
    label: '状态',
    width: 100,
    fixed: 'right',
    render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '30' ? '' :
            row.status == '31' ? 'success' :
            row.status == '40' ? 'primary' :
            row.status == '50' ? 'warning' : 'info',
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
  },
  {
    prop: 'financeStatusLabel',
    label: '财务审核状态',
    width: 120,
    fixed: 'right',
    render: row => {
			return [
				h(
					ElTag,
					{
						type: row.financeStatus == '10' ? '' : 'success',
					},
					{
						default: () => row.financeStatusLabel,
					}
				),
			]
		},
  },
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const exportExcel =()=>{
  queryParams.value = Object.assign(queryParams.value)
  queryParams.value.months = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.monthe = queryParams.value.date ? queryParams.value.date[1] : ''
  queryParams.value.rateItemCode = queryParams.value.rateItemCodes ? queryParams.value.rateItemCodes.join(',') : ''
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '结算汇总表')
  })
}
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
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.months = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.monthe = queryParams.value.date ? queryParams.value.date[1] : ''
  queryParams.value.rateItemCode = queryParams.value.rateItemCodes ? queryParams.value.rateItemCodes.join(',') : ''
	api.queryAllDetail(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
    if(res.data.extraData){
      sumObj.value=JSON.parse(res.data.extraData)
     }else{
      sumObj.value = {
        amount:0,
        invoiceAmount:0,
        utilizedAmount:0,
      }
    }
    collectHtml.value = `<p style="line-height:25px;margin-top:10px;"> 合计：金额：${sumObj.value.amount} 元; 开票金额：${sumObj.value.invoiceAmount} 元; 收款金额：${sumObj.value.utilizedAmount} 元</p>`
	})
}
const init = async () => {
  await api.getCurrentShift().then(res => {
    nextTick(() => {
      /*proxy.$bus.emit('setInitSearchData', {
        // beginDate: res.data.workDate.slice(0, -2).concat('01'),
        // endDate: res.data.workDate,
        date: [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate],
      })*/
      baseTable.value.SearchHeaderRef.searchData.date=[res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]
      queryParams.value.date = [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]
      getList(queryParams.value)
    })
  })
}
// 初始化
init()
</script>
<style  lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.app-container {
	height: auto !important;
}
</style>
