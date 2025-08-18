import request from '@/utils/request'
import q from "../../../../docs/.vitepress/cache/deps/element-plus";

const api = {
  // 获取列表
  getList(params) {
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getList',
      method: 'get',
      params,
    })
  },
  //获取下方已派列表
  getDispatchList(params) {
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getDispatchList',
      method: 'get',
      params
    })
  },
  //获取下方已派列表
  getDispatchAllList(params) {
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getDispatchAllList',
      method: 'get',
      params
    })
  },
  //获取机械已派列表
  getMachineDispatched(params) {
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getDispatchList',
      method: 'get',
      params
    })
  },
  //获取当前时间
  reqGetCurrentShiftClassInfo(params) {
    return request({
      url: '/api/internal/public/getCurrentShiftClassInfo',
      method: 'get',
      params,
    })
  },
  //获取机械
  getMachineList(query){
    return request({
      url: '/api/internal/public/getMachineList',
      method: 'get',
      params: query
    })
  },
  //获取装卸队
  getLaborList(workPlanId){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getLaborList?workPlanId='+workPlanId,
      method: 'get'
    })
  },
//根据部门获取班组
  getLaborGroupList(deptParentId){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getLaborGroupList?deptParentId='+deptParentId,
      method: 'get'
    })
  },
  //获取装卸队部门信息
  getLaborDeptList(){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getLaborDeptList',
      method: 'get'
    })
  },
  //获取已填报装卸队
  getSaveList(workPlanId){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/getEchoLaborList?workPlanId='+workPlanId,
      method: 'get'
    })
  },
  //保存装卸队
  addLabor(data,){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/saveLabor',
      method: 'post',
      data:data
    })
  },
  //添加
  addBatch(data){
    return request({
      url: '/api/v1/internal/tPrdDispatchSecondary/saveMachine',
      method: 'post',
      data: data
    })
  }
}
export default api
