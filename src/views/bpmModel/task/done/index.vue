<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 15:52:56
 * @LastEditTime: 2025-12-23 15:53:16
 * @LastEditors: zhangsd
 * @Description: 已办任务列表
 * @FilePath: \view\src\views\bpmModel\task\done\index.vue
-->

<template>
	<div>
		<!-- 主列表已办任务显示 -->
		<div class="app-container">
			<BaseTable
				ref="doneTaskTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="doneTaskTable"
				:loading="loading"
				:showPagination="true"
				:showToolBar="false"
				:showNum="5"
				defaultWidth="50"
				:total="total"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/common/date'
import BaseTable from '@/components/BaseTable/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import { getTaskDonePage } from '@/api/system/bpm/task'
import { CategoryApi } from '@/api/system/bpm/category'
import DefinitionApi from '@/api/system/bpm/definition'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'BpmDoneTask' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()

// 常量定义
const DICT_TYPE = {
	BPM_TASK_STATUS: 'bpm_task_status',
}

// 组件引用
const doneTaskTableRef = ref(null)

// 响应式数据
const loading = ref(true)
const total = ref(0)
const tableData = ref([])
const categoryList = ref([])
const processDefinitionList = ref([])
const showPopover = ref(false)

// 查询参数
const queryParams = reactive({
	pageNum: 1,
 pageSize: 20, 
	name: '',
	category: undefined,
	status: undefined,
	processDefinitionKey: '',
	createTime: [],
})

// 状态选项（从字典获取）
const statusOptions = ref([
	{ value: 1, label: '审批中' },
	{ value: 2, label: '通过' },
	{ value: 3, label: '不通过' },
	{ value: 4, label: '撤回' },
	{ value: 5, label: '驳回' },
])

// 搜索条件配置
const selectData = reactive([
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
		selectData: categoryList,
		selectLabel: 'name',
		selectValue: 'code',
	},
	{
		name: '审批状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		placeholder: '请选择审批状态',
		selectData: statusOptions,
		selectLabel: 'label',
		selectValue: 'value',
	},
	{
		name: '所属流程',
		type: 'select',
		modelValue: 'processDefinitionKey',
		span: 6,
		placeholder: '请选择流程定义',
		selectData: processDefinitionList,
		selectLabel: 'name',
		selectValue: 'key',
	},
])

// 顶部按钮配置
const buttonList = reactive([
	{
		label: '高级筛选',
		type: 'default',
		icon: 'Plus',
		click: () => toggleAdvancedFilter(),
		permission: undefined,
	},
])

// 计算表格高度
const tableHeight = computed(() => {
	return window.innerHeight - 220
})

// 行配置
const rowConfig = { keyField: 'id' }

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

// 表格列配置
const tableColumns = ref([
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
		prop: 'processInstance.startUser.nickname',
		label: '发起人',
		align: 'center',
		width: 100,
		render: row => [h('span', { props: {} }, row.processInstance?.startUser?.nickname || '')],
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
		width: 130,
		fixed: 'right',
		render: row => {
			const dropDownList = [
				{
					name: '撤回',
					command: '撤回',
					click: () => handleWithdraw(row),
					permission: undefined,
					icon: 'Refresh',
					type: 'warning',
				},
				{
					name: '历史',
					command: '历史',
					click: () => handleAudit(row),
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

// 核心业务方法
/**
 * 获取已办任务列表
 */
const getList = async () => {
	loading.value = true
	try {
		const data = await getTaskDonePage(queryParams)
		tableData.value = data.pages || []
		total.value = data.totalNum
	} catch (error) {
		console.error('获取已办任务列表失败:', error)
		ElMessage.error('获取列表失败')
		tableData.value = []
		total.value = 0
	} finally {
		loading.value = false
	}
}

/**
 * 单元格点击事件
 */
const cellClickEvent = ({ row }) => {
	console.log('行点击事件:', row)
}

/**
 * 搜索按钮操作
 */
const handleQuery = () => {
	queryParams.pageNum = 1
	getList(doneTaskTableRef.value?.buildQueryParams())
	showPopover.value = false
}

/**
 * 重置按钮操作
 */
const resetQuery = () => {
	queryParams.name = ''
	queryParams.category = undefined
	queryParams.status = undefined
	queryParams.processDefinitionKey = ''
	queryParams.createTime = []
	queryParams.pageNum = 1
	getList(doneTaskTableRef.value?.buildQueryParams())
}

/**
 * 高级筛选切换
 */
const toggleAdvancedFilter = () => {
	showPopover.value = !showPopover.value
}

/**
 * 处理审批历史按钮
 */
const handleAudit = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.processInstance.id,
			taskId: row.id,
		},
	})
}

/**
 * 撤回按钮操作
 */
const handleWithdraw = async row => {
	try {
		await TaskApi.withdrawTask(row.id)
		ElMessage.success('撤回成功')
		getList(doneTaskTableRef.value?.buildQueryParams())
	} catch (error) {
		console.error('撤回任务失败:', error)
		ElMessage.error('撤回失败')
	}
}

/** 初始化 **/
onMounted(async () => {
	try {
		// 获取分类列表
		const categoryData = await CategoryApi.getCategoryPage()
		categoryList.value = categoryData.data.pages

		// 获取流程定义列表
		const definitionData = await DefinitionApi.getProcessDefinitionPage()
		processDefinitionList.value = definitionData.data.pages

		// 获取已办任务列表
		await getList(doneTaskTableRef.value?.buildQueryParams())
	} catch (error) {
		console.error('初始化失败:', error)
		ElMessage.error('初始化失败')
	}
})
</script>

<style scoped>
/* 根容器：占满视口高度，避免内容撑开页面 */
.app-container {
	margin: 0 auto;
	font-family: 'Microsoft YaHei', Arial, sans-serif;
	color: #333;
	height: 100% !important;
	box-sizing: border-box;
}

:deep(.el-text) {
	font-size: 12px;
	color: #909399;
}

:deep(.el-tag) {
	margin-right: 5px;
}

.flex {
	display: flex;
}

.flex-col {
	flex-direction: column;
}
</style>
