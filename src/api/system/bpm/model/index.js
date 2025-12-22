import request from '@/utils/auth/request'

/**
 * 查询流程模型分页
 * @param {*} params 
 * @returns 
 */
export const getModelList = async (name) => {
  return await request.get({ url: '/bpm/model/list', params: { name } })
}
/**
 * 查询流程模型详情
 * @param {*} id 
 * @returns 
 */
export const getModel = async (id) => {
  return await request.get({ url: '/bpm/model/get?id=' + id })
}
/**
 * 更新流程模型
 * @param {*} data 
 * @returns 
 */
export const updateModel = async (data) => {
  return await request.put({ url: '/bpm/model/update', data: data })
}
/**
 * 批量修改流程模型排序
 * @param {*} ids 
 * @returns 
 */
export const updateModelSortBatch = async (ids) => {
  return await request.put({
    url: `/bpm/model/update-sort-batch`,
    params: {
      ids: ids.join(',')
    }
  })
}
/**
 * 更新流程模型 BPMN 定义
 * @param {*} data 
 * @returns 
 */
export const updateModelBpmn = async (data) => {
  return await request.put({ url: '/bpm/model/update-bpmn', data: data })
}

/**
 * 更新流程模型状态
 * @param {*} id 
 * @param {*} state 
 * @returns 
 */
export const updateModelState = async (id, state) => {
  const data = {
    id: id,
    state: state
  }
  return await request.put({ url: '/bpm/model/update-state', data: data })
}
/**
 * 创建流程模型
 * @param {*} data 
 * @returns 
 */
export const createModel = async (data) => {
  return await request.post({ url: '/bpm/model/create', data: data })
}
/**
 * 删除流程模型
 * @param {*} id 
 * @returns 
 */
export const deleteModel = async (id) => {
  return await request.delete({ url: '/bpm/model/delete?id=' + id })
}
/**
 * 部署流程模型
 * @param {*} id 
 * @returns 
 */
export const deployModel = async (id) => {
  return await request.post({ url: '/bpm/model/deploy?id=' + id })
}
/**
 * 清除流程模型部署
 * @param {*} id 
 * @returns 
 */
export const cleanModel = async (id) => {
  return await request.delete({ url: '/bpm/model/clean?id=' + id })
}