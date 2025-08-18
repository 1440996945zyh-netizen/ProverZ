<template>
  <div class="app-container">
    <BaseTable
      ref="handoverTableRef"
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
  </div>
</template>

<script setup name="rejectStatement">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/statement/rejectStatement/index.js'   //和stackFeeNew共用一套api
import {ref, reactive, toRefs, onMounted} from 'vue'
import { ElButton, ElTag } from 'element-plus'

const { proxy } = getCurrentInstance()
const total = ref(0)
const clickRow = ref({}) //点击当前行
// 获取路由参数
const queryParams = ref({
  startPage: 1,
  pageSize: 15,
})
const selectData = ref([
  {
    name: '船名航次', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'shipvoyageItemId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '货主', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'cargoOwnerId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'CUSTOMER_CARGO_OWNER',
  },
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
    span:3,
  },
  {
    name: '结算状态',
    type: 'select',
    modelValue: 'statementStatus',
    span: 3,
    selectData: [
      {value:'20',label:'已计费'},
      {value:'30',label:'计费审核'},
      {value:'31',label:'商务确认'},
      {value:'40',label:'部分开票'},
      {value:'50',label:'已开票'}
    ],
  }
])
const buttonList = reactive([
])


// 点击查询的事件
const getList = e => {
  clickRow.value = {}
  api.getList( Object.assign(queryParams.value,e )).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
  })
}
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '费用类型', prop: 'type', width:100,fixed: 'left',},
  { label: '客户', prop: 'customerName', width: 220 },
  { label: '结算单号', prop: 'statementNo', width: 120 , },
  { label: '票货号', prop: 'cargoInfoNo', width: 120 , },
  { label: '货名', prop: 'cargoName', minWidth: 120 },
  { label: '船名航次', prop: 'shipNameVoyage', width: 120 },
  { label: '贸别', prop: 'tradeType', width: 74 },
  { label: '作业过程', prop: 'processName', width: 100 },
  { label: '计费人', prop: 'statementByName', width: 100 },
  { label: '计费时间', prop: 'statementTime', width: 120 },
  { label: '驳回人', prop: 'rejectByName', width: 100 },
  { label: '驳回时间', prop: 'rejectTime', width: 180 },
  { label: '作业公司', prop: 'companyName', width: 200 },
  { label: '驳回原因', prop: 'rejectReason',fixed: 'right', width: 280 },
  { label: '金额', prop: 'amount',  fixed: 'right', width: 100 },
  {
    label: '计费状态',
    prop: 'status',
    align: 'center',
    width: 100,
    fixed: 'right',
  },
])

//初始化函数
const init = async () => {
  getList(queryParams.value)
}
init()

</script>
<style lang="less" scoped>
.app-container {
  height: auto !important;
}
.image{
  object-fit: contain;  width: 100%;  height: 100%;
}
</style>
