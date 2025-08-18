import request from '@/utils/request'

const api = {
  //获取步骤条
  getSteps(query) {
    return request({
      url: '/api/ShipInfo/getSteps',
      method: 'get',
      params: query
    })
  },
  //获取步骤条
  getShipVoyageInfo(query) {
    return request({
      url: '/api/ShipInfo/getShipVoyageInfo',
      method: 'get',
      params: query
    })
  },
  //获取步骤条
  getShipDynamicInfo(query) {
    return request({
      url: '/api/ShipInfo/getShipDynamicInfo',
      method: 'get',
      params: query
    })
  },
  //获取步骤条
  getShipDoorInfo(query) {
    return request({
      url: '/api/ShipInfo/getShipDoorInfo',
      method: 'get',
      params: query
    })
  },
  getCostInfo(query) {
    return request({
      url: '/api/ShipInfo/getCostInfo',
      method: 'get',
      params: query
    })
  },
  getPoundInfo(query) {
    return request({
      url: '/api/ShipInfo/getPoundInfo',
      method: 'get',
      params: query
    })
  },
  //获取港存（票货汇总）
  getPortTrendsInfo(query) {
    return request({
      url: '/api/ShipInfo/getPortTrendsInfo',
      method: 'get',
      params: query
    })
  },

  //获取港存（票货汇总）
  listPortStorage(query) {
    return request({
      url: '/api/ShipInfo/listPortStorage',
      method: 'get',
      params: query
    })
  },

  //获取港存（票货汇总）
  getInoutDetail(query) {
    return request({
      url: '/api/ShipInfo/getInoutDetail',
      method: 'get',
      params: query
    })
  },
}

export default api



