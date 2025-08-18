<template>
  <div class="app-container">
    <div class="selectBox">
      <div></div>
      <div>
        <el-button type="primary" icon="Search" @click="getList">刷新</el-button>
        <el-button type="primary" @click="exportExcel">导出</el-button>
      </div>
    </div>
    <BaseTable
			ref="BaseTableRef"
			:showSearchHeader="false"
			:tableColumns="tableColumns"
			:selectData="selectData"
			:tableData="tableData"
    />
  </div>
</template>
<script setup name="yardEfficiency">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/report/yardEfficiency/index'
import {ref} from "vue";


// 列表
const tableData = ref([])
const tableColumns = reactive([
  {
    label: '堆场编号',
    prop: 'yardNo',
  },
  {
    label: '堆场面积(㎡)',
    prop: 'yardArea',
  },
  {
    label: '已用面积(㎡)',
    prop: 'useArea',
  },
  {
    label: '货种',
    prop: 'cargoCategoryName',
  },
  {
    label: '占用比例%',
    prop: 'ratio',
  },
])
const queryParams = ref({
})
const exportExcel =()=>{
  api.exportExcel(queryParams.value).then(res => {
    downLoadBlob(res, '堆场利用率')
  })
}
const downLoadBlob = (file, filename) => {
  let blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.setAttribute('download', filename)
  a.click()
  document.body.removeChild(a)
}
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data
		total.value = res.data.totalNum
 })
}
const init = async () => {
  getList(queryParams.value)
}
// 初始化
init()
</script>
<style  lang="scss" scoped>
@import '@/assets/styles/formData.scss';
.selectBox {
  display: flex;
  justify-content: space-between;
  align-content: center;
  height: 40px;
  margin: 8px 0;
  padding-right: 5px;
  .left {
    width: 0%;
  }
  .right {
    width: 100%;
    justify-content: flex-end;
  }
}
.app-container {
	height: auto !important;
}
</style>
