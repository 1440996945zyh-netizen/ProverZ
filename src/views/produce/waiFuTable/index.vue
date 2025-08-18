<template>
  <div class="formData" style="padding: 0px 0px">
    <SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

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

<script setup name="waiFuTable">
import {ref, reactive, nextTick, h, onMounted, computed, getCurrentInstance, inject} from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/shipAdjustment/index.js'
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
  date:[moment().startOf('M').format('YYYY-MM-DD'),moment().endOf('M').format('YYYY-MM-DD')]
}) // 检索参数
// 表格数据
const tableData = ref([])
const selectData = reactive([
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 12,
    shortcuts: [
      {
        text: '上周',
        value: () => {
          const currentTimestamp = Date.now()
          const currentDate = new Date(currentTimestamp)
          // 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
          const currentDayOfWeek = currentDate.getDay()
          // 计算上周的起始日期和结束日期的时间戳
          const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
          const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
          const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
          const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
          return [lastWeekStartDate, lastWeekEndDate]
        },
      },
      {
        text: '本周',
        value: () => {
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取本周的起始日期和结束日期
          const thisWeekStartDate = new Date(currentDate)
          thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
          const thisWeekEndDate = new Date(currentDate)
          thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
          return [thisWeekStartDate, thisWeekEndDate]
        },
      },
      {
        text: '下周',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          const currentDayOfWeek = currentDate.getDay()
          // 获取下周的起始日期和结束日期
          const nextWeekStartDate = new Date(currentDate)
          nextWeekStartDate.setDate(currentDate.getDate() + (8 - currentDayOfWeek))
          const nextWeekEndDate = new Date(currentDate)
          nextWeekEndDate.setDate(currentDate.getDate() + (14 - currentDayOfWeek))
          return [nextWeekStartDate, nextWeekEndDate]
        },
      },
      {
        text: '上月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上个月的起始日期和结束日期
          const lastMonthStartDate = new Date(currentDate)
          lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

          const lastMonthEndDate = new Date(currentDate)
          lastMonthEndDate.setDate(0)
          return [lastMonthStartDate, lastMonthEndDate]
        },
      },
      {
        text: '本月',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本月的起始日期和结束日期
          const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentMonthStartDate, currentMonthEndDate]
        },
      },
      {
        text: '下月',
        value: () => {
          const currentDate = new Date()
          // 获取下月的起始日期和结束日期
          const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
          const nextMonthEndDate = new Date(nextMonthStartDate.getFullYear(), nextMonthStartDate.getMonth() + 1, 0)
          return [nextMonthStartDate, nextMonthEndDate]
        },
      },
      {
        text: '上季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取上季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
          const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
          return [lastQuarterStartDate, lastQuarterEndDate]
        },
      },
      {
        text: '本季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取本季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
          const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
          return [currentQuarterStartDate, currentQuarterEndDate]
        },
      },
      {
        text: '下季',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 获取下季度的起始日期和结束日期
          const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
          const nextQuarter = currentQuarter === 3 ? 0 : currentQuarter + 1 // 下季度
          const nextQuarterStartDate = new Date(currentDate.getFullYear(), nextQuarter * 3, 1)
          const nextQuarterEndDate = new Date(
            new Date(nextQuarterStartDate.getFullYear(), nextQuarterStartDate.getMonth() + 3, 1) - 1
          )
          return [nextQuarterStartDate, nextQuarterEndDate]
        },
      },
      {
        text: '去年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算去年的起始日期和结束日期
          const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
          const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
          return [lastYearStartDate, lastYearEndDate]
        },
      },
      {
        text: '今年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算今年的起始日期和结束日期
          const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
          const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
          return [currentYearStartDate, currentYearEndDate]
        },
      },
      {
        text: '明年',
        value: () => {
          // 获取当前日期
          const currentDate = new Date()
          // 计算明年的起始日期和结束日期
          const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1)
          const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31)
          return [nextYearStartDate, nextYearEndDate]
        },
      },
    ],
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 6, // 占位，共24
  },
  {
    name: '航次', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'voyage', // 绑定字段
    span: 6, // 占位，共24
  },
  {
    name: '是否水平',
    type: 'select',
    modelValue: 'isShuiPing',
    span: 3,
    selectData: [
      {label:'是',value:'1'},
      {label:'否',value:'0'},
    ],
  },
  {
    name: '部门',
    type: 'select',
    prop: 'deptId', // 便于赋值
    modelValue: 'deptId',
    modelLabel: 'deptName',
    span: 3,
    dataConfig: {
      url: '/api/external/WaiFuExController/getDepts',
    },
  },
  {
    name: 'scn', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'scn', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '通知单编号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'trustNo', // 绑定字段
    span: 3, // 占位，共24
  },
  {
    name: '货名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 3, // 占位，共24
  },
 {
    name: '货名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'cargoName', // 绑定字段
    span: 3, // 占位，共24
  },

])
const buttonList = reactive([
  {
    label: '导出', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => exportExcel, // 回调函数
    permission: 'produce:waiFuTable:exportExcel', // 权限

  }
])
const customerVisible = ref(false)

const clickRow = ref({})

// 点击查询的事件
const getList = e => {
  let date = queryParams.value.date
  let isWorkEnd = queryParams.value.isWorkEnd
  queryParams.value = e
  queryParams.value.startTime = queryParams.value.date ? queryParams.value.date[0] : date?date[0]:''
  queryParams.value.endTime = queryParams.value.date ? queryParams.value.date[1] : date?date[1]:''
  queryParams.value.isWorkEnd = queryParams.value.isWorkEnd?queryParams.value.isWorkEnd:isWorkEnd
  loading.value = true
  if(queryParams.value.date && queryParams.value.date!=null && queryParams.value.date!=undefined){
    queryParams.value.startTime = queryParams.value.date[0]
    queryParams.value.endTime = queryParams.value.date[1]
  }
  api.getWorkTiccketTable(queryParams.value).then(res => {
    tableData.value = res.data
    total.value = res.data.totalNum
    loading.value = false
  })
}
// 导出文件流
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
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
  excelName = queryParams.value.startTime+'-'+queryParams.value.endTime +"外付基础报表"
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

    const sheet1 = XLSX.utils.table_to_sheet($table1, { raw: true });
    // const sheet2 = XLSX.utils.table_to_sheet($table2, { raw: true });

    XLSX.utils.book_append_sheet(wb, sheet1, '汇总');
    // XLSX.utils.book_append_sheet(wb, sheet2, '明细');

    // const workbookBlob = workbook2blob(wb);
    // openDownloadDialog(workbookBlob, '收件人列表.xlsx');

    // 为了返回单元格原始字符串，设置{ raw: true }
    // const wb = XLSX.utils.table_to_book($table1, { raw: true });
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' });
    FileSaver.saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
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

const bottomSpanMethod = ({row, column, rowIndex, columnIndex})=>{
  let list = tableData.value
  // 自定义合并规则
  if (columnIndex === 11) {
    // 第一列合并逻辑示例
    // 判断当前行和上一行的数据是否相同，相同则合并
    if (rowIndex > 0 && list[rowIndex - 1].workTicketId+'_'=== row.workTicketId+'_') {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
    // 计算合并的行数
    let rowspan = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].workTicketId+"_" == row.workTicketId+'_') {
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
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
const init = async () => {
  nextTick(() => {
    let startTime = moment().startOf('M').format('YYYY-MM-DD');
    let endTime = moment().endOf('M').format('YYYY-MM-DD');
    // proxy.$bus.emit('setInitSearchData', {
    //   date: [startTime, endTime],
    // })
    SearchHeaderRef.value.searchData.date = [startTime, endTime]
    // SearchHeaderRef.value.searchData.packingName = '散'
    queryParams.value.date = [startTime, endTime]
    // queryParams.value.packingName = '散'
    getList(queryParams.value)
  })
}
init();



</script>
