<template style="margin: 0px;padding: 0px !important;">
  <div style="width: 100%;height: 590px;margin:0px;padding:0px;">
    <div style="height: 260px;width: 100%">
      <el-table
        :data="tableData"
        height="580"
        border
        style="width: 100%">
        <el-table-column type="expand" key="slot">
          <template #default="scope">
            <el-table
              :data="scope.row.table"
              border
              @row-click="cellDBLClickEvent"
              :row-style="rowStyle"
            style="width: 100%">
              <el-table-column
                prop="trustNo"
                label="通知单编号">
              </el-table-column>
              <el-table-column
                prop="tradeType"
                label="贸别"
                width="60">
              </el-table-column>
              <el-table-column
                prop="inoutDate"
                label="第一次进港日期"
                width="140">
              </el-table-column>
              <el-table-column
                prop="storehouseName"
                label="场地"
                width="150">
              </el-table-column>
              <el-table-column
                prop="regionName"
                label="区域"
                width="90">
              </el-table-column>
              <el-table-column
                prop="massName"
                label="垛位"
                width="90">
              </el-table-column>
              <el-table-column
                prop="cargoName"
                label="货名">
              </el-table-column>
              <el-table-column
                prop="packingName"
                label="包装"
                width="60">
              </el-table-column>
              <el-table-column
                prop="quantity"
                label="件数"
                width="80">
              </el-table-column>
              <el-table-column
                prop="ton"
                label="重量"
                width="90">
              </el-table-column>
            </el-table>
<!--            <BaseTable-->
<!--              ref="itemTableRef"-->
<!--              :tableColumns="itemTableColumns"-->
<!--              :tableData="scope.row.table"-->
<!--              :cellDBLClickEvent="cellDBLClickEvent"-->
<!--            />-->
          </template>
        </el-table-column>
        <el-table-column
          prop="cargoInfoNo"
          label="票货号"
          width="140">
        </el-table-column>
        <el-table-column
          prop="companyName"
          label="作业公司">
        </el-table-column>
        <el-table-column
          prop="cargoOwnerName"
          label="货主">
        </el-table-column>
        <el-table-column
          prop="inoutDate"
          label="入场日期"
          width="120">
        </el-table-column>
        <el-table-column
          prop="tradeType"
          label="贸别"
          width="60">
        </el-table-column>
        <el-table-column
          prop="cargoName"
          label="货名">
        </el-table-column>
        <el-table-column
          prop="packingName"
          label="包装"
          width="60">
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="件数"
          width="80">
        </el-table-column>
        <el-table-column
          prop="ton"
          label="重量"
          width="90">
        </el-table-column>
      </el-table>
    </div>

    <!--  单船综合查询  -->
    <el-dialog title="港存详情"  v-model="portTrendsVisible" size="100%" width="80%">
      <PortTrends ref="portTrendsRef"/>
    </el-dialog>
  </div>
</template>

<script name="ShipAisBoard" setup>
import {getCurrentInstance, h, reactive, ref} from "vue";
import BaseTable from '@/components/BaseTable/index.vue'
import api from "@/api/common/shipInfo/index.js"
const {proxy} = getCurrentInstance() // 相当于vue2里的this
import {ElButton, ElTag} from "element-plus";
import PortTrends from '@/views/common/shipInfo/portTrendsInfo/detail/index.vue'
const portTrendsRef = ref(null)
const tableData = ref([])
const itemTableRef = ref(null)
const itemTableColumns = ref([
  { label: '通知单编号', prop: 'trustNo'  },
  { label: '贸别', prop: 'tradeType' , width: 70 },
  { label: '第一次进港日期', prop: 'inoutDate' , width: 140 },
  { label: '场地', prop: 'storehouseName' , width: 150 },
  { label: '区域', prop: 'regionName' , width: 90 },
  { label: '垛位', prop: 'massName' , width: 90 },
  { label: '货名', prop: 'cargoName' },
  { label: '包装', prop: 'packingName' , width: 70 },
  { label: '件数', prop: 'quantity' , width: 80 },
  { label: '重量', prop: 'ton' , width: 90 },
])
const cargoInfoId = ref(null)
const storehouseId = ref(null)
const regionId = ref(null)
const massId = ref(null)
const portTrendsVisible = ref(false)
const cellDBLClickEvent =  (row, column, event) => {
  portTrendsVisible.value = true
  cargoInfoId.value = null;
  storehouseId.value = null;
  regionId.value = null;
  massId.value = null;
  cargoInfoId.value = row.cargoInfoId;
  storehouseId.value = row.storehouseId;
  regionId.value = row.regionId;
  massId.value = row.massId;
  api.getInoutDetail({
    cargoInfoId:row.cargoInfoId,
    storehouseId:row.storehouseId,
    regionId:row.regionId,
    massId:row.massId,
  }).then(res=>{
    let data = res.data;
    portTrendsRef.value.tableDatas = data;
    portTrendsRef.value.show;
  })
}
// 更改选中行背景色
const rowStyle=( row )=> {
  if (cargoInfoId.value === row.cargoInfoId
    && storehouseId.value === row.storehouseId
    && regionId.value === row.regionId
    && massId.value === row.massId ) {
    return { 'background-color': '#879be7', cursor: 'pointer' };
  }
  // #f7eded
  return { cursor: 'pointer' };
  // return { 'background-color': '#879be7', cursor: 'pointer' };
}

const show=()=>{
  console.log(tableData.value)
}
const enter=()=> {
  proxy.$('.commonScrollbarTable').addClass('scrollbarShow')
}
const leave=()=> {
  proxy.$('.commonScrollbarTable').removeClass('scrollbarShow')
}
const tableRowClassName=({row, rowIndex})=> {
  if (rowIndex === 1) {
    return 'warning-row';
  } else if (rowIndex === 3) {
    return 'success-row';
  }
  return '';
}
defineExpose({
  tableData,
  show
})
</script>

<style lang="scss" scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
