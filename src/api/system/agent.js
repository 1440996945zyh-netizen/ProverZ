import request from '@/utils/auth/request.js'

const api = {
  /**
   * 查询智能体列表（分页）
   * @param {Object} params 参数对象
   * @param {Number} startPage 当前页
   * @param {Number} pageSize 每页条数
   * @param {String} agentName 智能体名称
   * @param {String} status 状态
   * @returns {Object} 分页结果 { pages, totalNum }
   */
  listAgent(params) {
    return request({
      url: '/api/internal/sysAgent/getlist',
      method: 'get',
      loading: false,
      params: params
    })
  },

  /**
   * 根据ID获取智能体详情
   * @param {Number} id 智能体ID
   * @returns {Object} 智能体详情
   */
  getById(id) {
    return request({
      url: '/api/internal/sysAgent/getbyid/' + id,
      method: 'get'
    })
  },

  /**
   * 新增智能体
   * @param {Object} data 智能体信息
   * @returns {Object}
   */
  insertAgent(data) {
    return request({
      url: '/api/internal/sysAgent/insert',
      method: 'post',
      data: data
    })
  },

  /**
   * 修改智能体
   * @param {Object} data 智能体信息
   * @returns {Object}
   */
  updateAgent(data) {
    return request({
      url: '/api/internal/sysAgent/update',
      method: 'put',
      data: data
    })
  },

  /**
   * 删除智能体
   * @param {Array} idList 智能体ID列表
   * @returns {Object}
   */
  deleteById(idList) {
    return request({
      url: '/api/internal/sysAgent/deletebyid/' + idList,
      method: 'delete'
    })
  }
}
export default api
