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
    name: '货名', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name1', // 绑定字段
    span: 24, // 占位，共24
  },
])
// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '货名', min_width: 200, align: 'center' },
  // { prop: 'name2', label: '山港大类', min_width: 120, align: 'center' },
  // { prop: 'name3', label: '山港子类', min_width: 120, align: 'center' },
  // { prop: 'name4', label: '政府一级货类', min_width: 140, align: 'center' },
  // { prop: 'name5', label: '政府二级货类', min_width: 140, align: 'center' },
  { prop: 'name6', label: '单位', min_width: 80, align: 'center' },
  { prop: 'name7', label: '集疏港类型', min_width: 120, align: 'center' },
  { prop: 'name8', label: '运输类型', min_width: 100, align: 'center' },
  { prop: 'name9', label: '当日数量', min_width: 120, align: 'center' },
  { prop: 'name10', label: '车数', min_width: 100, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: '铁矿(巴西混合粉)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '1431.460',
      name10: '45'
    },
    {
      id: 2,
      name1: '铁矿(PB粉)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '集港',
      name8: '公路',
      name9: '927.020',
      name10: '29'
    },
    {
      id: 3,
      name1: '铁矿(精粉)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '381.580',
      name10: '12'
    },
    {
      id: 4,
      name1: '铁矿(巴混)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '4382.800',
      name10: '139'
    },
    {
      id: 5,
      name1: '铁矿(球团)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '集港',
      name8: '公路',
      name9: '5105.280',
      name10: '160'
    },
    {
      id: 6,
      name1: '铁矿(特卡粉)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '31.580',
      name10: '1'
    },
    {
      id: 7,
      name1: '铁矿(高硅巴粗)',
      name2: '干散货',
      name3: '铁矿石',
      name4: '金属矿石',
      name5: '铁矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '85.240',
      name10: '3'
    },
    {
      id: 8,
      name1: '铝矾土',
      name2: '干散货',
      name3: '铝矾土',
      name4: '金属矿石',
      name5: '铝矿石',
      name6: '吨',
      name7: '集港',
      name8: '公路',
      name9: '3642.040',
      name10: '119'
    },
    {
      id: 9,
      name1: '铝矾土',
      name2: '干散货',
      name3: '铝矾土',
      name4: '金属矿石',
      name5: '铝矿石',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '565.080',
      name10: '17'
    },
    {
      id: 10,
      name1: '煤炭(动力煤)',
      name2: '干散货',
      name3: '煤炭',
      name4: '煤炭及制品',
      name5: '煤炭',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '1686.960',
      name10: '55'
    },
    {
      id: 11,
      name1: '煤炭',
      name2: '干散货',
      name3: '煤炭',
      name4: '煤炭及制品',
      name5: '煤炭',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '1472.000',
      name10: '45'
    },
    {
      id: 12,
      name1: '煤炭',
      name2: '干散货',
      name3: '煤炭',
      name4: '煤炭及制品',
      name5: '煤炭',
      name6: '吨',
      name7: '疏港',
      name8: '公路',
      name9: '1441.140',
      name10: '44'
    }
  ]

  // 如果有搜索条件，进行过滤
  if (e && e.name1 && e.name1.trim() !== '') {
    const searchKeyword = e.name1.trim().toLowerCase()
    tableData.value = originalData.filter(item =>
      item.name1.toLowerCase().includes(searchKeyword)
    )
  } else {
    // 没有搜索条件时显示全部数据
    tableData.value = originalData
  }

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
