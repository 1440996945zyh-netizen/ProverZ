import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/interface/vehicleRelease/getList',
      method: 'get',
      params: query
    })
  },

  getSubList(query) {
    return request({
      url: '/api/v1/interface/vehicleRelease/getSubList',
      method: 'get',
      params: query
    })
  },

  // 放行
  auditStatus(id) {
    return request({
      url: `/api/v1/interface/vehicleRelease/auditStatus/${id}`,
      method: 'get'
    })
  },

  // 撤销放行
  auditRevokeStatus(id) {
    return request({
      url: `/api/v1/interface/vehicleRelease/auditRevokeStatus/${id}`,
      method: 'get'
    })
  }
}

export default api



