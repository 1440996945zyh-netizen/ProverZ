<template>
	<!-- 交接清单管理 -->
<!--  船方水电 2023/11/17 在用-->
	<div class="app-container">
		<BaseTable
			ref="BaseTableRef"
			:showSearchHeader="true"
			:searchClick="getList"
			:tableColumns="tableColumns"
			@handleChange="handleChange"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
			:total="total"
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
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="waterAndElectricityFees">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/statement/shipownerBilling/waterAndElectricityFees.js'
import drawer from './drawer/index.vue'
import math from '@/utils/math.js'
import { ref, reactive, toRefs } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()

const drawerVisible = ref(false) //新增修改抽屉
const isDisabled = ref(false)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})

const selectData = reactive([
	{
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
	},
  {
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
    span: 4, // 占位，共24
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
		modelValue: 'statementStatus', // 绑定字段
		span: 4, // 占位，共24
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
    name: '离港时间起始', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'beginLeavePortTime', //绑定字段
    span: 4, //占位多少，总共24
  },
  {
    name: '离港时间截至', //日期搜索
    type: 'date', //搜索框类型
    modelValue: 'endLeavePortTime', //绑定字段
    span: 4, //占位多少，总共24
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
    name: '作业公司',
    type: 'select', //下拉框，字典
    modelValue: 'companyId', //对应字段
    span: 3,
    dataConfig: { params: { type: 'DEPT_WORK_COMPANY' } },
  },
])
const buttonList = reactive([
	{
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
		permission: 'produce:costStatement:cost', // 权限
	},
	{
		label: '审核', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => review, // 回调函数
		permission: 'produce:costStatement:cost', // 权限
	},
	{
		label: '销审', // 按钮名称
		type: 'primary', // 按钮类型
		disabled: true,
		icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
		click: () => revokeReview, // 回调函数
		permission: 'produce:costStatement:cost', // 权限
	},
])

// 交接单 -------------------
const BaseTableRef = ref()
const total = ref(0)
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
	buttonList[0].disabled = true
	buttonList[1].disabled = true
	buttonList[2].disabled = true
	buttonList[3].disabled = true
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
  { label: '作业公司', prop: 'companyName', width:204 ,    align: 'center'},
	{ label: '客户', prop: 'customerName', width: 160 ,    align: 'center'},
	{ label: '作业过程', prop: 'processName', width: 130,    align: 'left' },
	{ label: '船名航次', prop: 'shipNameVoyage', width: 130 ,    align: 'left'},
	{ label: '泊位', prop: 'berthName', width: 90 ,    align: 'left'},
	{ label: '船代', prop: 'shipCustomerName', width: 280,    align: 'left' },
  { label: '作业区域', prop: 'workAreaCd',  width: 110,    align: 'left' },
	{ label: '泊位', prop: 'berthName', width: 90,    align: 'left'},
	{ label: '贸别', prop: 'tradeType', width: 90,    align: 'center' },
	{ label: '般舶净重', prop: 'netWeight', width: 110,    align: 'right',isThousandth:'true'},
	{ label: '靠泊时间', prop: 'berthTime', width: 'time',    align: 'center' },
	{ label: '离泊时间', prop: 'leaveBerthTime', width: 'time',    align: 'center' },
	{ label: '结算单号', prop: 'statementNo', width: 150,    align: 'center' },
	{ label: '结算人', prop: 'createByName', width: 130,    align: 'center' },
	{ label: '结算时间', prop: 'createTime', width: 'time',    align: 'center' },
	{
		label: '作业状态',
		prop: 'statusLabel',
    fixed:'right',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '10' ? 'success' : 'info',
					},
					{
						default: () => row.statusLabel,
					}
				),
			]
		},
	},
	{
		label: '结算状态',
		prop: 'statementStatus',
		align: 'center',
    fixed:'right',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.statementStatus == '10' ? 'primary' : row.statementStatus == '20' ? 'success' :
              row.statementStatus == '40' ? 'success' : row.statementStatus == '50' ? 'danger' : 'info',
					},
					{
						default: () => (row.statementStatus == '10' ? '已结算' : row.statementStatus == '20' ? '已审核' :
              row.statementStatus == '40' ? '部分开票' : row.statementStatus == '50' ? '已开票' : '未结算'),
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
	buttonList[2].disabled = false
	buttonList[3].disabled = false
}
// 交接单end ----------------------
const handleChange = res => {}

// 结算
const cost = async () => {
	drawerVisible.value = true
	// 费率信息
	const { data: rateList } = await api.listRate(clickRow.value.id)
	// 历史记录信息
	const { data: waterElectricityList } = await api.listWaterElectricity(clickRow.value.id)
	// 结算单详情
	const { data: detail } = await api.getDetail(clickRow.value.id)

	let filterArr = []
	// 判断是否存在结算数据
	if (detail && detail.length >= 1) {
		filterArr = detail
	} else {
		// 如果不存在结算数据 前端根据过程生成费用数据
    if (waterElectricityList.length) {
      filterArr = rateList.filter(items => {
        if (waterElectricityList.map(v1=>v1.processCode).includes(items.processCode)) {
          return items
        }
      }).map(v1=>{
        let obj = {
          rateId: v1.rateId,
          shipvoyageId: waterElectricityList[0].shipvoyageId,
          shipvoyageItemId: clickRow.value.shipvoyageItemId,
          rateItemName: v1.rateItemName,
          rateItemCode: v1.rateItemCode,
          processName: v1.processName,
          //number: waterElectricityList.map(v2=>v2.quantity).reduce((sum, x) => sum + x),
          number: waterElectricityList.map(v2=>v2.quantity).reduce((sum, x) => math.numAdd(sum, x)),
          rate: v1.rate,
          unitName: v1.measurementUnitName1,
          unitCode: v1.measurementUnitCode1,
          taxRate: v1.taxRate,
          amount: waterElectricityList.map(v2=>v2.quantity).reduce((sum, x) => math.numAdd(sum, x)) == null ? 0:Math.round((math.numMulti(waterElectricityList.map(v2=>v2.quantity).reduce((sum, x) => math.numAdd(sum, x)), v1.rate))*100)/100,
          //amount: (waterElectricityList.map(v2=>v2.quantity).reduce((sum, x) => math.numAdd(sum, x)) * v1.rate).toFixed(2),
          taxAmount: 0,
          remark: '',
        }

        //obj.taxAmount = ((obj.amount * (obj.taxRate / 100)) / (1 + obj.taxRate / 100)).toFixed(2)
        obj.taxAmount = Math.round((math.numDiv(math.numMulti(obj.amount, math.numDiv(obj.taxRate, 100)),
          math.numAdd(1, math.numDiv(obj.taxRate, 100))))*100)/100
        return obj
      })
    }
		// if (filterArr && filterArr.length >= 1) {
		// 	// 模拟手续费数据
		// 	const endObj = rateList.filter(item => {
		// 		item.shipvoyageId = clickRow.value.shipvoyageId
		// 		if (item.rateItemName == `${filterArr[0].processName}手续费`) {
		// 			item.unitName = item.measurementUnitName1
		// 			item.unitCode = item.measurementUnitCode1
		// 			item.number = filterArr.length
		// 			item.rateId = item.id
		// 			item.amount = (item.number * item.rate).toFixed(2)
		// 			item.taxAmount = ((item.amount * (item.taxRate / 100)) / (1 + item.taxRate / 100)).toFixed(2)
    //
		// 			return item
		// 		}
		// 	})[0]
		// 	filterArr.push(endObj)
		// }
	}
	nextTick(() => {
		isDisabled.value = false
		drawerRef.value.resetForm()
		drawerRef.value.init(clickRow.value)
		drawerRef.value.formData = {
			...clickRow.value,
			details: filterArr,
			waterElectricityList,
			companyId: detail && detail.length >= 1 ? detail[0].companyId : '',
			companyName: detail && detail.length >= 1 ? detail[0].companyName : '',
			customerId: detail && detail.length >= 1 ? detail[0].customerId : '',
			customerName: detail && detail.length >= 1 ? detail[0].customerName : '',
		}
	})
}
// 撤销结算
const revokeCost = () => {
	proxy.$modal.confirm('是否确定撤销结算？').then(() => {
		api.cancelStatement(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}
// 审核
const review = () => {
	proxy.$modal.confirm('是否确定审核？').then(() => {
		api.review(clickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('审核成功')
		})
	})
}
// 撤销审核
const revokeReview = () => {
	proxy.$modal.confirm('是否确定撤销审核？').then(() => {
		api.cancelReview(clickRow.value.id).then(res => {
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
				type: 20,
				trustId: drawerRef.value.formData.id,
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
	  //shipStatusCode: '110',
		//proxy.$bus.emit('setInitSearchData', { status: '50' })
		//queryParams.value.shipStatusCode = '110'
		queryParams.value.statementStatus = '00'
    BaseTableRef.value.SearchHeaderRef.searchData.statementStatus = '00'
	})
	getList(queryParams.value)
}
init()
</script>
<style lang="less" scoped>
.app-container {
	height: auto !important;
}
</style>
