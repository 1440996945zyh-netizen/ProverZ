<template>
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:total="total"
			:showNum="3"
			:defaultWidth="47"
			:rowClassName="rowClassName"
		/>
		<!-- 任务明细 -->
		<el-drawer v-model="isShow" title="巡检任务明细" size="80%">
			<detail ref="viewRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="isShow = false">取消</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script setup name="patrolTask">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/patrolTask/index'
import { ref, reactive, nextTick, h, getCurrentInstance } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import detail from './detail/index.vue'

const { proxy } = getCurrentInstance()

const selectData = reactive([
	{
		name: '巡检人',
		type: 'input',
		modelValue: 'patrolName',
		span: 6,
	},
	{
		type: 'daterange',
		modelValue: 'date',
		span: 12,
		shortcuts: [
			{
				text: '本周',
				value: () => {
					const currentDate = new Date()
					const currentDayOfWeek = currentDate.getDay()
					const thisWeekStartDate = new Date(currentDate)
					thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
					const thisWeekEndDate = new Date(currentDate)
					thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
					return [thisWeekStartDate, thisWeekEndDate]
				},
			},
			{
				text: '本月',
				value: () => {
					const currentDate = new Date()
					const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
					const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
					const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
					return [currentMonthStartDate, currentMonthEndDate]
				},
			},
		],
	},
	{
		name: '巡检状态',
		type: 'select',
		modelValue: 'status',
		selectData: [
			{ label: '未检', value: '0' },
			{ label: '进行中', value: '1' },
			{ label: '已检', value: '2' },
		],
		span: 6,
	},
])

const rowClassName = ({ row }) => {
	if (row.status !== 2 || row.status !== '2') {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const endDate = row.endDate ? new Date(row.endDate) : null
		if (endDate) {
			endDate.setHours(0, 0, 0, 0)
			if (endDate.getTime() === today.getTime()) {
				return 'row-due'
			} else if (endDate < today) {
				return 'row-overdue'
			}
		}
	}
	return ''
}

const buttonList = ref([{ label: 'hidden', vif: false }])
const total = ref(0)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])

const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{ label: '计划名称', prop: 'planName', width: 150 },
	{ label: '巡检路线', prop: 'routeName', width: 150 },
	{
		label: '巡检路线等级',
		prop: 'routeLevel',
		minWidth: 80,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.routeLevel == '1' ? '' : 'warning',
					},
					{
						default: () => (row.routeLevel == '1' ? '普通' : '高危'),
					},
				),
			]
		},
	},
	{ label: '巡检员', prop: 'patrolName', minWidth: 120 },
	{ label: '开始日期', prop: 'startDate', width: 160 },
	{ label: '结束日期', prop: 'endDate', width: 160 },
	{
		label: '任务状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: row => {
			const statusMap = {
				0: { text: '未检', type: 'info' },
				1: { text: '进行中', type: 'primary' },
				2: { text: '已检', type: 'success' },
			}
			const status = statusMap[row.status] || { text: '未知', type: 'info' }
			return [h(ElTag, { type: status.type }, { default: () => status.text })]
		},
	},
	{ label: '创建人', prop: 'createByName', minWidth: 100 },
	{ label: '创建时间', prop: 'createTime', width: 160 },
	{
		prop: '',
		label: '操作',
		width: 80,
		fixed: 'right',
		align: 'center',
		render: row => {
			return [
				h(
					ElButton,
					{
						onClick: () => handleUpdate(row),
						type: 'primary',
						link: true,
						icon: 'View',
					},
					{ default: () => '详情' },
				),
			]
		},
	},
])

// 查询主列表
const getList = e => {
	queryParams.value = { ...queryParams.value, ...e }
	queryParams.value.startDate = queryParams.value.date ? proxy.parseTime(queryParams.value.date[0], '{y}-{m}-{d}') : ''
	queryParams.value.endDate = queryParams.value.date ? proxy.parseTime(queryParams.value.date[1], '{y}-{m}-{d}') : ''
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}

const viewRef = ref(null)
const isShow = ref(false)
const handleUpdate = row => {
	isShow.value = true
	nextTick(() => {
		viewRef.value.taskId = row.id
		viewRef.value.getList()
	})
}

getList(queryParams.value)
</script>

<style scoped>
:deep(.row-due) {
	background-color: #fcedd9 !important;
}
:deep(.row-overdue) {
	background-color: #fce9e9 !important;
}
</style>
