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

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="invoiceAddDrawer" :title="title" size="70%">
			<editTrustOrder ref="invoiceAddRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="invoiceAddDrawer = false">取消</el-button>
<!--          <el-button  v-if='!editOrAdd' type='primary' @click.stop='updateInvoiceCode'>更新税务服务发票</el-button>-->
          <el-button v-if='editOrAdd' type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</el-drawer>
    <el-dialog
      v-model="centerDialogVisible"
      title="红冲申请"
      width="500"
      align-center
    >
      <label>红冲原因：</label><el-input v-model="voidReason" style="width: 240px" placeholder="红冲原因" clearable>Open the dialog from the center from the screen</el-input>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="redApply">确认</el-button>
        </div>
      </template>
    </el-dialog>
	</div>
</template>

<script setup name="invoice">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted } from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/finance/invoice/index'
const { proxy } = getCurrentInstance()
const baseTable = ref() // table的ref
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const centerDialogVisible = ref(false)
const voidReason = ref(null)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
  startTime:null,
  endTime:null,
})
const invoiceAddRef = ref(null)
const editOrAdd =ref(false) // 是否显示保存按钮
//发票新增
const invoiceAddDrawer = ref(false)
const title = ref('新增作业指令')
//顶部 搜索表单
const selectData = reactive([
  {
    name: '公司名称',
    type: 'select',
    modelValue: 'companyId',
    span: 8,
    dataConfig: { params: {type: 'DEPT_WORK_COMPANY'} },
  },
  {
    name: '客户名称',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
  {
    name: '发票编号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'sysInvoiceCode', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '开票日期', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'invoiceTime', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    // name: '起止日期',
    type: 'daterange',
    clearable: false,
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
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 3,
    dataType: 'VOYAGE',
  },
  {
    name: '状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 3, // 占位，共24
    selectData: [
      { label: '正常', value: '1' },
      { label: '作废', value: '2' },
    ],
  },
  {
    name: '发票类型',
    type: 'select',//远程下拉框
    modelValue: 'invoiceTypeCode',//对应字段
    span: 3,
    selectData: [
      { label: '货物发票', value: '10' },
      { label: '船舶发票', value: '30' },
      { label: '杂项发票', value: '40' },
      { label: '堆存费', value: '50' },
    ],
  },
  {
    name: '创建人', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'createByName', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '是否做付款收据', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'isSj', // 绑定字段
    span: 3, // 占位，共24
    selectData: [
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ],
  },
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
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addTrustOrder, // 回调函数
		permission: 'finance:invoice:add', // 权限
	},
	// {
	// 	label: '查看发票', // 按钮名称
	// 	type: 'primary', // 按钮类型
	// 	icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
	// 	click: () => invoiceDownload, // 回调函数
	// 	permission: 'finance:invoice:add', // 权限
	// },
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '发票编号', prop: 'sysInvoiceCode',width:110 },
	{ label: '发票类型', prop: 'invoiceTypeName',width:100 },
	{ label: '作业公司', prop: 'companyName',width:190,align: 'center', },
	{ label: '客户名称', prop: 'customerName',width:220,align: 'center', },
	{ label: '船名航次', prop: 'shipNameVoyage',width:115 },
	{ label: '金额', prop: 'invoiceAmount',align:'right', isThousandth: 'true',width:80 },
	{ label: '开票日期', prop: 'invoiceTime' ,width:100},
	{ label: '创建人', prop: 'createByName',width:110 },
	{ label: '创建时间', prop: 'createTime',width:150 },
	{ label: '未作付款收据金额', prop: 'hasNotReceiptAmount',align:'right', isThousandth: 'true',width:80 },
  {
    label: '发票状态',
    prop: 'status',
    align: 'center',
    width:100,
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '1' ? 'success' : 'info',
          },
          {
            default: () => (row.status == '1' ? '正常' : '作废'),
          }
        ),
      ]
    },
  },
  {
    label: '是否做付款收据',
    prop: 'isDebtorpayment',
    align: 'center',
    width:100,
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isDebtorpayment == '1' ? 'success' : 'info',
          },
          {
            default: () => (row.isDebtorpayment == '1' ? '是' : '否')
          }
        )
      ]
    }
  },
  {
    label: '红冲状态',
    prop: 'redStatus',
    align: 'center',
    width:100,
    fixed:'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.redStatus == '40' ? 'success' : row.redStatus == '10'?'info':'warning',
          },
          {
            default: () => (row.redStatus == '10' ? '待申请' : row.redStatus == '20'?'待销方确认':row.redStatus == '30'?"待乐企确认":row.redStatus == '40'?"可红冲":row.redStatus == '-10'?"红冲申请作废":"已红冲"),
          }
        ),
      ]
    },
  },
	{ label: '开票日期', prop: 'invoiceTime' ,width:100},
	{ label: '创建人', prop: 'createByName',width:110 },
	{ label: '创建时间', prop: 'createTime',width:150 },
	{
		prop: '',
		label: '操作',
		width: 300,
		align: 'center',
    fixed:'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
              redApplyShow(row)
						},
            type: 'warning',
						link: true,
						icon: 'Position',
						permission: 'finance:invoice:check', // 权限
					},
          {
            default: () => (row.redStatus == '10' ? '申请' : row.redStatus == '20'?'销方确认':row.redStatus == '30'?"乐企确认":row.redStatus == '40'?"红冲撤销":row.redStatus == '-10'?"重新申请":"已红冲"),
          }
				),
				h(
					ElButton,
					{
						onClick: () => {
							check(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'finance:invoice:check', // 权限
					},
					{
						default: () => '查看',
					}
				),
				h(
					ElButton,
					{
						onClick: () => {
							handle(row)
						},
						type: 'danger',
						link: true,
						icon: 'Delete',
						permission: 'finance:invoice:handle', // 权限
					},
					{
						default: () => '作废',
					}
				)
			]
		},
	},
])
//查询
const getList = async e => {
  Object.assign(queryParams.value,e)
  if(e.date !=undefined && e.date.length>0){
    e.startTime = e.date[0]
    e.endTime = e.date[1]
  }else{
    e.startTime = null
    e.endTime = null
  }
	await api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
     api.getCountAmount(queryParams.value).then(res => {
        collectHtml.value = `<p > 总金额：${res.data.countAmount}</p>`
        // loading.value = false
     })
  })
}
//新增作业指令抽屉
const addTrustOrder = () => {
	invoiceAddDrawer.value = true
	title.value = '新增发票信息'
	editOrAdd.value = true //保存按钮显示
	nextTick(() => {
		invoiceAddRef.value.resetForm()
    invoiceAddRef.value.trustOrderForm.symbol = 0
    invoiceAddRef.value.editOrAdd1=true //添加按钮显示
    invoiceAddRef.value.trustOrderForm.companyId = "1677242790846795776";
    invoiceAddRef.value.trustOrderForm.companyName = "潍坊港区散货码头有限公司";
    invoiceAddRef.value.editOrAdd2 = false;
	  proxy.$bus.emit('resetFileList')
    invoiceAddRef.value.trustOrderForm.invoiceTime = new Date()
	})
}
//提交作业指令信息
const save = async () => {
	if (await invoiceAddRef.value.validate()) {
      // if(sumAmount>100000){
      //    proxy.$message.warning('单张普票最大金额为10万元，超过10万元请开多张发票！')
      // }
		proxy.$modal.confirm('确定保存？').then(() => {
			const params = {
				...invoiceAddRef.value.trustOrderForm,
			}
			if (
				invoiceAddRef.value.trustOrderForm.id === undefined ||
				invoiceAddRef.value.trustOrderForm.id === null ||
				invoiceAddRef.value.trustOrderForm.id === ''
			) {
				api.add(params).then(res => {
					if (res.code === '0000') {
						proxy.$modal.msgSuccess('新增成功')
						invoiceAddDrawer.value = false
						getList(queryParams.value)
						editOrAdd.value = false
             invoiceAddRef.value.editOrAdd1=false
					}
				})
			}
		})
	}
}
//
const handle = row => {
  console.log(row)
  if(row.status==2){
    proxy.$message.error("已作废！！")
    return
  }
	proxy.$modal.confirm('确定作废吗？').then(() => {
		api.voidInvoice(row.id).then(res => {
			if (res.code === '0000') {
				proxy.$modal.msgSuccess('作废成功')
				getList(queryParams.value)
			}
		})
	})
}
const check = row => {
	title.value = '查看发票信息'
	invoiceAddDrawer.value = true
	editOrAdd.value = false
	nextTick(() => {
		invoiceAddRef.value.resetForm()
		api.getDetail(row.id).then(res => {
			if (res.code === '0000') {
        invoiceAddRef.value.trustOrderForm.id = row.id
        invoiceAddRef.value.trustOrderForm.status = res.data.status
        invoiceAddRef.value.trustOrderForm.symbol = 1
        invoiceAddRef.value.trustOrderForm.companyId = res.data.companyId
        invoiceAddRef.value.trustOrderForm.companyName = res.data.companyName
        invoiceAddRef.value.trustOrderForm.customerId = res.data.customerId
        invoiceAddRef.value.trustOrderForm.customerName = res.data.customerName
        invoiceAddRef.value.trustOrderForm.invoiceAmount = res.data.invoiceAmount
        invoiceAddRef.value.trustOrderForm.invoice = res.data.invoice
        invoiceAddRef.value.trustOrderForm.invoiceCode = res.data.invoiceCode
        invoiceAddRef.value.trustOrderForm.invoiceTypeCode = res.data.invoiceTypeCode
        invoiceAddRef.value.trustOrderForm.invoiceTypeName = res.data.invoiceTypeName
        invoiceAddRef.value.trustOrderForm.sysInvoiceCode = res.data.sysInvoiceCode
        invoiceAddRef.value.trustOrderForm.taxationInvoice = res.data.taxationInvoice
        invoiceAddRef.value.trustOrderForm.invoiceTime = res.data.invoiceTime
        invoiceAddRef.value.trustOrderForm.taxationInvoiceCode = res.data.taxationInvoiceCode
        invoiceAddRef.value.trustOrderForm.remark = res.data.remark
        invoiceAddRef.value.trustOrderForm.statementList = res.data.statementList
        invoiceAddRef.value.trustOrderForm.statementList.forEach(item=>{
          item.flag=1
          item.dis = true
        })
			}
		})
	  invoiceAddRef.value.editOrAdd1=false //添加按钮不显示
    invoiceAddRef.value.editOrAdd2 = true;//禁止输入
	})

}

/**
 * 红冲申请
 * @param row
 */
const clickRow = ref(null)
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}

const redApplyShow = row => {
  clickRow.value = row
  if("10"==clickRow.value.redStatus){
    // centerDialogVisible.value = true
    proxy.$modal.confirm('确认发起红冲申请？').then(() => {
      redApply()
    })
  }else if("20"==clickRow.value.redStatus){
    proxy.$modal.confirm('红冲确认？').then(() => {
      api.redApply({id:clickRow.value.id,redStatus:clickRow.value.redStatus,voidReason:""}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('操作成功')
        }
      })
    })
  }else if("30"==clickRow.value.redStatus){
    proxy.$modal.confirm('重新获取红冲状态!').then(() => {
      api.redApply({id:clickRow.value.id,redStatus:clickRow.value.redStatus,voidReason:""}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('操作成功')
          getList(queryParams.value);
        }
      })
    })
  }else if("40"==clickRow.value.redStatus){
    proxy.$modal.confirm('确定撤销红冲申请？').then(() => {
      api.redApply({id:clickRow.value.id,redStatus:clickRow.value.redStatus,voidReason:""}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('操作成功')
          getList(queryParams.value);
        }
      })
    })
  }else if("-10"==clickRow.value.redStatus){
    proxy.$modal.confirm('确定重新红冲申请？').then(() => {
      api.redApply({id:clickRow.value.id,redStatus:10,voidReason:""}).then(res => {
        if (res.code === '0000') {
          proxy.$modal.msgSuccess('操作成功')
          getList(queryParams.value);
        }
      })
    })
  }
}
const redApply = row => {
	nextTick(() => {
		api.redApply({id:clickRow.value.id,redStatus:clickRow.value.redStatus,voidReason:voidReason.value}).then(res => {
			if (res.code === '0000') {
        getList(queryParams.value);
			}
		})

	})
  centerDialogVisible.value = false

}
//发票下载
import { saveAs as FileSaver } from 'file-saver'
const invoiceDownload = () => {
  if(clickRow.value == null || clickRow.value =='' || clickRow.value ==undefined){
    proxy.$message.error("请选中要查看的发票！！")
  }
  api.invoiceDownload({id:clickRow.value.id}).then(async res=>{
    // 创建一个隐藏的a标签
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = res.data;
    // 如果知道文件名，可以明确设置下载属性
    // 但由于我们是批量下载，且URL可能包含文件名，所以这里不设置
    // a.download = 'filename.ext';
    // 将a标签添加到DOM中
    document.body.appendChild(a);
    // 触发点击事件
    a.click();
    // 下载完成后移除a标签
    document.body.removeChild(a);
  })
}
//更新税务服务发票编号
const updateInvoiceCode = async ()=>{
  const params = {
    id: invoiceAddRef.value.trustOrderForm.id,
    invoiceCode: invoiceAddRef.value.trustOrderForm.invoiceCode,
  }
  if(  params.invoiceCode == ''){
    return
  }
  api.updateInvoiceCode(params)
    .then(res=>{
      proxy.$modal.msgSuccess(res.msg)
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
