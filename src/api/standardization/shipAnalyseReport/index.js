import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getPages',
      method: 'get',
      params: query
    })
  },
  getShipInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getShipInfo',
      method: 'get',
      params: query
    })
  },
  getTestResultInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getTestResultInfo',
      method: 'get',
      params: query
    })
  },

  getTestResultDetail(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getTestResultInfo',
      method: 'get',
      params: query
    })
  },
  getShorePowerInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getShorePowerInfo',
      method: 'get',
      params: query
    })
  },

  getWorkpieceRatioInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/workpieceRatioInfo',
      method: 'get',
      params: query
    })
  },
  getCostInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getCostInfo',
      method: 'get',
      params: query
    })
  },
  getCostListInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getCostListInfo',
      method: 'get',
      params: query
    })
  },
  getLoadAndUnloadInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/loadAndUnloadInfo',
      method: 'get',
      params: query
    })
  },
  standardizationByShipVoyageId(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/standardizationByShipVoyageId',
      method: 'get',
      params: query
    })
  },
  /**
   * 获取停泊费
   * @param query
   * @returns {*}
   */
  getBerthageInfo(query) {
    return request({
      url: '/api/external/costShip/listShipvoyage',
      method: 'get',
      params: query
    })
  },
  /**
   * 获取包干费信息
   * @param query
   * @returns {*}
   */
  listCostStatement(query) {
    return request({
      url: '/api/external/bizCostStatement/listCostStatement',
      method: 'get',
      params: query
    })
  },
  /**
   * 获取包干费
   * @param query
   * @returns {*}
   */
  listCostStatementDetail(query) {
    return request({
      url: '/api/external/bizCostStatement/listCostStatementDetail',
      method: 'get',
      params: query
    })
  },
  /**
   * 获取水电费前置信息
   * @param query
   * @returns {*}
   */
  listTrust(query) {
    return request({
      url: '/api/external/costShipWaterElectricity/listTrust',
      method: 'get',
      params: query
    })
  },
  /**
   * 获取水电费
   * @param query
   * @returns {*}
   */
  getCostShipWaterElectricity(query) {
    return request({
      url: '/api/external/costShipWaterElectricity/listCostShip',
      method: 'get',
      params: query
    })
  },

  /**
   * 获取水电费
   * @param query
   * @returns {*}
   */
  costAccountingInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/costAccountingInfo',
      method: 'get',
      params: query
    })
  },

  /**
   * 收入分析
   * @param query
   * @returns {*}
   */
  getIncomeInfo(query) {
    return request({
      url: '/api/v1/internal/ShipAnalyseReport/getIncomeInfo',
      method: 'get',
      params: query
    })
  },


}

export default api



