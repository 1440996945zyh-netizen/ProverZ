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
  { prop: 'name1', label: '序号', min_width: 80, align: 'center' },
  { prop: 'name2', label: '货名', min_width: 120, align: 'center' },
  { prop: 'name3', label: '单位', min_width: 80, align: 'center' },
  { prop: 'name4', label: '进港', min_width: 120, align: 'center' },
  { prop: 'name5', label: '出港', min_width: 120, align: 'center' },
  { prop: 'name6', label: '港存', min_width: 120, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    // {
    //   id: 1,
    //   name1: '1',
    //   name2: '港存合计',
    //   name3: '吨',
    //   name4: '26619.760',
    //   name5: '40382.380',
    //   name6: '1752400.004'
    // },
    // {
    //   id: 2,
    //   name1: '2',
    //   name2: '集装箱港存',
    //   name3: 'TEU',
    //   name4: '',
    //   name5: '',
    //   name6: ''
    // },
    {
      id: 1,
      name1: '1',
      name2: '铁矿石',
      name3: '吨',
      name4: '138071.600',
      name5: '12344.960',
      name6: '125726.640'
    },
    {
      id: 4,
      name1: '2',
      name2: '煤炭',
      name3: '吨',
      name4: '247233.840',
      name5: '6653.000',
      name6: '240580.840'
    },
    {
      id: 5,
      name1: '3',
      name2: '焦炭',
      name3: '吨',
      name4: '15000.000',
      name5: '0.000',
      name6: '15000.000'
    },
    {
      id: 6,
      name1: '4',
      name2: '铝矾土',
      name3: '吨',
      name4: '652899.340',
      name5: '4207.120',
      name6: '648692.220'
    },
    {
      id: 7,
      name1: '5',
      name2: '其他干散货',
      name3: '吨',
      name4: '27000.000',
      name5: '2000.000',
      name6: '25000.000'
    },
    {
      id: 8,
      name1: '6',
      name2: '干散货合计',
      name3: '吨',
      name4: '1041012.780',
      name5: '23205.080',
      name6: '1014999.700'
    },
    {
      id: 9,
      name1: '7',
      name2: '原油',
      name3: '吨',
      name4: '58000.000',
      name5: '8000.000',
      name6: '50000.000'
    },
    {
      id: 10,
      name1: '8',
      name2: '成品油',
      name3: '吨',
      name4: '46000.000',
      name5: '6000.000',
      name6: '40000.000'
    },
    {
      id: 11,
      name1: '9',
      name2: '其他油品',
      name3: '吨',
      name4: '34000.000',
      name5: '4000.000',
      name6: '30000.000'
    },
    {
      id: 12,
      name1: '10',
      name2: '油品合计',
      name3: '吨',
      name4: '138000.000',
      name5: '18000.000',
      name6: '120000.000'
    },
    {
      id: 13,
      name1: '11',
      name2: '粮食',
      name3: '吨',
      name4: '4769.320',
      name5: '3411.820',
      name6: '1357.500'
    }
  ]

  // 如果有搜索条件，进行过滤
  if (e && e.name1 && e.name1.trim() !== '') {
    const searchKeyword = e.name1.trim().toLowerCase()
    tableData.value = originalData.filter(item =>
      item.name2.toLowerCase().includes(searchKeyword)
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
