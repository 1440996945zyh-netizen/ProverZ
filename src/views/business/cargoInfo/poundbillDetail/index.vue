<template>
  <div class="app-container">
    <BaseTable
      ref="baseTable"
      :headerCellClickEvent="tableHeaderChange"
      :selectData="selectData"
      :searchClick="getList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :cellClickEvent="cellClickEvent"
      :loading="loading"
      :total="total"
      :tableHeight="550"
      :autoResize = "true"
    />
      <p> 净重吨数：{{ sumTon }}</p>
  </div>
</template>

<script setup name="workToolDetail">
import api from '@/api/standardization/basicdata/specialProcess/index.js'
import {ref, reactive, nextTick, h, getCurrentInstance} from 'vue'
import BaseTable from '@/components/BaseTable/index.vue'
import {getNowDate, uniqueArr} from '@/utils/index.js'
import {ElButton} from 'element-plus'
import publicApi from "@/api/public";
import EditTable from "@/components/EditTable/index.vue";
const {proxy} = getCurrentInstance() // 相当于vue2里的this
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref('')
const sumTon = ref(0)
// 表格数据
const tableData = ref([])
//删除得表单数据 = ref([])
const editTableRef = ref() // editTable的ref
const exportConfig = {}
//工艺流程
const processData = []

const rowConfig = {isCurrent: true, isHover: true, height: 50}
//edit表头
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 50,align: 'center' },
  {
    prop: 'UNION_NO',
    label: '检斤号',
    modelLabel: "specialProcessNumber",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'WEIGH_IN_DT',
    label: '入港时间',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'WEIGH_OUT_DT',
    label: '出港时间',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'WEIGHT_GOODS',
    label: '净重',
    modelLabel: "specialProcessNumber",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'WEIGHT_SELF',
    label: '皮重',
    modelLabel: "WEIGHT_SELF",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'WEIGHT_ALL',
    label: '毛重',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'TRUCK_PLATE',
    label: '车牌号',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'GOODS_NAME',
    label: '货物名称',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'PLAN_TYPE',
    label: '类型',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'IN_BANG_NO',
    label: '一次磅号',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'OUT_BANG_NO',
    label: '二次磅号',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'CONSIGNOR_NAME',
    label: '发货人',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'CONSIGNEE_NAME',
    label: '收货人',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'AGENT_NAME',
    label: '委托人',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
  {
    prop: 'INV_REM',
    label: '备注',
    modelLabel: "specialProcessNotes",
    editType: 'input',
    editRender: {},
    align: "center",
  },
])
const clickRow = ref({})
//临时数据
const codeList = ref([])
const nameList = ref([])
const temp = ref({})
//初始化函数
const init = () => {
}
init()
//清空事件
const resetForm = () => {
  tableData.value = [];
}
defineExpose({
  resetForm,
  tableData,
  editTableRef,
  init,
  sumTon
})

</script>
<style lang="scss" scoped>
:deep(.el-form--inline .el-form-item) {
  margin-right: 12px;
  width: 320px !important;
}
</style>
