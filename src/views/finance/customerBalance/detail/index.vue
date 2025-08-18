<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableHeight= '550'
      :tableData="tableData"
      :loading="loading"
      :total="total"
    />
  </div>

</template>

<script setup name="ship">
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/finance/customerBalance/index.js'


const { proxy } = getCurrentInstance() // 相当于vue2里的this
const baseTable = ref()
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref(null) // 抽屉标题
const queryParams = ref({
  customerId:'',
  prepaymentTypeCode:'',
  startPage: 1,
  pageSize: 10,
})
const searchForm = reactive({})
const shipFlag = ref(false)
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { prop: 'businessNo', label: '业务编号',width:150,align: 'center'},
  { prop: 'companyName', label: '作业公司',width:180,align: 'center'},
  { prop: 'shipVoyageName', label: '船名航次',width:150,align: 'center'},
  { prop: 'detailType', label: '类型',width:180, align: 'center'},
  { prop: 'amount', label: '金额',width:150, align: 'right' , isHidden:shipFlag},
  { prop: 'paymentTime', label: '创建时间',width:220, align: 'center'},
  { prop: 'createByName', label: '创建人',width:150, align: 'center'},
])
const tableColumnsShip = ref([
  { prop: 'businessNo', label: '业务编号',width:150,align: 'center'},
  { prop: 'companyName', label: '作业公司',width:180,align: 'center'},
  { prop: 'shipVoyageName', label: '船名航次',width:150,align: 'center'},
  { prop: 'detailType', label: '类型',width:180, align: 'center'},
  { prop: 'amount', label: '金额',width:150, align: 'right' , isHidden:shipFlag},
  { prop: 'paymentTime', label: '创建时间',width:220, align: 'center'},
  { prop: 'createByName', label: '创建人',width:150, align: 'center'},
])
const tableColumnsDefault = ref([
  { prop: 'businessNo', label: '业务编号',width:150,align: 'center'},
  { prop: 'companyName', label: '作业公司',width:180,align: 'center'},
  { prop: 'detailType', label: '类型',width:180, align: 'center'},
  { prop: 'amount', label: '金额',width:150, align: 'right' , isHidden:shipFlag},
  { prop: 'paymentTime', label: '创建时间',width:220, align: 'center'},
  { prop: 'createByName', label: '创建人',width:150, align: 'center'},
])
const selectData = reactive([
  {
    name: '起始时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'searchStartTime', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '截止时间', // 搜索框name
    type: 'date', // 搜索框类型
    modelValue: 'searchEndTime', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '业务编号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'businessNo', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '隐藏预估',
    type: 'select',
    modelValue: 'hiddenEsti',
    span: 4,
    selectData: [
      { label: '是', value: '1' },
      { label: '否', value: '0' },
    ],
  }
])
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    icon: 'Document', // 按钮图标，支持element-Plus中所有图标
    click: () => exportExcel , // 回调函数
    permission: 'finance:customerBalance:export', // 权限
  },
])

// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
  //queryParams.value =e
  loading.value = true
  api.getdDetailList(queryParams.value).then(res => {
    tableData.value = res.data.pages
    total.value = res.data.totalNum
    loading.value = false
  })
}
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '客户余额明细')
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

const hiddenColumn=(v)=>{
  console.log("隐藏表格头",tableColumns.value);
  nextTick(()=>{
    console.log("展示",v)
    if(v=='30'){
      tableColumns.value .forEach(item=>{
        if(item.label=='船名航次'){
          item.isHidden = false
        }
      })
    }else{
      tableColumns.value .forEach(item=>{
        if(item.label=='船名航次'){
          item.isHidden = true
        }
      })
    }

  })
}
defineExpose({
  tableData,
  queryParams,
  getList,
  shipFlag,
  hiddenColumn
})
</script>
<style lang="scss" scoped>
  @import '@/assets/styles/formData.scss';
</style>
