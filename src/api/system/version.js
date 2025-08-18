import request from '@/utils/request'

const api = {

  /**
   * 查询版本列表
   * @param {Object} params  参数对象
   * @param {Number} startPage 当前页
   * @param {Number} pageSize 每页多少条
   * @returns {Array} 版本列表
   */
  listVersion(params) {
    return request({
      url: '/api/internal/sysVersion/getlist',
      method: 'get',
      params: params
    })
  },

  /**
   * 根据id获取版本信息
   * @param {Number} versionId 版本id
   * @returns
   */
  getById(versionId) {
    return request({
      url: '/api/internal/sysVersion/getbyid/' + versionId,
      method: 'get'
    })
  },

  /**
   * 新增版本
   * @param {Object} data 版本信息
   * @returns
   */
  insertVersion(data) {
    return request({
      url: '/api/internal/sysVersion/insert',
      method: 'post',
      data: data
    })
  },

  /**
   * 修改版本
   * @param {Object} data 版本信息
   * @returns
   */
  updateVersion(data) {
    return request({
      url: '/api/internal/sysVersion/update',
      method: 'put',
      data: data
    })
  },

  /**
   * 删除版本
   * @param {Array} idList 版本id列表
   * @returns
   */
  deletebyid(idList) {
    return request({
      url: '/api/internal/sysVersion/deletebyid/' + idList,
      method: 'delete'
    })
  },

  /**
   * 版本状态更新
   * @param {Number} id 
   * @param {String} releaseState
   * @returns
   */
  updateVersionStatus(data) {
    return request({
      url: '/api/internal/sysVersion/updateStatus',
      method: 'put',
      data: data
    })
  }
}
export default api


