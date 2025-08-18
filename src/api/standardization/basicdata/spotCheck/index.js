import request from '@/utils/request'
const api = {

  // 获取点检计划的主页面显示的数据
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdCheckPlan/getMainList',
      method: 'get',
      params: query
    })
  },
  //获取工艺流程下拉列表
  getProcessList(){
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getProcessList',
      method: 'get'
    })
  },
  //保存
  doSave(data){
    return request({
      url: '/api/v1/internal/tStdCheckPlan/add',
      method: 'post',
      data: data
    })
  },
  //通过标准体系获取工艺流程
  getProcessListBySystem(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/getProcessBySystem/`+id,
      method: 'get'
    })
  },
  //获取标准体系和工艺流程下树型节点
  getTreeNode(data){
    return request({
      url: '/api/v1/internal/tStdCheckPlan/getTreeNode',
      method: 'post',
      data:data
    })
  },
  editDetail(id) {
    return request({
      url: `/api/v1/internal/tStdCheckPlan/editDetail/`+id,
      method: 'GET'
    })
  },
  delByShipvoyageItemId(id) {
    return request({
      url: `/api/v1/internal/tStdCheckPlan/deleteByShipVoyageId/`+id,
      method: 'delete'
    })
  },
  // delByWorkPlanId(id) {
  //   return request({
  //     url: `/api/v1/internal/tStdCheckPlan/delByWorkPlanId/`+id,
  //     method: 'delete'
  //   })
  // },
  /***
   * 通过工班计划获取点检计划id
   * @param id
   * @returns {*}
   */
  getCheckPlanByWorkPlanId(id) {
    return request({
      url: `/api/v1/internal/tStdCheckPlan/getbyWorkPlanId/${id}`,
      method: 'get',
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
  //初始化
  shipvoyageList() {
    return request({
      url: '/api/v1/internal/tStdProducePlan/getShipVoyage',
      method: 'get',
    })
  },

  //初始化
  getStandardSystem(params) {
    return request({
      url: '/api/v1/internal/tStdCheckPlan/getStandardSystem',
      method: 'get',
      params:params
    })
  },
}
export default api
