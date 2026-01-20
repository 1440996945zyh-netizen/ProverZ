
import request from '@/utils/auth/request'

/**
 * 任务状态枚举（JS中用冻结对象模拟枚举，防止被修改）
 */
export const TaskStatusEnum = Object.freeze({
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
  APPROVING: 7
})

export const getTaskTodoPage = async (params) => {
  return request({
    url: '/bpm/task/todoPage',
    method: 'get',
    params
  })
}

export const getTaskDonePage = async (params) => {
  return request({
    url: '/bpm/task/donePage',
    method: 'get',
    params
  })
}

export const getTaskManagerPage = async (params) => {
  return request({
    url: '/bpm/task/managerPage',
    method: 'get',
    params
  })
}

export const approveTask = async (data) => {
  return request({
    url: '/bpm/task/approve',
    method: 'put',
    data
  })
}

export const rejectTask = async (data) => {
  return request({
    url: '/bpm/task/reject',
    method: 'put',
    data
  })
}

export const getTaskListByProcessInstanceId = async (processInstanceId) => {
  return request({
    url: '/bpm/task/getByProcessInstanceId?processInstanceId=' + processInstanceId,
    method: 'get'
  })
}

// 获取所有可退回的节点
export const getTaskListByReturn = async (id) => {
  return request({
    url: '/bpm/task/list-by-return',
    method: 'get',
    params: { id }
  })
}

// 退回
export const returnTask = async (data) => {
  return request({
    url: '/bpm/task/return',
    method: 'put',
    data
  })
}

// 委派
export const delegateTask = async (data) => {
  return request({
    url: '/bpm/task/delegate',
    method: 'put',
    data
  })
}

// 转派
export const transferTask = async (data) => {
  return request({
    url: '/bpm/task/transfer',
    method: 'put',
    data
  })
}

// 加签
export const signCreateTask = async (data) => {
  return request({
    url: '/bpm/task/create-sign',
    method: 'put',
    data
  })
}

// 减签
export const signDeleteTask = async (data) => {
  return request({
    url: '/bpm/task/delete-sign',
    method: 'delete',
    data
  })
}

// 抄送
export const copyTask = async (data) => {
  return request({
    url: '/bpm/task/copy',
    method: 'put',
    data
  })
}

// 撤回
export const withdrawTask = async (taskId) => {
  return request({
    url: '/bpm/task/withdraw',
    method: 'put',
    params: { taskId }
  })
}

// 获取我的待办任务
export const myTodoTask = async (processInstanceId) => {
  return request({
    url: '/bpm/task/my-todo?processInstanceId=' + processInstanceId,
    method: 'get'
  })
}

// 获取减签任务列表
export const getChildrenTaskList = async (id) => {
  return request({
    url: '/bpm/task/list-by-parent-task-id?parentTaskId=' + id,
    method: 'get'
  })
}