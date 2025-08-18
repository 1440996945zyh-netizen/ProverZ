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
</template>

<script setup name="vehicleList">
  import BaseTable from '@/components/BaseTable/index.vue'
  import api from '@/api/dispatch/vehicleOnPort/index.js'
  import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
  import { ElButton, ElTag } from 'element-plus'
  import math from "@/utils/math.js";

  const { proxy } = getCurrentInstance() // 相当于vue2里的this
  const baseTable = ref() // table的ref
  const locationDrawer = ref(false);
  const detailRef = ref() // 明细组件ref
  const buttonList = reactive([])
  // header检索参数
  const selectData = reactive([
    {
      name: '车号（最少四位）',
      type: 'input',
      modelValue: 'carNum',
      span: 8,
    }, {
      name: '计划号',
      type: 'input',
      modelValue: 'planNo',
      span: 8,
    },
    {
      name: '在港状态',
      type: 'select',
      modelValue: 'isLeave',
      span: 8,
      selectData: [
        {label:'在港',value:'1'},
        {label:'离港',value:'0'},
      ],
    }
  ])
  const queryParams = ref({
    // 检索参数
    startPage: 1,
    pageSize: 10,
    portCode:'01',
  })
  // 点击查询的事件
  const getList = e => {
    //queryParams.value = e
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
    { prop: 'sortNum', label: '序号',width: 70, },
    { prop: 'workMacName', label: '车牌号' ,width: 100,},
    { prop: 'shipName', label: '船名航次',width: 130, },
    { prop: 'planNo', label: '计划号',width: 125, },
    { prop: 'cargoName', label: '货名',width: 100, },
    { prop: 'cargoOwnerName', label: '货主',width: 100, },
    { prop: 'weighInDt', label: '进港时间',width: 100,},
    { prop: 'minutesLabel', label: '在港时长' ,width: 100,},
    { prop: 'workTimeStart', label: '理货开始时间' ,width: 140,},
    { prop: 'workTimeEnd', label: '理货结束时间',width: 140, },
    { prop: 'tallyName', label: '理货员',width: 90, },
    {prop:'portName',label:'作业区',width: 90,},
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
    if (math.numSub(Number(e.row.minutes),Number(60))>0) {
      return 'color:red'
    }
    return null
  }

  const init=async (param)=>{
    await nextTick(()=>{
      proxy.$bus.emit('setInitSearchData', { isLeave: '1' })
      queryParams.value.isLeave = '1'
      queryParams.value.portCode = param
    })
    getList(queryParams.value)

  }
  defineExpose({
    init
  })
</script>
