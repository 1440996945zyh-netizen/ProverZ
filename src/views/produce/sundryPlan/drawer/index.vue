<template>
  <div>
    <BaseTable
      ref="baseTable"
      :showSearchHeader="false"
      :tableColumns="tableColumns"
      :tableData="tableData"
      :tableHeight="'pageTableHeight'"
      :html-content="collectHtml"
      :loading="loading"
      :total="total"
    />
  </div>
  <div>
    <p>总趟数：{{ carCount }}, 总吨数：{{ tons }}</p>
  </div>
</template>

<script setup name="drawer">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/produce/vehicleTransfer/index'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import math from '../../../../utils/math'
const collectHtml = ref(`<p>Hello, <strong>Vue 3</strong>!</p>`)
const trustId = ref(null)
const carCount = ref(0)
const tons = ref(0)
const total = ref(0)
const trustCargoId = ref(null)
const loading = ref(false) // 是否加载中
// 表格数据
const tableData = ref([])
const tableColumns = ref([
  { label: '计划号', prop: 'planNo',width:150 },
  { label: '车号', prop: 'truckPlate' },
  { label: '身份证号', prop: 'idNumber',width:180 },
  { label: '皮重', prop: 'weightSelf' },
  { label: '毛重', prop: 'weightAll' },
  { label: '净重', prop: 'weightGoods' },
  { label: '一次磅时间', prop: 'weighInDt',width:180 },
  { label: '二次磅时间', prop: 'weighOutDt',width:180 },
])


// 复选框配置
const checkboxConfig = {
  highlight: true, // 选中高亮行
  strict: false, // 可以取消
  reserve: false, // 是否保留选中状态
  showHeader: true, // 是否显示全选
  checkAll: false, // 是否全选
  range: true, // 	开启复选框范围选择功能
  visibleMethod: ({}) => {
    // 返回显示的单选框
    return true
  },
  checkMethod: ({}) => {
    // 返回可选的单选框
    return true
  },
  checkRowKey: 10003, // 默认选中，需要在row.config中设置keyField
}

const checkboxList = ref([])
// 复选事件
const checkboxChangeEvent = data => {
  checkboxList.value = data.records
}
// 单选
const checkboxChange = data => {
  checkboxList.value = data
}

const setTableData = data => {
  tableData.value = data
  carCount.value=0
  tons.value = 0
  // 过滤掉weightGoods为空的数据
  // const filteredData = data.filter(item => item.weightGoods !== null);
  carCount.value = data.length;
  let a = 0
 data.forEach(item=> {
   a = math.numAdd(a, item.weightGoods);
   // 将累加结果赋值给tons.value
   tons.value = a.toFixed(2);
  })
  loading.value=false
}
const getCheckboxList = () => {
  return checkboxList.value
}

defineExpose({
  setTableData,
  getCheckboxList,
  trustId,
  trustCargoId
})

</script>
<style lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.listOperate {
  width: 100%;
  padding: 0 10px 0 0;
  justify-content: space-between;
  align-items: center;
}
</style>
