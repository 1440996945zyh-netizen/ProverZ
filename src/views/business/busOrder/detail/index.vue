<template>
  <div>
    <EditTable
      ref="tableRef"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :border="true"
      :loading="false"
      :showFooter="true"
      :tableHeight="500"
      :autoResize="true"
      style=" padding:10px 10px 0px 10px;position: absolute; width: 100%; z-index: 0 !important"
    />
  </div>
</template>

<script setup name="process">
import { ref, reactive,getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import EditTable from "@/components/EditTable/index.vue";
const tableData = ref([])// 表格数据
const tableColumns = ref([
  // { label: '', type: 'checkbox', width: 50 },
  { label: '提运单号', prop: 'billNo', align: 'left', min_width: 150 },
  { label: '票货号', prop: 'cargoInfoNo', align: 'left', min_width: 130 },
  { label: '货名', prop: 'cargoName', align: 'left', min_width: 100 },
  { label: '货主', prop: 'cargoOwnerName', align: 'left', width: 300 },
  { label: '数量', prop: 'quantity', align: 'left', min_width: 150 },
  { label: '重量', prop: 'ton', align: 'left', min_width: 150 },
])
defineExpose({
  tableData
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
</style>
