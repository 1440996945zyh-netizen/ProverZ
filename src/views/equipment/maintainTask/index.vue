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
			:showNum="2"
			:rowClassName="rowClassName"
		/>
		<!-- 任务明细 -->
		<el-drawer v-model="isShow" title="任务明细" size="80%">
			<detail ref="viewRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="isShow = false">取消</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>
<script setup name="maintainTask">
import BaseTable from '@/components/BaseTable/index.vue'
import api from '@/api/equipment/maintainTask/index'
import { ref, reactive, nextTick, h, getCurrentInstance, computed, onMounted, watch } from 'vue'
import { ElButton, ElTag, ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import detail from './detail/index.vue'
import publicApi from '@/api/public/index'
const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const selectData = reactive([
	{
		type: 'daterange',
		modelValue: 'date', //对应字段
		span: 16,
		shortcuts: [
			{
				text: '上周',
				value: () => {
					const currentTimestamp = Date.now()
					const currentDate = new Date(currentTimestamp)
					// 获取当前日期的星期几（0表示星期日，1表示星期一，以此类推）
					const currentDayOfWeek = currentDate.getDay()
					// 计算上周的起始日期和结束日期的时间戳
					const lastWeekStartDateTimestamp = currentTimestamp - (currentDayOfWeek + 6) * 24 * 60 * 60 * 1000
					const lastWeekEndDateTimestamp = currentTimestamp - currentDayOfWeek * 24 * 60 * 60 * 1000
					const lastWeekStartDate = new Date(lastWeekStartDateTimestamp)
					const lastWeekEndDate = new Date(lastWeekEndDateTimestamp)
					return [lastWeekStartDate, lastWeekEndDate]
				},
			},
			{
				text: '本周',
				value: () => {
					const currentDate = new Date()
					const currentDayOfWeek = currentDate.getDay()
					// 获取本周的起始日期和结束日期
					const thisWeekStartDate = new Date(currentDate)
					thisWeekStartDate.setDate(currentDate.getDate() - currentDayOfWeek + 1)
					const thisWeekEndDate = new Date(currentDate)
					thisWeekEndDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek) + 1)
					return [thisWeekStartDate, thisWeekEndDate]
				},
			},
			{
				text: '下周',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					const currentDayOfWeek = currentDate.getDay()
					// 获取下周的起始日期和结束日期
					const nextWeekStartDate = new Date(currentDate)
					nextWeekStartDate.setDate(currentDate.getDate() + (8 - currentDayOfWeek))
					const nextWeekEndDate = new Date(currentDate)
					nextWeekEndDate.setDate(currentDate.getDate() + (14 - currentDayOfWeek))
					return [nextWeekStartDate, nextWeekEndDate]
				},
			},
			{
				text: '上月',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 获取上个月的起始日期和结束日期
					const lastMonthStartDate = new Date(currentDate)
					lastMonthStartDate.setMonth(currentDate.getMonth() - 1, 1)

					const lastMonthEndDate = new Date(currentDate)
					lastMonthEndDate.setDate(0)
					return [lastMonthStartDate, lastMonthEndDate]
				},
			},
			{
				text: '本月',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 获取本月的起始日期和结束日期
					const currentMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
					const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
					const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 24 * 60 * 60 * 1000)
					return [currentMonthStartDate, currentMonthEndDate]
				},
			},
			{
				text: '下月',
				value: () => {
					const currentDate = new Date()
					// 获取下月的起始日期和结束日期
					const nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
					const nextMonthEndDate = new Date(nextMonthStartDate.getFullYear(), nextMonthStartDate.getMonth() + 1, 0)
					return [nextMonthStartDate, nextMonthEndDate]
				},
			},
			{
				text: '上季',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 获取上季度的起始日期和结束日期
					const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
					const lastQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 - 3, 1)
					const lastQuarterEndDate = new Date(lastQuarterStartDate.getFullYear(), lastQuarterStartDate.getMonth() + 3, 0)
					return [lastQuarterStartDate, lastQuarterEndDate]
				},
			},
			{
				text: '本季',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 获取本季度的起始日期和结束日期
					const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
					const currentQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
					const nextQuarterStartDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 1)
					const currentQuarterEndDate = new Date(nextQuarterStartDate.getTime() - 24 * 60 * 60 * 1000)
					return [currentQuarterStartDate, currentQuarterEndDate]
				},
			},
			{
				text: '下季',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 获取下季度的起始日期和结束日期
					const currentQuarter = Math.floor(currentDate.getMonth() / 3) // 当前季度
					const nextQuarter = currentQuarter === 3 ? 0 : currentQuarter + 1 // 下季度
					const nextQuarterStartDate = new Date(currentDate.getFullYear(), nextQuarter * 3, 1)
					const nextQuarterEndDate = new Date(
						new Date(nextQuarterStartDate.getFullYear(), nextQuarterStartDate.getMonth() + 3, 1) - 1,
					)
					return [nextQuarterStartDate, nextQuarterEndDate]
				},
			},
			{
				text: '去年',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 计算去年的起始日期和结束日期
					const lastYearStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
					const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
					return [lastYearStartDate, lastYearEndDate]
				},
			},
			{
				text: '今年',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 计算今年的起始日期和结束日期
					const currentYearStartDate = new Date(currentDate.getFullYear(), 0, 1)
					const currentYearEndDate = new Date(currentDate.getFullYear(), 11, 31)
					return [currentYearStartDate, currentYearEndDate]
				},
			},
			{
				text: '明年',
				value: () => {
					// 获取当前日期
					const currentDate = new Date()
					// 计算明年的起始日期和结束日期
					const nextYearStartDate = new Date(currentDate.getFullYear() + 1, 0, 1)
					const nextYearEndDate = new Date(currentDate.getFullYear() + 1, 11, 31)
					return [nextYearStartDate, nextYearEndDate]
				},
			},
		],
	},
	{
		name: '设备小类',
		type: 'select',
		modelValue: 'equipSmallCategoryId',
		dataConfig: {
			params: {
				type: 'EQUIP_TYPE',
				categoryLevel: '3',
			},
		},
		span: 8,
	},
	{
		name: '设备名称',
		type: 'input',
		modelValue: 'equipName',
		span: 2,
	},

	{
		name: '计划类型',
		type: 'select',
		modelValue: 'planType',
		selectData: [
			{ label: '润滑计划', value: '1' },
			{ label: '保养计划', value: '2' },
		],
		span: 2,
	},
	{
		name: '类型',
		type: 'select',
		modelValue: 'equipType',
		selectData: [
			{ label: '日', value: '1' },
			{ label: '周', value: '2' },
			{ label: '月', value: '3' },
			{ label: '年', value: '4' },
			{ label: '运行台时', value: '5' },
			{ label: '里程', value: '6' },
		],
		span: 2,
	},
	{
		name: '状态',
		type: 'select',
		modelValue: 'status',
		selectData: [
			{ label: '未作业', value: '0' },
			{ label: '作业中', value: '1' },
			{ label: '已作业', value: '2' },
		],
		span: 2,
	},
])
const buttonList = ref([])
const total = ref(0)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
const tableData = ref([])
const tableColumns = reactive([
	{ label: '序号', type: 'seq', width: 60, align: 'center', fixed: 'left' },
	{
		label: '计划类型',
		prop: 'planType',
		render: row => {
			return [
				h(
					'span',
					{},
					{
						default: () => (row.planType == '1' ? '润滑计划' : '保养计划'),
					},
				),
			]
		},
	},
	{ label: '设备小类', prop: 'equipSmallCategoryName' },
	{ label: '设备名称', prop: 'equipName' },
	{
		label: '类型',
		prop: 'equipType',
		render: row => {
			return [
				h(
					'span',
					{},
					{
						default: () => equipTypeChange(row),
					},
				),
			]
		},
	},
	{ label: '开始日期', prop: 'startDate' },
	{ label: '结束日期', prop: 'endDate' },
	{ label: '时限（天）', prop: 'timeLimit', align: 'right' },
	{ label: '初始数据', prop: 'initialNumber', align: 'right' },
	{ label: '结束数据', prop: 'deadlineNumber', align: 'right' },
	{ label: '润滑保养人员', prop: 'inspectorName' },
	{
		label: '状态',
		prop: 'status',
		align: 'center',
		width: 100,
		render: row => {
			return [
				h(
					ElTag,
					{
						type: row.status == '2' ? 'success' : row.status == '1' ? 'primary' : 'info',
					},
					{
						default: () => (row.status == '2' ? '已作业' : row.status == '1' ? '作业中' : '未作业'),
					},
				),
			]
		},
	},
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
						onClick: () => {
							handleUpdate(row)
						},
						type: 'primary',
						link: true,
						icon: 'View',
					},
					{
						default: () => '详情',
					},
				),
			]
		},
	},
])
const equipTypeChange = e => {
	if (e) {
		switch (e.equipType) {
			case '1':
				return '日'
				break
			case '2':
				return '周'
				break
			case '3':
				return '月'
				break
			case '4':
				return '年'
				break
			case '5':
				return '运行台时'
				break
			case '6':
				return '里程'
				break
			default:
				'日'
		}
	} else {
		return '日'
	}
}
const rowClassName = ({ row }) => {
	if (row.status !== 2 && row.status !== '2') {
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
// 查询主列表
const getList = e => {
	queryParams.value = e
	queryParams.value.startTime = queryParams.value.date ? queryParams.value.date[0] : ''
	queryParams.value.endTime = queryParams.value.date ? queryParams.value.date[1] : ''
	api.getList(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
// 抽屉Ref
const viewRef = ref(null)
const isShow = ref(false)
const handleUpdate = row => {
	isShow.value = true
	nextTick(() => {
		viewRef.value.taskId = row.id
		viewRef.value.getList()
	})
}

const initFromHomeParams = () => {
	const { fromHome, status, planType } = route.query
	if (fromHome === '1') {
		const initData = {}
		queryParams.value = {
			startPage: 1,
			pageSize: 20,
		}
		if (status) {
			queryParams.value.status = status
			initData.status = status
		}
		if (planType) {
			queryParams.value.planType = planType
			initData.planType = planType
		}
		setTimeout(() => {
			proxy.$bus.emit('setInitSearchData', initData)
			getList(queryParams.value)
		}, 100)
		router.replace({ path: route.path, query: {} })
	} else {
		getList(queryParams.value)
	}
}

watch(
	() => route.query,
	newQuery => {
		const { fromHome, status, planType } = newQuery
		if (fromHome === '1') {
			const initData = {}
			queryParams.value = {
				startPage: 1,
				pageSize: 20,
			}
			if (status) {
				queryParams.value.status = status
				initData.status = status
			}
			if (planType) {
				queryParams.value.planType = planType
				initData.planType = planType
			}
			setTimeout(() => {
				proxy.$bus.emit('setInitSearchData', initData)
				getList(queryParams.value)
			}, 100)
			router.replace({ path: route.path, query: {} })
		}
	},
)

onMounted(() => {
	initFromHomeParams()
})
</script>

<style scoped>
:deep(.row-due) {
	background-color: #fcedd9 !important;
}
:deep(.row-overdue) {
	background-color: #fce9e9 !important;
}
</style>
