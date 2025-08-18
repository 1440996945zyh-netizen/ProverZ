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
  // {
  //   name: '所属月份', // 搜索框name
  //   type: 'input', // 搜索框类型
  //   modelValue: 'name1', // 绑定字段
  //   span: 12, // 占位，共24
  // },
  {
    name: '项目', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name2', // 绑定字段
    span: 24, // 占位，共24
  },
])

// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '所属月份', min_width: 120, align: 'center' },
  { prop: 'name2', label: '项目', min_width: 180, align: 'center' },
  { prop: 'name3', label: '当月总停时(天)', min_width: 140, align: 'center' },
  { prop: 'name4', label: '当月总艘次', min_width: 120, align: 'center' },
  { prop: 'name5', label: '当月平均停时', min_width: 140, align: 'center' },
  { prop: 'name6', label: '上月总停时(天数)', min_width: 140, align: 'center' },
  { prop: 'name7', label: '上月总艘次', min_width: 120, align: 'center' },
  { prop: 'name8', label: '上月平均停时', min_width: 140, align: 'center' },
  { prop: 'name9', label: '环比', min_width: 100, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: '2025-06',
      name2: '平均在港停时',
      name3: '16.62',
      name4: '3',
      name5: '5.54',
      name6: '27.34',
      name7: '5',
      name8: '5.47',
      name9: '1.00%'
    },
    {
      id: 2,
      name1: '2025-06',
      name2: '平均在泊停时',
      name3: '7.86',
      name4: '3',
      name5: '2.62',
      name6: '16.82',
      name7: '5',
      name8: '3.36',
      name9: '-22.00%'
    },
    {
      id: 3,
      name1: '2025-06',
      name2: '平均船前停时',
      name3: '0.23',
      name4: '3',
      name5: '0.08',
      name6: '1.22',
      name7: '5',
      name8: '0.24',
      name9: '-67.00%'
    },
    {
      id: 4,
      name1: '2025-06',
      name2: '平均船后停时',
      name3: '0.74',
      name4: '3',
      name5: '0.25',
      name6: '3.19',
      name7: '5',
      name8: '0.64',
      name9: '-61.00%'
    },
    {
      id: 5,
      name1: '2025-06',
      name2: '平均在泊非生产停时',
      name3: '1.31',
      name4: '3',
      name5: '0.44',
      name6: '1.08',
      name7: '5',
      name8: '0.22',
      name9: '100.00%'
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

  if (e && e.name2 && e.name2.trim() !== '') {
    const searchKeyword = e.name2.trim().toLowerCase()
    filteredData = filteredData.filter(item =>
      item.name2.toLowerCase().includes(searchKeyword)
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
