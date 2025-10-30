<template>
	<!-- 角色管理 -->
	<div class="app-container">
		<BaseTable
			ref="baseTable"
			:showSearchHeader="true"
			:selectData="selectData"
			:searchClick="getList"
			:buttonList="buttonList"
			:tableColumns="tableColumns"
			:tableData="tableData"
			:cellClickEvent="cellClickEvent"
			:total="total"
			:defaultWidth="50"
		/>
		<!-- 新增抽屉组件 -->
		<Dialog v-model:visible="detailVisible" :title="title" :width="600">
			<detail ref="detailRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="detailVisible = false">取消</el-button>
					<el-button type="primary" @click="save">保存</el-button>
				</div>
			</template>
		</Dialog>
		<!-- 编辑抽屉组件 -->
		<Dialog v-model:visible="updateCronVisible" :title="title" :width="600">
			<updateCronDetail ref="updateCronRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="updateCronVisible = false">取消</el-button>
					<el-button type="primary" @click="updateCron">保存</el-button>
				</div>
			</template>
		</Dialog>
		<!-- 执行记录弹窗 -->
		<Dialog v-model:visible="reportVisible" :title="title" :isFullscreen="true" :width="1000">
			<reportDetail ref="reportRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="reportVisible = false">关闭</el-button>
				</div>
			</template>
		</Dialog>
		<Dialog v-model:visible="historyVisible" title="历史任务" :isFullscreen="true" :width="1000">
			<historyTask ref="historyTaskRef" />
			<template #footer>
				<div style="flex: auto">
					<el-button @click="historyVisible = false">关闭</el-button>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup name="role">
import BaseTable from '@/components/BaseTable/index.vue'
import { ref, reactive, nextTick } from 'vue'
import detail from './detail/index.vue'
import updateCronDetail from './updateCron/index.vue'
import reportDetail from './report/index.vue'
import DropDown from '@/components/DropDown/newIndex'
import Dialog from '@/components/Dialog/index.vue'
import { ElTag } from 'element-plus'
import api from '@/api/system/scheduleTask.js'
import historyTask from './historyTask/index.vue'
const { proxy } = getCurrentInstance()
const clickRow = ref({}) //点击当前行
const total = ref(0)
const title = ref('新增')
const detailRef = ref(null)
const detailVisible = ref(false)
const historyVisible = ref(false)
const historyTaskRef = ref(null)
const updateCronVisible = ref(false)
const reportVisible = ref(false)
const reportRef = ref(null)
const updateCronRef = ref(null)
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
	{ label: '请求url', prop: 'httpUrl', width: 120 },
	{ label: '请求参数', prop: 'httpParams', width: 150 },
	{ label: 'Cron表达式', prop: 'cronExpression', width: 150 },
	{ label: '创建时间', prop: 'createTime', width: 150, align: 'center' },
	{ label: '下次运行时间', prop: 'nextFireTime', width: 150, align: 'center' },
	{
		label: '任务状态',
		prop: 'jobStatusInfo',
		align: 'center',
		width: 100,
		fixed: 'right',
		config: 'jobStatusInfo',
		render: row => {
			const stateMap = {
				NORMAL: 'primary',
				WAITING: 'primary',
				PAUSED: 'info',
				ACQUIRED: 'primary',
				EXECUTING: 'primary',
				COMPLETE: 'success',
				ERROR: 'danger',
			}
			const stateLabelMap = {
				NORMAL: '正常',
				WAITING: '正常',
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
						type: stateMap[row.jobStatusInfo] || 'primary',
					},

					{
						default: () => stateLabelMap[row.jobStatusInfo] || '无',
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
		modelValue: 'triggerState',
		span: 8,
		selectData: [
			// { label: '正常', value: 'NORMAL' },
			{ label: '正常', value: 'WAITING' },
			{ label: '暂停', value: 'PAUSED' },
			{ label: '已获取', value: 'ACQUIRED' },
			{ label: '执行中', value: 'EXECUTING' },
			{ label: '完成', value: 'COMPLETE' },
			{ label: '错误', value: 'ERROR' },
		],
	},
])
const buttonList = reactive([
	{
		label: '添加任务', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'Plus', // 按钮图标，支持element-Plus中所有图标
		click: () => add, // 回调函数
		permission: 'system:role:insert', // 权限
	},
	{
		label: '历史任务', // 按钮名称
		type: 'primary', // 按钮类型
		icon: 'View', // 按钮图标，支持element-Plus中所有图标
		click: () => toHistoryTask, // 回调函数
		permission: 'system:role:dispatchUser', // 权限
	},
])

// 点击查询的事件
const getList = e => {
	queryParams.value = Object.assign(queryParams.value, e)
	api.getJobs(queryParams.value).then(res => {
		tableData.value = res.data.pages
		total.value = res.data.totalNum
	})
}
/** 历史任务 */
const toHistoryTask = () => {
	historyVisible.value = true
	nextTick(() => {
		historyTaskRef.value.getList()
	})
}
/** 提交按钮 */
const save = async () => {
	if (await detailRef.value.validate()) {
		const params = JSON.parse(JSON.stringify(detailRef.value.formData))
		proxy.$modal.confirm('确定保存？').then(() => {
			api.addPostJsonJob(params).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				detailVisible.value = false
				getList()
			})
		})
	}
}
/**
 * 修改cron表达式
 */
const updateCron = async () => {
	if (await updateCronRef.value.validate()) {
		proxy.$modal.confirm('确定保存？').then(() => {
			api.updateJob(
				updateCronRef.value.formData.jobName,
				updateCronRef.value.formData.jobGroup,
				updateCronRef.value.formData.cronExpression
			).then(res => {
				proxy.$modal.msgSuccess(res.msg)
				updateCronVisible.value = false
				getList()
			})
		})
	}
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
/** 执行记录 */
const report = row => {
	reportVisible.value = true
	nextTick(() => {
		title.value = '执行记录'
		proxy.setFormData(reportRef.value.queryParams, row)
		api.getJobLogs(row).then(res => {
			reportRef.value.tableData = res.data.pages
			reportRef.value.total = res.data.totalNum
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

const add = () => {
	detailVisible.value = true
	title.value = '新增'
	nextTick(() => {
		detailRef.value.resetForm() // 清空事件
	})
}
const editCron = row => {
	const editRow = row || clickRow.value // 拿到所编辑行的数据
	title.value = '编辑'
	updateCronVisible.value = true
	nextTick(() => {
		updateCronRef.value.resetForm()
		proxy.setFormData(updateCronRef.value.formData, editRow)
	})
}
getList(queryParams.value)
</script>
<style lang="less" scoped></style>
