<!--
 * @Author: zhangsd
 * @Date: 2025-12-22 17:20:17
 * @LastEditTime: 2026-02-10 17:01:54
 * @LastEditors: zhangsd
 * @Description: 流程实例时间线 (和谐优化版)
 * @FilePath: \view\src\views\bpmModel\processInstance\detail\ProcessInstanceTimeline.vue
-->
<template>
	<el-timeline class="process-timeline">
		<!-- 遍历每个审批节点 -->
		<el-timeline-item
			v-for="(activity, index) in activityNodes"
			:key="index"
			size="large"
			:icon="getApprovalNodeIcon(activity.status, activity.nodeType)"
			:color="getApprovalNodeColor(activity.status)"
		>
			<!-- 1. 优化时间线节点图标 -->
			<template #dot>
				<div class="timeline-dot">
					<img class="dot-main-icon" :src="getApprovalNodeImg(activity.nodeType)" alt="" />
					<div
						v-if="props.showStatusIcon"
						class="dot-status-icon"
						:style="{ backgroundColor: getApprovalNodeColor(activity.status) }"
					>
						<el-icon :size="10" color="#fff">
							<component :is="getApprovalNodeIcon(activity.status, activity.nodeType)" />
						</el-icon>
					</div>
				</div>
			</template>

			<!-- 2. 优化节点内容布局 -->
			<div class="timeline-content" :id="`activity-task-${activity.id}-${index}`">
				<!-- 第一行：节点名称、时间 -->
				<div class="node-header">
					<div class="node-title">
						{{ activity.name }}
						<span v-if="activity.status === TaskStatusEnum.SKIP" class="node-skip-tag">【跳过】</span>
					</div>
					<div v-if="activity.status !== TaskStatusEnum.NOT_START" class="node-time">
						{{ getApprovalNodeTime(activity) }}
					</div>
				</div>

				<!-- 子流程按钮 -->
				<div v-if="activity.nodeType === NodeType.CHILD_PROCESS_NODE">
					<el-button
						type="primary"
						link
						size="small"
						@click="handleChildProcess(activity)"
						:disabled="!activity.processInstanceId"
					>
						查看子流程
					</el-button>
				</div>

				<!-- 3. 优化审批人显示区域 -->
				<div class="approver-container">
					<!-- 情况：自选审批人 -->
					<template v-if="shouldShowUserSelector(activity)">
						<el-tooltip content="添加用户" placement="top">
							<el-button class="add-user-btn" circle @click="handleSelectUser(activity.id, customApproveUsers[activity.id])">
								<el-icon :size="16"><Plus /></el-icon>
							</el-button>
						</el-tooltip>
						<div v-for="(user, idx1) in customApproveUsers[activity.id]" :key="idx1" class="user-tag">
							<el-avatar :size="20" v-if="user.avatar" :src="user.avatar" />
							<el-avatar :size="20" v-else>{{ user.userName.substring(0, 1) }}</el-avatar>
							<span class="user-name">{{ user.userName }}</span>
						</div>
					</template>

					<!-- 情况：已有任务或候选人 -->
					<template v-else>
						<!-- 遍历 Task -->
						<div v-for="(task, idx) in activity.tasks" :key="idx" class="user-tag-wrapper">
							<div v-if="task.assigneeUser || task.ownerUser" class="user-tag">
								<template v-if="task.assigneeUser?.userName || task.ownerUser?.userName">
									<el-avatar :size="20" :src="task.assigneeUser?.avatar || task.ownerUser?.avatar">
										{{ (task.assigneeUser?.userName || task.ownerUser?.userName).substring(0, 1) }}
									</el-avatar>
									<span class="user-name">{{ task.assigneeUser?.userName || task.ownerUser?.userName }}</span>
								</template>
								<!-- 状态小图标 -->
								<div
									v-if="props.showStatusIcon && onlyStatusIconShow.includes(task.status)"
									class="user-status-dot"
									:style="{ backgroundColor: statusIconMap2[task.status]?.color }"
								>
									<el-icon :size="9" color="#FFFFFF">
										<component :is="statusIconMap2[task.status]?.icon" />
									</el-icon>
								</div>
							</div>
						</div>

						<!-- 遍历 候选人 -->
						<div v-for="(user, idx1) in activity.candidateUsers" :key="idx1" class="user-tag">
							<el-avatar :size="20" :src="user.avatar">{{ user.userName.substring(0, 1) }}</el-avatar>
							<span class="user-name">{{ user.userName }}</span>
							<div
								v-if="props.showStatusIcon"
								class="user-status-dot"
								:style="{ backgroundColor: statusIconMap2['-1']?.color }"
							>
								<el-icon :size="9" color="#FFFFFF"><Clock /></el-icon>
							</div>
						</div>
					</template>
				</div>

				<!-- 4. 优化审批意见和签名显示 -->
				<div v-for="(task, idx) in activity.tasks" :key="'reason-' + idx" class="opinion-wrapper">
					<div
						v-if="task.reason && [NodeType.USER_TASK_NODE, NodeType.END_EVENT_NODE].includes(activity.nodeType)"
						class="opinion-box"
					>
						<span class="opinion-label">意见：</span>
						{{ task.reason }}
					</div>
					<div v-if="task.fileId && activity.nodeType === NodeType.USER_TASK_NODE" class="signature-box">
						<span class="opinion-label">签名：</span>
						<el-image class="signature-img" :src="task.fileId" :preview-src-list="[task.fileId]" />
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
import { TaskStatusEnum } from '@/api/system/bpm/task'
import { NodeType, CandidateStrategy } from '@/components/bpmnProcessDesigner/package/penal/consts'
import { isEmpty } from '@/utils/common/form-validation'
import starterSvg from '@/assets/icons/bpm/starter.svg'
import auditorSvg from '@/assets/icons/bpm/auditor.svg'
import copySvg from '@/assets/icons/bpm/copy.svg'
import conditionSvg from '@/assets/icons/bpm/condition.svg'
import parallelSvg from '@/assets/icons/bpm/parallel.svg'
import finishSvg from '@/assets/icons/bpm/finish.svg'
import transactorSvg from '@/assets/icons/bpm/transactor.svg'
import childProcessSvg from '@/assets/icons/bpm/child-process.svg'

defineOptions({ name: 'BpmProcessInstanceTimeline' })
/**
 * 流程实例时间线组件属性定义
 */
const props = defineProps({
	activityNodes: { type: Array, required: true },
	showStatusIcon: { type: Boolean, default: true },
	enableApproveUserSelect: { type: Boolean, default: false },
})

const emit = defineEmits(['selectUserConfirm'])
const { push } = useRouter()
/**
 * 任务状态对应的图标映射（仅显示图标）
 */
const statusIconMap2 = {
	'-2': { color: '#cccccc', icon: 'ArrowDown' },
	'-1': { color: '#909398', icon: 'Clock' },
	0: { color: '#00b32a', icon: 'Clock' },
	1: { color: '#448ef7', icon: 'Loading' },
	2: { color: '#00b32a', icon: 'CircleCheckFilled' },
	3: { color: '#f46b6c', icon: 'Close' },
	4: { color: '#cccccc', icon: 'DeleteFilled' },
	5: { color: '#f46b6c', icon: 'RemoveFilled' },
	6: { color: '#448ef7', icon: 'Loading' },
	7: { color: '#00b32a', icon: 'CircleCheckFilled' },
}
/**
 * 任务状态对应的图标映射
 */
const statusIconMap = {
	'-2': { color: '#909398', icon: 'ArrowDown' },
	'-1': { color: '#909398', icon: 'Clock' },
	0: { color: '#00b32a', icon: 'Clock' },
	1: { color: '#448ef7', icon: 'Loading' },
	2: { color: '#00b32a', icon: 'Check' },
	3: { color: '#f46b6c', icon: 'Close' },
	4: { color: '#cccccc', icon: 'Delete' },
	5: { color: '#f46b6c', icon: 'Minus' },
	6: { color: '#448ef7', icon: 'Loading' },
	7: { color: '#00b32a', icon: 'Check' },
}
/**
 * 节点类型对应的图标映射
 */
const nodeTypeSvgMap = {
	[NodeType.END_EVENT_NODE]: { color: '#909398', svg: finishSvg },
	[NodeType.START_USER_NODE]: { color: '#909398', svg: starterSvg },
	[NodeType.USER_TASK_NODE]: { color: '#ff943e', svg: auditorSvg },
	[NodeType.TRANSACTOR_NODE]: { color: '#ff943e', svg: transactorSvg },
	[NodeType.COPY_TASK_NODE]: { color: '#3296fb', svg: copySvg },
	[NodeType.CONDITION_NODE]: { color: '#14bb83', svg: conditionSvg },
	[NodeType.PARALLEL_BRANCH_NODE]: { color: '#14bb83', svg: parallelSvg },
	[NodeType.CHILD_PROCESS_NODE]: { color: '#14bb83', svg: childProcessSvg },
}

const onlyStatusIconShow = [-1, 0, 1]

const getApprovalNodeImg = nodeType => nodeTypeSvgMap[nodeType]?.svg

const getApprovalNodeIcon = (taskStatus, nodeType) => {
	if (taskStatus == TaskStatusEnum.NOT_START) {
		return statusIconMap[taskStatus]?.icon
	}
	if ([NodeType.START_USER_NODE, NodeType.USER_TASK_NODE, NodeType.TRANSACTOR_NODE, NodeType.CHILD_PROCESS_NODE, NodeType.END_EVENT_NODE].includes(nodeType)) {
		return statusIconMap[taskStatus]?.icon
	}
}

const getApprovalNodeColor = taskStatus => statusIconMap[taskStatus]?.color

const getApprovalNodeTime = node => {
	if (node.nodeType === NodeType.START_USER_NODE && node.startTime) return `${formatDate(node.startTime)}`
	if (node.endTime) return `${formatDate(node.endTime)}`
	if (node.startTime) return `${formatDate(node.startTime)}`
}

// 新增：将复杂的 v-if 判断抽离成函数
const shouldShowUserSelector = activity => {
	return (
		isEmpty(activity.tasks) &&
		((CandidateStrategy.START_USER_SELECT === activity.candidateStrategy && isEmpty(activity.candidateUsers)) ||
			(props.enableApproveUserSelect && CandidateStrategy.APPROVE_USER_SELECT === activity.candidateStrategy))
	)
}
/**
 * 用户选择器引用
 */
const userSelectFormRef = ref(null)
/**
 * 处理用户选择事件
 * @param activityId 活动ID
 * @param selectedList 已选择的用户列表
 */
const handleSelectUser = (activityId, selectedList) => {
	userSelectFormRef.value.open(activityId, selectedList)
}
/**
 * 自定义审批用户映射
 */
const customApproveUsers = ref({})
/**
 * 处理用户选择确认事件
 * @param activityId 活动ID
 * @param userList 自定义审批用户列表
 */
const handleUserSelectConfirm = (activityId, userList) => {
	customApproveUsers.value[activityId] = userList || []
	emit('selectUserConfirm', activityId, userList)
}
/**
 * 处理子流程点击事件
 * @param activity 子流程活动节点
 */
const handleChildProcess = activity => {
	if (!activity.processInstanceId) return
	push({ name: 'BpmProcessInstanceDetail', query: { id: activity.processInstanceId } })
}
/**
 * 设置自定义审批用户
 * @param activityId 活动ID
 * @param users 自定义审批用户列表
 */
const setCustomApproveUsers = (activityId, users) => {
	customApproveUsers.value[activityId] = users || []
}
/**
 * 批量设置自定义审批用户
 * @param data 批量自定义审批用户映射
 */
const batchSetCustomApproveUsers = data => {
	Object.keys(data).forEach(activityId => {
		customApproveUsers.value[activityId] = data[activityId] || []
	})
}

defineExpose({ setCustomApproveUsers, batchSetCustomApproveUsers })
</script>

<style lang="scss" scoped>
/* --- 整体布局与间距 --- */
.process-timeline {
	padding-top: 10px;
	// 调整时间线左侧的留白，为放大的图标提供空间
	:deep(.el-timeline-item__wrapper) {
		padding-left: 40px;
	}
}

.timeline-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 8px; // 统一内容块之间的垂直间距
	padding-bottom: 16px; // 增加每个时间线节点下方的间距
}

/* --- 1. 时间线节点图标 --- */
.timeline-dot {
	position: absolute;
	left: -10px; // 调整位置以适应更大的尺寸
	top: -6px;
	border-radius: 50%;
	border: 2px solid #fff; // 加一个白色边框，使其从时间线上“浮”出来
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); // 增加阴影，提升质感
	width: 32px; // 放大尺寸
	height: 32px; // 放大尺寸
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #448ef7;
	padding: 6px; // 调整内边距
	z-index: 1;

	.dot-main-icon {
		width: 100%;
		height: 100%;
		filter: brightness(0) invert(1); // 将SVG图标变为白色，以适应深色背景
	}

	.dot-status-icon {
		position: absolute;
		top: 20px; // 调整位置
		left: 20px; // 调整位置
		border-radius: 50%;
		display: flex;
		align-items: center;
		padding: 1px;
		border: 2px solid #fff; // 加粗边框
	}
}

/* --- 2. 节点头部 --- */
.node-header {
	display: flex;
	width: 100%;
	align-items: center;
	.node-title {
		font-weight: 600; // 稍微加粗
		font-size: 15px; // 增大字号
		color: #303133;
	}
	.node-skip-tag {
		color: #909399;
		font-weight: normal;
	}
	.node-time {
		color: #999;
		font-size: 12px;
		margin-left: auto;
		white-space: nowrap; // 防止时间换行
	}
}

/* --- 3. 审批人区域 --- */
.approver-container {
	display: flex;
	flex-wrap: wrap;
	gap: 8px; // 统一间距
	align-items: center;
}

.add-user-btn {
	width: 28px; /* <-- 修改: 尺寸与用户标签高度对齐 */
	height: 28px; /* <-- 修改: 尺寸与用户标签高度对齐 */
	background-color: #f4f4f5;
	border: 1px dashed #dcdfe6;
	color: #909399;
	&:hover {
		background-color: #e9e9eb;
		border-color: #c8c9cc;
		color: #606266;
	}
}

.user-tag {
	background-color: #f4f4f5;
	height: 28px; /* <-- 修改: 缩小高度 */
	border-radius: 14px; /* <-- 修改: 保持半圆 */
	display: inline-flex;
	align-items: center;
	padding: 0 8px 0 4px; /* <-- 修改: 调整内边距 */
	color: #606266;
	position: relative;
	border: 1px solid #e4e7ed; /* <-- 修改: 使用更柔和的边框色 */
	gap: 5px; /* <-- 修改: 调整头像和名字的间距 */

	.user-name {
		font-size: 12px; /* <-- 修改: 缩小字号 */
		max-width: 80px; /* <-- 修改: 调整最大宽度 */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.user-status-dot {
	position: absolute;
	top: 16px; /* <-- 修改: 调整位置以适应新尺寸 */
	left: 17px; /* <-- 修改: 调整位置以适应新尺寸 */
	border-radius: 50%;
	display: flex;
	align-items: center;
	padding: 1px;
	border: 1.5px solid #fff; /* <-- 修改: 边框稍微变细 */
	background-clip: padding-box;
}

/* --- 4. 审批意见与签名 --- */
.opinion-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-top: 4px;
}

.opinion-box {
	color: #606266;
	font-size: 13px;
	background-color: #f5f7fa;
	padding: 8px 12px;
	border-radius: 4px;
	border-left: 3px solid #dcdfe6;
	line-height: 1.5;
}

.opinion-label {
	color: #909399;
}

.signature-box {
	display: flex;
	align-items: center;
	gap: 6px;
	padding-left: 12px;
}

.signature-img {
	width: 80px; // 放大签名图片
	height: 35px; // 放大签名图片
	border: 1px solid #eee;
	border-radius: 4px;
	background-color: #fff;
}
</style>
