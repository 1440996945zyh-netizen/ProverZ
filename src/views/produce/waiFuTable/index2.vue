<template>
  <div class="formData" style="padding: 0px 0px">
    <SearchHeader ref="SearchHeaderRef" class="tab_header" :selectData="selectData" @searchClick="getList" :buttonList="buttonList" />

        <el-table :data="tableData"
                  :span-method="bottomSpanMethod"
                  border  scrollbar-always-on style="width: 100%;height: 500px" size="large" ref="baseTable">
          <el-table-column prop="workDate" label="日期" width="120"/>
          <el-table-column prop="className" label="班次" width="80"/>
          <el-table-column prop="processDetailName" label="作业过程" width="150" height="80" />
          <el-table-column prop="trustNo" label="计划号" width="150" height="100" />
          <el-table-column prop="workPositionName" label="位置" width="100" key="slot">
            <template #default="scope">
              <span v-if="scope.row.workPositionName=='后沿'">后场</span>
              <span v-else>{{ scope.row.workPositionName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="队别" width="140"></el-table-column>

          <el-table-column prop="cargoInfoNo" label="票货号" width="130"/>
          <el-table-column prop="allotType" label="分配类型" width="100"/>

          <el-table-column prop="frontDeptName" label="前沿" width="130"/>
          <el-table-column prop="frontEquipmentTypeName" label="机械类型" width="130"/>
          <el-table-column prop="frontWorkTon" label="前沿作业量" width="130"/>

          <el-table-column prop="backDeptName" label="后场" width="130"/>
          <el-table-column prop="backEquipmentTypeName" label="机械类型" width="130"/>
          <el-table-column prop="backWorkTon" label="后场作业量" width="130"/>

          <el-table-column prop="lineDeptName" label="水平" width="130"/>
          <el-table-column prop="lineEquipmentTypeName" label="机械类型" width="130"/>
          <el-table-column prop="lineWorkTon" label="水平作业量" width="130"/>



<!--          <el-table-column prop="allotType" label="分配类型" width="100">-->
<!--            <template #default="scope"> <span>{{ scope.row.equipmentNo }}</span> </template>-->
<!--          </el-table-column>-->
        </el-table>

<!--    <el-row style="position: absolute;  top: 1%;  z-index: 9999; width: 400px;right: 1%;gutter:20;">-->
<!--      <el-col :span="16"></el-col>-->
<!--      <el-col :span="8">-->
<!--        <el-form-item label="" prop="processId" style="margin: 5px 10px 0px 0px">-->
<!--          <div style="width: 100%">-->
<!--            <el-button type="primary" @click="exportExcel('整船调整')">导出表格</el-button>-->
<!--          </div>-->
<!--        </el-form-item>-->
<!--      </el-col>-->
<!--    </el-row>-->
  </div>
</template>

<script setup name="waiFuTable">
import { ref, reactive, nextTick, h,onMounted,computed, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/shipAdjustment/index.js'
import moment from "moment";
import SearchHeader from "@/components/SearchHeader/index.vue";
const SearchHeaderRef = ref()
const baseTable = ref() // table的ref
const detailRef = ref(null) // 明细组件ref
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数
const title = ref('')


const queryParams = ref({
  startPage: 1, pageSize: 10,
  date:[moment().startOf('M').format('YYYY-MM-DD'),moment().endOf('M').format('YYYY-MM-DD')]
}) // 检索参数
// 表格数据
const tableData = ref([])
const tableColumns = ref([])
const tableHeigt = ref(window.height-197)
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
    name: '是否完工', // 搜索框name
    type: 'select', // 搜索框类型
    modelValue: 'isWorkEnd', // 绑定字段
    span: 4, // 占位，共24
    selectData:[
      {label:'是', value: '1'},
      {label:'否', value: '0'}
    ],
  },
  {
    name: 'scn', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'scn', // 绑定字段
    span: 3, // 占位，共24
  },

  // {
  //   name: '船名航次', // 搜索框name
  //   type: 'remoteSelect', // 搜索框类型
  //   modelValue: 'shipVoyageItemId', // 绑定字段
  //   span: 8, // 占位，共24
  //   dataType: 'VOYAGE',
  // },
])
const buttonList = reactive([
  {
    label: '人员撤销', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => personnelRevocation, // 回调函数
    permission: 'produce:shipAdjustment:personnelRevocation', // 权限
  },
  {
    label: '机械撤销', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => macRevocation, // 回调函数
    permission: 'produce:shipAdjustment:macRevocation', // 权限
  },
])
const customerVisible = ref(false)

const clickRow = ref({})

const personnelRevocation=()=>{
  if(clickRow.value==null||clickRow.value==undefined||clickRow.value=={}||clickRow.value==''){
    proxy.$message.warning("请选择要撤销的数据")
  }
  api.updateShipAdjustStatus(clickRow.value.shipVoyageItemId,{allotType:3}).then(res=>{
    if (res.code == '0000') {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    } else {
      proxy.$message.error(res.msg)
    }
  })
}
const macRevocation=()=>{
  console.log(clickRow.value)
  if(clickRow.value==null||clickRow.value==undefined||clickRow.value=={}||clickRow.value==''){
    proxy.$message.warning("请选择要撤销的数据")
  }
  api.updateShipAdjustStatus(clickRow.value.shipVoyageItemId,{allotType:2}).then(res=>{
    if (res.code == '0000') {
      proxy.$message.success(res.msg)
      getList(queryParams.value)
    } else {
      proxy.$message.error(res.msg)
    }
  })
}



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
// 新增事件
const add = () => {
  customerVisible.value = true
  title.value = '新增'
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    detailRef.value.formData.id = ''
  })
}

const topCollect = ref([])
const bottomList = ref([])
// 编辑事件
const shipVoyageItemId = ref(null)
const macEdit = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  shipVoyageItemId.value = editRow.id
  customerVisible.value = true
  title.value = '编辑'
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    api.getTicketListForChange({shipVoyageItemId:editRow.id,allotType:2}).then(res => {
      if (res.code == '0000' && res.data !=null ) {
        let topCollect = res.data.topCollect
        let bottomList = res.data.bottomList
        detailRef.value.topCollect = topCollect
        detailRef.value.bottomList = bottomList
        detailRef.value.allotType = 2
        detailRef.value.exportFlag = false
      } else {
        proxy.$message.error(res.msg)
      }
    })
    // let res = getParams();
    // if (res.code == '0000' && res.data !=null ) {
    //   console.log(res.data)
    //   let topCollect = res.data.topCollect
    //   let bottomList = res.data.bottomList
    //   detailRef.value.topCollect = topCollect
    //   console.log(detailRef.value.topCollect)
    //   detailRef.value.bottomList = bottomList
    // } else {
    //   proxy.$message.error(res.msg)
    // }
  })
}
const personnelEdit = row => {
  const editRow = row || clickRow.value // 拿到所编辑行的数据
  shipVoyageItemId.value = editRow.id
  customerVisible.value = true
  title.value = '编辑'
  nextTick(() => {
    detailRef.value.resetForm() // 清空事件
    api.getTicketListForChange({shipVoyageItemId:editRow.id,allotType:3}).then(res => {
      if (res.code == '0000' && res.data !=null ) {
        let topCollect = res.data.topCollect
        let bottomList = res.data.bottomList
        detailRef.value.bottomList = bottomList
        detailRef.value.topCollect = topCollect
        detailRef.value.allotType = 3
        detailRef.value.exportFlag = false
      } else {
        proxy.$message.error(res.msg)
      }
    })
  })
}
// 删除事件
const handleDelete = row => {
  const deleteRow = row || clickRow.value // 拿到所删除行的数据
  proxy.$modal
    .confirm('确定删除？')
    .then(res => {
      api.delete(deleteRow.id).then(res => {
        if (res.code == '0000') {
          proxy.$message.success(res.msg)
          getList(queryParams.value)
        } else {
          proxy.$message.error(res.msg)
        }
      })
    })
}
// 保存事件
const save = async () => {
  proxy.$modal.confirm('确定保存?').then(res => {
    if (title.value == '编辑') {
      if(regexpTest(detailRef.value.bottomList)){
        proxy.$message.warning('请填写数字！');
        return;
      }
      api.updateTickeyDetail(shipVoyageItemId.value,detailRef.value.bottomList).then(res => {
        if (res.code == '0000') {
          proxy.$message.success(res.msg)
          getList(queryParams.value)
          customerVisible.value = false
        } else {
          proxy.$message.error(res.msg)
        }
      })
    }
  })
}

const regexpTest=(list)=>{
  let box = /^\d+(\.\d+)?$/;
  let flag = false;
  // console.log(box.test(str))
  // return box.test(str);
  for(let index in list){
    let item = list[index];
    let ton = item.ton
    if(!box.test(ton)){
      flag = true;
    }
  }
  return flag;
}
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
const init = async () => {
  nextTick(() => {
    let startTime = moment().startOf('M').format('YYYY-MM-DD');
    let endTime = moment().endOf('M').format('YYYY-MM-DD');
    proxy.$bus.emit('setInitSearchData', {
      date: [startTime, endTime],
    })
    // baseTable.value.SearchHeaderRef.searchData.isWorkEnd = '1'
    queryParams.value.date = [startTime, endTime]
    queryParams.value.isWorkEnd = 1
    getList(queryParams.value)
  })
}
init();



</script>
