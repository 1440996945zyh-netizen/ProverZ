<template>
  <div class="app-container">
    <BaseTable
      ref="baseTable"
      :showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'normalTableHeight'"
      :cellClickEvent="cellClickEvent"
      :total="total"
    />
  </div>
</template>

<script setup name="online">
import api from '@/api/system/online/index.js'
import { ElButton } from 'element-plus'
import BaseTable from '@/components/BaseTable/index.vue'
import tableParamsStore from '@/store/modules/tableParams'
import { ref } from 'vue';
const baseTable = ref() // table的ref
const { proxy } = getCurrentInstance()
const tableData = ref([]);
const total = ref(0) // 数据总数

// 获取点击行数据
const cellClickEvent = ({ row }) => {
  clickRow.value = row
}
const queryParams = ref({
  // 检索参数
});

const rowConfig = { isCurrent: true, isHover: true, height: 50, keyField: 'id' }

// header检索参数
const selectData = reactive([
  {
    name: '单位', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name1', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '货种', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name3', // 绑定字段
    span: 12, // 占位，共24
  },
])

// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '单位', min_width: 150, align: 'center' },
  { prop: 'name2', label: '项目', min_width: 120, align: 'center' },
  { prop: 'name3', label: '货种', min_width: 100, align: 'center' },
  { prop: 'name4', label: '当月车辆数', min_width: 120, align: 'center' },
  { prop: 'name5', label: '上月车辆数', min_width: 120, align: 'center' },
  { prop: 'name6', label: '环比', min_width: 100, align: 'center' },
  { prop: 'name7', label: '当月总停时', min_width: 120, align: 'center' },
  { prop: 'name8', label: '当月平均停时', min_width: 140, align: 'center' },
  { prop: 'name9', label: '上月总停时', min_width: 120, align: 'center' },
  { prop: 'name10', label: '上月平均停时', min_width: 140, align: 'center' },
  { prop: 'name11', label: '环比', min_width: 100, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '木片',
      name4: '2174',
      name5: '6027',
      name6: '-63.93%',
      name7: '2006.11',
      name8: '0.92',
      name9: '5865.77',
      name10: '0.97',
      name11: '-5.15%'
    },
    {
      id: 2,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '铁矿石',
      name4: '3456',
      name5: '2987',
      name6: '15.70%',
      name7: '3120.45',
      name8: '0.90',
      name9: '2688.30',
      name10: '0.90',
      name11: '0.00%'
    },
    {
      id: 3,
      name1: '散货码头作业公司',
      name2: '铁路(列)',
      name3: '煤炭',
      name4: '156',
      name5: '142',
      name6: '9.86%',
      name7: '1872.00',
      name8: '12.00',
      name9: '1704.00',
      name10: '12.00',
      name11: '0.00%'
    },
    {
      id: 4,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '铝矾土',
      name4: '1892',
      name5: '2156',
      name6: '-12.24%',
      name7: '1702.80',
      name8: '0.90',
      name9: '1940.40',
      name10: '0.90',
      name11: '0.00%'
    },
    {
      id: 5,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '粮食',
      name4: '892',
      name5: '756',
      name6: '18.00%',
      name7: '713.60',
      name8: '0.80',
      name9: '604.80',
      name10: '0.80',
      name11: '0.00%'
    },
    {
      id: 6,
      name1: '散货码头作业公司',
      name2: '管道(吨)',
      name3: '原油',
      name4: '45',
      name5: '38',
      name6: '18.42%',
      name7: '360.00',
      name8: '8.00',
      name9: '304.00',
      name10: '8.00',
      name11: '0.00%'
    },
    {
      id: 7,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '成品油',
      name4: '1234',
      name5: '1156',
      name6: '6.75%',
      name7: '987.20',
      name8: '0.80',
      name9: '924.80',
      name10: '0.80',
      name11: '0.00%'
    },
    {
      id: 8,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '集装箱',
      name4: '5678',
      name5: '5234',
      name6: '8.48%',
      name7: '5678.00',
      name8: '1.00',
      name9: '5234.00',
      name10: '1.00',
      name11: '0.00%'
    },
    {
      id: 9,
      name1: '散货码头作业公司',
      name2: '铁路(列)',
      name3: '钢材',
      name4: '89',
      name5: '76',
      name6: '17.11%',
      name7: '1068.00',
      name8: '12.00',
      name9: '912.00',
      name10: '12.00',
      name11: '0.00%'
    },
    {
      id: 10,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '化肥',
      name4: '2345',
      name5: '1987',
      name6: '18.02%',
      name7: '1876.00',
      name8: '0.80',
      name9: '1589.60',
      name10: '0.80',
      name11: '0.00%'
    },
    {
      id: 11,
      name1: '散货码头作业公司',
      name2: '公路(辆)',
      name3: '木材',
      name4: '678',
      name5: '789',
      name6: '-14.07%',
      name7: '610.20',
      name8: '0.90',
      name9: '710.10',
      name10: '0.90',
      name11: '0.00%'
    }
  ]

  // 如果有搜索条件，进行过滤
  let filteredData = originalData

  if (e && e.name1 && e.name1.trim() !== '') {
    const searchKeyword = e.name1.trim().toLowerCase()
    filteredData = filteredData.filter(item =>
      item.name1.toLowerCase().includes(searchKeyword)
    )
  }

  if (e && e.name3 && e.name3.trim() !== '') {
    const searchKeyword = e.name3.trim().toLowerCase()
    filteredData = filteredData.filter(item =>
      item.name3.toLowerCase().includes(searchKeyword)
    )
  }

  tableData.value = filteredData
  total.value = tableData.value.length
};

/** 下线*/
const handleOffline = row => {
  proxy.$modal
    .confirm('确定强退？')
    .then(function() {
      let userAccount = row.userAccount
      let id = row.id
      api.offLine({
        userAccount: userAccount,
        id: id
      })
    })
    .then(() => {
      getList(queryParams.value)
      proxy.$modal.msgSuccess(res.msg)
    })
    .catch(() => {})
}

/**
 * 初始化
 */
getList(queryParams.value);
</script>
