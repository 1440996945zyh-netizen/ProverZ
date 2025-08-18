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
  { prop: 'name1', label: '货名', min_width: 220,align: 'center',},
  { prop: 'name2', label: '单位', min_width: 220,align: 'center',},
  { prop: 'name3', label: '当日数量', min_width: 220,align: 'center', },
  { prop: 'name4', label: '月累计',min_width: 220,align: 'center', },
  { prop: 'name5', label: '年累计',min_width: 220,align: 'center',},
  // {
  //   prop: '',
  //   label: '操作',
  //   align: 'center',
  //   width: 100,
  //   fixed: 'right',
  //   render: row => {
  //     return [h(
  //       ElButton,
  //       {
  //         onClick: () => {
  //           handleOffline(row)
  //         },
  //         type: 'danger',
  //         link: true,
  //         icon: 'Delete',
  //         permission: 'system:online:offline', // 权限
  //       },
  //       {
  //         default: () => '强退'
  //       }
  //     )]
  //   },
  // },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: '焦末',
      name2: '万吨',
      name3: '1.953810',
      name4: '146.733847',
      name5: '1100.519964'
    },
    {
      id: 2,
      name1: '粉煤灰',
      name2: '万吨',
      name3: '1.953810',
      name4: '26.817381',
      name5: '209.279330'
    },
    {
      id: 3,
      name1: '炉渣',
      name2: '万吨',
      name3: '1.353210',
      name4: '24.814313',
      name5: '200.009821'
    },
    {
      id: 4,
      name1: '聚丙烯PPH-Y45',
      name2: '万吨',
      name3: '2.231220',
      name4: '24.814313',
      name5: '200.009821'
    },
    {
      id: 5,
      name1: '聚乙烯5831D-GD',
      name2: '万吨',
      name3: '2.231220',
      name4: '24.814313',
      name5: '200.009821'
    },
    {
      id: 6,
      name1: '丁二酸',
      name2: '万吨',
      name3: '0.501200',
      name4: '29.146016',
      name5: '191.707474'
    },
    {
      id: 7,
      name1: '铁矿石',
      name2: '万吨',
      name3: '0.501200',
      name4: '0.601116',
      name5: '4.174600'
    },
    {
      id: 8,
      name1: '转水铁矿石',
      name2: '万吨',
      name3: '1.234567',
      name4: '28.544900',
      name5: '176.701200'
    },
    {
      id: 9,
      name1: '煤炭',
      name2: '万吨',
      name3: '3.456789',
      name4: '1.387900',
      name5: '85.109323'
    },
    {
      id: 10,
      name1: '外进煤炭',
      name2: '万吨',
      name3: '2.123456',
      name4: '15.678901',
      name5: '5.780000'
    },
    {
      id: 11,
      name1: '焦炭',
      name2: '万吨',
      name3: '1.987654',
      name4: '45.123456',
      name5: '320.456789'
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
