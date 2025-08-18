<template>
    <div class="app-container">
      <BaseTable
        ref="baseTable"
        :showSearchHeader="true"
        :showNum="4"
        :selectData="selectData"
        :searchClick="getList"
        :rowStyle="rowStyle"
        :buttonList="buttonList"
        :tableColumns="tableColumns"
        :tableData="tableData"
        :cellClickEvent="cellClickEvent"
      />
    </div>
  <!-- 新增，修改抽屉组件 -->
  <el-drawer v-model="locationDrawer" title="位置指派" size="30%">
    <addLocation ref="detailRef" />
    <template #footer>
      <div style="flex: auto">
        <el-button @click="locationDrawer = false">取消</el-button>
        <el-button type="primary" @click="saveLocation">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="vehicleOnPort">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/dispatch/vehicleOnPort/index.js'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import math from "../../../utils/math";
import addLocation from './detail/index.vue'


const { proxy } = getCurrentInstance() // 相当于vue2里的this

const baseTable = ref() // table的ref
const locationDrawer = ref(false);
const detailRef = ref() // 明细组件ref
const buttonList = reactive([
  {
    label: '位置指派', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Flag', // 按钮图标，支持element-Plus中所有图标
    click: () => getLocation, // 回调函数
    permission: 'dispatch:vehicleOnPort:location', // 权限
  },  {
    label: '撤销理货', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Refresh', // 按钮图标，支持element-Plus中所有图标
    click: () => cancelTally, // 回调函数
    permission: 'dispatch:vehicleOnPort:cancelTally', // 权限
  },
])
// header检索参数
const selectData = reactive([
  {
    name: '车号（最少四位）',
    type: 'input',
    modelValue: 'carNum',
    span: 6,
  }, {
    name: '计划号',
    type: 'input',
    modelValue: 'planNo',
    span: 6,
  },
  {
    name: '在港状态',
    type: 'select',
    modelValue: 'isLeave',
    span: 6,
    selectData: [
      {label:'在港',value:'1'},
      {label:'离港',value:'0'},
    ],
  },{
    name: '作业区',
    type: 'select',
    modelValue: 'portCode',
    span: 6,
    selectData: [
      {label:'东作业区',value:'01'},
      {label:'中作业区',value:'02'},
      {label:'西作业区',value:'03'},
    ],
  },
])
const queryParams = ref({
  // 检索参数
  startPage: 1,
  pageSize: 10,
})
// 点击查询的事件
const getList = e => {
  queryParams.value = e
  Object.assign(queryParams,e)

  if(queryParams.value.isLeave == '0'){
    if(queryParams.value.carNum==null||queryParams.value.carNum==''){
      proxy.$message.error("请先输入车牌号，再做离港查询.")
      return
    }
  }
  if(queryParams.value.isLeave == '0'){
    if(queryParams.value.carNum.length<4){
      proxy.$message.error("车牌号至少四位")
      return
    }
  }  api.getList(queryParams.value).then(res => {
    tableData.value = res.data
    tableData.value.forEach(item=>{
      item.minutesLabel = item.minutes+"分钟"
    })
  })
}
// header按钮参数
const tableData =ref([])
// 表格表头参数
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { prop: 'workMacName', label: '车牌号' ,width: 100,},
  { prop: 'shipName', label: '船名航次',width: 130, },
  { prop: 'planNo', label: '计划号',width: 125, },
  { prop: 'cargoInfoNo', label: '票货号',width: 125, },
  { prop: 'cargoName', label: '货名',width: 100, },
  { prop: 'cargoOwnerName', label: '货主',width: 100, },
  { prop: 'weighInDt', label: '进港时间',width: 100,},
  { prop: 'minutesLabel', label: '在港时长' ,width: 100,},
  { prop: 'workTimeStart', label: '理货开始时间' ,width: 100,},
  { prop: 'workTimeEnd', label: '理货结束时间',width: 100, },
  { prop: 'tallyName', label: '理货员',width: 80, },
  {prop:'portName',label:'作业区',width: 80,},
  {prop:'massNamesSource',label:'作业位置',width: 100,},
  {prop:'driverNameOne',label:'司机',width: 80,},
  {prop:'driverPhoneOne',label:'手机号',width: 100,},
  {
    label: '状态',
    prop: 'statusLabel',
    align: 'center',
    fixed: 'right',
    width: 100,
    render: row => {
      return [
        h(
          ElTag,
          {
            type:
              row.statusLabel == '未配作业线'
                ? 'error'
                : row.statusLabel == '离港'
                ? 'info':'',
          },
          {
            default: () => row.statusLabel
          }
        ),
      ]
    },
  },
])
const clickRow = ref({})

// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
const getLocation = () => {
  locationDrawer.value = true
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    proxy.setFormData(detailRef.value.formData, clickRow.value)
  })
}
const rowStyle = e => {
/*  console.log(e,"chaoshi ");
  console.log("chaoshishishsii",e.row.minutes);*/
  if (math.numSub(Number(e.row.minutes),Number(60))>0) {
    return 'color:red'
  }
  return null
}

const saveLocation = async () => {
  if (await detailRef.value.validate()) {
    const params = JSON.parse(JSON.stringify(detailRef.value.formData))
    console.log(params)
    proxy.$modal.confirm('确定保存？').then(() => {
      api.updateLocation(params).then(res => {
        proxy.$modal.msgSuccess(res.msg)
        locationDrawer.value = false
        getList(queryParams.value)
      })
    })
  }
}

//撤销理货
const cancelTally =async ()=>{
  await proxy.$modal.confirm('是否撤销理货？').then(() => {
    api.cancelTally(clickRow.value.weighbridgeId).then(()=>{

    })
  })
  getList();
}
const init=async ()=>{
  await nextTick(()=>{
    proxy.$bus.emit('setInitSearchData', { isLeave: '1' })
    queryParams.value.isLeave = '1'
  })
  getList(queryParams.value)

}
init()
</script>
