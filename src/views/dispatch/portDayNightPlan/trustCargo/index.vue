<template>
  <el-form :inline="true" :model="searchForm" class="demo-form-inline" style="margin: 8px 0 0 5px">
    <el-form-item label="船名航次" >
      <RemoteSelect
        type="VOYAGE"
        v-model:value="formData.voyageId"
        v-model:label="formData.shipVoyage"/>
    </el-form-item>
    <el-form-item label="货主">
      <RemoteSelect
        type="CUSTOMER_CARGO_OWNER"
        v-model:value="formData.cargoOwnerId"
        v-model:label="formData.cargoOwnerName"
        @change="changeSelect1"
      />
    </el-form-item>
    <el-form-item label="计划号">
      <el-input v-model="formData.businessNo" clearable/>
    </el-form-item>
    <el-form-item label="货名">
      <RemoteSelect
        type="CARGO_INFO"
        v-model:value="formData.cargoCode"
        v-model:label="formData.cargoName"
      />
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
import { ElButton } from 'element-plus'
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
  api.getTrustCargoDetail(formData.planDate, formData.voyageId, formData.cargoOwnerId, formData.businessNo,formData.cargoCode).then(res =>
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
  { label: '', type: 'checkbox', width: 50 },
  {
    prop: 'businessNo',
    label: '计划号',
    width:120,
  },
  {
    prop: 'shipvoyageName',
    label: '船名航次',
    width:110,
  },
  {
    prop: 'scn',
    label: 'SCN',
    width:100,
  },
  {
    prop: 'noticeType',
    label: '通知单类型',
    width:100,
  },
  {
    prop: 'tradeType',
    label: '内外贸',
    width:70,
  },
  {
    prop: 'cargoCode',
    label: '货名',
    modelLabel: 'cargoName',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'remoteSelect',
    type: 'CARGO_INFO',
    disable: true,
    width:137,
  },
  {
    prop: 'packingCode',
    label: '包装',
    modelLabel: 'packingName',
    editType: 'select',
    selectData: [],
    disable: true,
    width:60,
  },
  {
    prop: 'cargoOwnerId',
    label: '货主',
    modelLabel: 'cargoOwnerName',
    selectLabel: 'label',
    selectValue: 'value',
    editType: 'remoteSelect',
    type: 'CUSTOMER_CARGO_OWNER',
    disable: true,
    width:200,
  },
  {
    prop: 'ton',
    label: '重量',
    type: 'input',
    width:140,
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
