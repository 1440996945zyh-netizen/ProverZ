<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'pageTableHeight'"
      :loading="loading"
      :total="total"
    />
  </div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/vehicleTransfer/index'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from '../../../../utils/math'
const trustId = ref(null)
const carCount = ref(0)
const tons = ref(0)
const total = ref(0)
const trustCargoId = ref(null)
const loading = ref(false) // 是否加载中
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '费目', prop: 'rateName' ,width: 150, align: 'center'},
  { label: '结算单号', prop: 'statementNo' ,width: 120, align: 'center'},
  { label: '作业过程', prop: 'processName' ,width: 120, align: 'left'},
  { label: '客户', prop: 'customerName' ,width: 280, align: 'center '},
  { label: '船名航次', prop: 'shipVoyage' ,width: 120, align: 'center'},
  { label: '泊位', prop: 'berthName' ,width: 90, align: 'center'},
  { label: '货名', prop: 'cargoName' ,width: 120, align: 'center'},
  { label: '费率', prop: 'rate' ,width: 100, align: 'right',isThousandth:'true'},
  { label: '数量1', prop: 'billQuantity' ,width: 100, align: 'right',isThousandth:'true'},
  { label: '数量2', prop: 'billQuantity2' ,width: 100, align: 'right',isThousandth:'true'},
  { label: '总额', prop: 'amountMoney' ,width: 130, align: 'right',isThousandth:'true'},
  { label: '创建人', prop: 'createByName' ,width: 130, align: 'center'},
  { label: '计费人', prop: 'statementByName' ,width: 130, align: 'center'},
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 100,
    fixed: 'right',
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.status=='10'?"success":row.status=='20'?"primary":'danger'
          },
          {
            default: () => row.status=='10'? "待计费" : row.status=='20'? "待审核" : row.status=='30'? "已审核" : row.status=='31'? "回执确认" : row.status=='40'? "部分开票" : row.status=='50'? "已开票" : ''
          }
        ),
      ]
    },
  },
])

const setTableData = data => {
  tableData.value = data
}

defineExpose({
  setTableData,
  trustId,
  trustCargoId
})

</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
  width: 100%;
  padding: 0 10px 0 0;
  justify-content: space-between;
  align-items: center;
}
</style>
