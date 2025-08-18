<template>
	<!-- 交接清单管理 -->
  <!-- 预结算 2023/11/15 在用 -->
  <!--  生产数据确认-->
  <!--  预结算 陆集陆疏-->
	<div class="app-container">
		<BaseTable
			ref="handoverTableRef"
			:showSearchHeader="true"
			:searchClick="getHandoverList"
			:tableColumns="tableColumns"
			@handleChange="handleChange"
			:selectData="selectData"
			:buttonList="buttonList"
			:tableData="tableData"
			:tableHeight="'drawerHeaderPageTableHeight'"
			:cellClickEvent="cellClickEvent"
			:autoResize="true"
			:total="total"
		/>
		<el-collapse v-model="collapseOpen">
			<el-collapse-item title="结算明细" name="1">
				<template v-slot:title>
					<div style="display: flex; justify-content: space-between; width: 95%">
						<div>结算明细</div>
						<div>
							<el-button type="primary" @click.stop="revokeCost" :disabled='revokeCostButton'>
								<el-icon :size="15" style="margin: 2px">
									<Refresh />
								</el-icon>
								撤销结算
							</el-button>
						</div>
					</div>
				</template>
				<BaseTable
					ref="countTableRef"
					:showSearchHeader="false"
					:tableColumns="countTableColumns"
					:tableData="countTable"
					:tableHeight="300"
					:cellClickEvent="countTableEvent"
					:autoResize="true"
				/>
			</el-collapse-item>
		</el-collapse>

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="drawerVisible" title="生产结算" size="80%">
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

<script setup name="costStatement">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/costStatement/index.js'
import drawer from './drawer/index.vue'
import { ref, reactive, toRefs,onMounted } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance()

import { useRoute } from 'vue-router'

const route = useRoute()
// console.log('route.query:', route.meta)
// console.log('route.query:', route.meta.query)
// console.log('route.query:', JSON.parse(route.meta.query))

const routeId = JSON.parse(route.meta.query).id // routeId==2为陆集陆疏
const isHidden = routeId == '2' ? ref(true) : ref(false)
const isHiddenOther = routeId == '2' ? ref(false) : ref(true)
const routeType = JSON.parse(route.meta.query).type //routeType==0为计费结算，1为生产结算
console.log('配置路由参数', routeId, routeType)
const drawerVisible = ref(false) //新增修改抽屉
const isDisabled = ref(false)
const collapseOpen = ['1'] // 打开的面板
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const revokeCostButton = ref(true) //新增修改抽屉
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	type: routeId == 1 ? 1 : 2, //请求主列表区分是否为陆集陆疏
})
const routeIdIs2 =JSON.parse(route.meta.query).id==2

const selectData = ref([
	{
		name: '船名',
		type: 'input', //远程下拉框
		modelValue: 'shipName', //对应字段
		span: 8,
    isHidden:routeIdIs2,
	},{
		name: '航次',
		type: 'input', //远程下拉框
		modelValue: 'voyage', //对应字段
		span: 8,
    isHidden:routeIdIs2
	},
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 8,
		dataType: 'CUSTOMER_CARGO_OWNER',
    isHidden:routeIdIs2
	},
  {
		name: '船舶状态',
		type: 'select',
		modelValue: 'isLeave', //对应字段
		span: 2,
    isHidden:routeIdIs2,
    selectData: [
      {
        value: '1',
        label: '已离港',
      },
      {
        value: '2',
        label: '未离港',
      },
    ],
	},
  {
    name: '件杂', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'workType', // 绑定字段
    span: 2, // 占位，共24
    isHidden:routeIdIs2,
    selectData: [
      {
        value: '1',
        label: '件杂',
      },
      {
        value: '2',
        label: '散杂',
      }
    ]
  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'statementStatusCode', //对应字段
    span: 2,
    isHidden:routeIdIs2,
    selectData: [
      {
        value: '10',
        label: '未结算',
      },
      {
        value: '20',
        label: '已预结',
      },
      {
        value: '30',
        label: '生产确认',
      },
    ],
  },
	{
		name: '离港时间起始', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'beginLeavePortTime', //绑定字段
		span: 4, //占位多少，总共24
    isHidden:routeIdIs2,
	},
	{
		name: '离港时间截止', //日期搜索
		type: 'date', //搜索框类型
		modelValue: 'endLeavePortTime', //绑定字段
		span: 4, //占位多少，总共24
    isHidden:routeIdIs2,
	},  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 4, // 占位，共24
    isHidden:routeIdIs2,
  },

// routeId == 2


  {
    name: '票货号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoInfoNo', // 绑定字段
    span: 8, // 占位，共24
    isHidden:routeIdIs2==true?false:true,
  },
  {
    name: '货名',
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span:8,
    isHidden:routeIdIs2==true?false:true,

  },
  {
    name: '货主',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoOwnerId', //对应字段
    span: 8,
    dataType: 'CUSTOMER_CARGO_OWNER',
    isHidden:routeIdIs2==true?false:true,

  },
  {
    name: '是否完货', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'isClear', // 绑定字段
    span: 3, // 占位，共24
    selectData: [
      {
        value: '1',
        label: '已完货',
      },
      {
        value: '0',
        label: '未完货',
      }
    ]
  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'statementStatusCode', //对应字段
    span: 3,
    isHidden:routeIdIs2==true?false:true,

    selectData: [
      {
        value: '10',
        label: '未结算',
      },
      {
        value: '20',
        label: '已预结',
      },
      {
        value: '30',
        label: '生产确认',
      },
    ],
  },
  {
    name: '件杂', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'workType', // 绑定字段
    span: 3, // 占位，共24
    isHidden:routeIdIs2==true?false:true,

    selectData: [
      {
        value: '1',
        label: '件杂',
      },
      {
        value: '2',
        label: '散杂',
      }
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
	// {
	// 	label: '撤销结算', // 按钮名称
	// 	type: 'primary', // 按钮类型
	// 	disabled: true,
	// 	icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
	// 	click: () => revokeCost, // 回调函数
	// 	permission: 'produce:costStatement:cost', // 权限
	// },
])

// const route = useRoute()
// const routeType = JSON.parse(route.meta.query).id
// 点击查询的事件
const getList = e => {
	queryParams.value = {
		startPage: 1,
		pageSize: 10,
		type: routeId == 1 ? 1 : 2, //请求主列表区分是否为陆集陆疏(type:2)
		...e,
	}
	getHandoverList(queryParams.value)
}

// 交接单 -------------------
const handoverTableRef = ref()
const total = ref(0)

// 点击查询的事件
const getHandoverList = e => {
	console.log('点击查询', e)
  if (routeId == '2') {
    e.isLeave = null
  }
	queryParams.value = Object.assign(queryParams.value, e)
	buttonList[0].disabled = true
	clickRow.value = {}
	countTable.value = []
	api.getHandoverList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '作业公司', prop: 'companyName', width: 200,align:'center' },
  { label: 'SCN', prop: 'scn', width: 160 ,isHidden:isHidden,align:'center'},
  { label: '船名航次', prop: 'shipNameVoyage', width: 160,isHidden:isHidden,align:'center' },
  { label: '泊位', prop: 'berthName', width: 90,isHidden:isHidden,align:'center' },
  { label: '票货号', prop: 'cargoInfoNo', width: 160,align:'center' },
  { label: '通知单编号', prop: 'trustNo', width: 160 ,isHidden:isHiddenOther,align:'center'},
	{ label: '货主名称', prop: 'cargoOwnerName', width: 220,align:'center' },
	{ label: '件杂', prop: 'workType', width: 100,align:'center' },
	{ label: '货物名称', prop: 'cargoName', minWidth: 150 ,align:'center'},
  { label: '内外贸', prop: 'tradeType', minWidth: 100 ,align:'center'},
  { label: '靠泊时间', prop: 'berthTime',  width: 150 ,isHidden:isHidden},
  { label: '离港时间', prop: 'leavePortTime',  width: 150 ,isHidden:isHidden},
	{ label: '装卸', prop: 'loadUnload', width: 100 ,align:'center'},
  {
    label: '是否完货',
    prop: 'isClear',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.isClear == '是' ? 'primary' : 'success',
          },
          {
            default: () => row.isClear,
          }
        ),
      ]
    },
  },
	{
		label: '是否填写交接清单',
		prop: 'id',
		align: 'center',
    fixed: 'right',
    isHidden:routeId=='1',
		width: 160,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: (row.id ==null || row.id == '') ? 'primary' : 'success',
					},
					{
						default: () => (row.id ==null || row.id == '') ? '否' : '是'
          }
				),
			]
		},
	},
	{
		label: '结算状态',
		prop: 'statementStatusName',
		align: 'center',
    fixed: 'right',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.statementStatusCode == '10' ? '' : 'info',
					},
					{
						default: () => row.statementStatusName,
					}
				),
			]
		},
	},
])
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
  revokeCostButton.value=true
	buttonList[0].disabled = false
  if(row.id ==null || row.id == '') return
	api.getCostList(row.id, routeType).then(res => {
		countTable.value = res.data
	})
}
// 交接单end ----------------------

// 结算单 -------------
const countTable = ref([])
const countTableRef = ref()
const countTableColumns = ref([
	{ label: '作业公司', prop: 'companyName', width: 160 ,align:'center'},
	{ label: '结算单号', prop: 'statementNo', minWidth: 110,align:'center' },
	{ label: '客户名称', prop: 'customerName', width: 150 ,align:'center'},
  { label: '结算量', prop: 'number', width: 150 ,align:'center'},
	{ label: '结算人', prop: 'createByName', width: 100 ,align:'center'},
  { label: '内贸结算方式', prop: 'settlementBasisName', width: 150,align:'center' },
  { label: '外贸结算方式', prop: 'outerSettlementBasisName', width: 150 ,align:'center'},
  { label: '结算日期', prop: 'settlementDate', isTime: true, width: 100,align:'center' },
	{ label: '是否最终结算', prop: 'isFinalLabel', width: 160,align:'center' },
	{
		label: '结算状态',
		prop: 'statusLabel',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.isFinal == '0' ? 'success' : 'primary',
					},
					{
						default: () => (row.isFinal == '0' ? '预结算' : '生产结算 '),
					}
				),
			]
		},
	},
	{ label: '备注', prop: 'remark', width: 100 ,align: "center"},
	{
		prop: '',
		label: '操作',
		width: 'operate',
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							link(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
						permission: 'produce:costStatement:check', // 权限
					},
					{
						default: () => '查看',
					}
				),
			]
		},
	},
])
// 获取结算单点击行数据
const countTableClickRow = ref()
const countTableEvent = ({ row }) => {
	// 取消上层表格选中状态
	handoverTableRef.value.clearCurrentColumn()
  revokeCostButton.value=false
	// 禁用结算按钮 启用撤销结算按钮
	buttonList[0].disabled = true
	countTableClickRow.value = row
}
// 结算单end -------------

const handleChange = res => {}

// 结算
const cost = async () => {
  if(clickRow.value.id==null || clickRow.value.id ==''){
    proxy.$message.error('检测到没有填写交接清单，请先填写交接清单之后在进行操作！')
    return;
  }
	drawerVisible.value = true
  let settlementBasisName ='';
	const { data: serviceNumData } = await api.getServiceContentNum(clickRow.value.id)
	const { data: zqccQuantity } = await api.getZQQuantity(clickRow.value.id,'10')
	const { data: zqcaQuantity } = await api.getZQQuantity(clickRow.value.id,'20')
	const { data: weighObj } = await api.getWeighCapacity(clickRow.value.id)
  const { data: bondedAreaTon } = await api.getBondedAreaTon(clickRow.value.cargoInfoId)
  let weighCapacity = 0
	if (routeId == '2') {
    weighCapacity = weighObj.lxWeigh;
  } else {
    weighCapacity = weighObj.flxWeigh;
  }
  if (routeId == '2') {
    const { data: trustData } = await api.getSettlementBasisByHandover(clickRow.value.id)
    if (trustData != null) {
      settlementBasisName = trustData.settlementBasisName
    }
  //获取集港过磅量疏港过磅量
  }
  else {
    const { data: contactList } = await api.getSettlementBasis(clickRow.value.id)
    if(contactList!=null && contactList.length>0){
      if(clickRow.value.tradeTypeLabel == '内贸'){
        if(clickRow.value.impExpLabel=='进口') {
          settlementBasisName = contactList[0].settlementBasisName
        }else  if(clickRow.value.impExpLabel=='出口') {
          settlementBasisName = contactList[0].expSettlementBasisName
        }
      }else if(clickRow.value.tradeTypeLabel == '外贸'){
        settlementBasisName = contactList[0].outerSettlementBasisName
      }
      if(routeId==2){
        settlementBasisName = contactList[0].luxiaoSettlementBasisName
      }
    }
  }

	let data = {
		impExp: clickRow.value.impExp,
		type: routeId == 1 ? 1 : 2,
	}
	const { data: serviceData } = await api.listService(data)
  //获取集港过磅量疏港过磅量
  const tmpJSWeight = {
    jgWeight:'',
    sgWeight:''
  }
  if(routeIdIs2){

    const { data: tmpResult }  =  await api.getJSGWeight(clickRow.value.id)
    tmpJSWeight.jgWeight = tmpResult==null?null:tmpResult.jgweight
    tmpJSWeight.sgWeight = tmpResult==null?null:tmpResult.sgweight
  }
	nextTick(() => {
		isDisabled.value = false
		drawerRef.value.resetForm()
		drawerRef.value.init(clickRow.value)
    let inOutTon = ''
    let zqccTon = '';
    let zqcaTon = '';
		if (clickRow.value.workType == '件杂') {
      zqccTon = zqccQuantity
      zqcaTon = zqcaQuantity
      inOutTon = (clickRow.value.ton - zqccQuantity-zqcaQuantity).toFixed(2)
    }
    console.log('jgWeight',tmpJSWeight);
    console.log('jgWeight',tmpJSWeight.jgWeight);
    drawerRef.value.isLJLS = routeIdIs2
    drawerRef.value.changeTableColums(routeType);
		drawerRef.value.formData = {
			...clickRow.value,
			handoverlistId: clickRow.value.id,
      settlementBasisName: settlementBasisName,
			companyId: clickRow.value.companyId,
			companyName: clickRow.value.companyName,
			customerId: clickRow.value.cargoOwnerId,
			customerName: clickRow.value.cargoOwnerName,
      inOutTon: inOutTon,
      zqccTon : zqccQuantity,
      zqcaTon : zqcaQuantity,
      ton2: weighCapacity,
      jgWeight:tmpJSWeight.jgWeight,
      sgWeight:tmpJSWeight.sgWeight,
      bondedAreaTon: bondedAreaTon
		}
		// routeType==0计费结算负责预结算，1为生产结算固定最终结算
		if (routeType == 0) {
			drawerRef.value.formData.isFinal = '0'
      drawerRef.value.isHidden = false;
		}
		if (routeType == 1) {
			drawerRef.value.formData.isFinal = '1'
      drawerRef.value.isHidden = true;
		}

		drawerRef.value.formData.details = serviceData.map(item => {
			let number2 = ''
			serviceNumData.forEach(items => {
				if (items.serviceContentId == item.id) {
          number2 = items.number
				}
			})
			const obj = {
        number2,
				serviceContentId: item.id,
				serviceContentName: item.serviceNm,
			}
			return obj
		})
	})
}
// 撤销结算
const revokeCost = () => {
	proxy.$modal.confirm('是否确定撤销结算？').then(() => {
		api.cancelStatement(countTableClickRow.value.id).then(res => {
			getList(queryParams.value)
			proxy.$modal.msgSuccess('撤销成功')
		})
	})
}

// 结束单查看
const link = row => {
	drawerVisible.value = true
	nextTick(() => {
		drawerRef.value.resetForm()
		isDisabled.value = true
		api.getDetail(row.id,clickRow.value.id  ).then(res => {
			drawerRef.value.formData = {
				...clickRow.value,
				...res.data,
				isDisabled: true,
			}
			drawerRef.value.formData.details.forEach(item => {
				item.isDisabled = true
			})
		})
  })
}

// 结算保存
const save = async () => {
	if (await drawerRef.value.validate()) {
    const formData = JSON.parse(JSON.stringify(drawerRef.value.formData))
    formData.details = drawerRef.value.formData.details.filter(v1 => v1.number !== undefined && v1.number !== null && v1.number !== '')
		proxy.$modal.confirm('确定保存？').then(() => {
			api.statement(formData).then(res => {
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
  if (routeId != '2') {
    await nextTick(() => {
      proxy.$bus.emit('setInitSearchData', { isLeave: '1' })
      queryParams.value.isLeave = '1'
    })
  } else {
    await nextTick(() => {
      proxy.$bus.emit('setInitSearchData', { isLeave: null })
      queryParams.value.isLeave = null
    })
  }
  await nextTick(()=>{
    if(routeType == '0'){
      proxy.$bus.emit('setInitSearchData', { statementStatusCode: '10' })
      queryParams.value.statementStatusCode = '10'
    }
  })

	getList(queryParams.value)
}
init()
  onMounted(() => {
    if (routeId == '2') {
/*
      selectData.value = [
        {
          name: '票货号', // 搜索框name
          type: 'input', // 搜索框类型
          modelValue: 'cargoInfoNo', // 绑定字段
          span: 8, // 占位，共24
        },
        {
          name: '货名',
          type: 'input', // 搜索框类型
          modelValue: 'cargoName', // 绑定字段
          span:8,
        },
        {
          name: '货主',
          type: 'remoteSelect', //远程下拉框
          modelValue: 'cargoOwnerId', //对应字段
          span: 8,
          dataType: 'CUSTOMER_CARGO_OWNER',
        },
        {
          name: '结算状态',
          type: 'select',
          modelValue: 'statementStatusCode', //对应字段
          span: 2,
          selectData: [
            {
              value: '10',
              label: '未结算',
            },
            {
              value: '20',
              label: '已预结',
            },
            {
              value: '30',
              label: '生产确认',
            },
          ],
        },
        {
          name: '件杂', // 搜索框name
          type: 'select', // 搜索框类型
          modelValue: 'workType', // 绑定字段
          span: 2, // 占位，共24
          selectData: [
            {
              value: '1',
              label: '件杂',
            },
            {
              value: '2',
              label: '散杂',
            }
          ]
        },
      ]
*/
    }
  })
</script>
<style lang="less" scoped>
.app-container {
	height: auto !important;
}
</style>
