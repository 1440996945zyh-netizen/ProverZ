<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 11:10:21
 * @LastEditTime: 2026-02-10 16:35:54
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
			:cellClickEvent="cellClickEvent"
			:total="total"
			:loading="loading"
			:tableHeight="tableHeight"
			name="processInstanceTable"
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
	name: 'BpmProcessInstanceManager',
})

// 导入依赖
import { ref, reactive, onMounted, onActivated, nextTick, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 组件
import BaseTable from '@/components/BaseTable/index.vue'
// 工具函数
// import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, formatPast2, formatDate } from '@/utils/common/date'
// API 接口
import * as ProcessInstanceApi from '@/api/system/bpm/processInstance'
import { CategoryApi } from '@/api/system/bpm/category'
import publicApi from '@/api/public/index.js'

import { useMessage } from '@/plugins/useMessage'
import { BPM_PROCESS_INSTANCE_STATUS } from '@/utils/bpm/constantEnumeration'
import tableParamsStore from '@/store/modules/tableParams'
// 初始化全局实例
const route = useRoute()
const router = useRouter()
const message = useMessage() // 消息提示实例
const baseTableRef = ref(null) // BaseTable 引用

// 响应式数据
const loading = ref(false) // 列表加载状态
const total = ref(0) // 列表总条数
const tableData = ref([]) // 表格数据
const clickRow = ref({}) // 点击的当前行数据
const categoryList = ref([]) // 流程分类列表
const userList = ref([]) // 用户列表
const processStatusDict = ref([
	{ value: 1, label: '进行中' },
	{ value: 2, label: '已通过' },
	{ value: 3, label: '已驳回' },
	{ value: 4, label: '已办结' },
	{ value: 5, label: '草稿' },
]) // 流程状态字典
const storeHight = computed(() => tableParamsStore().normalTableHeight)

const tableHeight = computed(() => storeHight.value - 18)
// 查询参数
const queryParams = ref({
	pageNo: 1,
	pageSize: 10,
	startUserId: undefined,
	name: '',
	processDefinitionId: undefined,
	category: undefined,
	status: undefined,
	createTime: [],
})

/**
 * 搜索配置（对应原搜索栏）
 */
const selectData = reactive([
	{
		name: '发起人', // 搜索框名称
		type: 'select', // 搜索框类型
		modelValue: 'startUserId', // 绑定字段
		span: 4, // 栅格占位（共24）
		selectData: userList, // 下拉数据源
		placeholder: '请选择发起人',
	},
	{
		name: '流程名称', // 搜索框名称
		type: 'input', // 搜索框类型
		modelValue: 'name', // 绑定字段
		span: 5, // 栅格占位
		placeholder: '请输入流程名称',
	},
	{
		name: '所属流程', // 搜索框名称
		type: 'input', // 搜索框类型
		modelValue: 'processDefinitionId', // 绑定字段
		span: 5, // 栅格占位
		placeholder: '请输入流程定义的编号',
	},
	{
		name: '流程分类', // 搜索框名称
		type: 'select', // 搜索框类型
		modelValue: 'category', // 绑定字段
		span: 5, // 栅格占位
		selectData: categoryList,
		placeholder: '请选择流程分类',
	},
	{
		name: '流程状态', // 搜索框名称
		type: 'select', // 搜索框类型
		modelValue: 'status', // 绑定字段
		span: 5, // 栅格占位
		selectData: BPM_PROCESS_INSTANCE_STATUS, // 下拉数据源
		selectValue: 'value',
		selectLabel: 'label',
		placeholder: '请选择流程状态',
	},

	{
		type: 'daterange', // 搜索框类型
		modelValue: 'createTime', // 绑定字段
		span: 4, // 占位，共24
		name: '发起时间',
		shortcuts: [],
	},
])

/**
 * 顶部操作按钮配置（原页面无额外操作按钮，暂留空，可按需添加）
 */
const buttonList = reactive([
	// 示例：如需添加导出按钮可在此配置
	// {
	//   label: '导出',
	//   type: 'primary',
	//   icon: 'Download',
	//   click: () => handleExport(),
	//   permission: 'bpm:process-instance:export'
	// }
])

/**
 * 表格列配置（对应原el-table列）
 */
const tableColumns = ref([
	{
		label: '流程名称',
		prop: 'name',
		minWidth: 200,
		fixed: 'left',
		align: 'left',
	},
	// {
	// 	label: '流程分类',
	// 	prop: 'categoryName',
	// 	minWidth: 100,
	// 	fixed: 'left',
	// 	align: 'center',
	// },
	{
		label: '流程发起人',
		prop: 'startUser.userName',
		width: 120,
		align: 'center',
	},
	{
		label: '发起部门',
		prop: 'startUser.deptName',
		width: 120,
		align: 'center',
	},
	{
		label: '流程状态',
		prop: 'status',
		width: 120,
		align: 'center',
		render: row => {
			return [
				h(
					ElTag,
					{
						type: BPM_PROCESS_INSTANCE_STATUS.find(item => item.value === row.status)?.type || 'info',
					},
					{
						default: () => BPM_PROCESS_INSTANCE_STATUS.find(item => item.value === row.status)?.label || '-',
					},
				),
			]
		},
	},
	{
		label: '发起时间',
		prop: 'startTime',
		width: 200,
		align: 'center',
		formatter: (row, column, cellValue) => {
			return formatDate(row.row.startTime)
		},
	},
	{
		label: '结束时间',
		prop: 'endTime',
		width: 200,
		align: 'center',
		formatter: (row, column, cellValue) => {
			return formatDate(row.row.endTime)
		},
	},
	{
		label: '耗时',
		prop: 'durationInMillis',
		width: 120,
		align: 'center',
		render: row => {
			if (row.durationInMillis === null) {
				return [h('span', '-')]
			}
			return [h(ElTag, { type: 'primary' }, { default: () => formatPast2(row.durationInMillis) })]
		},
	},
	{
		label: '当前审批任务',
		prop: 'tasks',
		minWidth: 120,
		align: 'left',
		render: row => {
			const taskContainer = []
			if (!row.tasks || !Array.isArray(row.tasks) || row.tasks.length === 0) {
				taskContainer.push(h('span', { style: { color: '#409EFF' } }, '-'))
			} else {
				row.tasks.forEach(task => {
					taskContainer.push(
						h(
							'span', // 替换 ElButton 为 span
							{
								key: `task_${task.id}`,
								style: { color: '#409EFF' }, // 设置蓝色字体
							},
							task.name,
						),
					)
				})
			}
			return h('div', { style: { display: 'flex', gap: '4px',  } }, taskContainer)
		},
	},
	// {
	// 	label: '流程编号',
	// 	prop: 'id',
	// 	minWidth: '320px',
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
						onClick: () => handleDetail(row),
						type: 'primary',
						link: true,
						icon: 'Document',
					},
					{ default: () => '详情' },
				),
			]

			// 只有当status === 1时才显示取消按钮
			if (row.status === 1) {
				buttons.push(
					h(
						ElButton,
						{
							onClick: () => handleCancel(row),
							type: 'danger',
							link: true,
							icon: 'DocumentDelete',
						},
						{ default: () => '办结' },
					),
				)
			}

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
		const query = { ...queryParams.value, ...params }
		if (query.createTime && query.createTime.length === 2) {
			const [startDate, endDate] = query.createTime

			// 将 createTime[0] 转为当天的 00:00:00
			const startTime = startDate ? `${startDate} 00:00:00` : undefined
			const endTime = endDate ? `${endDate} 23:59:59` : undefined
			query.createTime = [startTime, endTime]
		}
		const res = await ProcessInstanceApi.getProcessInstanceManagerPage(query)
		tableData.value = res.data.pages
		total.value = res.data.totalNum

		loading.value = false
	} finally {
		loading.value = false
	}
	loading.value = false
}

/**
 * 表格行点击事件
 * @param {Object} param 行数据对象
 */
const cellClickEvent = ({ row }) => {
	clickRow.value = row
}

/**
 * 查看流程详情
 * @param {Object} row 行数据
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
 * 取消流程操作
 * @param {Object} row 行数据
 */
const handleCancel = async row => {
	// 二次确认弹窗
	const { value } = await ElMessageBox.prompt('请输入办结原因', '办结流程', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 非空且非纯空格校验
		inputErrorMessage: '办结原因不能为空',
	})
	// 发起取消请求
	await ProcessInstanceApi.cancelProcessInstanceByAdmin(row.id, value)
	message.success('办结成功')
	// 刷新列表
	await getList()
}

// 加载用户选项
const loadUserOptions = async () => {
	try {
		const userResData = await publicApi.getLocalSelect({ type: 'USER' })
		if (userResData && userResData.data) {
			userList.value = userResData.data
		} else {
			userList.value = []
		}
	} catch (error) {
		console.error('加载用户列表失败:', error)
		userList.value = []
	}
}

/**
 * 加载初始化数据（分类、用户、字典）
 */
const loadInitData = async () => {
	// 获取流程分类列表
	const res = await CategoryApi.getCategoryPage()
	categoryList.value = res.data.pages.map(item => ({
		value: item.code,
		label: item.name,
	}))
	// 获取用户列表
	await loadUserOptions()
	// // 获取流程状态字典
	// processStatusDict.value = getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
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
	// 加载初始化数据源
	await loadInitData()
	// 初始化查询列表
	await getList()
})
</script>

<style lang="scss" scoped>
.app-container {
}
</style>
