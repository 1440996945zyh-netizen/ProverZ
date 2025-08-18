<template>
  <div class="formData" style="padding: 0px 0px">
    <BaseTable
      ref="SearchHeaderRef"
      :showSearchHeader="true"
      :border="true"
      :selectData="selectData"
      :searchClick="getList"
      :buttonList="buttonList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :cellClickEvent="cellClickEvent"
      @checkbox-change="checkboxChangeEvent"
      :checkbox-config="checkboxConfig"
      :selectAllChangeEvent="selectAllChangeEvent"
    />
  </div>
</template>

<script setup name="waiFuTable">
import {ref, reactive, nextTick, h, onMounted, computed, getCurrentInstance, inject} from 'vue'
import { ElButton, ElTag } from 'element-plus'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/daoYunWeightSum/index.js'
import moment from "moment";
import SearchHeader from "@/components/SearchHeader/index.vue";
import BaseTable from "@/components/BaseTable/index.vue";
import {click} from "ol/events/condition";
import EditTable from "@/components/EditTable/index.vue";
const SearchHeaderRef = ref()
const loading = ref(false) // 是否加载中
const total = ref('') // 数据总数

const queryParams = ref({
  startPage: 1, pageSize: 10,
  date:[moment().startOf('M').format('YYYY-MM-DD'),moment().endOf('M').format('YYYY-MM-DD')]
}) // 检索参数
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  // { label: '', type: 'checkbox', width: 50 },
  // { label: '序号', type: 'seq', width: 50,align: 'center' },
  { label: '作业区域', prop: 'portName', align: 'center', min_width: 150 },
  { label: '船名航次', prop: 'shipVoyageName', align: 'left', min_width: 100 },
  { label: '到港编号', prop: 'scn', align: 'left', min_width: 100 },
  { label: '通知单号', prop: 'trustNo', align: 'left', min_width: 100 },
  { label: '货名', prop: 'cargoName', align: 'left', min_width: 100 },
  { label: '外付货物类别', prop: 'outwardTypeName', align: 'left', min_width: 100 },
  { label: '包装', prop: 'packingName', align: 'left', width: 80 },
  { label: '内外贸', prop: 'tradeType', align: 'left', width: 100 },
  { label: '外包单位名称', prop: 'deptName', align: 'left', min_width: 100 },
  { label: '倒运过磅量', prop: 'ton', align: 'left', min_width: 100 },
  {
    prop: 'kcStatus',
    label: '库场审核状态',
    min_width: 100,
    align: 'center',
    render: row => {
      let typeFlag = row.kcStatus == "1"?'success':'danger'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.kcStatus === "1"?"审核":"未审核",
          }
        ),
      ]
    },
  },
  {
    prop: 'ddStatus',
    label: '调度审核状态',
    min_width: 100,
    align: 'center',
    render: row => {
      let typeFlag = row.ddStatus == "1"?'success':'danger'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.ddStatus === "1"?"审核":"未审核",
          }
        ),
      ]
    },
  },
  {
    prop: 'wfStatus',
    label: '外付审核状态',
    min_width: 100,
    align: 'center',
    render: row => {
      let typeFlag = row.wfStatus == "1"?'success':'danger'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.wfStatus === "1"?"审核":"未审核",
          }
        ),
      ]
    },
  },
  {
    prop: 'hrStatus',
    label: 'HR审核状态',
    min_width: 100,
    align: 'center',
    render: row => {
      let typeFlag = row.hrStatus == "1"?'success':'danger'
      return [
        h(
          ElTag,
          {
            type: typeFlag,
          },
          {
            default: () => row.hrStatus === "1"?"审核":"未审核",
          }
        ),
      ]
    },
  },

])


const selectData = reactive([
  {
    // name: '起止日期',
    type: 'daterange',
    modelValue: 'date', //对应字段
    span: 12,
    shortcuts: [
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
    ],
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'shipName', // 绑定字段
    span: 6, // 占位，共24
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
])
const buttonList = reactive([
  {
    label: '库场审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('KC','1'), // 回调函数
    permission: 'produce:daoYunWeightSum:kuChangAudit', // 权限
  },
  {
    label: '库场撤销审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('KC','0'), // 回调函数
    permission: 'produce:daoYunWeightSum:kuChangAudit', // 权限
  },
  {
    label: '调度审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('DD','1'), // 回调函数
    permission: 'produce:daoYunWeightSum:diaoDuAudit', // 权限
  },
  {
    label: '调度撤销审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('DD','0'), // 回调函数
    permission: 'produce:daoYunWeightSum:diaoDuAudit', // 权限
  },
  {
    label: '审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('WF','1'), // 回调函数
    permission: 'produce:daoYunWeightSum:waiBaoAudit', // 权限
  },
  {
    label: '撤销', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('WF','0'), // 回调函数
    permission: 'produce:daoYunWeightSum:waiBaoAudit', // 权限
  },
  {
    label: 'HR审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('HR','1'), // 回调函数
    permission: 'produce:daoYunWeightSum:hrChangAudit', // 权限
  },
  {
    label: 'HR撤销审核', // 按钮名称
    type: 'primary', // 按钮类型
    click: () => daoYunAudit('HR','0'), // 回调函数
    permission: 'produce:daoYunWeightSum:hrChangAudit', // 权限
  },
])
const clickRow = ref({})
// 点击查询的事件
const getList = e => {
  let date = queryParams.value.date
  let isWorkEnd = queryParams.value.isWorkEnd
  queryParams.value = e
  queryParams.value.startDate = queryParams.value.date ? queryParams.value.date[0] : date?date[0]:''
  queryParams.value.endDate = queryParams.value.date ? queryParams.value.date[1] : date?date[1]:''
  queryParams.value.isWorkEnd = queryParams.value.isWorkEnd?queryParams.value.isWorkEnd:isWorkEnd
  loading.value = true
  if(queryParams.value.date && queryParams.value.date!=null && queryParams.value.date!=undefined){
    queryParams.value.startDate = queryParams.value.date[0] + " 08:00:00"
    queryParams.value.endDate = queryParams.value.date[1] + " 08:00:00"
  }
  api.getDaoYunWeightTable(queryParams.value).then(res => {
    tableData.value = res.data
    total.value = res.data.totalNum
    loading.value = false
  })
}
const exportFlag = ref(false)

// 编辑事件
const shipVoyageItemId = ref(null)
// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}
const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  // console.log('选中数据：', data)
  checkboxList.value = data
  // console.log('选中数据：', checkboxList.value)
}

const selectAllChangeEvent = ({checked}) => {
  // if(checked){
  //   checkboxList.value = tableData.value
  // }else{

  // }
  checkboxList.value = checked ? tableData.value : []
}


/**
 * 审核
 */
const daoYunAudit=(type,value)=>{
  // tableData.value
  if(type === 'KC'){
    tableData.value.forEach(e=>e.kcStatus = value)
  } else if(type === 'DD'){
    tableData.value.forEach(e=>e.ddStatus = value)
  } else if(type === 'WF'){
    tableData.value.forEach(e=>{
      if(e.kcStatus == '1' && e.ddStatus == '1'){
        e.wfStatus = value
      } else if(e.kcStatus == '0' && e.ddStatus == '0'){
        proxy.$message.warning('需要库场和调度审核后才能审核')
        return;
      } else if(e.kcStatus == '0'){
        proxy.$message.warning('库场审核后才能审核')
        return;
      } else if(e.ddStatus == '0'){
        proxy.$message.warning('调度审核后才能审核')
        return;
      }else{
        proxy.$message.warning('需要库场和调度审核后才能审核')
        return;
      }
    })
  }else if(type === 'HR'){
    tableData.value.forEach(e=>{
      if(e.wfStatus == '1' ){
        e.hrStatus = value
      } else{
        proxy.$message.warning('外付审核后才能审核')
        return;
      }

    })
  }
  api.updateDaoYunWeightStatus(tableData.value,queryParams.value.startDate).then(res=>{ getList(queryParams.value)})
}

const init = async () => {
  nextTick(() => {
    let startDate = moment().startOf('M').format('YYYY-MM-DD') ;
    let endDate = moment().add(1, 'months').startOf('month').format('YYYY-MM-DD') ;
    SearchHeaderRef.value.SearchHeaderRef.searchData.date = [startDate, endDate]
    queryParams.value.date = [startDate, endDate]
    getList(queryParams.value)
  })
}
init();



</script>
