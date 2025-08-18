import request from '@/utils/request'

const api = {

  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getBalanceList',
      method: 'get',
      params: query
    })
  },
  // 查询数据列表
  getdDetailList(query) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getBalanceDetailList',
      method: 'get',
      params: query
    })
  },
  exportExcel(query) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/exportBalanceDetail',
      method: 'get',
      responseType: 'blob',
      params: query,
    })
  },
}

export default api



