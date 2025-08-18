import request from '@/utils/request'

const api = {

  /**
   * 查询车辆作业流水
   * @param {Object} params  参数对象
   * @param {Number} startPage 当前页
   * @param {Number} pageSize 每页多少条
   * @returns {Array} 日志列表
   */
  listLog(params) {
    return request({
      url: '/api/internal/tTruckLog/getList',
      method: 'get',
      params: params
    })
  },

}
export default api


