<template>
	<BaseTable
		ref="baseTable"
		:showSearchHeader="false"
		:selectData="selectData"
		:tableHeight="tableHeight"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:cellClickEvent="cellClickEvent"
		:total="total"
		:defaultWidth="40"
	/>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive } from 'vue'
import api from '@/api/system/scheduleTask.js'
const { proxy } = getCurrentInstance()
const total = ref(0)
const tableHeight = ref(window.innerHeight - 260)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
	jobName: '',
	jobGroup: '',
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '任务名称', prop: 'jobName', width: 150 },
	{ label: '任务所在组', prop: 'jobGroup', width: 150 },
	{ label: '请求类型', prop: 'requestType', width: 100 },
	{ label: '请求url', prop: 'httpUrl', width: 700 },
	{ label: '请求参数', prop: 'httpParams', width: 150 },
	{ label: '执行时间', prop: 'createTime', width: 150, align: 'center' },
	{ label: '结果', prop: 'result', minWidth: 300, align: 'left' },
])
const selectData = reactive([
	// {
	// 	name: '任务名称', // 搜索框name
	// 	type: 'input', // 搜索框类型
	// 	modelValue: 'jobName', // 绑定字段
	// 	span: 8, // 占位，共24
	// },
	// {
	// 	name: '任务组名称', // 搜索框name
	// 	type: 'input', // 搜索框类型
	// 	modelValue: 'jobGroup', // 绑定字段
	// 	span: 8, // 占位，共24
	// },
	// {
	// 	name: '任务状态',
	// 	type: 'select',
	// 	modelValue: 'status',
	// 	span: 8,
	// 	selectData: [
	// 		{ label: '暂停', value: '0' },
	// 		{ label: '开启', value: '1' },
	// 	],
	// },
])

// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.getJobLogs(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// getList(queryParams.value)
defineExpose({
	tableData,
	getList,
	tableHeight,
	total,
	queryParams,
})
</script>
<style lang="less" scoped></style>
