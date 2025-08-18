<template>
	<div>
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
				:total="total"
			/>
		</div>
		<el-drawer v-model="drawerVisible" :title="title" size="60%">
			<detail ref="detailRef" />
			<machineTypeList ref="machineTypeRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="drawerVisible = false">取消</el-button>
					<el-button type="primary" @click="save" >
						保存
					</el-button>
				</div>
			</template>
		</el-drawer>

    <!-- 新增，修改抽屉组件 -->
    <el-drawer v-model="weighDetailVisible" title="派车详情" size="70%">
      <DrawerDetail ref="drawerDetailRef" />
      <template #footer>
        <div style="flex: auto">
          <el-button @click="weighDetailVisible = false">取 消</el-button>
        </div>
      </template>
    </el-drawer>
	</div>
</template>

<script setup name="dayNightVehicles">
import BaseTable from '@/components/BaseTable/index.vue'
import machineTypeList from './dayNightVehiclesList/index.vue'
import detail from './detail/index.vue'
import api from '@/api/business/dayNightVehicles/index'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import DrawerDetail from '../dayNightVehicles/drawer/index.vue'
import math from "@/utils/math";

const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const detailRef = ref() // 明细组件ref
const machineTypeRef = ref() //机械类型表格ref
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const drawerDetailRef = ref(null)
const weighDetailVisible = ref(false) //弹出框组件显示隐藏
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '计划号', prop: 'planNo', width: 130, },
  { label: '子计划号', prop: 'subPlanNo', width: 110, },
	{ label: '中文船名', prop: 'vesselNameCn', width: 106, },
	{ label: '进口航次', prop: 'voyageImport', width: 110, },
	{ label: '货物名称', prop: 'cargoName', width: 158, },
  { label: '计划场地', prop: 'planYard', width: 101, },
  { label: '物流公司', prop: 'consigneeName', width: 104, },
  { label: '客户名称', prop: 'companyName', width: 265, },
  { label: '计划件数', prop: 'planQuantity', width: 102, },
  { prop: 'finishQuantity',label: '已完成件数', width: 114, },
  { label: '剩余件数', prop: 'surplusQuantity', width: 106, },
  { label: '计划重量(吨)', prop: 'planWeight', width: 125, },
  { label: '已完成量(吨)', prop: 'finishWeight', width: 134, },
  { label: '剩余量(吨)', prop: 'surplusWeight', width: 119, },
  { label: '计划开始时间', prop: 'planStartTime', width: 161, },
  { label: '计划结束时间', prop: 'planEndTime', width: 167, },
  /*{ label: '预约数量', prop: 'orderQuantity' },
  { label: '是否过磅', prop: 'isWeigh' },
  { label: '已停止车辆', prop: 'truckStop' },
  { label: '在港车辆', prop: 'truckInPort' },*/
	{
		prop: '',
		label: '操作',
		width: 230,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							edit(row)
						},
						type: 'primary',
						link: true,
						icon: 'Edit',
						permission: 'business:dayNightVehicles:dispatchCar', // 权限
					},
					{
						default: () => '派车',
					}
				),
        h(
          ElButton,
          {
            onClick: () => {
              getCarList(row)
            },
            type: 'primary',
            link: true,
            icon: 'Document',
            permission: 'business:dayNightVehicles:dispatchCarDt', // 权限
          },
          {
            default: () => '派车详情',
          }
        ),
			]
		},
	},
])


const selectData = reactive([
  {
    name: '计划号',
    type: 'input', //输入框
    modelValue: 'planNo', //对应字段
    span: 8
  },
  {
    name: '货物名称',
    type: 'remoteSelect',
    modelValue: 'cargoCode',
    span: 8,
    dataType: 'BHT_CARGO_INFO',
  },
  {
    name: '客户名称',
    type: 'remoteSelect',
    modelValue: 'companyCode',
    span: 8,
    dataType: 'CUSTOMER_BHT',
  },
  {
    name: '业务类型',
    type: 'select', //输入框
    modelValue: 'billType', //对应字段
    selectData:[
      {value:'SG',label:'提货'},
      {value:'JG',label:'集港/存'},
    ],

    span: 3
  },
])
const buttonList = reactive([

])
const drawerVisible = ref(false)

const clickRow = ref({})
// 点击查询的事件
const getList = e => {
  console.log("eeee",e)
	queryParams.value = Object.assign(queryParams.value, e)
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

// 编辑事件
const edit = row => {
	title.value = '派车'
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	drawerVisible.value = true
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
		machineTypeRef.value.tableData = []
    detailRef.value.formData.id = editRow.id
    detailRef.value.formData.planNo = editRow.planNo
    detailRef.value.formData.subPlanNo = editRow.subPlanNo
    detailRef.value.formData.vesselNameCn = editRow.vesselNameCn
    detailRef.value.formData.voyageImport = editRow.voyageImport
    detailRef.value.formData.cargoName = editRow.cargoName
    detailRef.value.formData.cargoCode = editRow.cargoCode
    detailRef.value.formData.planYard = editRow.planYard
    detailRef.value.formData.planQuantity = editRow.planQuantity
    detailRef.value.formData.finishQuantity = editRow.finishQuantity
    detailRef.value.formData.surplusQuantity = editRow.surplusQuantity
    detailRef.value.formData.planWeight = editRow.planWeight
    detailRef.value.formData.finishWeight = editRow.finishWeight
    detailRef.value.formData.surplusWeight = editRow.surplusWeight
    detailRef.value.formData.planStartTime = editRow.planStartTime
    detailRef.value.formData.planEndTime = editRow.planEndTime
    detailRef.value.formData.consigneeCode = editRow.consigneeCode
    detailRef.value.formData.consigneeName = editRow.consigneeName
    detailRef.value.formData.companyCode = editRow.companyCode
    detailRef.value.formData.companyName = editRow.companyName
    detailRef.value.formData.packing = editRow.packing
    detailRef.value.formData.planYard = editRow.planYard
    detailRef.value.formData.entrustWeight = editRow.entrustWeight
    detailRef.value.formData.entrustQuantity = editRow.entrustQuantity
    detailRef.value.formData.billType = editRow.billType
    detailRef.value.formData.nameYard = editRow.nameYard
  })
}

// 保存事件
const save = async () => {
	if ((await detailRef.value.validate()) && (await machineTypeRef.value.validate())) {
    const params = {
      ...detailRef.value.formData,
    }
    console.log(params)
    if (params.subPlanNo == null && params.planWeight != null && params.entrustWeight > params.planWeight) {
      proxy.$modal.msgWarning("委托重量不能大于计划重量");
      return;
    }
    if (params.subPlanNo == null && params.planQuantity != null && params.entrustQuantity > params.planQuantity) {
      proxy.$modal.msgWarning("委托件数不能大于计划件数");
      return;
    }
    if(params){
      if(params.consigneeCode ==params.companyCode){
          params.entrustStatus = 0
      }else {
        params.entrustStatus =1
      }
    }
    let sumCount = 0
    let sumWeightCount = 0
    let tmpList = JSON.parse(JSON.stringify(machineTypeRef.value.tableData))
    tmpList.forEach(x=>{
      sumCount = math.numAdd(Number(sumCount),Number(x.quantity))
      sumWeightCount = math.numAdd(Number(sumWeightCount),Number(x.weight))
      x.billType = params.billType
      x.businessNo = params.planNo
      x.planNo = params.planNo
      x.subPlanNo = params.subPlanNo
      x.vesselNameCn = params.vesselNameCn
      x.voyageImport = params.voyageImport
      x.voyage = params.voyageImport
      x.cargoName = params.cargoName
      x.cargoCode = params.cargoCode
      x.planYard = params.planYard
      x.planQuantity = params.planQuantity
      x.finishQuantity = params.finishQuantity
      x.surplusQuantity = params.surplusQuantity
      x.planWeight = params.planWeight
      x.finishWeight = params.finishWeight
      x.surplusWeight = params.surplusWeight
      x.planStartTime = params.planStartTime
      x.planEndTime = params.planEndTime
      x.packing = params.packing
      x.assignType = params.packing
      x.consigneeCode = params.consigneeCode
      x.consigneeName = params.consigneeName
      x.consignorCode = params.companyCode
      x.consignorName = params.companyName
      x.arrivalNum = 0
      x.entrustStatus = params.entrustStatus
      x.locCode = params.planYard
      x.entrustWeight = params.entrustWeight
      x.entrustQuantity = params.entrustQuantity
      x.yardCode = params.nameYard
    })
    //console.log(machineTypeRef.value.tableData)
    if(params.entrustQuantity != null){
      if(math.numSub(Number(sumCount),Number(params.entrustQuantity))>0){
        proxy.$modal.msgWarning("件数不能大于委托件数")
        return
      }
    }
    if(params.entrustWeight != null){
      if(math.numSub(Number(sumWeightCount),Number(params.entrustWeight))>0){
        proxy.$modal.msgWarning("重量不能大于委托重量")
        return
      }
    }
		proxy.$modal.confirm('确定保存？').then(() => {
      api.insertCar(tmpList).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        drawerVisible.value = false
        getList(queryParams.value)
      })

		})
	}
}

const getCarList = row => {
  weighDetailVisible.value = true
  nextTick(() => {
    drawerDetailRef.value.tableData=[]
    api.getCarList({
      subPlanNo: row.subPlanNo,
    }).then(res => {
      drawerDetailRef.value.setTableData(res.data)
    })
  })

}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
const init =  () => {
   nextTick(() => {
      proxy.$bus.emit('setInitSearchData', {billType:'JG'})
    // baseTable.value.SearchHeaderRef.searchData.billType = 'JG'

    queryParams.value.billType = 'JG'
      getList(queryParams.value)
    })
}

init()
</script>
