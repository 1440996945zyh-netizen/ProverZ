<template>
  <div class='formData'>
    <EditTable
      ref="editTable"
      :tableHeight="300"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :editRules="editRules"
      @input="editInputChange"
      :disabledKey="'rowDisabled'"
      @change="editTableChange"
      @focus="tableFocus"
    />
    <el-form :model='formData' ref='massForm' label-position='left' label-width='120px' style="margin-top: 20px">
      <el-form-item label='场区' prop='massIdsTarget'>
        <RemoteSelect
          type='ALL_STORAGE_REGION'
          v-model:value='formData.regionIdsTarget'
          @change='changeMassTarget'
          multiple
        />
      </el-form-item>

    </el-form>
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
  updateType: '0',
  id: '',
  regionIdsSource: '',
  regionIdsTarget: '',
  locationListSource: [],
  locationListTarget: [],
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
])
const editRules = ref({
  cargoCode: [{ required: true, message: '货名必须填写' }],
  packingCode: [{ required: true, message: '包装必须填写' }],
  cargoOwnerId: [{ required: true, message: '货主必须填写' }],
  // cargoAgentId: [{ required: true, message: '货代必须填写' }],
  ton: proxy.getRules({
    required: false,
    numberCheck: {
      int: 8,
      dec: 2,
    },
  }),
  quantity: proxy.getRules({
    required: false,
    numberCheck: {
      int: 8,
      dec: 0,
    },
  }),
})
const resetForm = () => {
  proxy.resetObj(formData)
  // ruleForm.value.resetFields()
}

// 修改垛位处理数据
const changeMass = row => {
  formData.locationListSource = row
}
const changeMassTarget = row => {
  formData.locationListTarget = row
}
// 可编辑列表下拉框聚焦事件 回调
const tableFocus = (row, val, title) => {
  // console.log('下拉框聚焦', val, row)
  if (title == '合同') {
    // 查询对应场地下的垛位
    let data = {
      cargoOwnerId: row.cargoOwnerId,
      cargoCode: row.cargoCode,
      tradeType: trustOrderForm.value.tradeType,
    }
    api.getListContract(data).then(res => {
      // console.log('合同事件查询', res)
      proxy.setEditTableOptions(tableColumns, { contractName: res.data })
    })
  }
}
const editTableChange = (row, e, title) => {
  // console.log('下拉框选中数据', e.workType)
  // console.log('下拉框选中数据', row)
  if (title == '货名' && e) {
    let arr = trustOrderForm.value.cargoList
      .filter(item => {
        if (item.workType && item.workType !== '') {
          return item
        }
      })
      .map(it => it.workType)
    if (arr.length > 0 && !arr.includes(e.workType)) {
      console.log('不一样')
      row.cargoCode = ''
      row.cargoName = ''
      row.workType = ''
      proxy.$message.warning('只能选择相同票货！')
      return
    }
    row.workType = e.workType
  }
}
const clickRow = ref({})
const editInputChange = (e, row, title) => {
  console.log('可编辑列表输入框事件', title)
  if (title == '重量') {
    row.estAmount = row.rate && e ? (row.rate * 1 * e * 1).toFixed(2) : null
  }
  comput()
}
// 计划件数，计划量汇总
const comput = () => {
  let cargoList = trustOrderForm.value.cargoList
  // 计算件数
  trustOrderForm.value.planQuantity =
    cargoList.length > 0 ? cargoList.reduce((sum, item) => sum + item.quantity * 1, 0) : trustOrderForm.value.planQuantity

  // 货物列表计算重量
  trustOrderForm.value.planTon =
    cargoList.length > 0 && containCargo.value ? cargoList.reduce((sum, item) => sum + item.ton * 1, 0) : trustOrderForm.value.planTon

  // 预估金额汇总
  trustOrderForm.value.estAmount =
    cargoList.length > 0 && containCargo.value
      ? cargoList.reduce((sum, item) => sum + (item.estAmount ? item.estAmount : 0) * 1, 0).toFixed(2)
      : trustOrderForm.value.estAmount
}

defineExpose({
  resetForm,
  formData,
  tableData,
  changeMassTarget
})
</script>
<style lang='scss' scoped>
@import '@/assets/styles/formData.scss';
</style>
