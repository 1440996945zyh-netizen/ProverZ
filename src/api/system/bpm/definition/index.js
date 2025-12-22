import request from '@/utils/auth/request'

/**
 * 获得工作流的流程定义
 * @param {*} id 
 * @param {*} key 
 * @returns 
 */
export const getProcessDefinition = async (id, key) => {
  return await request.get({
    url: '/bpm/process-definition/get',
    params: { id, key }
  })
}
/**
 * 查询流程定义分页
 * @param {*} params 
 * @returns 
 */
export const getProcessDefinitionPage = async (params) => {
  return await request.get({
    url: '/bpm/process-definition/page',
    params
  })
}
/**
 * 查询流程定义列表
 * @param {*} params 
 * @returns 
 */
export const getProcessDefinitionList = async (params) => {
  return await request.get({
    url: '/bpm/process-definition/list',
    params
  })
}
/**
 * 查询简单流程定义列表
 * @returns 
 */
export const getSimpleProcessDefinitionList = async () => {
  return await request.get({
    url: '/bpm/process-definition/simple-list'
  })
}