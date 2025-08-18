<template>
	<!-- 倒运车辆管理  -->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:showNum = '4'
			:loading="false"
			:total="total"

      />
		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="vehicleTransfeVisible" title="已配工倒运车" size="70%">
			<Drawer ref="drawerRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="vehicleTransfeVisible = false">取 消</el-button>
					<el-button type="primary" @click="saveMachineDispatch">保 存</el-button>
				</div>
			</template>
		</el-drawer>
    <el-drawer v-model="vehicleTransferVisible" title="内倒类型" size="30%">
      <detail ref="detailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="vehicleTransferVisible = false">取消</el-button>
          <el-button type="primary" @click="saveInner">保存</el-button>
        </div>
      </template>
    </el-drawer>

		<!-- 新增，修改抽屉组件 -->
		<el-drawer v-model="weighDetailVisible" title="过磅数据" size="70%">
			<DrawerDetail ref="drawerDetailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="weighDetailVisible = false">取 消</el-button>
					<el-button type="primary" @click="save">保 存</el-button>
				</div>
			</template>
		</el-drawer>
    <el-drawer v-model="miscDetailVisible" title="费用明细" size="70%">
			<MiscDrawer ref="drawerMiscRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="miscDetailVisible = false">取 消</el-button>
				</div>
			</template>
		</el-drawer>
    <el-dialog :title="dialogMsg" v-model="confirmDialogVisible" width="40%">
      <el-form :model="confirmFormData" ref="confirmFormRef" label-width="180px">

          <el-form-item label="过磅量" prop="weighTon" >
            <el-input v-model="confirmFormData.weighTon" type="number"></el-input>
          </el-form-item>
          <el-form-item :label="feeLabel" prop="isCharge" v-if="isChargeHidden">
            <el-checkbox-group v-model="confirmFormData.feeList" @change="feeChange">
              <el-checkbox
                v-for="(item, index) in feeList"
                :key="item.id"
                :label="item.label"
                :value="item"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取 消</el-button>
          <el-button @click="submitConfirmForm" type="primary" >确 定</el-button>
        </div>
      </template>
    </el-dialog>
	</div>
</template>

<script setup name="vehicleTransfer">
import BaseTable from '@/components/BaseTable/index.vue'
import Drawer from './drawer/index'
import DrawerDetail from './drawer/indexDetail'
import MiscDrawer from './miscDrawer/index'
import detail from './detail/index.vue'
import api from '@/api/produce/vehicleTransfer/index'
const drawerVisible = ref(false) //新增修改抽屉
const detailRef = ref(null) // 组件ref
import { ref, reactive, nextTick, h } from 'vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from "../../../utils/math";
const { proxy } = getCurrentInstance()
const ids = ref([])
const total = ref(0)
const drawerRef = ref(null)
const drawerMiscRef = ref(null)
const drawerDetailRef = ref(null)
const message = ref('确定保存吗？')
const vehicleTransfeVisible = ref(false) //弹出框组件显示隐藏
const weighDetailVisible = ref(false) //弹出框组件显示隐藏
const miscDetailVisible = ref(false) //弹出框组件显示隐藏
const isChargeHidden = ref(true) //弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
const confirmFormRef = ref()
const feeList= ref([])
const confirmFormData = reactive({
  trustCargoId:'',
  trustId:'',
  status:'',
  weighTon:'',
  isSecondWeigh:'',
  isCharge:'',
  feeList:[],
})
const dialogMsg = ref("确认")
const feeLabel = ref("是否生成二次倒运费")
const weighTon = ref(0)
const confirmDialogVisible = ref(false)

const vehicleTransferVisible = ref(false) // 是否显示内倒类型
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '计划号', prop: 'businessNo',width:130 },
	{ label: '票货号', prop: 'cargoInfoNo',width:130 },
	{ label: '船名', prop: 'shipName',width:90 },
	{ label: '航次', prop: 'voyage',width:90 },
	{ label: '货主', prop: 'cargoOwnerName',width:220,align: 'center',},
	{ label: '包装', prop: 'packingName',width:70 },
	{ label: '货名', prop: 'cargoName',width:100 },
  { label: '计划开始时间', prop: 'startTime',width:150 },
  { label: '计划结束时间', prop: 'endTime',width:150 },
  {
    prop: 'type',
    label: '内倒类型',
    width: 120,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.innertransportType == '10' ? 'info' : 'info',
          },
          {
            default: () => (row.innertransportType == '1' ? '一车一皮' : row.innertransportType == '5' ? '五车一皮' : row.innertransportType == '10' ? '十车一皮' : row.innertransportType == '99' ? '多车一皮'  : ''),
          }
        ),
      ]
    },
  },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 150,
    config: 'status',
    render: row => {
      return [
        h(
          ElSwitch,
          {
            onClick: () => {
              handleStatusChange(row)
            },
            modelValue: row.status,
            'active-value': '1',
            'inactive-value': '0',
          },

          {
            // default: () => row.status,
          }
        ),
      ]
    },
  },
	{
		prop: '',
		label: '操作',
		width: 200,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							getVehicleTransferList(row)
						},
						type: 'primary',
						link: true,
						icon: 'Document',
						permission: 'business:vehicleTransfer:query', // 权限
					},
					{
						default: () => '过磅数据',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              getMiscFeeList(row)
            },
            type: 'primary',
            link: true,
            icon: 'Document',
            permission: 'business:vehicleTransfer:feeDetail', // 权限
          },
          {
            default: () => '费用明细',
          }
        )
			]
		},
	},
])
const selectData = reactive([
  {
    name: '计划号',
    type: 'input',
    modelValue: 'businessNo', //对应字段
    span: 6,
  },
  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 6,
    dataType: 'VOYAGE',
  },
  {
    name: '货主',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoOwnerId', //对应字段
    span: 6,
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
  {
    name: '是否可用', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 6, // 占位，共24
    selectData: [
      { label: '可用', value: '1' },
      { label: '停用', value: '0' },
    ],
  },
	{
		name: '货名',
		type: 'remoteSelect',
		modelValue: 'cargoCode',
		span: 3,
		dataType: 'CARGO_INFO_SIGN',
	},
	{
		name: '票货号',
		type: 'input', // 搜索框类型
		modelValue: 'cargoInfoNo', // 绑定字段
		span: 3, // 占位，共24
	},


])
const buttonList = reactive([
    {
      label: '配工', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
      click: () => add, // 回调函数
      permission: 'business:vehicleTransfer:insert', // 权限
    },
    {
      label: '配置内倒规则', // 按钮名称
      type: 'primary', // 按钮类型
      icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
      click: () => updateInverted, // 回调函数
      permission: 'business:vehicleTransfer:insert', // 权限
    },
])
const clickRow = ref({})

// 获取点击行数据
const cellClickEvent = ({ row }) => {

  buttonList[0].disabled = false //控制生效按钮
  buttonList[1].disabled = false //控制生效按钮
	clickRow.value = row
}
// 点击查询的事件
const getList = e => {
	queryParams.value = e
  buttonList[0].disabled = true //控制生效按钮
  buttonList[1].disabled = true //控制生效按钮
	clickRow.value = null;
	api.getList(e).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
const batchFlag = ref(false)
//主列表查询条件
const dispatchedQueryParams = ref({
  trustId: '',
  trustCargoId: '',
})
// 保存
/*const save = async () => {
	console.log(drawerRef.value.getCheckboxList())
	proxy.$modal.confirm(`${message.value}`).then(() => {
		api.insertVehicleTransferList({
			trustId: drawerRef.value.trustId,
			trustCargoId: drawerRef.value.trustCargoId,
			busVehicleTransferList: drawerRef.value.getCheckboxList()
		}).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			vehicleTransfeVisible.value = false
			getList(queryParams.value)
		})
	})
}*/
const processCode = ref() // 主过程

const add = () => {
	if (!clickRow.value || !clickRow.value.trustCargoId) {
		proxy.$modal.msgError('请选择一条数据')
		return
	}
	const editRow = clickRow.value // 拿到所编辑行的数据
	vehicleTransfeVisible.value = true
  dispatchedQueryParams.value.trustId = editRow.trustId
  dispatchedQueryParams.value.trustCargoId = editRow.trustCargoId
  processCode.value = editRow.processCode
	api.getTrustCagroDispatchSecondary({
		trustId: editRow.trustId,
		trustCargoId: editRow.trustCargoId,
	}).then(res => {
    drawerRef.value.machineTableData=res.data
		nextTick(() => {
			drawerRef.value.dispatchedQueryParams.trustId = editRow.trustId
			drawerRef.value.dispatchedQueryParams.trustCargoId = editRow.trustCargoId
      drawerRef.value.init(dispatchedQueryParams.value, batchFlag.value)
    })
	})
}
const saveMachineDispatch = async () => {
  console.log( "drawerRef.value.dispatchedTableData",drawerRef.value.dispatchedTableData)
  proxy.$modal.confirm('确定保存?').then(() => {
    api.insertVehicleTransferList({
      trustId: drawerRef.value.dispatchedQueryParams.trustId,
      trustCargoId: drawerRef.value.dispatchedQueryParams.trustCargoId,
      busVehicleTransferList: drawerRef.value.dispatchedTableData
    }).then(res => {
      proxy.$modal.msgSuccess(res.msg)
      vehicleTransfeVisible.value = false
      getList(queryParams.value)
    })
  })
}
/** 编辑 */
const getVehicleTransferList = row => {
	weighDetailVisible.value = true
	api.getVehicleTransferList({
		trustCargoId: row.trustCargoId,
	}).then(res => {
		nextTick(() => {
			drawerDetailRef.value.setTableData(res.data)
		})
	})
}
const getMiscFeeList = row => {
  miscDetailVisible.value = true
  api.getMiscFeeList({
    trustCargoId: row.trustCargoId,
  }).then(res => {
    nextTick(() => {
      drawerMiscRef.value.setTableData(res.data)
    })
  })

}
const updateInverted = () => {
  vehicleTransferVisible.value = true
  nextTick(() => {
    detailRef.value.resetForm()
    detailRef.value.formData.trustCargoId = clickRow.value.trustCargoId // 给子组件的queryParams赋值
    /*if(clickRow.value.isRule ==1){
      detailRef.value.appear=true
    }else{
      detailRef.value.appear=false
    }*/
    if(clickRow.value.isRule ==1){
      detailRef.value.appear=true
      /*api.getEmptyHeavy({
        cargoCode: clickRow.value.cargoCode
      }).then(res => {
        detailRef.value.formData.emptyWeight=res.data.emptyWeight
        detailRef.value.formData.heavyWeight=res.data.heavyWeight
      })*/
    }else{
      detailRef.value.appear=false
    }
    if(clickRow.value.printPoundId ==1){
      detailRef.value.printPoundAppear=true
    }else{
      detailRef.value.printPoundAppear=false
    }
    proxy.setFormData(detailRef.value.formData, clickRow.value)
  })
}
const saveInner = async () => {
  if (await detailRef.value.validate()) {
    const params = JSON.parse(JSON.stringify(detailRef.value.formData))
    proxy.$modal.confirm('确定保存？').then(() => {
      api.updateInvert(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        vehicleTransferVisible.value = false
        getList(queryParams.value)
      })
    })
  }
}

const handleStatusChange = async(row) => {

  //初始化下拉框
  feeList.value=[
    {id:1,label:"倒运费"},
    {id:2,label:"过磅费"}
  ]

  const { data: isSecondWeigh } = await api.getSecondWeighTon({trustCargoId: row.trustCargoId})
  if (isSecondWeigh == '1' && row.status == '1') {
    dialogMsg.value = '停用过磅数据?'
    let ton = 0;
    await api.getVehicleTransferList({trustCargoId: row.trustCargoId})
      .then(res => {
        res.data.forEach(item=> {
          ton = math.numAdd(ton, item.tons);
        })
        confirmFormData.status = row.status == '1' ? '0' : '1'
        confirmFormData.trustCargoId = row.trustCargoId
        confirmFormData.trustId = row.trustId
        confirmFormData.weighTon = ton.toFixed(2);
        confirmFormData.feeList = [];
        // confirmFormData.isCharge = '1'
        confirmFormData.isSecondWeigh = '1'
        if(row.trustType=='3'){
          confirmFormData.feeList = ["倒运费", "过磅费"];
        }else {
          confirmFormData.feeList = ["过磅费"];
        }
      })
    confirmDialogVisible.value = true
  } else {
    let text = row.status == '0' ? '启用' : '停用'
    proxy.$modal.confirm('确定"' + text + '"过磅数据?').then(() => {
      api.changeStatus({ trustCargoId:row.trustCargoId, status:row.status == '1' ? '0' : '1',trustId:row.trustId }).then(res => {
        proxy.$modal.msgSuccess(text + '成功')
        getList(queryParams.value)
      })
    })
  }
}
const feeChange =val=>{
}
const submitConfirmForm = () => {
  let text = confirmFormData.status == '0' ? '启用过磅数据' : '停用过磅数据'
  api.changeStatus(confirmFormData).then(res => {
    proxy.$modal.msgSuccess(text + '成功')
    confirmDialogVisible.value = false
    getList(queryParams.value)
  })
}

/** 初始化数据 */
const init = async () => {
  await nextTick(() => {
    proxy.$bus.emit('setInitSearchData', { status: '1' })
    queryParams.value.status = '1'
  })
  getList(queryParams.value)
}
init()
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
