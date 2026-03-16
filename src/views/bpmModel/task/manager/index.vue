<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 14:57:27
 * @LastEditTime: 2026-03-16 15:14:03
 * @LastEditors: zhangsd
 * @Description: 任务列表页面
 * @FilePath: \view\src\views\bpmModel\task\manager\index.vue
-->

<template>
	<!-- 流程实例管理 -->
	<div class="app-container">
		<BaseTable
			ref="managerTaskTableRef"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:loading="loading"
			:tableHeight="tableHeight"
			name="managerTaskTable"
			:showPagination="true"
			:showToolBar="false"
			:showNum="5"
			defaultWidth="60"
		/>
	</div>
</template>

<script setup>
// 定义组件名称
defineOptions({
	name: 'BpmManagerTask',
})

// 导入依赖
import { ref, reactive, onMounted, onActivated, nextTick, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 组件
import BaseTable from '@/components/BaseTable/index.vue'

import { dateFormatter, formatPast2, formatDate } from '@/utils/common/date'
// API 接口
import * as TaskApi from '@/api/system/bpm/task'

import { useMessage } from '@/plugins/useMessage'
import { BPM_TASK_STATUS } from '@/utils/bpm/constantEnumeration'
import tableParamsStore from '@/store/modules/tableParams'
// 初始化全局实例
const router = useRouter()
const message = useMessage() // 消息提示实例
const managerTaskTableRef = ref(null) // BaseTable 引用

// 响应式数据
const loading = ref(false) // 列表加载状态
const total = ref(0) // 列表总条数
const tableData = ref([]) // 表格数据
const clickRow = ref({}) // 点击的当前行数据

const storeHight = computed(() => tableParamsStore().normalTableHeight)

const tableHeight = computed(() => storeHight.value - 15)
// 查询参数
const queryParams = ref({
	pageNo: 1,
	pageSize: 20,
	name: '',
	createTime: [],
})

/**
 * 搜索配置（对应原搜索栏）
 */
const selectData = reactive([
	{
		name: '流程名称', // 搜索框名称
		type: 'input', // 搜索框类型
		modelValue: 'processDefinitionName', // 绑定字段
		span: 12, // 栅格占位
		placeholder: '请输入流程名称',
	},
	{
		name: '当前任务', // 搜索框名称
		type: 'input', // 搜索框类型
		modelValue: 'name', // 绑定字段
		span: 12, // 栅格占位
		placeholder: '请输入当前任务',
	},
	// {
	// 	type: 'daterange', // 搜索框类型
	// 	modelValue: 'createTime', // 绑定字段
	// 	span: 8, // 占位，共24
	// 	name: '创建时间',
	// 	shortcuts: [],
	// },
])

/**
 * 顶部操作按钮配置（原页面无额外操作按钮，暂留空，可按需添加）
 */
const buttonList = reactive([])

/**
 * 表格列配置（对应原el-table列）
 */
const tableColumns = ref([
	{
		label: '流程名称',
		prop: 'processInstance.name',
		minWidth: 200,
		fixed: 'left',
		align: 'left',
	},

	{
		label: '流程发起人',
		prop: 'processInstance.startUser.userName',
		width: 120,
		align: 'center',
	},
	{
		label: '发起时间',
		prop: 'createTime',
		width: 200,
		align: 'center',
		formatter: (row, column, cellValue) => {
			console.log('row.row', row.row.createTime)
			return formatDate(row.row.createTime)
		},
	},
	{
		label: '当前任务',
		prop: 'name',
		minWidth: 120,
		align: 'left',
	},
	{
		label: '任务开始时间',
		prop: 'createTime',
		width: 200,
		align: 'center',
		formatter: (row, column, cellValue) => {
			return formatDate(row.row.createTime)
		},
	},
	{
		label: '任务结束时间',
		prop: 'endTime',
		width: 200,
		align: 'center',
		formatter: (row, column, cellValue) => {
			return formatDate(row.row.endTime)
		},
	},
	{
		label: '审批人',
		prop: 'assigneeUser.userName',
		width: 120,
		align: 'center',
	},
	{
		label: '审批状态',
		prop: 'status',
		width: 120,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: BPM_TASK_STATUS.find(item => item.value == row.status)?.type || 'info',
					},
					{
						default: () => BPM_TASK_STATUS.find(item => item.value == row.status)?.label || '-',
					}
				),
			]
		},
	},

	{
		label: '审批建议',
		prop: 'reason',
		width: 200,
		align: 'left',
	},
	{
		label: '耗时',
		prop: 'durationInMillis',
		width: 120,
		align: 'center',
		render: row => {
			return [h(ElTag, { type: 'primary' }, { default: () => formatPast2(row.durationInMillis) })]
		},
	},
	// {
	// 	label: '流程编号',
	// 	prop: 'processInstanceId',
	// 	minWidth: 200,
	// 	align: 'center',
	// },
	// {
	// 	label: '任务编号',
	// 	prop: 'id',
	// 	minWidth: 200,
	// 	align: 'center',
	// },

	{
		prop: '',
		label: '操作',
		width: 200,
		fixed: 'right',
		align: 'center',
		render: row => {
			const buttons = [
				h(
					ElButton,
					{
						onClick: () => handleAudit(row),
						type: 'primary',
						link: true,
						icon: 'Document',
					},
					{ default: () => '历史' }
				),
			]

			return buttons
		},
	},
])

/**
 * 查询列表数据
 * @param {Object} params 搜索参数
 */
const getList = async (params = {}) => {
	loading.value = true
	try {
		// 合并查询参数
		let pagination = managerTaskTableRef.value?.buildQueryParams()
		const query = { ...params, ...pagination }
		const res = await TaskApi.getTaskManagerPage(query)
		tableData.value = res.data.pages
		total.value = res.data.totalNum

		// 更新查询参数
		// queryParams.value = { ...query }
	loading.value = false
	} finally {
		loading.value = false
	}
	loading.value = false
}

/**
 * 审核任务
 * @param row
 */
const handleAudit = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.processInstance.id,
		},
	})
}
/**
 * 组件激活时（keep-alive 缓存后激活）
 */
onActivated(() => {
	getList()
})

/**
 * 组件挂载时
 */
onMounted(async () => {
	// 初始化查询列表
	await getList()
})
</script>

<style lang="scss" scoped></style>
