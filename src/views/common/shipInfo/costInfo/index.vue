<template style="margin: 0px;padding: 0px !important;">
  <div style="width: 100%;height: 600px;margin:0px;padding:0px; overflow-y: auto;">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="船方费用" name="1">
        <div >
          <BaseTable
            :tableColumns="tableColumns"
            :tableData="tableDataShip"
            :tableHeight="400"
            :autoResize="true"
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="货方费用" name="2">
        <div>
          <BaseTable
            :tableColumns="tableColumns"
            :tableData="tableDataCargo"
            :tableHeight="400"
            :autoResize="true"
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="杂项费用" name="3">
        <div>
          <BaseTable
            :tableColumns="tableColumns"
            :tableData="tableDataMisc"
            :tableHeight="400"
            :autoResize="true"
          />
      </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script name="ShipAisBoard" setup>
import {getCurrentInstance, h, reactive, ref} from "vue";
import BaseTable from '@/components/BaseTable/index.vue'
const {proxy} = getCurrentInstance() // 相当于vue2里的this
import {ElButton, ElTag} from "element-plus";
const tableDataShip = ref([])
const tableDataCargo = ref([])
const tableDataMisc = ref([])
const activeNames = ref(['1'])
const tableColumns = ref([
  { prop: 'statementNo', label: '结算单编号', width: 130,},
  { label: '作业公司', prop: 'companyName',width:190,align: 'center', },
  { label: '客户名称', prop: 'customerName',width:220,align: 'center', },
  {
    prop: 'type',
    label: '费用类型',
    width: 130,
    render: row => {
      return [
        h(
          ElTag,
          {
            type: row.type == '10' ? 'info' : 'info',
          },
          {
            default: () => (row.type == '10' ? '货方结算单' : row.type == '20' ? '陆集陆疏' : row.type == '30' ? '船方计费' : row.type == '40' ? '杂项计费' : row.type == '50' ? '堆存费' : ''),
          }
        ),
      ]
    },
  },
  { prop: 'scn', label: 'SCN', width: 130,},
  { prop: 'shipNameVoyage', label: '船名航次', width: 130,},
  { prop: 'rateItemName', label: '费目名称', width: 130,},
  { prop: 'numberCount', label: '数量1', width: 100, align:'right'},
  { prop: 'numberCount2', label: '数量2', width: 100, align:'right'},
  { prop: 'pieceAmount', label: '单价', width: 100,},
  { prop: 'amount', label: '金额', width: 100,},
  { prop: 'tax', label: '税率', width: 100,},
  { prop: 'taxAmount', label: '税额', width: 100,},
  { label: '发票编号', prop: 'sysInvoiceCode',width:110 },
  { label: '开票日期', prop: 'invoiceTime' ,width:100},
])
const clearData=()=>{
  tableDataShip.value=[]
  tableDataCargo.value=[]
  tableDataMisc.value=[]


}
const handleChange=val=> {
  console.log(val);
}
defineExpose({
  clearData,
  tableDataShip,
  tableDataCargo,
  tableDataMisc,
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
