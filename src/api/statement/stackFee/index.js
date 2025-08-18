import request from '@/utils/request'

const api = {
  // 获取 交接清单 列表
  listHandoverlist(query) {
    return request({
      url: '/api/external/storageSettle/listHandoverlist',
      method: 'get',
      params: query,
    })
  },
  //待结算明细列表 装船
  listDetail(id) {
    return request({
      url: '/api/external/storageSettle/listDetail?handoverlistId=' + id,
      method: 'get',
    })
  },
  // 根据交接清单 查询合同
  listContract(id) {
    return request({
      url: '/api/external/storageSettle/listContract?handoverlistId=' + id,
      method: 'get',
    })
  },
//待结算明细列表(已选合同) 卸船疏港
  listDetailWithContract(param) {
    return request({
      url: '/api/external/storageSettle/listDetailWithContract' ,
      method: 'get',
      params:param
    })
  },

  // 结算
  statement(data) {
    return request({
      url: 'api/external/storageSettle/settle',
      method: 'post',
      data: data,
    })
  },

  // 撤销结算
  cancelSettle(id) {
    return request({
      url: '/api/external/storageSettle/cancelSettle?storageSettleId=' + id,
      method: 'delete',
    })
  },

  // 获取 结算单 详细信息
  listStorageSettle(id) {
    return request({
      url: '/api/external/storageSettle/listStorageSettle?handoverlistId=' + id,
      method: 'get',
    })
  },
  // 审核
  review(id) {
    return request({
      url: '/api/external/storageSettle/review?storageSettleId=' + id,
      method: 'put',
    })
  },

  // 撤销审核
  cancelReview(id) {
    return request({
      url: '/api/external/storageSettle/cancelReview?storageSettleId=' + id,
      method: 'put',
    })
  },
  printCostBill(id){
    return request({
      url: '/api/external/bizCostStatement/printCostBill/' + id,
      method: 'get',
      responseType: 'blob',

    })
  },
  getTaxInvoiceTypeList(){
    return request({
      url: 'api/internal/public/getLocalSelect?type=DICT&dictType=TAX_INVOICE',
      method: 'get',
    })
  },
  // 获取 结算单 详细信息
  listStorageSettleForConfirm(id) {
    return request({
      url: '/api/external/storageSettle/listStorageSettleForConfirm?handoverlistId=' + id,
      method: 'get',
    })
  },
  // 商务确认
  confirm(data) {
    return request({
      url: '/api/external/storageSettle/confirm',
      method: 'post',
      data: data
    })
  },
  // 取消商务确认
  cancelConfirm(data) {
    return request({
      url: '/api/external/storageSettle/cancelConfirm',
      method: 'post',
      data: data
    })
  },
  saveFile(data){
    return request({
      url: '/api/external/storageSettle/uploadConfirmFile',
      method: 'post',
      data: data
    })
  },
  printFeeList(data){
    return request({
      url: '/api/external/storageSettle/printFeeList',
      method: 'POST',
      data: data,
      responseType: 'blob',
    })
  },

  getReduceList(cargoInfoId){
    return request({
      url: '/api/v1/internal/stackFeeReduce/getList/'+cargoInfoId,
      method: 'get',
    })
  }
}
export default api
