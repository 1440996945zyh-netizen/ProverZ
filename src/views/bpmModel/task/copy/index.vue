<!--
 * @Author: zhangsd
 * @Date: 2025-12-23 15:54:18
 * @LastEditTime: 2025-12-23 15:54:38
 * @LastEditors: zhangsd
 * @Description: 抄送我的任务
 * @FilePath: \view\src\views\bpmModel\task\copy\index.vue
-->

<template>
	<div>
		<!-- 主列表抄送我的流程显示 -->
		<div class="app-container">
			<BaseTable
				ref="copyTaskTableRef"
				:showSearchHeader="true"
				:selectData="selectData"
				:searchClick="getList"
				:buttonList="buttonList"
				:tableColumns="tableColumns"
				:tableData="tableData"
				:cellClickEvent="cellClickEvent"
				:rowConfig="rowConfig"
				:tableHeight="tableHeight"
				name="copyTaskTable"
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
import { getProcessInstanceCopyPage } from '@/api/system/bpm/processInstance'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'BpmProcessInstanceCopy' })

// 组件实例与路由
const { proxy } = getCurrentInstance()
const router = useRouter()

// 组件引用
const copyTaskTableRef = ref(null)

// 响应式数据
const loading = ref(false)
const total = ref(0)
const tableData = ref([])

// 查询参数
const queryParams = reactive({
	pageNum: 1,
	pageSize: 10,
	processInstanceId: '',
	processInstanceName: '',
	createTime: [],
})

// 搜索条件配置
const selectData = reactive([
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

// 顶部按钮配置
const buttonList = reactive([])

// 计算表格高度
const tableHeight = computed(() => {
	return window.innerHeight - 220
})

// 行配置
const rowConfig = { keyField: 'id' }

// 表格列配置
const tableColumns = ref([
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
		prop: 'startUser.nickname',
		label: '流程发起人',
		align: 'center',
		minWidth: 100,
		render: row => [h('span', { props: {} }, row.startUser?.nickname || '')],
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
		render: row => [h('span', { props: {} }, row.createUser?.nickname || '系统')],
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
					click: () => handleAudit(row),
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

// 核心业务方法
/**
 * 获取抄送任务列表
 */
const getList = async () => {
	loading.value = true
	try {
		const data = await getProcessInstanceCopyPage(queryParams)
		tableData.value = data.list
		total.value = data.total
	} catch (error) {
		console.error('获取抄送任务列表失败:', error)
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
}

/**
 * 重置按钮操作
 */
const resetQuery = () => {
	queryParams.processInstanceName = ''
	queryParams.createTime = []
	queryParams.pageNum = 1
	getList()
}

/**
 * 处理详情按钮
 */
const handleAudit = row => {
	const query = {
		id: row.processInstanceId,
		activityId: undefined,
	}
	if (row.activityId) {
		query.activityId = row.activityId
	}
	router.push({
		name: 'BpmProcessInstanceDetail',
		query: query,
	})
}

/** 初始化 **/
onMounted(() => {
	getList()
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
