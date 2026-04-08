<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 11:10:21
 * @LastEditTime: 2026-03-16 17:18:26
 * @LastEditors: zhangsd
 * @Description: 审批中心
 * @FilePath: \view\src\views\bpmModel\processInstance\index.vue
-->
<template>
	<div class="app-container">
		<!-- Tab 页签 -->
		<el-tabs v-model="activeTab" class="main-tabs" @tab-click="handleTabClick">
			<el-tab-pane name="todo" label="待办任务">
				<!-- 待办任务表格 -->
				<BaseTable
					ref="todoTaskTableRef"
					:showSearchHeader="true"
					:selectData="selectDataTodo"
					:searchClick="getListTodo"
					:buttonList="buttonListTodo"
					:tableColumns="tableColumnsTodo"
					:tableData="tableDataTodo"
					:cellClickEvent="cellClickEventTodo"
					:rowConfig="rowConfig"
					:tableHeight="tableHeight"
					name="todoTaskTable"
					:defaultWidth="15"
					:loading="loadingTodo"
					:total="totalTodo"
				/>
			</el-tab-pane>

			<el-tab-pane name="done" label="已办任务">
				<!-- 已办任务表格 -->
				<BaseTable
					ref="doneTaskTableRef"
					:showSearchHeader="true"
					:selectData="selectDataDone"
					:searchClick="getListDone"
					:buttonList="buttonListDone"
					:tableColumns="tableColumnsDone"
					:tableData="tableDataDone"
					:cellClickEvent="cellClickEventDone"
					:rowConfig="rowConfig"
					:tableHeight="tableHeight"
					name="doneTaskTable"
					:loading="loadingDone"
					:showPagination="true"
					:defaultWidth="30"
					:total="totalDone"
				/>
			</el-tab-pane>

			<el-tab-pane name="copy" label="抄送我的">
				<!-- 抄送我的表格 -->
				<BaseTable
					ref="copyTaskTableRef"
					:showSearchHeader="true"
					:selectData="selectDataCopy"
					:searchClick="getListCopy"
					:buttonList="buttonListCopy"
					:tableColumns="tableColumnsCopy"
					:tableData="tableDataCopy"
					:cellClickEvent="cellClickEventCopy"
					:rowConfig="rowConfig"
					:tableHeight="tableHeight"
					name="copyTaskTable"
					:loading="loadingCopy"
					:showPagination="true"
					:defaultWidth="40"
					:total="totalCopy"
				/>
			</el-tab-pane>
			<el-tab-pane name="myProcess" label="我的流程">
				<!-- 我的流程表格 -->
				<BaseTable
					ref="myProcessTableRef"
					:showSearchHeader="true"
					:selectData="selectDataMyProcess"
					:searchClick="getListMyProcess"
					:buttonList="buttonListMyProcess"
					:tableColumns="tableColumnsMyProcess"
					:tableData="tableDataMyProcess"
					:cellClickEvent="cellClickEventMyProcess"
					:rowConfig="rowConfig"
					:tableHeight="tableHeight"
					name="instanceTable"
					:loading="loadingMyProcess"
					:showPagination="true"
					:showToolBar="false"
					:defaultWidth="30"
					:total="totalMyProcess"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, onActivated, h, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatDate } from '@/utils/common/date'
import BaseTable from '@/components/BaseTable/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import { getProcessInstanceMyPage, getProcessInstanceCopyPage } from '@/api/system/bpm/processInstance'
import { getTaskTodoPage, getTaskDonePage } from '@/api/system/bpm/task'
import { CategoryApi } from '@/api/system/bpm/category'
import DefinitionApi from '@/api/system/bpm/definition'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import * as TaskApi from '@/api/system/bpm/task'
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
defineOptions({ name: 'BpmProcessInstanceAll' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

// 当前激活的 Tab
const activeTab = ref('todo')

// 监听路由参数变化，切换tab
watch(
	() => route.query.tab,
	newTab => {
		if (newTab && ['todo', 'done', 'copy', 'myProcess'].includes(newTab)) {
			activeTab.value = newTab
		}
	},
	{ immediate: true },
)

// 通用配置
const tableHeight = computed(() => {
	return window.innerHeight - 220
})

// 行配置
const rowConfig = { keyField: 'id' }

// 公共数据 - 可被多个 Tab 使用
const commonData = reactive({
	showPopover: false,
})
const categoryList = ref([])
const processDefinitionList = ref([])

// 1. 我的流程 Tab 数据和方法
const myProcessData = reactive({
	loading: true,
	total: 0,
	tableData: [],
	queryParams: {
		pageNum: 1,
		pageSize: 20,
		name: '',
		processDefinitionKey: undefined,
		category: undefined,
		status: undefined,
		createTime: [],
	},
	statusOptions: [
		{ value: 1, label: '进行中' },
		{ value: 2, label: '已通过' },
		{ value: 3, label: '已驳回' },
		{ value: 4, label: '已办结' },
		{ value: 5, label: '草稿' },
	],
})

const BpmProcessInstanceStatus = {
	RUNNING: 1,
	APPROVE: 2,
	REJECT: 3,
	CANCEL: 4,
	DRAFT: 5,
}

const selectDataMyProcess = reactive([
	{
		name: '流程名称',
		type: 'input',
		// modelValue: 'name',
		modelValue: 'processDefinitionName',
		span: 12,
		placeholder: '请输入流程名称',
	},
	// {
	// 	name: '流程分类',
	// 	type: 'select',
	// 	modelValue: 'category',
	// 	span: 8,
	// 	placeholder: '请选择流程分类',
	// 	selectData: categoryList,
	// 	selectLabel: 'label',
	// 	selectValue: 'value',
	// },
	{
		name: '流程状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
		placeholder: '请选择流程状态',
		selectData: myProcessData.statusOptions,
		selectLabel: 'label',
		selectValue: 'value',
	},
])

const buttonListMyProcess = reactive([
	{
		label: '高级筛选',
		type: 'default',
		icon: 'Plus',
		click: () => toggleAdvancedFilter('myProcess'),
		permission: undefined,
	},
])

const tableColumnsMyProcess = ref([
	{
		prop: 'name',
		label: '流程名称',
		align: 'left',
		minWidth: 200,
		fixed: 'left',
	},
	{
		prop: 'summary',
		label: '摘要',
		minWidth: 240,
		align: 'left',
		render: row => {
			if (row.summary && row.summary.length > 0) {
				return [
					h(
						'div',
						{
							class: 'flex flex-col',
							style: { gap: '8px' },
						},
						row.summary.map((item, index) =>
							h('div', { key: index }, h('span', { class: 'el-text el-text--info' }, `${item.key} : ${item.value}`)),
						),
					),
				]
			}
			return [h('span', { props: {} }, '—')]
		},
	},

	{
		prop: 'status',
		label: '流程状态',
		align: 'left',
		minWidth: 200,
		render: row => {
			// 审批中状态
			if (row.status === BpmProcessInstanceStatus.RUNNING && row.tasks?.length > 0) {
				// 单人审批
				if (row.tasks.length === 1) {
					return [
						h('span', [
							h(
								'a',
								{
									class: 'el-link el-link--primary',
									onClick: () => handleDetailMyProcess(row),
								},
								row.tasks[0].assigneeUser?.userName,
							),
							` (${row.tasks[0].name}) 审批中`,
						]),
					]
				} else {
					// 多人审批
					return [
						h('span', [
							h(
								'a',
								{
									class: 'el-link el-link--primary',
									onClick: () => handleDetailMyProcess(row),
								},
								row.tasks[0].assigneeUser?.userName,
							),
							` 等 ${row.tasks.length} 人 (${row.tasks[0].name})审批中`,
						]),
					]
				}
			} else {
				// 非审批中状态 - 使用标签显示
				const statusMap = {
					1: { label: '进行中', type: 'primary' },
					2: { label: '已通过', type: 'success' },
					3: { label: '已驳回', type: 'danger' },
					4: { label: '已办结', type: 'info' },
					5: { label: '草稿', type: 'warning' },
				}
				const status = statusMap[row.status] || { label: '未知', type: '' }
				return [
					h(
						'span',
						{
							class: `el-tag el-tag--${status.type}`,
						},
						status.label,
					),
				]
			}
		},
	},
	{
		prop: 'startTime',
		label: '发起时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.startTime ? formatDate(row.startTime) : '')],
	},
	{
		prop: 'endTime',
		label: '结束时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.endTime ? formatDate(row.endTime) : '')],
	},
	{
		label: '操作',
		align: 'center',
		width: 180,
		fixed: 'right',
		render: row => {
			const buttons = []

			// 1. 详情按钮 (始终显示)
			buttons.push(
				h(
					ElButton,
					{
						onClick: () => handleDetailMyProcess(row),
						type: 'primary',
						link: true,
						icon: 'View', // 对应原详情图标
					},
					{
						default: () => '详情',
					},
				),
			)

			// 2. 根据状态判断显示 办结 还是 重新发起
			if (row.status == 1) {
				// 审批中/进行中 状态显示 办结
				buttons.push(
					h(
						ElButton,
						{
							onClick: () => handleCancelMyProcess(row),
							type: 'danger',
							link: true,
							icon: 'SwitchButton', // 对应办结图标
						},
						{
							default: () => '办结',
						},
					),
				)
			}
			// else {
			// 	// 非进行中状态（如已结束、已撤回）显示 重新发起
			// 	buttons.push(
			// 		h(
			// 			ElButton,
			// 			{
			// 				onClick: () => handleCreateMyProcess(row),
			// 				type: 'warning',
			// 				link: true,
			// 				icon: 'Refresh', // 对应重新发起图标
			// 			},
			// 			{
			// 				default: () => '重新发起',
			// 			}
			// 		)
			// 	)
			// }

			return buttons
		},
	},
])

const myProcessTableRef = ref(null)
const loadingMyProcess = computed(() => myProcessData.loading)
const tableDataMyProcess = computed(() => myProcessData.tableData)
const totalMyProcess = computed(() => myProcessData.total)

const getListMyProcess = async e => {
	myProcessData.loading = true
	try {
		let pagination = myProcessTableRef.value?.buildQueryParams()
		const params = {
			...e,
			...pagination,
		}
		const res = await getProcessInstanceMyPage(params)
		if (res.code === '0000') {
			myProcessData.tableData = res.data.pages
			myProcessData.total = res.data.totalNum
		}
	} catch (error) {
		console.log(error, '获取流程列表失败')
		proxy.$modal.msgError('获取流程列表失败，请重试')
	} finally {
		myProcessData.loading = false
	}
}

const cellClickEventMyProcess = ({ row }) => {
	console.log('我的流程 - 行点击事件:', row)
}

const handleQueryMyProcess = () => {
	myProcessData.queryParams.pageNum = 1
	getListMyProcess(myProcessTableRef.value?.buildQueryParams())
	commonData.showPopover = false
}

const toggleAdvancedFilterMyProcess = () => {
	commonData.showPopover = !commonData.showPopover
}

const handleCreateMyProcess = async row => {
	if (row?.id) {
		try {
			const processDefinitionDetail = await DefinitionApi.getProcessDefinition(row.processDefinitionId)
			if (processDefinitionDetail.formType === 20) {
				ElMessage.error('重新发起流程失败，原因：该流程使用业务表单，不支持重新发起')
				return
			}
		} catch (error) {
			console.error('获取流程定义详情失败:', error)
			return
		}
	}
	// 跳转发起流程界面
	router.push({
		name: 'BpmProcessInstanceCreate',
		query: { processInstanceId: row?.id },
	})
}

const handleDetailMyProcess = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.id,
		},
	})
}

const handleCancelMyProcess = async row => {
	try {
		// 二次确认
		const { value } = await ElMessageBox.prompt('请输入办结原因', '办结流程', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 判断非空，且非空格
			inputErrorMessage: '办结原因不能为空',
		})

		// 发起取消
		await ProcessInstanceApi.cancelProcessInstanceByStartUser(row.id, value)
		ElMessage.success('办结成功')

		// 刷新列表
		await getListMyProcess(myProcessTableRef.value?.buildQueryParams())
	} catch (error) {
		if (error !== 'cancel') {
			console.error('办结流程失败:', error)
			ElMessage.error('办结流程失败')
		}
	}
}

// 2. 待办任务 Tab 数据和方法
const todoData = reactive({
	loading: true,
	total: 0,
	tableData: [],
	queryParams: {
		pageNum: 1,
		pageSize: 20,
		name: '',
		category: undefined,
		processDefinitionKey: '',
		createTime: [],
	},
})

const selectDataTodo = reactive([
	{
		name: '任务名称',
		type: 'input',
		// modelValue: 'name',
		modelValue: 'processDefinitionName',
		span: 24,
		placeholder: '请输入任务名称',
	},
	// {
	// 	name: '流程分类',
	// 	type: 'select',
	// 	modelValue: 'category',
	// 	span: 12,
	// 	placeholder: '请选择流程分类',
	// 	selectData: categoryList,
	// 	selectLabel: 'label',
	// 	selectValue: 'value',
	// },
])

const buttonListTodo = reactive([
	{
		label: '高级筛选',
		type: 'default',
		icon: 'Plus',
		click: () => toggleAdvancedFilter('todo'),
		permission: undefined,
	},
])

const tableColumnsTodo = ref([
	{
		prop: 'processInstance.name',
		label: '流程名称',
		align: 'left',
		minwidth: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.name || '')],
	},
	{
		prop: 'processInstance.summary',
		label: '摘要',
		align: 'left',
		minWidth: 480,
		render: row => {
			if (row.processInstance?.summary && row.processInstance.summary.length > 0) {
				return [
					h(
						'div',
						{
							class: 'flex flex-col',
							style: { gap: '8px' },
						},
						row.processInstance.summary.map((item, index) =>
							h('div', { key: index }, h('span', { class: 'el-text el-text--info' }, `${item.key} : ${item.value}`)),
						),
					),
				]
			}
			return [h('span', { props: {} }, '—')]
		},
	},
	{
		prop: 'processInstance.startUser.userName',
		label: '发起人',
		align: 'center',
		minwidth: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.startUser?.userName || '')],
	},
	{
		prop: 'processInstance.createTime',
		label: '发起时间',
		align: 'center',
		minwidth: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.createTime ? formatDate(row.processInstance.createTime) : '')],
	},
	{
		prop: 'processInstance.endTime',
		label: '结束时间',
		align: 'center',
		minwidth: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.endTime ? formatDate(row.processInstance.endTime) : '')],
	},
	{
		prop: 'name',
		label: '当前任务',
		align: 'center',
		minwidth: 180,
		render: row => [
			h(
				ElTag,
				{
					type: 'primary',
				},
				{
					default: () => row.processInstance?.name || '',
				},
			),
		],
	},

	{
		prop: 'createTime',
		label: '任务时间',
		align: 'center',
		minwidth: 180,
		render: row => [h('span', { props: {} }, row.createTime ? formatDate(row.createTime) : '')],
	},
	// {
	// 	prop: 'processInstanceId',
	// 	label: '流程编号',
	// 	align: 'center',
	// 	showOverFlow: true,
	// 	render: row => [h('span', { props: {} }, row.processInstanceId || '')],
	// },
	// {
	// 	prop: 'id',
	// 	label: '任务编号',
	// 	align: 'center',
	// 	showOverFlow: true,
	// 	render: row => [h('span', { props: {} }, row.id || '')],
	// },
	{
		label: '操作',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleAuditTodo(row)
						},
						permission: undefined,
						icon: 'Edit',
						link: true,
						type: 'primary',
					},
					{
						default: () => '办理',
					},
				),
			]
		},
	},
])

const todoTaskTableRef = ref(null)
const loadingTodo = computed(() => todoData.loading)
const tableDataTodo = computed(() => todoData.tableData)
const totalTodo = computed(() => todoData.total)

const getListTodo = async e => {
	todoData.loading = true
	try {
		let pagination = todoTaskTableRef.value?.buildQueryParams()
		const params = {
			...e,
			...pagination,
		}
		const res = await getTaskTodoPage(params)
		todoData.tableData = res.data.pages
		todoData.total = res.data.totalNum
	} catch (error) {
		console.error('获取待办任务列表失败:', error)
		ElMessage.error('获取列表失败')
		todoData.tableData = []
		todoData.total = 0
	} finally {
		todoData.loading = false
	}
}

const cellClickEventTodo = ({ row }) => {
	console.log('待办任务 - 行点击事件:', row)
}

const handleQueryTodo = () => {
	todoData.queryParams.pageNum = 1
	getListTodo()
	commonData.showPopover = false
}

const toggleAdvancedFilterTodo = () => {
	commonData.showPopover = !commonData.showPopover
}

const handleAuditTodo = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.processInstance.id,
			taskId: row.id,
		},
	})
}

// 3. 已办任务 Tab 数据和方法
const doneData = reactive({
	loading: true,
	total: 0,
	tableData: [],
	queryParams: {
		pageNum: 1,
		pageSize: 20,
		name: '',
		category: undefined,
		status: undefined,
	},
	statusOptions: [
		{ value: 1, label: '审批中' },
		{ value: 2, label: '通过' },
		{ value: 3, label: '不通过' },
		{ value: 4, label: '撤回' },
		{ value: 5, label: '驳回' },
	],
})
/**
 * 已办任务筛选条件
 */
const selectDataDone = reactive([
	{
		name: '任务名称',
		type: 'input',
		// modelValue: 'name',
		modelValue: 'processDefinitionName',
		span: 12,
		placeholder: '请输入任务名称',
	},
	// {
	// 	name: '流程分类',
	// 	type: 'select',
	// 	modelValue: 'category',
	// 	span: 8,
	// 	placeholder: '请选择流程分类',
	// 	selectData: categoryList,
	// 	selectLabel: 'label',
	// 	selectValue: 'value',
	// },
	{
		name: '审批状态',
		type: 'select',
		modelValue: 'status',
		span: 12,
		placeholder: '请选择审批状态',
		selectData: doneData.statusOptions,
		selectLabel: 'label',
		selectValue: 'value',
	},
])

const buttonListDone = reactive([
	{
		label: '高级筛选',
		type: 'default',
		icon: 'Plus',
		click: () => toggleAdvancedFilter('done'),
		permission: undefined,
	},
])

// 工具函数：格式化耗时
const formatPast2 = milliseconds => {
	if (!milliseconds) return '0秒'

	const seconds = Math.floor(milliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	if (days > 0) {
		return `${days}天${hours % 24}小时${minutes % 60}分${seconds % 60}秒`
	} else if (hours > 0) {
		return `${hours}小时${minutes % 60}分${seconds % 60}秒`
	} else if (minutes > 0) {
		return `${minutes}分${seconds % 60}秒`
	} else {
		return `${seconds}秒`
	}
}

const tableColumnsDone = ref([
	{
		prop: 'processInstance.name',
		label: '流程名称',
		align: 'left',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.name || '')],
	},
	{
		prop: 'processInstance.summary',
		label: '摘要',
		align: 'left',
		minWidth: 240,
		render: row => {
			if (row.processInstance?.summary && row.processInstance.summary.length > 0) {
				return [
					h(
						'div',
						{
							class: 'flex flex-col',
							style: { gap: '8px' },
						},
						row.processInstance.summary.map((item, index) =>
							h('div', { key: index }, h('span', { class: 'el-text el-text--info' }, `${item.key} : ${item.value}`)),
						),
					),
				]
			}
			return [h('span', { props: {} }, '—')]
		},
	},
	{
		prop: 'processInstance.startUser.userName',
		label: '发起人',
		align: 'center',
		width: 100,
		render: row => [h('span', { props: {} }, row.processInstance?.startUser?.userName || '')],
	},
	{
		prop: 'name',
		label: '当前任务',
		align: 'center',
		width: 180,
		render: row => [h(ElTag, { type: 'primary' }, { default: () => row.name || '' })],
	},
	{
		prop: 'createTime',
		label: '任务开始时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.createTime ? formatDate(row.createTime) : '')],
	},
	{
		prop: 'endTime',
		label: '任务结束时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.endTime ? formatDate(row.endTime) : '')],
	},

	{
		prop: 'reason',
		label: '审批建议',
		align: 'left',
		minWidth: 180,
		showOverFlow: true,
	},
	{
		prop: 'durationInMillis',
		label: '耗时',
		align: 'center',
		width: 160,
		render: row => [h('span', { props: {} }, formatPast2(row.durationInMillis))],
	},
	{
		prop: 'status',
		label: '审批状态',
		align: 'center',
		width: 120,
		render: row => {
			const statusMap = {
				1: { label: '审批中', type: 'primary' },
				2: { label: '通过', type: 'success' },
				3: { label: '不通过', type: 'danger' },
				4: { label: '撤回', type: 'info' },
				5: { label: '驳回', type: 'warning' },
			}
			const status = statusMap[row.status] || { label: '未知', type: '' }
			return [
				h(
					'span',
					{
						class: `el-tag el-tag--${status.type}`,
					},
					status.label,
				),
			]
		},
	},
	{
		label: '操作',
		align: 'center',
		width: 180,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => {
							handleWithdrawDone(row)
						},
						permission: undefined,
						icon: 'Refresh',
						link: true,
						type: 'warning',
					},
					{
						default: () => '撤回',
					},
				),
				h(
					ElButton,
					{
						onClick: () => {
							handleAuditDone(row)
						},
						permission: undefined,
						icon: 'Histogram',
						link: true,
						type: 'primary',
					},
					{
						default: () => '历史',
					},
				),
			]
		},
	},
])

const doneTaskTableRef = ref(null)
const loadingDone = computed(() => doneData.loading)
const tableDataDone = computed(() => doneData.tableData)
const totalDone = computed(() => doneData.total)

const getListDone = async e => {
	doneData.loading = true
	try {
		let pagination = doneTaskTableRef.value?.buildQueryParams()
		const params = {
			...e,
			...pagination,
		}
		const res = await getTaskDonePage(params)
		doneData.tableData = res.data.pages || []
		doneData.total = res.data.totalNum || 0
	} catch (error) {
		console.error('获取已办任务列表失败:', error)
		ElMessage.error('获取列表失败')
		doneData.tableData = []
		doneData.total = 0
	} finally {
		doneData.loading = false
	}
}

const cellClickEventDone = ({ row }) => {
	console.log('已办任务 - 行点击事件:', row)
}

const handleQueryDone = () => {
	doneData.queryParams.pageNum = 1
	getListDone(doneTaskTableRef.value?.buildQueryParams())
	commonData.showPopover = false
}

const toggleAdvancedFilterDone = () => {
	commonData.showPopover = !commonData.showPopover
}

const handleAuditDone = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.processInstance.id,
			taskId: row.id,
		},
	})
}

const handleWithdrawDone = async row => {
	try {
		await TaskApi.withdrawTask(row.id)
		ElMessage.success('撤回成功')
		getListDone(doneTaskTableRef.value?.buildQueryParams())
	} catch (error) {
		console.error('撤回任务失败:', error)
		ElMessage.error('撤回失败')
	}
}

// 4. 抄送我的 Tab 数据和方法
const copyData = reactive({
	loading: false,
	total: 0,
	tableData: [],
	queryParams: {
		pageNum: 1,
		pageSize: 20,
		createTime: [],
	},
})

const selectDataCopy = reactive([
	{
		name: '流程名称',
		type: 'input',
		modelValue: 'processInstanceName',
		span: 12,
		placeholder: '请输入流程名称',
	},
	{
		type: 'daterange', // 搜索框类型
		modelValue: 'createTime', // 绑定字段
		span: 12, // 占位，共24
		name: '发起时间',
		shortcuts: [],
	},
])

const buttonListCopy = reactive([
	{
		label: '高级筛选',
		type: 'default',
		icon: 'Plus',
		click: () => toggleAdvancedFilterCopy,
		permission: undefined,
	},
])
/**
 * 抄送我的表格列
 */
const tableColumnsCopy = ref([
	{
		prop: 'processInstanceName',
		label: '流程名称',
		align: 'left',
		minWidth: 100,
	},
	{
		prop: 'summary',
		label: '摘要',
		align: 'left',
		minWidth: 180,
		render: row => {
			if (row.summary && row.summary.length > 0) {
				return [
					h(
						'div',
						{
							class: 'flex flex-col',
							style: { gap: '8px' },
						},
						row.summary.map((item, index) =>
							h('div', { key: index }, h('span', { class: 'el-text el-text--info' }, `${item.key} : ${item.value}`)),
						),
					),
				]
			}
			return [h('span', { props: {} }, '—')]
		},
	},
	{
		prop: 'startUser.userName',
		label: '流程发起人',
		align: 'center',
		minWidth: 100,
		render: row => [h('span', { props: {} }, row.startUser?.userName || '')],
	},
	{
		prop: 'processInstanceStartTime',
		label: '流程发起时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstanceStartTime ? formatDate(row.processInstanceStartTime) : '')],
	},
	{
		prop: 'activityName',
		label: '抄送节点',
		align: 'center',
		minWidth: 180,
	},
	{
		label: '抄送人',
		align: 'center',
		minWidth: 100,
		render: row => [h('span', { props: {} }, row.createUser?.userName || '')],
	},
	{
		prop: 'reason',
		label: '抄送意见',
		align: 'left',
		width: 200,
		showOverFlow: true,
	},
	{
		prop: 'createTime',
		label: '抄送时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.createTime ? formatDate(row.createTime) : '')],
	},
	{
		label: '操作',
		align: 'center',
		width: 120,
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						type: 'primary',
						permission: undefined,
						icon: 'View',
						link: true,
						onClick: () => {
							handleAuditCopy(row)
						},
					},
					{
						default: () => '详情',
					},
				),
			]
		},
	},
])

const copyTaskTableRef = ref(null)
const loadingCopy = computed(() => copyData.loading)
const tableDataCopy = computed(() => copyData.tableData)
const totalCopy = computed(() => copyData.total)

const getListCopy = async e => {
	copyData.loading = true
	try {
		let pagination = copyTaskTableRef.value?.buildQueryParams()
		const params = {
			...e,
			...pagination,
		}
		if (params.createTime && params.createTime.length === 2) {
			const [startDate, endDate] = params.createTime

			// 将 createTime[0] 转为当天的 00:00:00
			const startTime = startDate ? `${startDate} 00:00:00` : undefined
			const endTime = endDate ? `${endDate} 23:59:59` : undefined
			params.createTime = [startTime, endTime]
		}
		const res = await getProcessInstanceCopyPage(params)
		copyData.tableData = res.data.pages || []
		copyData.total = res.data.totalNum || 0
	} catch (error) {
		;``
		console.error('获取抄送任务列表失败:', error)
		ElMessage.error('获取列表失败')
		copyData.tableData = []
		copyData.totalNum = 0
	} finally {
		copyData.loading = false
	}
}

const cellClickEventCopy = ({ row }) => {
	console.log('抄送我的 - 行点击事件:', row)
}

const handleQueryCopy = () => {
	copyData.queryParams.pageNum = 1
	getListCopy(copyTaskTableRef.value?.buildQueryParams())
}

const toggleAdvancedFilterCopy = () => {
	commonData.showPopover = !commonData.showPopover
}

const handleAuditCopy = row => {
	const params = {
		id: row.processInstanceId,
		activityId: undefined,
	}
	if (row.activityId) {
		params.activityId = row.activityId
	}
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: params,
	})
}

// Tab 切换处理
const handleTabClick = tab => {
	const tabName = tab.props.name
	if (tabName === 'myProcess' && myProcessData.tableData.length === 0) {
		getListMyProcess()
	} else if (tabName === 'todo' && todoData.tableData.length === 0) {
		getListTodo()
	} else if (tabName === 'done' && doneData.tableData.length === 0) {
		getListDone()
	} else if (tabName === 'copy' && copyData.tableData.length === 0) {
		getListCopy()
	}
}

// 高级筛选切换
const toggleAdvancedFilter = tabName => {
	commonData.showPopover = !commonData.showPopover
}

// const initCommonData = async () => {
// 	const [categoryData, definitionData] = await Promise.all([CategoryApi.getCategoryPage(), DefinitionApi.getProcessDefinitionPage()])

// 	categoryList.value = categoryData.data.pages.map(item => ({ label: item.name, value: item.code }))
// 	processDefinitionList.value = definitionData.data.pages.map(item => ({ label: item.name, value: item.key }))
// }

/** 初始化 **/
onMounted(async () => {
	// 获取公共数据
	try {
		// await initCommonData()
		// 初始化当前 Tab 的数据
		if (activeTab.value === 'myProcess') {
			await getListMyProcess()
		} else if (activeTab.value === 'todo') {
			console.log('初始化待办任务')
			await getListTodo()
		} else if (activeTab.value === 'done') {
			await getListDone()
		} else if (activeTab.value === 'copy') {
			await getListCopy()
		}
	} catch (error) {
		console.error('初始化失败:', error)
		ElMessage.error('初始化失败')
	}
})
</script>

<style scoped></style>
