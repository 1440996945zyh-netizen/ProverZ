<template>
  <div class="formData" style="padding: 10px 10px 10px 10px">
    <div class="formData" style="padding: 5px 0px 0px 0px;height: 50px;">
      <el-row>
        <el-col :span="2" style="margin-right: 10px">
          <el-input
            placeholder="外包单位名称"
            v-model="queryParams.deptName"
            clearable>
          </el-input>
        </el-col>
        <el-col :span="3" style="margin-right: 10px">
          <el-select v-model="queryParams.workPositionCodeList" multiple placeholder="位置" >
            <el-option
              v-for="item in positionList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="2" style="margin-right: 10px">
          <el-date-picker
            v-model="queryParams.month"
            type="month"
            placeholder="结算月">
          </el-date-picker>
        </el-col>
        <el-col :span="2" style="margin-right: 10px;">
          <el-select v-model="queryParams.distributeType" clearable  placeholder="选择部门" >
            <el-option
              v-for="item in deptList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" @click="getList">查询</el-button>
        </el-col>
        <el-col :span="10" >
          <el-button type="primary" @click="exportExcel('结算单')">导出</el-button>
        </el-col>
        <el-col :span="3" style="float: right;">
          <el-button type="danger" @click="daoYunAudit('DD','0')" style="float: right;margin-left: 10px">撤销</el-button>
          <el-button type="primary" @click="daoYunAudit('DD','1')" style="float: right;margin-left: 0px">审核</el-button>
        </el-col>
      </el-row>
    </div>
    <el-table :data="tableData" :span-method="bottomSpanMethod" border style="width: 100%;margin-bottom: 8px" ref="jsdRef">
      <el-table-column prop="outwardTypeName" label="外付合同分类" width="160"/>
      <el-table-column prop="deptName" label="外包单位" width="160"/>
      <el-table-column prop="workPositionName" label="位置" width="100"/>
      <el-table-column prop="processDetailName" label="二级作业过程" width="200" key="slot"></el-table-column>
      <el-table-column prop="distributeTypeName" label="分配类型" width="160"></el-table-column>
      <el-table-column prop="workTon" label="作业量" width="150"/>
      <el-table-column prop="weightTon" label="过磅作业量" width="150"/>
      <el-table-column prop="remark" label="备注"/>
      <el-table-column prop="ddStatus" label="调度审核">
        <template #default="scope">
          <el-tag type="danger"  v-if="scope.row.ddStatus=='0'">未审核</el-tag>
          <el-tag type="success" v-if="scope.row.ddStatus=='1'">已审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="kcStatus" label="库场审核">
        <template #default="scope">
          <el-tag type="danger"  v-if="scope.row.kcStatus=='0'">未审核</el-tag>
          <el-tag type="success"  v-if="scope.row.kcStatus=='1'">已审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lzStatus" label="分配审核">
        <template #default="scope">
          <el-tag type="danger"  v-if="scope.row.lzStatus=='0'">未审核</el-tag>
          <el-tag type="success" v-if="scope.row.lzStatus=='1'">已审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="wfStatus" label="外付审核">
        <template #default="scope">
          <el-tag type="danger" v-if="scope.row.wfStatus=='0'">未审核</el-tag>
          <el-tag type="success" v-if="scope.row.wfStatus=='1'">已审核</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="waiFuTable">
import {ref, reactive, nextTick, h, onMounted, computed, getCurrentInstance, inject} from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/daoYunWeightSum/index.js'
import moment from "moment";
import FileSaver from 'file-saver'
import * as XLSX from "xlsx";
import {click} from "ol/events/condition";
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const queryParams = ref({
  deptName:'',
  distributeType:'',
  month:'',
  startDate:'',
  endDate:'',
  workPositionCodeList:[],
})
const tableData = ref([])
const positionList = ref([{
    value: '01',
    label: '前沿'
  }, {
    value: '03',
    label: '水平'
  }, {
    value: '02',
    label: '后场'
  }])
const deptList = ref([{
    value: '2',
    label: '流机队'
  }, {
    value: '3',
    label: '装卸队'
  }])


const bottomSpanMethod = ({row, column, rowIndex, columnIndex}) => {
  let list = tableData.value
  if (columnIndex === 0) {
    // 第一列合并逻辑示例
    // 判断当前行和上一行的数据是否相同，相同则合并
    if (rowIndex > 0 && list[rowIndex - 1].outwardTypeName === row.outwardTypeName ) {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
    // 计算合并的行数
    let rowspan = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].outwardTypeName == row.outwardTypeName  && list[i].outwardTypeName === row.outwardTypeName) {
        rowspan++
      } else {
        break
      }
    }
    return {
      rowspan: rowspan,
      colspan: 1,
    }
  }
}
const exportExcel = (excelName) => {
  try {
    // exportFlag.value = true;
    inject('reload')
    const wb = XLSX.utils.book_new();
    const $e1 = proxy.$refs['jsdRef'].$el;
    // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
    let $table1 = $e1.querySelector('.el-table__fixed');
    if (!$table1) {
      $table1 = $e1;
    }
    const sheet1 = XLSX.utils.table_to_sheet($table1, { raw: true });
    XLSX.utils.book_append_sheet(wb, sheet1, '结算单');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
    FileSaver.saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `${excelName}.xlsx`,
    );
  } catch (e) {
    if (typeof console !== 'undefined') console.error(e);
  } finally {
    // exportFlag.value = false;
  }
}
// 点击查询的事件
const getList = e => {
  if(queryParams.value.month != ""){
    queryParams.value.startDate = moment(queryParams.value.month).startOf('M').format('YYYY-MM-DD') + " 00:00:00";
    queryParams.value.endDate = moment(queryParams.value.month).add(1, 'months').startOf('month').format('YYYY-MM-DD') + " 00:00:00";
  }
  loading.value = true
  api.getSettlementStatistics(queryParams.value).then(res => {
    tableData.value = res.data
    total.value = res.data.totalNum
    loading.value = false
  })
}
// const exportFlag = ref(false)
/**
 * 审核
 */
const daoYunAudit=(type,value)=>{
  // tableData.value
  if(type === 'DD'){
    tableData.value.forEach(e=>e.ddStatus = value)
  } else if(type === 'KC'){
    tableData.value.forEach(e=>{
      if(e.ddStatus=='1'){
        e.kcStatus = value
      }else{
        proxy.$message.error("请先联系调度室进行调度审核后再操作");
      }
    })
  } else if(type === 'LZ'){
    tableData.value.forEach(e=>{
      if(e.kcStatus=='1'){
        e.lzStatus = value
      }else{
        proxy.$message.error("请先联系库场队进行审核后再操作");
      }
    })
  } else if(type === 'WF'){
    tableData.value.forEach(e=>{
      if(e.lzStatus=='1'){
        e.wfStatus = value
      }else{
        proxy.$message.error("请先联系流机队和装卸队进行审核");
      }
    })
  }
  api.updateSettlementStatus(tableData.value,queryParams.value.startDate).then(res=>{ })
}

const init = async () => {
  queryParams.value.month = moment().startOf('month').format('YYYY-MM-DD')
  getList(queryParams.value)
}
init();



</script>
