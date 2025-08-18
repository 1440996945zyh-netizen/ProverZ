import request from '@/utils/request'

const api = {
// 获取列表
  getList(query) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/getList',
      method: 'get',
      params: query
    })
  },
  // 获取列表
  getLogList(query) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/getLogList',
      method: 'get',
      params: query
    })
  },
  //新增数据
  insert(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/doSave',
      method: 'post',
      data: data,
    })
  },
  //更新数据
  update(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/doSave',
      method: 'post',
      data: data
    })
  },
  //删除数据
  delete(id){
    return request({
      url: '/api/v1/interface/tPrdOddInterface/delete/'+id,
      method: 'delete'
    })
  },
  //通过id查询
  getDetailById(id){
    return request({
      url: '/api/v1/interface/tPrdOddInterface/getDetail?id='+id,
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
  //一级审核
  auditOne(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/confirm',
      method: 'post',
      data: data
    })
  },
  //二级审核
  auditTwo(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/firstApprove',
      method: 'post',
      data: data
    })
  },
  //三级审核
  auditThree(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/secondApprove',
      method: 'post',
      data: data
    })
  },
  //零工汇总审核批量撤销（三级）
  cancelReview(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/cancelSecondApprove',
      method: 'post',
      data: data
    })
  },
  //零工作业单撤销（一级）
  revokeOne(id){
    return request({
      url: '/api/v1/interface/tPrdOddInterface/cancelConfirm?id='+id,
      method: 'get'
    })
  },
  //零工审核撤销（二级）
  revokeTwo(id){
    return request({
      url: '/api/v1/interface/tPrdOddInterface/cancelFirstApprove?id='+id,
      method: 'get'
    })
  },
  // 获取操作工班
  getDepts(data) {
    return request({
      url: '/api/external/workTicket/getDepts?type=' + data.type,
      method: 'get',
    })
  },

  //三级审核
  batchApprove(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/thirdApprove',
      method: 'post',
      data: data
    })
  },
  //零工汇总审核批量撤销（三级）
  cancelBatchApprove(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/cancelThirdApprove',
      method: 'post',
      data: data
    })
  },
  //驳回
  reject(data) {
    return request({
      url: '/api/v1/interface/tPrdOddInterface/reject',
      method: 'post',
      data: data
    })
  },
  // 作废
  abandoned(data){
    return request({
      url: '/api/v1/interface/tPrdOddInterface/abandoned',
      method: 'post',
      data: data
    })
  },
}
export default api

