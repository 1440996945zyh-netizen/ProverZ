<template>
	<el-drawer v-model="instructDrawerVisible" append-to-body title="作业指令" size="70%" :show-close="false">
		<template #header="{}">
			<div class="title">
				<div style="width: 200px"><span>作业指令</span></div>
				<div style="display: flex">
					<el-date-picker
						v-if="trustType == 1 || trustType == 2"
						style="margin-right: 10px !important"
						v-model="formData.workDate"
						type="date"
						value-format="YYYY-MM-DD"
						format="YYYY-MM-DD"
						placeholder="日期"
					></el-date-picker>
					<Select
						v-if="trustType == 1 || trustType == 2"
						v-model:value="formData.classCode"
						v-model:label="formData.className"
						placeholder="班次"
						:dataConfig="{
							url: '/api/internal/public/getDictListByType/WORK_SCHEDULE',
						}"
					/>

					<el-button style="margin-left: 10px" type="primary" icon="Plus" @click="add">导入</el-button>
				</div>
			</div>
		</template>
		<BaseTable
			ref="baseTableRef"
			:showSearchHeader="true"
      :showNum = '4'
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:tableHeight="'pageTableHeight'"
			:checkbox-config="checkboxConfig"
			:selectAllChangeEvent="checkboxChangeEvent"
			@checkbox-change="checkboxChangeEvent"
		/>
	</el-drawer>

  <el-dialog
    v-model="dialogVisible"
    title="作业要求"
    width="30%"
    :before-close="handleClose"
  >
    <span>{{tmpDialogInfo}}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="instructions">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
import publicApi from '@/api/public/index.js'
import Select from '@/components/Select'

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const tmpDialogInfo = ref("");
const dialogVisible = ref(false)
const baseTableRef = ref(null)
const instructDrawerVisible = ref(false)
const isHidden = ref(true)
const emit = defineEmits(['change'])
const checkDate = ref([]) // 选中数据
const importDate = ref({}) // 导入数据 2.集疏港3.倒运4.杂项/辅助返回一条数据（对象），1.装卸船返回一个对象（list（多条）、和日期班次字段）
// const trustNo=ref('')//作业指令
const props = defineProps({
	//指令类型1.装卸船2.集疏港3.倒运4.杂项/辅助
	trustType: {
		type: String,
	},
	value: {
		type: String,
	},
	permission: {
		type: String,
	},
})
const value = computed({
	get() {
		return props.value
	},
	set(val) {
		emit('update:value', val)
	},
})
const formData = ref({
	workDate: '',
	classCode: '',
	className: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '', type: 'checkbox', width: 50 },
	{ label: '通知单编号', prop: 'trustNo', align: 'left', min_width: 150 },
	// { label: '客户名称', prop: 'customerName', align: 'left', min_width: 100 },
	{ label: '船名航次', prop: 'voyage', align: 'left', min_width: 100 },
	// { label: '作业过程', prop: 'processName', align: 'left', min_width: 100 },
	{ label: '通知单类型', prop: 'type', align: 'left', min_width: 100 },
	{ label: '货主', prop: 'cargoOwnerName' },
	{ label: '货名', prop: 'cargoName' },
	{ label: '结算依据', prop: 'settlementBasisName' },
  { label: '船舶状态', prop: 'shipStatusName' },
	{ label: '计划件数', prop: 'planQuantity', align: 'right', min_width: 100 },
	{ label: '计划重量', prop: 'planTon', align: 'right', min_width: 100 },
	{ label: '作业要求', prop: 'remark', align: 'left', min_width: 100 },
	{ label: '作业公司', prop: 'companyName', align: 'left', min_width: 100 },
])
const selectData = reactive([
	{
		name: '通知单编号',
		type: 'input', //远程下拉框
		modelValue: 'trustNo', //对应字段
		span: 6,
	},
	{
		name: '船名航次', // 搜索框name
		type: 'remoteSelect', // 搜索框类型
		modelValue: 'shipvoyageItemId', // 绑定字段
		span: 6, // 占位，共24
		dataType: 'VOYAGE',
	},
	{
		name: '客户名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'customerName', // 绑定字段
		span: 6, // 占位，共24
	},
  {
    name: '船舶状态',
    type: 'select',
    modelValue: 'shipStatusBroadCode',
    span: 6,
    selectData: [
      { label: '预到', value: '00' },
      { label: '锚地', value: '10' },
      { label: '在港', value: '20' },
      { label: '离港', value: '30' },
    ],
  },
  {
    name: '包装',
    type: 'select',
    modelValue: 'packageCode',
    span: 3,
    dataConfig: { params: { type: 'DICT', dictType: 'PACKAGE_TYPE' } },
  },
  {
    name: '是否完货',
    type: 'select',
    modelValue: 'isClear',
    span: 3,
    isHidden:isHidden,
    selectData: [{value:'1',label:'是'},{value:'0',label:'否'}],
  },
  {
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 6,
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
// 复选框配置
const checkboxConfig = {
	highlight: true, // 选中高亮行
	strict: false, // 可以取消
	reserve: false, // 是否保留选中状态
	showHeader: true, // 是否显示全选
	checkAll: false, // 是否全选
	range: false, // 	开启复选框范围选择功能
	visibleMethod: ({}) => {
		// 返回显示的单选框
		return true
	},
	checkMethod: ({ row }) => {
		// 返回可选的单选框
		return row.isDisable ? false : true
	},
	checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const cellClickEvent = (e)=>{
  tmpDialogInfo.value = ''
  if(e.columnIndex==10 &&  (e.row.remark != null)){
    nextTick(()=>{
      tmpDialogInfo.value = e.row.remark
      dialogVisible.value = true
    })
  }

}
// 导入事件
const add = () => {
	checkDate.value = baseTableRef.value.getSelectEvent()
	console.log('导入已选中指令', checkDate.value)
	// console.log('导入具体数据', importDate.value)
	if (props.trustType == '1' && (!formData.value.workDate || !formData.value.classCode)) {
		proxy.$message.warning('请填写日期和班次！')
		return
	}
	if (props.trustType != '1' && props.trustType != '2' && checkDate.value.length != 1) {
		//零工、集疏港、转运只能导入一条指令
		return proxy.$message.warning('请勾选一条数据！')
	}
	if (props.trustType == '1' && checkDate.value.length == 0) {
		//船舶计划可以导入多条指令
		return proxy.$message.warning('请至少勾选一条数据！')
	}
	if (props.trustType == '1') {
		// console.log('选中数据默认', formData.value)
		let voyages = checkDate.value.map(item => item.voyage) //船名航次
		let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

		let processNames = checkDate.value.map(item => item.processNames) //作业过程
		let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
		if (voyagesNum !== 1 || processNamesNum !== 1) {
			return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
		}
		importDate.value.trustType = props.trustType
		importDate.value.trustIds = checkDate.value.map(item => item.id)
		importDate.value.workDate = formData.value.workDate
		importDate.value.classCode = formData.value.classCode
		importDate.value.className = formData.value.className
	} else if (props.trustType == '2') {
		let voyages = checkDate.value.map(item => item.voyage) //船名航次
		let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

		let processNames = checkDate.value.map(item => item.processNames) //作业过程
		let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
		if (voyagesNum !== 1 || processNamesNum !== 1) {
			return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
		}
		importDate.value.trustType = props.trustType
		importDate.value.trustIds = checkDate.value.map(item => item.id)
		importDate.value.workDate = formData.value.workDate
		importDate.value.classCode = formData.value.classCode
		importDate.value.className = formData.value.className
	} else if (props.trustType == '3') {
    let voyages = checkDate.value.map(item => item.voyage) //船名航次
    let voyagesNum = new Set(voyages).size //已选中数量，如果相同为1，反之2

    let processNames = checkDate.value.map(item => item.processNames) //作业过程
    let processNamesNum = new Set(processNames).size //已选中数量，如果相同为1，反之2
    if (voyagesNum !== 1 || processNamesNum !== 1) {
      return proxy.$message.warning('只能导入相同船名航次及作业过程的数据！')
    }
    importDate.value.trustType = props.trustType
    importDate.value.trustIds = checkDate.value.map(item => item.id)
    importDate.value.workDate = formData.value.workDate
    importDate.value.classCode = formData.value.classCode
    importDate.value.className = formData.value.className
  } else {
		importDate.value = checkDate.value[0]
		importDate.value.workDate = formData.value.workDate
		importDate.value.classCode = formData.value.classCode
		importDate.value.className = formData.value.className
	}
	value.value = importDate.value.trustNo
	instructDrawerVisible.value = false
	emit('change', importDate.value)
	// console.log('导入作业指令', importDate.value)
}
watch(
	() => instructDrawerVisible.value,
	newV => {
		if (newV) {
			init()
		}
	},
	{ deep: true }
)
const init = async () => {
	// nextTick(() => {
	// console.log('表格ref', baseTableRef.value)
	// 清空查询条件
	// baseTableRef.value.resetSearch()
	// }, 1000)
	console.log(props.trustType, 'props.trustType')

  await publicApi.getNowDate().then(res => {
    nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {
        // beginDate: res.data.workDate.slice(0, -2).concat('01'),
        // endDate: res.data.workDate,
        date: [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate],
      })
      queryParams.value.date = [res.data.workDate.slice(0, -2).concat('01'), res.data.workDate]


      /*getList(queryParams.value)*/
    })
  })


	if (props.trustType) {
		if (instructDrawerVisible.value) {
      if(props.trustType == '2'){
        proxy.$bus.emit('setInitSearchData', {isClear : '0' })
        queryParams.value.isClear = '0'
      }
			getList(queryParams.value)
		}
	} else {
		return proxy.$message.warning('参数trustType未传！')
	}
}
// 选中回调 只可选中一条
const checkboxChangeEvent = data => {
	// 不需要 开启多选时备注下面代码就可以
	// if (data.length >= 1) {
	// 	tableData.value.forEach(item => {
	// 		if (data[0].id == item.id) {
	// 			item.isDisable = false
	// 		} else {
	// 			item.isDisable = true
	// 		}
	// 	})
	// } else {
	// 	// 取消选中 解除所有选中框禁用
	// 	tableData.value.forEach(item => {
	// 		item.isDisable = false
	// 	})
	// }
	// 结束
}
const getList = e => {
	if (props.trustType == '1' && (!formData.value.workDate || !formData.value.classCode)) {
		proxy.$message.warning('请填写完整查询条件！')
		return
	}

	queryParams.value = e
	queryParams.value.trustType = props.trustType
	console.log('指令查询', queryParams.value)
  queryParams.value.beginDate = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
  //delete queryParams.value.date
	publicApi.getPopupTrust(queryParams.value).then(res => {
		tableData.value = res.data
	})
}

init()
defineExpose({
	importDate,
	value,
	instructDrawerVisible,
	formData,
	baseTableRef,
  isHidden
})
</script>

<style scoped>
.title {
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}
</style>
