import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList1(query) {
    return request({
      url: '/api/v1/internal/tFdBankAffiliated/getList',
      method: 'get',
      params: query
    })
  },

  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getList',
      method: 'get',
      params: query
    })
  },

  // 查询数据详细id
  getDetail(id) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getDetail/' + id,
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
  getTrustOrderList(companyId,customerId){
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getTrustOrderList?companyId='+companyId+'&customerId='+customerId,
      method: 'get'
    })
  },
  //获取预缴编号
  getPrepaymentCodeList(params){
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getPrepaymentCodeList',
      method: 'get',
      params: params,
    })
  },
  //获取预缴编号
  getAmountInfo(params){
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getAmountInfo',
      method: 'get',
      params: params,
    })
  },
  // 查询交易流水
  getTradeList(data) {
    return request({
      url: '/api/v1/internal/CmbController/getAccountTrade',
      method: 'post',
      data: data
    })
  },
}

export default api



