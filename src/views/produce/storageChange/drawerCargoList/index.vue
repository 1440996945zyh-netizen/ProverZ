<template>
	<!-- 票货明细 -->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
      :selectData="selectData"
      :searchClick="getList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
      :tableHeight="490"
      :total="total"
    />
	</div>
</template>

<script setup name="drawerCargoList">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/produce/storageChange/index.js'
import { ref, reactive, toRefs } from 'vue'
const { proxy } = getCurrentInstance()

const total = ref(0)
const drawerRef = ref(null) // 明细组件ref
const clickRow = ref({}) //点击当前行
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	massId: '',
})
const selectData = reactive([
  {
    name: '票货号',
    type: 'input', //远程下拉框
    modelValue: 'cargoInfoNo', //对应字段
    span: 8,
  },
  {
    name: '船名航次',
    type: 'remoteSelect', //远程下拉框
    modelValue: 'shipvoyageItemId', //对应字段
    span: 8,
    dataType: 'VOYAGE',
  },
])
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '票货明细', prop: 'cargoInfoLabel', align: 'center',width:570},
	{ label: '件数', prop: 'quantity', align: 'center',width:70 },
	{ label: '重量', prop: 'ton', align: 'center',width:90 },
	{ label: '场地', prop: 'storehouseName', align: 'center',width:110 },
	{ label: '区域', prop: 'regionName', align: 'center',width:90 },
	{ label: '垛位', prop: 'massName', align: 'center',width:90 },
	{ label: '作业公司', prop: 'companyName', align: 'center',width:190 },
	{ label: '船名_航次', prop: 'shipNameVoyage', align: 'center',width:120 },
])

// 获取点击行数据
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}
// 点击查询的事件
const getList = e => {
  queryParams.value = Object.assign(queryParams.value, e)
	clickRow.value = null;
	api.listPortStorage(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
defineExpose({
	queryParams,
	clickRow,
	getList
})
</script>
<style lang="less" scoped>
// @import "../../../assets/styles/searchform.scss";
</style>
