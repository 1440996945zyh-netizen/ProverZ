<template>
	<div class="container">
		<!--查询条件-->
		<SearchHeader
			ref="SearchHeaderRef"
			:selectData="selectData"
			@searchClick="getList"
			:buttonList="buttonList"
			:defaultWidth="20"
			:showNum="4"
			class="search-line"
		/>

		<el-tabs v-model="activeTab" @tab-click="handleClick" class="tabs">
			<!--卷类列表-->
			<el-tab-pane label="卷类" name="roll">
				<rollTable ref="roolTableRef" />
			</el-tab-pane>

			<!--非卷类列表-->
			<el-tab-pane label="非卷类" name="notRoll">
				<notRollTable ref="notRollTableRef" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup>
import { ref, reactive, toRaw, watch, onMounted, onUnmounted } from 'vue'
import SearchHeader from '@/components/SearchHeader/index.vue'
import rollTable from './rollTable.vue'
import notRollTable from './notRollTable.vue'
import tableParamsStore from '@/store/modules/tableParams'
import api from '@/api/celoyardCargoFlow/index.js'

const activeTab = ref('notRoll')
const tableData = ref([])
const roolTableRef = ref(null)
const notRollTableRef = ref(null)
const queryParams = reactive({})
const selectData = ref([
	{
		name: '代理', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '货名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '船名', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '倒运车牌号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 6, // 占位，共24
	},
	{
		name: '库场', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '垛位', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 4, // 占位，共24
	},
	{
		name: '卷号', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'deptName', // 绑定字段
		span: 4, // 占位，共24
	},
])
// 切换标签
const handleClick = e => {
	if (e.index == '0') {
		activeTab.value = e.props.name
		//定时器模拟后端请求数据
		getList()
	} else {
		activeTab.value = e.props.name
		getList()
	}
}

//查询
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	if (activeTab.value == 'roll') {
		//卷类接口
		api.getBatchList(queryParams.value).then(res => {
			roolTableRef.value.tableData = res.data.pages
			roolTableRef.value.total.value = res.data.totalNum
		})
	} else {
		//非卷类接口
		api.getNoBatchList(queryParams.value).then(res => {
			notRollTableRef.value.tableData = res.data.pages
			notRollTableRef.value.total.value = res.data.totalNum
		})
	}
}
</script>

<style scoped lang="less">
.search-line {
	margin-left: 13px !important;
	margin-top: 20px;
}
.tabs {
	margin-left: 10px !important;
	margin-right: 20px !important;
	margin-top: -5px;
}
</style>
