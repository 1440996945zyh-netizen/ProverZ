import request from '@/utils/request'

const api = {
  // 查询数据列表
  getShipInfo(params) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getShipInfo',
      params:params,
      method: 'get',
    })
  },
  getStandardizationInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getStandardizationInfo',
      method: 'get',
      params:query
    })
  },
  getWorkpieceRatioInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getWorkpieceRatioInfo',
      method: 'get',
      params:query
    })
  },
  getCargoList(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getCargoList',
      method: 'get',
      params: query,
    })
  },
  getShipEfficient(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getShipEfficient',
      method: 'get',
      params:query
    })
  },
  getDoorEfficient(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getDoorEfficient',
      method: 'get',
      params:query
    })
  },
  getIncomeInfo() {
    return request({
      url: '/api/v1/internal/largeDataScreen/getIncomeInfo',
      method: 'get',
    })
  },
  getCarInHarbor() {
    return request({
      url: '/api/v1/internal/largeDataScreen/getCarInHarbor',
      method: 'get',
    })
  },
  getCostInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getCostInfo',
      method: 'get',
      params:query
    })
  },
  getCostDialogInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getCostDialogInfo',
      method: 'get',
      params:query
    })
  },
  getIncomeDialogList(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getIncomeDialogList',
      method: 'get',
      params:query
    })
  },
  getEnergyInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getEnergyInfo',
      method: 'get',
      params:query
    })
  },
  getTime(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getTime',
      method: 'get',
      params:query
    })
  },
  getQuantityOfWork(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getQuantityOfWork',
      method: 'get',
      params:query
    })
  },
  getShipAnalyseList() {
    return request({
      url: '/api/v1/internal/largeDataScreen/getShipAnalyseList',
      method: 'get',
    })
  },
}

export default api



