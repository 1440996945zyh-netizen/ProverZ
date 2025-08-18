import request from '@/utils/request'

const api = {
	// 获取列表
  getlistForInvoiceApply(query) {
		return request({
			url: '/api/external/miscbilling/getlistForInvoiceApply',
			method: 'get',
			params: query,
		})
	},
  getListForCargo(query) {
		return request({
			url: '/api/external/miscbilling/getListForCargo',
			method: 'get',
			params: query,
		})
	},
  // 获取费率列表信息
  getRateList(query) {
    return request({
      url: '/api/external/miscbilling/getratelist',
      method: 'get',
      params: query,
    })
  },
  getTaxInvoiceTypeList(){
    return request({
      url: 'api/internal/public/getLocalSelect?type=DICT&dictType=TAX_INVOICE',
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
  // 根据费率id获取作业过程
  getProcessByRateItemCode(query) {
    return request({
      url: '/api/external/miscbilling/getProcessByRateItemCode',
      method: 'get',
      params: query,
    })
  },
  // 获取费率列表信息
  addInvoiceApply(params) {
    return request({
      url: '/api/external/miscbilling/addInvoiceApply',
      method: 'post',
      data: params,
    })
  },
  //删除
  deleteMisc(id){
    return request({
      url: `/api/external/miscbilling/delete/${id}`,
      method: 'delete',
    })
  },
  //删除
  getMiscByid(id){
    return request({
      url: `/api/external/miscbilling/getmiscbyid`,
      method: 'get',
      params: id,
    })
  },
  //杂项计费
  charging(id){
    return request({
      url: `/api/external/miscbilling/charging/`+id,
      method: 'get'
    })
  },
  //撤销杂项计费
  cancleCharging(id){
    return request({
      url: `/api/external/miscbilling/cancleCharging/`+id,
      method: 'get'
    })
  },
  revokeMisc(id){
    return request({
      url: `/api/external/miscbilling/revokeMisc`,
      method: 'get',
      params: id,
    })
  },

  auditInvoiceApply(id){
    return request({
      url: `/api/external/miscbilling/auditInvoiceApply`,
      method: 'get',
      params: id,
    })
  },
  removeAuditInvoiceApply(id){
    return request({
      url: `/api/external/miscbilling/removeAuditInvoiceApply`,
      method: 'get',
      params: id,
    })
  },
  // 根据货主获取票货
  getCargoList(data) {
    return request({
      url: '/api/v1/internal/tBusCargoInfo/getCargoListByCustomerId',
      method: 'get',
      params: data,
    })
  },
}
export default api
