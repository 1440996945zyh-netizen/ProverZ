<template>
  <div style="width: 100%;height: 600px;margin:0px;padding:10px 0px 10px 0px; ">
    <BaseTable
      ref="baseTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="585"
      :loading="loading"
      :total="total"
      :autoResize="true"
    />
  </div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import {ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance} from 'vue'

const {proxy} = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/vehicleTransfer/index'
import {ElButton, ElSwitch, ElTag} from 'element-plus'
import math from '../../../../utils/math'

const trustId = ref(null)
const carCount = ref(0)
const tons = ref(0)
const total = ref(0)
const trustCargoId = ref(null)
const loading = ref(false) // 是否加载中
const activeNames = ref(['1'])

// 表格数据
const tableData = ref([])
const tableColumns = ref([
  {label: '作业区域', prop: 'portCode', width: 100},
  {label: '类型', prop: 'type', width: 70},
  {label: '内外贸', prop: 'tradeType', width: 90},
  {label: 'SCN', prop: 'scn', width: 90},
  {label: '通知单编号', prop: 'trustNo', width: 120},
  {label: '票货号', prop: 'cargoInfoNo', width: 120},
  {label: '合同号', prop: 'invNo', width: 150},
  {label: '计划号', prop: 'planNo', width: 130},
  {label: '船名', prop: 'comName', width: 90},
  {label: '航次', prop: 'voyage', width: 90},
  {label: '货物名称', prop: 'goodsName', width: 130},
  {label: '货主', prop: 'cargoOwnerName', width: 190},
  {label: '发货单位', prop: 'consigneeName', width: 190},
  {label: '收货单位', prop: 'consignorName', width: 190},
  {label: '车牌号', prop: 'truckPlate', width: 120},
  {label: '皮重', prop: 'weightSelf', width: 70},
  {label: '毛重', prop: 'weightAll', width: 70},
  {label: '净重', prop: 'weightGoods', width: 70},
  {label: '件数', prop: 'quantity', width: 70},
  {label: '进港日期时间', prop: 'weighInDt', width: 160},
  {label: '出港日期时间', prop: 'weighOutDt', width: 160},
  // { label: '进港司磅员', prop: 'checkerInName',width:120 },
  {label: '理货员', prop: 'checkerOutName', width: 90},
  {label: '理货开始时间', prop: 'workTimeStart', width: 160},
  {label: '理货结束时间', prop: 'workTimeEnd', width: 160},
  {label: '在港时长', prop: 'zgsc', width: 100},
  {label: '理货位置', prop: 'massName', width: 100},
  {label: '理货前时长', prop: 'lhq', width: 115},
  {label: '理货时长', prop: 'lhsc', width: 100},
  {label: '理货后时长', prop: 'lhh', width: 115},
  {label: '一次磅', prop: 'inBangNo', width: 90},
  {label: '二次磅', prop: 'outBangNo', width: 90},
  // {label: '磅单号', prop: 'unionNo', width: 170},
  {label: '磅单号', prop: 'planNo', width: 130},
  {label: '司机姓名', prop: 'driver', width: 100},
  {label: '电话', prop: 'tel', width: 130},
  {label: '身份证号', prop: 'idNumber', width: 170},
  {label: '备注', prop: 'invRem', width: 110},
  {label: '车辆排放标准', prop: '车辆排放标准', width: 130},
])

const setTableData = data => {
  tableData.value = data
}
const handleChange = val => {
  console.log(val);
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
