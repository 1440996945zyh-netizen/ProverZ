import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlanZx/getList',
      method: 'get',
      params: query
    })
  },
  //新增数据
  insertWorkPlan(data) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlanZx/add',
      method: 'post',
      data: data,
    })
  },
  //更新数据
  updateWorkPlan(data) {
    return request({
      url: '/api/v1/internal/tPrdWorkPlanZx/update',
      method: 'put',
      data: data
    })
  },
  //删除数据
  deleteWorkPlan(id){
    return request({
      url: '/api/v1/internal/tPrdWorkPlanZx/delete/'+id,
      method: 'delete'
    })
  },
  //通过id查询
  getWorkPlanById(id){
    return request({
      url: '/api/v1/internal/tPrdWorkPlanZx/getDetail?id='+id,
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

}
export default api

