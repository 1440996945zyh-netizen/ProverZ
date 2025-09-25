<template>
	<!-- 角色管理 -->
	<BaseTable
		ref="baseTable"
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
</template>

<script setup>
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive } from 'vue'
import DropDown from '@/components/DropDown/newIndex'
import { ElTag } from 'element-plus'
import api from '@/api/system/scheduleTask.js'
const { proxy } = getCurrentInstance()
const clickRow = ref({}) //点击当前行
const total = ref(0)
const title = ref('新增')
const detailRef = ref(null)
const detailVisible = ref(false)
const tableHeight = ref(window.innerHeight - 320)
const queryParams = ref({
	startPage: 1,
	pageSize: 10,
})
// 表格数据
const tableData = ref([])
const tableColumns = ref([
	{ label: '任务名称', prop: 'jobName', width: 150 },
	{ label: '任务所在组', prop: 'jobGroup', width: 150 },
	{ label: '任务描述', prop: 'description', minWidth: 200 },
	{ label: '请求类型', prop: 'requestType', width: 100 },
	{ label: '请求url', prop: 'httpUrl', width: 120 },
	{ label: '请求参数', prop: 'httpParams', width: 150 },
	{ label: '创建时间', prop: 'createTime', width: 150, align: 'center' },
	{ label: 'Cron表达式', prop: 'cronExpression', width: 150 },
	{ label: '下次运行时间', prop: 'nextFireTime', width: 150, align: 'center' },
	{
		label: '任务状态',
		prop: 'triggerState',
		align: 'center',
		width: 100,
		fixed: 'right',
		config: 'triggerState',
		render: row => {
			let stateMap = {
				WAITING: 'info',
				PAUSED: 'warning',
				ACQUIRED: 'primary',
				EXECUTING: 'primary',
				COMPLETE: 'success',
				ERROR: 'danger',
			}
			let stateNameMap = {
				WAITING: '等待',
				PAUSED: '暂停',
				ACQUIRED: '已获取',
				EXECUTING: '执行中',
				COMPLETE: '完成',
				ERROR: '错误',
			}
			return [
				h(
					ElTag,
					{
						type: stateMap[row.triggerState] || 'primary',
					},

					{
						default: () => stateNameMap[row.triggerState],
					}
				),
			]
		},
	},
	{
		prop: '',
		label: '操作',
		width: 100,
		align: 'center',
		fixed: 'right',
		render: row => {
			let dropDownList = []
			dropDownList = [
				{
					name: '更新Cron表达式',
					command: '更新Cron表达式',
					type: 'primary',
					link: true,
					click: () => editCron(row),
					permission: 'system:role:update',
				},
				{
					name: '暂停',
					command: '暂停',
					type: 'warning',
					link: true,
					click: () => stop(row),
					permission: 'system:role:update',
				},
				{
					name: '恢复',
					command: '恢复',
					type: 'success',
					link: true,
					click: () => restart(row),
					permission: 'system:role:update',
				},
				{
					name: '删除',
					command: '删除',
					link: true,
					click: () => handleDelete(row),
					permission: 'system:role:update',
					type: 'danger',
				},
				{
					name: '执行记录',
					command: '执行记录',
					type: 'primary',
					link: true,
					click: () => report(row),
					permission: 'system:role:update',
				},
			]
			return [
				h(
					DropDown,
					{
						dropDownList,
					},
					{
						default: () => '',
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
	queryParams.value = e
	api.historyJobs(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
function stop(row) {
	proxy.$modal.confirm('确定暂停？').then(() => {
		api.pause(row.jobName, row.jobGroup).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getList()
		})
	})
}
function restart(row) {
	proxy.$modal.confirm('确定恢复？').then(() => {
		api.resume(row.jobName, row.jobGroup).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getList()
		})
	})
}
/** 删除按钮操作 */
function handleDelete(row) {
	proxy.$modal.confirm('确定删除？').then(() => {
		api.delete(row.jobName, row.jobGroup).then(res => {
			proxy.$modal.msgSuccess(res.msg)
			getList()
		})
	})
}
const editCron = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	detailVisible.value = true
	nextTick(() => {
		detailRef.value.formData = editRow
	})
}
getList(queryParams.value)
defineExpose({
	tableData,
	getList,
	tableHeight,
})
</script>
<style lang="less" scoped></style>
