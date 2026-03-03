<template>
	<div class="app-container">
	  <BaseTable
			  ref="baseTable"
			  :showSearchHeader="true"
			  :selectData="selectData"
			  :searchClick="getList"
			  :tableColumns="tableColumns"
			  :tableData="tableData"
			  :total="total"
		  />
	  <el-drawer v-model="isShow" :title="title" size="40%">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto; display: flex; justify-content: flex-end; gap: 10px;">
					<el-button @click="isShow = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
  </template>
  
  <script setup name="equipmentOperationSum">
  import BaseTable from '@/components/BaseTable/index.vue'
//   import detail from './detail/index.vue'
  import api from '@/api/equipment/equipmentOperationSum/index'
  import { ref, reactive, nextTick, h, getCurrentInstance, onMounted } from 'vue'
  import { ElButton, ElTag } from 'element-plus'
  const { proxy } = getCurrentInstance()
  
  const baseTable = ref()
  const detailRef = ref(null)
  const isShow = ref(false)
  const title = ref('新增')
  const selectData = reactive([
	{
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
	  {
		  name: '设备名称',
		  type: 'input',
		  modelValue: 'equipName',
		  span: 8,
	  },
  ])
  
  
  const total = ref(0)
  const queryParams = ref({
	  startPage: 1,
	  pageSize: 20,
  })
  const tableData = ref([])
  const tableColumns = ref([
	 
	//   { label: '日期', prop: 'workDate', width: 120 },
	  { label: '设备名称', prop: 'equipName', width: 150 },
	  { label: '运行台时', prop: 'runTime', align: 'right', },
	  { label: '作业台时', prop: 'workTime', align: 'right', },
	  { label: '故障台时', prop: 'faultTime', align: 'right', },
	  { label: '运行里程', prop: 'runMileage', align: 'right', },
	//   { label: '作业吨数', prop: 'workTon', align: 'right', },
	//   { label: '作业箱量', prop: 'workBox', align: 'right', },
	  { label: '运行率（%）', prop: 'runRate', align: 'right', },
	  { label: '故障率（%）', prop: 'faultRate', align: 'right', },
	  { label: '完好率（%）', prop: 'intactRate', width: 160},
	 
  ])
  const getList = e => {
	queryParams.value = e
	queryParams.value.startTime = queryParams.value.date ? queryParams.value.date[0] : ''
	queryParams.value.endTime = queryParams.value.date ? queryParams.value.date[1] : ''
	api.getList(queryParams.value).then(res => {
	  tableData.value = res.data.pages 
	  total.value = res.data.totalNum
	})
  }
  // 新增
  const add = () => {
	title.value = '新增'
	isShow.value = true
	nextTick(() => {
	  detailRef.value.resetForm()
	})
  }
  // 编辑
  const handleUpdate = row => {
	title.value = '修改'
	isShow.value = true
	nextTick(() => {
	  detailRef.value.resetForm()
	  api.getById({id: row.id}).then(res => {
		detailRef.value.formData = JSON.parse(JSON.stringify(res.data))
	  })
	})
  }
  // 删除
  const handleDelete = row => {
	proxy.$modal.confirm("确认删除？").then(res => {
	  api.delete({id: row.id}).then(res => {
		proxy.$message.success(res.msg)
		getList(queryParams.value)
	  })
	})
  }
  // 保存
  const save = async() => {
	if (await detailRef.value.validate) {
	  const params = JSON.parse(JSON.stringify(detailRef.value.formData))
	  proxy.$modal.confirm("确认保存？").then(res => {
		if (params.id) {
		  api.update(params).then(res => {
			isShow.value = false
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		  })
		} else {
		  api.add(params).then(res => {
			isShow.value = false
			proxy.$message.success(res.msg)
			getList(queryParams.value)
		  })
		}
	  })
	}
  }
  
  getList(queryParams.value)
  </script>
  
  <style>
  
  </style>