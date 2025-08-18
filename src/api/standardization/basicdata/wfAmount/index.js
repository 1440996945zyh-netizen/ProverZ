import request from '@/utils/request'

const api = {
// 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getWfDetailList',
      method: 'get',
      params: query
    })
  },

// 查询数据列表
  calculate(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/calculate',
      method: 'get',
      params: query
    })
  },
  getPositionList(query) {
    return request({
      url: 'api/v1/internal/waifuProcess/getPositionList',
      method: 'get',
      params: query
    })
  },
  exportExcel(query) {
    return request({
      url: 'api/v1/internal/largeDataScreen/exportExcel',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },

}

export default api



