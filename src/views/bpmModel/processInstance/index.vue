<template>
	<div>
		<!-- 主列表流程实例显示 -->
		<div class="app-container">
			<BaseTable
				ref="instanceTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="instanceTable"
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
import { ref, reactive, computed, getCurrentInstance, onMounted, h, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/common/date'
import BaseTable from '@/components/BaseTable/index.vue'
import DropDown from '@/components/DropDown/newIndex.vue'
import { getProcessInstanceMyPage } from '@/api/system/bpm/processInstance'
import { CategoryApi } from '@/api/system/bpm/category'
import DefinitionApi from '@/api/system/bpm/definition'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'BpmProcessInstanceMy' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()

// 常量定义
const DICT_TYPE = {
	BPM_PROCESS_INSTANCE_STATUS: 'bpm_process_instance_status',
}

const BpmProcessInstanceStatus = {
	RUNNING: 1,
	APPROVE: 2,
	REJECT: 3,
	CANCEL: 4,
	DRAFT: 5,
}

// 组件引用
const instanceTableRef = ref(null)

// 响应式数据
const loading = ref(true) // 加载中
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
	processDefinitionKey: undefined,
	category: undefined,
	status: undefined,
	createTime: [],
})

// 状态选项
const statusOptions = ref([
	{ value: 1, label: '进行中' },
	{ value: 2, label: '已通过' },
	{ value: 3, label: '已驳回' },
	{ value: 4, label: '已取消' },
	{ value: 5, label: '草稿' },
])

// 搜索条件配置
const selectData = reactive([
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
		selectData: categoryList,
		selectLabel: 'name',
		selectValue: 'code',
	},
	{
		name: '流程状态',
		type: 'select',
		modelValue: 'status',
		span: 6,
		placeholder: '请选择流程状态',
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

// 表格列配置
const tableColumns = ref([
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
									onClick: () => handleDetail(row),
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
									onClick: () => handleDetail(row),
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
					4: { label: '已取消', type: 'info' },
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
					click: () => handleDetail(row),
					permission: 'bpm:process-instance:cancel',
				},
				...(row.status === 1
					? [
							{
								name: '取消',
								command: '取消',
								click: () => handleCancel(row),
								permission: 'bpm:process-instance:query',
								type: 'danger',
							},
						]
					: [
							{
								name: '重新发起',
								command: '重新发起',
								click: () => handleCreate(row),
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

// 工具函数
const dateFormatter = cellValue => {
	if (!cellValue) return ''
	return new Date(cellValue).toLocaleString()
}

// 核心业务方法
/**
 * 获取流程实例列表
 */
const getList = async () => {
	loading.value = true
	try {
		const res = await getProcessInstanceMyPage(queryParams)
		if (res.code === '0000') {
			tableData.value = res.data.pages
			total.value = res.data.totalNum
			loading.value = false
		}
	} catch (error) {
		console.log(error, '获取流程列表失败')
		proxy.$modal.msgError('获取流程列表失败，请重试')
	} finally {
		loading.value = false // 确保无论如何都关闭loading
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
	queryParams.processDefinitionKey = undefined
	queryParams.category = undefined
	queryParams.status = undefined
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
 * 发起流程操作
 */
const handleCreate = async row => {
	// 如果是【业务表单】，不支持重新发起
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

/**
 * 查看详情
 */
const handleDetail = row => {
	router.push({
		name: 'BpmProcessInstanceDetail',
		params: {
			id: row.id,
		},
	})
}

/**
 * 取消按钮操作
 */
const handleCancel = async row => {
	try {
		// 二次确认
		const { value } = await ElMessageBox.prompt('请输入取消原因', '取消流程', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 判断非空，且非空格
			inputErrorMessage: '取消原因不能为空',
		})

		// 发起取消
		await ProcessInstanceApi.cancelProcessInstanceByStartUser(row.id, value)
		ElMessage.success('取消成功')

		// 刷新列表
		await getList()
	} catch (error) {
		if (error !== 'cancel') {
			console.error('取消流程失败:', error)
			ElMessage.error('取消失败')
		}
	}
}

/** 激活时 **/
onActivated(() => {
	getList()
})

/** 初始化 **/
onMounted(async () => {
	// 获取分类列表
	const categoryData = await CategoryApi.getCategoryPage()
	categoryList.value = categoryData.data.pages

	// 获取流程定义列表
	const definitionData = await DefinitionApi.getProcessDefinitionPage()
	processDefinitionList.value = definitionData.data.pages

	// 获取流程实例列表
	await getList()
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

:deep(.el-link) {
	font-size: 14px;
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
