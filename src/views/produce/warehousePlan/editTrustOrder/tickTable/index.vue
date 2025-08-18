<!-- 票货表格 -->
<template>
	<BaseTable
		:showSearchHeader="true"
		:selectData="selectData"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:tableHeight="'drawerHeaderPageTableHeight'"
		:syncResize="true"
		:total="total"
		:checkbox-config="checkboxConfig"
		@checkbox-change="checkboxChange"
		:selectAllChangeEvent="selectAllChangeEvent"
	/>
</template>

<script setup name="tickTable">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick, onMounted, h, computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance() // 相当于vue2里的this
import api from '@/api/business/trustOrder/index'
//查询
const total = ref()
const getList = e => {
	const params = {
		...queryParams.value,
		...e,
	}
	api.getTicketInfo(params).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
//顶部 搜索表单
const selectData = reactive([
	{
		name: '货主',
		type: 'remoteSelect', //远程下拉框
		modelValue: 'cargoOwnerId', //对应字段
		span: 12,
		dataType: 'CUSTOMER_CARGO_OWNER',
	},
	// {
	// 	name: '货代',
	// 	type: 'remoteSelect', //远程下拉框
	// 	modelValue: 'cargoAgentId', //对应字段
	// 	span: 12,
	// 	dataType: 'CUSTOMER_CARGO_AGENT',
	// },
])
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
	companyId: null,
	tradeType: null,
})
const tableData = ref([])
const tableColumns = reactive([
	{ label: '', type: 'checkbox', width: 50 },
	{
		prop: 'cargoInfoNo',
		label: '票货号',
		minWidth: 160,
	},
	{
		prop: 'cargoName',
		label: '货名',
		width: 150,
	},
	{
		prop: 'packingName',
		label: '包装',
		width: 150,
	},
	{
		prop: 'cargoOwnerName',
		label: '货主',
		width: 200,
	},
	{
		prop: 'cargoAgentName',
		label: '货代',
		width: 200,
	},
	{
		prop: 'quantity',
		label: '件数',
		width: 150,
	},
	{
		prop: 'ton',
		label: '重量',
		width: 150,
	},
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
// 复选框选中
const checkData = ref([])
const checkboxChange = res => {
	checkData.value = res
}
const selectAllChangeEvent = res => {
	checkData.value = res.records
}

defineExpose({
	getList,
	checkData,
	queryParams,
})
</script>
