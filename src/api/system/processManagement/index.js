import request from '@/utils/auth/request'

const flowableApi = '/api/internal/flowable'
const api = {
  /**
   * 查询流程列表
   * @param {*} query 
   * @returns 
   */
  getFLowAbleList(query) {
    return request({
      url: flowableApi + '/getList',
      method: 'get',
      params: query
    })
  },
  /**
   * 保存流程
   * @param {*} query 
   * @returns 
   */
  doSaveFlowable(query) {
    return request({
      url: flowableApi + '/save',
      method: 'post',
      data: query
    })
  },
  /**
   * 读取流程定义XML
   * @param {*} query 
   * @returns 
   */
  readFlowableXml(deployId) {
    return request({
      url: flowableApi + '/readXml/' +deployId,
      method: 'get',
     
    })
  },
  /**
   * 更新流程状态
   * @param {*} params 
   * @returns 
   */
  updateFlowState(params) {
    return request({
      url: flowableApi + '/updateState',
      method: 'put',
      params: params
    })
  },
  /**
   * 删除流程
   * @param {*} params 
   * @returns 
   */
  deleteFlow(id) {
    return request({
      url: flowableApi + '/delete'+ id,
      method: 'delete',
    })
  },
}

export default api