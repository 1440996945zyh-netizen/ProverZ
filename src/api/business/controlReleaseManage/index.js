import request from '@/utils/request'

const api = {
  // 查询数据列表
  getList(query) {
    return request({
      url: '/api/v1/internal/controlReleaseManage/getList',
      method: 'get',
      params: query,
    })
  },

  // 查询数据详细id
  getReleaseById(id) {
    return request({
      url: '/api/v1/internal/controlReleaseManage/getDetail?id=' + id,
      method: 'get'
    })
  },
  revokeRelease(id){
    return request({
      url: `/api/v1/internal/controlReleaseManage/revokeRelease/${id}`,
      method: 'get',
    })
  },
  release(data){
    return request({
      url: '/api/v1/internal/controlReleaseManage/release',
      method: 'post',
      data: data
    })
  },

  insertPrePayment(data) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/add',
      method: 'post',
      data: data
    })
  },
  // 查询数据详细id
  getPrePaymentDetail(id) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getDetail/' + id,
      method: 'get'
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
  // 查询数据详细id
  getDetail(id) {
    return request({
      url: '/api/v1/internal/tFdBankCustomerPrepayment/getDetail/' + id,
      method: 'get'
    })
  },


}

export default api



