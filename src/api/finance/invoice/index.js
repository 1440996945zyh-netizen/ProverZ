import request from '@/utils/request'

const api = {
	//新增发票信息
	add(params) {
		return request({
			url: '/api/v1/internal/tFdInvoice/add',
			method: 'post',
			data: params,
		})
	},
  //输入框改变计算金额
  calculateAmount(params) {
		return request({
			url: '/api/v1/internal/tFdInvoiceDetail/calculateAmount',
			method: 'post',
			data: params,
		})
	},
	//获取数据列表
	getList(params) {
		return request({
			url: '/api/v1/internal/tFdInvoice/getList',
			method: 'get',
			params: params,
		})
	},
  invoiceDownload(params) {
		return request({
			url: '/api/v1/internal/tFdInvoice/invoiceDownload',
			method: 'get',
			params: params,
		})
	},
	//修改状态
  voidInvoice(params) {
		return request({
			url: `/api/v1/internal/tFdInvoice/voidInvoice/${params}`,
			method: 'get',
		})
	},
	//获取单条详情
	getDetail(params) {
		return request({
			url: `/api/v1/internal/tFdInvoice/getDetail?id=${params}`,
			method: 'get',
		})
	},
	//红冲申请
  redApply(params) {
		return request({
			url: `/api/v1/internal/tFdInvoice/redApply`,
			method: 'get',
      params:params
		})
	},
	// 查询结算单数据
  getStatementList(params) {
		return request({
			url: `/api/v1/internal/tFdInvoice/getStatementList`,
			method: 'get',
			params: params,
		})
	},
  //更新税务发票编号
  updateInvoiceCode(params) {
		return request({
			url: `/api/v1/internal/tFdInvoice/updateInvoiceCode`,
			method: 'get',
			params: params,
		})
	},
  //获取发票抬头
  getInvoice(customerId) {
    return request({
      url: `/api/v1/internal/tFdInvoice/getInvoice?id=${customerId}`,
      method: 'get',
    })
  },
  //获取发票抬头
  getCountAmount(params) {
    return request({
      url: '/api/v1/internal/tFdInvoice/getCountAmount',
      method: 'get',
      params: params,
    })
  },

}
export default api
