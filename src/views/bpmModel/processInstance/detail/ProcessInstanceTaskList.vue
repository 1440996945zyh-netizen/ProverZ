<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:19:57
 * @LastEditTime: 2025-12-23 14:33:04
 * @LastEditors: zhangsd
 * @Description: 流程实例任务列表
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceTaskList.vue
-->
<template>
	<el-table :data="tasks" border header-cell-class-name="table-header-gray">
		<el-table-column label="审批节点" prop="name" min-width="120" align="center" />
		<el-table-column label="审批人" min-width="100" align="center">
			<template #default="scope">
				{{ scope.row.assigneeUser?.nickname || scope.row.ownerUser?.nickname }}
			</template>
		</el-table-column>
		<el-table-column :formatter="dateFormatter" align="center" label="开始时间" prop="createTime" min-width="140" />
		<el-table-column :formatter="dateFormatter" align="center" label="结束时间" prop="endTime" min-width="140" />
		<el-table-column align="center" label="审批状态" prop="status" min-width="90">
			<template #default="scope">
				<el-tag :type="BPM_TASK_STATUS.map(item => (item.value === scope.row.status ? item.type : '')).filter(Boolean)[0]">
					{{ BPM_TASK_STATUS.map(item => (item.value == scope.row.status ? item.label : '')).filter(Boolean)[0] }}
				</el-tag>
			</template>
		</el-table-column>
		<el-table-column align="center" label="审批建议" prop="reason" min-width="200">
			<template #default="scope">
				{{ scope.row.reason }}
				<el-button style="margin-left: 10px" size="small" v-if="scope.row.formId > 0" @click="handleFormDetail(scope.row)">
					<el-icon><Document /></el-icon>
					查看表单
				</el-button>
			</template>
		</el-table-column>
		<el-table-column align="center" label="耗时" prop="durationInMillis" min-width="100">
			<template #default="scope">
				{{ formatPast2(scope.row.durationInMillis) }}
			</template>
		</el-table-column>
	</el-table>

	<!-- 弹窗：表单 -->
	<Dialog title="表单详情" v-model="taskFormVisible" width="600">
		<form-create ref="fApi" v-model="taskForm.value" :option="taskForm.option" :rule="taskForm.rule" />
	</Dialog>
</template>

<script lang="js" setup>
import { ref, watch, nextTick } from 'vue'
import { dateFormatter, formatPast2 } from '@/utils/common/date'
import { BPM_TASK_STATUS } from '@/utils/bpm/constantEnumeration'
import { setConfAndFields2 } from '@/utils/bpm/formCreate'
import * as TaskApi from '@/api/system/bpm/task'
import Dialog from '@/components/Dialog'

defineOptions({ name: 'BpmProcessInstanceTaskList' })

// 定义组件Props，替换TS的propTypes为JS原生配置
const props = defineProps({
	loading: {
		type: Boolean,
		default: false, // 是否加载中
	},
	id: {
		type: String,
		required: true, // 流程实例的编号
	},
})

// 响应式变量定义，移除TS类型注解
const tasks = ref([]) // 流程任务的数组

/** 查看表单 */
const fApi = ref(null) // form-create 的 API 操作类（移除ApiAttrs类型注解）
const taskForm = ref({
	rule: [],
	option: {},
	value: {},
}) // 流程任务的表单详情
const taskFormVisible = ref(false)

const handleFormDetail = async row => {
	// 设置表单
	setConfAndFields2(taskForm, row.formConf, row.formFields, row.formVariables)
	// 弹窗打开
	taskFormVisible.value = true
	// 隐藏提交、重置按钮，设置禁用只读
	await nextTick()
	fApi.value.fapi.btn.show(false)
	fApi.value?.fapi?.resetBtn.show(false)
	fApi.value?.fapi?.disabled(true)
}
/**
 * 加载流程任务列表
 */
const loadTasks = async () => {
	const res = await TaskApi.getTaskListByProcessInstanceId(props.id)
	tasks.value = res.data || []
}
/**
 * 只有 loading 完成时，才去加载流程任务列表
 */
watch(
	() => props.loading,
	async value => {
		if (value) {
			await loadTasks()
		}
	},
	{ immediate: true },
)
/**
 * 组件挂载时，加载流程任务列表
 */
onMounted(() => {
	if (!props.loading) {
		loadTasks()
	}
})
</script>

<style lang="css" scoped>
/* 无额外简写样式，保持空样式即可（header-cell-class-name样式由全局定义） */
</style>
