<template>
  <el-form :inline="true" :model="searchForm" class="demo-form-inline" style="margin: 8px 0 0 5px">
    <el-form-item label="计划号">
      <el-input v-model="formData.businessNo" clearable/>
    </el-form-item>
    <el-form-item>
      <div>
        <el-button type="primary" @click="getList" icon="Search">查询</el-button>
      </div>
    </el-form-item>
  </el-form>
  <EditTable
    ref="editTable"
    :tableHeight="pageTableHeight"
    :tableColumns="tableColumns"
    :tableData="tableData"
    :editRules="editRules"
    @input="editInputChange"
    :disabledKey="'rowDisabled'"
    :checkbox-config="checkboxConfig"
    @change="editTableChange"
    @focus="tableFocus"
    :selectAllChangeEvent="checkboxChangeEvent"
    @checkbox-change="checkboxChange"
  />
</template>

<script setup name='trustCargo'>
import api from '@/api/dispatch/portDayNightPlan/index'
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import publicApi from '@/api/public/index' //字典
import Select from '@/components/Select'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'
import {ElButton, ElTag} from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'

const ruleForm = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({})
const formData = reactive({
  updateType: '0',
  id: '',
  planDate:'',
  regionIdsSource: '',
  regionIdsTarget: '',
  locationListSource: [],
  locationListTarget: [],
  checkboxList: [],
  trustId:'',
  cargoList:'',
  voyageId:'',
  shipVoyage:'',
  cargoOwnerId:'',
  cargoOwnerName:'',
  businessNo:'',
  cargoCode:'',
  cargoName:'',
})
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
// 点击查询的事件
const getList = () => {
  api.importYesterdayPlan(formData.planDate, formData.businessNo).then(res =>
    tableData.value = res.data
  )
}
// 复选事件
const checkboxChangeEvent = data => {
  formData.checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
  formData.checkboxList.value = data
}
const tableData = ref([])
const tableColumns = reactive([
  { label: '', type: 'checkbox', width: 40,fixed: 'left',},
  { prop: 'classCode',
    label: '班次',
    width: 100,
    editType: 'select',
    align: 'center',
    editRender: {},
    selectData: [
      /*{ label: '白班', value: '01' },
      { label: '夜班', value: '02' },*/
      { label: '全天', value: '03'},
    ],
    sortable:true},
  { prop: 'businessNo', label: '计划号', width: 150, align: 'center' ,sortable:true},
  { prop: 'shipvoyageName', label: '船名航次', width: 120, align: 'center',sortable:true },
  { prop: 'scn', label: 'SCN', width: 80, align: 'center',sortable:true },
  { prop: 'noticeType', label: '类型', width: 100, align: 'center' ,sortable:true},
  { prop: 'portName', label: '港区', width: 80, align: 'center',sortable:true },
  { prop: 'cargoOwnerName', label: '货主', width: 200, align: 'center',sortable:true },
  { prop: 'cargoName', label: '货名', width: 130, align: 'center' ,sortable:true},
  { prop: 'packingName', label: '包装', width: 80, align: 'center' ,sortable:true},
  { prop: 'tradeType', label: '内外贸', width: 80, align: 'center',sortable:true },
  {
    label: '计划类型',
    prop: 'planType',
    editType: 'select',
    width: 130,
    align: 'center',
    editRender: {},
    selectData: [
      { label: '出入库', value: '1' },
      { label: '直取', value: '2' },
    ],
    sortable:true
  },
  {
    prop: 'planTon',
    label: '昼夜计划量',
    width: 140,
    editType: 'input',
    editRender: {},
    align: 'center',
    sortable:true
  },
  /*  { prop: 'weighCount', label: '过磅量', width: 100, align: 'center' ,sortable:true},
    { prop: 'remainCount', label: '剩余量', width: 100, align: 'center' ,sortable:true},*/
  { prop: 'remainCount', label: '昼夜计划剩余量', width: 120, align: 'center' },
  { prop: 'allPlanCount', label: '计划总量', width: 100, align: 'center' },
  { prop: 'weighCount', label: '过磅量', width: 100, align: 'center' },
  { prop: 'remainPlanCount', label: '计划剩余量', width: 100, align: 'center' },
  { prop: 'massNamesTargetLabel', label: '位置', width: 200, align: 'center',sortable:true },
  { prop: 'beginTime', label: '计划开始时间', width: 160, align: 'center', editType: 'nativedatetime', editRender: {},sortable:true},
  { prop: 'endTime', label: '计划结束时间', width: 160, align: 'center', editType: 'nativedatetime', editRender: {},sortable:true},
  { prop: 'createByName', label: '创建人', width: 90, align: 'center',sortable:true },
  { prop: 'createTime', label: '创建时间', width: 140, align: 'center',sortable:true },
  { prop: 'examineByName', label: '审核人', width: 80, align: 'center',sortable:true },
  { prop: 'examineTime', label: '审核时间', width: 140, align: 'center' ,sortable:true},
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    fixed: 'right',
    width: 100,
    sortable:true,
    render: row => {
      return [
        h(
          ElTag,
          {
            type:
              row.status == '20'
                ? 'success'
                : row.status == '10'
                  ? ''
                  : row.status == '30'
                    ? 'danger '
                    : row.status == '40'
                      ? 'info'
                      : '',
          },
          {
            default: () =>
              row.status == '20'
                ? '已审核'
                : row.status == '10'
                  ? '待审核'
                  : row.status == '30'
                    ? '驳回 '
                    : row.status == '40'
                      ? '停用'
                      : '',
          }
        ),
      ]
    },
  },
])
const selectData = reactive([
  {
    name: '计划号',
    type: 'input', //远程下拉框
    modelValue: 'businessNo', //对应字段
    span: 8,
  },
  {
    name: '船名航次', // 搜索框name
    type: 'remoteSelect', // 搜索框类型
    modelValue: 'shipvoyageItemId', // 绑定字段
    span: 8, // 占位，共24
    dataType: 'VOYAGE',
  },
  {
    name: '货主', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'customerName', // 绑定字段
    span: 8, // 占位，共24
  },
  {
    name: '货名',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'cargoCode', //对应字段
    span: 8,
    dataType: 'CARGO_INFO',
  },
])
const resetForm = () => {
  proxy.resetObj(formData)
}

const clickRow = ref({})

defineExpose({
  resetForm,
  formData,
  tableData
})
</script>
<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
