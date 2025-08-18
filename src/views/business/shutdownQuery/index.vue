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
    name: '泊位', // 搜索框name
    type: 'input', // 搜索框类型
    modelValue: 'name1', // 绑定字段
    span: 24, // 占位，共24
  },
])

// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '泊位', min_width: 100, align: 'center' },
  { prop: 'name2', label: '船数', min_width: 80, align: 'center' },
  { prop: 'name3', label: '湿吨', min_width: 120, align: 'center' },
  { prop: 'name4', label: '干吨', min_width: 120, align: 'center' },
  { prop: 'name5', label: '空泊时间(天)', min_width: 140, align: 'center' },
  { prop: 'name6', label: '在泊时间(天)', min_width: 140, align: 'center' },
  { prop: 'name7', label: '手续办理时间', min_width: 140, align: 'center' },
  { prop: 'name8', label: '作业总时间(天)', min_width: 150, align: 'center' },
  { prop: 'name9', label: '有效作业时间(天)', min_width: 160, align: 'center' },
  { prop: 'name10', label: '停工时间(天)', min_width: 140, align: 'center' },
  { prop: 'name11', label: '有效利用率', min_width: 140, align: 'center' },
  { prop: 'name12', label: '泊位占用率', min_width: 140, align: 'center' },
  { prop: 'name13', label: '统计时长(天)', min_width: 140, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: 'X07',
      name2: '7',
      name3: '237078.77',
      name4: '119068.2',
      name5: '37.19',
      name6: '24.81',
      name7: '5.42',
      name8: '19.4',
      name9: '13.12',
      name10: '3.04',
      name11: '21.16%',
      name12: '40.02%',
      name13: '62'
    },
    {
      id: 2,
      name1: 'X06',
      name2: '8',
      name3: '259417.27',
      name4: '136934.38',
      name5: '32.24',
      name6: '29.76',
      name7: '7.32',
      name8: '22.43',
      name9: '17.28',
      name10: '1.42',
      name11: '27.87%',
      name12: '48%',
      name13: '62'
    },
    {
      id: 3,
      name1: 'X05',
      name2: '6',
      name3: '198543.21',
      name4: '98765.43',
      name5: '28.15',
      name6: '33.85',
      name7: '6.18',
      name8: '27.67',
      name9: '20.15',
      name10: '1.34',
      name11: '32.50%',
      name12: '54.60%',
      name13: '62'
    },
    {
      id: 4,
      name1: 'X04',
      name2: '9',
      name3: '312456.89',
      name4: '156789.12',
      name5: '25.33',
      name6: '36.67',
      name7: '8.45',
      name8: '28.22',
      name9: '22.18',
      name10: '2.59',
      name11: '35.77%',
      name12: '59.15%',
      name13: '62'
    },
    {
      id: 5,
      name1: 'X03',
      name2: '5',
      name3: '165432.56',
      name4: '82345.67',
      name5: '35.42',
      name6: '26.58',
      name7: '4.89',
      name8: '21.69',
      name9: '16.23',
      name10: '1.57',
      name11: '26.18%',
      name12: '42.87%',
      name13: '62'
    },
    {
      id: 6,
      name1: 'X02',
      name2: '10',
      name3: '345678.90',
      name4: '172839.45',
      name5: '22.18',
      name6: '39.82',
      name7: '9.12',
      name8: '30.70',
      name9: '25.34',
      name10: '2.24',
      name11: '40.87%',
      name12: '64.23%',
      name13: '62'
    },
    {
      id: 7,
      name1: 'X01',
      name2: '4',
      name3: '123456.78',
      name4: '61728.39',
      name5: '40.25',
      name6: '21.75',
      name7: '3.67',
      name8: '18.08',
      name9: '13.45',
      name10: '1.18',
      name11: '21.69%',
      name12: '35.08%',
      name13: '62'
    },
    {
      id: 8,
      name1: 'Y01',
      name2: '12',
      name3: '456789.12',
      name4: '228394.56',
      name5: '18.95',
      name6: '43.05',
      name7: '10.23',
      name8: '32.82',
      name9: '28.15',
      name10: '1.44',
      name11: '45.40%',
      name12: '69.44%',
      name13: '62'
    },
    {
      id: 9,
      name1: 'Y02',
      name2: '3',
      name3: '98765.43',
      name4: '49382.72',
      name5: '45.33',
      name6: '16.67',
      name7: '2.89',
      name8: '13.78',
      name9: '10.23',
      name10: '0.66',
      name11: '16.50%',
      name12: '26.89%',
      name13: '62'
    },
    // {
    //   id: 10,
    //   name1: '',
    //   name2: '64',
    //   name3: '2098818.93',
    //   name4: '1049409.96',
    //   name5: '',
    //   name6: '',
    //   name7: '',
    //   name8: '',
    //   name9: '',
    //   name10: '',
    //   name11: '31.19%',
    //   name12: '50.43%',
    //   name13: '62'
    // }
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
