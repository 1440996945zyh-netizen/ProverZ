import request from '@/utils/request'

const api = {

// 工属具配置详细信息
  getList(query) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/getMainList',
      method: 'get',
      params: query
    })
  },
//删除工属具配置
  deleteWorkTool(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/delete/` + id,
      method: 'delete'
    })
  },
//删除工属具配置 批量
  deleteWorkToolBatch(data) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/deleteWorktoolBatch`,
      method: 'delete',
      data: data
    })
  },
//通过工艺流程ID删除工属具配置
  deleteBYProcessSystemID(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/deleteByProcessId/` + id,
      method: 'delete'
    })
  },
//通过体系id查询工艺流程
  getProcessListBySYstem(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/getProcessBySystem/` + id,
      method: 'get'
    })
  },
//获取工属
  getWorkToolList() {
    return request({
      url: '/api/internal/public/getDictListByType/PROCESS_WORKTOOL',
      method: 'get'
    })
  },
//获取工艺流程下拉列表
  getProcessList() {
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getProcessList',
      method: 'get'
    })
  },
  updateWorktool(data) {
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/update',
      method: 'post',
      data: data
    })
  },
//保存
  doSave(data) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/add',
      method: 'post',
      data: data
    })
  },
  getWorktoolDetailList(data) {
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/getList',
      method: 'post',
      data: data
    })
  },
//动态判断参数是否合法
  checkParameter(data) {
    return request({
      url: '/api/v1/internal/tStdProcessWorktool/checkParameter',
      method: 'post',
      data: data
    })
  },
//通过标准体系获取工艺流程
  getProcessListBySystem(id) {
    return request({
      url: `/api/v1/internal/tStdProcessWorktool/getProcessBySystem/` + id,
      method: 'get'
    })
  },

//获取标准体系和工艺流程下树型节点
  getTreeNode(data) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/getTreeNode',
      method: 'post',
      data: data
    })
  },
  editDetail(id) {
    return request({
      url: `/api/v1/internal/tStdSingleShipTest/editDetail/` + id,
      method: 'GET'
    })
  },
  delByShipvoyageItemId(id) {
    return request({
      url: `/api/v1/internal/tStdSingleShipTest/delByShipvoyageItemId/` + id,
      method: 'delete'
    })
  },
  // delByWorkPlanId(id) {
  //   return request({
  //     url: `/api/v1/internal/tStdSingleShipTest/delByWorkPlanId/` + id,
  //     method: 'delete'
  //   })
  // },
  /***
   * 通过工班计划获取点检计划id
   * @param id
   * @returns {*}
   */
  getCheckPlanByShipVoyageId(id) {
    return request({
      url: `/api/v1/internal/tStdSingleShipTest/getbyShipVoyageId/${id}`,
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
  getByMatch(id1, id2, id3) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/getByMatch/',
      method: 'GET',
      params: {
        shipTypeCode: id1,
        cargoCategoryCode: id2,
        netWeight: id3,
      }
    })
  },
  getByMatch2(id1, id2, id3) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/getByMatch2',
      method: 'GET',
      params: {
        shipKindCode: id1,
        cargoCategoryName: id2,
        netWeight: id3,
      }
    })
  },
  getByMatch3(id1, id2) {
    return request({
      url: '/api/v1/internal/tStdSingleShipTest/getByMatch2',
      method: 'GET',
      params: {
        shipKindCode: id1,
        cargoCategoryCode: id2
      }
    })
  },
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
