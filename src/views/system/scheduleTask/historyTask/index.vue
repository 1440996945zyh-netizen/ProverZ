<template>
	<BaseTable
		ref="historyTaskTableRef"
		:showSearchHeader="true"
		:selectData="selectData"
		:tableHeight="tableHeight"
		:searchClick="getList"
		:tableColumns="tableColumns"
		:tableData="tableData"
		:cellClickEvent="cellClickEvent"
		:total="total"
		:defaultWidth="40"
	/>
	<!-- 执行记录弹窗 -->
	<Dialog v-model:visible="reportVisible" :title="title" :isFullscreen="true" :width="1000">
		<reportDetail ref="reportRef" />
		<template #footer>
			<div style="flex: auto">
				<el-button @click="reportVisible = false">关闭</el-button>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive } from 'vue'
import Dialog from '@/components/Dialog/index.vue'
import reportDetail from '../report/index.vue'
import { ElButton, ElTag } from 'element-plus'
import api from '@/api/system/scheduleTask.js'
const { proxy } = getCurrentInstance()
const clickRow = ref({}) //点击当前行
const title = ref('')
const total = ref(0)
const reportRef = ref(null)
const historyTaskTableRef = ref(null) // table的ref

const reportVisible = ref(false)
const tableHeight = ref(window.innerHeight - 320)
const queryParams = ref({
	startPage: 1,
	pageSize: 20,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '任务名称', prop: 'jobName', width: 150 },
	{ label: '任务所在组', prop: 'jobGroup', width: 150 },
	{ label: '任务描述', prop: 'description', minWidth: 200 },
	{ label: '请求类型', prop: 'requestType', width: 100 },
	{ label: '请求url', prop: 'httpUrl', minWidth: 500 },
	{ label: '请求参数', prop: 'httpParams', width: 150 },
	{ label: '创建时间', prop: 'createTime', width: 150, align: 'center' },
	// { label: 'Cron表达式', prop: 'cronExpression', width: 150 },
	{
		prop: '',
		label: '操作',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			return [
				h(
					ElButton,
					{
						type: 'primary',
						size: 'mini',
						plain: true,
						link: true,
						onClick: () => {
							report(row)
						},
					},
					{
						default: () => '执行记录',
					}
				),
			]
		},
	},
])
const selectData = reactive([
	{
		name: '任务名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'jobName', // 绑定字段
		span: 8, // 占位，共24
	},
	{
		name: '任务组名称', // 搜索框name
		type: 'input', // 搜索框类型
		modelValue: 'jobGroup', // 绑定字段
		span: 8, // 占位，共24
	},

	{
		name: '任务状态',
		type: 'select',
		modelValue: 'status',
		span: 8,
		selectData: [
			{ label: '暂停', value: '0' },
			{ label: '开启', value: '1' },
		],
	},
])

// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.historyJobs(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 执行记录 */
const report = row => {
	reportVisible.value = true
	title.value = '执行记录'
	nextTick(() => {
		api.getJobLogs(row).then(res => {
			reportRef.value.tableData = res.data.pages
			reportRef.value.total = res.data.totalNum
		})
	})
}
getList(historyTaskTableRef.value?.buildQueryParams())
defineExpose({
	tableData,
	getList,
	tableHeight,
})
</script>
<style lang="less" scoped></style>
