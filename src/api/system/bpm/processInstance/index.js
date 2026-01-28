import request from '@/utils/auth/request'

const processInstanceApi = '/bpm/process-instance/'

/**
 * 获取我的流程实例分页
 */
export const getProcessInstanceMyPage = async params => {
	return request({
		url: processInstanceApi + 'myPage',
		method: 'get',
		params,
	})
}

/**
 * 获取流程实例管理分页
 */
export const getProcessInstanceManagerPage = async params => {
	return request({
		url: processInstanceApi + 'manager-page',
		method: 'get',
		params,
	})
}

/**
 * 创建流程实例
 */
export const createProcessInstance = async data => {
	return request({
		url: processInstanceApi + 'insert',
		method: 'post',
		data, // 简化 data: data 为 data
	})
}

/**
 * 发起人取消流程实例
 */
export const cancelProcessInstanceByStartUser = async (id, reason) => {
	const data = {
		id, // 简化 id: id 为 id
		reason, // 简化 reason: reason 为 reason
	}
	return request({
		url: processInstanceApi + 'cancelByStartUser',
		method: 'delete',
		data,
	})
}

/**
 * 管理员取消流程实例
 */
export const cancelProcessInstanceByAdmin = async (id, reason) => {
	const data = {
		id,
		reason,
	}
	return request({
		url: processInstanceApi + 'cancel-by-admin',
		method: 'delete',
		data,
	})
}

/**
 * 获取流程实例详情
 */
export const getProcessInstance = async id => {
	return request({
		url: processInstanceApi + 'get?id=' + id,
		method: 'get',
	})
}

/**
 * 获取我的抄送流程分页
 */
export const getProcessInstanceCopyPage = async params => {
	return request({
		url: processInstanceApi + 'copy/page',
		method: 'get',
		params,
	})
}

// 获取审批详情
export const getApprovalDetail = async params => {
	return request({
		url: processInstanceApi + 'getApprovalDetail',
		method: 'get',
		params,
	})
}

// 获取下一个执行的流程节点
export const getNextApprovalNodes = async params => {
	return request({
		url: processInstanceApi + 'get-next-approval-nodes',
		method: 'get',
		params,
	})
}

// 获取表单字段权限
export const getFormFieldsPermission = async params => {
	return request({
		url: processInstanceApi + 'get-form-fields-permission',
		method: 'get',
		params,
	})
}

// 获取流程实例的 BPMN 模型视图
export const getProcessInstanceBpmnModelView = async id => {
	return request({
		url: processInstanceApi + 'getBpmnModelView?id=' + id,
		method: 'get',
	})
}

// 获取流程实例打印数据
export const getProcessInstancePrintData = async id => {
	return request({
		url: processInstanceApi + 'get-print-data?processInstanceId=' + id,
		method: 'get',
	})
}
