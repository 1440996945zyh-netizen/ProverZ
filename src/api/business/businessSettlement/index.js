import request from '@/utils/request'

const api = {
	// 获取 结算单 列表
	listCostStatement(query) {
		return request({
			url: '/api/external/bizCostStatement/listCostStatement',
			method: 'get',
			params: query,
		})
	},
  pageExport(query) {
		return request({
			url: '/api/external/bizCostStatement/pageExport',
			method: 'get',
			params: query,
      responseType: 'blob',
    })
	},
	// 根据结算单 查询合同
	listContract(id) {
		return request({
			url: '/api/external/bizCostStatement/listContract?statementId=' + id,
			method: 'get',
		})
	},
  //根据交接清单获取集疏港量
  getJSGWeight(id) {
    return request({
      url: '/api/external/costStatement/getJSGWeight?id='+id,
      method: 'get',
    })
  },
// 获取 根据交接清单id 获取过磅量
  getWeighCapacity(id) {
    return request({
      url: '/api/external/costStatement/getWeighCapacity?handoverlistId=' + id,
      method: 'get',
    })
  },
	// 获取 结算单 详细信息
	getDetail(id) {
		return request({
			url: '/api/external/bizCostStatement/listCostStatementDetail?statementId=' + id,
			method: 'get',
		})
	},

	// 结算
	statement(data) {
		return request({
			url: '/api/external/bizCostStatement/statement',
			method: 'put',
			data: data,
		})
	},

	// 撤销结算
	cancelStatement(id) {
		return request({
			url: '/api/external/bizCostStatement/cancelStatement?statementId=' + id,
			method: 'put',
		})
	},

	// 审核
	review(id) {
		return request({
			url: '/api/external/bizCostStatement/review?statementId=' + id,
			method: 'put',
		})
	},

	// 撤销审核
	cancelReview(id) {
		return request({
			url: '/api/external/bizCostStatement/cancelReview?statementId=' + id,
			method: 'put',
		})
	},
	// 商务确认
	confirm(data) {
		return request({
			url: '/api/external/bizCostStatement/confirm',
			method: 'post',
      data: data
		})
	},
  // 驳回
  reject(data) {
    return request({
      url: '/api/external/bizCostStatement/reject',
      method: 'post',
      data: data
    })
  },
	// 取消商务确认
	cancelConfirm(data) {
		return request({
			url: '/api/external/bizCostStatement/cancelConfirm',
			method: 'post',
      data: data
		})
	},
  //账单打印单条
  printCostBill(data){
    return request({
      url: '/api/external/bizCostStatement/printCostBill',
      method: 'post',
      data: data,
      responseType: 'blob',

    })
  },
  //账单打印批量
  printCostBillBatch(data){
    return request({
      url: '/api/external/bizCostStatement/printSettlement',
      method: 'post',
      data: data,
      responseType: 'blob',

    })
  },
  getContractFlag(data){
    return request({
      url: '/api/external/bizCostStatement/contractFlag',
      method: 'post',
      data: data,
    })
  },
  //初始化合同
  getContractList(statementId, date){
    return request({
      url: '/api/external/bizCostStatement/listContractDefault?statementId=' + statementId + '&date=' + date,
      method: 'get',
    })
  },
  getContractListLULS(statementId, date){
    return request({
      url: '/api/external/bizCostStatement/listContractForLULS?statementId=' + statementId + '&date=' + date,
      method: 'get',
    })
  },
  saveFile(data){
    return request({
      url: '/api/external/bizCostStatement/saveFile',
      method: 'post',
      data: data
    })
  },
  getTaxInvoiceTypeList(){
    return request({
      url: 'api/internal/public/getLocalSelect?type=DICT&dictType=TAX_INVOICE',
      method: 'get',
    })
  },
  getPreNumberCount(statementId){
    return request({
      url: '/api/external/bizCostStatement/getPreNumberCount?statementId=' + statementId,
      method: 'get',
    })
  },
  getOtherFee(statementId){
    return request({
      url: '/api/external/bizCostStatement/getMiscFee?statementId=' + statementId,
      method: 'get',
    })
  },

}
export default api
