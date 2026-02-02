// ========== BPM 模块 ==========
// 全局通用状态枚举
export const CommonStatusEnum = {
	ENABLE: 0, // 开启
	DISABLE: 1, // 禁用
}

// 全局用户类型枚举
export const UserTypeEnum = {
	MEMBER: 1, // 会员
	ADMIN: 2, // 管理员
}
/**
 * 全局通用状态枚举标签
 */
export const CommonStatusEnumLabel = [
	{
		value: CommonStatusEnum.ENABLE,
		label: '开启',
		type: 'success', 
	},
	{
		value: CommonStatusEnum.DISABLE,
		label: '禁用',
		type: 'danger',
	},
]
/**
 * 全局字典类型枚举
 */
export const DICT_TYPE = {
	USER_TYPE: 'user_type',
	COMMON_STATUS: 'common_status',
	TERMINAL: 'terminal', // 终端
	DATE_INTERVAL: 'date_interval', // 数据间隔

	// ========== INFRA 模块 ==========
	INFRA_BOOLEAN_STRING: 'infra_boolean_string',
	// ========== BPM 模块 ==========
	BPM_MODEL_TYPE: 'bpm_model_type',
	BPM_MODEL_FORM_TYPE: 'bpm_model_form_type',
	BPM_TASK_CANDIDATE_STRATEGY: 'bpm_task_candidate_strategy',
	BPM_PROCESS_INSTANCE_STATUS: 'bpm_process_instance_status',
	// BPM_TASK_STATUS: 'bpm_task_status',
	BPM_OA_LEAVE_TYPE: 'bpm_oa_leave_type',
	BPM_PROCESS_LISTENER_TYPE: 'bpm_process_listener_type',
	BPM_PROCESS_LISTENER_VALUE_TYPE: 'bpm_process_listener_value_type',
}

/**
 * 流程模型类型
 */
export const BpmModelType = {
	BPMN: 10, // BPMN 设计器
	SIMPLE: 20, // 简易设计器
}

/**
 * 流程模型表单类型
 */
export const BpmModelFormType = {
	NORMAL: 10, // 流程表单
	CUSTOM: 20, // 业务表单（自定义）
}

/**
 * 流程实例状态
 */
export const BpmProcessInstanceStatus = {
	NOT_START: -1, // 未开始
	RUNNING: 1, // 审批中
	APPROVE: 2, // 审批通过
	REJECT: 3, // 审批不通过
	CANCEL: 4, // 已取消
}

/**
 * 流程自动审批类型
 */
export const BpmAutoApproveType = {
	NONE: 0, // 不自动通过
	APPROVE_ALL: 1, // 仅审批一次，后续重复的审批节点均自动通过
	APPROVE_SEQUENT: 2, // 仅针对连续审批的节点自动通过
}

export const BPM_PROCESS_LISTENER_TYPE = [
	{
		value: 'execution',
		label: '执行监听器',
	},
	{
		value: 'task',
		label: '任务监听器',
	},
]
export const BPM_PROCESS_LISTENER_VALUE_TYPE = [
	{
		value: 'class',
		label: 'JAVA类',
	},
	{
		value: 'expression',
		label: '表达式',
	},
	{
		value: 'delegateExpression',
		label: '代理表达式',
	},
]

/**
 * 任务状态枚举
 */
export const TaskStatusEnum = {
	/**
	 * 跳过
	 */
	SKIP: -2,
	/**
	 * 未开始
	 */
	NOT_START: -1,

	/**
	 * 待审批
	 */
	WAIT: 0,
	/**
	 * 审批中
	 */
	RUNNING: 1,
	/**
	 * 审批通过
	 */
	APPROVE: 2,

	/**
	 * 审批不通过
	 */
	REJECT: 3,

	/**
	 * 已取消
	 */
	CANCEL: 4,
	/**
	 * 已退回
	 */
	RETURN: 5,
	/**
	 * 审批通过中
	 */
	APPROVING: 7,
}
/**
 * 流程实例状态枚举标签
 */
export const BPM_PROCESS_INSTANCE_STATUS = [
	{
		value: BpmProcessInstanceStatus.NOT_START,
		label: '未开始',
		type: 'info',
	},
	{
		value: BpmProcessInstanceStatus.RUNNING,
		label: '审批中',
		type: 'primary',
	},
	{
		value: BpmProcessInstanceStatus.APPROVE,
		label: '审批通过',
		type: 'success',
	},
	{
		value: BpmProcessInstanceStatus.REJECT,
		label: '审批不通过',
		type: 'danger',
	},
	{
		value: BpmProcessInstanceStatus.CANCEL,
		label: '已取消',
		type: 'info',
	},
]

/**
 * 任务状态枚举标签
 */
export const BPM_TASK_STATUS = [
	{ label: '审批通过中', value: '7', type: 'success' },
	{ label: '委派中', value: '6', type: 'primary' },
	{ label: '已退回', value: '5', type: 'warning' },
	{ label: '已取消', value: '4', type: 'info' },
	{ label: '审批不通过', value: '3', type: 'danger' },
	{ label: '审批通过', value: '2', type: 'success' },
	{ label: '审批中', value: '1', type: 'primary' },
	{ label: '待审批', value: '0', type: 'info' },
]
