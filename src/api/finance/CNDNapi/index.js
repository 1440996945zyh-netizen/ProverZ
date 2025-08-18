import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList1(query) {
    return request({
      url: '/api/v1/internal/tFdCreditDebitBill/getList',
      method: 'get',
      params: query
    })
  },

  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tFdCreditDebitBill/getList',
      method: 'get',
      params: query
    })
  },

  // 查询数据详细id
	getDetail(id) {
    return request({
      url: `/api/v1/internal/tFdCreditDebitBill/getDetail?id=${id}`,
      method: 'get'
    })
  },


  // 新增数据
  insert(data) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/add',
      method: 'post',
      data: data
    })
  },

  // 修改数据
  update(data) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/update',
      method: 'put',
      data: data
    })
  },
  // 修改数据
  updateStatus(data) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/voidHandle',
      method: 'put',
      data: data
    })
  },

  // 删除数据
  deleteById(id) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/' + id,
      method: 'delete'
    })
  },

	queryList(params) {
		return request({
			url: `/api/v1/internal/tFdCreditDebitBill/getInvoiceList`,
			method: 'get',
			params: params,
		})
	},
  CNadd(params) {
    return request({
      url: `/api/v1/internal/tFdCreditDebitBill/add`,
      method: 'post',
      data: params,
    })
  },
  //修改状态
  voidNote(params) {
    return request({
      url: '/api/v1/internal/tFdCreditDebitBill/doVoid',
      method: 'get',
      params: params,
    })
  },
  // 获取费率列表信息
  getRateList(query) {
    return request({
      url: '/api/v1/internal/tFdCreditDebitBill/getRateList',
      method: 'get',
      params: query,
    })
  },
  calculate(params) {
    return request({
      url: '/api/v1/internal/tFdCreditDebitBill/calculate',
      method: 'post',
      data: params,
    })
  },

}

export default api



