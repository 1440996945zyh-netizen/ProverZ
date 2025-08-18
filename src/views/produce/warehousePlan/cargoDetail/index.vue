<template>
  <div class='formData'>
    <EditTable
      ref="editTable"
      :tableHeight="300"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :disabledKey="'rowDisabled'"
      :rowStyle="rowStyle"
    />
  </div>
</template>

<script setup name='massDetail'>
import { ref, reactive, nextTick, h, watch, getCurrentInstance } from 'vue'
import publicApi from '@/api/public/index' //字典
import Select from '@/components/Select'
import api from '@/api/business/trustOrder/index'
import RemoteSelect from '@/components/RemoteSelect'
import instructionsImport from '@/businessComponents/instructionsImport/index.vue'
import { ElButton } from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'

const ruleForm = ref()
const instructionsImportRef = ref()
const MechanicalTypeRef = ref()
const { proxy } = getCurrentInstance() // 相当于vue2里的this
// 校验规则
const rules = ref({})
const formData = reactive({
  id: '',
  trustId:'',
  cargoList:'',
})
const tableData = ref([])
const tableColumns = reactive([
  {
    prop: 'cargoInfoNo',
    label: '票货号',
    width:110,
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
    width:110,
  },
  {
    prop: 'packingCode',
    label: '包装',
    modelLabel: 'packingName',
    editType: 'select',
    selectData: [],
    disable: true,
    width:70,
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
    width:110,
  },
  {
    prop: 'quantity',
    label: '计划件数',
    editType: 'input',
  },
  {
    prop: 'ton',
    label: '计划重量',
    type: 'input',
  },
  {
    prop: 'isStopOperationName',
    label: '操作人',
    width: 100,
  },
  {
    prop: 'isStopOperationTime',
    label: '操作时间',
    width: 160,
  },
  {
    label: '操作',
    width: 110,
    align: 'center',
    fixed: 'right',
    render: row => {
      return [
        h(
          ElButton,
          {
            onClick: () => {
              isStopStatus(row)
            },
            type: row.isStop == '10' ? 'danger' : 'primary',
            link: true,
            icon: row.isStop == '10' ? 'video-pause' : 'video-play',
            permission:"produce:warehousePlan:isStop",
          },
          {
            default: () => (row.isStop == '10' ? '停用' : '开启'),
          }
        ),
      ]
    },
  },
])
const isStopStatus = row =>{
  if(row.id==null||row.id==''){
    return;
  }
  let text = row.isStop == '10' ? '停用' : '开启'
  proxy.$modal.confirm('确定"' + text + '"吗?').then(() => {
    api.isStopStatus({ id:row.id, isStop:row.isStop == '10' ? '20' : '10',cargoInfoId:row.cargoInfoId }).then(res => {
        api.getDetailMass({ trustId: formData.trustId }).then(res => {
          tableData.value = res.data.cargoList
          proxy.$modal.msgSuccess(text + '成功')
        })
    })
  })
}
const resetForm = () => {
  proxy.resetObj(formData)
  // ruleForm.value.resetFields()
}
const rowStyle = e => {
  if (e.row.isStop == '20') {
    return 'color:red'
  }
  return null
}
defineExpose({
  resetForm,
  formData,
  tableData
})
</script>
<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
