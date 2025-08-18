<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
      :tableHeight="'pageTableHeight'"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:total="total"
      :showNum = '2'
		/>
		<!--    :checkbox-config="checkboxConfig"-->
		<!--    :selectAllChangeEvent="checkboxAllEvent"-->
		<!--    @checkbox-change="checkboxChangeEvent"-->
		<el-drawer v-model="pieceworkVisible" :title="title" size="35%">
			<template #footer>
				<div style="flex: auto">
					<el-button @click="pieceworkVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
    <!-- 日志 -->
    <el-dialog v-model="cleanVisible" title="审核日志" size="80%">
      <!--<el-form>
        <el-input type="textarea" v-model="examineLog" disabled></el-input>
      </el-form>-->
      <p class = "breakAll" v-html="examineLog"></p>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cleanVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
	</div>
</template>

<script setup name="produceAudit">
import BaseTable from '@/components/BaseTable/index.vue'
import { getCurrentInstance, h, nextTick, reactive, ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/produce/produceAudit/index.js'
import publicApi from '@/api/public/index' //字典
import { getNowDate } from '@/utils'

const { proxy } = getCurrentInstance() // 相当于vue2里的this
const title = ref(null)
const baseTable = ref() // table的ref
const pieceworkVisible = ref(false)
const cleanVisible = ref(false)
const isDisabled = ref(false)
const pieceworkListRef = ref() //表格ref
const detailRef = ref(null) // 明细组件ref
const total = ref(0) // 数据总数
const emit = defineEmits(['editEmit'])
const tableData = ref([])
const salaryStatus = reactive([])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const examineLog = ref('')
const initData = async() => {
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	await publicApi.getDictList({ types: 'SALARY_STATUS' }).then(res => {
		salaryStatus.push(...res.data.SALARY_STATUS)
		// 给编辑table下拉框设置数据源
		// proxy.setEditTableOptions(selectData, { month: "2023-09" })
		/*let month = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1
		let date = new Date().getFullYear() + '-' + month
		nextTick(() => {
			proxy.$bus.emit('setInitSearchData', {
				month: date,
			})
		})*/
	})
  // 获取登录用户信息
  await publicApi.getLoginDeptMess().then(async res => {
    console.log(res)
    if (res.data.level == '4'||res.data.level == '2') {
      /*await publicApi.getLocalSelect({ type: 'DEPT_LEVEL', deptLevel: '4', parentDeptId: res.data.companyId }).then(ress => {
        proxy.setEditTableOptions(selectData, { deptId: ress.data })
      })*/
      isDisabled.value = true
      nextTick(() => {
        proxy.$bus.emit('setInitSearchData',
          {
            deptId:res.data.companyDeptId,
            deptName:res.data.classDeptName
          }
        )
        queryParams.value.deptId = res.data.companyDeptId;
        queryParams.value.deptName = res.data.classDeptName;
      })
    }
  })
}
const selectData = reactive([
	{
		name: '部门',
		type: 'select',
		prop: 'deptId', // 便于赋值
		modelValue: 'deptId',
		modelLabel: 'deptName',
		span: 8,
    disabled:isDisabled,
		dataConfig: {
			params: { type: 'DEPT_LEVEL', deptLevel: '2' },
			method: 'get',
		},
	},
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
  {
    name: '班次',
    type: 'select',
    modelValue: 'classCode',
    span: 3,
    dataConfig: { params: { type: 'DICT', dictType: 'WORK_SCHEDULE' } },
  },
  {
    name: '作业公司',
    type: 'select',
    modelValue: 'companyId',
    modelLabel: 'companyName',
    span: 3,
    dataConfig: {
      params: { type: 'DEPT_LEVEL', deptLevel: '1' },
      method: 'get',
    },
    change: row => {
      console.log(row, 'rorrroororooror')
      publicApi.getLocalSelect({ type: 'DEPT_LEVEL', deptLevel: '4', parentDeptId: row.value }).then(res => {
        console.log(res, 'resssssssssss')
        proxy.setEditTableOptions(selectData, { deptId: res.data })
      })
    },
  },
  {
    name: '包装',
    type: 'select',
    modelValue: 'salaryTypeCode',
    modelLabel: 'salaryTypeName',
    span: 3,
    dataConfig: {
      url: '/api/internal/public/getDictList?types=SALARY_TYPE',
      dictType: 'SALARY_TYPE',
    },
  },

	{
		name: '审核状态',
		type: 'select',
		modelValue: 'salaryStatusCode',
		span: 3,
		selectData: salaryStatus,
	},
  {
    name: '是否零工',
    type: 'select',
    modelValue: 'isOdd',
    span: 3,
    selectData: [
      {
        value: '0',
        label: '否',
      },
      {
        value: '1',
        label: '是',
      }
    ]
  },
])
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  queryParams.value.startDate = queryParams.value.date ? queryParams.value.date[0] : ''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : ''
 /* if (!queryParams.value['month']) {
		let month = new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1
		let date = new Date().getFullYear() + '-' + month
		queryParams.value['month'] = date
	}
	auditItem.value['auditMonth'] = queryParams.value['month']*/
	api.getListSalary(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const getExamineLog = () => {
  auditItem.value.deptId = baseTable.value.SearchHeaderRef.searchData.deptId
  // auditItem.value.auditMonth = baseTable.value.SearchHeaderRef.searchData.month
  auditItem.value.startDate = queryParams.value.startDate
  auditItem.value.endDate = queryParams.value.endDate
  api.getExamineLog(auditItem.value).then(res => {
    console.log(res.data);
    if (res.data) {
      examineLog.value = res.data
      cleanVisible.value = true
      /*proxy.$message({
        dangerouslyUseHTMLString: true,
        message: res.data,
        center: true
      });*/
    } else {
      cleanVisible.value = true
    }
  })
}
const buttonList = reactive([
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Check', // 按钮图标，支持element-Plus中所有图标
		click: () => pass, // 回调函数
		permission: 'master:produceAudit:pass', // 权限
	},
	{
		label: '撤销', // 按钮名称
		type: 'danger', // 按钮类型
		icon: 'Close', // 按钮图标，支持element-Plus中所有图标
		click: () => quash, // 回调函数
		permission: 'master:produceAudit:quash', // 权限
	},
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'master:produceAudit:export', // 权限
  },
  {
    label: '查看日志', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Check', // 按钮图标，支持element-Plus中所有图标
    click: () => getExamineLog, // 回调函数
    permission: 'master:produceAudit:examineLog', // 权限
  },
])
// 表格表头参数
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  // { prop: 'check', label: '', type: 'checkbox' ,width: 50},
	{
		prop: 'shipVoyage',
		label: '船名航次',
    align: 'center',
    width: 120,
	},
  {
    prop: 'companyName',
    label: '作业公司',
    align: 'center',
    width: 200,
  },
	{
		prop: 'deptName',
		label: '部门',
    align: 'center',
    width: 100,
	},
	{
		prop: 'workDate',
		label: '作业日期',
		align: 'center',
		width: 100,
	},
	{
		prop: 'className',
		label: '班次',
		align: 'center',
		width: 90,
	},
  {
    prop: 'cargoName',
    label: '货名',
    align: 'center',
    width: 180,
  },
  {
    prop: 'salaryTypeName',
    label: '包装',
    align: 'center',
    width: 100,
  },
	/*{
		prop: 'pieceProjectName',
		label: '计件工资项目',
	},*/
	{
		prop: 'processDetailName',
		label: '子过程',
    align: 'center',
    width: 150,
	},
  {
    prop: 'processName',
    label: '主过程',
    align: 'center',
    width: 150,
  },
  {
    prop: 'workContent',
    label: '零工内容',
    align: 'center',
    width: 250,
  },
  {
    prop: 'oddPlanNo',
    label: '零工编号',
    align: 'center',
    width: 110,
  },
	{
		prop: 'userByName',
		label: '人员',
    align: 'center',
    width: 80,
	},
	{
		prop: 'coefficient',
		label: '分配系数',
		align: 'right',
    width: 100,
	},
	{
		prop: 'quantity',
		label: '件数',
		align: 'right',
    width: 100,
	},
	{
		prop: 'ton',
		label: '吨数/时长',
		align: 'right',
    width: 120,
	},
  {
    prop: 'ticketByName',
    label: '签票人',
    align: 'center',
    width: 100,
  },
  {
    prop: 'ticketTime',
    label: '签票时间',
    align: 'center',
    width: 150,
  },
  {
    prop: 'examineByName',
    label: '审核人',
    align: 'center',
    width: 100,
  },
  {
    prop: 'examineTime',
    label: '审核时间',
    align: 'center',
    width: 150,
  },
	{
		prop: 'remark',
		label: '备注',
    align: 'center',
    width: 200,
	},
  {
    label: '状态',
    prop: 'salaryStatusCode',
    width: 100,
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.salaryStatusCode == 10 ? 'info' : row.salaryStatusCode == 20 ? 'success' : row.salaryStatusCode == 30 ? 'primary' : 'info',
          },
          {
            default: () => row.salaryStatusName,
          }
        ),
      ]
    },
  },
])
// 定义点击行数据
const clickRow = ref({})
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

/**
 * @param ids 审核ID
 * @param flag 0:审核 1:取消审核
 * @param isHr Y:是 N:否
 */
const auditItem = ref({
	// ids:[],
	auditMonth: '',
	flag: '',
	isHr: 'N',
  deptId:'',
  classCode:'',
  isOdd:''
})

const pass = () => {
	// let date = queryParams.value['month']
  if(queryParams.value.startDate ==undefined){
    proxy.$modal.msgWarning("请选择开始日期")
    return
  }
  auditItem.value.flag = 0
  auditItem.value.deptId = baseTable.value.SearchHeaderRef.searchData.deptId
  auditItem.value.startDate = queryParams.value.startDate
  auditItem.value.endDate = queryParams.value.endDate
  auditItem.value.salaryStatusCode = '10'
  auditItem.value.classCode = queryParams.value.classCode
  auditItem.value.isOdd = queryParams.value.isOdd
  auditItem.value.salaryTypeCode = queryParams.value.salaryTypeCode
  auditItem.value.companyId = queryParams.value.companyId
  proxy.$modal.confirm('确定审核' + queryParams.value.startDate + '到' + (queryParams.value.endDate==undefined?getNowDate('YYYY-MM-DD'):queryParams.value.endDate) + '的数据?').then(() => {
	  api.examine(auditItem.value).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess(res.msg)
				getList(queryParams.value)
			}
		})
	})
}
const quash = () => {
	auditItem.value.flag = 1
	//let date = queryParams.value['month']
  auditItem.value.deptId = baseTable.value.SearchHeaderRef.searchData.deptId
  auditItem.value.startDate = queryParams.value.startDate
  auditItem.value.endDate = queryParams.value.endDate
  auditItem.value.salaryStatusCode = '20'
  auditItem.value.classCode = queryParams.value.classCode
  auditItem.value.salaryTypeCode = queryParams.value.salaryTypeCode
  auditItem.value.companyId = queryParams.value.companyId
  auditItem.value.isOdd = queryParams.value.isOdd
  proxy.$modal.confirm('确定销审' + queryParams.value.startDate + '到' + (queryParams.value.endDate==undefined?"当前日期":queryParams.value.endDate) + '的数据?').then(() => {
		api.examine(auditItem.value).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess(res.msg)
				getList(queryParams.value)
			}
		})
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
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '计件作业量')
  })
}
// 编辑事件
const edit = row => {
	// title.value = '编辑'
	// const editRow = row // 拿到所编辑行的数据
	// console.log(editRow, 'eddddeeeeddddd')
	// pieceworkVisible.value = true
	// nextTick(() => {
	// 	detailRef.value.resetForm() // 清空事件
	// 	proxy.setFormData(detailRef.value.formData, row)
	// 	detailRef.value.changeCompany()
	// 	console.log('编辑')
	// })
}
// 删除事件
const handleDelete = row => {
	const deleteRow = row || clickRow.value // 拿到所删除行的数据
	// proxy.$modal
	// 	.confirm('确定删除？')
	// 	.then(function () {
	// 		return api.deletePiecework(deleteRow.id)
	// 	})
	// 	.then(res => {
	// 		getList(queryParams.value)
	// 		proxy.$modal.msgSuccess(res.msg)
	// 	})
	// 	.catch(() => {})
	// console.log('delete', deleteRow)
}

//初始化函数

const init = async () => {
  await initData()
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
<style lang="scss" scoped>
  .breakAll{word-break: break-all;}
  ::v-deep .breakAll {
    height: 50vh;
    overflow: auto;
  }
  ::v-deep .el-dialog {
    height: 70vh;
  }
</style>
