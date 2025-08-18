import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/v1/interface/TStdOutsourcingCost/getList',
      method: 'get',
      params: query
    })
  },
  // 查询车辆动态
  getDetail(query) {
    return request({
      url: '/api/v1/interface/TStdOutsourcingCost/getDetailList',
      method: 'get',
      params: query
    })
  },
  // 获取当前时间班次
  getCurrentShift(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
  // 查询车辆动态
  getDetailSum(query) {
    return request({
      url: '/api/v1/interface/TStdOutsourcingCost/getDetailSum',
      method: 'get',
      params: query
    })
  },
}
export default api


