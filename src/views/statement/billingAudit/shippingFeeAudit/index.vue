<template>
	<!-- 交接清单管理 -->
  <!--  停泊费 2023/11/06 在用-->
	<div class="app-container">
		<BaseTable
			ref="BaseTableRef"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			@handleChange="handleChange"
      :tableHeight="'pageTableHeight'"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
			:total="total"
      :cellDBLClickEvent = "dbClickEvent"
		/>

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="结算" size="80%">
			<drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click=";(drawerVisible = false), (isDisabled = false)">
						{{ isDisabled ? '关闭' : '取消' }}
					</el-button>
					<el-button v-if="!isDisabled" type="primary" @click="save">保存</el-button>
          <el-button  type="primary" @click.stop="exportFee">账单查看</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="shippingFeeAudit">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/statement/shipownerBilling/shippingFee.js'
import drawer from './drawer/index.vue'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import MyMath from '@/utils/math.js'
const { proxy } = getCurrentInstance()

const drawerVisible = ref(false) //新增修改抽屉
const isDisabled = ref(false)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	shipStatusCode: '',
  status:'10',
})

const selectData = reactive([
	{
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
	},	{
		name: '航次',
		type: 'input', //远程下拉框
		modelValue: 'voyage', //对应字段
		span: 8,
	},
  {
    name: '船代',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'customerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_ALL',
  },
	{
		name: '船舶状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'isLeavePort', // 绑定字段
		span: 3, // 占位，共24
    selectData: [
      {
        value: '0',
        label: '未离港',
      },
      {
        value: '1',
        label: '已离港',
      },
    ],
	},
	{
		name: '结算状态', // 搜索框name
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 3, // 占位，共24
		selectData: [
			{
				value: '00',
				label: '未结算',
			},
			{
				value: '10',
				label: '已结算',
			},
			{
				value: '20',
				label: '已审核',
			},
      {
        value: '40',
        label: '部分开票',
      },
      {
        value: '50',
        label: '已开票',
      },
		],
	},
  {
    name: '作业区域',
    type: 'select', //下拉框字典
    modelValue: 'workAreaCd', //对应字段
    span: 3,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      url: '/api/internal/public/getDictListByType/WORK_AREA',
      method: 'get',
    },
  },
  {
    name: '是否中作业区',
    type: 'select', //下拉框字典
    modelValue: 'isCentre', //对应字段
    span: 3,
    selectData: [
      {label: '是',value: '1'},
      {label: '否',value: '0'}
    ]
  },
	{
		name: '离港时间起始', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'beginLeavePortTime', //绑定字段
		span: 3, //占位多少，总共24
	},
	{
		name: '离港时间截至', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'endLeavePortTime', //绑定字段
		span: 3, //占位多少，总共24
	},
  {
    name: '作业公司',
    type: 'select', //下拉框，字典
    modelValue: 'companyId', //对应字段
    span: 3,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
])
const buttonList = reactive([
	/*{
		label: '结算', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Money', // 按钮图标，支持element-Plus中所有图标
		click: () => cost, // 回调函数
		permission: 'produce:costStatement:cost', // 权限
	},
	{
		label: '撤销结算', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeCost, // 回调函数
		permission: 'produce:costStatement:revokeCost', // 权限
	},*/
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => review, // 回调函数
		permission: 'statement:billingAudit:shippingFeeAudit:audit', // 权限
	},
	{
		label: '销审', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeReview, // 回调函数
		permission: 'statement:billingAudit:shippingFeeAudit:quash', // 权限
	},
])
//双击事件
const dbClickEvent = () =>{
  cost()
}

// 交接单 -------------------
const BaseTableRef = ref()
const total = ref(0)
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
	//queryParams.value = e
	buttonList[0].disabled = true
	buttonList[1].disabled = true
	clickRow.value = {}
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '作业公司', prop: 'companyName', width: 190 },
  { label: 'SCN', prop: 'scn', width: 120 },
	{ label: '船名航次', prop: 'shipName', width: 140 },
  { prop: 'workAreaCd', label: '作业区域', width: 100 },
  { prop: 'berthName', label: '泊位', width: 90 },
	{ label: '贸别', prop: 'tradeType', width: 100 ,align: 'center'},
	{ label: '装卸', prop: 'loadUnload', width: 100,align: 'center' },
	{ label: '船代名称', prop: 'customerName', width: 230, },
	{ label: '般舶净重', prop: 'netWeight', width: 120,align:'right' },
	{ label: '靠泊时间', prop: 'berthTime', width: 'time' },
	{ label: '离泊时间', prop: 'leaveBerthTime', width: 'time' },
	{ label: '停泊时间（天）', prop: 'berthDays', width: 'time',align: 'center' },
	{ label: '结算单号', prop: 'statementNo', width: 130 },
	{ label: '结算人', prop: 'createByName', width: 120 },
	{ label: '结算金额', prop: 'amount', width: 120 },
	{ label: '结算时间', prop: 'createTime', isTime: true, width: 160 },
  {
    label: '结算状态',
    prop: 'status',
    align: 'center',
    fixed:'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status == '10' ? 'primary' : row.status == '20' ? 'success' :
              row.status == '40' ? 'success' : row.status == '50' ? 'danger' : 'info',
          },
          {
            // default: () => row.statusLabel,
            default: () => (row.status == '10' ? '已结算' : row.status == '20' ? '已审核' :
              row.status == '40' ? '部分开票' : row.status == '50' ? '已开票' : '未结算'),
          }
        ),
      ]
    },
  },
])
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
	buttonList[0].disabled = false
	buttonList[1].disabled = false
}
// 交接单end ----------------------
const handleChange = res => {}

// 结算
const cost = async () =>    {
	drawerVisible.value = true
	let { data: rateList } = await api.listRate(clickRow.value.id)
	const { data: detail } = await api.getDetail(clickRow.value.shipvoyageItemId)
  const { data: ortherCost } = await api.listOtherCost(clickRow.value.shipvoyageItemId)
  const {data: tingboFee} = await  api.getBerthDys(clickRow.value.shipvoyageItemId)
  const {data : specilDynamicList } = await  api.getSpecialDynamicList(clickRow.value.shipvoyageItemId)
  // 合并数据
  let filterArr = []
  rateList.forEach(item=>{
    if((item.rateItemCode=='MS00260'|| item.rateItemCode== 'MS00261')){
      if(specilDynamicList.length>0&& (specilDynamicList[0].berthDays>0||specilDynamicList[0].berthHours>0)) {
        item.number = (clickRow.value.tradeType=='内贸'&& specilDynamicList[0].berthDays)  ? specilDynamicList[0].berthDays : ((clickRow.value.tradeType=='外贸'&& specilDynamicList[0].berthHours)?specilDynamicList[0].berthHours:0 )
        item.number2 = specilDynamicList[0].netWeight
        item.unitCode = item.measurementUnitCode1
        item.unitName = item.measurementUnitName1
        item.amount = Math.ceil(MyMath.numMulti(MyMath.numMulti(item.number, item.rate), item.number2 ? item.number2 : 1, 2))
        item.taxAmount = MyMath.numDiv(MyMath.numMulti(item.amount, item.taxRate / 100), 1 + item.taxRate / 100).toFixed(2)
        item.amount = item.amount
        item.taxAmount = item.taxAmount
        filterArr.push(item)
      }
    } else {
      item.number = clickRow.value.berthDays
      item.number2 = clickRow.value.netWeight
      item.unitCode = item.measurementUnitCode1
      item.unitName = item.measurementUnitName1
      item.amount = Math.ceil(MyMath.numMulti(MyMath.numMulti(item.number, item.rate), item.number2 ? item.number2 : 1, 2))
      item.taxAmount = MyMath.numDiv(MyMath.numMulti(item.amount, item.taxRate / 100), 1 + item.taxRate / 100).toFixed(2)
      filterArr.push(item)
    }
  })
  if (detail && detail.length >= 1) {
    rateList.forEach((item, index) => {
      detail.forEach(items => {
        if (item.rateItemCode == items.rateItemCode) {
          filterArr[index].number = items.number
          filterArr[index].number2 = items.number2
          filterArr[index].rate = items.rate
          filterArr[index].taxAmount = items.taxAmount
          filterArr[index].amount = items.amount
        }
      })
    })
  }
  nextTick(() => {
		isDisabled.value = false
		drawerRef.value.resetForm()
		drawerRef.value.init(clickRow.value)
		drawerRef.value.formData = {
			...clickRow.value,
      otherDetails:ortherCost,
			details: filterArr,
			shipAgentName: clickRow.value.customerName,
			companyId: clickRow.value.companyId,
			/*			companyName: detail && detail.length >= 1 ? detail[0].companyName : '',
			customerId: detail && detail.length >= 1 ? detail[0].customerId : '',
			customerName: detail && detail.length >= 1 ? detail[0].customerName : '',*/
			companyName: clickRow.value.companyName,
			customerId: clickRow.value.customerId,
			customerName: clickRow.value.customerName,
		}
    drawerRef.value.formData.berthDays =tingboFee

  })
}
// 撤销结算
const revokeCost = () => {
	proxy.$modal.confirm('是否确定撤销结算？').then(() => {
		api.cancelStatement(clickRow.value.shipvoyageItemId).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
const exportFee = () => {
  if(clickRow.value.shipStatusCode != '120'){
    proxy.$modal.msgError('船舶未离港,不能导出')
    return
  }

  if(clickRow.value.status =='00' || clickRow.value.status =='10'){
    proxy.$modal.msgError('未审核不能导出账单')
    return
  }
  proxy.$modal.confirm('是否确定导出？').then(() => {
    api.exportFee(clickRow.value.id,clickRow.value.shipvoyageItemId).then(res => {
     downLoadBlob(res,'停泊费')
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
// 审核
const review = () => {
	proxy.$modal.confirm('是否确定审核？').then(() => {
		api.review(clickRow.value.shipvoyageItemId).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('审核成功')
		})
	})
}
// 撤销审核
const revokeReview = () => {
	proxy.$modal.confirm('是否确定撤销审核？').then(() => {
		api.cancelReview(clickRow.value.shipvoyageItemId).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
// 结算保存
const save = async () => {
	if (await drawerRef.value.validate()) {
		const params = drawerRef.value.formData.details.map(item => {
			const obj = {
				...item,
				type: 10,
				shipvoyageId: drawerRef.value.formData.id,
				shipvoyageItemId: drawerRef.value.formData.shipvoyageItemId,
				companyId: drawerRef.value.formData.companyId,
				companyName: drawerRef.value.formData.companyName,
				customerId: drawerRef.value.formData.customerId,
				customerName: drawerRef.value.formData.customerName,
			}
			return obj
		})
		proxy.$modal.confirm('确定保存？').then(() => {
			api.statement(params).then(res => {
				if (res.code === '0000') {
					proxy.$modal.msgSuccess('结算成功')
					drawerVisible.value = false
					isDisabled.value = false
					getList(queryParams.value)
				}
			})
		})
	}
}

/** 初始化数据 */
//初始化函数
const init = async () => {
	await nextTick(() => {
		// proxy.$bus.emit('setInitSearchData', { isLeavePort: '1' })
		// proxy.$bus.emit('setInitSearchData', { status: '10' })
     BaseTableRef.value.SearchHeaderRef.searchData.isLeavePort = '1'
    BaseTableRef.value.SearchHeaderRef.searchData.status = '10'
	})
   queryParams.value.isLeavePort = '1'
  queryParams.value.status = '10'
	getList(queryParams.value)
}
init()
</script>
<style lang="less" scoped>
.app-container {
	height: auto !important;
}
</style>
