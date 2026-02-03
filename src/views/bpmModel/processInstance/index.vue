<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 11:10:21
 * @LastEditTime: 2025-12-23 11:13:32
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
					:loading="loadingTodo"
					:showPagination="true"
					:showToolBar="false"
					:showNum="5"
					defaultWidth="50"
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
					:showToolBar="false"
					:showNum="5"
					defaultWidth="50"
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
					:showToolBar="false"
					:showNum="5"
					defaultWidth="50"
					:total="totalCopy"
				/>
			</el-tab-pane>
			<el-tab-pane name="myProcess" label="我的流程">
				<!-- 我的流程表格 -->
				<BaseTable
					ref="instanceTableRef"
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
					:showNum="5"
					defaultWidth="50"
					:total="totalMyProcess"
				/>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, onActivated, h } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/common/date'
import BaseTable from '@/components/BaseTable/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import { getProcessInstanceMyPage, getProcessInstanceCopyPage } from '@/api/system/bpm/processInstance'
import { getTaskTodoPage, getTaskDonePage } from '@/api/system/bpm/task'
import { CategoryApi } from '@/api/system/bpm/category'
import DefinitionApi from '@/api/system/bpm/definition'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'BpmProcessInstanceAll' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()

// 当前激活的 Tab
const activeTab = ref('todo')

// 通用配置
const tableHeight = computed(() => {
	return window.innerHeight - 220
})

// 行配置
const rowConfig = { keyField: 'id' }

// 公共数据 - 可被多个 Tab 使用
const commonData = reactive({
	categoryList: [],
	processDefinitionList: [],
	showPopover: false,
})

// 1. 我的流程 Tab 数据和方法
const myProcessData = reactive({
	loading: true,
	total: 0,
	tableData: [],
	queryParams: {
		pageNum: 1,
		pageSize: 10,
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
		modelValue: 'name',
		span: 6,
		placeholder: '请输入流程名称',
	},
	{
		name: '流程分类',
		type: 'select',
		modelValue: 'category',
		span: 6,
		placeholder: '请选择流程分类',
		selectData: commonData.categoryList,
		selectLabel: 'name',
		selectValue: 'code',
	},
	{
		name: '流程状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		placeholder: '请选择流程状态',
		selectData: myProcessData.statusOptions,
		selectLabel: 'label',
		selectValue: 'value',
	},
	{
		name: '所属流程',
		type: 'select',
		modelValue: 'processDefinitionKey',
		span: 6,
		placeholder: '请选择流程定义',
		selectData: commonData.processDefinitionList,
		selectLabel: 'name',
		selectValue: 'key',
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
		align: 'center',
		minWidth: 200,
		fixed: 'left',
	},
	{
		prop: 'summary',
		label: '摘要',
		width: 180,
		fixed: 'left',
		render: row => {
			if (row.summary && row.summary.length > 0) {
				return [
					h(
						'div',
						{ class: 'flex flex-col' },
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
		prop: 'categoryName',
		label: '流程分类',
		align: 'center',
		minWidth: 100,
		fixed: 'left',
	},
	{
		prop: 'status',
		label: '流程状态',
		align: 'center',
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
			const dropDownList = [
				{
					name: '详情',
					command: '详情',
					click: () => handleDetailMyProcess(row),
					permission: 'bpm:process-instance:cancel',
				},
				...(row.status === 1
					? [
							{
								name: '办结',
								command: '办结',
								click: () => handleCancelMyProcess(row),
								permission: 'bpm:process-instance:query',
								type: 'danger',
							},
						]
					: [
							{
								name: '重新发起',
								command: '重新发起',
								click: () => handleCreateMyProcess(row),
								permission: undefined,
							},
						]),
			]

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
					},
				),
			]
		},
	},
])

const instanceTableRef = ref(null)
const loadingMyProcess = computed(() => myProcessData.loading)
const tableDataMyProcess = computed(() => myProcessData.tableData)
const totalMyProcess = computed(() => myProcessData.total)

const getListMyProcess = async () => {
	myProcessData.loading = true
	try {
		const res = await getProcessInstanceMyPage(myProcessData.queryParams)
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
	getListMyProcess()
	commonData.showPopover = false
}

const resetQueryMyProcess = () => {
	myProcessData.queryParams.name = ''
	myProcessData.queryParams.processDefinitionKey = undefined
	myProcessData.queryParams.category = undefined
	myProcessData.queryParams.status = undefined
	myProcessData.queryParams.createTime = []
	myProcessData.queryParams.pageNum = 1
	getListMyProcess()
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
		await getListMyProcess()
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
		pageSize: 10,
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
		modelValue: 'name',
		span: 6,
		placeholder: '请输入任务名称',
	},
	{
		name: '流程分类',
		type: 'select',
		modelValue: 'category',
		span: 6,
		placeholder: '请选择流程分类',
		selectData: commonData.categoryList,
		selectLabel: 'name',
		selectValue: 'code',
	},
	{
		name: '所属流程',
		type: 'select',
		modelValue: 'processDefinitionKey',
		span: 6,
		placeholder: '请选择流程定义',
		selectData: commonData.processDefinitionList,
		selectLabel: 'name',
		selectValue: 'key',
	},
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
		label: '流程',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.name || '')],
	},
	{
		prop: 'processInstance.summary',
		label: '摘要',
		width: 180,
		render: row => {
			if (row.processInstance?.summary && row.processInstance.summary.length > 0) {
				return [
					h(
						'div',
						{ class: 'flex flex-col' },
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
		prop: 'processInstance.createTime',
		label: '发起时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.createTime ? formatDate(row.processInstance.createTime) : '')],
	},
	{
		prop: 'processInstance.endTime',
		label: '结束时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.endTime ? formatDate(row.processInstance.endTime) : '')],
	},
	{
		prop: 'name',
		label: '当前任务',
		align: 'center',
		width: 180,
	},
	{
		prop: 'createTime',
		label: '任务时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.createTime ? formatDate(row.createTime) : '')],
	},
	{
		prop: 'processInstanceId',
		label: '流程编号',
		align: 'center',
		showOverFlow: true,
		render: row => [h('span', { props: {} }, row.processInstanceId || '')],
	},
	{
		prop: 'id',
		label: '任务编号',
		align: 'center',
		showOverFlow: true,
		render: row => [h('span', { props: {} }, row.id || '')],
	},
	{
		label: '操作',
		align: 'center',
		width: 80,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '办理',
					command: '办理',
					click: () => handleAuditTodo(row),
					permission: undefined,
					icon: 'Edit',
				},
			]

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
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

const getListTodo = async () => {
	todoData.loading = true
	try {
		const res = await getTaskTodoPage(todoData.queryParams)
		todoData.tableData = res.data.pages
		todoData.total = res.data.total
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

const resetQueryTodo = () => {
	todoData.queryParams.name = ''
	todoData.queryParams.category = undefined
	todoData.queryParams.processDefinitionKey = ''
	todoData.queryParams.createTime = []
	todoData.queryParams.pageNum = 1
	getListTodo()
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
		pageSize: 10,
		name: '',
		category: undefined,
		status: undefined,
		processDefinitionKey: '',
		createTime: [],
	},
	statusOptions: [
		{ value: 1, label: '审批中' },
		{ value: 2, label: '通过' },
		{ value: 3, label: '不通过' },
		{ value: 4, label: '撤回' },
		{ value: 5, label: '驳回' },
	],
})

const selectDataDone = reactive([
	{
		name: '任务名称',
		type: 'input',
		modelValue: 'name',
		span: 6,
		placeholder: '请输入任务名称',
	},
	{
		name: '流程分类',
		type: 'select',
		modelValue: 'category',
		span: 6,
		placeholder: '请选择流程分类',
		selectData: commonData.categoryList,
		selectLabel: 'name',
		selectValue: 'code',
	},
	{
		name: '审批状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		placeholder: '请选择审批状态',
		selectData: doneData.statusOptions,
		selectLabel: 'label',
		selectValue: 'value',
	},
	{
		name: '所属流程',
		type: 'select',
		modelValue: 'processDefinitionKey',
		span: 6,
		placeholder: '请选择流程定义',
		selectData: commonData.processDefinitionList,
		selectLabel: 'name',
		selectValue: 'key',
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
		label: '流程',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.name || '')],
	},
	{
		prop: 'processInstance.summary',
		label: '摘要',
		width: 180,
		render: row => {
			if (row.processInstance?.summary && row.processInstance.summary.length > 0) {
				return [
					h(
						'div',
						{ class: 'flex flex-col' },
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
		prop: 'reason',
		label: '审批建议',
		align: 'center',
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
		prop: 'processInstanceId',
		label: '流程编号',
		align: 'center',
		width: 180,
		showOverFlow: true,
		render: row => [h('span', { props: {} }, row.processInstanceId || '')],
	},
	{
		prop: 'id',
		label: '任务编号',
		align: 'center',
		width: 180,
		showOverFlow: true,
		render: row => [h('span', { props: {} }, row.id || '')],
	},
	{
		label: '操作',
		align: 'center',
		width: 100,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '撤回',
					command: '撤回',
					click: () => handleWithdrawDone(row),
					permission: undefined,
					icon: 'Refresh',
					type: 'warning',
				},
				{
					name: '历史',
					command: '历史',
					click: () => handleAuditDone(row),
					permission: undefined,
					icon: 'Histogram',
				},
			]

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
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

const getListDone = async () => {
	doneData.loading = true
	try {
		const data = await getTaskDonePage(doneData.queryParams)
		doneData.tableData = data.pages || []
		doneData.total = data.totalNum
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
	getListDone()
	commonData.showPopover = false
}

const resetQueryDone = () => {
	doneData.queryParams.name = ''
	doneData.queryParams.category = undefined
	doneData.queryParams.status = undefined
	doneData.queryParams.processDefinitionKey = ''
	doneData.queryParams.createTime = []
	doneData.queryParams.pageNum = 1
	getListDone()
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
		getListDone()
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
		pageSize: 10,
		processInstanceId: '',
		processInstanceName: '',
		createTime: [],
	},
})

const selectDataCopy = reactive([
	{
		name: '流程名称',
		type: 'input',
		modelValue: 'processInstanceName',
		span: 6,
		placeholder: '请输入流程名称',
	},
	{
		name: '抄送时间',
		type: 'dateRange',
		modelValue: 'createTime',
		span: 6,
		placeholder: '请选择抄送时间范围',
	},
])

const buttonListCopy = reactive([])

const tableColumnsCopy = ref([
	{
		prop: 'processInstanceName',
		label: '流程名',
		align: 'center',
		minWidth: 180,
	},
	{
		prop: 'summary',
		label: '摘要',
		minWidth: 180,
		render: row => {
			if (row.summary && row.summary.length > 0) {
				return [
					h(
						'div',
						{ class: 'flex flex-col' },
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
		align: 'center',
		width: 150,
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
		width: 80,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '详情',
					command: '详情',
					click: () => handleAuditCopy(row),
					permission: undefined,
					icon: 'View',
				},
			]

			return [
				h(
					DropDown,
					{
						dropDownList,
						isInner: true,
						props: { permission: undefined },
					},
					{
						default: () => h('span', { class: 'el-icon-more' }),
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

const getListCopy = async () => {
	copyData.loading = true
	try {
		const res = await getProcessInstanceCopyPage(copyData.queryParams)
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
	getListCopy()
}

const resetQueryCopy = () => {
	copyData.queryParams.processInstanceName = ''
	copyData.queryParams.createTime = []
	copyData.queryParams.pageNum = 1
	getListCopy()
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

/** 激活时 **/
onActivated(() => {
	if (activeTab.value === 'myProcess') {
		getListMyProcess()
	} else if (activeTab.value === 'todo') {
		getListTodo()
	} else if (activeTab.value === 'done') {
		getListDone()
	} else if (activeTab.value === 'copy') {
		getListCopy()
	}
})

/** 初始化 **/
onMounted(async () => {
	// 获取公共数据
	try {
		const [categoryData, definitionData] = await Promise.all([CategoryApi.getCategoryPage(), DefinitionApi.getProcessDefinitionPage()])

		commonData.categoryList = categoryData.data.pages
		commonData.processDefinitionList = definitionData.data.pages

		// 初始化当前 Tab 的数据
		if (activeTab.value === 'myProcess') {
			await getListMyProcess()
		} else if (activeTab.value === 'todo') {
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
