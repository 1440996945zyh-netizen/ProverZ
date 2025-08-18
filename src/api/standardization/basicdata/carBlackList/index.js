import request from '@/utils/request'
//车辆黑名单
const url = '/api/v1/internal/tCalCarBlackList'
const api = {
  ///////////////////////////////////////////////////////////////////////
  /**
   * 获取黑名单车辆信息
   * @param params
   * @returns {*}
   */

  getList(params) {
    return request({
      url: `${url}/getList`,
      method: 'get',
      params: params
    })
  },

  /**
   * 新增黑名单车辆信息
   * @param data
   * @returns {*}
   */
  insert(data){
    return request({
      url: `${url}/add`,
      method: 'post',
      data:data
    })
  },
  /**
   * 处理黑名单车辆信息
   * @param {Object} data 合同信息
   * @returns
   */
  update(data) {
    return request({
      url: `${url}/update`,
      method: 'put',
      data: data
    })
  },
  // 黑名单导出
  exportExcel(query) {
    return request({
      url: `${url}/exportExcel`,
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },



}


export default api


