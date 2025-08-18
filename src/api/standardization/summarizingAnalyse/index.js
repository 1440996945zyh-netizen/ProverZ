import request from '@/utils/request'

const api = {

  getCheckPlanReport(query) {
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getStandardResult',
      method: 'get',
      params: query
    })
  },
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getStandardResultPage',
      method: 'get',
      params: query
    })
  },
  getShipTestList(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/getStandardResultPage',
      method: 'get',
      params: query
    })
  },
  getStandardResult(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/getStandardResult',
      method: 'get',
      params: query
    })
  },
  getTestResultInfo(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/summaryQualifiedList',
      method: 'get',
      params: query
    })
  },
  getEfficiencyInfo(query) {
    return request({
      url: '/api/v1/internal/summarizingAnalyse/efficiencyInfo',
      method: 'get',
      params: query
    })
  },
  getCargoSelect() {
    return request({
      url: '/api/internal/public/getLocalSelect?type=STD_CARGO_CATEGORY',
      method: 'get',
    })
  },
  getIncomeInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getIncomeInfo',
      method: 'get',
      params: query
    })
  },
  getCostInfo(query) {
    return request({
      url: '/api/v1/internal/largeDataScreen/getCostInfo',
      method: 'get',
      params: query
    })
  },
















  // getShipInfo(query) {
  //   return request({
  //     url: '/api/v1/internal/ShipAnalyseReport/getShipInfo',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // getTestResultDetail(query) {
  //   return request({
  //     url: '/api/v1/internal/ShipAnalyseReport/getTestResultInfo',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // getShorePowerInfo(query) {
  //   return request({
  //     url: '/api/v1/internal/ShipAnalyseReport/getShorePowerInfo',
  //     method: 'get',
  //     params: query
  //   })
  // },
  //
  // getWorkpieceRatioInfo(query) {
  //   return request({
  //     url: '/api/v1/internal/ShipAnalyseReport/workpieceRatioInfo',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // /**
  //  * 获取停泊费
  //  * @param query
  //  * @returns {*}
  //  */
  // getBerthageInfo(query) {
  //   return request({
  //     url: '/api/external/costShip/listShipvoyage',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // /**
  //  * 获取包干费信息
  //  * @param query
  //  * @returns {*}
  //  */
  // listCostStatement(query) {
  //   return request({
  //     url: '/api/external/bizCostStatement/listCostStatement',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // /**
  //  * 获取包干费
  //  * @param query
  //  * @returns {*}
  //  */
  // listCostStatementDetail(query) {
  //   return request({
  //     url: '/api/external/bizCostStatement/listCostStatementDetail',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // /**
  //  * 获取水电费前置信息
  //  * @param query
  //  * @returns {*}
  //  */
  // listTrust(query) {
  //   return request({
  //     url: '/api/external/costShipWaterElectricity/listTrust',
  //     method: 'get',
  //     params: query
  //   })
  // },
  // /**
  //  * 获取水电费
  //  * @param query
  //  * @returns {*}
  //  */
  // getCostShipWaterElectricity(query) {
  //   return request({
  //     url: '/api/external/costShipWaterElectricity/listCostShip',
  //     method: 'get',
  //     params: query
  //   })
  // },
//     // 删除数据
//     deleteById(id) {
//       return request({
//         url: '/api/v1/internal/tStdProducePlan/delete/' + id,
//         method: 'delete'
//       })
//     },
//
//     // 查询数据详细id
//     getDetail(id) {
//       return request({
//         url: '/api/v1/internal/tStdProducePlan/getDetail/' + id,
//         method: 'get'
//       })
//     },
//
//       // 新增数据
//       insert(data) {
//         return request({
//           url: '/api/v1/internal/tStdProducePlan/add',
//           method: 'post',
//           data: data
//         })
//       },
//
//
// /////////////////////////////////////////////////////////////////////////////////////////
//
//     // 修改数据
//     updatePort(data) {
//         return request({
//         url: '/api/v1/internal/tStdProducePlan/update',
//         method: 'put',
//         data: data
//         })
//     },


}

export default api



