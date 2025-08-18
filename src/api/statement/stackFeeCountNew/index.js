import request from '@/utils/request'

const api = {
  // 获取 交接清单 列表
  listCargoInfo(query) {
    return request({
      url: '/api/external/storageFee/listCargoInfo',
      method: 'get',
      params: query,
    })
  },
  pageExport(query) {
    return request({
      url: '/api/external/storageFee/pageExport',
      method: 'get',
      params: query,
      responseType: 'blob',
    })
  },
  getMixRecordList(cargoInfoId) {
    return request({
      url: '/api/external/storageFee/getMixRecordList/'+cargoInfoId,
      method: 'get',
    })
  },
  //待结算明细列表
  listDetail(params) {
    return request({
      url: '/api/external/storageFee/listDetail',
      method: 'get',
      params: params,
    })
  },
  listContractForCost(params) {
    return request({
      url: '/api/external/storageFee/listDetail' ,
      method: 'get',
      params:params,
    })
  },
  // 查询合同
  listContract(params) {
    return request({
      url: '/api/external/storageFee/listContract',
      method: 'get',
      params: params
    })
  },
  // 获取交接清单量
  getHandoverlistTon(params) {
    return request({
      url: '/api/external/storageFee/getHandoverlistTon',
      method: 'get',
      params: params
    })
  },
//待结算明细列表(已选合同) 卸船疏港
  listDetailWithContract(params) {
    return request({
      url: '/api/external/storageFee/listDetailWithContract',
      method: 'get',
      params:params
    })
  },
//待结算明细列表(已选合同) 卸船疏港
  costEvent(data) {
    return request({
      url: '/api/external/storageFee/settle',
      method: 'post',
      data:data
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
      url: '/api/external/storageFee/cancelSettle?storageSettleId=' + id,
      method: 'delete',
    })
  },

  // 获取 结算单 详细信息
  listStorageSettle(query) {
    return request({
      url: '/api/external/storageFee/listStorageSettle',
      method: 'get',
      params:query
    })
  },
  //回执确认 获取开票类型
  getTaxInvoiceCode(id){
    return request({
      url: '/api/external/storageFee/getTaxInvoiceCode?id='+id,
      method: 'get',
    })
  },
  // 审核
  review(id) {
    return request({
      url: '/api/external/storageFee/review?storageSettleId=' + id,
      method: 'put',
    })
  },

  // 撤销审核
  cancelReview(id) {
    return request({
      url: '/api/external/storageFee/cancelReview?storageSettleId=' + id,
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
  storageCostDetailExport(data){
    return request({
      url: '/api/external/storageFee/storageCostDetailExport',
      method: 'post',
      data:data,
      responseType: 'blob',

    })
  },
  getTaxInvoiceTypeList(){
    return request({
      url: 'api/internal/public/getLocalSelect?type=DICT&dictType=TAX_INVOICE',
      method: 'get',
    })
  },
  printFeeList(data){
    return request({
      url: '/api/external/storageFee/printFeeList',
      method: 'POST',
      data: data,
      responseType: 'blob',
    })
  },
/*  // 获取 结算单 详细信息（商务确认）
  listStorageSettleForConfirm(id) {
    return request({
      url: '/api/external/storageCalculate/listStorageSettleForConfirm?handoverlistId=' + id,
      method: 'get',
    })
  },*/
  // 商务确认
  confirm(data) {
    return request({
      url: '/api/external/storageFee/confirm',
      method: 'post',
      data: data
    })
  },
  // 取消商务确认
  cancelConfirm(data) {
    return request({
      url: '/api/external/storageFee/cancelConfirm',
      method: 'post',
      data: data
    })
  },
  saveFile(data){
    return request({
      url: '/api/external/storageFee/uploadConfirmFile',
      method: 'post',
      data: data
    })
  },


  addReduceInfo(data){
    return request({
      url: '/api/v1/internal/stackFeeReduce/add',
      method: 'post',
      data: data
    })
  },
  getCargoInfoSettleList(data){
    return request({
      url: '/api/v1/internal/stackFeeReduce/getCargoInfoSettleList',
      method: 'post',
      data: data
    })
  },
  getReduceList(cargoInfoId){
    return request({
      url: '/api/v1/internal/stackFeeReduce/getList/'+cargoInfoId,
      method: 'get',
    })
  },
  //堆存费账单列表查询
  listStatementStackFeeForSHSWQR(query) {
    return request({
      url: '/api/external/storageFee/ListStatementStackFee',
      method: 'get',
      params: query,
    })
  },
  // 获取 结算单 详细信息
  listStorageSettleById(query) {
    return request({
      url: '/api/external/storageFee/listStorageSettleById',
      method: 'get',
      params:query
    })
  },


}
export default api
