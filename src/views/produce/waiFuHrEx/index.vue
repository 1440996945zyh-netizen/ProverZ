<template>
  <div class="formData" style="padding: 0px 0px">
    <SearchHeader ref="SearchHeaderRef" class="tab_header" :showNum="3" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

    <el-table ref="tableRef" :data="tableData"
              virtual-scroll
              :span-method="bottomSpanMethod"
              border  scrollbar-always-on style="width: 100%;height: 700px;margin-left: 0.5%" size="large" >
      <el-table-column align="center" prop="status" label="当前状态" width="130" height="80" />

      <el-table-column prop="workDate" label="日期" width="130" height="80" />
      <el-table-column prop="className" label="班次" width="150" height="80" />
      <el-table-column prop="processName" label="作业过程" width="150" height="80" />
      <el-table-column prop="scn" label="SCN" show-overflow-tooltip width="150" height="80" />
      <el-table-column prop="shipvoyage" label="船名航次" show-overflow-tooltip width="150" height="80" />
      <el-table-column prop="packingName" label=包装 width="150" height="80" />
      <el-table-column prop="trustNo" label="通知单编号" width="150" height="100" />

      <el-table-column prop="cargoInfoNo" show-overflow-tooltip label="票货号" width="200"/>
      <el-table-column prop="cargoName" show-overflow-tooltip label="货名" width="200"/>
      <el-table-column prop="packingNameWaiBao" show-overflow-tooltip label="外包合同分类" width="200"/>
      <el-table-column prop="ticketTon" show-overflow-tooltip label="作业量" width="200"/>
      <el-table-column prop="allotType" label="分配类型" width="100"/>
      <el-table-column prop="processDetailName" show-overflow-tooltip label="二级作业过程" width="150" height="80" />

      <el-table-column prop="workPositionName" label="位置" width="130"/>
      <el-table-column prop="deptName" label="作业班组" width="130"/>
      <el-table-column prop="equipmentTypeName" label="机械类型" width="130"/>
      <el-table-column prop="workTon" label="作业量" width="130"/>

      <!--          <el-table-column prop="otherDeptName" label="其他" width="130"/>-->
      <!--          <el-table-column prop="otherEquipmentTypeName" label="机械类型" width="130"/>-->
      <!--          <el-table-column prop="otherWorkTon" label="其他作业量" width="130"/>-->

    </el-table>

  </div>
</template>

<script setup name="waiFuHrEx">
import {ref, reactive, nextTick, h, onMounted, computed, getCurrentInstance, inject} from 'vue'
import {ElButton, ElTag} from 'element-plus'

const {proxy} = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/shipAdjustment/index.js'
import waiFupHrExApi from '@/api/produce/waiFuHrEx/index.js'
import moment from "moment";
import SearchHeader from "@/components/SearchHeader/index.vue";
import * as XLSX from "xlsx";

const SearchHeaderRef = ref()
const baseTable = ref() // table的ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
import FileSaver from 'file-saver'

const queryParams = ref({
  startPage: 1, pageSize: 10,
  date: [moment().startOf('M').format('YYYY-MM-DD'), moment().endOf('M').format('YYYY-MM-DD')]
}) // 检索参数
// 表格数据
const tableData = ref([])
const selectData = reactive([
  {
    // name: '起止日期',
    type: 'month',
    modelValue: 'niceTime', //对应字段
    span: 12,
  },
  {
    name: '部门',
    type: 'select',
    prop: 'deptId', // 便于赋值
    modelValue: 'deptId',
    modelLabel: 'deptName',
    span: 6,
    dataConfig: {
      url: '/api/external/WaiFuExController/getDepts',
    },
  },
  {
    name: '审核状态', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'status', // 绑定字段
    span: 6, // 占位，共24
    selectData: [
      {
        value: '10',
        label: '待审核',
      },
      {
        value: '20',
        label: '生产已审核',
      },
      {
        value: '30',
        label: 'Hr已审核',
      }
    ]
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 3, // 占位，共24
  },
    {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 3, // 占位，共24
  },
])
const buttonList = reactive([
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => hrEx, // 回调函数
    permission: 'produce:waiFuHrEx:prdEx', // 权限

  }, {
    label: '销审', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => hrExV, // 回调函数
    permission: 'produce:waiFuHrEx:prdExV', // 权限

  },  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => exportExcel, // 回调函数
    permission: 'produce:waiFuHrEx:exportExcel', // 权限

  }
])
const customerVisible = ref(false)

const clickRow = ref({})

const hrEx= async ()=>{
  console.log(queryParams);
  let date = queryParams.value.date
  queryParams.value.startTime = queryParams.value.niceTime.length>7?queryParams.value.niceTime:queryParams.value.niceTime+"-01"
  queryParams.value.exFlag='1'
  await waiFupHrExApi.hrEx(queryParams.value).then(res => {
    tableData.value = res.data
    total.value = res.data.totalNum
    loading.value = false
  })
  getList(queryParams.value)
}

const hrExV= async ()=>{
  let date = queryParams.value.date
  loading.value = true
  queryParams.value.startTime = queryParams.value.niceTime.length>7?queryParams.value.niceTime:queryParams.value.niceTime+"-01"
  queryParams.value.exFlag='1'
  await waiFupHrExApi.hrExV(queryParams.value).then(res => {
    tableData.value = res.data
    total.value = res.data.totalNum
    loading.value = false
  })
  getList(queryParams.value)
}

// 点击查询的事件
const getList = e => {
  let date = queryParams.value.date
  let isWorkEnd = queryParams.value.isWorkEnd
  queryParams.value = e
  queryParams.value.startTime = queryParams.value.niceTime.length>7?queryParams.value.niceTime:queryParams.value.niceTime+"-01"
  queryParams.value.isWorkEnd = queryParams.value.isWorkEnd ? queryParams.value.isWorkEnd : isWorkEnd
  loading.value = true
  queryParams.value.exFlag='1'
  if(e.status == 30){
    api.getWfHrNewTable(queryParams.value).then(res => {
      tableData.value = res.data
      total.value = res.data.totalNum
      loading.value = false
    })
  }else {
    api.getWorkTiccketTable(queryParams.value).then(res => {
      tableData.value = res.data
      total.value = res.data.totalNum
      loading.value = false
    })
  }
}
// 导出文件流
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
/*const exportExcel = () => {
  let date = queryParams.value.date
  let isWorkEnd = queryParams.value.isWorkEnd
  queryParams.value.startTime = queryParams.value.date ? queryParams.value.date[0] : date?date[0]:''
  queryParams.value.endTime = queryParams.value.date ? queryParams.value.date[1] : date?date[1]:''
  queryParams.value.isWorkEnd = queryParams.value.isWorkEnd?queryParams.value.isWorkEnd:isWorkEnd
  loading.value = true
  if(queryParams.value.date && queryParams.value.date!=null && queryParams.value.date!=undefined){
    queryParams.value.startTime = queryParams.value.date[0]
    queryParams.value.endTime = queryParams.value.date[1]
  }
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res,queryParams.value.startTime+'-'+queryParams.value.endTime +"外付基础报表")
  })
}*/
const exportFlag = ref(false)

const exportExcel = (excelName) => {
  //excelName --设置导出的excel名称
  //report-table --对应的要导出的el-table的ref名称
  excelName = queryParams.value.startTime + '-' + queryParams.value.endTime + "外付基础报表"
  try {
    exportFlag.value = true;
    inject('reload')
    const wb = XLSX.utils.book_new();

    const $e1 = proxy.$refs['tableRef'].$el;
    // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
    let $table1 = $e1.querySelector('.el-table__fixed');
    if (!$table1) {
      $table1 = $e1;
    }

    // const $e2 = proxy.$refs['mingxiRef'].$el;
    // // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
    // let $table2 = $e2.querySelector('.el-table__fixed');
    // if (!$table2) {
    //   $table2 = $e2;
    // }

    // $(".table tr td").each(function (index, el) {
    //   if ($(proxy).find('input').length) {
    //     // 存在 input
    //     $(proxy).find('input').attr('value', $(proxy).find('input').val());
    //   }
    // })

    const sheet1 = XLSX.utils.table_to_sheet($table1, {raw: true});
    // const sheet2 = XLSX.utils.table_to_sheet($table2, { raw: true });

    XLSX.utils.book_append_sheet(wb, sheet1, '汇总');
    // XLSX.utils.book_append_sheet(wb, sheet2, '明细');

    // const workbookBlob = workbook2blob(wb);
    // openDownloadDialog(workbookBlob, '收件人列表.xlsx');

    // 为了返回单元格原始字符串，设置{ raw: true }
    // const wb = XLSX.utils.table_to_book($table1, { raw: true });
    const wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'});
    FileSaver.saveAs(
      new Blob([wbout], {type: 'application/octet-stream'}),
      `${excelName}.xlsx`,
    );

    // const $e = proxy.$refs['huizongRef'].$el;
    // // 如果表格加了fixed属性，则导出的文件会生产两份一样的数据，所以可在这里判断一下
    // let $table = $e.querySelector('.el-table__fixed');
    // if (!$table) {
    //   $table = $e;
    // }
    // // 为了返回单元格原始字符串，设置{ raw: true }
    // const wb = XLSX.utils.table_to_book($table, { raw: true });
    // const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
    // FileSaver.saveAs(
    //   new Blob([wbout], { type: 'application/octet-stream' }),
    //   `${excelName}.xlsx`,
    // );
    //
    // XLSX.utils.table_to_sheet()
    // const sheet1 = XLSX.utils.json_to_sheet(sheetData1);
    // // 支持多 sheet
    // // const sheet2 = XLSX.utils.json_to_sheet(sheetData2);
    // // const sheet3 = XLSX.utils.json_to_sheet(sheetData3);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, sheet1, '收件人列表');
    // // 支持多 sheet
    // // XLSX.utils.book_append_sheet(wb, sheet2, '表格 sheet2');
    // // XLSX.utils.book_append_sheet(wb, sheet2, '表格 sheet2');
    // const workbookBlob = workbook2blob(wb);
    // // 导出最后的总表
    // openDownloadDialog(workbookBlob, '收件人列表.xlsx');
  } catch (e) {
    if (typeof console !== 'undefined') console.error(e);
  } finally {
    exportFlag.value = false;
  }

}

// 编辑事件
const shipVoyageItemId = ref(null)

const bottomSpanMethod = ({row, column, rowIndex, columnIndex}) => {
  let list = tableData.value
  // 自定义合并规则
  if (columnIndex === 11) {
    // 第一列合并逻辑示例
    // 判断当前行和上一行的数据是否相同，相同则合并
    if (rowIndex > 0 && list[rowIndex - 1].workTicketId + '_' === row.workTicketId + '_') {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
    // 计算合并的行数
    let rowspan = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].workTicketId + "_" == row.workTicketId + '_') {
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

// 获取点击行数据
const cellClickEvent = ({row}) => {
  clickRow.value = row
}
const init = async () => {
  nextTick(() => {
    let niceTime =moment().endOf('M').format('YYYY-MM')
    SearchHeaderRef.value.searchData.niceTime = niceTime
    SearchHeaderRef.value.searchData.status = '20'
    queryParams.value.status = '20'
    queryParams.value.niceTime = niceTime
    getList(queryParams.value)
  })
}
init();


</script>
