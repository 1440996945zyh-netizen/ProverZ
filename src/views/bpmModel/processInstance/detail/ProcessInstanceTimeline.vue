<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:20:17
 * @LastEditTime: 2025-12-23 10:35:25
 * @LastEditors: zhangsd
 * @Description: 流程实例时间线
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceTimeline.vue
-->
<!-- 审批详情的右侧：审批流 -->
<template>
	<el-timeline style="padding-top: 20px">
		<!-- 遍历每个审批节点 -->
		<el-timeline-item
			v-for="(activity, index) in activityNodes"
			:key="index"
			size="large"
			:icon="getApprovalNodeIcon(activity.status, activity.nodeType)"
			:color="getApprovalNodeColor(activity.status)"
		>
			<template #dot>
				<div
					style="
						position: absolute;
						left: -10px;
						top: -6px;
						border-radius: 50%;
						border: 1px solid #dedede;
						width: 30px;
						height: 30px;
						display: flex;
						justify-content: center;
						align-items: center;
						background-color: #3f73f7;
						padding: 5px;
					"
				>
					<img style="width: 100%; height: 100%" :src="getApprovalNodeImg(activity.nodeType)" alt="" />
					<div
						v-if="props.showStatusIcon"
						style="
							position: absolute;
							top: 17px;
							left: 17px;
							border-radius: 50%;
							display: flex;
							align-items: center;
							padding: 1px;
							border: 2px solid #fff;
							border-style: solid;
						"
						:style="{ backgroundColor: getApprovalNodeColor(activity.status) }"
					>
						<el-icon :size="11" color="#fff">
							<component :is="getApprovalNodeIcon(activity.status, activity.nodeType)" />
						</el-icon>
					</div>
				</div>
			</template>
			<div
				style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px"
				:id="`activity-task-${activity.id}-${index}`"
			>
				<!-- 第一行：节点名称、时间 -->
				<div style="display: flex; width: 100%">
					<div style="font-weight: bold">
						{{ activity.name }}
						<span v-if="activity.status === TaskStatusEnum.SKIP">【跳过】</span>
					</div>
					<!-- 信息：时间 -->
					<div
						v-if="activity.status !== TaskStatusEnum.NOT_START"
						style="color: #a5a5a5; font-size: 13px; margin-top: 1px; margin-left: auto"
					>
						{{ getApprovalNodeTime(activity) }}
					</div>
				</div>
				<div v-if="activity.nodeType === NodeType.CHILD_PROCESS_NODE">
					<el-button
						type="primary"
						plain
						size="small"
						@click="handleChildProcess(activity)"
						:disabled="!activity.processInstanceId"
					>
						查看子流程
					</el-button>
				</div>
				<!-- 需要自定义选择审批人 -->
				<div
					style="display: flex; flex-wrap: wrap; gap: 2px; align-items: center"
					v-if="
						isEmpty(activity.tasks) &&
						((CandidateStrategy.START_USER_SELECT === activity.candidateStrategy && isEmpty(activity.candidateUsers)) ||
							(props.enableApproveUserSelect && CandidateStrategy.APPROVE_USER_SELECT === activity.candidateStrategy))
					"
				>
					<!--  && activity.nodeType === NodeType.USER_TASK_NODE -->
					<el-tooltip content="添加用户" placement="left">
						<el-button
							style="padding-left: 6px !important; padding-right: 6px !important"
							@click="handleSelectUser(activity.id, customApproveUsers[activity.id])"
						>
							<img style="width: 18px; color: #ccc" src="@/assets/icons/bpm/add-user.svg" alt="" />
						</el-button>
					</el-tooltip>
					<div
						v-for="(user, idx1) in customApproveUsers[activity.id]"
						:key="idx1"
						style="
							background-color: #f1f1f1;
							height: 35px;
							border-radius: 30px;
							display: flex;
							align-items: center;
							padding-right: 8px;
							color: #666;
							position: relative;
						"
					>
						<el-avatar style="margin: 5px !important" :size="28" v-if="user.avatar" :src="user.avatar" />
						<el-avatar style="margin: 5px !important" :size="28" v-else>
							{{ user.userName.substring(0, 1) }}
						</el-avatar>
						{{ user.userName }}
					</div>
				</div>
				<div v-else style="display: flex; align-items: center; flex-wrap: wrap; margin-top: 1px; gap: 2px">
					<!-- 情况一：遍历每个审批节点下的【进行中】task 任务 -->
					<div
						v-for="(task, idx) in activity.tasks"
						:key="idx"
						style="display: flex; flex-direction: column; padding-right: 2px; gap: 2px"
					>
						<div
							style="position: relative; display: flex; flex-wrap: wrap; gap: 2px"
							v-if="task.assigneeUser || task.ownerUser"
						>
							<!-- 信息：头像昵称 -->
							<div
								style="
									background-color: #f1f1f1;
									height: 35px;
									border-radius: 30px;
									display: flex;
									align-items: center;
									padding-right: 8px;
									color: #666;
									position: relative;
								"
							>
								<template v-if="task.assigneeUser?.avatar || task.assigneeUser?.userName">
									<el-avatar
										style="margin: 5px !important"
										:size="28"
										v-if="task.assigneeUser?.avatar"
										:src="task.assigneeUser?.avatar"
									/>
									<el-avatar style="margin: 5px !important" :size="28" v-else>
										{{ task.assigneeUser?.userName.substring(0, 1) }}
									</el-avatar>
									{{ task.assigneeUser?.userName }}
								</template>
								<template v-else-if="task.ownerUser?.avatar || task.ownerUser?.userName">
									<el-avatar
										style="margin: 5px !important"
										:size="28"
										v-if="task.ownerUser?.avatar"
										:src="task.ownerUser?.avatar"
									/>
									<el-avatar style="margin: 5px !important" :size="28" v-else>
										{{ task.ownerUser?.userName.substring(0, 1) }}
									</el-avatar>
									{{ task.ownerUser?.userName }}
								</template>
								<!-- 信息：任务 ICON -->
								<div
									v-if="props.showStatusIcon && onlyStatusIconShow.includes(task.status)"
									style="
										position: absolute;
										top: 19px;
										left: 23px;
										border-radius: 50%;
										display: flex;
										align-items: center;
										padding: 1px;
										border: 2px solid #fff;
										border-style: solid;
									"
									:style="{ backgroundColor: statusIconMap2[task.status]?.color }"
								>
									<el-icon :size="11" color="#FFFFFF">
										<component :is="statusIconMap2[task.status]?.icon" />
									</el-icon>
								</div>
							</div>
						</div>
						<teleport defer :to="`#activity-task-${activity.id}-${index}`">
							<div
								v-if="task.reason && [NodeType.USER_TASK_NODE, NodeType.END_EVENT_NODE].includes(activity.nodeType)"
								style="
									color: #a5a5a5;
									font-size: 13px;
									margin-top: 1px;
									width: 100%;
									background-color: #f8f8fa;
									padding: 8px;
									border-radius: 6px;
								"
							>
								<!-- TODO lesan：这里如果是办理，需要是办理意见 -->
								审批意见：{{ task.reason }}
							</div>
							<div
								v-if="task.signPicUrl && activity.nodeType === NodeType.USER_TASK_NODE"
								style="
									color: #a5a5a5;
									font-size: 13px;
									margin-top: 1px;
									width: 100%;
									background-color: #f8f8fa;
									padding: 8px;
									border-radius: 6px;
								"
							>
								签名：
								<el-image
									style="width: 90px; height: 40px; margin-left: 5px"
									:src="task.signPicUrl"
									:preview-src-list="[task.signPicUrl]"
								/>
							</div>
						</teleport>
					</div>
					<!-- 情况二：遍历每个审批节点下的【候选的】task 任务。例如说，1）依次审批，2）未来的审批任务等 -->
					<div
						v-for="(user, idx1) in activity.candidateUsers"
						:key="idx1"
						style="
							background-color: #f1f1f1;
							height: 35px;
							border-radius: 30px;
							display: flex;
							align-items: center;
							padding-right: 8px;
							color: #666;
							position: relative;
						"
					>
						<el-avatar style="margin: 5px !important" :size="28" v-if="user.avatar" :src="user.avatar" />
						<el-avatar style="margin: 5px !important" :size="28" v-else>
							{{ user.userName.substring(0, 1) }}
						</el-avatar>
						{{ user.userName }}

						<!-- 信息：任务 ICON -->
						<div
							v-if="props.showStatusIcon"
							style="
								position: absolute;
								top: 20px;
								left: 24px;
								border-radius: 50%;
								display: flex;
								align-items: center;
								padding: 1px;
								border: 2px solid #fff;
								border-style: solid;
							"
							:style="{ backgroundColor: statusIconMap2['-1']?.color }"
						>
							<el-icon :size="11" color="#FFFFFF">
								<component :is="statusIconMap2['-1']?.icon" />
							</el-icon>
						</div>
					</div>
				</div>
			</div>
		</el-timeline-item>
	</el-timeline>

	<!-- 用户选择弹窗 -->
	<UserSelectForm ref="userSelectFormRef" @confirm="handleUserSelectConfirm" />
</template>

<script lang="js" setup>
import { ref, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/common/date'
// import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { TaskStatusEnum } from '@/api/system/bpm/task'
import { NodeType, CandidateStrategy } from '@/components/bpmnProcessDesigner/package/penal/consts'
import { isEmpty } from '@/utils/common/form-validation'

// 导入本地SVG资源
import starterSvg from '@/assets/icons/bpm/starter.svg'
import auditorSvg from '@/assets/icons/bpm/auditor.svg'
import copySvg from '@/assets/icons/bpm/copy.svg'
import conditionSvg from '@/assets/icons/bpm/condition.svg'
import parallelSvg from '@/assets/icons/bpm/parallel.svg'
import finishSvg from '@/assets/icons/bpm/finish.svg'
import transactorSvg from '@/assets/icons/bpm/transactor.svg'
import childProcessSvg from '@/assets/icons/bpm/child-process.svg'

defineOptions({ name: 'BpmProcessInstanceTimeline' })

// 定义Props（替换TS的withDefaults+泛型为JS原生配置）
const props = defineProps({
	activityNodes: {
		type: Array,
		required: true, // 审批节点信息
	},
	showStatusIcon: {
		type: Boolean,
		default: true, // 是否显示头像右下角状态图标
	},
	enableApproveUserSelect: {
		type: Boolean,
		default: false, // 是否开启审批人自选功能
	},
})

// 定义事件（替换TS的emit泛型）
const emit = defineEmits(['selectUserConfirm'])

// 路由实例
const { push } = useRouter()

// 审批节点状态图标映射（替换字符串icon为Element Plus图标组件）
const statusIconMap2 = {
	// 跳过
	'-2': { color: '#cccccc', icon: 'ArrowDown' },
	// 未开始
	'-1': { color: '#909398', icon: 'Clock' },
	// 待审批
	0: { color: '#00b32a', icon: 'Clock' },
	// 审批中
	1: { color: '#448ef7', icon: 'Loading' },
	// 审批通过
	2: { color: '#00b32a', icon: 'CircleCheckFilled' },
	// 审批不通过
	3: { color: '#f46b6c', icon: 'Close' },
	// 取消
	4: { color: '#cccccc', icon: 'DeleteFilled' },
	// 退回
	5: { color: '#f46b6c', icon: 'RemoveFilled' },
	// 委派中
	6: { color: '#448ef7', icon: 'Loading' },
	// 审批通过中
	7: { color: '#00b32a', icon: 'CircleCheckFilled' },
}

const statusIconMap = {
	// 跳过
	'-2': { color: '#909398', icon: 'ArrowDown' },
	// 审批未开始
	'-1': { color: '#909398', icon: 'Clock' },
	0: { color: '#00b32a', icon: 'Clock' },
	// 审批中
	1: { color: '#448ef7', icon: 'Loading' },
	// 审批通过
	2: { color: '#00b32a', icon: 'Check' },
	// 审批不通过
	3: { color: '#f46b6c', icon: 'Close' },
	// 已取消
	4: { color: '#cccccc', icon: 'Delete' },
	// 退回
	5: { color: '#f46b6c', icon: 'Minus' },
	// 委派中
	6: { color: '#448ef7', icon: 'Loading' },
	// 审批通过中
	7: { color: '#00b32a', icon: 'Check' },
}

const nodeTypeSvgMap = {
	// 结束节点
	[NodeType.END_EVENT_NODE]: { color: '#909398', svg: finishSvg },
	// 发起人节点
	[NodeType.START_USER_NODE]: { color: '#909398', svg: starterSvg },
	// 审批人节点
	[NodeType.USER_TASK_NODE]: { color: '#ff943e', svg: auditorSvg },
	// 办理人节点
	[NodeType.TRANSACTOR_NODE]: { color: '#ff943e', svg: transactorSvg },
	// 抄送人节点
	[NodeType.COPY_TASK_NODE]: { color: '#3296fb', svg: copySvg },
	// 条件分支节点
	[NodeType.CONDITION_NODE]: { color: '#14bb83', svg: conditionSvg },
	// 并行分支节点
	[NodeType.PARALLEL_BRANCH_NODE]: { color: '#14bb83', svg: parallelSvg },
	// 子流程节点
	[NodeType.CHILD_PROCESS_NODE]: { color: '#14bb83', svg: childProcessSvg },
}

// 只有状态是 -1、0、1 才展示头像右小角状态小icon
const onlyStatusIconShow = [-1, 0, 1]

// timeline时间线上icon图标
const getApprovalNodeImg = nodeType => {
	return nodeTypeSvgMap[nodeType]?.svg
}

const getApprovalNodeIcon = (taskStatus, nodeType) => {
	if (taskStatus == TaskStatusEnum.NOT_START) {
		return statusIconMap[taskStatus]?.icon
	}

	if (
		nodeType === NodeType.START_USER_NODE ||
		nodeType === NodeType.USER_TASK_NODE ||
		nodeType === NodeType.TRANSACTOR_NODE ||
		nodeType === NodeType.CHILD_PROCESS_NODE ||
		nodeType === NodeType.END_EVENT_NODE
	) {
		return statusIconMap[taskStatus]?.icon
	}
}

const getApprovalNodeColor = taskStatus => {
	return statusIconMap[taskStatus]?.color
}

const getApprovalNodeTime = node => {
	if (node.nodeType === NodeType.START_USER_NODE && node.startTime) {
		return `${formatDate(node.startTime)}`
	}
	if (node.endTime) {
		return `${formatDate(node.endTime)}`
	}
	if (node.startTime) {
		return `${formatDate(node.startTime)}`
	}
}

// 选择自定义审批人
const userSelectFormRef = ref(null)
const handleSelectUser = (activityId, selectedList) => {
	userSelectFormRef.value.open(activityId, selectedList)
}

const customApproveUsers = ref({}) // key：activityId，value：用户列表
// 选择完成
const handleUserSelectConfirm = (activityId, userList) => {
	customApproveUsers.value[activityId] = userList || []
	emit('selectUserConfirm', activityId, userList)
}

/** 跳转子流程 */
const handleChildProcess = activity => {
	if (!activity.processInstanceId) {
		return
	}
	push({
		name: 'BpmProcessInstanceDetail',
		query: {
			id: activity.processInstanceId,
		},
	})
}

/** 设置自定义审批人 */
const setCustomApproveUsers = (activityId, users) => {
	customApproveUsers.value[activityId] = users || []
}

/** 批量设置多个节点的自定义审批人 */
const batchSetCustomApproveUsers = data => {
	Object.keys(data).forEach(activityId => {
		customApproveUsers.value[activityId] = data[activityId] || []
	})
}

// 暴露方法给父组件
defineExpose({ setCustomApproveUsers, batchSetCustomApproveUsers })
</script>
