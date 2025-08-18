import request from '@/utils/request'
const api = {

  // 获取点检计划报告主页面展示的数据
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getMainList',
      method: 'get',
      params: query
    })
  },
  getDetailData(id){
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getReport/'+id,
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
      url: '/api/v1/internal/tStdCheckPlanReport/getReportImage/'+id,
      method: 'get',
    })
  },

  // 获取具体的点检记录具体列表
  getDetailByCheckPlanType(data) {
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getDetailByCheckPlanType',
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
  getSummaryStandardQuantity(query){
    return request({
      url: '/api/v1/internal/tStdCheckPlanReport/getSummaryStandardQuantity',
      method: 'get',
      params: query
    })
  },
}
export default api
