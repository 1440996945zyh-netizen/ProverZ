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
  // {
  //   name: '年份', // 搜索框name
  //   type: 'date', // 搜索框类型
  //   modelValue: 'year', // 绑定字段
  //   span: 12, // 占位，共24
  //   dateType: 'year', // 日期类型为年份
  //   valueFormat: 'YYYY', // 值格式为年份
  //   placeholder: '选择年份'
  // },
])
// 表格表头参数
const tableColumns = reactive([
  { prop: 'name1', label: '序号', min_width: 80, align: 'center' },
  { prop: 'name2', label: '货名', min_width: 200, align: 'center' },
  { prop: 'name3', label: '单位', min_width: 100, align: 'center' },
  { prop: 'name4', label: '一月', min_width: 120, align: 'center' },
  { prop: 'name5', label: '二月', min_width: 120, align: 'center' },
  { prop: 'name6', label: '三月', min_width: 120, align: 'center' },
  { prop: 'name7', label: '四月', min_width: 120, align: 'center' },
  { prop: 'name8', label: '五月', min_width: 120, align: 'center' },
  { prop: 'name9', label: '六月', min_width: 120, align: 'center' },
  { prop: 'name10', label: '七月', min_width: 120, align: 'center' },
  { prop: 'name11', label: '八月', min_width: 120, align: 'center' },
  { prop: 'name12', label: '九月', min_width: 120, align: 'center' },
  { prop: 'name13', label: '十月', min_width: 120, align: 'center' },
  { prop: 'name14', label: '十一月', min_width: 120, align: 'center' },
  { prop: 'name15', label: '十二月', min_width: 120, align: 'center' },
])

/*** 查询列表 */
const getList = e => {
  queryParams.value = e

  // 原始数据
  const originalData = [
    {
      id: 1,
      name1: '1',
      name2: '粉煤灰',
      name3: '万吨',
      name4: '145.319154',
      name5: '116.780944',
      name6: '170.242303',
      name7: '154.649946',
      name8: '153.561139',
      name9: '213.232632',
      name10: '146.733847',
      name11: '158.456789',
      name12: '162.123456',
      name13: '175.987654',
      name14: '168.543210',
      name15: '180.234567',
      year: '2024'
    },
    {
      id: 2,
      name1: '2',
      name2: '煅后焦(1000KG/袋)',
      name3: '万吨',
      name4: '22.791285',
      name5: '31.775421',
      name6: '28.477317',
      name7: '16.707124',
      name8: '48.049729',
      name9: '34.661075',
      name10: '26.817381',
      name11: '32.456789',
      name12: '28.123456',
      name13: '35.987654',
      name14: '30.543210',
      name15: '38.234567',
      year: '2024'
    },
    {
      id: 3,
      name1: '3',
      name2: '锂辉石(件)',
      name3: '万吨',
      name4: '15.234567',
      name5: '12.345678',
      name6: '18.456789',
      name7: '16.567890',
      name8: '14.678901',
      name9: '20.789012',
      name10: '17.890123',
      name11: '19.901234',
      name12: '21.012345',
      name13: '22.123456',
      name14: '20.234567',
      name15: '23.345678',
      year: '2024'
    },
    {
      id: 4,
      name1: '4',
      name2: '石油焦',
      name3: '万吨',
      name4: '8.123456',
      name5: '6.234567',
      name6: '9.345678',
      name7: '7.456789',
      name8: '6.567890',
      name9: '10.678901',
      name10: '8.789012',
      name11: '9.890123',
      name12: '10.901234',
      name13: '11.012345',
      name14: '9.123456',
      name15: '12.234567',
      year: '2024'
    },
    {
      id: 5,
      name1: '5',
      name2: '铁矿(纽曼块)',
      name3: '万吨',
      name4: '5.234567',
      name5: '4.345678',
      name6: '6.456789',
      name7: '4.567890',
      name8: '5.678901',
      name9: '7.789012',
      name10: '5.890123',
      name11: '6.901234',
      name12: '6.012345',
      name13: '7.123456',
      name14: '5.234567',
      name15: '8.345678',
      year: '2024'
    },
    {
      id: 6,
      name1: '6',
      name2: '铁矿石',
      name3: '万吨',
      name4: '34.505800',
      name5: '22.145900',
      name6: '30.812500',
      name7: '21.715300',
      name8: '23.440488',
      name9: '29.941470',
      name10: '29.146016',
      name11: '31.456789',
      name12: '28.123456',
      name13: '32.987654',
      name14: '30.543210',
      name15: '33.234567',
      year: '2024'
    },
    {
      id: 7,
      name1: '7',
      name2: '圆钢',
      name3: '万吨',
      name4: '2.123456',
      name5: '1.234567',
      name6: '2.345678',
      name7: '1.456789',
      name8: '1.567890',
      name9: '3.573484',
      name10: '0.601116',
      name11: '2.789012',
      name12: '1.890123',
      name13: '2.901234',
      name14: '1.012345',
      name15: '3.123456',
      year: '2024'
    },
    {
      id: 8,
      name1: '8',
      name2: '盘元',
      name3: '万吨',
      name4: '31.207900',
      name5: '20.915900',
      name6: '28.819400',
      name7: '19.709400',
      name8: '21.635700',
      name9: '25.868000',
      name10: '28.544900',
      name11: '29.456789',
      name12: '26.123456',
      name13: '30.987654',
      name14: '28.543210',
      name15: '31.234567',
      year: '2024'
    },
    {
      id: 9,
      name1: '9',
      name2: '煤炭',
      name3: '万吨',
      name4: '27.401923',
      name5: '9.641800',
      name6: '8.260300',
      name7: '10.505400',
      name8: '7.184400',
      name9: '20.727600',
      name10: '1.387900',
      name11: '12.456789',
      name12: '15.123456',
      name13: '18.987654',
      name14: '14.543210',
      name15: '16.234567',
      year: '2024'
    },
    {
      id: 10,
      name1: '10',
      name2: '脱硫石膏',
      name3: '万吨',
      name4: '1.234567',
      name5: '0.345678',
      name6: '2.000000',
      name7: '0.456789',
      name8: '1.940000',
      name9: '1.840000',
      name10: '0.567890',
      name11: '1.678901',
      name12: '1.789012',
      name13: '2.890123',
      name14: '1.901234',
      name15: '2.012345',
      year: '2024'
    },
    {
      id: 11,
      name1: '11',
      name2: '焦炭',
      name3: '万吨',
      name4: '8.123456',
      name5: '6.234567',
      name6: '7.345678',
      name7: '8.456789',
      name8: '7.567890',
      name9: '9.678901',
      name10: '8.789012',
      name11: '9.890123',
      name12: '8.901234',
      name13: '10.012345',
      name14: '9.123456',
      name15: '10.234567',
      year: '2024'
    },
    {
      id: 12,
      name1: '12',
      name2: '铝矾土',
      name3: '万吨',
      name4: '15.211400',
      name5: '12.940900',
      name6: '15.644000',
      name7: '19.434800',
      name8: '24.369900',
      name9: '35.257000',
      name10: '19.491100',
      name11: '22.456789',
      name12: '25.123456',
      name13: '28.987654',
      name14: '24.543210',
      name15: '27.234567',
      year: '2024'
    },
    {
      id: 13,
      name1: '13',
      name2: '石膏粉(500KG/袋)',
      name3: '万吨',
      name4: '3.123456',
      name5: '2.234567',
      name6: '3.345678',
      name7: '4.456789',
      name8: '5.567890',
      name9: '6.678901',
      name10: '4.789012',
      name11: '5.890123',
      name12: '6.901234',
      name13: '7.012345',
      name14: '5.123456',
      name15: '6.234567',
      year: '2024'
    },
    {
      id: 14,
      name1: '14',
      name2: '锰矿',
      name3: '万吨',
      name4: '5.123456',
      name5: '4.234567',
      name6: '6.345678',
      name7: '5.456789',
      name8: '4.567890',
      name9: '7.678901',
      name10: '6.789012',
      name11: '7.890123',
      name12: '8.901234',
      name13: '9.012345',
      name14: '7.123456',
      name15: '8.234567',
      year: '2024'
    }
  ]

  // 如果有搜索条件，进行过滤
  let filteredData = originalData

  if (e && e.name1 && e.name1.trim() !== '') {
    const searchKeyword = e.name1.trim().toLowerCase()
    filteredData = filteredData.filter(item =>
      item.name2.toLowerCase().includes(searchKeyword)
    )
  }

  if (e && e.year && e.year !== '') {
    filteredData = filteredData.filter(item => item.year === e.year)
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
