import request from '@/utils/auth/request'
/**
 * 创建工作流的表单定义
 * @param {*} data 
 * @returns 
 */
export const createForm = async (data) => {
  return await request.post({
    url: '/bpm/form/create',
    data: data
  })
}
/**
 * 更新工作流的表单定义
 * @param {*} data 
 * @returns 
 */
export const updateForm = async (data) => {
  return await request.put({
    url: '/bpm/form/update',
    data: data
  })
}

/**
 * 删除工作流的表单定义
 * @param {*} id 
 * @returns 
 */
export const deleteForm = async (id) => {
  return await request.delete({
    url: '/bpm/form/delete?id=' + id
  })
}

/**
 * 获得工作流的表单定义
 * @param {*} id 
 * @returns 
 */
export const getForm = async (id) => {
  return await request.get({
    url: '/bpm/form/get?id=' + id
  })
}
/**
 * 获得工作流的表单定义分页
 * @param {*} params 
 * @returns 
 */
export const getFormPage = async (params) => {
  return await request.get({
    url: '/bpm/form/page',
    params
  })
}

/**
 * 获得动态表单的精简列表
 * @returns 
 */
export const getFormSimpleList = async () => {
  return await request.get({
    url: '/bpm/form/simple-list'
  })
}
