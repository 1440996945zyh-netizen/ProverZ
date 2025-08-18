import request from '@/utils/request'
const api = {
    //tStdSingleShipTest
// 获取点检计划报告主页面展示的数据
getList(query) {
    return request({
        url: '/api/v1/internal/tStdSingleShipTestReport/getMainList',
        method: 'get',
        params: query
    })
},
getDetailData(id){
    return request({
        url: '/api/v1/internal/tStdSingleShipTestReport/getReport/'+id,
        method: 'get'
    })
},
//初始化
reqGetCurrentShiftClassInfo(params) {
    return request({
        url: '/api/internal/public/getCurrentShiftClassInfo',
        method: 'get',
        params,
    })
},
  /**
   * 获取当前班次时间
   * @param {Object} params 检索条件的obj
   */
  getNowDate(params) {
    return request({
      url: '/api/internal/public/getDateAndShift',
      method: 'get',
      params,
    })
  },
getImageUrl(id){
    return request({
        url: '/api/v1/internal/tStdSingleShipTestReport/getReportImage/'+id,
        method: 'get',
    })
},

// 获取具体的点检记录具体列表
getDetailByCheckPlanType(data) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/getDetailByCheckPlanType',
      method: 'post',
      data: data,
    })
  },

  getSumByCheckPlanType(data) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/getSumByCheckPlanType',
      method: 'post',
      data: data,
    })
  },

  shipvoyageList() {
    return request({
      url: '/api/v1/internal/tStdProducePlan/getShipVoyage',
      method: 'get',
    })
  },

  // 未达标 已达标 汇总
  getSummary(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/summaryQualified',
      method: 'get',
      params: query,
    })
  },
  updateStatus(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTestReport/updateStatus',
      method: 'get',
      params: query,
    })
  },

}
export default api


