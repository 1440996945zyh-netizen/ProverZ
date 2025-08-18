<!--提货委托-->
<template>
	<div class="app-container">
		<SearchHeader
			ref="SearchHeaderRef"
			class="tab_header"
      :showSearchHeader="true"
			:selectData="selectData"
			@searchClick="getList"
			:endSelect="endSelect"
			:buttonList="buttonList"
			:showMoreFlag="true"
			:defaultWidth="55"
		/>
    <BaseTable
      ref="baseTable"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :total="total"
      :searchClick="getList"
      :cellClickEvent="cellClickEvent"
    />
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="trustOrderDrawer" :title="title" size="90%">
			<editTrustOrder ref="trustOrderRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="trustOrderDrawer = false">取消</el-button>
					<el-button type="primary" @click="saveTrustOrder">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="trustOrder">
import BaseTable from '@/components/BaseTable/index.vue'
import SearchHeader from '@/components/SearchHeader/index.vue'
import { ref, reactive, nextTick, onMounted, h } from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/cargoTrust/index'
import tableParamsStore from '@/store/modules/tableParams'
const tableParams = tableParamsStore()
const tableHeight = tableParams.drawerPageTableHeight + 50
const { proxy } = getCurrentInstance()
const SearchHeaderRef = ref()
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	trustType: '2',
})
const clickRow = ref()
//数据总条数
const total = ref(0)
const trustOrderRef = ref(null)
//控制作业指令编辑抽屉
const trustOrderDrawer = ref(false)
const title = ref('提货委托')
//顶部 搜索表单
const selectData = reactive([
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 5,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},

	{
		name: '通知单编号',
		type: 'input', //远程下拉框
		modelValue: 'trustNo', //对应字段
		span: 5,
	},
	{
		name: '船名_航次/SCN/航次状态/进出口/预抵时间/起运港->目的港',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 14,
		dataType: 'SHIPVOYAGE_ITEM',
	},

	{
		name: '作业公司',
		type: 'select', //远程下拉框
		modelValue: 'companyId', //对应字段
		span: 2,
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
  {
    name: '货物名称',
    type: 'input',
    modelValue: 'cargoName', //对应字段
    span: 2,
  },
	{
		name: '指令状态',
		type: 'select', //下拉框
		modelValue: 'status', //对应字段
		span: 2,
		dataConfig: {
			params: {
				type: 'CONSTANT',
				types: 'BUS_TRUST_STATUS',
			},
		},
	},
	{
		name: '票货号',
		type: 'input', //远程下拉框
		modelValue: 'cargoInfoNo', //对应字段
		span: 2,
	},
  {
    name: '委托状态',
    type: 'select', //下拉框
    modelValue: 'consignerType', //对应字段
    span: 3,
    selectData: [
      { label: '未委托', value: '0' },
      { label: '已委托', value: '1' },
    ],
  },
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

])

//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '提货委托', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Document', // 按钮图标，支持element-Plus中所有图标
		click: () => handleUpdate, // 回调函数
		permission: 'business:cargoTrust:trust', // 权限
	},
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '通知单编号', prop: 'trustNo', width: 120, align: 'center' },
	{ label: '船名航次', prop: 'shipNameVoyage', width: 150 },
	{ label: 'SCN', prop: 'scn', width: 150 },
	{ label: '货主', prop: 'cargoOwnerName', width: 150 },
	// { label: '货代', prop: 'cargoAgentName', width: 150 },
	{ label: '货名', prop: 'cargoName', width: 150 },
	{ label: '内外贸', prop: 'tradeType', align: 'center', width: 100 },
	{ label: '通知单类型', prop: 'type', width: 120, align: 'center' },
	{ label: '计划件数', prop: 'planQuantity', align: 'right', width: 100 },
	{ label: '计划重量', prop: 'planTon', align: 'right', width: 100 },
	{ label: '预估金额', prop: 'estAmount', align: 'right', width: 100 },
	{ label: '作业公司', prop: 'companyName', width: 180 },
	{ label: '下发人', prop: 'createByName', width: 100 },
	{ label: '下发时间', prop: 'createTime', width: 150, align: 'center' },
	{
		label: '提货状态',
		prop: 'consignerId',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			let type
			if (row.consignerId == null || row.consignerId=='') {
				type = 'info'
			} else  {
				type = 'success'
			}
			return [
				h(
					ElTag,
					{
						type,
					},
					{
						default: () => (row.consignerId == null || row.consignerId=='')? '未委托':'已委托',
					}
				),
			]
		},
	},
  {
		label: '状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			let type
			if (row.statusLabel === '待发布') {
				type = 'info'
			} else if (row.statusLabel === '已发布') {
				type = 'success'
			} else if (row.statusLabel === '作业中') {
				type = 'primary'
			} else if (row.statusLabel === '核销') {
				type = 'warning'
			} else {
				type = 'info'
			}
			return [
				h(
					ElTag,
					{
						type,
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
])
//查询
const getList = e => {
  buttonList[0].disabled = true
	queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.beginDate = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
  console.log(queryParams,"queryParams");
  api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const handleUpdate = () => {
  let row = clickRow.value
  title.value = '提货委托'
  trustOrderDrawer.value = true
  nextTick(() => {
    trustOrderRef.value.resetForm()
    trustOrderRef.value.type = queryParams.value.trustType
    trustOrderRef.value.printShow = queryParams.value.trustType == 2 ? false : true
    trustOrderRef.value.multiple = false

    api.getDetail(row.id).then(res => {
      if (res.code === '0000') {
        console.log('作业通知单编辑单条数据', res.data)
        trustOrderRef.value.disabled = true
        trustOrderRef.value.typeDisabled = res.data.type != '疏港'
        console.log(trustOrderRef.value.typeDisabled)
        trustOrderRef.value.trustOrderForm = {
          ...res.data,
          shipInfo: {
            cargoCategoryName: res.data.shipInfo ? res.data.shipInfo.cargoCategoryName : '',
            shipAgentName: res.data.shipInfo ? res.data.shipInfo.shipAgentName : '',
            arrivalTimePlan: res.data.shipInfo ? res.data.shipInfo.arrivalTimePlan : '',
            startPortName: res.data.shipInfo ? res.data.shipInfo.startPortName : '',
            endPortName: res.data.shipInfo ? res.data.shipInfo.endPortName : '',
          },
        }
      }
    })
  })
}
//提交作业指令信息
const saveTrustOrder = async () => {
  if (await trustOrderRef.value.validate()) {
    if(trustOrderRef.value.trustOrderForm.fileIds.length>0){
      proxy.$modal.confirm('确定保存？').then(() => {
        const params = JSON.parse(JSON.stringify(trustOrderRef.value.trustOrderForm))
        let data = {
          updates: params.cargoList,
          type: trustOrderRef.value.trustOrderForm.type,
          id: trustOrderRef.value.trustOrderForm.id,
          fileIds: trustOrderRef.value.trustOrderForm.fileIds,

        }
        console.log('已发布保存数据', data)
        api.updateConsigner(data).then(res => {
          if (res.code === '0000') {
            proxy.$modal.msgSuccess('委托成功')
            trustOrderDrawer.value = false
            getList(queryParams.value)
          }
        })
      })
    }else{
      proxy.$modal.confirm('没有上传委托附加，确认不上传委托附件但进行提货委托吗？').then(() => {
        proxy.$modal.confirm('确定保存？').then(() => {
          const params = JSON.parse(JSON.stringify(trustOrderRef.value.trustOrderForm))
          let data = {
            updates: params.cargoList,
            type: trustOrderRef.value.trustOrderForm.type,
            id: trustOrderRef.value.trustOrderForm.id,
            fileIds: trustOrderRef.value.trustOrderForm.fileIds,

          }
          console.log('已发布保存数据', data)
          api.updateConsigner(data).then(res => {
            if (res.code === '0000') {
              proxy.$modal.msgSuccess('委托成功')
              trustOrderDrawer.value = false
              getList(queryParams.value)
            }
          })
        })
      })

    }
  }
}
const cellClickEvent = ({ row }) => {
	clickRow.value = row
  buttonList[0].disabled = false
}

// getList(queryParams.value)


const init = async ()=>{
  await api.getCurrentShift().then(res => {
    console.log('默认时间日期', res)
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
</script>

<style scoped></style>
