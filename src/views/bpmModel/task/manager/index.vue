<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 14:57:27
 * @LastEditTime: 2025-12-23 15:17:30
 * @LastEditors: zhangsd
 * @Description: 任务列表页面
 * @FilePath: \view\src\views\bpmModel\task\manager\index.vue
-->
<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 11:10:21
 * @LastEditTime: 2025-12-23 11:13:32
 * @LastEditors: zhangsd
 * @Description: 流程实例管理
 * @FilePath: \view\src\views\bpmModel\processInstance\manager\index.vue
-->

<template>
	<!-- 流程实例管理 -->
	<div class="app-container">
		<BaseTable
			ref="baseTableRef"
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
const baseTableRef = ref(null) // BaseTable 引用

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
	pageSize: 10,
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
		modelValue: 'name', // 绑定字段
		span: 8, // 栅格占位
		placeholder: '请输入流程名称',
	},
	{
		type: 'daterange', // 搜索框类型
		modelValue: 'createTime', // 绑定字段
		span: 8, // 占位，共24
		name: '创建时间',
		shortcuts: [],
	},
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
		align: 'center',
	},

	{
		label: '流程发起人',
		prop: 'startUser.nickname',
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
		align: 'center',
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
		prop: 'assigneeUser.nickname',
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
		align: 'center',
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
	{
		label: '流程编号',
		prop: 'processInstanceId',
		minWidth: 200,
		align: 'center',
	},
	{
		label: '任务编号',
		prop: 'id',
		minWidth: 200,
		align: 'center',
	},

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
const getList = async (params = queryParams.value) => {
	loading.value = true
	try {
		// 合并查询参数
		// const query = { ...queryParams.value, ...params }
		//  const data = await TaskApi.getTaskManagerPage(queryParams)
		// list.value = data.list
		// total.value = data.total
		tableData.value = [
			{
				id: '5148f021-dcae-11f0-b9e4-00ff3e31cab8',
				name: 'HR审批',
				createTime: 1766130169463,
				endTime: 1766130396648,
				durationInMillis: 227185,
				status: 2,
				reason: '通过 有病就去治',
				ownerUser: null,
				assigneeUser: {
					id: 114,
					nickname: 'hr 小姐姐',
					avatar: null,
					deptId: null,
					deptName: null,
				},
				taskDefinitionKey: 'Activity_0hq637b',
				processInstanceId: '3fa5193f-dcae-11f0-b9e4-00ff3e31cab8',
				processInstance: {
					id: '3fa5193f-dcae-11f0-b9e4-00ff3e31cab8',
					name: '通用表单',
					createTime: null,
					processDefinitionId: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
					summary: [
						{
							key: '结束时间',
							value: '2025-12-19',
						},
						{
							key: '请假类型',
							value: '20',
						},
						{
							key: '请假原因',
							value: '有病',
						},
					],
					startUser: {
						id: 104,
						nickname: '测试号',
						avatar: null,
						deptId: 107,
						deptName: null,
					},
				},
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
			{
				id: '3fa651d6-dcae-11f0-b9e4-00ff3e31cab8',
				name: '部门领导审批',
				createTime: 1766130139877,
				endTime: 1766130169317,
				durationInMillis: 29440,
				status: 2,
				reason: '通过',
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_10dxbm6',
				processInstanceId: '3fa5193f-dcae-11f0-b9e4-00ff3e31cab8',
				processInstance: {
					id: '3fa5193f-dcae-11f0-b9e4-00ff3e31cab8',
					name: '通用表单',
					createTime: null,
					processDefinitionId: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
					summary: [
						{
							key: '结束时间',
							value: '2025-12-19',
						},
						{
							key: '请假类型',
							value: '20',
						},
						{
							key: '请假原因',
							value: '有病',
						},
					],
					startUser: {
						id: 104,
						nickname: '测试号',
						avatar: null,
						deptId: 107,
						deptName: null,
					},
				},
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
			{
				id: '16f265b3-dcae-11f0-b9e4-00ff3e31cab8',
				name: '部门领导审批',
				createTime: 1766130071588,
				endTime: 1766130097814,
				durationInMillis: 26226,
				status: 4,
				reason: '系统自动取消',
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_10dxbm6',
				processInstanceId: '16f0defc-dcae-11f0-b9e4-00ff3e31cab8',
				processInstance: {
					id: '16f0defc-dcae-11f0-b9e4-00ff3e31cab8',
					name: '通用表单',
					createTime: null,
					processDefinitionId: 'common-form:3:07c8b6aa-dcae-11f0-b9e4-00ff3e31cab8',
					summary: [
						{
							key: '结束时间',
							value: '2025-12-19',
						},
						{
							key: '请假类型',
							value: '10',
						},
						{
							key: '请假原因',
							value: '有事请假',
						},
					],
					startUser: {
						id: 104,
						nickname: '测试号',
						avatar: null,
						deptId: 107,
						deptName: null,
					},
				},
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
			{
				id: 'f9a75f43-dfac-11f0-bc4a-00ff3e31cab8',
				name: '部门领导审批',
				createTime: 1766459446395,
				endTime: null,
				durationInMillis: null,
				status: 1,
				reason: null,
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_10dxbm6',
				processInstanceId: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
				processInstance: {
					id: 'f98de4bd-dfac-11f0-bc4a-00ff3e31cab8',
					name: '通用表单',
					createTime: null,
					processDefinitionId: 'common-form:4:3493d8be-dcae-11f0-b9e4-00ff3e31cab8',
					summary: [
						{
							key: '结束时间',
							value: '2025-12-24',
						},
						{
							key: '请假类型',
							value: '10',
						},
						{
							key: '请假原因',
							value: '',
						},
					],
					startUser: {
						id: 1,
						nickname: '芋道源码',
						avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
						deptId: 103,
						deptName: null,
					},
				},
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
			{
				id: 'cea636cf-dca1-11f0-b9e4-00ff3e31cab8',
				name: '经理审批',
				createTime: 1766124796330,
				endTime: null,
				durationInMillis: null,
				status: 1,
				reason: null,
				ownerUser: null,
				assigneeUser: {
					id: 1,
					nickname: '芋道源码',
					avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
					deptId: 103,
					deptName: '研发部门',
				},
				taskDefinitionKey: 'Activity_027dk1j',
				processInstanceId: 'cea43ae7-dca1-11f0-b9e4-00ff3e31cab8',
				processInstance: {
					id: 'cea43ae7-dca1-11f0-b9e4-00ff3e31cab8',
					name: 'test',
					createTime: null,
					processDefinitionId: 'test:3:7a40d609-dca1-11f0-b9e4-00ff3e31cab8',
					summary: [
						{
							key: '输入框',
							value: '12412',
						},
						{
							key: '多行输入框',
							value: '1424',
						},
						{
							key: '多选框',
							value: '[1]',
						},
					],
					startUser: {
						id: 1,
						nickname: '芋道源码',
						avatar: 'http://test.yudao.iocoder.cn/20250921/avatar_1758423875594.png',
						deptId: 103,
						deptName: null,
					},
				},
				parentTaskId: null,
				children: null,
				formId: null,
				formName: null,
				formConf: null,
				formFields: null,
				formVariables: null,
				buttonsSetting: null,
				signEnable: null,
				reasonRequire: null,
				nodeType: null,
			},
		]
		total.value = tableData.value.length
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
		query: {
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

<style lang="scss" scoped>
</style>