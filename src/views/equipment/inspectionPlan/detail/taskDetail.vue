<template>
  <div>
    <BaseTable
	  	ref="baseTable"
	  	:showSearchHeader="false"
	  	:tableColumns="tableColumns"
	  	:tableData="tableData"
	  	:total="total"
      :tableHeight="'pageTableHeight'"
	  />
  </div>
</template>

<script setup>
import { ref, reactive, watch, getCurrentInstance, onMounted, toRefs, nextTick } from 'vue'
import api from '@/api/equipment/inspectionPlan/index'
import publicApi from '@/api/public/index'
import Select from '@/components/Select'
import BaseTable from '@/components/BaseTable/index.vue'

const total = ref(0)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const tableColumns = reactive([
  { label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '设备名称', prop: 'equipName', },
	{ label: '开始日期', prop: 'startDate',  },
	{ label: '结束日期', prop: 'endDate', },
])
const equipPlanId = ref(null)

// 查询主列表
const getList = e => {
  queryParams.value.equipPlanId = equipPlanId.value
  api.getTaskDetail(queryParams.value).then(res => {
    tableData.value = res.data.pages 
    total.value = res.data.totalNum
  })
}
defineExpose({
	getList,
  equipPlanId
})
</script>

<style>

</style>