import request from '@/utils/request'

const api = {
	//新增付款收据
	add(params) {
		return request({
			url: '/api/v1/internal/tFdDebtorpayment/add',
			method: 'post',
			data: params,
		})
	},
  //输入框改变计算金额
  calculateAmount(params) {
		return request({
			url: '/api/v1/internal/tFdDebtorpayment/calculateAmount',
			method: 'post',
			data: params,
		})
	},
	//获取数据列表
	getList(params) {
		return request({
			url: '/api/v1/internal/tFdDebtorpayment/getList',
			method: 'get',
			params: params,
		})
	},
	//修改状态
  voidDebtorpay(params) {
		return request({
			url: `/api/v1/internal/tFdDebtorpayment/voidDebtorpay/${params}`,
			method: 'get',
		})
	},
	//获取单条详情
	getDetail(params) {
		return request({
			url: `/api/v1/internal/tFdDebtorpayment/getDetail?id=${params}`,
			method: 'get',
		})
	},
	// 查询结算单数据
  getStatementList(params) {
		return request({
			url: `/api/v1/internal/tFdDebtorpayment/getStatementList`,
			method: 'get',
			params: params,
		})
	},
  // 查询未付款的交易
  queryList(params) {
		return request({
			url: `/api/v1/internal/tFdDebtorpayment/searchList`,
			method: 'get',
			params: params,
		})
	},
//获取付款银行信息
  getBankList(query) {
    return request({
      url: '/api/v1/internal/tFdBankAffiliated/getList',
      method: 'get',
      params: query
    })
  },
}
export default api
