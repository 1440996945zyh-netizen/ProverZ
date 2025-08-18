import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/tFdBankAffiliated/getList',
      method: 'get',
      params: query
    })
  },
  // 银行下拉框
  getBankSelectList() {
    return request({
      url: '/api/v1/internal/tFdBankPay/getSelectList',
      method: 'get'
    })
  },
  // 通过
  getBankById(id) {
    return request({
      url: '/api/v1/internal/tFdBankPay/getDetail/'+id,
      method: 'get'
    })
  },
  // 删除数据
  deleteById(id) {
    return request({
      url: '/api/v1/internal/tFdBankAffiliated/delete/' + id,
      method: 'delete'
    })
  },

  // 新增数据
  addBankAffiliate(data) {
    return request({
      url: '/api/v1/internal/tFdBankAffiliated/add',
      method: 'post',
      data: data
    })
  },

  // 修改数据
  updatePort(data) {
    return request({
      url: '/api/v1/internal/tStdProcessStandardSystem/update',
      method: 'put',
      data: data
    })
  },
}

export default api



