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
      :cellDBLClickEvent="cellDBLClick"
		/>
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="trustOrderDrawer" :title="title" size="70%">
			<editTrustOrder ref="trustOrderRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="trustOrderDrawer = false">取消</el-button>
					<el-button type="primary" @click="saveTrustOrder" v-if="showButton">核销</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="orderVerification">
import BaseTable from '@/components/BaseTable/index.vue'
import {ref, reactive, nextTick, onMounted, h} from 'vue'
import editTrustOrder from './editTrustOrder/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/business/orderVerification/index'
const { proxy } = getCurrentInstance()

const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const trustOrderRef = ref(null)
//控制作业指令编辑抽屉
const trustOrderDrawer = ref(false)
const showButton = ref(true)
const title = ref('新增作业指令')
import publicApi from '@/api/public/index' //字典
const salaryStatus = reactive([])
const initData = () => {
	// 获取字典数据 合同类型：CONTRACT_TYPE 结算依据：SETTLEMENT_BASIS   预缴依据：DEPOSIT_BASIS  付费方式：PAY_TYPE,账期类型：PAYMENT_TYPE 计量单位：UNIT
	publicApi.getLocalSelect({ type: 'CONSTANT', types: 'BUS_TRUST_STATUS' }).then(res => {
		res.data.forEach(item => {
			if (item.value == '40' || item.value == '50') {
				salaryStatus.push(item)
			}
		})
	})
}
initData()
//顶部 搜索表单
const selectData = reactive([
	{
		name: '通知单编号',
		type: 'input', //远程下拉框
		modelValue: 'trustNo', //对应字段
		span: 8,
	},
	{
		name: '作业公司',
		type: 'select', //远程下拉框
		modelValue: 'companyId', //对应字段
		span: 8,
		dataConfig: {
			params: {
				type: 'DEPT_WORK_COMPANY',
			},
		},
	},
/*	{
		name: '船名航次',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'shipvoyageItemId', //对应字段
		span: 8,
		dataType: 'VOYAGE',
	},*/
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 8, // 占位，共24
  }, {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 2, // 占位，共24
  },
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 2,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
  {
    name: '作业过程',
    type: 'select',
    modelValue: 'processCode',
    span: 2,
    dataConfig: {
      // 本地需要dataConfig获取数据，包括url、method，method默认get
      params: { type: 'MAIN_WORK_PROCESS' },
    },
  },
	{
		name: '状态',
		type: 'select', //远程下拉框
		modelValue: 'status', //对应字段
		span: 2,
		selectData: salaryStatus,
	},
])
//数据总条数
const total = ref(0)
//顶部 右侧按钮
const buttonList = reactive([
	{
		label: '新增', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => addTrustOrder, // 回调函数
		// permission: 'business:trustOrder:add', // 权限
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
  { label: '作业过程', prop: 'processName', width: 100, align: 'center' },
  { label: '计划件数', prop: 'planQuantity', align: 'right', width: 100 },
  { label: '计划重量', prop: 'planTon', align: 'right', width: 100 },
  { label: '核销件数', prop: 'checkNumber', align: 'right', width: 100 },
  { label: '核销重量', prop: 'checkTon', align: 'right', width: 100 },
  { label: '预估金额', prop: 'estAmount', align: 'right', width: 100 },
  { label: '作业公司', prop: 'companyName', width: 180 },
  { label: '下发人', prop: 'createByName', width: 100 },
  { label: '下发时间', prop: 'createTime', width: 150, align: 'center' },
  { label: '核销人', prop: 'checkByName', width: 100 },
  { label: '核销时间', prop: 'checkTime', width: 150, align: 'center' },
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
	{
		prop: '',
		label: '操作',
		width: 180,
		align: 'center',
    fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'DocumentChecked',
						permission: 'business:order:verification', // 权限
            disabled: row.status == 50
					},
					{
						default: () => '核销',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              cancelWriteOff(row)
            },
            type: 'primary',
            link: true,
            icon: 'DocumentChecked',
            permission: 'business:order:verification', // 权限
            disabled: row.status != 50
          },
          {
            default: () => '取消核销',
          }
        ),
			]
		},
	},
])
//查询
const getList = e => {
	queryParams.value = e
	api.getList(e).then(res => {
		console.log('核销通知单列表数据', res.data)
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const cellDBLClick = ({ row }) => {
  showButton.value = false
  title.value = '通知单'
  trustOrderDrawer.value = true
  nextTick(() => {
    trustOrderRef.value.resetForm()
    api.getWriteOffById({
      trustId: row.id,
    }).then(res => {
      if (res.code === '0000') {
        if(res.data.flag == '0'){
          let checkTon = 0
          trustOrderRef.value.trustOrderForm.flag = res.data.flag
          trustOrderRef.value.tmpFun(res.data.flag)
          trustOrderRef.value.trustOrderForm = JSON.parse(JSON.stringify(row))
          trustOrderRef.value.trustOrderForm.waterElectricityList=res.data.list
          trustOrderRef.value.trustOrderForm.waterElectricityList.forEach(e => {
            checkTon += Number(e.quantity == '' || e.quantity == null || e.quantity == undefined ? 0 : e.quantity)
          })
          trustOrderRef.value.trustOrderForm.checkTon = checkTon
        }else {
          trustOrderRef.value.trustOrderForm = JSON.parse(JSON.stringify(row))
          trustOrderRef.value.trustOrderForm.flag = res.data.flag
          trustOrderRef.value.trustOrderForm.cargoList=res.data.list
          let checkTon = 0
          res.data.list.forEach(e => {
            checkTon += Number(e.ton == '' || e.ton == null || e.ton == undefined ? 0 : e.ton)
          })
          trustOrderRef.value.trustOrderForm.checkTon = checkTon
        }
      }
    })
  })
}
//新增作业指令抽屉
const addTrustOrder = () => {
	trustOrderDrawer.value = true
	title.value = '新增作业指令'
	nextTick(() => {
		trustOrderRef.value.resetForm()
	})
}
//提交作业指令信息
const saveTrustOrder = async () => {
	if (await trustOrderRef.value.validate()) {
		const trustId = trustOrderRef.value.trustOrderForm.id
		const checkNumber = trustOrderRef.value.trustOrderForm.checkNumber
		const checkTon = trustOrderRef.value.trustOrderForm.checkTon
		api.writeOff({ trustId, checkNumber, checkTon }).then(res => {
			console.log(res)
			if (res.code === '0000') {
				proxy.$modal.msgSuccess(res.msg)
				trustOrderDrawer.value = false
				getList(queryParams.value)
			}
		})
	}
}
const cancelWriteOff = row => {
  proxy.$modal.confirm('确定取消核销？').then(() => {
    if (row.status !== '50') {
      proxy.$modal.msgSuccess('指令未核销，无法取消')
      return
    }
    api.cancelWriteOff({trustId: row.id}).then(res => {
      if (res.code === '0000') {
        proxy.$modal.msgSuccess('操作成功')
        getList(queryParams.value)
      }
    })
  })
}
const handleUpdate = row => {
  showButton.value = true
	title.value = '通知单'
	trustOrderDrawer.value = true
	nextTick(() => {
		trustOrderRef.value.resetForm()
		api.getWriteOffById({
			trustId: row.id,
		}).then(res => {
			if (res.code === '0000') {
				// let checkNumber = JSON.parse(JSON.stringify(row.checkNumber)) //核销量
				// let checkTon = JSON.parse(JSON.stringify(row.checkTon)) //核销重量
				// trustOrderRef.value.trustOrderForm = JSON.parse(JSON.stringify(row))
				// trustOrderRef.value.trustOrderForm.cargoList = res.data
				// trustOrderRef.value.trustOrderForm.cargoList.forEach(e => {
				// 	if (trustOrderRef.value.trustOrderForm.status !== '50') {
				// 		checkTon += Number(e.ton == '' || e.ton == null || e.ton == undefined ? 0 : e.ton)
				// 	}
				// })
				// trustOrderRef.value.trustOrderForm.checkNumber = checkNumber
				// trustOrderRef.value.trustOrderForm.checkTon = checkTon
				// trustOrderRef.value.isSource()
				// console.log(trustOrderRef.value.trustOrderForm)
        if(res.data.flag == '0'){
          let checkTon = 0
          trustOrderRef.value.trustOrderForm.flag = res.data.flag
          trustOrderRef.value.tmpFun(res.data.flag)
          trustOrderRef.value.trustOrderForm = JSON.parse(JSON.stringify(row))
          trustOrderRef.value.trustOrderForm.waterElectricityList=res.data.list
          trustOrderRef.value.trustOrderForm.waterElectricityList.forEach(e => {
            		checkTon += Number(e.quantity == '' || e.quantity == null || e.quantity == undefined ? 0 : e.quantity)
            })
          trustOrderRef.value.trustOrderForm.checkTon = checkTon
        }else {
          trustOrderRef.value.trustOrderForm = JSON.parse(JSON.stringify(row))
          trustOrderRef.value.trustOrderForm.flag = res.data.flag
          trustOrderRef.value.trustOrderForm.cargoList=res.data.list
          let checkTon = 0
          res.data.list.forEach(e => {
            checkTon += Number(e.ton == '' || e.ton == null || e.ton == undefined ? 0 : e.ton)
          })
          trustOrderRef.value.trustOrderForm.checkTon = checkTon
        }
			}
		})
	})
}

getList(queryParams.value)
</script>

<style scoped></style>
