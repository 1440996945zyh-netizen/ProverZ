<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 15:51:47
 * @LastEditTime: 2025-12-23 15:52:00
 * @LastEditors: zhangsd
 * @Description: 待办任务列表
 * @FilePath: \view\src\views\bpmModel\task\todo\index.vue
-->
<template>
	<div>
		<!-- 主列表待办任务显示 -->
		<div class="app-container">
			<BaseTable
				ref="todoTaskTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="todoTaskTable"
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
import { getTaskTodoPage } from '@/api/system/bpm/task'
import { CategoryApi } from '@/api/system/bpm/category'
import DefinitionApi from '@/api/system/bpm/definition'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'BpmTodoTask' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()

// 组件引用
const todoTaskTableRef = ref(null)

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
	pageSize: 10,
	name: '',
	category: undefined,
	processDefinitionKey: '',
	createTime: [],
})

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
		prop: 'processInstance.createTime',
		label: '发起时间',
		align: 'center',
		width: 180,
		render: row => [h('span', { props: {} }, row.processInstance?.createTime ? formatDate(row.processInstance.createTime) : '')],
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
					click: () => handleAudit(row),
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

// 工具函数
const dateFormatter = cellValue => {
	if (!cellValue) return ''
	return new Date(cellValue).toLocaleString()
}

// 核心业务方法
/**
 * 获取待办任务列表
 */
const getList = async () => {
	loading.value = true
	try {
		const data = await getTaskTodoPage(queryParams)
		tableData.value = data.list
		total.value = data.total
	} catch (error) {
		console.error('获取待办任务列表失败:', error)
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
	getList()
	showPopover.value = false
}

/**
 * 重置按钮操作
 */
const resetQuery = () => {
	queryParams.name = ''
	queryParams.category = undefined
	queryParams.processDefinitionKey = ''
	queryParams.createTime = []
	queryParams.pageNum = 1
	getList()
}

/**
 * 高级筛选切换
 */
const toggleAdvancedFilter = () => {
	showPopover.value = !showPopover.value
}

/**
 * 处理审批按钮
 */
const handleAudit = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		query: {
			id: row.processInstance.id,
			taskId: row.id,
		},
	})
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

		// 获取待办任务列表
		await getList()
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

.flex {
	display: flex;
}

.flex-col {
	flex-direction: column;
}
</style>
