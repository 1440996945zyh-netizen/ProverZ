import request from '@/utils/request'

const api = {
  // 获取 交接清单 列表
  listCargoInfo(query) {
    return request({
      url: '/api/external/storageSettleMix/listCargoInfo',
      method: 'get',
      params: query,
    })
  },
  //待结算明细列表 装船
  listDetail(id) {
    return request({
      url: '/api/external/storageSettleMix/listDetail?cargoInfoId=' + id,
      method: 'get',
    })
  },
  // 根据交接清单 查询合同
  listContract(id) {
    return request({
      url: '/api/external/storageSettleMix/listContract?cargoInfoId=' + id,
      method: 'get',
    })
  },
//待结算明细列表(已选合同) 卸船疏港
  listDetailWithContract(params) {
    return request({
      url: '/api/external/storageSettleMix/listDetailWithContract',
      method: 'get',
      params:params
    })
  },
  getReduceList(cargoInfoId){
    return request({
      url: '/api/v1/internal/stackFeeReduce/getList/'+cargoInfoId,
      method: 'get',
    })
  },

  // 结算
  statement(data) {
    return request({
      url: 'api/external/storageSettleMix/settle',
      method: 'post',
      data: data,
    })
  },

  // 撤销结算
  cancelSettle(id) {
    return request({
      url: '/api/external/storageSettleMix/cancelSettle?storageSettleId=' + id,
      method: 'delete',
    })
  },

  // 获取 结算单 详细信息
  listStorageSettle(id) {
    return request({
      url: '/api/external/storageSettleMix/listStorageSettle?cargoInfoId=' + id,
      method: 'get',
    })
  },
  // 审核
  review(id) {
    return request({
      url: '/api/external/storageSettleMix/review?storageSettleId=' + id,
      method: 'put',
    })
  },

  // 撤销审核
  cancelReview(id) {
    return request({
      url: '/api/external/storageSettleMix/cancelReview?storageSettleId=' + id,
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
  // 获取 结算单 详细信息（商务确认）
  listStorageSettleForConfirm(id) {
    return request({
      url: '/api/external/storageSettleMix/listStorageSettleForConfirm?handoverlistId=' + id,
      method: 'get',
    })
  },
  // 商务确认
  confirm(data) {
    return request({
      url: '/api/external/storageSettleMix/confirm',
      method: 'post',
      data: data
    })
  },
  // 取消商务确认
  cancelConfirm(data) {
    return request({
      url: '/api/external/storageSettleMix/cancelConfirm',
      method: 'post',
      data: data
    })
  },
  saveFile(data){
    return request({
      url: '/api/external/storageSettleMix/uploadConfirmFile',
      method: 'post',
      data: data
    })
  },
}
export default api
