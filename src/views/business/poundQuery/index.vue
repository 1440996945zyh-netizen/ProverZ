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
    name: '磅单号', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name1', // 绑定字段
    span: 12, // 占位，共24
  },
  {
    name: '船名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name2', // 绑定字段
    span: 12, // 占位，共24
  },
])

// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '磅单号', min_width: 120, align: 'center' },
  { prop: 'name2', label: '船名', min_width: 120, align: 'center' },
  { prop: 'name3', label: '航次', min_width: 100, align: 'center' },
  { prop: 'name4', label: 'SCN', min_width: 100, align: 'center' },
  { prop: 'name5', label: '进港时间', min_width: 140, align: 'center' },
  { prop: 'name6', label: '出港时间', min_width: 140, align: 'center' },
  { prop: 'name7', label: '时长', min_width: 100, align: 'center' },
  { prop: 'name8', label: '毛重', min_width: 100, align: 'center' },
  { prop: 'name9', label: '皮重', min_width: 100, align: 'center' },
  { prop: 'name10', label: '净重', min_width: 100, align: 'center' },
  { prop: 'name11', label: '货物名称', min_width: 120, align: 'center' },
  { prop: 'name12', label: '车号', min_width: 120, align: 'center' },
  { prop: 'name13', label: '贸别', min_width: 100, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: 'PD202407001',
      name2: '海洋之星',
      name3: 'V2024-001',
      name4: 'SCN001',
      name5: '2024-07-01 08:30',
      name6: '2024-07-01 16:45',
      name7: '8小时15分',
      name8: '1250.50',
      name9: '45.20',
      name10: '1205.30',
      name11: '铁矿石',
      name12: '鲁A12345',
      name13: '进口'
    },
    {
      id: 2,
      name1: 'PD202407002',
      name2: '东方明珠',
      name3: 'V2024-002',
      name4: 'SCN002',
      name5: '2024-07-02 09:15',
      name6: '2024-07-02 18:20',
      name7: '9小时5分',
      name8: '1380.75',
      name9: '48.30',
      name10: '1332.45',
      name11: '煤炭',
      name12: '鲁B67890',
      name13: '出口'
    },
    {
      id: 3,
      name1: 'PD202407003',
      name2: '海王星',
      name3: 'V2024-003',
      name4: 'SCN003',
      name5: '2024-07-03 10:00',
      name6: '2024-07-03 17:30',
      name7: '7小时30分',
      name8: '1120.80',
      name9: '42.15',
      name10: '1078.65',
      name11: '铝矾土',
      name12: '鲁C24680',
      name13: '进口'
    },
    {
      id: 4,
      name1: 'PD202407004',
      name2: '太平洋号',
      name3: 'V2024-004',
      name4: 'SCN004',
      name5: '2024-07-04 07:45',
      name6: '2024-07-04 15:20',
      name7: '7小时35分',
      name8: '1560.25',
      name9: '52.80',
      name10: '1507.45',
      name11: '原油',
      name12: '鲁D13579',
      name13: '进口'
    },
    {
      id: 5,
      name1: 'PD202407005',
      name2: '远洋之星',
      name3: 'V2024-005',
      name4: 'SCN005',
      name5: '2024-07-05 11:30',
      name6: '2024-07-05 19:45',
      name7: '8小时15分',
      name8: '1420.60',
      name9: '46.90',
      name10: '1373.70',
      name11: '成品油',
      name12: '鲁E97531',
      name13: '出口'
    },
    {
      id: 6,
      name1: 'PD202407006',
      name2: '海神号',
      name3: 'V2024-006',
      name4: 'SCN006',
      name5: '2024-07-06 08:20',
      name6: '2024-07-06 16:10',
      name7: '7小时50分',
      name8: '1180.40',
      name9: '44.60',
      name10: '1135.80',
      name11: '粮食',
      name12: '鲁F86420',
      name13: '进口'
    },
    {
      id: 7,
      name1: 'PD202407007',
      name2: '蓝海号',
      name3: 'V2024-007',
      name4: 'SCN007',
      name5: '2024-07-07 09:45',
      name6: '2024-07-07 18:15',
      name7: '8小时30分',
      name8: '1320.90',
      name9: '47.25',
      name10: '1273.65',
      name11: '铁矿石',
      name12: '鲁G75319',
      name13: '进口'
    },
    {
      id: 8,
      name1: 'PD202407008',
      name2: '星辰号',
      name3: 'V2024-008',
      name4: 'SCN008',
      name5: '2024-07-08 10:15',
      name6: '2024-07-08 17:40',
      name7: '7小时25分',
      name8: '1480.35',
      name9: '50.10',
      name10: '1430.25',
      name11: '煤炭',
      name12: '鲁H15937',
      name13: '出口'
    },
    {
      id: 9,
      name1: 'PD202407009',
      name2: '海天号',
      name3: 'V2024-009',
      name4: 'SCN009',
      name5: '2024-07-09 07:30',
      name6: '2024-07-09 15:50',
      name7: '8小时20分',
      name8: '1250.80',
      name9: '45.50',
      name10: '1205.30',
      name11: '铝矾土',
      name12: '鲁I24680',
      name13: '进口'
    },
    {
      id: 10,
      name1: 'PD202407010',
      name2: '海洋号',
      name3: 'V2024-010',
      name4: 'SCN010',
      name5: '2024-07-10 11:00',
      name6: '2024-07-10 19:30',
      name7: '8小时30分',
      name8: '1380.45',
      name9: '48.75',
      name10: '1331.70',
      name11: '原油',
      name12: '鲁J86420',
      name13: '进口'
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
