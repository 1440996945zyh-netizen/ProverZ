import request from '@/utils/auth/request'

const baseApi = '/api/internal/bpmProcessLanguage'

 
export  const ProcessLanguageApi = {
 /**
  * 查询常用审批语分页
  * @param {*} query 
  * @returns 
  */
  getList: (query) => {
    return request({
      url: baseApi + '/getList',
      method: 'get',
      params: query,
    })
  },
  /**
   * 查询常用审批语详情
   * @param {*} id 
   * @returns 
   */
  getProcessLanguage: async (id) => {
    return request({
      url: baseApi + `/getDetail`,
      method: 'get',
      params: id,
    })
  },
  /**
   * 新增常用审批语
   * @param {*} data 
   * @returns 
   */
  insertProcessLanguage: async (data) => {
    return request({
      url: baseApi + '/insert',
      method: 'post',
      data
    })
  },

  /**
   * 修改常用审批语
   * @param {*} data 
   * @returns 
   */
  updateProcessLanguage: async (data) => {
    return request({
      url: baseApi + '/update',
      method: 'post',
      data
    })
  },

  /**
   * 删除常用审批语
   * @param {*} id 
   * @returns 
   */
  deleteProcessLanguage: async (id) => {
    return request({
      url: baseApi + `/delete/${id}`,
      method: 'delete'
    })
  },

  /**
   * 查询常用审批语表达式
   * @param {*} query 
   * @returns 
   */
  getProcessLanguageExpression: async (query) => {
    return request({
      url: baseApi + `/getSimpleList`,
      method: 'get',
      params: query,
    })
  },
}

