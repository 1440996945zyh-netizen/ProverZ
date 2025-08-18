import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/v1/interface/tPrdPlanEntrust/getList',
      method: 'get',
      params: query
    })
  },
  // 查询车辆动态
  getVehicleTrendsDrawerList(query) {
    return request({
      url: '/api/v1/interface/tPrdPlanEntrust/getVehicleList',
      method: 'get',
      params: query
    })
  },
}
export default api


